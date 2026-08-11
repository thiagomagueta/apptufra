"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const opcaoPermissoes =
  document.getElementById(
    "opcaoPermissoes"
  );

const opcaoCalendarioAdmin =
  document.getElementById(
    "opcaoCalendarioAdmin"
  );

const opcaoAssociadosAdmin =
  document.getElementById(
    "opcaoAssociadosAdmin"
  );

const opcaoImportarExcel =
  document.getElementById(
    "opcaoImportarExcel"
  );

const opcaoExportarExcel =
  document.getElementById(
    "opcaoExportarExcel"
  );

const semOpcoesAdministrativas =
  document.getElementById(
    "semOpcoesAdministrativas"
  );


/* ==========================================
   DIRETORIA
========================================== */

const funcoesDiretoria = [
  "Sacerdote",
  "Pai/Mãe Pequeno (a)",
  "Tesoureiro",
  "Secretária",
  "Presidente"
];


/* ==========================================
   CARREGAR OPÇÕES ADMINISTRATIVAS
========================================== */

async function carregarOpcoesAdministrativas() {

  if (!window.supabaseClient) {
    return;
  }

  try {

    /* --------------------------------------
       SESSÃO
    -------------------------------------- */

    const resultadoSessao =
      await window.supabaseClient.auth
        .getSession();

    if (resultadoSessao.error) {
      throw resultadoSessao.error;
    }


    const sessao =
      resultadoSessao.data.session;


    if (!sessao) {

      window.location.href =
        "index.html";

      return;
    }


    /* --------------------------------------
       USUÁRIO
    -------------------------------------- */

    const resultadoUsuario =
      await window.supabaseClient
        .from("usuarios")
        .select("id")
        .eq(
          "auth_id",
          sessao.user.id
        )
        .maybeSingle();


    if (resultadoUsuario.error) {
      throw resultadoUsuario.error;
    }


    if (!resultadoUsuario.data) {

      semOpcoesAdministrativas.hidden =
        false;

      return;
    }


    /* --------------------------------------
       FUNÇÕES DO USUÁRIO
    -------------------------------------- */

    const resultadoFuncoes =
      await window.supabaseClient
        .from("usuario_funcoes")
        .select(`
          funcoes (
            nome
          )
        `)
        .eq(
          "usuario_id",
          resultadoUsuario.data.id
        );


    if (resultadoFuncoes.error) {
      throw resultadoFuncoes.error;
    }


    const nomesFuncoes =
      (
        resultadoFuncoes.data ||
        []
      )
        .map(
          (item) =>
            item.funcoes?.nome
        )
        .filter(Boolean);


    /* ======================================
       DIRETORIA
    ====================================== */

    const pertenceDiretoria =
      nomesFuncoes.some(
        (funcao) =>
          funcoesDiretoria.includes(
            funcao
          )
      );


    /* ======================================
       PERMISSÕES
       SOMENTE TESOURARIA
    ====================================== */

    const podeGerenciarPermissoes =
      nomesFuncoes.includes(
        "Tesoureiro"
      );


    if (opcaoPermissoes) {

      opcaoPermissoes.hidden =
        !podeGerenciarPermissoes;

    }


    /* ======================================
       CALENDÁRIO
       TODA DIRETORIA
    ====================================== */

    if (opcaoCalendarioAdmin) {

      opcaoCalendarioAdmin.hidden =
        !pertenceDiretoria;

    }


    /* ======================================
       ASSOCIADOS
       TODA DIRETORIA
    ====================================== */

    if (opcaoAssociadosAdmin) {

      opcaoAssociadosAdmin.hidden =
        !pertenceDiretoria;

    }


    /* ======================================
       EXCEL
       SOMENTE TESOURARIA
    ====================================== */

    const podeGerenciarExcel =
      nomesFuncoes.includes(
        "Tesoureiro"
      );


    if (opcaoImportarExcel) {

      opcaoImportarExcel.hidden =
        !podeGerenciarExcel;

    }


    if (opcaoExportarExcel) {

      opcaoExportarExcel.hidden =
        !podeGerenciarExcel;

    }


    /* ======================================
       SEM OPÇÕES
    ====================================== */

    const possuiAlgumaOpcao =
      podeGerenciarPermissoes ||
      pertenceDiretoria;


    if (semOpcoesAdministrativas) {

      semOpcoesAdministrativas.hidden =
        possuiAlgumaOpcao;

    }


  } catch (erro) {

    console.error(
      "Erro ao carregar opções administrativas:",
      erro
    );


    if (semOpcoesAdministrativas) {

      semOpcoesAdministrativas.hidden =
        false;

    }

  }

}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

carregarOpcoesAdministrativas();
