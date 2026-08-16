"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const opcaoImportarExcelCalendario =
  document.getElementById(
    "opcaoImportarExcelCalendario"
  );

const opcaoExportarExcelCalendario =
  document.getElementById(
    "opcaoExportarExcelCalendario"
  );


/* ==========================================
   FUNÇÕES DA DIRETORIA
========================================== */

const funcoesDiretoriaCalendario = [
  "Sacerdote",
  "Pai/Mãe Pequeno (a)",
  "Tesoureiro",
  "Secretária",
  "Presidente"
];


/* ==========================================
   CARREGAR ACESSO
========================================== */

async function carregarAcessoCalendario() {

  if (
    !window.supabaseClient
  ) {

    return;

  }


  try {

    /* --------------------------------------
       SESSÃO
    -------------------------------------- */

    const resultadoSessao =
      await window.supabaseClient.auth
        .getSession();


    if (
      resultadoSessao.error
    ) {

      throw resultadoSessao.error;

    }


    const sessao =
      resultadoSessao.data.session;


    if (
      !sessao
    ) {

      window.location.href =
        "index.html";

      return;

    }


    /* --------------------------------------
       USUÁRIO
    -------------------------------------- */

    const resultadoUsuario =
      await window.supabaseClient
        .from(
          "usuarios"
        )
        .select(
          "id"
        )
        .eq(
          "auth_id",
          sessao.user.id
        )
        .maybeSingle();


    if (
      resultadoUsuario.error
    ) {

      throw resultadoUsuario.error;

    }


    if (
      !resultadoUsuario.data
    ) {

      window.location.href =
        "administrativo.html";

      return;

    }


    const usuarioId =
      resultadoUsuario.data.id;


    /* --------------------------------------
       FUNÇÕES
    -------------------------------------- */

    const resultadoFuncoes =
      await window.supabaseClient
        .from(
          "usuario_funcoes"
        )
        .select(`
          funcoes (
            nome
          )
        `)
        .eq(
          "usuario_id",
          usuarioId
        );


    if (
      resultadoFuncoes.error
    ) {

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
        .filter(
          Boolean
        );


    /* ======================================
       VALIDAR DIRETORIA
    ====================================== */

    const pertenceDiretoria =
      nomesFuncoes.some(
        (funcao) =>
          funcoesDiretoriaCalendario.includes(
            funcao
          )
      );


    if (
      !pertenceDiretoria
    ) {

      window.location.href =
        "administrativo.html";

      return;

    }


    /* ======================================
       TESOURARIA
    ====================================== */

    const ehTesoureiro =
      nomesFuncoes.includes(
        "Tesoureiro"
      );


    if (
      opcaoImportarExcelCalendario
    ) {

      opcaoImportarExcelCalendario.hidden =
        !ehTesoureiro;

    }


    if (
      opcaoExportarExcelCalendario
    ) {

      opcaoExportarExcelCalendario.hidden =
        !ehTesoureiro;

    }


  } catch (erro) {

    console.error(
      "Erro ao carregar acesso ao calendário administrativo:",
      erro
    );


    window.location.href =
      "administrativo.html";

  }

}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

carregarAcessoCalendario();
