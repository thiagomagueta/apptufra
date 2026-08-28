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
   BAIXA DO ASSOCIADO
========================================== */

const areaSituacaoAssociado =
  document.getElementById(
    "areaSituacaoAssociado"
  );

const textoSituacaoAssociado =
  document.getElementById(
    "textoSituacaoAssociado"
  );

const itemDataSaidaTufra =
  document.getElementById(
    "itemDataSaidaTufra"
  );

const textoDataSaidaTufra =
  document.getElementById(
    "textoDataSaidaTufra"
  );

const itemMotivoSaida =
  document.getElementById(
    "itemMotivoSaida"
  );

const textoMotivoSaida =
  document.getElementById(
    "textoMotivoSaida"
  );

const botaoAbrirBaixaAssociado =
  document.getElementById(
    "botaoAbrirBaixaAssociado"
  );

const areaBaixaAssociado =
  document.getElementById(
    "areaBaixaAssociado"
  );

const dataSaidaTufra =
  document.getElementById(
    "dataSaidaTufra"
  );

const motivoSaida =
  document.getElementById(
    "motivoSaida"
  );

const mensagemBaixaAssociado =
  document.getElementById(
    "mensagemBaixaAssociado"
  );

const botaoCancelarBaixaAssociado =
  document.getElementById(
    "botaoCancelarBaixaAssociado"
  );

const botaoConfirmarBaixaAssociado =
  document.getElementById(
    "botaoConfirmarBaixaAssociado"
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
   CAMPOS DE VISUALIZAÇÃO
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


/* ==========================================
   CAMPOS DE EDIÇÃO
========================================== */

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
   HISTÓRICO
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
   FOTO AMPLIADA
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


let zoomFoto =
  1;

let distanciaToqueInicial =
  null;


/* ==========================================
   ESTADO
========================================== */

let associadoAtual =
  null;

let funcoesAtuais =
  [];

let historicoFuncoes =
  [];


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
      )

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
    origem ===
    "carometro"
  ) {

    voltarAssociados.href =
      "carometro.html";

  } else {

    voltarAssociados.href =
      "lista-associados.html";

  }
}


/* ==========================================
   FORMATAR NOME
========================================== */

function formatarNome(
  nome
) {

  if (
    !nome
  ) {

    return "Associado";

  }


  return nome
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(
      (parte) =>
        parte
          ? parte[0].toUpperCase() +
            parte.slice(1)
          : ""
    )
    .join(" ");
}


/* ==========================================
   FORMATAR DATA
========================================== */

function formatarDataExibicao(
  valor
) {

  if (
    !valor
  ) {

    return "";

  }


  const partes =
    String(
      valor
    )
      .slice(
        0,
        10
      )
      .split("-");


  if (
    partes.length !== 3
  ) {

    return valor;

  }


  return (
    partes[2] +
    "/" +
    partes[1] +
    "/" +
    partes[0]
  );
}


/* ==========================================
   DATA PARA BANCO
========================================== */

function converterDataParaBanco(
  valor
) {

  if (
    !valor
  ) {

    return null;

  }


  const partes =
    valor.split("/");


  if (
    partes.length !== 3
  ) {

    return null;

  }


  const dia =
    partes[0];

  const mes =
    partes[1];

  const ano =
    partes[2];


  if (
    dia.length !== 2 ||
    mes.length !== 2 ||
    ano.length !== 4
  ) {

    return null;

  }


  return (
    ano +
    "-" +
    mes +
    "-" +
    dia
  );
}


/* ==========================================
   MÁSCARA DATA
========================================== */

function aplicarMascaraData(
  campo
) {

  let valor =
    campo.value.replace(
      /\D/g,
      ""
    );


  if (
    valor.length > 8
  ) {

    valor =
      valor.slice(
        0,
        8
      );

  }


  if (
    valor.length >= 5
  ) {

    valor =
      valor.slice(
        0,
        2
      ) +
      "/" +
      valor.slice(
        2,
        4
      ) +
      "/" +
      valor.slice(
        4
      );

  } else if (
    valor.length >= 3
  ) {

    valor =
      valor.slice(
        0,
        2
      ) +
      "/" +
      valor.slice(
        2
      );

  }


  campo.value =
    valor;
}


/* ==========================================
   VALIDAR DATA
========================================== */

function dataValida(
  valor
) {

  if (
    !valor
  ) {

    return true;

  }


  const partes =
    valor.split("/");


  if (
    partes.length !== 3
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


  return (
    data.getFullYear() ===
      ano &&
    data.getMonth() ===
      mes - 1 &&
    data.getDate() ===
      dia
  );
}


/* ==========================================
   ADICIONAR ITEM AO RESUMO
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
    valor ||
    "Não informado";


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
   FUNÇÕES ATUAIS
========================================== */

function obterNomesFuncoesAtuais() {

  return funcoesAtuais
    .map(
      (funcao) =>
        funcao.nome
    )
    .filter(
      Boolean
    );
}


/* ==========================================
   VERIFICAÇÕES DE FUNÇÃO
========================================== */

function possuiFuncao(
  nome
) {

  return obterNomesFuncoesAtuais()
    .includes(
      nome
    );
}


function mostrarTrajetoriaMediunica() {

  return (
    possuiFuncao(
      "Médium Principal"
    ) ||
    possuiFuncao(
      "Médium Desenvolvimento"
    )
  );
}


/* ==========================================
   ATUALIZAR DATAS
========================================== */

function atualizarVisualizacaoDatas() {

  if (
    !associadoAtual
  ) {

    return;

  }


  textoDataEntradaTufra.textContent =
    formatarDataExibicao(
      associadoAtual
        .data_entrada_tufra
    ) ||
    "Não informado";


  const mostrarMediunidade =
    mostrarTrajetoriaMediunica();


  itemDataCorrenteDesenvolvimento.hidden =
    !mostrarMediunidade;


  itemDataCorrentePrincipal.hidden =
    !mostrarMediunidade;


  campoEdicaoCorrenteDesenvolvimento.hidden =
    !mostrarMediunidade;


  campoEdicaoCorrentePrincipal.hidden =
    !mostrarMediunidade;


  if (
    mostrarMediunidade
  ) {

    textoDataCorrenteDesenvolvimento.textContent =
      formatarDataExibicao(
        associadoAtual
          .data_corrente_desenvolvimento
      ) ||
      "Não informado";


    textoDataCorrentePrincipal.textContent =
      formatarDataExibicao(
        associadoAtual
          .data_corrente_principal
      ) ||
      "Não informado";

  }


  avisoAssociadoAssistencia.hidden =
    (
      mostrarMediunidade
    );
}


/* ==========================================
   HISTÓRICO DE FUNÇÕES
========================================== */

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


  historicoFuncoes.forEach(
    (registro) => {

      const item =
        document.createElement(
          "div"
        );


      item.className =
        "item-historico-funcao";


      const titulo =
        document.createElement(
          "strong"
        );


      titulo.textContent =
        registro.funcao_nome;


      const periodo =
        document.createElement(
          "span"
        );


      const inicio =
        formatarDataExibicao(
          registro.data_inicio
        );


      const fim =
        registro.data_fim
          ? formatarDataExibicao(
              registro.data_fim
            )
          : "Atual";


      periodo.textContent =
        (
          inicio ||
          "Não informado"
        ) +
        " até " +
        fim;


      item.appendChild(
        titulo
      );


      item.appendChild(
        periodo
      );


      listaHistoricoFuncoes.appendChild(
        item
      );

    }
  );
}


/* ==========================================
   EDITAR DATAS
========================================== */

function abrirEdicaoDatas() {

  if (
    !associadoAtual
  ) {

    return;

  }


  dataEntradaTufra.value =
    formatarDataExibicao(
      associadoAtual
        .data_entrada_tufra
    );


  dataCorrenteDesenvolvimento.value =
    formatarDataExibicao(
      associadoAtual
        .data_corrente_desenvolvimento
    );


  dataCorrentePrincipal.value =
    formatarDataExibicao(
      associadoAtual
        .data_corrente_principal
    );


  mensagemDatasAdministrativas.hidden =
    true;


  mensagemDatasAdministrativas.textContent =
    "";


  visualizacaoDatasAdministrativas.hidden =
    true;


  edicaoDatasAdministrativas.hidden =
    false;


  botaoEditarDatasAdministrativas.hidden =
    true;


  renderizarEdicaoHistoricoFuncoes();
}


/* ==========================================
   CANCELAR EDIÇÃO
========================================== */

function cancelarEdicaoDatas() {

  edicaoDatasAdministrativas.hidden =
    true;


  visualizacaoDatasAdministrativas.hidden =
    false;


  botaoEditarDatasAdministrativas.hidden =
    false;


  mensagemDatasAdministrativas.hidden =
    true;


  mensagemDatasAdministrativas.textContent =
    "";
}


/* ==========================================
   EDIÇÃO DO HISTÓRICO
========================================== */

function renderizarEdicaoHistoricoFuncoes() {

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


  historicoFuncoes.forEach(
    (
      registro,
      indice
    ) => {

      const bloco =
        document.createElement(
          "div"
        );


      bloco.className =
        "item-edicao-historico-funcao";


      const titulo =
        document.createElement(
          "strong"
        );


      titulo.textContent =
        registro.funcao_nome;


      bloco.appendChild(
        titulo
      );


      const linhaDatas =
        document.createElement(
          "div"
        );


      linhaDatas.className =
        "linha-edicao-historico-funcao";


      const grupoInicio =
        document.createElement(
          "div"
        );


      grupoInicio.className =
        "campo-data-administrativa";


      const labelInicio =
        document.createElement(
          "label"
        );


      labelInicio.textContent =
        "Início";


      const inputInicio =
        document.createElement(
          "input"
        );


      inputInicio.type =
        "text";


      inputInicio.inputMode =
        "numeric";


      inputInicio.maxLength =
        10;


      inputInicio.placeholder =
        "DD/MM/AAAA";


      inputInicio.value =
        formatarDataExibicao(
          registro.data_inicio
        );


      inputInicio.addEventListener(
        "input",
        () => {

          aplicarMascaraData(
            inputInicio
          );

        }
      );


      inputInicio.dataset.indice =
        String(
          indice
        );


      inputInicio.dataset.tipo =
        "inicio";


      grupoInicio.appendChild(
        labelInicio
      );


      grupoInicio.appendChild(
        inputInicio
      );


      linhaDatas.appendChild(
        grupoInicio
      );


      const grupoFim =
        document.createElement(
          "div"
        );


      grupoFim.className =
        "campo-data-administrativa";


      const labelFim =
        document.createElement(
          "label"
        );


      labelFim.textContent =
        "Fim";


      const inputFim =
        document.createElement(
          "input"
        );


      inputFim.type =
        "text";


      inputFim.inputMode =
        "numeric";


      inputFim.maxLength =
        10;


      inputFim.placeholder =
        "DD/MM/AAAA";


      inputFim.value =
        formatarDataExibicao(
          registro.data_fim
        );


      inputFim.addEventListener(
        "input",
        () => {

          aplicarMascaraData(
            inputFim
          );

        }
      );


      inputFim.dataset.indice =
        String(
          indice
        );


      inputFim.dataset.tipo =
        "fim";


      grupoFim.appendChild(
        labelFim
      );


      grupoFim.appendChild(
        inputFim
      );


      linhaDatas.appendChild(
        grupoFim
      );


      bloco.appendChild(
        linhaDatas
      );


      listaEdicaoHistoricoFuncoes.appendChild(
        bloco
      );

    }
  );
}


/* ==========================================
   SALVAR HISTÓRICO
========================================== */

async function salvarHistoricoFuncoes() {

  const inputs =
    listaEdicaoHistoricoFuncoes
      .querySelectorAll(
        "input"
      );


  for (
    const input of inputs
  ) {

    const indice =
      Number(
        input.dataset.indice
      );


    const tipo =
      input.dataset.tipo;


    const registro =
      historicoFuncoes[indice];


    if (
      !registro
    ) {

      continue;

    }


    const valor =
      input.value.trim();


    if (
      valor &&
      !dataValida(
        valor
      )
    ) {

      throw new Error(
        "Data inválida no histórico de funções."
      );

    }


    const valorBanco =
      valor
        ? converterDataParaBanco(
            valor
          )
        : null;


    if (
      tipo === "inicio"
    ) {

      registro.data_inicio =
        valorBanco;

    }


    if (
      tipo === "fim"
    ) {

      registro.data_fim =
        valorBanco;

    }

  }


  for (
    const registro of historicoFuncoes
  ) {

    const resultado =
      await window.supabaseClient
        .from(
          "historico_funcoes_associado"
        )
        .update({
          data_inicio:
            registro.data_inicio,
          data_fim:
            registro.data_fim
        })
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
}


/* ==========================================
   SALVAR DATAS
========================================== */

async function salvarDatasAdministrativas() {

  if (
    !associadoAtual
  ) {

    return;

  }


  mensagemDatasAdministrativas.hidden =
    true;


  mensagemDatasAdministrativas.textContent =
    "";


  const entradaTexto =
    dataEntradaTufra.value.trim();


  const desenvolvimentoTexto =
    dataCorrenteDesenvolvimento.value.trim();


  const principalTexto =
    dataCorrentePrincipal.value.trim();


  if (
    entradaTexto &&
    !dataValida(
      entradaTexto
    )
  ) {

    mensagemDatasAdministrativas.textContent =
      "Informe uma data de entrada válida.";


    mensagemDatasAdministrativas.hidden =
      false;

    return;

  }


  if (
    mostrarTrajetoriaMediunica() &&
    desenvolvimentoTexto &&
    !dataValida(
      desenvolvimentoTexto
    )
  ) {

    mensagemDatasAdministrativas.textContent =
      "Informe uma data válida para a Corrente de Desenvolvimento.";


    mensagemDatasAdministrativas.hidden =
      false;

    return;

  }


  if (
    mostrarTrajetoriaMediunica() &&
    principalTexto &&
    !dataValida(
      principalTexto
    )
  ) {

    mensagemDatasAdministrativas.textContent =
      "Informe uma data válida para a Corrente Principal.";


    mensagemDatasAdministrativas.hidden =
      false;

    return;

  }


  const entrada =
    entradaTexto
      ? converterDataParaBanco(
          entradaTexto
        )
      : null;


  const desenvolvimento =
    desenvolvimentoTexto
      ? converterDataParaBanco(
          desenvolvimentoTexto
        )
      : null;


  const principal =
    principalTexto
      ? converterDataParaBanco(
          principalTexto
        )
      : null;


  try {

    botaoSalvarDatasAdministrativas.disabled =
      true;


    botaoSalvarDatasAdministrativas.textContent =
      "Salvando...";


    const atualizacao = {

      data_entrada_tufra:
        entrada

    };


    if (
      mostrarTrajetoriaMediunica()
    ) {

      atualizacao.data_corrente_desenvolvimento =
        desenvolvimento;


      atualizacao.data_corrente_principal =
        principal;

    }


    const resultado =
      await window.supabaseClient
        .from(
          "usuarios"
        )
        .update(
          atualizacao
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
          data_entrada_tufra,
          data_corrente_desenvolvimento,
          data_corrente_principal,
          status,
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


    const usuario =
      resultadoUsuario.data;


    associadoAtual =
      usuario;


    funcoesAtuais =
      (
        usuario.usuario_funcoes ||
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


    const dadosPessoais =
      ficha.dados_pessoais ||
      {};


    const enderecoContato =
      ficha.endereco_contato ||
      {};


    const historicoUmbanda =
      ficha.historico_umbanda ||
      {};


    const nome =
      formatarNome(
        usuario.nome_completo ||
        dadosPessoais.nome
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
      dadosPessoais.nascimento
    );


    adicionarItem(
      "Celular",
      enderecoContato.celular
    );


    adicionarItem(
      "Orixá de Frente",
      historicoUmbanda.orixaFrente
    );


    adicionarItem(
      "Orixá Adjunto",
      historicoUmbanda.orixaAdjunto
    );


    atualizarVisualizacaoDatas();

    atualizarSituacaoAssociado();

    renderizarHistoricoFuncoes();


    botaoCadastroCompleto.href =
      `associado-ficha.html?id=${associadoId}&origem=${origem}`;


    botaoVerJustificativasAssociado.href =
      `relatorio-justificativas.html?id=${associadoId}&modo=justificativas`;


    if (
      usuario.foto_path
    ) {

      const resultadoFoto =
        await window.supabaseClient.storage
          .from(
            "fotos-associados"
          )
          .createSignedUrl(
            usuario.foto_path,
            60 * 60
          );


      if (
        resultadoFoto.error
      ) {

        console.error(
          "Erro ao carregar foto:",
          resultadoFoto.error
        );

      } else {

        fotoAssociadoResumo.src =
          resultadoFoto.data.signedUrl;


        fotoAssociadoResumo.hidden =
          false;


        fotoAssociadoResumoPadrao.hidden =
          true;


        fotoAssociadoAmpliada.src =
          resultadoFoto.data.signedUrl;

      }

    }


  } catch (erro) {

    console.error(
      "Erro ao carregar associado:",
      erro
    );


    mensagemAssociadoResumo.textContent =
      "Não foi possível carregar os dados do associado.";


    mensagemAssociadoResumo.hidden =
      false;

  }
}


/* ==========================================
   PERMISSÃO DE ATENDIMENTOS
========================================== */

async function verificarPermissaoAtendimentos() {

  if (
    !window.supabaseClient
  ) {

    return;

  }


  try {

    const resultado =
      await window.supabaseClient
        .rpc(
          "usuario_pode_acessar_atendimentos"
        );


    if (
      resultado.error
    ) {

      return;

    }


    if (
      resultado.data === true
    ) {

      const {
        associadoId
      } =
        obterParametros();


      botaoHistoricoAtendimentosAssociado.hidden =
        false;


      botaoHistoricoAtendimentosAssociado.href =
        `atendimentos-pessoa.html?associado_id=${associadoId}`;

    }

  } catch (erro) {

    console.error(
      "Erro ao verificar permissão de atendimentos:",
      erro
    );

  }
}


/* ==========================================
   FOTO AMPLIADA
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
    !fotoAssociadoResumo.src
  ) {

    return;

  }


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


  aplicarZoomFoto();
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


  const distanciaX =
    toque2.clientX -
    toque1.clientX;


  const distanciaY =
    toque2.clientY -
    toque1.clientY;


  return Math.hypot(
    distanciaX,
    distanciaY
  );
}


/* ==========================================
   SITUAÇÃO / BAIXA DO ASSOCIADO
========================================== */

function obterDataHojeIso() {

  const agora =
    new Date();

  const ano =
    agora.getFullYear();

  const mes =
    String(
      agora.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const dia =
    String(
      agora.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${ano}-${mes}-${dia}`;
}


function atualizarSituacaoAssociado() {

  if (
    !associadoAtual ||
    !textoSituacaoAssociado
  ) {

    return;

  }


  const inativo =
    associadoAtual.status ===
    "inativo";


  textoSituacaoAssociado.textContent =
    inativo
      ? "Inativo"
      : "Ativo";


  if (
    inativo
  ) {

    itemDataSaidaTufra.hidden =
      false;

    itemMotivoSaida.hidden =
      false;

    textoDataSaidaTufra.textContent =
      formatarDataExibicao(
        associadoAtual.data_saida_tufra
      ) ||
      "Não informado";

    textoMotivoSaida.textContent =
      associadoAtual.motivo_saida ||
      "Não informado";

    botaoAbrirBaixaAssociado.hidden =
      true;

    areaBaixaAssociado.hidden =
      true;

    return;

  }


  itemDataSaidaTufra.hidden =
    true;

  itemMotivoSaida.hidden =
    true;

  botaoAbrirBaixaAssociado.hidden =
    false;
}


function abrirBaixaAssociado() {

  mensagemBaixaAssociado.hidden =
    true;

  mensagemBaixaAssociado.textContent =
    "";

  dataSaidaTufra.value =
    obterDataHojeIso();

  motivoSaida.value =
    "";

  areaBaixaAssociado.hidden =
    false;

  botaoAbrirBaixaAssociado.hidden =
    true;
}


function cancelarBaixaAssociado() {

  areaBaixaAssociado.hidden =
    true;

  botaoAbrirBaixaAssociado.hidden =
    false;

  mensagemBaixaAssociado.hidden =
    true;

  mensagemBaixaAssociado.textContent =
    "";
}


async function confirmarBaixaAssociado() {

  if (
    !associadoAtual
  ) {

    return;

  }


  const dataSaida =
    dataSaidaTufra.value;

  const motivo =
    motivoSaida.value.trim();


  mensagemBaixaAssociado.hidden =
    true;


  if (
    !dataSaida
  ) {

    mensagemBaixaAssociado.textContent =
      "Informe a data da saída.";

    mensagemBaixaAssociado.hidden =
      false;

    return;

  }


  if (
    dataSaida > obterDataHojeIso()
  ) {

    mensagemBaixaAssociado.textContent =
      "A data da saída não pode ser futura.";

    mensagemBaixaAssociado.hidden =
      false;

    return;

  }


  if (
    associadoAtual.data_entrada_tufra &&
    dataSaida < associadoAtual.data_entrada_tufra
  ) {

    mensagemBaixaAssociado.textContent =
      "A data da saída não pode ser anterior à data de entrada na TUFRA.";

    mensagemBaixaAssociado.hidden =
      false;

    return;

  }


  if (
    !motivo
  ) {

    mensagemBaixaAssociado.textContent =
      "Informe o motivo da saída.";

    mensagemBaixaAssociado.hidden =
      false;

    return;

  }


  const confirmar =
    window.confirm(
      "Confirma a baixa deste associado?\n\nA ficha ficará inativa e o associado perderá o acesso ao APP. O histórico será mantido."
    );


  if (
    !confirmar
  ) {

    return;

  }


  try {

    botaoConfirmarBaixaAssociado.disabled =
      true;

    botaoConfirmarBaixaAssociado.textContent =
      "Salvando...";


    const resultado =
      await window.supabaseClient
        .from(
          "usuarios"
        )
        .update({
          status:
            "inativo",
          data_saida_tufra:
            dataSaida,
          motivo_saida:
            motivo
        })
        .eq(
          "id",
          associadoAtual.id
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


    atualizarSituacaoAssociado();


    mensagemAssociadoResumo.textContent =
      "Baixa do associado registrada com sucesso.";

    mensagemAssociadoResumo.hidden =
      false;


  } catch (erro) {

    console.error(
      "Erro ao dar baixa no associado:",
      erro
    );

    mensagemBaixaAssociado.textContent =
      "Não foi possível registrar a baixa do associado.";

    mensagemBaixaAssociado.hidden =
      false;


  } finally {

    botaoConfirmarBaixaAssociado.disabled =
      false;

    botaoConfirmarBaixaAssociado.textContent =
      "Confirmar baixa";

  }
}


/* ==========================================
   EVENTOS
========================================== */

dataEntradaTufra.addEventListener(
  "input",
  () => {

    aplicarMascaraData(
      dataEntradaTufra
    );

  }
);


dataCorrenteDesenvolvimento.addEventListener(
  "input",
  () => {

    aplicarMascaraData(
      dataCorrenteDesenvolvimento
    );

  }
);


dataCorrentePrincipal.addEventListener(
  "input",
  () => {

    aplicarMascaraData(
      dataCorrentePrincipal
    );

  }
);


botaoEditarDatasAdministrativas.addEventListener(
  "click",
  abrirEdicaoDatas
);


botaoCancelarDatasAdministrativas.addEventListener(
  "click",
  cancelarEdicaoDatas
);


botaoSalvarDatasAdministrativas.addEventListener(
  "click",
  salvarDatasAdministrativas
);


botaoAbrirBaixaAssociado.addEventListener(
  "click",
  abrirBaixaAssociado
);


botaoCancelarBaixaAssociado.addEventListener(
  "click",
  cancelarBaixaAssociado
);


botaoConfirmarBaixaAssociado.addEventListener(
  "click",
  confirmarBaixaAssociado
);


fotoAssociadoResumo.addEventListener(
  "click",
  abrirFotoAmpliada
);


fecharModalFotoAssociado.addEventListener(
  "click",
  fecharFotoAmpliada
);


aumentarZoomFotoAssociado.addEventListener(
  "click",
  aumentarZoom
);


diminuirZoomFotoAssociado.addEventListener(
  "click",
  diminuirZoom
);


resetarZoomFotoAssociado.addEventListener(
  "click",
  resetarZoom
);


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


/* ==========================================
   INICIALIZAÇÃO
========================================== */

configurarVoltar();

carregarAssociado();

verificarPermissaoAtendimentos();


/* ==========================================
   PRESENÇA NO RESUMO DO ASSOCIADO
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


function obterNomesListasAtuaisAssociado() {

  const nomes =
    [];


  if (
    possuiFuncao(
      "Médium Principal"
    )
  ) {

    nomes.push(
      "Corrente Principal"
    );

  }


  if (
    possuiFuncao(
      "Médium Desenvolvimento"
    )
  ) {

    nomes.push(
      "Desenvolvimento"
    );

  }


  return nomes;
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

    return associadoAtual
      .data_corrente_principal;

  }


  if (
    nomeLista ===
    "Desenvolvimento"
  ) {

    return associadoAtual
      .data_corrente_desenvolvimento;

  }


  return associadoAtual
    .data_entrada_tufra;
}


function normalizarDataResumoPresenca(
  valor
) {

  if (
    !valor
  ) {

    return null;

  }


  const texto =
    String(
      valor
    )
      .slice(
        0,
        10
      );


  const partes =
    texto.split(
      "-"
    );


  if (
    partes.length !== 3
  ) {

    return null;

  }


  const ano =
    Number(
      partes[0]
    );

  const mes =
    Number(
      partes[1]
    );

  const dia =
    Number(
      partes[2]
    );


  if (
    !ano ||
    !mes ||
    !dia
  ) {

    return null;

  }


  return new Date(
    ano,
    mes - 1,
    dia
  );
}


function dataAtividadeEhAnteriorEntradaResumo(
  dataAtividade,
  dataEntrada
) {

  const atividade =
    normalizarDataResumoPresenca(
      dataAtividade
    );


  const entrada =
    normalizarDataResumoPresenca(
      dataEntrada
    );


  if (
    !atividade ||
    !entrada
  ) {

    return false;

  }


  return (
    atividade <
    entrada
  );
}


function formatarDataCurtaResumoPresenca(
  valor
) {

  const data =
    normalizarDataResumoPresenca(
      valor
    );


  if (
    !data
  ) {

    return "-";

  }


  return (
    String(
      data.getDate()
    ).padStart(
      2,
      "0"
    ) +
    "/" +
    String(
      data.getMonth() + 1
    ).padStart(
      2,
      "0"
    )
  );
}


function obterSituacaoResumoPresenca(
  atividade,
  presencas,
  dataEntradaLista
) {

  if (
    dataAtividadeEhAnteriorEntradaResumo(
      atividade.data,
      dataEntradaLista
    )
  ) {

    return {
      tipo:
        "antes",
      texto:
        "—"
    };

  }


  const registro =
    presencas.find(
      (presenca) =>
        presenca.atividade_id ===
        atividade.id
    );


  if (
    !registro
  ) {

    return {
      tipo:
        "pendente",
      texto:
        "Pendente"
    };

  }


  if (
    registro.status ===
    "presente"
  ) {

    return {
      tipo:
        "presente",
      texto:
        "Presente"
    };

  }


  if (
    registro.status ===
      "justificada" ||
    registro.status ===
      "justificado"
  ) {

    return {
      tipo:
        "justificada",
      texto:
        "Justificado"
    };

  }


  return {
    tipo:
      "falta",
    texto:
      "Falta"
  };
}


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
        ativo
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


  return resultado.data ||
    null;
}


async function buscarUltimasAtividadesResumo(
  tipoAtividade
) {

  const hoje =
    new Date();


  const dataHoje =
    [
      hoje.getFullYear(),
      String(
        hoje.getMonth() + 1
      ).padStart(
        2,
        "0"
      ),
      String(
        hoje.getDate()
      ).padStart(
        2,
        "0"
      )
    ].join(
      "-"
    );


  const resultado =
    await window.supabaseClient
      .from(
        "atividades"
      )
      .select(`
        id,
        data,
        titulo,
        tipo_atividade
      `)
      .eq(
        "tipo_atividade",
        tipoAtividade
      )
      .lte(
        "data",
        dataHoje
      )
      .order(
        "data",
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
        id,
        atividade_id,
        status
      `)
      .eq(
        "usuario_id",
        associadoAtual.id
      )
      .eq(
        "tipo_lista_id",
        tipoListaId
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


  return resultado.data ||
    [];
}


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


  let frequencia =
    null;


  if (
    totalValidos > 0
  ) {

    frequencia =
      (
        presentes /
        totalValidos
      ) * 100;

  }


  return {
    presentes,
    faltas,
    justificadas,
    frequencia
  };
}


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


      const situacao =
        obterSituacaoResumoPresenca(
          atividade,
          presencas,
          dataEntradaLista
        );


      td.className =
        `situacao-resumo-presenca situacao-resumo-presenca-${situacao.tipo}`;


      td.textContent =
        situacao.tipo ===
          "presente"
          ? "P"
          : situacao.tipo ===
              "falta"
            ? "F"
            : situacao.tipo ===
                "justificada"
              ? "J"
              : situacao.tipo ===
                  "pendente"
                ? "?"
                : "—";


      td.title =
        situacao.texto;


      linha.appendChild(
        td
      );

    }
  );


  const tdPresentes =
    document.createElement(
      "td"
    );


  tdPresentes.className =
    "valor-atividade-presente coluna-resumo-presenca-final";


  tdPresentes.textContent =
    String(
      resumo.presentes
    );


  linha.appendChild(
    tdPresentes
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


iniciarResumoPresencaAssociado();
