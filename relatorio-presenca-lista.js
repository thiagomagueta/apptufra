"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const listaRelatorioPresenca =
  document.getElementById(
    "listaRelatorioPresenca"
  );

const anoRelatorioPresenca =
  document.getElementById(
    "anoRelatorioPresenca"
  );

const areaRelatorioGeral =
  document.getElementById(
    "areaRelatorioGeral"
  );

const tituloListaRelatorioGeral =
  document.getElementById(
    "tituloListaRelatorioGeral"
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
   RESUMO DO ANO
========================================== */

const resumoAnualPresenca =
  document.getElementById(
    "resumoAnualPresenca"
  );

const anoResumoPresenca =
  document.getElementById(
    "anoResumoPresenca"
  );

const totalAtividadesRealizadas =
  document.getElementById(
    "totalAtividadesRealizadas"
  );

const totalPresencas =
  document.getElementById(
    "totalPresencas"
  );

const totalFaltas =
  document.getElementById(
    "totalFaltas"
  );

const totalJustificadas =
  document.getElementById(
    "totalJustificadas"
  );

const totalPendentes =
  document.getElementById(
    "totalPendentes"
  );

const frequenciaGeralPresenca =
  document.getElementById(
    "frequenciaGeralPresenca"
  );


/* ==========================================
   DADOS
========================================== */

let listasPresenca =
  [];

let tipoListaAtual =
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
   DATA ATUAL
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
    dataISO.split("-");


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
   DATA DE ENTRADA NA LISTA
========================================== */

function obterDataEntradaNaLista(
  associado
) {

  if (
    !tipoListaAtual
  ) {

    return null;

  }


  if (
    tipoListaAtual.nome ===
    "Corrente Principal"
  ) {

    return associado.data_corrente_principal ||
      associado.data_entrada_tufra ||
      null;

  }


  if (
    tipoListaAtual.nome ===
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
   CARREGAR LISTAS
========================================== */

async function carregarListas() {

  const resultado =
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
    resultado.error
  ) {

    throw resultado.error;

  }


  listasPresenca =
    resultado.data ||
    [];


  listaRelatorioPresenca.innerHTML =
    "";


  if (
    listasPresenca.length ===
    0
  ) {

    const opcao =
      document.createElement(
        "option"
      );


    opcao.value =
      "";


    opcao.textContent =
      "Nenhuma lista";


    listaRelatorioPresenca.appendChild(
      opcao
    );


    listaRelatorioPresenca.disabled =
      true;


    return;

  }


  listasPresenca.forEach(
    (lista) => {

      const opcao =
        document.createElement(
          "option"
        );


      opcao.value =
        lista.id;


      opcao.textContent =
        lista.nome;


      listaRelatorioPresenca.appendChild(
        opcao
      );

    }
  );


  listaRelatorioPresenca.disabled =
    false;


  tipoListaAtual =
    listasPresenca[0];


  listaRelatorioPresenca.value =
    tipoListaAtual.id;
}


/* ==========================================
   CARREGAR ATIVIDADES
========================================== */

async function carregarAtividades() {

  todasAtividades =
    [];


  if (
    !tipoListaAtual
  ) {

    return;

  }


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
        tipoListaAtual.tipo_atividade
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
   ANOS DISPONÍVEIS
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

  associadosDaLista =
    [];


  if (
    !tipoListaAtual
  ) {

    return;

  }


  const funcoesNecessarias =
    nomesFuncoesDaLista(
      tipoListaAtual.nome
    );


  if (
    funcoesNecessarias.length ===
    0
  ) {

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

  presencas =
    [];


  if (
    !tipoListaAtual
  ) {

    return;

  }


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
        tipoListaAtual.id
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


  if (
    atividade.data >
    hojeISO
  ) {

    return {
      texto: "",
      classe: "",
      tipo: "futuro"
    };

  }


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
      texto: "x",
      classe:
        "status-relatorio-nao-participava",
      tipo:
        "nao_participava"
    };

  }


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
      texto: "P",
      classe:
        "status-relatorio-presente",
      tipo:
        "presente"
    };

  }


  if (
    registro?.status ===
    "falta"
  ) {

    return {
      texto: "F",
      classe:
        "status-relatorio-falta",
      tipo:
        "falta"
    };

  }


  if (
    registro?.status ===
    "justificada"
  ) {

    return {
      texto: "J",
      classe:
        "status-relatorio-justificado",
      tipo:
        "justificada"
    };

  }


  return {
    texto: "—",
    classe:
      "status-relatorio-pendente",
    tipo:
      "pendente"
  };
}


/* ==========================================
   RESUMO DO ANO
========================================== */

function calcularResumoAno(
  atividades
) {

  const hojeISO =
    obterDataAtualISO();


  const atividadesRealizadas =
    atividades.filter(
      (atividade) =>
        atividade.data <=
        hojeISO
    );


  let quantidadePresencas =
    0;

  let quantidadeFaltas =
    0;

  let quantidadeJustificadas =
    0;

  let quantidadePendentes =
    0;


  associadosDaLista.forEach(
    (associado) => {

      atividadesRealizadas.forEach(
        (atividade) => {

          const situacao =
            obterSituacaoCelula(
              associado,
              atividade
            );


          if (
            situacao.tipo ===
            "presente"
          ) {

            quantidadePresencas++;

          }


          if (
            situacao.tipo ===
            "falta"
          ) {

            quantidadeFaltas++;

          }


          if (
            situacao.tipo ===
            "justificada"
          ) {

            quantidadeJustificadas++;

          }


          if (
            situacao.tipo ===
            "pendente"
          ) {

            quantidadePendentes++;

          }

        }
      );

    }
  );


  const totalValidos =
    quantidadePresencas +
    quantidadeFaltas +
    quantidadeJustificadas;


  let frequencia =
    null;


  if (
    totalValidos > 0
  ) {

    frequencia =
      (
        quantidadePresencas /
        totalValidos
      ) * 100;

  }


  return {

    atividadesRealizadas:
      atividadesRealizadas.length,

    presencas:
      quantidadePresencas,

    faltas:
      quantidadeFaltas,

    justificadas:
      quantidadeJustificadas,

    pendentes:
      quantidadePendentes,

    frequencia

  };
}


/* ==========================================
   RENDERIZAR RESUMO
========================================== */

function renderizarResumoAno(
  ano,
  atividades
) {

  const resumo =
    calcularResumoAno(
      atividades
    );


  anoResumoPresenca.textContent =
    ano;


  totalAtividadesRealizadas.textContent =
    String(
      resumo.atividadesRealizadas
    );


  totalPresencas.textContent =
    String(
      resumo.presencas
    );


  totalFaltas.textContent =
    String(
      resumo.faltas
    );


  totalJustificadas.textContent =
    String(
      resumo.justificadas
    );


  totalPendentes.textContent =
    String(
      resumo.pendentes
    );


  if (
    resumo.frequencia ===
    null
  ) {

    frequenciaGeralPresenca.textContent =
      "—";

  } else {

    frequenciaGeralPresenca.textContent =
      `${resumo.frequencia
        .toFixed(1)
        .replace(".", ",")}%`;

  }
}


/* ==========================================
   CABEÇALHO
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
   CORPO
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
    !tipoListaAtual ||
    !ano
  ) {

    areaRelatorioGeral.hidden =
      true;

    return;

  }


  const atividades =
    obterAtividadesDoAno(
      ano
    );


  areaRelatorioGeral.hidden =
    false;


  tituloListaRelatorioGeral.textContent =
    tipoListaAtual.nome;


  if (
    atividades.length ===
    0
  ) {

    resumoAnualPresenca.hidden =
      true;


    containerTabelaRelatorio.hidden =
      true;


    mensagemSemDadosRelatorio.hidden =
      false;


    return;

  }


  resumoAnualPresenca.hidden =
    false;


  containerTabelaRelatorio.hidden =
    false;


  mensagemSemDadosRelatorio.hidden =
    true;


  renderizarResumoAno(
    ano,
    atividades
  );


  criarCabecalho(
    atividades
  );


  criarCorpo(
    atividades
  );
}


/* ==========================================
   TROCAR LISTA
========================================== */

async function trocarLista() {

  const listaId =
    listaRelatorioPresenca.value;


  tipoListaAtual =
    listasPresenca.find(
      (lista) =>
        lista.id ===
        listaId
    ) || null;


  areaRelatorioGeral.hidden =
    true;


  anoRelatorioPresenca.disabled =
    true;


  anoRelatorioPresenca.innerHTML =
    `
      <option value="">
        Carregando...
      </option>
    `;


  try {

    await carregarAtividades();

    carregarAnosDisponiveis();

    await carregarAssociados();

    await carregarPresencas();

    renderizarAnoSelecionado();


  } catch (erro) {

    console.error(
      "Erro ao trocar lista do relatório geral:",
      erro
    );


    areaRelatorioGeral.hidden =
      false;


    resumoAnualPresenca.hidden =
      true;


    containerTabelaRelatorio.hidden =
      true;


    mensagemSemDadosRelatorio.hidden =
      false;


    mensagemSemDadosRelatorio.textContent =
      "Não foi possível carregar o relatório.";

  }
}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

async function iniciarPagina() {

  if (
    !window.supabaseClient
  ) {

    return;

  }


  try {

    await validarDiretoria();

    await carregarListas();


    if (
      !tipoListaAtual
    ) {

      return;

    }


    await trocarLista();


  } catch (erro) {

    console.error(
      "Erro ao iniciar relatório geral:",
      erro
    );


    areaRelatorioGeral.hidden =
      false;


    resumoAnualPresenca.hidden =
      true;


    containerTabelaRelatorio.hidden =
      true;


    mensagemSemDadosRelatorio.hidden =
      false;


    mensagemSemDadosRelatorio.textContent =
      "Não foi possível carregar o relatório.";

  }
}


/* ==========================================
   EVENTOS
========================================== */

listaRelatorioPresenca.addEventListener(
  "change",
  trocarLista
);


anoRelatorioPresenca.addEventListener(
  "change",
  renderizarAnoSelecionado
);


/* ==========================================
   INICIAR
========================================== */

iniciarPagina();
