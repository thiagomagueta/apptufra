"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const listaPreencherPresenca =
  document.getElementById(
    "listaPreencherPresenca"
  );

const anoPreencherPresenca =
  document.getElementById(
    "anoPreencherPresenca"
  );

const areaAtividadesPreencherPresenca =
  document.getElementById(
    "areaAtividadesPreencherPresenca"
  );

const tituloListaPreencherPresenca =
  document.getElementById(
    "tituloListaPreencherPresenca"
  );

const listaAtividadesPreencherPresenca =
  document.getElementById(
    "listaAtividadesPreencherPresenca"
  );

const mensagemSemAtividadesPreencherPresenca =
  document.getElementById(
    "mensagemSemAtividadesPreencherPresenca"
  );

const mensagemSemListasPresenca =
  document.getElementById(
    "mensagemSemListasPresenca"
  );


/* ==========================================
   DADOS
========================================== */

let listasResponsavel =
  [];

let tipoListaAtual =
  null;

let todasAtividades =
  [];

let atividadesPreenchidas =
  new Set();

let usuarioAtualId =
  null;


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
   CARREGAR USUÁRIO
========================================== */

async function carregarUsuarioAtual() {

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

    throw new Error(
      "Usuário não encontrado."
    );

  }


  usuarioAtualId =
    resultadoUsuario.data.id;
}


/* ==========================================
   CARREGAR LISTAS ATRIBUÍDAS
========================================== */

async function carregarListasResponsavel() {

  const resultado =
    await window.supabaseClient
      .from(
        "responsaveis_lista_presenca"
      )
      .select(`
        tipo_lista_id,
        tipos_lista_presenca (
          id,
          nome,
          tipo_atividade,
          ativo,
          ordem
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


  listasResponsavel =
    (
      resultado.data ||
      []
    )
      .map(
        (item) =>
          item.tipos_lista_presenca
      )
      .filter(
        (item) =>
          item &&
          item.ativo
      )
      .sort(
        (a, b) =>
          Number(
            a.ordem || 0
          ) -
          Number(
            b.ordem || 0
          )
      );


  listaPreencherPresenca.innerHTML =
    "";


  if (
    listasResponsavel.length ===
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


    listaPreencherPresenca.appendChild(
      opcao
    );


    listaPreencherPresenca.disabled =
      true;


    anoPreencherPresenca.disabled =
      true;


    areaAtividadesPreencherPresenca.hidden =
      true;


    mensagemSemListasPresenca.hidden =
      false;


    return;

  }


  mensagemSemListasPresenca.hidden =
    true;


  listasResponsavel.forEach(
    (lista) => {

      const opcao =
        document.createElement(
          "option"
        );


      opcao.value =
        lista.id;


      opcao.textContent =
        lista.nome;


      listaPreencherPresenca.appendChild(
        opcao
      );

    }
  );


  listaPreencherPresenca.disabled =
    false;


  tipoListaAtual =
    listasResponsavel[0];


  listaPreencherPresenca.value =
    tipoListaAtual.id;
}


/* ==========================================
   CARREGAR ATIVIDADES
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
   ANOS DISPONÍVEIS
========================================== */

function carregarAnosDisponiveis() {

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


  anoPreencherPresenca.innerHTML =
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


    anoPreencherPresenca.appendChild(
      opcao
    );


    anoPreencherPresenca.disabled =
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


      anoPreencherPresenca.appendChild(
        opcao
      );

    }
  );


  const anoAtual =
    new Date()
      .getFullYear();


  if (
    anos.includes(
      anoAtual
    )
  ) {

    anoPreencherPresenca.value =
      String(
        anoAtual
      );

  } else {

    anoPreencherPresenca.value =
      String(
        anos[0]
      );

  }


  anoPreencherPresenca.disabled =
    false;
}


/* ==========================================
   ATIVIDADES PREENCHIDAS
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
   VERIFICAR PREENCHIMENTO
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
    `preencher-presenca.html?lista=${tipoListaAtual.id}&atividade=${atividade.id}`;


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
    anoPreencherPresenca.value;


  listaAtividadesPreencherPresenca.innerHTML =
    "";


  if (
    !tipoListaAtual ||
    !ano
  ) {

    areaAtividadesPreencherPresenca.hidden =
      true;

    return;

  }


  const atividades =
    todasAtividades.filter(
      (atividade) =>
        String(
          atividade.data
        ).startsWith(
          `${ano}-`
        )
    );


  areaAtividadesPreencherPresenca.hidden =
    false;


  tituloListaPreencherPresenca.textContent =
    tipoListaAtual.nome;


  mensagemSemAtividadesPreencherPresenca.hidden =
    atividades.length > 0;


  atividades.forEach(
    (atividade) => {

      listaAtividadesPreencherPresenca.appendChild(
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
    listaPreencherPresenca.value;


  tipoListaAtual =
    listasResponsavel.find(
      (lista) =>
        lista.id ===
        listaId
    ) || null;


  areaAtividadesPreencherPresenca.hidden =
    true;


  anoPreencherPresenca.disabled =
    true;


  anoPreencherPresenca.innerHTML =
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
      "Erro ao trocar lista de presença:",
      erro
    );


    areaAtividadesPreencherPresenca.hidden =
      false;


    listaAtividadesPreencherPresenca.innerHTML =
      "<p>Não foi possível carregar as atividades.</p>";

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

    await carregarUsuarioAtual();

    await carregarListasResponsavel();


    if (
      !tipoListaAtual
    ) {

      return;

    }


    await trocarLista();


  } catch (erro) {

    console.error(
      "Erro ao carregar preenchimento de presença:",
      erro
    );


    areaAtividadesPreencherPresenca.hidden =
      false;


    listaAtividadesPreencherPresenca.innerHTML =
      "<p>Não foi possível carregar suas listas.</p>";

  }
}


/* ==========================================
   EVENTOS
========================================== */

listaPreencherPresenca.addEventListener(
  "change",
  trocarLista
);


anoPreencherPresenca.addEventListener(
  "change",
  renderizarAtividades
);


/* ==========================================
   INICIAR
========================================== */

iniciarPagina();
