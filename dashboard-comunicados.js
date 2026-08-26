"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const areaComunicadosDashboard =
  document.getElementById(
    "areaComunicadosDashboard"
  );

const listaComunicadosDashboard =
  document.getElementById(
    "listaComunicadosDashboard"
  );

const popupComunicadoDashboard =
  document.getElementById(
    "popupComunicadoDashboard"
  );

const tipoPopupComunicadoDashboard =
  document.getElementById(
    "tipoPopupComunicadoDashboard"
  );

const tituloPopupComunicadoDashboard =
  document.getElementById(
    "tituloPopupComunicadoDashboard"
  );

const mensagemPopupComunicadoDashboard =
  document.getElementById(
    "mensagemPopupComunicadoDashboard"
  );

const areaEnquetePopupDashboard =
  document.getElementById(
    "areaEnquetePopupDashboard"
  );

const botaoFecharPopupComunicadoDashboard =
  document.getElementById(
    "botaoFecharPopupComunicadoDashboard"
  );

const botaoFecharPopupComunicadoDashboardInferior =
  document.getElementById(
    "botaoFecharPopupComunicadoDashboardInferior"
  );


/* ==========================================
   DADOS
========================================== */

let usuarioAtualId =
  null;

let funcoesUsuarioAtual =
  [];

let comunicadosAtivos =
  [];

let comunicadosPendentesPopup =
  [];

let comunicadoPopupAtual =
  null;


/* ==========================================
   FORMATAR DATA
========================================== */

function formatarDataHoraComunicado(
  dataIso
) {

  if (
    !dataIso
  ) {

    return "";

  }


  const data =
    new Date(
      dataIso
    );


  return data.toLocaleString(
    "pt-BR",
    {
      dateStyle:
        "short",

      timeStyle:
        "short"
    }
  );

}


/* ==========================================
   FORMATAR TIPO
========================================== */

function formatarTipoComunicado(
  tipo
) {

  return tipo === "enquete"
    ? "Enquete"
    : "Recado";

}


/* ==========================================
   OBTER USUÁRIO ATUAL
========================================== */

async function obterUsuarioAtualComunicados() {

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

    return null;

  }


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


  return resultadoUsuario.data
    ? resultadoUsuario.data.id
    : null;

}


/* ==========================================
   FUNÇÕES DO USUÁRIO
========================================== */

async function carregarFuncoesUsuario() {

  if (
    !usuarioAtualId
  ) {

    funcoesUsuarioAtual =
      [];

    return;

  }


  const resultado =
    await window.supabaseClient
      .from(
        "usuario_funcoes"
      )
      .select(`
        funcao_id,
        funcoes (
          id,
          nome
        )
      `)
      .eq(
        "usuario_id",
        usuarioAtualId
      );


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  funcoesUsuarioAtual =
    (
      resultado.data ||
      []
    )
      .map(
        (item) => ({
          id:
            item.funcao_id,

          nome:
            item.funcoes?.nome ||
            ""
        })
      );

}


/* ==========================================
   VERIFICAR PÚBLICO
========================================== */

function usuarioPodeVisualizar(
  comunicado
) {

  if (
    comunicado.publico_tipo === "todos"
  ) {

    return true;

  }


  if (
    comunicado.publico_tipo !== "funcoes"
  ) {

    return false;

  }


  const filtros =
    comunicado.publico_filtros;


  if (
    !filtros ||
    !Array.isArray(
      filtros.funcoes
    )
  ) {

    return false;

  }


  const idsFuncoesPermitidas =
    filtros.funcoes
      .map(
        (funcao) =>
          funcao.id
      )
      .filter(
        Boolean
      );


  return funcoesUsuarioAtual.some(
    (funcaoUsuario) =>
      idsFuncoesPermitidas.includes(
        funcaoUsuario.id
      )
  );

}


/* ==========================================
   CRIAR CARD
========================================== */

function criarCardComunicado(
  comunicado
) {

  const item =
    document.createElement(
      "article"
    );


  item.className =
    "item-comunicado-dashboard";


  const tipo =
    document.createElement(
      "span"
    );


  tipo.className =
    "tipo-comunicado-dashboard";


  tipo.textContent =
    formatarTipoComunicado(
      comunicado.tipo
    );


  const titulo =
    document.createElement(
      "h3"
    );


  titulo.className =
    "titulo-comunicado-dashboard";


  titulo.textContent =
    comunicado.titulo ||
    "Comunicado";


  const mensagem =
    document.createElement(
      "p"
    );


  mensagem.className =
    "mensagem-comunicado-dashboard";


  mensagem.textContent =
    comunicado.mensagem ||
    "";


  const periodo =
    document.createElement(
      "span"
    );


  periodo.className =
    "periodo-comunicado-dashboard";


  periodo.textContent =
    `Disponível até ${formatarDataHoraComunicado(
      comunicado.data_fim
    )}`;


  item.appendChild(
    tipo
  );


  item.appendChild(
    titulo
  );


  item.appendChild(
    mensagem
  );


  item.appendChild(
    periodo
  );


  return item;

}


/* ==========================================
   RENDERIZAR CARDS
========================================== */

function renderizarComunicadosDashboard() {

  listaComunicadosDashboard.innerHTML =
    "";


  if (
    comunicadosAtivos.length === 0
  ) {

    areaComunicadosDashboard.hidden =
      true;

    return;

  }


  comunicadosAtivos.forEach(
    (comunicado) => {

      listaComunicadosDashboard.appendChild(
        criarCardComunicado(
          comunicado
        )
      );

    }
  );


  areaComunicadosDashboard.hidden =
    false;

}


/* ==========================================
   CARREGAR VISUALIZAÇÕES
========================================== */

async function carregarVisualizacoes() {

  if (
    !usuarioAtualId ||
    comunicadosAtivos.length === 0
  ) {

    comunicadosPendentesPopup =
      [];

    return;

  }


  const idsComunicados =
    comunicadosAtivos.map(
      (comunicado) =>
        comunicado.id
    );


  const resultado =
    await window.supabaseClient
      .from(
        "comunicado_visualizacoes"
      )
      .select(
        "comunicado_id"
      )
      .eq(
        "usuario_id",
        usuarioAtualId
      )
      .in(
        "comunicado_id",
        idsComunicados
      );


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  const idsJaFechados =
    (
      resultado.data ||
      []
    )
      .map(
        (item) =>
          item.comunicado_id
      );


  comunicadosPendentesPopup =
    comunicadosAtivos.filter(
      (comunicado) =>
        !idsJaFechados.includes(
          comunicado.id
        )
    );

}


/* ==========================================
   ABRIR PRÓXIMO POP-UP
========================================== */

function abrirProximoPopup() {

  if (
    comunicadosPendentesPopup.length === 0
  ) {

    comunicadoPopupAtual =
      null;

    popupComunicadoDashboard.hidden =
      true;

    return;

  }


  comunicadoPopupAtual =
    comunicadosPendentesPopup[0];


  tipoPopupComunicadoDashboard.textContent =
    formatarTipoComunicado(
      comunicadoPopupAtual.tipo
    );


  tituloPopupComunicadoDashboard.textContent =
    comunicadoPopupAtual.titulo ||
    "Comunicado";


  mensagemPopupComunicadoDashboard.textContent =
    comunicadoPopupAtual.mensagem ||
    "";


  areaEnquetePopupDashboard.innerHTML =
    "";


  areaEnquetePopupDashboard.hidden =
    true;


  popupComunicadoDashboard.hidden =
    false;

}


/* ==========================================
   REGISTRAR FECHAMENTO
========================================== */

async function registrarFechamentoPopup() {

  if (
    !comunicadoPopupAtual ||
    !usuarioAtualId
  ) {

    return;

  }


  const resultado =
    await window.supabaseClient
      .from(
        "comunicado_visualizacoes"
      )
      .insert({
        comunicado_id:
          comunicadoPopupAtual.id,

        usuario_id:
          usuarioAtualId
      });


  if (
    resultado.error &&
    resultado.error.code !== "23505"
  ) {

    throw resultado.error;

  }

}


/* ==========================================
   FECHAR POP-UP
========================================== */

async function fecharPopupComunicado() {

  if (
    !comunicadoPopupAtual
  ) {

    popupComunicadoDashboard.hidden =
      true;

    return;

  }


  try {

    await registrarFechamentoPopup();


  } catch (erro) {

    console.error(
      "Erro ao registrar fechamento do comunicado:",
      erro
    );

  }


  comunicadosPendentesPopup.shift();


  abrirProximoPopup();

}


/* ==========================================
   CARREGAR COMUNICADOS
========================================== */

async function carregarComunicadosDashboard() {

  if (
    !window.supabaseClient
  ) {

    return;

  }


  try {

    usuarioAtualId =
      await obterUsuarioAtualComunicados();


    if (
      !usuarioAtualId
    ) {

      return;

    }


    await carregarFuncoesUsuario();


    const agoraIso =
      new Date().toISOString();


    const resultado =
      await window.supabaseClient
        .from(
          "comunicados"
        )
        .select(`
          id,
          tipo,
          titulo,
          mensagem,
          data_inicio,
          data_fim,
          status,
          publico_tipo,
          publico_filtros,
          criado_em
        `)
        .eq(
          "status",
          "ativo"
        )
        .lte(
          "data_inicio",
          agoraIso
        )
        .gt(
          "data_fim",
          agoraIso
        )
        .order(
          "criado_em",
          {
            ascending:
              false
          }
        );


    if (
      resultado.error
    ) {

      throw resultado.error;

    }


    comunicadosAtivos =
      (
        resultado.data ||
        []
      )
        .filter(
          usuarioPodeVisualizar
        );


    renderizarComunicadosDashboard();


    await carregarVisualizacoes();


    abrirProximoPopup();


  } catch (erro) {

    console.error(
      "Erro ao carregar comunicados do dashboard:",
      erro
    );


    areaComunicadosDashboard.hidden =
      true;


    popupComunicadoDashboard.hidden =
      true;

  }

}


/* ==========================================
   EVENTOS
========================================== */

botaoFecharPopupComunicadoDashboard
  .addEventListener(
    "click",
    fecharPopupComunicado
  );


botaoFecharPopupComunicadoDashboardInferior
  .addEventListener(
    "click",
    fecharPopupComunicado
  );


/* ==========================================
   INICIAR
========================================== */

carregarComunicadosDashboard();
