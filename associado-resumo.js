"use strict";

/* ==========================================
   ELEMENTOS
========================================== */

const tituloAssociadoResumo =
  document.getElementById(
    "tituloAssociadoResumo"
  );

const dadosAssociadoResumo =
  document.getElementById(
    "dadosAssociadoResumo"
  );

const fotoAssociadoResumo =
  document.getElementById(
    "fotoAssociadoResumo"
  );

const fotoAssociadoResumoPadrao =
  document.getElementById(
    "fotoAssociadoResumoPadrao"
  );

const botaoCadastroCompleto =
  document.getElementById(
    "botaoCadastroCompleto"
  );

const botaoVerJustificativasAssociado =
  document.getElementById(
    "botaoVerJustificativasAssociado"
  );

const botaoHistoricoAtendimentosAssociado =
  document.getElementById(
    "botaoHistoricoAtendimentosAssociado"
  );

const mensagemAssociadoResumo =
  document.getElementById(
    "mensagemAssociadoResumo"
  );

const voltarAssociados =
  document.getElementById(
    "voltarAssociados"
  );


/* ==========================================
   EDIÇÃO DOS DADOS PRINCIPAIS
========================================== */

const botaoEditarDadosAssociado =
  document.getElementById(
    "botaoEditarDadosAssociado"
  );

const edicaoDadosAssociado =
  document.getElementById(
    "edicaoDadosAssociado"
  );

const nomeCompletoEdicaoAssociado =
  document.getElementById(
    "nomeCompletoEdicaoAssociado"
  );

const orixaFrenteEdicaoAssociado =
  document.getElementById(
    "orixaFrenteEdicaoAssociado"
  );

const orixaAdjuntoEdicaoAssociado =
  document.getElementById(
    "orixaAdjuntoEdicaoAssociado"
  );

const mensagemEdicaoDadosAssociado =
  document.getElementById(
    "mensagemEdicaoDadosAssociado"
  );

const botaoCancelarEdicaoDadosAssociado =
  document.getElementById(
    "botaoCancelarEdicaoDadosAssociado"
  );

const botaoSalvarEdicaoDadosAssociado =
  document.getElementById(
    "botaoSalvarEdicaoDadosAssociado"
  );


/* ==========================================
   ADMINISTRATIVO
========================================== */

const botaoEditarDatasAdministrativas =
  document.getElementById(
    "botaoEditarDatasAdministrativas"
  );

const visualizacaoDatasAdministrativas =
  document.getElementById(
    "visualizacaoDatasAdministrativas"
  );

const edicaoDatasAdministrativas =
  document.getElementById(
    "edicaoDatasAdministrativas"
  );

const avisoAssociadoAssistencia =
  document.getElementById(
    "avisoAssociadoAssistencia"
  );


/* ==========================================
   CAMPOS ADMINISTRATIVOS
========================================== */

const itemDataCorrenteDesenvolvimento =
  document.getElementById(
    "itemDataCorrenteDesenvolvimento"
  );

const itemDataCorrentePrincipal =
  document.getElementById(
    "itemDataCorrentePrincipal"
  );

const textoDataEntradaTufra =
  document.getElementById(
    "textoDataEntradaTufra"
  );

const textoDataCorrenteDesenvolvimento =
  document.getElementById(
    "textoDataCorrenteDesenvolvimento"
  );

const textoDataCorrentePrincipal =
  document.getElementById(
    "textoDataCorrentePrincipal"
  );

const campoEdicaoCorrenteDesenvolvimento =
  document.getElementById(
    "campoEdicaoCorrenteDesenvolvimento"
  );

const campoEdicaoCorrentePrincipal =
  document.getElementById(
    "campoEdicaoCorrentePrincipal"
  );

const dataEntradaTufra =
  document.getElementById(
    "dataEntradaTufra"
  );

const dataCorrenteDesenvolvimento =
  document.getElementById(
    "dataCorrenteDesenvolvimento"
  );

const dataCorrentePrincipal =
  document.getElementById(
    "dataCorrentePrincipal"
  );

const botaoSalvarDatasAdministrativas =
  document.getElementById(
    "botaoSalvarDatasAdministrativas"
  );

const botaoCancelarDatasAdministrativas =
  document.getElementById(
    "botaoCancelarDatasAdministrativas"
  );

const mensagemDatasAdministrativas =
  document.getElementById(
    "mensagemDatasAdministrativas"
  );


/* ==========================================
   HISTÓRICO DE FUNÇÕES
========================================== */

const areaHistoricoFuncoes =
  document.getElementById(
    "areaHistoricoFuncoes"
  );

const listaHistoricoFuncoes =
  document.getElementById(
    "listaHistoricoFuncoes"
  );

const areaEdicaoHistoricoFuncoes =
  document.getElementById(
    "areaEdicaoHistoricoFuncoes"
  );

const listaEdicaoHistoricoFuncoes =
  document.getElementById(
    "listaEdicaoHistoricoFuncoes"
  );


/* ==========================================
   BAIXA
========================================== */

const areaBaixaAssociado =
  document.getElementById(
    "areaBaixaAssociado"
  );

const areaAssociadoAtivo =
  document.getElementById(
    "areaAssociadoAtivo"
  );

const areaAssociadoInativo =
  document.getElementById(
    "areaAssociadoInativo"
  );

const botaoAbrirBaixaAssociado =
  document.getElementById(
    "botaoAbrirBaixaAssociado"
  );

const formularioBaixaAssociado =
  document.getElementById(
    "formularioBaixaAssociado"
  );

const dataSaidaAssociado =
  document.getElementById(
    "dataSaidaAssociado"
  );

const motivoSaidaAssociado =
  document.getElementById(
    "motivoSaidaAssociado"
  );

const botaoCancelarBaixaAssociado =
  document.getElementById(
    "botaoCancelarBaixaAssociado"
  );

const botaoConfirmarBaixaAssociado =
  document.getElementById(
    "botaoConfirmarBaixaAssociado"
  );

const mensagemBaixaAssociado =
  document.getElementById(
    "mensagemBaixaAssociado"
  );

const textoDataSaidaAssociado =
  document.getElementById(
    "textoDataSaidaAssociado"
  );

const textoMotivoSaidaAssociado =
  document.getElementById(
    "textoMotivoSaidaAssociado"
  );


/* ==========================================
   REATIVAÇÃO
========================================== */

const botaoAbrirReativacaoAssociado =
  document.getElementById(
    "botaoAbrirReativacaoAssociado"
  );

const formularioReativacaoAssociado =
  document.getElementById(
    "formularioReativacaoAssociado"
  );

const dataRetornoAssociado =
  document.getElementById(
    "dataRetornoAssociado"
  );

const observacaoRetornoAssociado =
  document.getElementById(
    "observacaoRetornoAssociado"
  );

const mensagemReativacaoAssociado =
  document.getElementById(
    "mensagemReativacaoAssociado"
  );

const botaoCancelarReativacaoAssociado =
  document.getElementById(
    "botaoCancelarReativacaoAssociado"
  );

const botaoConfirmarReativacaoAssociado =
  document.getElementById(
    "botaoConfirmarReativacaoAssociado"
  );


/* ==========================================
   FOTO
========================================== */

const modalFotoAssociado =
  document.getElementById(
    "modalFotoAssociado"
  );

const fecharModalFotoAssociado =
  document.getElementById(
    "fecharModalFotoAssociado"
  );

const fotoAssociadoAmpliada =
  document.getElementById(
    "fotoAssociadoAmpliada"
  );

const areaZoomFotoAssociado =
  document.getElementById(
    "areaZoomFotoAssociado"
  );

const aumentarZoomFotoAssociado =
  document.getElementById(
    "aumentarZoomFotoAssociado"
  );

const diminuirZoomFotoAssociado =
  document.getElementById(
    "diminuirZoomFotoAssociado"
  );

const resetarZoomFotoAssociado =
  document.getElementById(
    "resetarZoomFotoAssociado"
  );


/* ==========================================
   PRESENÇA
========================================== */

const areaResumoPresencaAssociado =
  document.getElementById(
    "areaResumoPresencaAssociado"
  );

const listasResumoPresencaAssociado =
  document.getElementById(
    "listasResumoPresencaAssociado"
  );

const mensagemSemPresencaAssociado =
  document.getElementById(
    "mensagemSemPresencaAssociado"
  );


/* ==========================================
   ESTADO
========================================== */

let associadoAtual = null;

let funcoesAtuais = [];

let historicoFuncoes = [];

let dadosPessoaisAtual = {};

let historicoUmbandaAtual = {};

let podeEditarAssociado = false;

let podeDarBaixaAssociado = false;

let zoomFoto = 1;

let distanciaToqueInicial = null;


/* ==========================================
   PARÂMETROS
========================================== */

function obterParametros() {

  const parametros =
    new URLSearchParams(
      window.location.search
    );

  return {

    associadoId:
      parametros.get(
        "id"
      ),

    origem:
      parametros.get(
        "origem"
      ) || "lista"

  };

}


/* ==========================================
   VOLTAR
========================================== */

function configurarVoltar() {

  const {
    origem
  } =
    obterParametros();

  if (
    origem === "carometro"
  ) {

    voltarAssociados.href =
      "carometro.html";

    voltarAssociados.textContent =
      "Voltar para o Carômetro";

    return;

  }

  voltarAssociados.href =
    "lista-associados.html";

  voltarAssociados.textContent =
    "Voltar para Lista de Associados";

}


/* ==========================================
   FORMATAÇÃO
========================================== */

function formatarNome(
  nomeCompleto
) {

  return String(
    nomeCompleto || ""
  )
    .trim()
    .toLowerCase()
    .replace(
      /\b\p{L}/gu,
      (letra) =>
        letra.toUpperCase()
    );

}


function valorOuTraco(
  valor
) {

  if (
    valor === undefined ||
    valor === null ||
    valor === ""
  ) {

    return "Não informado";

  }

  return String(
    valor
  );

}


/* ==========================================
   DATAS
========================================== */

function formatarData(
  dataISO
) {

  if (
    !dataISO
  ) {

    return "Não informado";

  }

  const partes =
    String(
      dataISO
    ).split("-");

  if (
    partes.length !== 3
  ) {

    return dataISO;

  }

  return (
    `${partes[2]}/` +
    `${partes[1]}/` +
    `${partes[0]}`
  );

}


function dataISOParaCampo(
  dataISO
) {

  if (
    !dataISO
  ) {

    return "";

  }

  const partes =
    String(
      dataISO
    ).split("-");

  if (
    partes.length !== 3
  ) {

    return "";

  }

  return (
    `${partes[2]}/` +
    `${partes[1]}/` +
    `${partes[0]}`
  );

}


function aplicarMascaraData(
  campo
) {

  let numeros =
    campo.value
      .replace(
        /\D/g,
        ""
      )
      .slice(
        0,
        8
      );

  if (
    numeros.length > 4
  ) {

    numeros =
      `${numeros.slice(
        0,
        2
      )}/${numeros.slice(
        2,
        4
      )}/${numeros.slice(
        4
      )}`;

  } else if (
    numeros.length > 2
  ) {

    numeros =
      `${numeros.slice(
        0,
        2
      )}/${numeros.slice(
        2
      )}`;

  }

  campo.value =
    numeros;

}


function converterDataParaISO(
  texto
) {

  const valor =
    String(
      texto || ""
    ).trim();

  if (
    valor === ""
  ) {

    return null;

  }

  const partes =
    valor.split("/");

  if (
    partes.length !== 3 ||
    partes[2].length !== 4
  ) {

    return false;

  }

  const dia =
    Number(
      partes[0]
    );

  const mes =
    Number(
      partes[1]
    );

  const ano =
    Number(
      partes[2]
    );

  if (
    !dia ||
    !mes ||
    !ano
  ) {

    return false;

  }

  const data =
    new Date(
      ano,
      mes - 1,
      dia
    );

  if (
    data.getFullYear() !== ano ||
    data.getMonth() !== mes - 1 ||
    data.getDate() !== dia
  ) {

    return false;

  }

  return (
    `${ano}-` +
    `${String(mes).padStart(2, "0")}-` +
    `${String(dia).padStart(2, "0")}`
  );

}


function obterDataHojeParaCampo() {

  const hoje =
    new Date();

  return (
    `${String(
      hoje.getDate()
    ).padStart(
      2,
      "0"
    )}/` +
    `${String(
      hoje.getMonth() + 1
    ).padStart(
      2,
      "0"
    )}/` +
    `${hoje.getFullYear()}`
  );

}


function obterDataHojeISO() {

  const hoje =
    new Date();

  return (
    `${hoje.getFullYear()}-` +
    `${String(
      hoje.getMonth() + 1
    ).padStart(
      2,
      "0"
    )}-` +
    `${String(
      hoje.getDate()
    ).padStart(
      2,
      "0"
    )}`
  );

}


/* ==========================================
   MENSAGEM
========================================== */

function mostrarMensagem(
  texto
) {

  mensagemAssociadoResumo.textContent =
    texto;

  mensagemAssociadoResumo.hidden =
    false;

}


/* ==========================================
   ITEM DO RESUMO
========================================== */

function adicionarItem(
  titulo,
  valor
) {

  const item =
    document.createElement(
      "div"
    );

  item.className =
    "item-resumo-associado";


  const rotulo =
    document.createElement(
      "span"
    );

  rotulo.textContent =
    titulo;


  const conteudo =
    document.createElement(
      "strong"
    );

  conteudo.textContent =
    valorOuTraco(
      valor
    );


  item.appendChild(
    rotulo
  );

  item.appendChild(
    conteudo
  );

  dadosAssociadoResumo.appendChild(
    item
  );

}


/* ==========================================
   DADOS PRINCIPAIS
========================================== */

function renderizarDadosPrincipaisAssociado() {

  if (
    !associadoAtual
  ) {

    return;

  }

  const nome =
    formatarNome(
      associadoAtual.nome_completo ||
      dadosPessoaisAtual.nome
    );

  tituloAssociadoResumo.textContent =
    nome;

  dadosAssociadoResumo.innerHTML =
    "";

  adicionarItem(
    "Nome completo",
    nome
  );

  adicionarItem(
    "Data de nascimento",
    dadosPessoaisAtual.nascimento
  );

  adicionarItem(
    "Celular",
    associadoAtual.endereco_contato_celular
  );

  adicionarItem(
    "Orixá de Frente",
    historicoUmbandaAtual.orixaFrente
  );

  adicionarItem(
    "Orixá Adjunto",
    historicoUmbandaAtual.orixaAdjunto
  );

}


/* ==========================================
   PERMISSÃO PARA EDITAR ASSOCIADOS
========================================== */

async function verificarPermissaoEdicaoAssociado() {

  podeEditarAssociado =
    false;

  botaoEditarDadosAssociado.hidden =
    true;

  botaoEditarDatasAdministrativas.hidden =
    true;

  try {

    const resultado =
      await window.supabaseClient
        .rpc(
          "usuario_pode_editar_associados"
        );

    if (
      resultado.error
    ) {

      throw resultado.error;

    }

    podeEditarAssociado =
      resultado.data === true;

  } catch (erro) {

    console.error(
      "Erro ao verificar permissão para editar associados:",
      erro
    );

    podeEditarAssociado =
      false;

  }

  botaoEditarDadosAssociado.hidden =
    !podeEditarAssociado;

  botaoEditarDatasAdministrativas.hidden =
    !podeEditarAssociado;

}


/* ==========================================
   ABRIR EDIÇÃO DOS DADOS PRINCIPAIS
========================================== */

function abrirEdicaoDadosAssociado() {

  if (
    !podeEditarAssociado ||
    !associadoAtual
  ) {

    return;

  }

  nomeCompletoEdicaoAssociado.value =
    associadoAtual.nome_completo ||
    dadosPessoaisAtual.nome ||
    "";

  orixaFrenteEdicaoAssociado.value =
    historicoUmbandaAtual.orixaFrente ||
    "";

  orixaAdjuntoEdicaoAssociado.value =
    historicoUmbandaAtual.orixaAdjunto ||
    "";

  mensagemEdicaoDadosAssociado.textContent =
    "";

  mensagemEdicaoDadosAssociado.hidden =
    true;

  dadosAssociadoResumo.hidden =
    true;

  botaoEditarDadosAssociado.hidden =
    true;

  edicaoDadosAssociado.hidden =
    false;

  nomeCompletoEdicaoAssociado.focus();

}


/* ==========================================
   CANCELAR EDIÇÃO DOS DADOS PRINCIPAIS
========================================== */

function cancelarEdicaoDadosAssociado() {

  edicaoDadosAssociado.hidden =
    true;

  dadosAssociadoResumo.hidden =
    false;

  botaoEditarDadosAssociado.hidden =
    !podeEditarAssociado;

  mensagemEdicaoDadosAssociado.textContent =
    "";

  mensagemEdicaoDadosAssociado.hidden =
    true;

}


/* ==========================================
   SALVAR DADOS PRINCIPAIS
========================================== */

async function salvarDadosPrincipaisAssociado() {

  if (
    !podeEditarAssociado ||
    !associadoAtual
  ) {

    return;

  }

  const nomeCompleto =
    String(
      nomeCompletoEdicaoAssociado.value ||
      ""
    ).trim();

  const orixaFrente =
    String(
      orixaFrenteEdicaoAssociado.value ||
      ""
    ).trim();

  const orixaAdjunto =
    String(
      orixaAdjuntoEdicaoAssociado.value ||
      ""
    ).trim();


  if (
    !nomeCompleto
  ) {

    mensagemEdicaoDadosAssociado.textContent =
      "Informe o nome completo do associado.";

    mensagemEdicaoDadosAssociado.hidden =
      false;

    nomeCompletoEdicaoAssociado.focus();

    return;

  }


  botaoSalvarEdicaoDadosAssociado.disabled =
    true;

  botaoSalvarEdicaoDadosAssociado.textContent =
    "Salvando...";

  mensagemEdicaoDadosAssociado.hidden =
    true;


  try {

    const resultado =
      await window.supabaseClient
        .rpc(
          "editar_dados_principais_associado",
          {

            p_usuario_id:
              associadoAtual.id,

            p_nome_completo:
              nomeCompleto,

            p_orixa_frente:
              orixaFrente,

            p_orixa_adjunto:
              orixaAdjunto

          }
        );

    if (
      resultado.error
    ) {

      throw resultado.error;

    }


    associadoAtual.nome_completo =
      nomeCompleto;

    dadosPessoaisAtual.nome =
      nomeCompleto;

    historicoUmbandaAtual.orixaFrente =
      orixaFrente;

    historicoUmbandaAtual.orixaAdjunto =
      orixaAdjunto;


    renderizarDadosPrincipaisAssociado();


    edicaoDadosAssociado.hidden =
      true;

    dadosAssociadoResumo.hidden =
      false;

    botaoEditarDadosAssociado.hidden =
      false;

  } catch (erro) {

    console.error(
      "Erro ao salvar dados principais do associado:",
      erro
    );

    mensagemEdicaoDadosAssociado.textContent =
      "Não foi possível salvar as alterações.";

    mensagemEdicaoDadosAssociado.hidden =
      false;

  } finally {

    botaoSalvarEdicaoDadosAssociado.disabled =
      false;

    botaoSalvarEdicaoDadosAssociado.textContent =
      "Salvar alterações";

  }

}


/* ==========================================
   USUÁRIO LOGADO
========================================== */

async function obterUsuarioLogadoId() {

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

  return (
    resultadoUsuario.data?.id ||
    null
  );

}


/* ==========================================
   PERMISSÃO DE ATENDIMENTOS
========================================== */

async function verificarPermissaoAtendimentos() {

  botaoHistoricoAtendimentosAssociado.hidden =
    true;

  try {

    const usuarioId =
      await obterUsuarioLogadoId();

    if (
      !usuarioId
    ) {

      return;

    }

    const resultadoPermissao =
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
        .maybeSingle();

    if (
      resultadoPermissao.error
    ) {

      throw resultadoPermissao.error;

    }

    if (
      !resultadoPermissao.data
    ) {

      return;

    }

    const {
      associadoId
    } =
      obterParametros();

    if (
      !associadoId
    ) {

      return;

    }

    botaoHistoricoAtendimentosAssociado.href =
      `atendimentos-realizados.html?usuario_id=${encodeURIComponent(
        associadoId
      )}&origem=associado`;

    botaoHistoricoAtendimentosAssociado.hidden =
      false;

  } catch (erro) {

    console.error(
      "Erro ao verificar permissão de atendimentos:",
      erro
    );

    botaoHistoricoAtendimentosAssociado.hidden =
      true;

  }

}


/* ==========================================
   PERMISSÃO PARA BAIXA
========================================== */

async function verificarPermissaoBaixaAssociado() {

  podeDarBaixaAssociado =
    false;

  atualizarAreaBaixaAssociado();

  try {

    const usuarioId =
      await obterUsuarioLogadoId();

    if (
      !usuarioId
    ) {

      return;

    }

    const resultadoPermissao =
      await window.supabaseClient
        .from(
          "responsaveis_baixas_associados"
        )
        .select(
          "id"
        )
        .eq(
          "usuario_id",
          usuarioId
        )
        .maybeSingle();

    if (
      resultadoPermissao.error
    ) {

      throw resultadoPermissao.error;

    }

    podeDarBaixaAssociado =
      Boolean(
        resultadoPermissao.data
      );

  } catch (erro) {

    console.error(
      "Erro ao verificar permissão para dar baixa:",
      erro
    );

    podeDarBaixaAssociado =
      false;

  }

  atualizarAreaBaixaAssociado();

}


/* ==========================================
   FUNÇÕES ATUAIS
========================================== */

function possuiFuncaoPrincipal(
  nome
) {

  return funcoesAtuais.some(
    (funcao) =>
      funcao.nome === nome &&
      !funcao.funcao_pai_id
  );

}


function estaNoDesenvolvimento() {

  return possuiFuncaoPrincipal(
    "Médium em Desenvolvimento"
  );

}


function estaNaCorrentePrincipal() {

  return (
    possuiFuncaoPrincipal(
      "Médium Corrente Principal"
    ) ||
    possuiFuncaoPrincipal(
      "Médium Principal"
    )
  );

}


function estaNaAssistencia() {

  return possuiFuncaoPrincipal(
    "Assistência"
  );

}


function mostrarTrajetoriaMediunica() {

  return (
    estaNoDesenvolvimento() ||
    estaNaCorrentePrincipal()
  );

}


/* ==========================================
   VISUALIZAÇÃO ADMINISTRATIVA
========================================== */

function atualizarVisualizacaoDatas() {

  if (
    !associadoAtual
  ) {

    return;

  }

  textoDataEntradaTufra.textContent =
    formatarData(
      associadoAtual.data_entrada_tufra
    );

  const mostrarTrajetoria =
    mostrarTrajetoriaMediunica();

  itemDataCorrenteDesenvolvimento.hidden =
    !mostrarTrajetoria;

  itemDataCorrentePrincipal.hidden =
    !mostrarTrajetoria;

  if (
    mostrarTrajetoria
  ) {

    textoDataCorrenteDesenvolvimento.textContent =
      formatarData(
        associadoAtual.data_corrente_desenvolvimento
      );

    textoDataCorrentePrincipal.textContent =
      formatarData(
        associadoAtual.data_corrente_principal
      );

  }

  avisoAssociadoAssistencia.hidden =
    !estaNaAssistencia();

}


/* ==========================================
   HISTÓRICO
========================================== */

function ordenarHistorico(
  historico
) {

  const ordemFuncoes = {

    Ogam: 1,

    Cambone: 2,

    Cantina: 3

  };

  return [
    ...historico
  ].sort(
    (a, b) => {

      const ordemA =
        ordemFuncoes[
          a.funcao_nome
        ] || 99;

      const ordemB =
        ordemFuncoes[
          b.funcao_nome
        ] || 99;

      if (
        ordemA !== ordemB
      ) {

        return ordemA - ordemB;

      }

      return String(
        a.data_inicio || ""
      ).localeCompare(
        String(
          b.data_inicio || ""
        )
      );

    }
  );

}


function formatarPeriodoHistorico(
  registro
) {

  if (
    registro.data_fim
  ) {

    return (
      `${formatarData(
        registro.data_inicio
      )} a ${formatarData(
        registro.data_fim
      )}`
    );

  }

  return (
    `Desde ${formatarData(
      registro.data_inicio
    )}`
  );

}


function renderizarHistoricoFuncoes() {

  listaHistoricoFuncoes.innerHTML =
    "";

  if (
    historicoFuncoes.length === 0
  ) {

    areaHistoricoFuncoes.hidden =
      true;

    return;

  }

  areaHistoricoFuncoes.hidden =
    false;

  const historicoOrdenado =
    ordenarHistorico(
      historicoFuncoes
    );

  const nomesFuncoes =
    [
      ...new Set(
        historicoOrdenado.map(
          (registro) =>
            registro.funcao_nome
        )
      )
    ];

  nomesFuncoes.forEach(
    (funcaoNome) => {

      const bloco =
        document.createElement(
          "div"
        );

      bloco.className =
        "bloco-historico-funcao";


      const titulo =
        document.createElement(
          "strong"
        );

      titulo.className =
        "titulo-historico-funcao";

      titulo.textContent =
        funcaoNome;

      bloco.appendChild(
        titulo
      );


      historicoOrdenado
        .filter(
          (registro) =>
            registro.funcao_nome ===
            funcaoNome
        )
        .forEach(
          (registro) => {

            const periodo =
              document.createElement(
                "span"
              );

            periodo.className =
              "periodo-historico-funcao";

            periodo.textContent =
              formatarPeriodoHistorico(
                registro
              );

            bloco.appendChild(
              periodo
            );

          }
        );

      listaHistoricoFuncoes.appendChild(
        bloco
      );

    }
  );

}


/* ==========================================
   CAMPO DE HISTÓRICO
========================================== */

function criarCampoHistorico(
  rotulo,
  classe,
  valor,
  editavel = true
) {

  const grupo =
    document.createElement(
      "div"
    );

  grupo.className =
    "campo-data-administrativa";


  const label =
    document.createElement(
      "label"
    );

  label.textContent =
    rotulo;

  grupo.appendChild(
    label
  );


  if (
    editavel
  ) {

    const input =
      document.createElement(
        "input"
      );

    input.type =
      "text";

    input.inputMode =
      "numeric";

    input.maxLength =
      10;

    input.autocomplete =
      "off";

    input.placeholder =
      "dd/mm/aaaa";

    input.className =
      classe;

    input.value =
      dataISOParaCampo(
        valor
      );

    input.addEventListener(
      "input",
      () => {

        aplicarMascaraData(
          input
        );

      }
    );

    grupo.appendChild(
      input
    );

  } else {

    const atual =
      document.createElement(
        "span"
      );

    atual.className =
      "funcao-historico-atual";

    atual.textContent =
      "Função atual";

    grupo.appendChild(
      atual
    );

  }

  return grupo;

}


/* ==========================================
   HISTÓRICO PARA EDIÇÃO
========================================== */

function renderizarHistoricoEdicao() {

  listaEdicaoHistoricoFuncoes.innerHTML =
    "";

  if (
    historicoFuncoes.length === 0
  ) {

    areaEdicaoHistoricoFuncoes.hidden =
      true;

    return;

  }

  areaEdicaoHistoricoFuncoes.hidden =
    false;

  const historicoOrdenado =
    ordenarHistorico(
      historicoFuncoes
    );

  historicoOrdenado.forEach(
    (registro) => {

      const bloco =
        document.createElement(
          "div"
        );

      bloco.className =
        "item-edicao-historico-funcao";

      bloco.dataset.historicoId =
        registro.id;


      const titulo =
        document.createElement(
          "strong"
        );

      titulo.className =
        "titulo-edicao-historico-funcao";

      titulo.textContent =
        registro.funcao_nome;

      bloco.appendChild(
        titulo
      );


      bloco.appendChild(
        criarCampoHistorico(
          "Data de entrada",
          "historico-data-inicio",
          registro.data_inicio,
          true
        )
      );


      bloco.appendChild(
        criarCampoHistorico(
          "Data de saída",
          "historico-data-fim",
          registro.data_fim,
          Boolean(
            registro.data_fim
          )
        )
      );


      listaEdicaoHistoricoFuncoes.appendChild(
        bloco
      );

    }
  );

}


/* ==========================================
   ABRIR EDIÇÃO ADMINISTRATIVA
========================================== */

function abrirEdicaoDatas() {

  if (
    !podeEditarAssociado ||
    !associadoAtual
  ) {

    return;

  }

  dataEntradaTufra.value =
    dataISOParaCampo(
      associadoAtual.data_entrada_tufra
    );

  const mostrarTrajetoria =
    mostrarTrajetoriaMediunica();

  campoEdicaoCorrenteDesenvolvimento.hidden =
    !mostrarTrajetoria;

  campoEdicaoCorrentePrincipal.hidden =
    !mostrarTrajetoria;

  if (
    mostrarTrajetoria
  ) {

    dataCorrenteDesenvolvimento.value =
      dataISOParaCampo(
        associadoAtual.data_corrente_desenvolvimento
      );

    dataCorrentePrincipal.value =
      dataISOParaCampo(
        associadoAtual.data_corrente_principal
      );

  }

  renderizarHistoricoEdicao();

  mensagemDatasAdministrativas.hidden =
    true;

  mensagemDatasAdministrativas.textContent =
    "";

  visualizacaoDatasAdministrativas.hidden =
    true;

  areaHistoricoFuncoes.hidden =
    true;

  botaoEditarDatasAdministrativas.hidden =
    true;

  edicaoDatasAdministrativas.hidden =
    false;

}


/* ==========================================
   CANCELAR EDIÇÃO ADMINISTRATIVA
========================================== */

function cancelarEdicaoDatas() {

  edicaoDatasAdministrativas.hidden =
    true;

  visualizacaoDatasAdministrativas.hidden =
    false;

  botaoEditarDatasAdministrativas.hidden =
    !podeEditarAssociado;

  mensagemDatasAdministrativas.hidden =
    true;

  mensagemDatasAdministrativas.textContent =
    "";

  renderizarHistoricoFuncoes();

}


/* ==========================================
   DATAS DIGITADAS
========================================== */

function obterDatasDigitadas() {

  const entrada =
    converterDataParaISO(
      dataEntradaTufra.value
    );

  let desenvolvimento =
    associadoAtual
      ?.data_corrente_desenvolvimento ||
    null;

  let principal =
    associadoAtual
      ?.data_corrente_principal ||
    null;

  if (
    mostrarTrajetoriaMediunica()
  ) {

    desenvolvimento =
      converterDataParaISO(
        dataCorrenteDesenvolvimento.value
      );

    principal =
      converterDataParaISO(
        dataCorrentePrincipal.value
      );

  }

  return {

    entrada,

    desenvolvimento,

    principal

  };

}


/* ==========================================
   VALIDAR DATAS
========================================== */

function validarDatasAdministrativas() {

  const {
    entrada,
    desenvolvimento,
    principal
  } =
    obterDatasDigitadas();

  if (
    entrada === false
  ) {

    return (
      "Informe uma data válida para a entrada na TUFRA."
    );

  }

  if (
    mostrarTrajetoriaMediunica()
  ) {

    if (
      desenvolvimento === false
    ) {

      return (
        "Informe uma data válida para a Corrente do Desenvolvimento."
      );

    }

    if (
      principal === false
    ) {

      return (
        "Informe uma data válida para a Corrente Principal."
      );

    }

    if (
      entrada &&
      desenvolvimento &&
      desenvolvimento < entrada
    ) {

      return (
        "A data da Corrente do Desenvolvimento não pode ser anterior à entrada na TUFRA."
      );

    }

    if (
      entrada &&
      principal &&
      principal < entrada
    ) {

      return (
        "A data da Corrente Principal não pode ser anterior à entrada na TUFRA."
      );

    }

    if (
      desenvolvimento &&
      principal &&
      principal < desenvolvimento
    ) {

      return (
        "A data da Corrente Principal não pode ser anterior à Corrente do Desenvolvimento."
      );

    }

  }

  return "";

}


/* ==========================================
   HISTÓRICO DIGITADO
========================================== */

function obterHistoricoDigitado() {

  const blocos =
    Array.from(
      listaEdicaoHistoricoFuncoes
        .querySelectorAll(
          ".item-edicao-historico-funcao"
        )
    );

  return blocos.map(
    (bloco) => {

      const id =
        bloco.dataset.historicoId;

      const registroOriginal =
        historicoFuncoes.find(
          (registro) =>
            registro.id === id
        );

      const campoInicio =
        bloco.querySelector(
          ".historico-data-inicio"
        );

      const campoFim =
        bloco.querySelector(
          ".historico-data-fim"
        );

      return {

        id,

        funcao_nome:
          registroOriginal
            ?.funcao_nome ||
          "",

        data_inicio:
          converterDataParaISO(
            campoInicio?.value
          ),

        data_fim:
          campoFim
            ? converterDataParaISO(
                campoFim.value
              )
            : null,

        possuiDataFimOriginal:
          Boolean(
            registroOriginal
              ?.data_fim
          )

      };

    }
  );

}


/* ==========================================
   VALIDAR HISTÓRICO
========================================== */

function validarHistoricoFuncoes() {

  const registros =
    obterHistoricoDigitado();

  const entradaTufra =
    converterDataParaISO(
      dataEntradaTufra.value
    );

  for (
    const registro of registros
  ) {

    if (
      registro.data_inicio === false
    ) {

      return (
        `Informe uma data de entrada válida para ${registro.funcao_nome}.`
      );

    }

    if (
      !registro.data_inicio
    ) {

      return (
        `A data de entrada de ${registro.funcao_nome} é obrigatória.`
      );

    }

    if (
      registro.data_fim === false
    ) {

      return (
        `Informe uma data de saída válida para ${registro.funcao_nome}.`
      );

    }

    if (
      entradaTufra &&
      registro.data_inicio <
      entradaTufra
    ) {

      return (
        `A entrada em ${registro.funcao_nome} não pode ser anterior à entrada na TUFRA.`
      );

    }

    if (
      registro.data_fim &&
      registro.data_fim <
      registro.data_inicio
    ) {

      return (
        `A saída de ${registro.funcao_nome} não pode ser anterior à entrada na função.`
      );

    }

  }

  return "";

}


/* ==========================================
   SALVAR HISTÓRICO
========================================== */

async function salvarHistoricoFuncoes() {

  const registros =
    obterHistoricoDigitado();

  for (
    const registro of registros
  ) {

    const atualizacao = {

      data_inicio:
        registro.data_inicio,

      atualizado_em:
        new Date()
          .toISOString()

    };

    if (
      registro.possuiDataFimOriginal
    ) {

      atualizacao.data_fim =
        registro.data_fim;

    }

    const resultado =
      await window.supabaseClient
        .from(
          "historico_funcoes_associado"
        )
        .update(
          atualizacao
        )
        .eq(
          "id",
          registro.id
        );

    if (
      resultado.error
    ) {

      throw resultado.error;

    }

  }


  historicoFuncoes =
    historicoFuncoes.map(
      (registroOriginal) => {

        const registroEditado =
          registros.find(
            (registro) =>
              registro.id ===
              registroOriginal.id
          );

        if (
          !registroEditado
        ) {

          return registroOriginal;

        }

        return {

          ...registroOriginal,

          data_inicio:
            registroEditado.data_inicio,

          data_fim:
            registroEditado
              .possuiDataFimOriginal
              ? registroEditado.data_fim
              : registroOriginal.data_fim

        };

      }
    );

}


/* ==========================================
   SALVAR ADMINISTRATIVO
========================================== */

async function salvarDatasAdministrativas() {

  if (
    !podeEditarAssociado ||
    !associadoAtual
  ) {

    return;

  }

  const erroDatas =
    validarDatasAdministrativas();

  if (
    erroDatas
  ) {

    mensagemDatasAdministrativas.textContent =
      erroDatas;

    mensagemDatasAdministrativas.hidden =
      false;

    return;

  }

  const erroHistorico =
    validarHistoricoFuncoes();

  if (
    erroHistorico
  ) {

    mensagemDatasAdministrativas.textContent =
      erroHistorico;

    mensagemDatasAdministrativas.hidden =
      false;

    return;

  }


  const {
    entrada,
    desenvolvimento,
    principal
  } =
    obterDatasDigitadas();


  botaoSalvarDatasAdministrativas.disabled =
    true;

  botaoSalvarDatasAdministrativas.textContent =
    "Salvando...";

  mensagemDatasAdministrativas.hidden =
    true;


  try {

    const novasDatas = {

      data_entrada_tufra:
        entrada

    };

    if (
      mostrarTrajetoriaMediunica()
    ) {

      novasDatas.data_corrente_desenvolvimento =
        desenvolvimento;

      novasDatas.data_corrente_principal =
        principal;

    }


    const resultado =
      await window.supabaseClient
        .from(
          "usuarios"
        )
        .update(
          novasDatas
        )
        .eq(
          "id",
          associadoAtual.id
        );

    if (
      resultado.error
    ) {

      throw resultado.error;

    }


    associadoAtual.data_entrada_tufra =
      entrada;

    if (
      mostrarTrajetoriaMediunica()
    ) {

      associadoAtual.data_corrente_desenvolvimento =
        desenvolvimento;

      associadoAtual.data_corrente_principal =
        principal;

    }


    await salvarHistoricoFuncoes();


    atualizarVisualizacaoDatas();

    renderizarHistoricoFuncoes();


    edicaoDatasAdministrativas.hidden =
      true;

    visualizacaoDatasAdministrativas.hidden =
      false;

    botaoEditarDatasAdministrativas.hidden =
      false;

  } catch (erro) {

    console.error(
      "Erro ao salvar dados administrativos:",
      erro
    );

    mensagemDatasAdministrativas.textContent =
      "Não foi possível salvar os dados administrativos.";

    mensagemDatasAdministrativas.hidden =
      false;

  } finally {

    botaoSalvarDatasAdministrativas.disabled =
      false;

    botaoSalvarDatasAdministrativas.textContent =
      "Salvar dados";

  }

}


/* ==========================================
   ÁREA DE BAIXA
========================================== */

function atualizarAreaBaixaAssociado() {

  if (
    !areaBaixaAssociado ||
    !associadoAtual
  ) {

    return;

  }

  if (
    !podeDarBaixaAssociado
  ) {

    areaBaixaAssociado.hidden =
      true;

    formularioBaixaAssociado.hidden =
      true;

    formularioReativacaoAssociado.hidden =
      true;

    return;

  }


  const estaInativo =
    associadoAtual.status ===
    "inativo";

  areaBaixaAssociado.hidden =
    false;

  areaAssociadoAtivo.hidden =
    estaInativo;

  areaAssociadoInativo.hidden =
    !estaInativo;

  formularioBaixaAssociado.hidden =
    true;

  formularioReativacaoAssociado.hidden =
    true;


  if (
    estaInativo
  ) {

    textoDataSaidaAssociado.textContent =
      formatarData(
        associadoAtual.data_saida_tufra
      );

    textoMotivoSaidaAssociado.textContent =
      valorOuTraco(
        associadoAtual.motivo_saida
      );

  }

}


/* ==========================================
   BAIXA
========================================== */

function abrirBaixaAssociado() {

  if (
    !associadoAtual ||
    associadoAtual.status ===
    "inativo"
  ) {

    return;

  }

  dataSaidaAssociado.value =
    obterDataHojeParaCampo();

  motivoSaidaAssociado.value =
    "";

  mensagemBaixaAssociado.textContent =
    "";

  mensagemBaixaAssociado.hidden =
    true;

  formularioBaixaAssociado.hidden =
    false;

  dataSaidaAssociado.focus();

}


function cancelarBaixaAssociado() {

  formularioBaixaAssociado.hidden =
    true;

  dataSaidaAssociado.value =
    "";

  motivoSaidaAssociado.value =
    "";

  mensagemBaixaAssociado.textContent =
    "";

  mensagemBaixaAssociado.hidden =
    true;

}


function exibirErroBaixa(
  texto
) {

  mensagemBaixaAssociado.textContent =
    texto;

  mensagemBaixaAssociado.hidden =
    false;

}


async function confirmarBaixaAssociado() {

  if (
    !associadoAtual ||
    associadoAtual.status ===
    "inativo"
  ) {

    return;

  }

  const dataSaida =
    converterDataParaISO(
      dataSaidaAssociado.value
    );

  const motivo =
    String(
      motivoSaidaAssociado.value ||
      ""
    ).trim();


  if (
    dataSaida === false ||
    !dataSaida
  ) {

    exibirErroBaixa(
      "Informe uma data de saída válida."
    );

    return;

  }

  if (
    associadoAtual.data_entrada_tufra &&
    dataSaida <
    associadoAtual.data_entrada_tufra
  ) {

    exibirErroBaixa(
      "A data de saída não pode ser anterior à data de entrada na TUFRA."
    );

    return;

  }

  if (
    dataSaida >
    obterDataHojeISO()
  ) {

    exibirErroBaixa(
      "A data de saída não pode ser uma data futura."
    );

    return;

  }

  if (
    !motivo
  ) {

    exibirErroBaixa(
      "Informe o motivo da baixa."
    );

    return;

  }


  const confirmar =
    window.confirm(
      "Confirma a baixa deste associado? O cadastro e o histórico serão preservados, mas o associado ficará inativo."
    );

  if (
    !confirmar
  ) {

    return;

  }


  botaoConfirmarBaixaAssociado.disabled =
    true;

  botaoConfirmarBaixaAssociado.textContent =
    "Salvando...";

  mensagemBaixaAssociado.hidden =
    true;


  try {

    const resultado =
      await window.supabaseClient
        .rpc(
          "dar_baixa_associado",
          {

            p_usuario_id:
              associadoAtual.id,

            p_data_saida:
              dataSaida,

            p_motivo_saida:
              motivo

          }
        );

    if (
      resultado.error
    ) {

      throw resultado.error;

    }

    associadoAtual.status =
      "inativo";

    associadoAtual.data_saida_tufra =
      dataSaida;

    associadoAtual.motivo_saida =
      motivo;

    formularioBaixaAssociado.hidden =
      true;

    atualizarAreaBaixaAssociado();

  } catch (erro) {

    console.error(
      "Erro ao dar baixa no associado:",
      erro
    );

    exibirErroBaixa(
      "Não foi possível concluir a baixa do associado."
    );

  } finally {

    botaoConfirmarBaixaAssociado.disabled =
      false;

    botaoConfirmarBaixaAssociado.textContent =
      "Confirmar baixa";

  }

}


/* ==========================================
   REATIVAÇÃO
========================================== */

function abrirReativacaoAssociado() {

  if (
    !associadoAtual ||
    associadoAtual.status !==
    "inativo"
  ) {

    return;

  }

  dataRetornoAssociado.value =
    obterDataHojeParaCampo();

  observacaoRetornoAssociado.value =
    "";

  mensagemReativacaoAssociado.textContent =
    "";

  mensagemReativacaoAssociado.hidden =
    true;

  formularioReativacaoAssociado.hidden =
    false;

  dataRetornoAssociado.focus();

}


function cancelarReativacaoAssociado() {

  formularioReativacaoAssociado.hidden =
    true;

  dataRetornoAssociado.value =
    "";

  observacaoRetornoAssociado.value =
    "";

  mensagemReativacaoAssociado.textContent =
    "";

  mensagemReativacaoAssociado.hidden =
    true;

}


function exibirErroReativacao(
  texto
) {

  mensagemReativacaoAssociado.textContent =
    texto;

  mensagemReativacaoAssociado.hidden =
    false;

}


async function confirmarReativacaoAssociado() {

  if (
    !associadoAtual ||
    associadoAtual.status !==
    "inativo"
  ) {

    return;

  }

  const dataRetorno =
    converterDataParaISO(
      dataRetornoAssociado.value
    );

  const observacao =
    String(
      observacaoRetornoAssociado.value ||
      ""
    ).trim();


  if (
    dataRetorno === false ||
    !dataRetorno
  ) {

    exibirErroReativacao(
      "Informe uma data de retorno válida."
    );

    return;

  }

  if (
    associadoAtual.data_saida_tufra &&
    dataRetorno <
    associadoAtual.data_saida_tufra
  ) {

    exibirErroReativacao(
      "A data de retorno não pode ser anterior à data da saída."
    );

    return;

  }

  if (
    dataRetorno >
    obterDataHojeISO()
  ) {

    exibirErroReativacao(
      "A data de retorno não pode ser uma data futura."
    );

    return;

  }


  const confirmar =
    window.confirm(
      "Confirma a reativação deste associado? A data de entrada original na TUFRA será preservada."
    );

  if (
    !confirmar
  ) {

    return;

  }


  botaoConfirmarReativacaoAssociado.disabled =
    true;

  botaoConfirmarReativacaoAssociado.textContent =
    "Salvando...";

  mensagemReativacaoAssociado.hidden =
    true;


  try {

    const resultado =
      await window.supabaseClient
        .rpc(
          "reativar_associado",
          {

            p_usuario_id:
              associadoAtual.id,

            p_data_retorno:
              dataRetorno,

            p_observacao_retorno:
              observacao ||
              null

          }
        );

    if (
      resultado.error
    ) {

      throw resultado.error;

    }

    associadoAtual.status =
      "ativo";

    associadoAtual.data_saida_tufra =
      null;

    associadoAtual.motivo_saida =
      null;

    formularioReativacaoAssociado.hidden =
      true;

    atualizarAreaBaixaAssociado();

  } catch (erro) {

    console.error(
      "Erro ao reativar associado:",
      erro
    );

    exibirErroReativacao(
      "Não foi possível reativar o associado."
    );

  } finally {

    botaoConfirmarReativacaoAssociado.disabled =
      false;

    botaoConfirmarReativacaoAssociado.textContent =
      "Confirmar reativação";

  }

}


/* ==========================================
   CARREGAR HISTÓRICO
========================================== */

async function carregarHistoricoFuncoes(
  associadoId
) {

  const resultado =
    await window.supabaseClient
      .from(
        "historico_funcoes_associado"
      )
      .select(`
        id,
        usuario_id,
        funcao_nome,
        data_inicio,
        data_fim,
        criado_em,
        atualizado_em
      `)
      .eq(
        "usuario_id",
        associadoId
      )
      .order(
        "data_inicio",
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

  historicoFuncoes =
    resultado.data ||
    [];

}


/* ==========================================
   CARREGAR ASSOCIADO
========================================== */

async function carregarAssociado() {

  const {
    associadoId,
    origem
  } =
    obterParametros();


  if (
    !associadoId
  ) {

    window.location.href =
      origem === "carometro"
        ? "carometro.html"
        : "lista-associados.html";

    return;

  }


  if (
    !window.supabaseClient
  ) {

    return;

  }


  try {

    const resultadoUsuario =
      await window.supabaseClient
        .from(
          "usuarios"
        )
        .select(`
          id,
          nome_completo,
          foto_path,
          status,
          data_entrada_tufra,
          data_corrente_desenvolvimento,
          data_corrente_principal,
          data_saida_tufra,
          motivo_saida,

          usuario_funcoes!usuario_funcoes_usuario_id_fkey (
            funcoes (
              id,
              nome,
              funcao_pai_id
            )
          )
        `)
        .eq(
          "id",
          associadoId
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

      throw new Error(
        "Associado não encontrado."
      );

    }


    associadoAtual =
      resultadoUsuario.data;


    funcoesAtuais =
      (
        associadoAtual.usuario_funcoes ||
        []
      )
        .map(
          (item) =>
            item.funcoes
        )
        .filter(
          Boolean
        );


    await carregarHistoricoFuncoes(
      associadoId
    );


    const resultadoFicha =
      await window.supabaseClient
        .from(
          "fichas_associados"
        )
        .select(`
          dados_pessoais,
          endereco_contato,
          historico_umbanda
        `)
        .eq(
          "usuario_id",
          associadoId
        )
        .maybeSingle();


    if (
      resultadoFicha.error
    ) {

      throw resultadoFicha.error;

    }


    const ficha =
      resultadoFicha.data ||
      {};


    dadosPessoaisAtual =
      {
        ...(
          ficha.dados_pessoais ||
          {}
        )
      };


    historicoUmbandaAtual =
      {
        ...(
          ficha.historico_umbanda ||
          {}
        )
      };


    associadoAtual.endereco_contato_celular =
      ficha.endereco_contato
        ?.celular ||
      "";


    renderizarDadosPrincipaisAssociado();

    atualizarVisualizacaoDatas();

    renderizarHistoricoFuncoes();

    atualizarAreaBaixaAssociado();


    botaoCadastroCompleto.href =
      `associado-ficha.html?id=${associadoId}&origem=${origem}`;


    botaoVerJustificativasAssociado.href =
      `relatorio-justificativas.html?id=${associadoId}&modo=justificativas`;


    if (
      associadoAtual.foto_path
    ) {

      const resultadoFoto =
        await window.supabaseClient.storage
          .from(
            "fotos-associados"
          )
          .createSignedUrl(
            associadoAtual.foto_path,
            60 * 60
          );


      if (
        resultadoFoto.error
      ) {

        throw resultadoFoto.error;

      }


      const urlFoto =
        resultadoFoto.data
          ?.signedUrl;


      if (
        urlFoto
      ) {

        fotoAssociadoResumo.src =
          urlFoto;

        fotoAssociadoResumo.hidden =
          false;

        fotoAssociadoResumoPadrao.hidden =
          true;

      }

    }

  } catch (erro) {

    console.error(
      "Erro ao carregar associado:",
      erro
    );

    mostrarMensagem(
      "Não foi possível carregar os dados do associado."
    );

  }

}


/* ==========================================
   FOTO E ZOOM
========================================== */

function aplicarZoomFoto() {

  fotoAssociadoAmpliada.style.transform =
    `scale(${zoomFoto})`;

  resetarZoomFotoAssociado.textContent =
    `${Math.round(
      zoomFoto * 100
    )}%`;

}


function abrirFotoAmpliada() {

  if (
    !fotoAssociadoResumo.src ||
    fotoAssociadoResumo.hidden
  ) {

    return;

  }

  fotoAssociadoAmpliada.src =
    fotoAssociadoResumo.src;

  zoomFoto =
    1;

  aplicarZoomFoto();

  modalFotoAssociado.hidden =
    false;

  document.body.style.overflow =
    "hidden";

}


function fecharFotoAmpliada() {

  modalFotoAssociado.hidden =
    true;

  document.body.style.overflow =
    "";

  zoomFoto =
    1;

}


function aumentarZoom() {

  zoomFoto =
    Math.min(
      zoomFoto + 0.25,
      4
    );

  aplicarZoomFoto();

}


function diminuirZoom() {

  zoomFoto =
    Math.max(
      zoomFoto - 0.25,
      1
    );

  aplicarZoomFoto();

}


function resetarZoom() {

  zoomFoto =
    1;

  aplicarZoomFoto();

}


function calcularDistanciaToques(
  evento
) {

  if (
    evento.touches.length < 2
  ) {

    return null;

  }

  const toque1 =
    evento.touches[0];

  const toque2 =
    evento.touches[1];

  return Math.hypot(
    toque2.clientX -
    toque1.clientX,

    toque2.clientY -
    toque1.clientY
  );

}


/* ==========================================
   PRESENÇA
========================================== */

function obterDataAtualISOResumoPresenca() {

  return obterDataHojeISO();

}


function formatarDataCurtaResumoPresenca(
  dataISO
) {

  if (
    !dataISO
  ) {

    return "";

  }

  const partes =
    String(
      dataISO
    ).split("-");

  if (
    partes.length !== 3
  ) {

    return dataISO;

  }

  return (
    `${partes[2]}/` +
    `${partes[1]}`
  );

}


function obterNomesListasAtuaisAssociado() {

  const listas =
    [];

  if (
    estaNaCorrentePrincipal()
  ) {

    listas.push(
      "Corrente Principal"
    );

  }

  if (
    estaNoDesenvolvimento()
  ) {

    listas.push(
      "Desenvolvimento"
    );

  }

  if (
    possuiFuncaoPrincipal(
      "Ogam"
    )
  ) {

    listas.push(
      "Ogans"
    );

  }

  if (
    possuiFuncaoPrincipal(
      "Cambone"
    )
  ) {

    listas.push(
      "Cambones"
    );

  }

  if (
    possuiFuncaoPrincipal(
      "Cantina"
    )
  ) {

    listas.push(
      "Cantina"
    );

  }

  return listas;

}


function obterDataEntradaListaResumo(
  nomeLista
) {

  if (
    !associadoAtual
  ) {

    return null;

  }


  if (
    nomeLista ===
    "Corrente Principal"
  ) {

    return (
      associadoAtual.data_corrente_principal ||
      associadoAtual.data_entrada_tufra ||
      null
    );

  }


  if (
    nomeLista ===
    "Desenvolvimento"
  ) {

    return (
      associadoAtual.data_corrente_desenvolvimento ||
      associadoAtual.data_entrada_tufra ||
      null
    );

  }


  const mapaFuncoes = {

    Ogans:
      "Ogam",

    Cambones:
      "Cambone",

    Cantina:
      "Cantina"

  };


  const funcao =
    mapaFuncoes[
      nomeLista
    ];


  const periodoAtual =
    funcao
      ? historicoFuncoes.find(
          (registro) =>
            registro.funcao_nome ===
              funcao &&
            !registro.data_fim
        )
      : null;


  return (
    periodoAtual
      ?.data_inicio ||
    associadoAtual
      .data_entrada_tufra ||
    null
  );

}


/* ==========================================
   BUSCAR TIPO DE LISTA
========================================== */

async function buscarTipoListaResumo(
  nomeLista
) {

  const resultado =
    await window.supabaseClient
      .from(
        "tipos_lista_presenca"
      )
      .select(`
        id,
        nome,
        tipo_atividade,
        ativo,
        ordem
      `)
      .eq(
        "nome",
        nomeLista
      )
      .eq(
        "ativo",
        true
      )
      .maybeSingle();


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  return (
    resultado.data ||
    null
  );

}


/* ==========================================
   ÚLTIMAS ATIVIDADES
========================================== */

async function buscarUltimasAtividadesResumo(
  tipoAtividade
) {

  const resultado =
    await window.supabaseClient
      .from(
        "atividades"
      )
      .select(`
        id,
        titulo,
        data,
        hora_inicio,
        tipo_atividade
      `)
      .eq(
        "tipo_atividade",
        tipoAtividade
      )
      .lte(
        "data",
        obterDataAtualISOResumoPresenca()
      )
      .order(
        "data",
        {
          ascending:
            false
        }
      )
      .order(
        "hora_inicio",
        {
          ascending:
            false
        }
      )
      .limit(
        10
      );


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  return (
    resultado.data ||
    []
  ).reverse();

}


/* ==========================================
   BUSCAR PRESENÇAS
========================================== */

async function buscarPresencasResumo(
  tipoListaId,
  atividades
) {

  if (
    !associadoAtual ||
    atividades.length === 0
  ) {

    return [];

  }


  const idsAtividades =
    atividades.map(
      (atividade) =>
        atividade.id
    );


  const resultado =
    await window.supabaseClient
      .from(
        "presencas"
      )
      .select(`
        atividade_id,
        usuario_id,
        status
      `)
      .eq(
        "tipo_lista_id",
        tipoListaId
      )
      .eq(
        "usuario_id",
        associadoAtual.id
      )
      .in(
        "atividade_id",
        idsAtividades
      );


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  return (
    resultado.data ||
    []
  );

}


/* ==========================================
   SITUAÇÃO DA PRESENÇA
========================================== */

function obterSituacaoResumoPresenca(
  atividade,
  presencas,
  dataEntradaLista
) {

  if (
    dataEntradaLista &&
    atividade.data <
    dataEntradaLista
  ) {

    return {

      texto:
        "x",

      tipo:
        "nao_participava",

      classe:
        "status-relatorio-nao-participava"

    };

  }


  const registro =
    presencas.find(
      (item) =>
        item.atividade_id ===
        atividade.id
    );


  if (
    registro?.status ===
    "presente"
  ) {

    return {

      texto:
        "P",

      tipo:
        "presente",

      classe:
        "status-relatorio-presente"

    };

  }


  if (
    registro?.status ===
    "falta"
  ) {

    return {

      texto:
        "F",

      tipo:
        "falta",

      classe:
        "status-relatorio-falta"

    };

  }


  if (
    registro?.status ===
    "justificada"
  ) {

    return {

      texto:
        "J",

      tipo:
        "justificada",

      classe:
        "status-relatorio-justificado"

    };

  }


  return {

    texto:
      "—",

    tipo:
      "pendente",

    classe:
      "status-relatorio-pendente"

  };

}


/* ==========================================
   RESUMO DA PRESENÇA
========================================== */

function calcularResumoPresencaLista(
  atividades,
  presencas,
  dataEntradaLista
) {

  let presentes =
    0;

  let faltas =
    0;

  let justificadas =
    0;


  atividades.forEach(
    (atividade) => {

      const situacao =
        obterSituacaoResumoPresenca(
          atividade,
          presencas,
          dataEntradaLista
        );


      if (
        situacao.tipo ===
        "presente"
      ) {

        presentes++;

      }


      if (
        situacao.tipo ===
        "falta"
      ) {

        faltas++;

      }


      if (
        situacao.tipo ===
        "justificada"
      ) {

        justificadas++;

      }

    }
  );


  const totalValidos =
    presentes +
    faltas +
    justificadas;


  return {

    presentes,

    faltas,

    justificadas,

    frequencia:
      totalValidos
        ? (
            presentes /
            totalValidos
          ) * 100
        : null

  };

}


/* ==========================================
   BLOCO DE PRESENÇA
========================================== */

function criarBlocoResumoPresenca(
  tipoLista,
  atividades,
  presencas
) {

  const bloco =
    document.createElement(
      "div"
    );

  bloco.className =
    "bloco-resumo-presenca-associado";


  const titulo =
    document.createElement(
      "h3"
    );

  titulo.className =
    "titulo-resumo-presenca-associado";

  titulo.textContent =
    tipoLista.nome;

  bloco.appendChild(
    titulo
  );


  if (
    atividades.length === 0
  ) {

    const mensagem =
      document.createElement(
        "p"
      );

    mensagem.className =
      "mensagem-sem-atividades";

    mensagem.textContent =
      "Nenhuma atividade realizada.";

    bloco.appendChild(
      mensagem
    );

    return bloco;

  }


  const dataEntradaLista =
    obterDataEntradaListaResumo(
      tipoLista.nome
    );


  const resumo =
    calcularResumoPresencaLista(
      atividades,
      presencas,
      dataEntradaLista
    );


  const container =
    document.createElement(
      "div"
    );

  container.className =
    "container-tabela-relatorio-presenca";


  const tabela =
    document.createElement(
      "table"
    );

  tabela.className =
    "tabela-relatorio-presenca tabela-resumo-presenca-associado";


  const thead =
    document.createElement(
      "thead"
    );

  const linhaCabecalho =
    document.createElement(
      "tr"
    );


  atividades.forEach(
    (atividade) => {

      const th =
        document.createElement(
          "th"
        );

      th.className =
        "coluna-data-relatorio";

      th.textContent =
        formatarDataCurtaResumoPresenca(
          atividade.data
        );

      th.title =
        atividade.titulo;

      linhaCabecalho.appendChild(
        th
      );

    }
  );


  [
    "P",
    "F",
    "J",
    "Freq."
  ].forEach(
    (texto) => {

      const th =
        document.createElement(
          "th"
        );

      th.className =
        "coluna-resumo-presenca-final";

      th.textContent =
        texto;

      linhaCabecalho.appendChild(
        th
      );

    }
  );


  thead.appendChild(
    linhaCabecalho
  );

  tabela.appendChild(
    thead
  );


  const tbody =
    document.createElement(
      "tbody"
    );

  const linha =
    document.createElement(
      "tr"
    );


  atividades.forEach(
    (atividade) => {

      const td =
        document.createElement(
          "td"
        );

      td.className =
        "celula-status-relatorio";


      const situacao =
        obterSituacaoResumoPresenca(
          atividade,
          presencas,
          dataEntradaLista
        );


      td.textContent =
        situacao.texto;


      if (
        situacao.classe
      ) {

        td.classList.add(
          situacao.classe
        );

      }


      linha.appendChild(
        td
      );

    }
  );


  const tdPresencas =
    document.createElement(
      "td"
    );

  tdPresencas.className =
    "valor-atividade-presente coluna-resumo-presenca-final";

  tdPresencas.textContent =
    String(
      resumo.presentes
    );

  linha.appendChild(
    tdPresencas
  );


  const tdFaltas =
    document.createElement(
      "td"
    );

  tdFaltas.className =
    "valor-atividade-falta coluna-resumo-presenca-final";

  tdFaltas.textContent =
    String(
      resumo.faltas
    );

  linha.appendChild(
    tdFaltas
  );


  const tdJustificadas =
    document.createElement(
      "td"
    );

  tdJustificadas.className =
    "valor-atividade-justificada coluna-resumo-presenca-final";

  tdJustificadas.textContent =
    String(
      resumo.justificadas
    );

  linha.appendChild(
    tdJustificadas
  );


  const tdFrequencia =
    document.createElement(
      "td"
    );

  tdFrequencia.className =
    "valor-frequencia-atividade coluna-resumo-presenca-frequencia";


  if (
    resumo.frequencia ===
    null
  ) {

    tdFrequencia.textContent =
      "—";

  } else {

    tdFrequencia.textContent =
      `${resumo.frequencia
        .toFixed(
          1
        )
        .replace(
          ".",
          ","
        )}%`;

  }


  linha.appendChild(
    tdFrequencia
  );

  tbody.appendChild(
    linha
  );

  tabela.appendChild(
    tbody
  );

  container.appendChild(
    tabela
  );

  bloco.appendChild(
    container
  );

  return bloco;

}


/* ==========================================
   CARREGAR RESUMO DE PRESENÇA
========================================== */

async function carregarResumoPresencaAssociado() {

  if (
    !associadoAtual
  ) {

    return;

  }


  listasResumoPresencaAssociado.innerHTML =
    "";


  const nomesListas =
    obterNomesListasAtuaisAssociado();


  if (
    nomesListas.length === 0
  ) {

    areaResumoPresencaAssociado.hidden =
      true;

    mensagemSemPresencaAssociado.hidden =
      false;

    return;

  }


  areaResumoPresencaAssociado.hidden =
    false;

  mensagemSemPresencaAssociado.hidden =
    true;


  for (
    const nomeLista of nomesListas
  ) {

    const tipoLista =
      await buscarTipoListaResumo(
        nomeLista
      );


    if (
      !tipoLista
    ) {

      continue;

    }


    const atividades =
      await buscarUltimasAtividadesResumo(
        tipoLista.tipo_atividade
      );


    const presencas =
      await buscarPresencasResumo(
        tipoLista.id,
        atividades
      );


    const bloco =
      criarBlocoResumoPresenca(
        tipoLista,
        atividades,
        presencas
      );


    listasResumoPresencaAssociado.appendChild(
      bloco
    );

  }


  if (
    listasResumoPresencaAssociado.children.length ===
    0
  ) {

    areaResumoPresencaAssociado.hidden =
      true;

    mensagemSemPresencaAssociado.hidden =
      false;

  }

}


/* ==========================================
   INICIAR PRESENÇA
========================================== */

async function iniciarResumoPresencaAssociado() {

  let tentativas =
    0;


  while (
    !associadoAtual &&
    tentativas < 100
  ) {

    await new Promise(
      (resolver) =>
        setTimeout(
          resolver,
          50
        )
    );

    tentativas++;

  }


  if (
    !associadoAtual
  ) {

    return;

  }


  try {

    await carregarResumoPresencaAssociado();

  } catch (erro) {

    console.error(
      "Erro ao carregar resumo de presença do associado:",
      erro
    );

    areaResumoPresencaAssociado.hidden =
      false;

    listasResumoPresencaAssociado.innerHTML =
      "<p>Não foi possível carregar as presenças deste associado.</p>";

  }

}


/* ==========================================
   EVENTOS DE DATA
========================================== */

[
  dataEntradaTufra,
  dataCorrenteDesenvolvimento,
  dataCorrentePrincipal,
  dataSaidaAssociado,
  dataRetornoAssociado
].forEach(
  (campo) => {

    if (
      campo
    ) {

      campo.addEventListener(
        "input",
        () =>
          aplicarMascaraData(
            campo
          )
      );

    }

  }
);


/* ==========================================
   EVENTOS DA EDIÇÃO
========================================== */

if (
  botaoEditarDadosAssociado
) {

  botaoEditarDadosAssociado.addEventListener(
    "click",
    abrirEdicaoDadosAssociado
  );

}


if (
  botaoCancelarEdicaoDadosAssociado
) {

  botaoCancelarEdicaoDadosAssociado.addEventListener(
    "click",
    cancelarEdicaoDadosAssociado
  );

}


if (
  botaoSalvarEdicaoDadosAssociado
) {

  botaoSalvarEdicaoDadosAssociado.addEventListener(
    "click",
    salvarDadosPrincipaisAssociado
  );

}


if (
  botaoEditarDatasAdministrativas
) {

  botaoEditarDatasAdministrativas.addEventListener(
    "click",
    abrirEdicaoDatas
  );

}


if (
  botaoCancelarDatasAdministrativas
) {

  botaoCancelarDatasAdministrativas.addEventListener(
    "click",
    cancelarEdicaoDatas
  );

}


if (
  botaoSalvarDatasAdministrativas
) {

  botaoSalvarDatasAdministrativas.addEventListener(
    "click",
    salvarDatasAdministrativas
  );

}


/* ==========================================
   EVENTOS BAIXA
========================================== */

if (
  botaoAbrirBaixaAssociado
) {

  botaoAbrirBaixaAssociado.addEventListener(
    "click",
    abrirBaixaAssociado
  );

}


if (
  botaoCancelarBaixaAssociado
) {

  botaoCancelarBaixaAssociado.addEventListener(
    "click",
    cancelarBaixaAssociado
  );

}


if (
  botaoConfirmarBaixaAssociado
) {

  botaoConfirmarBaixaAssociado.addEventListener(
    "click",
    confirmarBaixaAssociado
  );

}


/* ==========================================
   EVENTOS REATIVAÇÃO
========================================== */

if (
  botaoAbrirReativacaoAssociado
) {

  botaoAbrirReativacaoAssociado.addEventListener(
    "click",
    abrirReativacaoAssociado
  );

}


if (
  botaoCancelarReativacaoAssociado
) {

  botaoCancelarReativacaoAssociado.addEventListener(
    "click",
    cancelarReativacaoAssociado
  );

}


if (
  botaoConfirmarReativacaoAssociado
) {

  botaoConfirmarReativacaoAssociado.addEventListener(
    "click",
    confirmarReativacaoAssociado
  );

}


/* ==========================================
   EVENTOS FOTO
========================================== */

if (
  fotoAssociadoResumo
) {

  fotoAssociadoResumo.addEventListener(
    "click",
    abrirFotoAmpliada
  );

}


if (
  fecharModalFotoAssociado
) {

  fecharModalFotoAssociado.addEventListener(
    "click",
    fecharFotoAmpliada
  );

}


if (
  aumentarZoomFotoAssociado
) {

  aumentarZoomFotoAssociado.addEventListener(
    "click",
    aumentarZoom
  );

}


if (
  diminuirZoomFotoAssociado
) {

  diminuirZoomFotoAssociado.addEventListener(
    "click",
    diminuirZoom
  );

}


if (
  resetarZoomFotoAssociado
) {

  resetarZoomFotoAssociado.addEventListener(
    "click",
    resetarZoom
  );

}


if (
  areaZoomFotoAssociado
) {

  areaZoomFotoAssociado.addEventListener(
    "wheel",
    (evento) => {

      evento.preventDefault();

      if (
        evento.deltaY < 0
      ) {

        aumentarZoom();

      } else {

        diminuirZoom();

      }

    },
    {
      passive:
        false
    }
  );


  areaZoomFotoAssociado.addEventListener(
    "touchstart",
    (evento) => {

      if (
        evento.touches.length === 2
      ) {

        distanciaToqueInicial =
          calcularDistanciaToques(
            evento
          );

      }

    },
    {
      passive:
        false
    }
  );


  areaZoomFotoAssociado.addEventListener(
    "touchmove",
    (evento) => {

      if (
        evento.touches.length !== 2 ||
        !distanciaToqueInicial
      ) {

        return;

      }

      evento.preventDefault();


      const distanciaAtual =
        calcularDistanciaToques(
          evento
        );


      if (
        !distanciaAtual
      ) {

        return;

      }


      const diferenca =
        distanciaAtual -
        distanciaToqueInicial;


      if (
        Math.abs(
          diferenca
        ) < 8
      ) {

        return;

      }


      if (
        diferenca > 0
      ) {

        zoomFoto =
          Math.min(
            zoomFoto + 0.05,
            4
          );

      } else {

        zoomFoto =
          Math.max(
            zoomFoto - 0.05,
            1
          );

      }


      distanciaToqueInicial =
        distanciaAtual;

      aplicarZoomFoto();

    },
    {
      passive:
        false
    }
  );


  areaZoomFotoAssociado.addEventListener(
    "touchend",
    () => {

      distanciaToqueInicial =
        null;

    }
  );

}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

configurarVoltar();

carregarAssociado();

verificarPermissaoEdicaoAssociado();

verificarPermissaoAtendimentos();

verificarPermissaoBaixaAssociado();

iniciarResumoPresencaAssociado();
