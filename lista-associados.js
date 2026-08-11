"use strict";


const listaAssociados =
  document.getElementById(
    "listaAssociados"
  );

const mensagemSemAssociados =
  document.getElementById(
    "mensagemSemAssociados"
  );


function formatarNome(nomeCompleto) {
  return String(
    nomeCompleto || ""
  )
    .trim()
    .toLowerCase()
    .replace(
      /\b\p{L}/gu,
      (letra) =>
        letra.toUpperCase()
    );
}


/* ==========================================
   FUNÇÃO PRIORITÁRIA
========================================== */

function obterFuncaoPrioritaria(
  funcoes
) {
  const nomes =
    funcoes
      .map(
        (item) =>
          item.funcoes?.nome
      )
      .filter(Boolean);


  if (
    nomes.includes(
      "Sacerdote"
    )
  ) {
    return "Sacerdote";
  }


  if (
    nomes.includes(
      "Pai/Mãe Pequeno (a)"
    )
  ) {
    return "Pai/Mãe Pequeno(a)";
  }


  if (
    nomes.includes(
      "Médium Principal"
    )
  ) {
    return "Médium Principal";
  }


  /*
    DESENVOLVIMENTO
  */

  if (
    nomes.includes(
      "Médium em Desenvolvimento"
    )
  ) {

    if (
      nomes.includes(
        "Corrente"
      ) ||
      nomes.includes(
        "Corrente do Desenvolvimento"
      )
    ) {
      return "Desenv. Corrente";
    }

    if (
      nomes.includes(
        "Banco"
      ) ||
      nomes.includes(
        "Banco do Desenvolvimento"
      )
    ) {
      return "Desenv. Banco";
    }

    return "Desenvolvimento";
  }


  if (
    nomes.includes(
      "Cambone"
    )
  ) {
    return "Cambone";
  }


  if (
    nomes.includes(
      "Ogam"
    )
  ) {
    return "Ogam";
  }


  if (
    nomes.includes(
      "Cantina"
    )
  ) {
    return "Cantina";
  }


  if (
    nomes.includes(
      "Assistência"
    )
  ) {
    return "Assistência";
  }


  return "—";
}


/* ==========================================
   CRIAR LINHA
========================================== */

function criarItemAssociado(
  associado
) {
  const link =
    document.createElement(
      "a"
    );

  link.className =
    "item-lista-associado";

  link.href =
    `associado-resumo.html?id=${associado.id}`;


  const funcao =
    document.createElement(
      "span"
    );

  funcao.className =
    "funcao-lista-associado";

  funcao.textContent =
    obterFuncaoPrioritaria(
      associado.usuario_funcoes ||
      []
    );


  const nome =
    document.createElement(
      "strong"
    );

  nome.className =
    "nome-lista-associado";

  nome.textContent =
    formatarNome(
      associado.nome_completo
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
    funcao
  );

  link.appendChild(
    nome
  );

  link.appendChild(
    seta
  );


  return link;
}


/* ==========================================
   CARREGAR ASSOCIADOS
========================================== */

async function carregarAssociados() {
  if (
    !window.supabaseClient
  ) {
    return;
  }


  try {

    const resultado =
      await window.supabaseClient
        .from("usuarios")
        .select(`
          id,
          nome_completo,
          status,
          ficha_concluida,
          usuario_funcoes (
            funcao_id,
            funcoes (
              id,
              nome
            )
          )
        `)
        .eq(
          "status",
          "ativo"
        )
        .order(
          "nome_completo",
          {
            ascending: true
          }
        );


    if (
      resultado.error
    ) {
      throw resultado.error;
    }


    const associados =
      resultado.data || [];


    listaAssociados.innerHTML =
      "";


    mensagemSemAssociados.hidden =
      associados.length > 0;


    associados.forEach(
      (associado) => {

        listaAssociados.appendChild(
          criarItemAssociado(
            associado
          )
        );

      }
    );


  } catch (erro) {

    console.error(
      "Erro ao carregar associados:",
      erro
    );


    listaAssociados.innerHTML =
      "<p>Não foi possível carregar os associados.</p>";
  }
}


carregarAssociados();
