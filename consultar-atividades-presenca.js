"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const listaConsultaPresenca =
  document.getElementById(
    "listaConsultaPresenca"
  );

const anoConsultaPresenca =
  document.getElementById(
    "anoConsultaPresenca"
  );

const areaAtividadesConsultaPresenca =
  document.getElementById(
    "areaAtividadesConsultaPresenca"
  );

const tituloListaConsultaPresenca =
  document.getElementById(
    "tituloListaConsultaPresenca"
  );

const listaAtividadesPresenca =
  document.getElementById(
    "listaAtividadesPresenca"
  );

const mensagemSemAtividadesPresenca =
  document.getElementById(
    "mensagemSemAtividadesPresenca"
  );


/* ==========================================
   DADOS
========================================== */

let listasPresenca =
  [];

let tipoListaAtual =
  null;

let todasAtividades =
  [];

let atividadesPreenchidas =
  new Set();


/* ==========================================
   PARÂMETROS DE RETORNO
========================================== */

function obterParametrosRetorno() {

  const parametros =
    new URLSearchParams(
      window.location.search
    );


  return {

    lista:
      parametros.get(
        "lista"
      ),

    ano:
      parametros.get(
        "ano"
      )

  };
}


/* ==========================================
   FORMATAÇÃO
========================================== */

function criarDataLocal(
  dataISO
) {

  const [
    ano,
    mes,
    dia
  ] =
    dataISO
      .split("-")
      .map(Number);


  return new Date(
    ano,
    mes - 1,
    dia
  );
}


function formatarData(
  dataISO
) {

  const data =
    criarDataLocal(
      dataISO
    );


  return new Intl.DateTimeFormat(
    "pt-BR"
  ).format(
    data
  );
}


function formatarDiaSemana(
  dataISO
) {

  const data =
    criarDataLocal(
      dataISO
    );


  const texto =
    new Intl.DateTimeFormat(
      "pt-BR",
      {
        weekday: "long"
      }
    ).format(
      data
    );


  return texto.charAt(0)
    .toUpperCase() +
    texto.slice(1);
}


function removerSegundos(
  horario
) {

  if (
    !horario
  ) {

    return "";

  }


  return horario.slice(
    0,
    5
  );
}


/* ==========================================
   VALIDAR SESSÃO
========================================== */

async function validarSessao() {

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


    throw new Error(
      "Sessão não encontrada."
    );

  }
}


/* ==========================================
   CARREGAR LISTAS
========================================== */

async function carregarListas(
  listaDesejada
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
        "ativo",
        true
      )
      .order(
        "ordem",
        {
          ascending: true
        }
      );


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  listasPresenca =
    resultado.data ||
    [];


  listaConsultaPresenca.innerHTML =
    "";


  if (
    listasPresenca.length ===
    0
  ) {

    const opcao =
      document.createElement(
        "option"
      );


    opcao.value =
      "";


    opcao.textContent =
      "Nenhuma lista";


    listaConsultaPresenca.appendChild(
      opcao
    );


    listaConsultaPresenca.disabled =
      true;


    return;

  }


  listasPresenca.forEach(
    (lista) => {

      const opcao =
        document.createElement(
          "option"
        );


      opcao.value =
        lista.id;


      opcao.textContent =
        lista.nome;


      listaConsultaPresenca.appendChild(
        opcao
      );

    }
  );


  listaConsultaPresenca.disabled =
    false;


  const listaRetorno =
    listasPresenca.find(
      (lista) =>
        lista.id ===
        listaDesejada
    );


  tipoListaAtual =
    listaRetorno ||
    listasPresenca[0];


  listaConsultaPresenca.value =
    tipoListaAtual.id;
}


/* ==========================================
   CARREGAR TODAS AS ATIVIDADES
========================================== */

async function carregarAtividades() {

  todasAtividades =
    [];


  if (
    !tipoListaAtual
  ) {

    return;

  }


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
        hora_fim,
        tipo_atividade
      `)
      .eq(
        "tipo_atividade",
        tipoListaAtual.tipo_atividade
      )
      .order(
        "data",
        {
          ascending: true
        }
      )
      .order(
        "hora_inicio",
        {
          ascending: true
        }
      );


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  todasAtividades =
    resultado.data ||
    [];
}


/* ==========================================
   CARREGAR ANOS DISPONÍVEIS
========================================== */

function carregarAnosDisponiveis(
  anoDesejado = null
) {

  const anos =
    [
      ...new Set(
        todasAtividades
          .map(
            (atividade) =>
              Number(
                String(
                  atividade.data
                ).slice(
                  0,
                  4
                )
              )
          )
          .filter(Boolean)
      )
    ]
      .sort(
        (a, b) =>
          b - a
      );


  anoConsultaPresenca.innerHTML =
    "";


  if (
    anos.length ===
    0
  ) {

    const opcao =
      document.createElement(
        "option"
      );


    opcao.value =
      "";


    opcao.textContent =
      "Sem anos";


    anoConsultaPresenca.appendChild(
      opcao
    );


    anoConsultaPresenca.disabled =
      true;


    return;

  }


  anos.forEach(
    (ano) => {

      const opcao =
        document.createElement(
          "option"
        );


      opcao.value =
        String(
          ano
        );


      opcao.textContent =
        String(
          ano
        );


      anoConsultaPresenca.appendChild(
        opcao
      );

    }
  );


  const anoDesejadoNumero =
    Number(
      anoDesejado
    );


  const anoAtual =
    new Date()
      .getFullYear();


  if (
    anoDesejado &&
    anos.includes(
      anoDesejadoNumero
    )
  ) {

    anoConsultaPresenca.value =
      String(
        anoDesejadoNumero
      );

  } else if (
    anos.includes(
      anoAtual
    )
  ) {

    anoConsultaPresenca.value =
      String(
        anoAtual
      );

  } else {

    anoConsultaPresenca.value =
      String(
        anos[0]
      );

  }


  anoConsultaPresenca.disabled =
    false;
}


/* ==========================================
   ATIVIDADES JÁ PREENCHIDAS
========================================== */

async function carregarAtividadesPreenchidas() {

  atividadesPreenchidas =
    new Set();


  if (
    !tipoListaAtual
  ) {

    return;

  }


  const resultado =
    await window.supabaseClient
      .from(
        "presencas"
      )
      .select(
        "atividade_id"
      )
      .eq(
        "tipo_lista_id",
        tipoListaAtual.id
      );


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  atividadesPreenchidas =
    new Set(
      (
        resultado.data ||
        []
      )
        .map(
          (item) =>
            item.atividade_id
        )
        .filter(Boolean)
    );
}


/* ==========================================
   ATIVIDADE FOI PREENCHIDA
========================================== */

function atividadeFoiPreenchida(
  atividadeId
) {

  return atividadesPreenchidas.has(
    atividadeId
  );
}


/* ==========================================
   ITEM DA ATIVIDADE
========================================== */

function criarItemAtividade(
  atividade
) {

  const link =
    document.createElement(
      "a"
    );


  link.className =
    "item-atividade-presenca";


  link.href =
    `consultar-lista-presenca.html?lista=${tipoListaAtual.id}&atividade=${atividade.id}`;


  const data =
    document.createElement(
      "div"
    );


  data.className =
    "data-atividade-presenca";


  data.textContent =
    formatarData(
      atividade.data
    );


  const dados =
    document.createElement(
      "div"
    );


  dados.className =
    "dados-atividade-presenca";


  const titulo =
    document.createElement(
      "strong"
    );


  titulo.textContent =
    atividade.titulo;


  const complemento =
    document.createElement(
      "span"
    );


  const horaInicio =
    removerSegundos(
      atividade.hora_inicio
    );


  complemento.textContent =
    `${formatarDiaSemana(
      atividade.data
    )}` +
    (
      horaInicio
        ? ` • ${horaInicio}`
        : ""
    );


  const preenchida =
    atividadeFoiPreenchida(
      atividade.id
    );


  const status =
    document.createElement(
      "span"
    );


  status.className =
    preenchida
      ? "status-atividade-presenca preenchida"
      : "status-atividade-presenca pendente";


  status.textContent =
    preenchida
      ? "✓ Preenchida"
      : "Pendente";


  dados.appendChild(
    titulo
  );


  dados.appendChild(
    complemento
  );


  dados.appendChild(
    status
  );


  const seta =
    document.createElement(
      "span"
    );


  seta.className =
    "seta-permissao-lista";


  seta.textContent =
    "›";


  link.appendChild(
    data
  );


  link.appendChild(
    dados
  );


  link.appendChild(
    seta
  );


  return link;
}


/* ==========================================
   RENDERIZAR ATIVIDADES
========================================== */

function renderizarAtividades() {

  const ano =
    anoConsultaPresenca.value;


  listaAtividadesPresenca.innerHTML =
    "";


  if (
    !tipoListaAtual ||
    !ano
  ) {

    areaAtividadesConsultaPresenca.hidden =
      true;

    return;

  }


  areaAtividadesConsultaPresenca.hidden =
    false;


  tituloListaConsultaPresenca.textContent =
    tipoListaAtual.nome;


  const atividades =
    todasAtividades.filter(
      (atividade) =>
        String(
          atividade.data
        ).startsWith(
          `${ano}-`
        )
    );


  mensagemSemAtividadesPresenca.hidden =
    atividades.length > 0;


  if (
    atividades.length ===
    0
  ) {

    return;

  }


  atividades.forEach(
    (atividade) => {

      listaAtividadesPresenca.appendChild(
        criarItemAtividade(
          atividade
        )
      );

    }
  );
}


/* ==========================================
   TROCAR LISTA
========================================== */

async function trocarLista() {

  const listaId =
    listaConsultaPresenca.value;


  tipoListaAtual =
    listasPresenca.find(
      (lista) =>
        lista.id ===
        listaId
    ) || null;


  areaAtividadesConsultaPresenca.hidden =
    true;


  anoConsultaPresenca.disabled =
    true;


  anoConsultaPresenca.innerHTML =
    `
      <option value="">
        Carregando...
      </option>
    `;


  try {

    await carregarAtividades();

    carregarAnosDisponiveis();

    await carregarAtividadesPreenchidas();

    renderizarAtividades();


  } catch (erro) {

    console.error(
      "Erro ao trocar lista da consulta de presença:",
      erro
    );


    areaAtividadesConsultaPresenca.hidden =
      false;


    listaAtividadesPresenca.innerHTML =
      "<p>Não foi possível carregar as atividades.</p>";


    mensagemSemAtividadesPresenca.hidden =
      true;

  }
}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

async function iniciarPagina() {

  if (
    !window.supabaseClient
  ) {

    return;

  }


  try {

    const retorno =
      obterParametrosRetorno();


    await validarSessao();


    await carregarListas(
      retorno.lista
    );


    if (
      !tipoListaAtual
    ) {

      return;

    }


    await carregarAtividades();


    carregarAnosDisponiveis(
      retorno.ano
    );


    await carregarAtividadesPreenchidas();


    renderizarAtividades();


  } catch (erro) {

    console.error(
      "Erro ao iniciar consulta de presença:",
      erro
    );


    areaAtividadesConsultaPresenca.hidden =
      false;


    listaAtividadesPresenca.innerHTML =
      "<p>Não foi possível carregar as atividades.</p>";

  }
}


/* ==========================================
   EVENTOS
========================================== */

listaConsultaPresenca.addEventListener(
  "change",
  trocarLista
);


anoConsultaPresenca.addEventListener(
  "change",
  renderizarAtividades
);


/* ==========================================
   INICIAR
========================================== */

iniciarPagina();
