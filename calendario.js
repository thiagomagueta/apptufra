"use strict";

/* ==========================================
   ELEMENTOS
========================================== */

const listaCalendario =
  document.getElementById(
    "listaCalendario"
  );

const tituloMes =
  document.getElementById(
    "tituloMes"
  );

const mensagemSemAtividades =
  document.getElementById(
    "mensagemSemAtividades"
  );

const botaoMesAnterior =
  document.getElementById(
    "mesAnterior"
  );

const botaoMesSeguinte =
  document.getElementById(
    "mesSeguinte"
  );

const botaoVoltarMesAtual =
  document.getElementById(
    "voltarMesAtual"
  );


/* ==========================================
   ESTADO
========================================== */

const hoje = new Date();

let mesExibido = new Date(
  hoje.getFullYear(),
  hoje.getMonth(),
  1
);

let atividadesTufra = [];


/* ==========================================
   DATAS
========================================== */

function criarDataLocal(dataISO) {
  const [ano, mes, dia] =
    dataISO
      .split("-")
      .map(Number);

  return new Date(
    ano,
    mes - 1,
    dia
  );
}


function formatarTituloMes(data) {
  const texto =
    new Intl.DateTimeFormat(
      "pt-BR",
      {
        month: "long",
        year: "numeric"
      }
    ).format(data);

  return (
    texto.charAt(0).toUpperCase() +
    texto.slice(1)
  );
}


function formatarDiaSemana(data) {
  const texto =
    new Intl.DateTimeFormat(
      "pt-BR",
      {
        weekday: "long"
      }
    ).format(data);

  return (
    texto.charAt(0).toUpperCase() +
    texto.slice(1)
  );
}


function formatarMesCurto(data) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      month: "short"
    }
  )
    .format(data)
    .replace(".", "")
    .toUpperCase();
}


/* ==========================================
   HORÁRIO
========================================== */

function removerSegundos(horario) {
  if (!horario) {
    return "";
  }

  return horario.slice(0, 5);
}


function montarHorario(atividade) {
  const inicio =
    removerSegundos(
      atividade.hora_inicio
    );

  const fim =
    removerSegundos(
      atividade.hora_fim
    );

  if (inicio && fim) {
    return `${inicio} às ${fim}`;
  }

  if (inicio) {
    return inicio;
  }

  return "Horário não informado";
}


/* ==========================================
   TIPO DA ATIVIDADE
========================================== */

function formatarTipoAtividade(
  atividade
) {
  if (
    atividade.tipo_atividade ===
    "outros"
  ) {
    return (
      atividade.tipo_outro ||
      "Outros"
    );
  }

  const tipos = {
    gira_principal:
      "Gira Principal",

    gira_desenvolvimento:
      "Gira de Desenvolvimento",

    aula:
      "Aula",

    trabalho_cura:
      "Trabalho de Cura",

    eventos:
      "Eventos",

    obrigacoes:
      "Obrigações"
  };

  return (
    tipos[
      atividade.tipo_atividade
    ] || "Atividade"
  );
}


/* ==========================================
   FILTRO DO MÊS
========================================== */

function atividadesDoMes(
  dataReferencia
) {
  return atividadesTufra.filter(
    (atividade) => {
      const dataAtividade =
        criarDataLocal(
          atividade.data
        );

      return (
        dataAtividade.getFullYear() ===
          dataReferencia.getFullYear() &&
        dataAtividade.getMonth() ===
          dataReferencia.getMonth()
      );
    }
  );
}


/* ==========================================
   ITEM DO CALENDÁRIO
========================================== */

function criarItemAtividade(
  atividade
) {
  const data =
    criarDataLocal(
      atividade.data
    );

  const item =
    document.createElement(
      "article"
    );

  item.className =
    "item-calendario";


  /* DATA */

  const blocoData =
    document.createElement(
      "div"
    );

  blocoData.className =
    "data-atividade";

  blocoData.innerHTML =
    `${String(
      data.getDate()
    ).padStart(
      2,
      "0"
    )}` +
    `<br>${formatarMesCurto(
      data
    )}`;


  /* CONTEÚDO */

  const conteudo =
    document.createElement(
      "div"
    );

  conteudo.className =
    "dados-atividade";


  /* TÍTULO */

const tipo =
  document.createElement(
    "strong"
  );

tipo.className =
  "tipo-atividade-calendario";

tipo.textContent =
  formatarTipoAtividade(
    atividade
  );


const titulo =
  document.createElement(
    "strong"
  );

titulo.className =
  "titulo-atividade-calendario";

titulo.textContent =
  atividade.titulo;


/* DIA + HORÁRIO */

const dataHorario =
  document.createElement(
    "span"
  );

dataHorario.textContent =
  `${formatarDiaSemana(data)} • ` +
  `${montarHorario(atividade)}`;


conteudo.appendChild(
  tipo
);

conteudo.appendChild(
  titulo
);

conteudo.appendChild(
  dataHorario
);

  /* OBSERVAÇÃO */

  if (atividade.observacao) {
    const observacao =
      document.createElement(
        "p"
      );

    observacao.className =
      "descricao-atividade";

    observacao.textContent =
      atividade.observacao;

    conteudo.appendChild(
      observacao
    );
  }


  item.appendChild(
    blocoData
  );

  item.appendChild(
    conteudo
  );

  return item;
}


/* ==========================================
   RENDERIZAÇÃO
========================================== */

function renderizarCalendario() {
  listaCalendario.innerHTML =
    "";

  tituloMes.textContent =
    formatarTituloMes(
      mesExibido
    );

  const atividades =
    atividadesDoMes(
      mesExibido
    );

  mensagemSemAtividades.hidden =
    atividades.length > 0;

  atividades.forEach(
    (atividade) => {
      listaCalendario.appendChild(
        criarItemAtividade(
          atividade
        )
      );
    }
  );
}


/* ==========================================
   BUSCA NO SUPABASE
========================================== */

async function carregarAtividades() {
  if (!window.supabaseClient) {
    listaCalendario.innerHTML =
      "<p>Não foi possível conectar ao calendário.</p>";

    return;
  }

  listaCalendario.innerHTML =
    "<p>Carregando atividades...</p>";

  try {
    const resultado =
      await window.supabaseClient
        .from("atividades")
        .select(`
          id,
          titulo,
          data,
          hora_inicio,
          hora_fim,
          tipo_atividade,
          tipo_outro,
          origem,
          observacao
        `)
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

    if (resultado.error) {
      throw resultado.error;
    }

    atividadesTufra =
      resultado.data || [];

    renderizarCalendario();

  } catch (erro) {
    console.error(
      "Erro ao carregar calendário:",
      erro
    );

    listaCalendario.innerHTML =
      "<p>Não foi possível carregar as atividades.</p>";
  }
}


/* ==========================================
   NAVEGAÇÃO ENTRE MESES
========================================== */

function alterarMes(
  quantidade
) {
  mesExibido =
    new Date(
      mesExibido.getFullYear(),
      mesExibido.getMonth() +
        quantidade,
      1
    );

  renderizarCalendario();
}


botaoMesAnterior.addEventListener(
  "click",
  () => {
    alterarMes(-1);
  }
);


botaoMesSeguinte.addEventListener(
  "click",
  () => {
    alterarMes(1);
  }
);


botaoVoltarMesAtual.addEventListener(
  "click",
  () => {
    mesExibido =
      new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        1
      );

    renderizarCalendario();
  }
);


/* ==========================================
   INICIALIZAÇÃO
========================================== */

carregarAtividades();
