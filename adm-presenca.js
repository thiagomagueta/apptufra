"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const opcaoPreencherPresencaAdm =
  document.getElementById(
    "opcaoPreencherPresencaAdm"
  );

const opcaoConsultarPresencaAdm =
  document.getElementById(
    "opcaoConsultarPresencaAdm"
  );

const semOpcoesPresencaAdm =
  document.getElementById(
    "semOpcoesPresencaAdm"
  );


/* ==========================================
   DIRETORIA
========================================== */

const funcoesDiretoriaPresenca = [
  "Sacerdote",
  "Pai/Mãe Pequeno (a)",
  "Tesoureiro",
  "Secretária",
  "Presidente"
];


/* ==========================================
   CARREGAR ACESSOS
========================================== */

async function carregarAcessosPresenca() {

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
       DIRETORIA
    ====================================== */

    const pertenceDiretoria =
      nomesFuncoes.some(
        (funcao) =>
          funcoesDiretoriaPresenca.includes(
            funcao
          )
      );


    /* ======================================
       RESPONSÁVEL POR LISTA
    ====================================== */

    const resultadoResponsavel =
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
      resultadoResponsavel.error
    ) {

      throw resultadoResponsavel.error;

    }


    const ehResponsavelPresenca =
      (
        resultadoResponsavel.data ||
        []
      ).length > 0;


    /* ======================================
       PREENCHER LISTA
       SOMENTE RESPONSÁVEL
    ====================================== */

    if (
      opcaoPreencherPresencaAdm
    ) {

      opcaoPreencherPresencaAdm.hidden =
        !ehResponsavelPresenca;

    }


    /* ======================================
       CONSULTAR LISTAS
       DIRETORIA
    ====================================== */

    if (
      opcaoConsultarPresencaAdm
    ) {

      opcaoConsultarPresencaAdm.hidden =
        !pertenceDiretoria;

    }


    /* ======================================
       SEM OPÇÕES
    ====================================== */

    const possuiOpcao =
      ehResponsavelPresenca ||
      pertenceDiretoria;


    if (
      semOpcoesPresencaAdm
    ) {

      semOpcoesPresencaAdm.hidden =
        possuiOpcao;

    }


    /*
      Se alguém tentar abrir esta página
      sem possuir nenhum acesso de presença,
      retornamos para a central ADM.
    */

    if (
      !possuiOpcao
    ) {

      window.location.href =
        "administrativo.html";

    }


  } catch (erro) {

    console.error(
      "Erro ao carregar acessos de presença:",
      erro
    );


    window.location.href =
      "administrativo.html";

  }

}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

carregarAcessosPresenca();
