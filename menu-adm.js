"use strict";


/* ==========================================
   MENU ADM GLOBAL
========================================== */

async function configurarMenuAdm() {

  const itemMenuAdm =
    document.getElementById(
      "itemMenuAdm"
    );


  /*
    Se a página não tiver botão ADM,
    não fazemos nada.
  */

  if (
    !itemMenuAdm ||
    !window.supabaseClient
  ) {

    return;

  }


  /*
    O ADM começa SEMPRE escondido.
    Só será exibido depois da confirmação
    real de alguma permissão administrativa.
  */

  itemMenuAdm.hidden =
    true;


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
       DIRETORIA
    ====================================== */

    const funcoesDiretoria = [
      "Presidente",
      "Secretária",
      "Tesoureiro",
      "Pai/Mãe Pequeno (a)",
      "Sacerdote"
    ];


    const pertenceDiretoria =
      nomesFuncoes.some(
        (funcao) =>
          funcoesDiretoria.includes(
            funcao
          )
      );


    /* ======================================
       RESPONSÁVEL POR PRESENÇA
    ====================================== */

    let ehResponsavelPresenca =
      false;


    const resultadoResponsavelPresenca =
      await window.supabaseClient
        .from(
          "responsaveis_lista_presenca"
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
      resultadoResponsavelPresenca.error
    ) {

      throw resultadoResponsavelPresenca.error;

    }


    ehResponsavelPresenca =
      (
        resultadoResponsavelPresenca.data ||
        []
      ).length > 0;


    /* ======================================
       EXIBIR ADM
    ====================================== */

    const possuiAcessoAdm =
      pertenceDiretoria ||
      ehResponsavelPresenca;


    itemMenuAdm.hidden =
      !possuiAcessoAdm;


  } catch (erro) {

    console.error(
      "Erro ao configurar botão ADM:",
      erro
    );


    /*
      Em qualquer erro, por segurança,
      o ADM permanece escondido.
    */

    itemMenuAdm.hidden =
      true;

  }

}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

configurarMenuAdm();
