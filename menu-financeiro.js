"use strict";


/* ==========================================
   MENU FINANCEIRO GLOBAL

   DURANTE O DESENVOLVIMENTO:
   O botão Financeiro aparece somente para
   usuários cadastrados em
   responsaveis_financeiro.

   Quando o módulo estiver pronto para ser
   liberado aos associados, esta regra será
   alterada.
========================================== */

async function configurarMenuFinanceiro() {

  const itemMenuFinanceiro =
    document.getElementById(
      "itemMenuFinanceiro"
    );


  /*
    Se a página não possuir o botão
    Financeiro, não fazemos nada.
  */

  if (
    !itemMenuFinanceiro
  ) {

    return;

  }


  /*
    O Financeiro começa SEMPRE escondido.

    Assim evitamos que o botão apareça
    rapidamente antes da validação.
  */

  itemMenuFinanceiro.hidden =
    true;


  /*
    Sem Supabase disponível, permanece
    escondido.
  */

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

      return;

    }


    /* --------------------------------------
       USUÁRIO DO APP
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

      return;

    }


    const usuarioId =
      resultadoUsuario.data.id;


    /* --------------------------------------
       AUTORIZAÇÃO FINANCEIRA
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


    const possuiAcessoFinanceiro =
      (
        resultadoResponsavelFinanceiro.data ||
        []
      ).length > 0;


    /* --------------------------------------
       EXIBIR FINANCEIRO
    -------------------------------------- */

    itemMenuFinanceiro.hidden =
      !possuiAcessoFinanceiro;


  } catch (erro) {

    console.error(
      "Erro ao configurar botão Financeiro:",
      erro
    );


    /*
      Em qualquer erro, por segurança,
      o Financeiro permanece escondido.
    */

    itemMenuFinanceiro.hidden =
      true;

  }

}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

configurarMenuFinanceiro();
