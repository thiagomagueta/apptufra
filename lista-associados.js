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


  if (nomes.includes("Banco sábado")) {
    return "Desenv. Sábado";
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
    funcoes.some(item =>
      item.funcoes?.nome === "Assistência" &&
      item.funcoes.funcao_pai_id === null
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


  const funcaoEEntrada = document.createElement("span");
  funcaoEEntrada.className = "funcao-entrada-lista-associado";
  funcaoEEntrada.appendChild(funcao);
  const entrada = document.createElement("small");
  entrada.className = "entrada-lista-associado";
  const dataEntrada = associado.data_entrada_tufra;
  entrada.textContent = "Entrada: " + (dataEntrada && /^\d{4}-\d{2}-\d{2}$/.test(dataEntrada) ? dataEntrada.split("-").reverse().join("/") : "Não informada");
  funcaoEEntrada.appendChild(entrada);
  link.appendChild(funcaoEEntrada);


  link.appendChild(
    nome
  );

  const formatarDataTabela = valor =>
    valor && /^\d{4}-\d{2}-\d{2}$/.test(valor)
      ? valor.split("-").reverse().join("/")
      : "—";

  const dataDesenv = document.createElement("span");
  dataDesenv.className = "data-horizontal-associado data-desenvolvimento-associado";
  dataDesenv.textContent = formatarDataTabela(associado.data_corrente_desenvolvimento);
  link.appendChild(dataDesenv);

  const dataPrincipal = document.createElement("span");
  dataPrincipal.className = "data-horizontal-associado data-principal-associado";
  dataPrincipal.textContent = formatarDataTabela(associado.data_corrente_principal);
  link.appendChild(dataPrincipal);


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
let associadosExibidos = [];

const acoesListaAssociados = document.getElementById("acoesListaAssociados");
const avisoExportacaoAssociados = document.getElementById("avisoExportacaoAssociados");
const botaoExcelAssociados = document.getElementById("exportarAssociadosExcel");

function normalizarBuscaAssociado(valor) {
  return String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
}

// Mantém os rótulos resumidos, mas considera todas as funções atribuídas.
function obterCategoriasFiltroAssociado(associado) {
  const nomes = (associado.usuario_funcoes || [])
    .map(item => item.funcoes)
    .filter(funcao => funcao &&
      (funcao.nome !== 'Assistência' || funcao.funcao_pai_id === null))
    .map(funcao => funcao.nome).filter(Boolean);
  const rotulos = {
    'Sacerdote': 'Sacerdote',
    'Pai/Mãe Pequeno (a)': 'Pai/Mãe Pequeno(a)',
    'Médium Corrente Principal': 'Médium Principal',
    'Médium Principal': 'Médium Principal',
    'Banco sábado': 'Desenv. Sábado',
    'Banco do Desenvolvimento': 'Desenv. Banco',
    'Corrente do Desenvolvimento': 'Desenv. Corrente',
    'Cambone': 'Cambone',
    'Ogam': 'Ogam',
    'Cantina': 'Cantina',
    'Assistência': 'Assistência'
  };
  const categorias = new Set(nomes.map(nome => rotulos[nome]).filter(Boolean));
  if (nomes.includes('Médium em Desenvolvimento') &&
      !nomes.includes('Banco sábado') &&
      !nomes.includes('Banco do Desenvolvimento') &&
      !nomes.includes('Corrente do Desenvolvimento')) {
    categorias.add('Desenvolvimento');
  }
  if (!categorias.size) categorias.add('—');
  return [...categorias];
}

function preencherFuncoesFiltro() {
  const select = document.getElementById('filtroFuncaoAssociado');
  select.replaceChildren(new Option('Todas as funções', ''));
  const categorias = [...new Set(associadosParaFiltrar.flatMap(obterCategoriasFiltroAssociado))];
  categorias.sort((a, b) => a.localeCompare(b, 'pt-BR'));
  for (const categoria of categorias) {
    select.add(new Option(categoria, categoria));
  }
}

function aplicarFiltrosAssociados() {
  const termos = normalizarBuscaAssociado(document.getElementById('buscaNomeAssociado').value).split(/\s+/).filter(Boolean);
  const funcao = document.getElementById('filtroFuncaoAssociado').value;
  const filtrados = associadosParaFiltrar.filter(associado => {
    const nome = normalizarBuscaAssociado(associado.nome_completo);
    const categorias = obterCategoriasFiltroAssociado(associado);
    return termos.every(termo => nome.includes(termo)) &&
      (!funcao || categorias.includes(funcao));
  });
  const ordem = document.getElementById("ordenacaoAssociados").value;
  filtrados.sort((a, b) => {
    if (ordem !== "nome") {
      const dataA = a.data_entrada_tufra || "";
      const dataB = b.data_entrada_tufra || "";
      if (!dataA && dataB) return 1;
      if (dataA && !dataB) return -1;
      const diferenca = dataA.localeCompare(dataB) * (ordem === "recentes" ? -1 : 1);
      if (diferenca) return diferenca;
    }
    return String(a.nome_completo || "").localeCompare(String(b.nome_completo || ""), "pt-BR", { sensitivity: "base" });
  });
  associadosExibidos = filtrados;
  acoesListaAssociados.hidden = !filtrados.length;
  avisoExportacaoAssociados.textContent = "";
  listaAssociados.replaceChildren(...filtrados.map(criarItemAssociado));
  mensagemSemAssociados.hidden = filtrados.length > 0;
  mensagemSemAssociados.textContent = associadosParaFiltrar.length ? 'Nenhum associado corresponde aos filtros selecionados.' : 'Nenhum associado encontrado.';
  document.getElementById('resultadoFiltrosAssociados').textContent =
    `Exibindo ${filtrados.length} de ${associadosParaFiltrar.length} associados ativos.`;
}

document.getElementById('buscaNomeAssociado').addEventListener('input', aplicarFiltrosAssociados);
document.getElementById('filtroFuncaoAssociado').addEventListener('change', aplicarFiltrosAssociados);
document.getElementById('ordenacaoAssociados').addEventListener('change', aplicarFiltrosAssociados);
document.getElementById('limparFiltrosAssociados').addEventListener('click', () => {
  document.getElementById('buscaNomeAssociado').value = '';
  document.getElementById('filtroFuncaoAssociado').value = '';
  document.getElementById('ordenacaoAssociados').value = 'nome';
  aplicarFiltrosAssociados();
  document.getElementById('buscaNomeAssociado').focus();
});

document.getElementById("enviarAssociadosWhatsapp").addEventListener("click", () => {
  if (!associadosExibidos.length) return;

  const nomes = associadosExibidos.map(associado => "- " + formatarNome(associado.nome_completo));
  const mensagem = ["*Lista de Associados Ativos — TUFRA*", "", ...nomes].join("\n");
  const url = "https://wa.me/?text=" + encodeURIComponent(mensagem);
  const janela = window.open(url, "_blank");
  if (janela) {
    janela.opener = null;
  } else {
    window.location.href = url;
  }
});

function dataParaExcel(data) {
  if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) return null;
  // O Excel armazena datas como dias, sem considerar o fuso horário.
  return Date.parse(data) / 86400000 + 25569;
}

botaoExcelAssociados.addEventListener("click", async () => {
  if (!associadosExibidos.length) return;

  const associados = associadosExibidos;
  botaoExcelAssociados.disabled = true;
  avisoExportacaoAssociados.textContent = "Preparando a planilha...";

  try {
    const xlsx = window.XLSX;
    if (!xlsx) throw new Error("Biblioteca de Excel indisponível.");

    const periodos = await window.TufraPeriodos.carregar(true);
    const inicioDesenvolvimento = new Map();
    for (const { usuario_id, grupo, data_inicio } of periodos) {
      if (["banco_terca", "corrente_terca", "banco_sabado"].includes(grupo) &&
          !inicioDesenvolvimento.has(usuario_id)) {
        inicioDesenvolvimento.set(usuario_id, data_inicio);
      }
    }

    const cabecalho = [
      "Nome completo do associado",
      "Função",
      "Data de entrada no TUFRA",
      "Data de início no desenvolvimento",
      "Data de início na corrente do desenvolvimento",
      "Data de início na corrente da gira principal"
    ];
    const linhas = associados.map(associado => [
      formatarNome(associado.nome_completo),
      obterFuncaoPrioritaria(associado.usuario_funcoes || []),
      dataParaExcel(associado.data_entrada_tufra),
      dataParaExcel(inicioDesenvolvimento.get(associado.id)),
      dataParaExcel(associado.data_corrente_desenvolvimento),
      dataParaExcel(associado.data_corrente_principal)
    ]);

    const planilha = xlsx.utils.aoa_to_sheet([cabecalho, ...linhas]);
    planilha["!cols"] = [44, 24, 28, 36, 48, 46].map(wch => ({ wch }));
    linhas.forEach((linha, indice) => {
      for (let coluna = 2; coluna < linha.length; coluna++) {
        const celula = planilha[xlsx.utils.encode_cell({ r: indice + 1, c: coluna })];
        if (celula) celula.z = "dd/mm/yyyy";
      }
    });

    const arquivo = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(arquivo, planilha, "Associados ativos");
    xlsx.writeFile(arquivo, "Associados_Ativos_TUFRA.xlsx");
    avisoExportacaoAssociados.textContent = "Planilha gerada.";
  } catch (erro) {
    console.error("Erro ao exportar associados:", erro);
    avisoExportacaoAssociados.textContent = "Não foi possível gerar a planilha. Tente novamente.";
  } finally {
    botaoExcelAssociados.disabled = false;
  }
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
          data_entrada_tufra,
          data_corrente_desenvolvimento,
          data_corrente_principal,
          status,
          ficha_concluida,

          usuario_funcoes!usuario_funcoes_usuario_id_fkey (
            funcao_id,

            funcoes (
              id,
              nome,
              funcao_pai_id
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
