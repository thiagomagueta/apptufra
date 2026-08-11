"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const listaAssociados =
  document.getElementById(
    "listaAssociados"
  );

const mensagemSemAssociados =
  document.getElementById(
    "mensagemSemAssociados"
  );


/* ==========================================
   FORMATAÇÃO DO NOME
========================================== */

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
      "Médium Corrente Principal"
    ) ||
    nomes.includes(
      "Médium Principal"
    )
  ) {
    return "Médium Principal";
  }


  if (
    nomes.includes(
      "Médium em Desenvolvimento"
    )
  ) {

    if (
      nomes.includes(
        "Corrente do Desenvolvimento"
      )
    ) {
      return "Desenv. Corrente";
    }


    if (
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
   ITEM DO ASSOCIADO
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
    `associado-resumo.html?id=${associado.id}&origem=lista`;


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
   ORDENAR PELO NOME
========================================== */

function ordenarAssociados(
  associados
) {

  return associados.sort(
    (a, b) => {

      const nomeA =
        String(
          a.nome_completo || ""
        );

      const nomeB =
        String(
          b.nome_completo || ""
        );


      return nomeA.localeCompare(
        nomeB,
        "pt-BR",
        {
          sensitivity: "base"
        }
      );

    }
  );
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

          usuario_funcoes!usuario_funcoes_usuario_id_fkey (
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
        );


    if (
      resultado.error
    ) {
      throw resultado.error;
    }


    const associados =
      ordenarAssociados(
        resultado.data || []
      );


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


/* ==========================================
   INICIALIZAÇÃO
========================================== */

carregarAssociados();
