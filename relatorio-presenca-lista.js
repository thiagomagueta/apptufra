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

const containerTabelaRelatorio =
  document.getElementById(
    "containerTabelaRelatorio"
  );

const cabecalhoTabelaRelatorio =
  document.getElementById(
    "cabecalhoTabelaRelatorio"
  );

const corpoTabelaRelatorio =
  document.getElementById(
    "corpoTabelaRelatorio"
  );

const mensagemSemDadosRelatorio =
  document.getElementById(
    "mensagemSemDadosRelatorio"
  );


/* ==========================================
   DADOS
========================================== */

let tipoListaId =
  null;

let tipoListaNome =
  "";

let tipoAtividadeLista =
  null;

let todasAtividades =
  [];

let associadosDaLista =
  [];

let presencas =
  [];


/* ==========================================
   DIRETORIA
========================================== */

const funcoesDiretoria = [
  "Sacerdote",
  "Pai/Mãe Pequeno (a)",
  "Tesoureiro",
  "Secretária",
  "Presidente"
];


/* ==========================================
   PARÂMETRO
========================================== */

function obterTipoListaId() {

  const parametros =
    new URLSearchParams(
      window.location.search
    );


  return parametros.get(
    "id"
  );

}


/* ==========================================
   DATA ATUAL LOCAL
========================================== */

function obterDataAtualISO() {

  const hoje =
    new Date();


  const ano =
    hoje.getFullYear();


  const mes =
    String(
      hoje.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const dia =
    String(
      hoje.getDate()
    ).padStart(
      2,
      "0"
    );


  return `${ano}-${mes}-${dia}`;

}


/* ==========================================
   FORMATAÇÃO
========================================== */

function formatarNome(
  nomeCompleto
) {

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
   VALIDAR DIRETORIA
========================================== */

async function validarDiretoria() {

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


    throw new Error(
      "Sessão não encontrada."
    );

  }


  const resultadoUsuario =
    await window.supabaseClient
      .from(
        "usuarios"
      )
      .select(
        "id"
      )
      .eq(
        "auth_id",
        sessao.user.id
      )
      .maybeSingle();


  if (
    resultadoUsuario.error
  ) {

    throw resultadoUsuario.error;

  }


  if (
    !resultadoUsuario.data
  ) {

    throw new Error(
      "Usuário não encontrado."
    );

  }


  const resultadoFuncoes =
    await window.supabaseClient
      .from(
        "usuario_funcoes"
      )
      .select(`
        funcoes (
          nome
        )
      `)
      .eq(
        "usuario_id",
        resultadoUsuario.data.id
      );


  if (
    resultadoFuncoes.error
  ) {

    throw resultadoFuncoes.error;

  }


  const nomesFuncoes =
    (
      resultadoFuncoes.data ||
      []
    )
      .map(
        (item) =>
          item.funcoes?.nome
      )
      .filter(Boolean);


  const pertenceDiretoria =
    nomesFuncoes.some(
      (funcao) =>
        funcoesDiretoria.includes(
          funcao
        )
    );


  if (
    !pertenceDiretoria
  ) {

    window.location.href =
      "administrativo.html";


    throw new Error(
      "Usuário não autorizado."
    );

  }

}


/* ==========================================
   FUNÇÕES DE CADA LISTA
========================================== */

function nomesFuncoesDaLista(
  nomeLista
) {

  if (
    nomeLista ===
    "Corrente Principal"
  ) {

    return [
      "Médium Corrente Principal",
      "Médium Principal"
    ];

  }


  if (
    nomeLista ===
    "Desenvolvimento"
  ) {

    return [
      "Médium em Desenvolvimento"
    ];

  }


  if (
    nomeLista ===
    "Ogans"
  ) {

    return [
      "Ogam"
    ];

  }


  if (
    nomeLista ===
    "Cantina"
  ) {

    return [
      "Cantina"
    ];

  }


  if (
    nomeLista ===
    "Cambones"
  ) {

    return [
      "Cambone"
    ];

  }


  return [];

}


/* ==========================================
   DATA DE ENTRADA DA LISTA
========================================== */

function obterDataEntradaNaLista(
  associado
) {

  if (
    tipoListaNome ===
    "Corrente Principal"
  ) {

    return associado.data_corrente_principal ||
      associado.data_entrada_tufra ||
      null;

  }


  if (
    tipoListaNome ===
    "Desenvolvimento"
  ) {

    return associado.data_corrente_desenvolvimento ||
      associado.data_entrada_tufra ||
      null;

  }


  return associado.data_entrada_tufra ||
    null;

}


/* ==========================================
   CARREGAR TIPO DA LISTA
========================================== */

async function carregarTipoLista() {

  const resultado =
    await window.supabaseClient
      .from(
        "tipos_lista_presenca"
      )
      .select(`
        id,
        nome,
        tipo_atividade,
        ativo
      `)
      .eq(
        "id",
        tipoListaId
      )
      .maybeSingle();


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  if (
    !resultado.data
  ) {

    throw new Error(
      "Lista de presença não encontrada."
    );

  }


  tipoListaNome =
    resultado.data.nome;


  tipoAtividadeLista =
    resultado.data.tipo_atividade;


  tituloRelatorioLista.textContent =
    tipoListaNome;

}


/* ==========================================
   CARREGAR TODAS AS ATIVIDADES
========================================== */

async function carregarTodasAtividades() {

  const resultado =
    await window.supabaseClient
      .from(
        "atividades"
      )
      .select(`
        id,
        titulo,
        data,
        hora_inicio,
        tipo_atividade
      `)
      .eq(
        "tipo_atividade",
        tipoAtividadeLista
      )
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


  todasAtividades =
    resultado.data ||
    [];

}


/* ==========================================
   CARREGAR ANOS DISPONÍVEIS
========================================== */

function carregarAnosDisponiveis() {

  const anos =
    [
      ...new Set(
        todasAtividades
          .map(
            (atividade) =>
              Number(
                String(
                  atividade.data
                ).slice(
                  0,
                  4
                )
              )
          )
          .filter(Boolean)
      )
    ]
      .sort(
        (a, b) =>
          b - a
      );


  anoRelatorioPresenca.innerHTML =
    "";


  if (
    anos.length ===
    0
  ) {

    const opcao =
      document.createElement(
        "option"
      );


    opcao.value =
      "";


    opcao.textContent =
      "Sem anos";


    anoRelatorioPresenca.appendChild(
      opcao
    );


    anoRelatorioPresenca.disabled =
      true;


    return;

  }


  anos.forEach(
    (ano) => {

      const opcao =
        document.createElement(
          "option"
        );


      opcao.value =
        String(
          ano
        );


      opcao.textContent =
        String(
          ano
        );


      anoRelatorioPresenca.appendChild(
        opcao
      );

    }
  );


  const anoAtual =
    new Date()
      .getFullYear();


  if (
    anos.includes(
      anoAtual
    )
  ) {

    anoRelatorioPresenca.value =
      String(
        anoAtual
      );

  } else {

    anoRelatorioPresenca.value =
      String(
        anos[0]
      );

  }


  anoRelatorioPresenca.disabled =
    false;

}


/* ==========================================
   CARREGAR ASSOCIADOS
========================================== */

async function carregarAssociados() {

  const funcoesNecessarias =
    nomesFuncoesDaLista(
      tipoListaNome
    );


  if (
    funcoesNecessarias.length ===
    0
  ) {

    associadosDaLista =
      [];

    return;

  }


  const resultado =
    await window.supabaseClient
      .from(
        "usuarios"
      )
      .select(`
        id,
        nome_completo,
        status,
        data_entrada_tufra,
        data_corrente_desenvolvimento,
        data_corrente_principal,

        usuario_funcoes!usuario_funcoes_usuario_id_fkey (
          funcoes (
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


  associadosDaLista =
    (
      resultado.data ||
      []
    )
      .filter(
        (usuario) => {

          const nomes =
            (
              usuario.usuario_funcoes ||
              []
            )
              .map(
                (item) =>
                  item.funcoes?.nome
              )
              .filter(Boolean);


          return funcoesNecessarias.some(
            (funcao) =>
              nomes.includes(
                funcao
              )
          );

        }
      )
      .sort(
        (a, b) =>
          String(
            a.nome_completo ||
            ""
          ).localeCompare(
            String(
              b.nome_completo ||
              ""
            ),
            "pt-BR",
            {
              sensitivity:
                "base"
            }
          )
      );

}


/* ==========================================
   CARREGAR PRESENÇAS
========================================== */

async function carregarPresencas() {

  const resultado =
    await window.supabaseClient
      .from(
        "presencas"
      )
      .select(`
        atividade_id,
        usuario_id,
        status
      `)
      .eq(
        "tipo_lista_id",
        tipoListaId
      );


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  presencas =
    resultado.data ||
    [];

}


/* ==========================================
   ATIVIDADES DO ANO
========================================== */

function obterAtividadesDoAno(
  ano
) {

  return todasAtividades.filter(
    (atividade) =>
      String(
        atividade.data
      ).startsWith(
        `${ano}-`
      )
  );

}


/* ==========================================
   OBTER PRESENÇA
========================================== */

function obterPresenca(
  usuarioId,
  atividadeId
) {

  return presencas.find(
    (registro) =>
      registro.usuario_id ===
        usuarioId &&
      registro.atividade_id ===
        atividadeId
  );

}


/* ==========================================
   DEFINIR CÉLULA
========================================== */

function obterSituacaoCelula(
  associado,
  atividade
) {

  const hojeISO =
    obterDataAtualISO();


  /* --------------------------------------
     DATA FUTURA
  -------------------------------------- */

  if (
    atividade.data >
    hojeISO
  ) {

    return {

      texto:
        "",

      classe:
        ""

    };

  }


  /* --------------------------------------
     AINDA NÃO PARTICIPAVA DESTA LISTA
  -------------------------------------- */

  const dataEntradaLista =
    obterDataEntradaNaLista(
      associado
    );


  if (
    dataEntradaLista &&
    dataEntradaLista >
      atividade.data
  ) {

    return {

      texto:
        "x",

      classe:
        "status-relatorio-nao-participava"

    };

  }


  /* --------------------------------------
     PRESENÇA REGISTRADA
  -------------------------------------- */

  const registro =
    obterPresenca(
      associado.id,
      atividade.id
    );


  if (
    registro?.status ===
    "presente"
  ) {

    return {

      texto:
        "P",

      classe:
        "status-relatorio-presente"

    };

  }


  if (
    registro?.status ===
    "falta"
  ) {

    return {

      texto:
        "F",

      classe:
        "status-relatorio-falta"

    };

  }


  if (
    registro?.status ===
    "justificada"
  ) {

    return {

      texto:
        "J",

      classe:
        "status-relatorio-justificado"

    };

  }


  /* --------------------------------------
     PENDENTE
  -------------------------------------- */

  return {

    texto:
      "—",

    classe:
      "status-relatorio-pendente"

  };

}


/* ==========================================
   CRIAR CABEÇALHO
========================================== */

function criarCabecalho(
  atividades
) {

  cabecalhoTabelaRelatorio.innerHTML =
    "";


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


  atividades.forEach(
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


      coluna.title =
        atividade.titulo;


      linha.appendChild(
        coluna
      );

    }
  );


  cabecalhoTabelaRelatorio.appendChild(
    linha
  );

}


/* ==========================================
   CRIAR CORPO
========================================== */

function criarCorpo(
  atividades
) {

  corpoTabelaRelatorio.innerHTML =
    "";


  associadosDaLista.forEach(
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
        formatarNome(
          associado.nome_completo
        );


      linha.appendChild(
        colunaNome
      );


      atividades.forEach(
        (atividade) => {

          const coluna =
            document.createElement(
              "td"
            );


          coluna.className =
            "celula-status-relatorio";


          const situacao =
            obterSituacaoCelula(
              associado,
              atividade
            );


          coluna.textContent =
            situacao.texto;


          if (
            situacao.classe
          ) {

            coluna.classList.add(
              situacao.classe
            );

          }


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
   RENDERIZAR ANO
========================================== */

function renderizarAnoSelecionado() {

  const ano =
    anoRelatorioPresenca.value;


  if (
    !ano
  ) {

    containerTabelaRelatorio.hidden =
      true;


    mensagemSemDadosRelatorio.hidden =
      false;


    return;

  }


  const atividades =
    obterAtividadesDoAno(
      ano
    );


  if (
    atividades.length ===
    0
  ) {

    containerTabelaRelatorio.hidden =
      true;


    mensagemSemDadosRelatorio.hidden =
      false;


    return;

  }


  containerTabelaRelatorio.hidden =
    false;


  mensagemSemDadosRelatorio.hidden =
    true;


  criarCabecalho(
    atividades
  );


  criarCorpo(
    atividades
  );

}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

async function iniciarPagina() {

  tipoListaId =
    obterTipoListaId();


  if (
    !tipoListaId
  ) {

    window.location.href =
      "relatorio-presenca.html";

    return;

  }


  if (
    !window.supabaseClient
  ) {

    return;

  }


  try {

    await validarDiretoria();

    await carregarTipoLista();

    await carregarTodasAtividades();

    carregarAnosDisponiveis();

    await carregarAssociados();

    await carregarPresencas();

    renderizarAnoSelecionado();


  } catch (erro) {

    console.error(
      "Erro ao carregar relatório geral de presença:",
      erro
    );


    corpoTabelaRelatorio.innerHTML =
      "<tr><td>Não foi possível carregar o relatório.</td></tr>";

  }

}


/* ==========================================
   TROCAR ANO
========================================== */

anoRelatorioPresenca.addEventListener(
  "change",
  renderizarAnoSelecionado
);


/* ==========================================
   INICIAR
========================================== */

iniciarPagina();
