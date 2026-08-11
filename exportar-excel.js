"use strict";

/* ==========================================
   ELEMENTOS
========================================== */

const anoExportacao =
  document.getElementById(
    "anoExportacao"
  );

const resumoExportacao =
  document.getElementById(
    "resumoExportacao"
  );

const mensagemExportarExcel =
  document.getElementById(
    "mensagemExportarExcel"
  );

const botaoExportarExcel =
  document.getElementById(
    "botaoExportarExcel"
  );


/* ==========================================
   DADOS
========================================== */

let atividadesCarregadas = [];


/* ==========================================
   TIPOS
========================================== */

const nomesTipos = {
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
    "Obrigações",

  outros:
    "Outros"
};


/* ==========================================
   MENSAGENS
========================================== */

function mostrarMensagem(
  texto
) {
  mensagemExportarExcel.textContent =
    texto;

  mensagemExportarExcel.hidden =
    false;
}


function esconderMensagem() {
  mensagemExportarExcel.textContent =
    "";

  mensagemExportarExcel.hidden =
    true;
}


/* ==========================================
   FORMATAÇÃO
========================================== */

function formatarDataBrasil(
  dataISO
) {
  if (!dataISO) {
    return "";
  }

  const [
    ano,
    mes,
    dia
  ] =
    dataISO.split("-");

  return `${dia}/${mes}/${ano}`;
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


function nomeTipoAtividade(
  atividade
) {
  return (
    nomesTipos[
      atividade.tipo_atividade
    ] || "Outros"
  );
}


/* ==========================================
   FILTRAR POR ANO
========================================== */

function atividadesDoAno() {
  const ano =
    anoExportacao.value;

  return atividadesCarregadas.filter(
    (atividade) =>
      atividade.data?.startsWith(
        `${ano}-`
      )
  );
}


/* ==========================================
   RESUMO
========================================== */

function atualizarResumo() {
  const atividades =
    atividadesDoAno();

  resumoExportacao.textContent =
    atividades.length === 1
      ? "1 atividade encontrada."
      : `${atividades.length} atividades encontradas.`;

  botaoExportarExcel.disabled =
    atividades.length === 0;

  esconderMensagem();
}


/* ==========================================
   ANOS DISPONÍVEIS
========================================== */

function carregarAnos() {
  const anos =
    [
      ...new Set(
        atividadesCarregadas
          .map(
            (atividade) =>
              atividade.data
                ? atividade.data.slice(
                    0,
                    4
                  )
                : null
          )
          .filter(Boolean)
      )
    ]
      .sort(
        (a, b) =>
          Number(b) -
          Number(a)
      );


  anoExportacao.innerHTML =
    "";


  if (
    anos.length === 0
  ) {
    const opcao =
      document.createElement(
        "option"
      );

    opcao.textContent =
      "Nenhum ano disponível";

    opcao.value =
      "";

    anoExportacao.appendChild(
      opcao
    );

    resumoExportacao.textContent =
      "Nenhuma atividade encontrada.";

    return;
  }


  anos.forEach(
    (ano) => {

      const opcao =
        document.createElement(
          "option"
        );

      opcao.value =
        ano;

      opcao.textContent =
        ano;

      anoExportacao.appendChild(
        opcao
      );

    }
  );


  const anoAtual =
    String(
      new Date().getFullYear()
    );


  if (
    anos.includes(
      anoAtual
    )
  ) {
    anoExportacao.value =
      anoAtual;
  }


  atualizarResumo();
}


/* ==========================================
   CARREGAR SUPABASE
========================================== */

async function carregarAtividades() {
  if (
    !window.supabaseClient
  ) {
    return;
  }


  try {

    const resultado =
      await window.supabaseClient
        .from("atividades")
        .select(`
          titulo,
          data,
          hora_inicio,
          hora_fim,
          tipo_atividade,
          tipo_outro,
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


    if (
      resultado.error
    ) {
      throw resultado.error;
    }


    atividadesCarregadas =
      resultado.data || [];


    carregarAnos();


  } catch (erro) {

    console.error(
      "Erro ao carregar atividades:",
      erro
    );


    resumoExportacao.textContent =
      "Não foi possível carregar as atividades.";


    botaoExportarExcel.disabled =
      true;
  }
}


/* ==========================================
   EXPORTAR
========================================== */

function exportarExcel() {
  const ano =
    anoExportacao.value;


  if (!ano) {
    return;
  }


  const atividades =
    atividadesDoAno();


  if (
    atividades.length === 0
  ) {
    mostrarMensagem(
      "Não existem atividades para este ano."
    );

    return;
  }


  try {

    botaoExportarExcel.disabled =
      true;

    botaoExportarExcel.textContent =
      "GERANDO PLANILHA...";


    /*
      Mantém exatamente as mesmas colunas
      usadas na importação.
    */

    const dadosPlanilha =
      atividades.map(
        (atividade) => ({

          "Título":
            atividade.titulo || "",

          "Data":
            formatarDataBrasil(
              atividade.data
            ),

          "Hora Início":
            removerSegundos(
              atividade.hora_inicio
            ),

          "Hora Fim":
            removerSegundos(
              atividade.hora_fim
            ),

          "Tipo da Atividade":
            nomeTipoAtividade(
              atividade
            ),

          "Tipo Outros":
            atividade.tipo_atividade ===
              "outros"
              ? (
                  atividade.tipo_outro ||
                  ""
                )
              : "",

          "Observação":
            atividade.observacao ||
            ""

        })
      );


    /*
      Cria a planilha.
    */

    const planilha =
      XLSX.utils.json_to_sheet(
        dadosPlanilha
      );


    /*
      Largura das colunas.
    */

    planilha["!cols"] = [
      { wch: 32 },
      { wch: 13 },
      { wch: 14 },
      { wch: 12 },
      { wch: 25 },
      { wch: 22 },
      { wch: 45 }
    ];


    /*
      Cria o arquivo Excel.
    */

    const arquivo =
      XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
      arquivo,
      planilha,
      "Calendário"
    );


    /*
      Faz o navegador salvar
      o arquivo .xlsx.
    */

    XLSX.writeFile(
      arquivo,
      `Calendario_TUFRA_${ano}.xlsx`
    );


    mostrarMensagem(
      `${atividades.length} atividades exportadas com sucesso.`
    );


  } catch (erro) {

    console.error(
      "Erro ao exportar Excel:",
      erro
    );


    mostrarMensagem(
      "Não foi possível gerar a planilha."
    );

  } finally {

    botaoExportarExcel.disabled =
      false;

    botaoExportarExcel.textContent =
      "Exportar Excel";
  }
}


/* ==========================================
   EVENTOS
========================================== */

anoExportacao.addEventListener(
  "change",
  atualizarResumo
);


botaoExportarExcel.addEventListener(
  "click",
  exportarExcel
);


/* ==========================================
   INICIALIZAÇÃO
========================================== */

carregarAtividades();
