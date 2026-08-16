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

const mensagemAssociadoResumo =
  document.getElementById(
    "mensagemAssociadoResumo"
  );

const voltarAssociados =
  document.getElementById(
    "voltarAssociados"
  );


/* ==========================================
   DATAS ADMINISTRATIVAS
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


let zoomFoto = 1;

let distanciaToqueInicial =
  null;


/* ==========================================
   DADOS
========================================== */

let associadoAtual =
  null;


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
    numeros.length >
    4
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
    numeros.length >
    2
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


  /*
    Confirmamos que a data realmente existe.

    Exemplo:
    31/02/2020 será rejeitado.
  */

  if (
    data.getFullYear() !==
      ano ||
    data.getMonth() !==
      mes - 1 ||
    data.getDate() !==
      dia
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
   EXIBIR DATAS
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


  textoDataCorrenteDesenvolvimento.textContent =
    formatarData(
      associadoAtual.data_corrente_desenvolvimento
    );


  textoDataCorrentePrincipal.textContent =
    formatarData(
      associadoAtual.data_corrente_principal
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


  dataCorrenteDesenvolvimento.value =
    dataISOParaCampo(
      associadoAtual.data_corrente_desenvolvimento
    );


  dataCorrentePrincipal.value =
    dataISOParaCampo(
      associadoAtual.data_corrente_principal
    );


  mensagemDatasAdministrativas.hidden =
    true;


  mensagemDatasAdministrativas.textContent =
    "";


  visualizacaoDatasAdministrativas.hidden =
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
}


/* ==========================================
   LER DATAS
========================================== */

function obterDatasDigitadas() {

  const entrada =
    converterDataParaISO(
      dataEntradaTufra.value
    );


  const desenvolvimento =
    converterDataParaISO(
      dataCorrenteDesenvolvimento.value
    );


  const principal =
    converterDataParaISO(
      dataCorrentePrincipal.value
    );


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
    desenvolvimento <
      entrada
  ) {

    return "A data da Corrente do Desenvolvimento não pode ser anterior à entrada na TUFRA.";

  }


  if (
    entrada &&
    principal &&
    principal <
      entrada
  ) {

    return "A data da Corrente Principal não pode ser anterior à entrada na TUFRA.";

  }


  if (
    desenvolvimento &&
    principal &&
    principal <
      desenvolvimento
  ) {

    return "A data da Corrente Principal não pode ser anterior à Corrente do Desenvolvimento.";

  }


  return "";
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


  const erroValidacao =
    validarDatasAdministrativas();


  if (
    erroValidacao
  ) {

    mensagemDatasAdministrativas.textContent =
      erroValidacao;


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
        entrada,

      data_corrente_desenvolvimento:
        desenvolvimento,

      data_corrente_principal:
        principal

    };


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
      novasDatas.data_entrada_tufra;


    associadoAtual.data_corrente_desenvolvimento =
      novasDatas.data_corrente_desenvolvimento;


    associadoAtual.data_corrente_principal =
      novasDatas.data_corrente_principal;


    atualizarVisualizacaoDatas();


    edicaoDatasAdministrativas.hidden =
      true;


    visualizacaoDatasAdministrativas.hidden =
      false;


    botaoEditarDatasAdministrativas.hidden =
      false;


  } catch (erro) {

    console.error(
      "Erro ao salvar datas administrativas:",
      erro
    );


    mensagemDatasAdministrativas.textContent =
      "Não foi possível salvar as datas.";


    mensagemDatasAdministrativas.hidden =
      false;


  } finally {

    botaoSalvarDatasAdministrativas.disabled =
      false;


    botaoSalvarDatasAdministrativas.textContent =
      "Salvar datas";

  }
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
        .from("usuarios")
        .select(`
          id,
          nome_completo,
          foto_path,
          data_entrada_tufra,
          data_corrente_desenvolvimento,
          data_corrente_principal
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


    botaoCadastroCompleto.href =
      `associado-ficha.html?id=${associadoId}&origem=${origem}`;


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
    passive: false
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
    passive: false
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
    passive: false
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
