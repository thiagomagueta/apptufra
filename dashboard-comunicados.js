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

let opcoesEnquetes =
  {};

let respostasUsuario =
  {};

let resultadosEnquetes =
  {};


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
   FORMATAR NOME
========================================== */

function formatarNomePublicadoPor(
  nomeCompleto
) {

  const nome =
    String(
      nomeCompleto || ""
    ).trim();


  if (
    !nome
  ) {

    return "TUFRA";

  }


  return nome;

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
   CARREGAR OPÇÕES DAS ENQUETES
========================================== */

async function carregarOpcoesEnquetes() {

  opcoesEnquetes =
    {};


  const idsEnquetes =
    comunicadosAtivos
      .filter(
        (comunicado) =>
          comunicado.tipo ===
          "enquete"
      )
      .map(
        (comunicado) =>
          comunicado.id
      );


  if (
    idsEnquetes.length === 0
  ) {

    return;

  }


  const resultado =
    await window.supabaseClient
      .from(
        "enquete_opcoes"
      )
      .select(`
        id,
        comunicado_id,
        texto,
        ordem
      `)
      .in(
        "comunicado_id",
        idsEnquetes
      )
      .order(
        "ordem",
        {
          ascending:
            true
        }
      );


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  (
    resultado.data ||
    []
  )
    .forEach(
      (opcao) => {

        if (
          !opcoesEnquetes[
            opcao.comunicado_id
          ]
        ) {

          opcoesEnquetes[
            opcao.comunicado_id
          ] =
            [];

        }


        opcoesEnquetes[
          opcao.comunicado_id
        ].push(
          opcao
        );

      }
    );

}


/* ==========================================
   CARREGAR RESULTADOS PÚBLICOS
========================================== */

async function carregarResultadosEnquetes() {

  resultadosEnquetes =
    {};


  const enquetes =
    comunicadosAtivos.filter(
      (comunicado) =>
        comunicado.tipo ===
        "enquete"
    );


  if (
    enquetes.length === 0
  ) {

    return;

  }


  for (
    const enquete of enquetes
  ) {

    const resultado =
      await window.supabaseClient
        .rpc(
          "obter_resultado_publico_enquete",
          {
            p_comunicado_id:
              enquete.id
          }
        );


    if (
      resultado.error
    ) {

      console.error(
        "Erro ao carregar resultado público da enquete:",
        resultado.error
      );


      resultadosEnquetes[
        enquete.id
      ] =
        [];


      continue;

    }


    resultadosEnquetes[
      enquete.id
    ] =
      resultado.data ||
      [];

  }

}


/* ==========================================
   ATUALIZAR RESULTADO DE UMA ENQUETE
========================================== */

async function atualizarResultadoEnquete(
  comunicadoId
) {

  if (
    !comunicadoId
  ) {

    return;

  }


  const resultado =
    await window.supabaseClient
      .rpc(
        "obter_resultado_publico_enquete",
        {
          p_comunicado_id:
            comunicadoId
        }
      );


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  resultadosEnquetes[
    comunicadoId
  ] =
    resultado.data ||
    [];

}


/* ==========================================
   OBTER TOTAL DE VOTOS DE UMA OPÇÃO
========================================== */

function obterTotalVotosOpcao(
  comunicadoId,
  opcaoId
) {

  const resultados =
    resultadosEnquetes[
      comunicadoId
    ] ||
    [];


  const resultadoOpcao =
    resultados.find(
      (item) =>
        item.opcao_id ===
        opcaoId
    );


  return Number(
    resultadoOpcao?.total_votos ||
    0
  );

}


/* ==========================================
   CRIAR RESUMO DA ENQUETE
========================================== */

function criarResumoEnquete(
  comunicadoId
) {

  const resultados =
    resultadosEnquetes[
      comunicadoId
    ] ||
    [];


  if (
    resultados.length === 0
  ) {

    return null;

  }


  const primeiroResultado =
    resultados[0];


  const totalAptos =
    Number(
      primeiroResultado.total_aptos ||
      0
    );


  const totalResponderam =
    Number(
      primeiroResultado.total_responderam ||
      0
    );


  const faltamVotar =
    Number(
      primeiroResultado.faltam_votar ||
      0
    );


  const resumo =
    document.createElement(
      "p"
    );


  resumo.style.margin =
    "8px 0 6px";


  resumo.style.fontSize =
    "13px";


  resumo.style.fontWeight =
    "600";


  resumo.textContent =
    `${totalResponderam} de ${totalAptos} ` +
    `${totalAptos === 1 ? "pessoa respondeu" : "pessoas responderam"} • ` +
    `${faltamVotar} ${faltamVotar === 1 ? "ainda não votou" : "ainda não votaram"}`;


  return resumo;

}


/* ==========================================
   CARREGAR RESPOSTAS DO USUÁRIO
========================================== */

async function carregarRespostasUsuario() {

  respostasUsuario =
    {};


  if (
    !usuarioAtualId
  ) {

    return;

  }


  const idsEnquetes =
    comunicadosAtivos
      .filter(
        (comunicado) =>
          comunicado.tipo ===
          "enquete"
      )
      .map(
        (comunicado) =>
          comunicado.id
      );


  if (
    idsEnquetes.length === 0
  ) {

    return;

  }


  const resultado =
    await window.supabaseClient
      .from(
        "enquete_respostas"
      )
      .select(`
        id,
        comunicado_id,
        opcao_id,
        usuario_id
      `)
      .eq(
        "usuario_id",
        usuarioAtualId
      )
      .in(
        "comunicado_id",
        idsEnquetes
      );


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  (
    resultado.data ||
    []
  )
    .forEach(
      (resposta) => {

        respostasUsuario[
          resposta.comunicado_id
        ] =
          resposta;

      }
    );

}


/* ==========================================
   OBTER TEXTO DA RESPOSTA
========================================== */

function obterTextoRespostaUsuario(
  comunicadoId
) {

  const resposta =
    respostasUsuario[
      comunicadoId
    ];


  if (
    !resposta
  ) {

    return "";

  }


  const opcoes =
    opcoesEnquetes[
      comunicadoId
    ] ||
    [];


  const opcao =
    opcoes.find(
      (item) =>
        item.id ===
        resposta.opcao_id
    );


  return opcao
    ? opcao.texto
    : "";

}


/* ==========================================
   SALVAR VOTO
========================================== */

async function salvarVotoEnquete(
  comunicadoId,
  opcaoId
) {

  if (
    !usuarioAtualId ||
    !comunicadoId ||
    !opcaoId
  ) {

    return false;

  }


  const respostaExistente =
    respostasUsuario[
      comunicadoId
    ];


  if (
    respostaExistente
  ) {

    const resultado =
      await window.supabaseClient
        .from(
          "enquete_respostas"
        )
        .update({
          opcao_id:
            opcaoId
        })
        .eq(
          "id",
          respostaExistente.id
        )
        .eq(
          "usuario_id",
          usuarioAtualId
        );


    if (
      resultado.error
    ) {

      throw resultado.error;

    }


    respostaExistente.opcao_id =
      opcaoId;


    return true;

  }


  const resultado =
    await window.supabaseClient
      .from(
        "enquete_respostas"
      )
      .insert({
        comunicado_id:
          comunicadoId,

        opcao_id:
          opcaoId,

        usuario_id:
          usuarioAtualId
      })
      .select(`
        id,
        comunicado_id,
        opcao_id,
        usuario_id
      `)
      .single();


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  respostasUsuario[
    comunicadoId
  ] =
    resultado.data;


  return true;

}


/* ==========================================
   CRIAR ÁREA DE VOTAÇÃO
========================================== */

function criarAreaVotacao(
  comunicado,
  modoPopup = false
) {

  const area =
    document.createElement(
      "div"
    );


  area.style.marginTop =
    "10px";


  const resumoEnquete =
    criarResumoEnquete(
      comunicado.id
    );


  if (
    resumoEnquete
  ) {

    area.appendChild(
      resumoEnquete
    );

  }


  const opcoes =
    opcoesEnquetes[
      comunicado.id
    ] ||
    [];


  if (
    opcoes.length === 0
  ) {

    const mensagem =
      document.createElement(
        "p"
      );


    mensagem.textContent =
      "Nenhuma opção disponível para esta enquete.";


    area.appendChild(
      mensagem
    );


    return area;

  }


  const nomeRadio =
    modoPopup
      ? `enquete-popup-${comunicado.id}`
      : `enquete-card-${comunicado.id}`;


  const respostaAtual =
    respostasUsuario[
      comunicado.id
    ];


  opcoes.forEach(
    (opcao) => {

      const label =
        document.createElement(
          "label"
        );


      label.style.display =
        "flex";


      label.style.alignItems =
        "center";


      label.style.gap =
        "10px";


      label.style.padding =
        "9px 0";


      label.style.cursor =
        "pointer";


      const radio =
        document.createElement(
          "input"
        );


      radio.type =
        "radio";


      radio.name =
        nomeRadio;


      radio.value =
        opcao.id;


      radio.checked =
        respostaAtual?.opcao_id ===
        opcao.id;


      const texto =
        document.createElement(
          "span"
        );


      const totalVotos =
        obterTotalVotosOpcao(
          comunicado.id,
          opcao.id
        );


      texto.textContent =
        `${opcao.texto} — ${totalVotos} ${totalVotos === 1 ? "voto" : "votos"}`;


      label.appendChild(
        radio
      );


      label.appendChild(
        texto
      );


      area.appendChild(
        label
      );

    }
  );


  const mensagemResposta =
    document.createElement(
      "p"
    );


  mensagemResposta.style.fontSize =
    "13px";


  mensagemResposta.style.margin =
    "8px 0";


  mensagemResposta.style.fontWeight =
    "600";


  const textoResposta =
    obterTextoRespostaUsuario(
      comunicado.id
    );


  if (
    textoResposta
  ) {

    mensagemResposta.textContent =
      `Sua resposta: ${textoResposta}`;

  }


  area.appendChild(
    mensagemResposta
  );


  const botao =
    document.createElement(
      "button"
    );


  botao.type =
    "button";


  botao.className =
    "botao-principal-app";


  botao.textContent =
    respostaAtual
      ? "Alterar resposta"
      : "Confirmar resposta";


  botao.addEventListener(
    "click",
    async () => {

      const selecionado =
        area.querySelector(
          `input[name="${nomeRadio}"]:checked`
        );


      if (
        !selecionado
      ) {

        mensagemResposta.textContent =
          "Selecione uma opção antes de confirmar.";

        return;

      }


      botao.disabled =
        true;


      botao.textContent =
        "SALVANDO...";


      try {

        await salvarVotoEnquete(
          comunicado.id,
          selecionado.value
        );


        await atualizarResultadoEnquete(
          comunicado.id
        );


        renderizarComunicadosDashboard();


        if (
          modoPopup &&
          comunicadoPopupAtual?.id ===
          comunicado.id
        ) {

          renderizarEnquetePopup(
            comunicado
          );

        }


      } catch (erro) {

        console.error(
          "Erro ao salvar resposta da enquete:",
          erro
        );


        mensagemResposta.textContent =
          "Não foi possível salvar sua resposta.";


        botao.disabled =
          false;


        botao.textContent =
          respostasUsuario[
            comunicado.id
          ]
            ? "Alterar resposta"
            : "Confirmar resposta";

      }

    }
  );


  area.appendChild(
    botao
  );


  return area;

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


  const publicadoPor =
    document.createElement(
      "span"
    );


  publicadoPor.className =
    "publicado-por-comunicado-dashboard";


  publicadoPor.textContent =
    `Publicado por ${formatarNomePublicadoPor(
      comunicado.criador?.nome_completo
    )}`;


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


  if (
    comunicado.tipo ===
    "enquete"
  ) {

    item.appendChild(
      criarAreaVotacao(
        comunicado,
        false
      )
    );

  }


  item.appendChild(
    publicadoPor
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
   PUBLICADO POR NO POP-UP
========================================== */

function criarPublicadoPorPopup(
  comunicado
) {

  const anterior =
    document.getElementById(
      "publicadoPorPopupComunicadoDashboard"
    );


  if (
    anterior
  ) {

    anterior.remove();

  }


  const publicadoPor =
    document.createElement(
      "p"
    );


  publicadoPor.id =
    "publicadoPorPopupComunicadoDashboard";


  publicadoPor.className =
    "publicado-por-popup-comunicado-dashboard";


  publicadoPor.textContent =
    `Publicado por ${formatarNomePublicadoPor(
      comunicado.criador?.nome_completo
    )}`;


  mensagemPopupComunicadoDashboard
    .insertAdjacentElement(
      "afterend",
      publicadoPor
    );

}


/* ==========================================
   RENDERIZAR ENQUETE NO POP-UP
========================================== */

function renderizarEnquetePopup(
  comunicado
) {

  areaEnquetePopupDashboard.innerHTML =
    "";


  if (
    comunicado.tipo !==
    "enquete"
  ) {

    areaEnquetePopupDashboard.hidden =
      true;

    return;

  }


  areaEnquetePopupDashboard.hidden =
    false;


  areaEnquetePopupDashboard.appendChild(
    criarAreaVotacao(
      comunicado,
      true
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


  criarPublicadoPorPopup(
    comunicadoPopupAtual
  );


  renderizarEnquetePopup(
    comunicadoPopupAtual
  );


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
          criado_em,
          criado_por,
          criador:usuarios!comunicados_criado_por_fkey (
            nome_completo
          )
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


    /*
      Carrega as opções, o voto atual
      do usuário e os resultados públicos.
    */

    await carregarOpcoesEnquetes();


    await carregarRespostasUsuario();


    await carregarResultadosEnquetes();


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
