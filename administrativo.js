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

const opcaoPresencaAdmin =
  document.getElementById(
    "opcaoPresencaAdmin"
  );

const opcaoConsultarPresenca =
  document.getElementById(
    "opcaoConsultarPresenca"
  );

const opcaoRelatorioPresenca =
  document.getElementById(
    "opcaoRelatorioPresenca"
  );

const opcaoRelatorioAtividadePresenca =
  document.getElementById(
    "opcaoRelatorioAtividadePresenca"
  );

const opcaoConfigurarResponsaveis =
  document.getElementById(
    "opcaoConfigurarResponsaveis"
  );

const opcaoPreencherPresenca =
  document.getElementById(
    "opcaoPreencherPresenca"
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


    const usuarioId =
      resultadoUsuario.data.id;


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
          usuarioId
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
       TESOURARIA
    ====================================== */

    const ehTesoureiro =
      nomesFuncoes.includes(
        "Tesoureiro"
      );


    /* ======================================
       PERMISSÕES
       SOMENTE TESOURARIA
    ====================================== */

    if (opcaoPermissoes) {

      opcaoPermissoes.hidden =
        !ehTesoureiro;

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

    if (opcaoImportarExcel) {

      opcaoImportarExcel.hidden =
        !ehTesoureiro;

    }


    if (opcaoExportarExcel) {

      opcaoExportarExcel.hidden =
        !ehTesoureiro;

    }


    /* ======================================
       PRESENÇA
    ====================================== */

    let ehResponsavelPresenca =
      false;


    const resultadoResponsavel =
      await window.supabaseClient
        .from(
          "responsaveis_lista_presenca"
        )
        .select("id")
        .eq(
          "usuario_id",
          usuarioId
        )
        .limit(1);


    if (
      resultadoResponsavel.error
    ) {

      throw resultadoResponsavel.error;

    }


    ehResponsavelPresenca =
      (
        resultadoResponsavel.data ||
        []
      ).length > 0;


    /* ======================================
       CONSULTAR LISTAS
       TODA DIRETORIA
    ====================================== */

    if (
      opcaoConsultarPresenca
    ) {

      opcaoConsultarPresenca.hidden =
        !pertenceDiretoria;

    }


    /* ======================================
       RELATÓRIO GERAL
       TODA DIRETORIA
    ====================================== */

    if (
      opcaoRelatorioPresenca
    ) {

      opcaoRelatorioPresenca.hidden =
        !pertenceDiretoria;

    }


    /* ======================================
       RELATÓRIO POR ATIVIDADE
       TODA DIRETORIA
    ====================================== */

    if (
      opcaoRelatorioAtividadePresenca
    ) {

      opcaoRelatorioAtividadePresenca.hidden =
        !pertenceDiretoria;

    }


    /* ======================================
       CONFIGURAR RESPONSÁVEIS
       SOMENTE TESOURARIA
    ====================================== */

    if (
      opcaoConfigurarResponsaveis
    ) {

      opcaoConfigurarResponsaveis.hidden =
        !ehTesoureiro;

    }


    /* ======================================
       PREENCHER PRESENÇA
       RESPONSÁVEIS
    ====================================== */

    if (
      opcaoPreencherPresenca
    ) {

      opcaoPreencherPresenca.hidden =
        !ehResponsavelPresenca;

    }


    /* ======================================
       BLOCO PRESENÇA
    ====================================== */

    const podeVerPresenca =
      pertenceDiretoria ||
      ehTesoureiro ||
      ehResponsavelPresenca;


    if (
      opcaoPresencaAdmin
    ) {

      opcaoPresencaAdmin.hidden =
        !podeVerPresenca;

    }


    /* ======================================
       SEM OPÇÕES
    ====================================== */

    const possuiAlgumaOpcao =
      ehTesoureiro ||
      pertenceDiretoria ||
      ehResponsavelPresenca;


    if (
      semOpcoesAdministrativas
    ) {

      semOpcoesAdministrativas.hidden =
        possuiAlgumaOpcao;

    }


  } catch (erro) {

    console.error(
      "Erro ao carregar opções administrativas:",
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

carregarOpcoesAdministrativas();
