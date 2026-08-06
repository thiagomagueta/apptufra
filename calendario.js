"use strict";

const atividadesTufra = [
  {
    data: "2026-08-05",
    titulo: "Desenvolvimento",
    horarioInicio: "19:30",
    horarioFim: "",
    local: "TUFRA",
    descricao: "Atividade de desenvolvimento mediúnico.",
    tipo: "Desenvolvimento"
  },
  {
    data: "2026-08-12",
    titulo: "Curso",
    horarioInicio: "19:30",
    horarioFim: "",
    local: "TUFRA",
    descricao: "Atividade de estudo e formação.",
    tipo: "Curso"
  },
  {
    data: "2026-08-15",
    titulo: "Gira de Caboclo",
    horarioInicio: "19:00",
    horarioFim: "",
    local: "TUFRA",
    descricao: "Gira aberta à assistência.",
    tipo: "Gira"
  },
  {
    data: "2026-08-22",
    titulo: "Gira de Preto Velho",
    horarioInicio: "19:00",
    horarioFim: "",
    local: "TUFRA",
    descricao: "Gira aberta à assistência.",
    tipo: "Gira"
  },
  {
    data: "2026-08-29",
    titulo: "Gira de Exu",
    horarioInicio: "19:00",
    horarioFim: "",
    local: "TUFRA",
    descricao: "Gira aberta à assistência.",
    tipo: "Gira"
  },
  {
    data: "2026-09-05",
    titulo: "Desenvolvimento",
    horarioInicio: "19:30",
    horarioFim: "",
    local: "TUFRA",
    descricao: "Atividade de desenvolvimento mediúnico.",
    tipo: "Desenvolvimento"
  }
];

const listaCalendario = document.getElementById(
  "listaCalendario"
);

const tituloMes = document.getElementById("tituloMes");

const mensagemSemAtividades = document.getElementById(
  "mensagemSemAtividades"
);

const botaoMesAnterior = document.getElementById(
  "mesAnterior"
);

const botaoMesSeguinte = document.getElementById(
  "mesSeguinte"
);

const botaoVoltarMesAtual = document.getElementById(
  "voltarMesAtual"
);

const hoje = new Date();

let mesExibido = new Date(
  hoje.getFullYear(),
  hoje.getMonth(),
  1
);

function criarDataLocal(dataISO) {
  const [ano, mes, dia] = dataISO
    .split("-")
    .map(Number);

  return new Date(ano, mes - 1, dia);
}

function formatarTituloMes(data) {
  const texto = new Intl.DateTimeFormat(
    "pt-BR",
    {
      month: "long",
      year: "numeric"
    }
  ).format(data);

  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function formatarDiaSemana(data) {
  const texto = new Intl.DateTimeFormat(
    "pt-BR",
    {
      weekday: "long"
    }
  ).format(data);

  return texto.charAt(0).toUpperCase() + texto.slice(1);
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

function montarHorario(atividade) {
  if (
    atividade.horarioInicio &&
    atividade.horarioFim
  ) {
    return (
      `${atividade.horarioInicio} às ` +
      `${atividade.horarioFim}`
    );
  }

  if (atividade.horarioInicio) {
    return atividade.horarioInicio;
  }

  return "Horário não informado";
}

function atividadesDoMes(dataReferencia) {
  return atividadesTufra
    .filter((atividade) => {
      const dataAtividade = criarDataLocal(
        atividade.data
      );

      return (
        dataAtividade.getFullYear() ===
          dataReferencia.getFullYear() &&
        dataAtividade.getMonth() ===
          dataReferencia.getMonth()
      );
    })
    .sort((atividadeA, atividadeB) => {
      return atividadeA.data.localeCompare(
        atividadeB.data
      );
    });
}

function criarItemAtividade(atividade) {
  const data = criarDataLocal(atividade.data);

  const item = document.createElement("article");
  item.className = "item-calendario";

  const blocoData = document.createElement("div");
  blocoData.className = "data-atividade";

  blocoData.innerHTML =
    `${String(data.getDate()).padStart(2, "0")}` +
    `<br>${formatarMesCurto(data)}`;

  const conteudo = document.createElement("div");
  conteudo.className = "dados-atividade";

  const titulo = document.createElement("strong");
  titulo.textContent = atividade.titulo;

  const dataHorario = document.createElement("span");
  dataHorario.textContent =
    `${formatarDiaSemana(data)} • ` +
    `${montarHorario(atividade)}`;

  const local = document.createElement("span");
  local.textContent =
    atividade.local || "Local não informado";

  conteudo.appendChild(titulo);
  conteudo.appendChild(dataHorario);
  conteudo.appendChild(local);

  if (atividade.descricao) {
    const descricao = document.createElement("p");
    descricao.className = "descricao-atividade";
    descricao.textContent = atividade.descricao;

    conteudo.appendChild(descricao);
  }

  item.appendChild(blocoData);
  item.appendChild(conteudo);

  return item;
}

function renderizarCalendario() {
  listaCalendario.innerHTML = "";

  tituloMes.textContent = formatarTituloMes(
    mesExibido
  );

  const atividades = atividadesDoMes(mesExibido);

  mensagemSemAtividades.hidden =
    atividades.length > 0;

  atividades.forEach((atividade) => {
    listaCalendario.appendChild(
      criarItemAtividade(atividade)
    );
  });
}

function alterarMes(quantidade) {
  mesExibido = new Date(
    mesExibido.getFullYear(),
    mesExibido.getMonth() + quantidade,
    1
  );

  renderizarCalendario();
}

botaoMesAnterior.addEventListener("click", () => {
  alterarMes(-1);
});

botaoMesSeguinte.addEventListener("click", () => {
  alterarMes(1);
});

botaoVoltarMesAtual.addEventListener("click", () => {
  mesExibido = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    1
  );

  renderizarCalendario();
});

renderizarCalendario();
