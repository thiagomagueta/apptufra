"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const tituloRelatorioLista =
  document.getElementById(
    "tituloRelatorioLista"
  );

const anoRelatorioPresenca =
  document.getElementById(
    "anoRelatorioPresenca"
  );

const cabecalhoTabelaRelatorio =
  document.getElementById(
    "cabecalhoTabelaRelatorio"
  );

const corpoTabelaRelatorio =
  document.getElementById(
    "corpoTabelaRelatorio"
  );


/* ==========================================
   DADOS DE TESTE
========================================== */

const atividadesTeste = [

  {
    data:
      "2026-01-10"
  },

  {
    data:
      "2026-01-24"
  },

  {
    data:
      "2026-02-07"
  },

  {
    data:
      "2026-02-21"
  },

  {
    data:
      "2026-03-07"
  },

  {
    data:
      "2026-09-05"
  }

];


const associadosTeste = [

  {
    nome:
      "Alberto Torrano",

    presencas: [
      "P",
      "J",
      "J",
      "P",
      "P",
      ""
    ]
  },

  {
    nome:
      "Alessandra Costa",

    presencas: [
      "x",
      "x",
      "P",
      "P",
      "J",
      ""
    ]
  },

  {
    nome:
      "Alexandre Medeiros",

    presencas: [
      "P",
      "P",
      "P",
      "—",
      "P",
      ""
    ]
  },

  {
    nome:
      "André Ricardo",

    presencas: [
      "P",
      "F",
      "P",
      "P",
      "J",
      ""
    ]
  }

];


/* ==========================================
   FORMATAR DATA
========================================== */

function formatarDataCurta(
  dataISO
) {

  const [
    ano,
    mes,
    dia
  ] =
    dataISO
      .split("-");


  return `${dia}/${mes}`;
}


/* ==========================================
   CRIAR CABEÇALHO
========================================== */

function criarCabecalho() {

  const linha =
    document.createElement(
      "tr"
    );


  const colunaNome =
    document.createElement(
      "th"
    );


  colunaNome.className =
    "coluna-nome-relatorio";


  colunaNome.textContent =
    "Associado";


  linha.appendChild(
    colunaNome
  );


  atividadesTeste.forEach(
    (atividade) => {

      const coluna =
        document.createElement(
          "th"
        );


      coluna.className =
        "coluna-data-relatorio";


      coluna.textContent =
        formatarDataCurta(
          atividade.data
        );


      linha.appendChild(
        coluna
      );

    }
  );


  cabecalhoTabelaRelatorio.innerHTML =
    "";


  cabecalhoTabelaRelatorio.appendChild(
    linha
  );

}


/* ==========================================
   CLASSE DO STATUS
========================================== */

function obterClasseStatus(
  status
) {

  if (
    status ===
    "P"
  ) {

    return "status-relatorio-presente";

  }


  if (
    status ===
    "F"
  ) {

    return "status-relatorio-falta";

  }


  if (
    status ===
    "J"
  ) {

    return "status-relatorio-justificado";

  }


  if (
    status ===
    "—"
  ) {

    return "status-relatorio-pendente";

  }


  if (
    status ===
    "x"
  ) {

    return "status-relatorio-nao-participava";

  }


  return "";

}


/* ==========================================
   CRIAR CORPO
========================================== */

function criarCorpo() {

  corpoTabelaRelatorio.innerHTML =
    "";


  associadosTeste.forEach(
    (associado) => {

      const linha =
        document.createElement(
          "tr"
        );


      const colunaNome =
        document.createElement(
          "td"
        );


      colunaNome.className =
        "coluna-nome-relatorio";


      colunaNome.textContent =
        associado.nome;


      linha.appendChild(
        colunaNome
      );


      associado.presencas.forEach(
        (status) => {

          const coluna =
            document.createElement(
              "td"
            );


          coluna.className =
            "celula-status-relatorio";


          const classeStatus =
            obterClasseStatus(
              status
            );


          if (
            classeStatus
          ) {

            coluna.classList.add(
              classeStatus
            );

          }


          coluna.textContent =
            status;


          linha.appendChild(
            coluna
          );

        }
      );


      corpoTabelaRelatorio.appendChild(
        linha
      );

    }
  );

}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

function iniciarPagina() {

  criarCabecalho();

  criarCorpo();

}


/* ==========================================
   INICIAR
========================================== */

iniciarPagina();
