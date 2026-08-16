"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const listasRelatorioAssociado =
  document.getElementById(
    "listasRelatorioAssociado"
  );

const mensagemSemListasRelatorioAssociado =
  document.getElementById(
    "mensagemSemListasRelatorioAssociado"
  );


/* ==========================================
   CRIAR ITEM
========================================== */

function criarItemLista(
  tipoLista
) {

  const link =
    document.createElement(
      "a"
    );


  link.className =
    "item-acao-administrativa";


  link.href =
    `relatorio-associado-lista.html?id=${tipoLista.id}`;


  const nome =
    document.createElement(
      "span"
    );


  nome.textContent =
    tipoLista.nome;


  const seta =
    document.createElement(
      "span"
    );


  seta.className =
    "seta-permissao-lista";


  seta.textContent =
    "›";


  link.appendChild(
    nome
  );


  link.appendChild(
    seta
  );


  return link;
}


/* ==========================================
   CARREGAR LISTAS
========================================== */

async function carregarListasRelatorioAssociado() {

  if (
    !window.supabaseClient
  ) {

    return;

  }


  try {

    /* --------------------------------------
       SESSÃO
    -------------------------------------- */

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

      return;

    }


    /* --------------------------------------
       LISTAS ATIVAS
    -------------------------------------- */

    const resultadoListas =
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
      resultadoListas.error
    ) {

      throw resultadoListas.error;

    }


    const listas =
      resultadoListas.data ||
      [];


    /* --------------------------------------
       EXIBIR
    -------------------------------------- */

    listasRelatorioAssociado.innerHTML =
      "";


    mensagemSemListasRelatorioAssociado.hidden =
      listas.length > 0;


    listas.forEach(
      (tipoLista) => {

        listasRelatorioAssociado.appendChild(
          criarItemLista(
            tipoLista
          )
        );

      }
    );


  } catch (erro) {

    console.error(
      "Erro ao carregar listas para relatório por associado:",
      erro
    );


    listasRelatorioAssociado.innerHTML =
      "<p>Não foi possível carregar as listas de presença.</p>";

  }

}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

carregarListasRelatorioAssociado();
