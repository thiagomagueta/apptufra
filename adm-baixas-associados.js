"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const mensagemCarregamento =
  document.getElementById(
    "mensagemCarregamento"
  );

const listaAssociadosInativos =
  document.getElementById(
    "listaAssociadosInativos"
  );

const mensagemSemAssociados =
  document.getElementById(
    "mensagemSemAssociados"
  );


/* ==========================================
   FORMATAR DATA
========================================== */

function formatarDataBrasil(data) {

  if (
    !data
  ) {

    return "Não informado";

  }


  const partes =
    String(data).split("-");


  if (
    partes.length !== 3
  ) {

    return data;

  }


  return (
    partes[2] +
    "/" +
    partes[1] +
    "/" +
    partes[0]
  );

}


/* ==========================================
   CRIAR ITEM DA LISTA
========================================== */

function criarItemAssociadoInativo(associado) {

  const link =
    document.createElement(
      "a"
    );


  link.className =
    "item-acao-administrativa";


  link.href =
    "associado-resumo.html?id=" +
    encodeURIComponent(
      associado.id
    );


  const conteudo =
    document.createElement(
      "div"
    );


  conteudo.className =
    "conteudo-item-adm";


  const titulo =
    document.createElement(
      "strong"
    );


  titulo.className =
    "titulo-item-adm";


  titulo.textContent =
    associado.nome_completo ||
    "Nome não informado";


  const descricao =
    document.createElement(
      "span"
    );


  descricao.className =
    "descricao-item-adm";


  const dataEntrada =
    formatarDataBrasil(
      associado.data_entrada_tufra
    );


  const dataSaida =
    formatarDataBrasil(
      associado.data_saida_tufra
    );


  const motivo =
    associado.motivo_saida
      ? associado.motivo_saida
      : "Não informado";


  descricao.textContent =
    "Entrada: " +
    dataEntrada +
    " • Saída: " +
    dataSaida +
    " • Motivo: " +
    motivo;


  conteudo.appendChild(
    titulo
  );


  conteudo.appendChild(
    descricao
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
    conteudo
  );


  link.appendChild(
    seta
  );


  return link;

}


/* ==========================================
   CARREGAR ASSOCIADOS INATIVOS
========================================== */

async function carregarAssociadosInativos() {

  if (
    !window.supabaseClient
  ) {

    window.location.href =
      "dashboard.html";

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
       BUSCAR ASSOCIADOS INATIVOS
    -------------------------------------- */

    const resultadoAssociados =
      await window.supabaseClient
        .from(
          "usuarios"
        )
        .select(`
          id,
          nome_completo,
          data_entrada_tufra,
          data_saida_tufra,
          motivo_saida
        `)
        .eq(
          "status",
          "inativo"
        )
        .order(
          "nome_completo",
          {
            ascending: true
          }
        );


    if (
      resultadoAssociados.error
    ) {

      throw resultadoAssociados.error;

    }


    const associados =
      resultadoAssociados.data ||
      [];


    /* --------------------------------------
       FINALIZA CARREGAMENTO
    -------------------------------------- */

    if (
      mensagemCarregamento
    ) {

      mensagemCarregamento.hidden =
        true;

    }


    /* --------------------------------------
       NENHUM INATIVO
    -------------------------------------- */

    if (
      associados.length === 0
    ) {

      if (
        listaAssociadosInativos
      ) {

        listaAssociadosInativos.hidden =
          true;

      }


      if (
        mensagemSemAssociados
      ) {

        mensagemSemAssociados.hidden =
          false;

      }


      return;

    }


    /* --------------------------------------
       MONTAR LISTA
    -------------------------------------- */

    if (
      listaAssociadosInativos
    ) {

      listaAssociadosInativos.innerHTML =
        "";


      associados.forEach(
        (associado) => {

          const item =
            criarItemAssociadoInativo(
              associado
            );


          listaAssociadosInativos.appendChild(
            item
          );

        }
      );


      listaAssociadosInativos.hidden =
        false;

    }


    if (
      mensagemSemAssociados
    ) {

      mensagemSemAssociados.hidden =
        true;

    }


  } catch (erro) {

    console.error(
      "Erro ao carregar associados inativos:",
      erro
    );


    if (
      mensagemCarregamento
    ) {

      mensagemCarregamento.hidden =
        true;

    }


    if (
      mensagemSemAssociados
    ) {

      mensagemSemAssociados.hidden =
        false;


      mensagemSemAssociados.textContent =
        "Não foi possível carregar os associados inativos.";

    }

  }

}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

carregarAssociadosInativos();
