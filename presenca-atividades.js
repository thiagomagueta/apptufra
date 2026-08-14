"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const tituloListaPresenca =
  document.getElementById(
    "tituloListaPresenca"
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

let tipoListaId =
  null;

let tipoAtividadeLista =
  null;

let atividadesPreenchidas =
  new Set();


/* ==========================================
   PARÂMETRO
========================================== */

function obterTipoListaId() {

  const parametros =
    new URLSearchParams(
      window.location.search
    );

  return parametros.get(
    "id"
  );
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

  if (!horario) {
    return "";
  }


  return horario.slice(
    0,
    5
  );
}


/* ==========================================
   VERIFICAR SE ATIVIDADE FOI PREENCHIDA
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
    `preencher-presenca.html?lista=${tipoListaId}&atividade=${atividade.id}`;


  /* --------------------------------------
     DATA
  -------------------------------------- */

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


  /* --------------------------------------
     DADOS
  -------------------------------------- */

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


  /* --------------------------------------
     STATUS
  -------------------------------------- */

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


  /* --------------------------------------
     SETA
  -------------------------------------- */

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
   CARREGAR CONFIGURAÇÃO DA LISTA
========================================== */

async function carregarTipoLista() {

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
        "id",
        tipoListaId
      )
      .maybeSingle();


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  if (
    !resultado.data
  ) {

    throw new Error(
      "Lista de presença não encontrada."
    );

  }


  tituloListaPresenca.textContent =
    resultado.data.nome;


  tipoAtividadeLista =
    resultado.data.tipo_atividade;
}


/* ==========================================
   VALIDAR RESPONSÁVEL
========================================== */

async function validarResponsavel() {

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
      .from("usuarios")
      .select("id")
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


  const resultadoResponsavel =
    await window.supabaseClient
      .from(
        "responsaveis_lista_presenca"
      )
      .select("id")
      .eq(
        "tipo_lista_id",
        tipoListaId
      )
      .eq(
        "usuario_id",
        resultadoUsuario.data.id
      )
      .maybeSingle();


  if (
    resultadoResponsavel.error
  ) {

    throw resultadoResponsavel.error;

  }


  if (
    !resultadoResponsavel.data
  ) {

    window.location.href =
      "listas-presenca.html";


    throw new Error(
      "Usuário não autorizado para esta lista."
    );

  }

}


/* ==========================================
   CARREGAR ATIVIDADES JÁ PREENCHIDAS
========================================== */

async function carregarAtividadesPreenchidas() {

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
        tipoListaId
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
   CARREGAR ATIVIDADES
========================================== */

async function carregarAtividades() {

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
        tipoAtividadeLista
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


  const atividades =
    resultado.data || [];


  listaAtividadesPresenca.innerHTML =
    "";


  mensagemSemAtividadesPresenca.hidden =
    atividades.length > 0;


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
   INICIALIZAÇÃO
========================================== */

async function iniciarPagina() {

  tipoListaId =
    obterTipoListaId();


  if (
    !tipoListaId
  ) {

    window.location.href =
      "listas-presenca.html";

    return;

  }


  if (
    !window.supabaseClient
  ) {

    return;

  }


  try {

    await validarResponsavel();

    await carregarTipoLista();

    await carregarAtividadesPreenchidas();

    await carregarAtividades();


  } catch (erro) {

    console.error(
      "Erro ao carregar atividades da presença:",
      erro
    );


    listaAtividadesPresenca.innerHTML =
      "<p>Não foi possível carregar as atividades.</p>";

  }

}


/* ==========================================
   INICIAR
========================================== */

iniciarPagina();
