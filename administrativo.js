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

const moduloAtendimentos =
  document.getElementById(
    "moduloAtendimentos"
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

    window.location.href =
      "dashboard.html";

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
        "dashboard.html";

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
       RESPONSÁVEL POR RECADOS / ENQUETES
    ====================================== */

    let ehResponsavelComunicados =
      false;


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

      console.error(
        "Erro ao verificar responsável por comunicados:",
        resultadoResponsavelComunicados.error
      );

    } else {

      ehResponsavelComunicados =
        (
          resultadoResponsavelComunicados.data ||
          []
        ).length > 0;

    }


    /* ======================================
       RESPONSÁVEL POR ATENDIMENTOS
    ====================================== */

    let ehResponsavelAtendimentos =
      false;


    const resultadoResponsavelAtendimentos =
      await window.supabaseClient
        .from(
          "responsaveis_atendimentos"
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
      resultadoResponsavelAtendimentos.error
    ) {

      console.error(
        "Erro ao verificar responsável por atendimentos:",
        resultadoResponsavelAtendimentos.error
      );

    } else {

      ehResponsavelAtendimentos =
        (
          resultadoResponsavelAtendimentos.data ||
          []
        ).length > 0;

    }


    /* ======================================
       EXISTE ALGUM ACESSO ADMINISTRATIVO?
    ====================================== */

    const possuiAlgumModulo =
      pertenceDiretoria ||
      ehTesoureiro ||
      ehResponsavelPresenca ||
      ehResponsavelComunicados ||
      ehResponsavelAtendimentos;


    /*
      Se não possui absolutamente nenhuma
      permissão administrativa, não deve
      permanecer nesta tela.
    */

    if (
      !possuiAlgumModulo
    ) {

      window.location.href =
        "dashboard.html";

      return;

    }


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
       ATENDIMENTOS
       RESPONSÁVEL AUTORIZADO
    ====================================== */

    if (
      moduloAtendimentos
    ) {

      moduloAtendimentos.hidden =
        !ehResponsavelAtendimentos;

    }


    /* ======================================
       RECADOS E ENQUETES
       RESPONSÁVEIS AUTORIZADOS
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

       Não deve aparecer para usuário comum,
       pois o usuário comum já foi retirado
       desta página acima.
    ====================================== */

    if (
      semOpcoesAdministrativas
    ) {

      semOpcoesAdministrativas.hidden =
        true;

    }


  } catch (erro) {

    console.error(
      "Erro ao carregar módulos administrativos:",
      erro
    );


    /*
      Em caso de erro na validação,
      não deixamos a pessoa dentro do ADM.
    */

    window.location.href =
      "dashboard.html";

  }

}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

carregarModulosAdministrativos();
