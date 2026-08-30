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

const areaBaixaAssociado = document.getElementById("areaBaixaAssociado");
const areaAssociadoAtivo = document.getElementById("areaAssociadoAtivo");
const areaAssociadoInativo = document.getElementById("areaAssociadoInativo");
const botaoAbrirBaixaAssociado = document.getElementById("botaoAbrirBaixaAssociado");
const formularioBaixaAssociado = document.getElementById("formularioBaixaAssociado");
const dataSaidaAssociado = document.getElementById("dataSaidaAssociado");
const motivoSaidaAssociado = document.getElementById("motivoSaidaAssociado");
const botaoCancelarBaixaAssociado = document.getElementById("botaoCancelarBaixaAssociado");
const botaoConfirmarBaixaAssociado = document.getElementById("botaoConfirmarBaixaAssociado");
const mensagemBaixaAssociado = document.getElementById("mensagemBaixaAssociado");
const textoDataSaidaAssociado = document.getElementById("textoDataSaidaAssociado");
const textoMotivoSaidaAssociado = document.getElementById("textoMotivoSaidaAssociado");


/* ==========================================
   REATIVAÇÃO DO ASSOCIADO
========================================== */

const botaoAbrirReativacaoAssociado =
  document.getElementById("botaoAbrirReativacaoAssociado");

const formularioReativacaoAssociado =
  document.getElementById("formularioReativacaoAssociado");

const dataRetornoAssociado =
  document.getElementById("dataRetornoAssociado");

const observacaoRetornoAssociado =
  document.getElementById("observacaoRetornoAssociado");

const mensagemReativacaoAssociado =
  document.getElementById("mensagemReativacaoAssociado");

const botaoCancelarReativacaoAssociado =
  document.getElementById("botaoCancelarReativacaoAssociado");

const botaoConfirmarReativacaoAssociado =
  document.getElementById("botaoConfirmarReativacaoAssociado");


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
   DADOS
========================================== */

let associadoAtual =
  null;

let funcoesAtuais =
  [];

let historicoFuncoes =
  [];

let podeDarBaixaAssociado =
  false;


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
   DATA ISO -> DD/MM/AAAA
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


  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


/* ==========================================
   DATA ISO -> CAMPO
========================================== */

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


  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


/* ==========================================
   MÁSCARA DD/MM/AAAA
========================================== */

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


/* ==========================================
   DD/MM/AAAA -> ISO
========================================== */

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
    !ano ||
    partes[2].length !== 4
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


  const diaISO =
    String(
      dia
    ).padStart(
      2,
      "0"
    );


  const mesISO =
    String(
      mes
    ).padStart(
      2,
      "0"
    );


  return `${ano}-${mesISO}-${diaISO}`;
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
   PERMISSÃO DE ATENDIMENTOS
========================================== */

async function verificarPermissaoAtendimentos() {

  botaoHistoricoAtendimentosAssociado.hidden =
    true;


  try {

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
          resultadoUsuario.data.id
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
   PERMISSÃO PARA DAR BAIXA
========================================== */

async function verificarPermissaoBaixaAssociado() {

  podeDarBaixaAssociado =
    false;


  atualizarAreaBaixaAssociado();


  try {

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
          resultadoUsuario.data.id
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
   HISTÓRICO - ORDENAÇÃO
========================================== */

function ordenarHistorico(
  historico
) {

  const ordemFuncoes = {
    "Ogam": 1,
    "Cambone": 2,
    "Cantina": 3
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


/* ==========================================
   HISTÓRICO - TEXTO
========================================== */

function formatarPeriodoHistorico(
  registro
) {

  const inicio =
    formatarData(
      registro.data_inicio
    );


  if (
    !registro.data_fim
  ) {

    return `Desde ${inicio}`;

  }


  return `${inicio} a ${formatarData(
    registro.data_fim
  )}`;
}


/* ==========================================
   RENDERIZAR HISTÓRICO
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


      const registros =
        historicoOrdenado.filter(
          (registro) =>
            registro.funcao_nome ===
            funcaoNome
        );


      registros.forEach(
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
   RENDERIZAR HISTÓRICO PARA EDIÇÃO
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
        "Data de entrada";


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

      inputInicio.autocomplete =
        "off";

      inputInicio.placeholder =
        "dd/mm/aaaa";

      inputInicio.className =
        "historico-data-inicio";


      inputInicio.value =
        dataISOParaCampo(
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


      grupoInicio.appendChild(
        labelInicio
      );


      grupoInicio.appendChild(
        inputInicio
      );


      bloco.appendChild(
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
        "Data de saída";


      grupoFim.appendChild(
        labelFim
      );


      if (
        registro.data_fim
      ) {

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

        inputFim.autocomplete =
          "off";

        inputFim.placeholder =
          "dd/mm/aaaa";

        inputFim.className =
          "historico-data-fim";


        inputFim.value =
          dataISOParaCampo(
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


        grupoFim.appendChild(
          inputFim
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


        grupoFim.appendChild(
          atual
        );

      }


      bloco.appendChild(
        grupoFim
      );


      listaEdicaoHistoricoFuncoes.appendChild(
        bloco
      );

    }
  );
}


/* ==========================================
   ABRIR EDIÇÃO
========================================== */

function abrirEdicaoDatas() {

  if (
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


  renderizarHistoricoFuncoes();
}


/* ==========================================
   LER DATAS PRINCIPAIS
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

    return "Informe uma data válida para a entrada na TUFRA.";

  }


  if (
    mostrarTrajetoriaMediunica()
  ) {

    if (
      desenvolvimento === false
    ) {

      return "Informe uma data válida para a Corrente do Desenvolvimento.";

    }


    if (
      principal === false
    ) {

      return "Informe uma data válida para a Corrente Principal.";

    }


    if (
      entrada &&
      desenvolvimento &&
      desenvolvimento < entrada
    ) {

      return "A data da Corrente do Desenvolvimento não pode ser anterior à entrada na TUFRA.";

    }


    if (
      entrada &&
      principal &&
      principal < entrada
    ) {

      return "A data da Corrente Principal não pode ser anterior à entrada na TUFRA.";

    }


    if (
      desenvolvimento &&
      principal &&
      principal < desenvolvimento
    ) {

      return "A data da Corrente Principal não pode ser anterior à Corrente do Desenvolvimento.";

    }

  }


  return "";
}


/* ==========================================
   LER HISTÓRICO
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
          registroOriginal?.funcao_nome ||
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
            registroOriginal?.data_fim
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

      return `Informe uma data de entrada válida para ${registro.funcao_nome}.`;

    }


    if (
      !registro.data_inicio
    ) {

      return `A data de entrada de ${registro.funcao_nome} é obrigatória.`;

    }


    if (
      registro.data_fim === false
    ) {

      return `Informe uma data de saída válida para ${registro.funcao_nome}.`;

    }


    if (
      entradaTufra &&
      registro.data_inicio <
        entradaTufra
    ) {

      return `A entrada em ${registro.funcao_nome} não pode ser anterior à entrada na TUFRA.`;

    }


    if (
      registro.data_fim &&
      registro.data_fim <
        registro.data_inicio
    ) {

      return `A saída de ${registro.funcao_nome} não pode ser anterior à entrada na função.`;

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
        new Date().toISOString()

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
            registroEditado.possuiDataFimOriginal
              ? registroEditado.data_fim
              : registroOriginal.data_fim

        };

      }
    );
}


/* ==========================================
   SALVAR DADOS ADMINISTRATIVOS
========================================== */

async function salvarDatasAdministrativas() {

  if (
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
   BAIXA DO ASSOCIADO
========================================== */

function obterDataHojeParaCampo() {
  const hoje = new Date();
  const dia = String(hoje.getDate()).padStart(2, "0");
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const ano = hoje.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

function obterDataHojeISO() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function atualizarAreaBaixaAssociado() {
  if (!areaBaixaAssociado || !associadoAtual) return;

  const estaInativo = associadoAtual.status === "inativo";

  if (
    !podeDarBaixaAssociado
  ) {
    areaBaixaAssociado.hidden = true;

    if (formularioBaixaAssociado) {
      formularioBaixaAssociado.hidden = true;
    }

    if (formularioReativacaoAssociado) {
      formularioReativacaoAssociado.hidden = true;
    }

    return;
  }

  areaBaixaAssociado.hidden = false;

  areaAssociadoAtivo.hidden = estaInativo;
  areaAssociadoInativo.hidden = !estaInativo;

  if (estaInativo) {
    textoDataSaidaAssociado.textContent =
      formatarData(associadoAtual.data_saida_tufra);

    textoMotivoSaidaAssociado.textContent =
      valorOuTraco(associadoAtual.motivo_saida);

    if (formularioBaixaAssociado) {
      formularioBaixaAssociado.hidden = true;
    }
  } else {
    formularioBaixaAssociado.hidden = true;

    if (formularioReativacaoAssociado) {
      formularioReativacaoAssociado.hidden = true;
    }
  }
}

function abrirBaixaAssociado() {
  if (!associadoAtual || associadoAtual.status === "inativo") return;

  dataSaidaAssociado.value = obterDataHojeParaCampo();
  motivoSaidaAssociado.value = "";
  mensagemBaixaAssociado.textContent = "";
  mensagemBaixaAssociado.hidden = true;
  formularioBaixaAssociado.hidden = false;
  dataSaidaAssociado.focus();
}

function cancelarBaixaAssociado() {
  formularioBaixaAssociado.hidden = true;
  dataSaidaAssociado.value = "";
  motivoSaidaAssociado.value = "";
  mensagemBaixaAssociado.textContent = "";
  mensagemBaixaAssociado.hidden = true;
}

async function confirmarBaixaAssociado() {
  if (!associadoAtual || associadoAtual.status === "inativo") return;

  const dataSaida =
    converterDataParaISO(dataSaidaAssociado.value);

  const motivo =
    String(motivoSaidaAssociado.value || "").trim();

  if (dataSaida === false || !dataSaida) {
    mensagemBaixaAssociado.textContent =
      "Informe uma data de saída válida.";
    mensagemBaixaAssociado.hidden = false;
    return;
  }

  if (
    associadoAtual.data_entrada_tufra &&
    dataSaida < associadoAtual.data_entrada_tufra
  ) {
    mensagemBaixaAssociado.textContent =
      "A data de saída não pode ser anterior à data de entrada na TUFRA.";
    mensagemBaixaAssociado.hidden = false;
    return;
  }

  if (dataSaida > obterDataHojeISO()) {
    mensagemBaixaAssociado.textContent =
      "A data de saída não pode ser uma data futura.";
    mensagemBaixaAssociado.hidden = false;
    return;
  }

  if (!motivo) {
    mensagemBaixaAssociado.textContent =
      "Informe o motivo da baixa.";
    mensagemBaixaAssociado.hidden = false;
    return;
  }

  const confirmar = window.confirm(
    "Confirma a baixa deste associado? O cadastro e o histórico serão preservados, mas o associado ficará inativo."
  );

  if (!confirmar) return;

  botaoConfirmarBaixaAssociado.disabled = true;
  botaoConfirmarBaixaAssociado.textContent = "Salvando...";
  mensagemBaixaAssociado.hidden = true;

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

    if (resultado.error) {
      throw resultado.error;
    }

    associadoAtual.status =
      "inativo";

    associadoAtual.data_saida_tufra =
      dataSaida;

    associadoAtual.motivo_saida =
      motivo;

    formularioBaixaAssociado.hidden = true;
    atualizarAreaBaixaAssociado();

  } catch (erro) {
    console.error("Erro ao dar baixa no associado:", erro);

    mensagemBaixaAssociado.textContent =
      "Não foi possível concluir a baixa do associado.";
    mensagemBaixaAssociado.hidden = false;

  } finally {
    botaoConfirmarBaixaAssociado.disabled = false;
    botaoConfirmarBaixaAssociado.textContent = "Confirmar baixa";
  }
}


/* ==========================================
   REATIVAÇÃO DO ASSOCIADO
========================================== */

function abrirReativacaoAssociado() {

  if (
    !associadoAtual ||
    associadoAtual.status !== "inativo"
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


async function confirmarReativacaoAssociado() {

  if (
    !associadoAtual ||
    associadoAtual.status !== "inativo"
  ) {

    return;

  }


  const dataRetorno =
    converterDataParaISO(
      dataRetornoAssociado.value
    );


  const observacao =
    String(
      observacaoRetornoAssociado.value || ""
    ).trim();


  if (
    dataRetorno === false ||
    !dataRetorno
  ) {

    mensagemReativacaoAssociado.textContent =
      "Informe uma data de retorno válida.";


    mensagemReativacaoAssociado.hidden =
      false;


    return;

  }


  if (
    associadoAtual.data_saida_tufra &&
    dataRetorno <
      associadoAtual.data_saida_tufra
  ) {

    mensagemReativacaoAssociado.textContent =
      "A data de retorno não pode ser anterior à data da saída.";


    mensagemReativacaoAssociado.hidden =
      false;


    return;

  }


  if (
    dataRetorno >
    obterDataHojeISO()
  ) {

    mensagemReativacaoAssociado.textContent =
      "A data de retorno não pode ser uma data futura.";


    mensagemReativacaoAssociado.hidden =
      false;


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
              observacao || null
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


    mensagemReativacaoAssociado.textContent =
      "Não foi possível reativar o associado.";


    mensagemReativacaoAssociado.hidden =
      false;


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

    renderizarHistoricoFuncoes();

    atualizarAreaBaixaAssociado();


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

        throw resultadoFoto.error;

      }


      const urlFoto =
        resultadoFoto.data?.signedUrl;


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
   ZOOM
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
   EVENTOS DA BAIXA DO ASSOCIADO
========================================== */

if (dataSaidaAssociado) {
  dataSaidaAssociado.addEventListener(
    "input",
    () => aplicarMascaraData(dataSaidaAssociado)
  );
}

if (botaoAbrirBaixaAssociado) {
  botaoAbrirBaixaAssociado.addEventListener(
    "click",
    abrirBaixaAssociado
  );
}

if (botaoCancelarBaixaAssociado) {
  botaoCancelarBaixaAssociado.addEventListener(
    "click",
    cancelarBaixaAssociado
  );
}

if (botaoConfirmarBaixaAssociado) {
  botaoConfirmarBaixaAssociado.addEventListener(
    "click",
    confirmarBaixaAssociado
  );
}


/* ==========================================
   EVENTOS DA REATIVAÇÃO DO ASSOCIADO
========================================== */

if (dataRetornoAssociado) {
  dataRetornoAssociado.addEventListener(
    "input",
    () => aplicarMascaraData(dataRetornoAssociado)
  );
}

if (botaoAbrirReativacaoAssociado) {
  botaoAbrirReativacaoAssociado.addEventListener(
    "click",
    abrirReativacaoAssociado
  );
}

if (botaoCancelarReativacaoAssociado) {
  botaoCancelarReativacaoAssociado.addEventListener(
    "click",
    cancelarReativacaoAssociado
  );
}

if (botaoConfirmarReativacaoAssociado) {
  botaoConfirmarReativacaoAssociado.addEventListener(
    "click",
    confirmarReativacaoAssociado
  );
}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

configurarVoltar();

carregarAssociado();

verificarPermissaoAtendimentos();

verificarPermissaoBaixaAssociado();


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


function obterDataAtualISOResumoPresenca() {

  const hoje =
    new Date();


  const ano =
    hoje.getFullYear();


  const mes =
    String(
      hoje.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const dia =
    String(
      hoje.getDate()
    ).padStart(
      2,
      "0"
    );


  return `${ano}-${mes}-${dia}`;
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


  return `${partes[2]}/${partes[1]}`;
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


  let nomeHistorico =
    null;


  if (
    nomeLista ===
    "Ogans"
  ) {

    nomeHistorico =
      "Ogam";

  }


  if (
    nomeLista ===
    "Cambones"
  ) {

    nomeHistorico =
      "Cambone";

  }


  if (
    nomeLista ===
    "Cantina"
  ) {

    nomeHistorico =
      "Cantina";

  }


  if (
    nomeHistorico
  ) {

    const periodoAtual =
      historicoFuncoes.find(
        (registro) =>
          registro.funcao_nome ===
            nomeHistorico &&
          !registro.data_fim
      );


    if (
      periodoAtual?.data_inicio
    ) {

      return periodoAtual.data_inicio;

    }

  }


  return (
    associadoAtual.data_entrada_tufra ||
    null
  );
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


  return resultado.data ||
    null;
}


async function buscarUltimasAtividadesResumo(
  tipoAtividade
) {

  const hojeISO =
    obterDataAtualISOResumoPresenca();


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
        hojeISO
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


  return resultado.data ||
    [];
}


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
