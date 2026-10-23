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
      /(^|[^\p{L}\p{M}])([\p{L}])/gu,
      (trecho, separador, letra) =>
        separador + letra.toUpperCase()
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


let associadosParaFiltrar = [];

function normalizarBuscaAssociado(valor) {
  return String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
}

function funcoesDoAssociado(associado) {
  return (associado.usuario_funcoes || []).map(item => item.funcoes).filter(Boolean);
}

function preencherFuncoesFiltro() {
  const select = document.getElementById('filtroFuncaoAssociado');
  select.replaceChildren(new Option('Todas as funções', ''));
  const funcoes = new Map();
  for (const associado of associadosParaFiltrar) {
    for (const funcao of funcoesDoAssociado(associado)) {
      funcoes.set(String(funcao.id || funcao.nome), funcao.nome);
    }
  }
  for (const [id, nome] of [...funcoes].sort((a,b) => a[1].localeCompare(b[1], 'pt-BR'))) {
    select.add(new Option(nome, id));
  }
  if (associadosParaFiltrar.some(a => !funcoesDoAssociado(a).length)) {
    select.add(new Option('Sem função cadastrada', '__sem_funcao__'));
  }
}

function aplicarFiltrosAssociados() {
  const termos = normalizarBuscaAssociado(document.getElementById('buscaNomeAssociado').value).split(/\s+/).filter(Boolean);
  const funcao = document.getElementById('filtroFuncaoAssociado').value;
  const filtrados = associadosParaFiltrar.filter(associado => {
    const nome = normalizarBuscaAssociado(associado.nome_completo);
    const funcoes = funcoesDoAssociado(associado);
    return termos.every(termo => nome.includes(termo)) &&
      (!funcao || (funcao === '__sem_funcao__' ? !funcoes.length : funcoes.some(f => String(f.id || f.nome) === funcao)));
  });
  listaAssociados.replaceChildren(...filtrados.map(criarItemAssociado));
  mensagemSemAssociados.hidden = filtrados.length > 0;
  mensagemSemAssociados.textContent = associadosParaFiltrar.length ? 'Nenhum associado corresponde aos filtros selecionados.' : 'Nenhum associado encontrado.';
  document.getElementById('resultadoFiltrosAssociados').textContent =
    `Exibindo ${filtrados.length} de ${associadosParaFiltrar.length} associados ativos.`;
}

document.getElementById('buscaNomeAssociado').addEventListener('input', aplicarFiltrosAssociados);
document.getElementById('filtroFuncaoAssociado').addEventListener('change', aplicarFiltrosAssociados);
document.getElementById('limparFiltrosAssociados').addEventListener('click', () => {
  document.getElementById('buscaNomeAssociado').value = '';
  document.getElementById('filtroFuncaoAssociado').value = '';
  aplicarFiltrosAssociados();
  document.getElementById('buscaNomeAssociado').focus();
});

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


    associadosParaFiltrar = associados;
    preencherFuncoesFiltro();
    document.getElementById('filtrosListaAssociados').hidden = false;
    aplicarFiltrosAssociados();


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
