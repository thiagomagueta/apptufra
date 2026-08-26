"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const moduloPermissoes =
  document.getElementById(
    "moduloPermissoes"
  );

const moduloCalendario =
  document.getElementById(
    "moduloCalendario"
  );

const moduloAssociados =
  document.getElementById(
    "moduloAssociados"
  );

const moduloPresenca =
  document.getElementById(
    "moduloPresenca"
  );

const moduloComunicados =
  document.getElementById(
    "moduloComunicados"
  );

const moduloRelatorios =
  document.getElementById(
    "moduloRelatorios"
  );

const semOpcoesAdministrativas =
  document.getElementById(
    "semOpcoesAdministrativas"
  );


/* ==========================================
   FUNÇÕES DA DIRETORIA
========================================== */

const funcoesDiretoria = [
  "Sacerdote",
  "Pai/Mãe Pequeno (a)",
  "Tesoureiro",
  "Secretária",
  "Presidente"
];


/* ==========================================
   CARREGAR MÓDULOS
========================================== */

async function carregarModulosAdministrativos() {

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

      semOpcoesAdministrativas.hidden =
        false;

      return;

    }


    const usuarioId =
      resultadoUsuario.data.id;


    /* --------------------------------------
       FUNÇÕES DO USUÁRIO
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
          funcoesDiretoria.includes(
            funcao
          )
      );


    /* ======================================
       TESOURARIA
    ====================================== */

    const ehTesoureiro =
      nomesFuncoes.includes(
        "Tesoureiro"
      );


    /* ======================================
       RESPONSÁVEL POR PRESENÇA
    ====================================== */

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


    const ehResponsavelPresenca =
      (
        resultadoResponsavelPresenca.data ||
        []
      ).length > 0;


    /* ======================================
       RESPONSÁVEL POR RECADOS E ENQUETES
    ====================================== */

    const resultadoResponsavelComunicados =
      await window.supabaseClient
        .from(
          "responsaveis_comunicados"
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
      resultadoResponsavelComunicados.error
    ) {

      throw resultadoResponsavelComunicados.error;

    }


    const ehResponsavelComunicados =
      (
        resultadoResponsavelComunicados.data ||
        []
      ).length > 0;


    /* ======================================
       PERMISSÕES
       SOMENTE TESOURARIA
    ====================================== */

    if (
      moduloPermissoes
    ) {

      moduloPermissoes.hidden =
        !ehTesoureiro;

    }


    /* ======================================
       CALENDÁRIO
       DIRETORIA
    ====================================== */

    if (
      moduloCalendario
    ) {

      moduloCalendario.hidden =
        !pertenceDiretoria;

    }


    /* ======================================
       ASSOCIADOS
       DIRETORIA
    ====================================== */

    if (
      moduloAssociados
    ) {

      moduloAssociados.hidden =
        !pertenceDiretoria;

    }


    /* ======================================
       PRESENÇA
       DIRETORIA OU RESPONSÁVEL
    ====================================== */

    const podeVerPresenca =
      pertenceDiretoria ||
      ehResponsavelPresenca;


    if (
      moduloPresenca
    ) {

      moduloPresenca.hidden =
        !podeVerPresenca;

    }


    /* ======================================
       RECADOS E ENQUETES
       SOMENTE RESPONSÁVEIS AUTORIZADOS
    ====================================== */

    if (
      moduloComunicados
    ) {

      moduloComunicados.hidden =
        !ehResponsavelComunicados;

    }


    /* ======================================
       RELATÓRIOS
       DIRETORIA
    ====================================== */

    if (
      moduloRelatorios
    ) {

      moduloRelatorios.hidden =
        !pertenceDiretoria;

    }


    /* ======================================
       SEM OPÇÕES
    ====================================== */

    const possuiAlgumModulo =
      ehTesoureiro ||
      pertenceDiretoria ||
      ehResponsavelPresenca ||
      ehResponsavelComunicados;


    if (
      semOpcoesAdministrativas
    ) {

      semOpcoesAdministrativas.hidden =
        possuiAlgumModulo;

    }


  } catch (erro) {

    console.error(
      "Erro ao carregar módulos administrativos:",
      erro
    );


    if (
      semOpcoesAdministrativas
    ) {

      semOpcoesAdministrativas.hidden =
        false;

    }

  }

}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

carregarModulosAdministrativos();
