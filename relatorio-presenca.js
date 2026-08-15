"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const listasRelatorioPresenca =
  document.getElementById(
    "listasRelatorioPresenca"
  );

const mensagemSemListasRelatorio =
  document.getElementById(
    "mensagemSemListasRelatorio"
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
    `relatorio-presenca-lista.html?id=${tipoLista.id}`;


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

async function carregarListasRelatorio() {

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

    listasRelatorioPresenca.innerHTML =
      "";


    mensagemSemListasRelatorio.hidden =
      listas.length > 0;


    listas.forEach(
      (tipoLista) => {

        listasRelatorioPresenca.appendChild(
          criarItemLista(
            tipoLista
          )
        );

      }
    );


  } catch (erro) {

    console.error(
      "Erro ao carregar listas para relatório:",
      erro
    );


    listasRelatorioPresenca.innerHTML =
      "<p>Não foi possível carregar as listas de presença.</p>";

  }

}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

carregarListasRelatorio();
