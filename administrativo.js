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
   FUNÇÕES COM ACESSO AO CALENDÁRIO
========================================== */

const funcoesCalendario = [
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
       PERMISSÕES
    ====================================== */

    const podeGerenciarPermissoes =
      nomesFuncoes.includes(
        "Tesoureiro"
      );

    opcaoPermissoes.hidden =
      !podeGerenciarPermissoes;


    /* ======================================
       CALENDÁRIO
    ====================================== */

    const podeGerenciarCalendario =
      nomesFuncoes.some(
        (funcao) =>
          funcoesCalendario.includes(
            funcao
          )
      );

    opcaoCalendarioAdmin.hidden =
      !podeGerenciarCalendario;


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
      podeGerenciarCalendario;

    semOpcoesAdministrativas.hidden =
      possuiAlgumaOpcao;

  } catch (erro) {

    console.error(
      "Erro ao carregar opções administrativas:",
      erro
    );

    semOpcoesAdministrativas.hidden =
      false;
  }
}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

carregarOpcoesAdministrativas();
