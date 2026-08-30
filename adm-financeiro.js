"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const conteudoFinanceiro =
  document.getElementById(
    "conteudoFinanceiro"
  );


/* ==========================================
   CARREGAR ACESSO AO FINANCEIRO
========================================== */

async function carregarAcessoFinanceiro() {

  if (
    !window.supabaseClient
  ) {

    window.location.href =
      "administrativo.html";

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
       RESPONSÁVEL PELO FINANCEIRO
    -------------------------------------- */

    const resultadoResponsavelFinanceiro =
      await window.supabaseClient
        .from(
          "responsaveis_financeiro"
        )
        .select(
          "id"
        )
        .eq(
          "usuario_id",
          usuarioId
        )
        .limit(
          1
        );


    if (
      resultadoResponsavelFinanceiro.error
    ) {

      throw resultadoResponsavelFinanceiro.error;

    }


    const ehResponsavelFinanceiro =
      (
        resultadoResponsavelFinanceiro.data ||
        []
      ).length > 0;


    /* --------------------------------------
       SEM ACESSO
    -------------------------------------- */

    if (
      !ehResponsavelFinanceiro
    ) {

      window.location.href =
        "administrativo.html";

      return;

    }


    /* --------------------------------------
       ACESSO LIBERADO
    -------------------------------------- */

    if (
      conteudoFinanceiro
    ) {

      conteudoFinanceiro.hidden =
        false;

    }


  } catch (erro) {

    console.error(
      "Erro ao verificar acesso ao Financeiro:",
      erro
    );


    window.location.href =
      "administrativo.html";

  }

}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

carregarAcessoFinanceiro();
