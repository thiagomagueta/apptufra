"use strict";


/* ==========================================
   FUNÇÕES DA DIRETORIA
========================================== */

const funcoesDiretoriaAssociados = [
  "Sacerdote",
  "Pai/Mãe Pequeno (a)",
  "Tesoureiro",
  "Secretária",
  "Presidente"
];


/* ==========================================
   VALIDAR ACESSO
========================================== */

async function validarAcessoAssociados() {

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
          funcoesDiretoriaAssociados.includes(
            funcao
          )
      );


    if (
      !pertenceDiretoria
    ) {

      window.location.href =
        "administrativo.html";

    }


  } catch (erro) {

    console.error(
      "Erro ao validar acesso aos associados:",
      erro
    );


    window.location.href =
      "administrativo.html";

  }

}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

validarAcessoAssociados();
