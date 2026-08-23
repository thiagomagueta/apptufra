"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const associadoRelatorioJustificativas =
  document.getElementById(
    "associadoRelatorioJustificativas"
  );

const anoRelatorioJustificativas =
  document.getElementById(
    "anoRelatorioJustificativas"
  );

const areaRelatorioJustificativas =
  document.getElementById(
    "areaRelatorioJustificativas"
  );

const tituloAssociadoRelatorioJustificativas =
  document.getElementById(
    "tituloAssociadoRelatorioJustificativas"
  );

const listaRelatorioJustificativas =
  document.getElementById(
    "listaRelatorioJustificativas"
  );

const mensagemSemDadosJustificativas =
  document.getElementById(
    "mensagemSemDadosJustificativas"
  );


/* ==========================================
   DADOS
========================================== */

let associadosJustificativas =
  [];

let atividadesJustificativas =
  [];

let presencasJustificativas =
  [];

let confirmacoesJustificativas =
  [];

let associadoAtualJustificativas =
  null;


/* ==========================================
   DIRETORIA
========================================== */

const funcoesDiretoriaJustificativas = [
  "Sacerdote",
  "Pai/Mãe Pequeno (a)",
  "Tesoureiro",
  "Secretária",
  "Presidente"
];


/* ==========================================
   PARÂMETROS
========================================== */

function obterParametrosJustificativas() {

  const parametros =
    new URLSearchParams(
      window.location.search
    );


  return {

    associadoId:
      parametros.get(
        "id"
      ),

    modo:
      parametros.get(
        "modo"
      ) || "completo"

  };
}


function modoSomenteJustificativas() {

  return (
    obterParametrosJustificativas()
      .modo ===
    "justificativas"
  );
}


/* ==========================================
   DATA ATUAL
========================================== */

function obterHojeISOJustificativas() {

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

function formatarNomeJustificativas(
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


function formatarDataJustificativas(
  dataISO
) {

  if (
    !dataISO
  ) {

    return "—";

  }


  const [
    ano,
    mes,
    dia
  ] =
    String(
      dataISO
    ).split(
      "-"
    );


  return `${dia}/${mes}/${ano}`;
}


/* ==========================================
   VALIDAR DIRETORIA
========================================== */

async function validarDiretoriaJustificativas() {

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

    window.location.href =
      "administrativo.html";


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
      .filter(
        Boolean
      );


  const pertenceDiretoria =
    nomesFuncoes.some(
      (funcao) =>
        funcoesDiretoriaJustificativas.includes(
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
   CARREGAR ASSOCIADOS
========================================== */

async function carregarAssociadosJustificativas() {

  const resultado =
    await window.supabaseClient
      .from(
        "usuarios"
      )
      .select(`
        id,
        nome_completo,
        status
      `)
      .eq(
        "status",
        "ativo"
      )
      .order(
        "nome_completo",
        {
          ascending:
            true
        }
      );


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  associadosJustificativas =
    resultado.data ||
    [];


  associadoRelatorioJustificativas.innerHTML =
    "";


  if (
    associadosJustificativas.length ===
    0
  ) {

    const opcao =
      document.createElement(
        "option"
      );


    opcao.value =
      "";

    opcao.textContent =
      "Nenhum associado";


    associadoRelatorioJustificativas.appendChild(
      opcao
    );


    associadoRelatorioJustificativas.disabled =
      true;


    return;

  }


  associadosJustificativas.forEach(
    (associado) => {

      const opcao =
        document.createElement(
          "option"
        );


      opcao.value =
        associado.id;


      opcao.textContent =
        formatarNomeJustificativas(
          associado.nome_completo
        );


      associadoRelatorioJustificativas.appendChild(
        opcao
      );

    }
  );


  const {
    associadoId
  } =
    obterParametrosJustificativas();


  const associadoParametro =
    associadosJustificativas.find(
      (associado) =>
        associado.id ===
        associadoId
    );


  associadoAtualJustificativas =
    associadoParametro ||
    associadosJustificativas[0];


  associadoRelatorioJustificativas.value =
    associadoAtualJustificativas.id;


  associadoRelatorioJustificativas.disabled =
    false;
}


/* ==========================================
   CARREGAR ATIVIDADES
========================================== */

async function carregarAtividadesJustificativas() {

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
      .order(
        "data",
        {
          ascending:
            false
        }
      )
      .order(
        "hora_inicio",
        {
          ascending:
            false
        }
      );


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  atividadesJustificativas =
    resultado.data ||
    [];
}


/* ==========================================
   CARREGAR ANOS
========================================== */

function carregarAnosJustificativas() {

  let atividadesBase =
    atividadesJustificativas;


  if (
    modoSomenteJustificativas() &&
    confirmacoesJustificativas.length > 0
  ) {

    const idsComJustificativa =
      new Set(
        confirmacoesJustificativas
          .filter(
            (registro) =>
              registro.resposta ===
                "ausente" &&
              String(
                registro.justificativa ||
                ""
              ).trim()
          )
          .map(
            (registro) =>
              registro.atividade_id
          )
      );


    atividadesBase =
      atividadesJustificativas.filter(
        (atividade) =>
          idsComJustificativa.has(
            atividade.id
          )
      );

  }


  const anos =
    [
      ...new Set(
        atividadesBase
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
          .filter(
            Boolean
          )
      )
    ]
      .sort(
        (a, b) =>
          b - a
      );


  anoRelatorioJustificativas.innerHTML =
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
      "Sem justificativas";


    anoRelatorioJustificativas.appendChild(
      opcao
    );


    anoRelatorioJustificativas.disabled =
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


      anoRelatorioJustificativas.appendChild(
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

    anoRelatorioJustificativas.value =
      String(
        anoAtual
      );

  } else {

    anoRelatorioJustificativas.value =
      String(
        anos[0]
      );

  }


  anoRelatorioJustificativas.disabled =
    false;
}


/* ==========================================
   CARREGAR PRESENÇAS
========================================== */

async function carregarPresencasDoAssociadoJustificativas() {

  presencasJustificativas =
    [];


  if (
    !associadoAtualJustificativas
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
        status,
        origem
      `)
      .eq(
        "usuario_id",
        associadoAtualJustificativas.id
      );


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  presencasJustificativas =
    resultado.data ||
    [];
}


/* ==========================================
   CARREGAR CONFIRMAÇÕES
========================================== */

async function carregarConfirmacoesDoAssociadoJustificativas() {

  confirmacoesJustificativas =
    [];


  if (
    !associadoAtualJustificativas
  ) {

    return;

  }


  const resultado =
    await window.supabaseClient
      .from(
        "confirmacoes_presenca"
      )
      .select(`
        atividade_id,
        usuario_id,
        resposta,
        justificativa,
        lido_diretoria
      `)
      .eq(
        "usuario_id",
        associadoAtualJustificativas.id
      );


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  confirmacoesJustificativas =
    resultado.data ||
    [];
}


/* ==========================================
   LOCALIZAR REGISTROS
========================================== */

function obterPresencaJustificativas(
  atividadeId
) {

  return presencasJustificativas.find(
    (registro) =>
      registro.atividade_id ===
      atividadeId
  ) ||
  null;
}


function obterConfirmacaoJustificativas(
  atividadeId
) {

  return confirmacoesJustificativas.find(
    (registro) =>
      registro.atividade_id ===
      atividadeId
  ) ||
  null;
}


/* ==========================================
   VERIFICAR JUSTIFICATIVA REAL
========================================== */

function atividadeTemJustificativaDoMedium(
  atividade
) {

  const confirmacao =
    obterConfirmacaoJustificativas(
      atividade.id
    );


  return Boolean(
    confirmacao &&
    confirmacao.resposta ===
      "ausente" &&
    String(
      confirmacao.justificativa ||
      ""
    ).trim()
  );
}


/* ==========================================
   DEFINIR SITUAÇÃO
========================================== */

function obterSituacaoJustificativas(
  atividade
) {

  const hojeISO =
    obterHojeISOJustificativas();


  if (
    atividade.data >
    hojeISO
  ) {

    return {

      tipo:
        "pendente",

      titulo:
        "Pendente",

      texto:
        ""

    };

  }


  const presenca =
    obterPresencaJustificativas(
      atividade.id
    );


  const confirmacao =
    obterConfirmacaoJustificativas(
      atividade.id
    );


  /* ======================================
     PRESENTE
  ====================================== */

  if (
    presenca?.status ===
    "presente"
  ) {

    return {

      tipo:
        "presente",

      titulo:
        "Presente",

      texto:
        ""

    };

  }


  /* ======================================
     AUSÊNCIA INFORMADA PELO MÉDIUM
  ====================================== */

  if (
    confirmacao?.resposta ===
    "ausente"
  ) {

    const justificativa =
      String(
        confirmacao.justificativa ||
        ""
      ).trim();


    if (
      justificativa
    ) {

      return {

        tipo:
          "justificada",

        titulo:
          "Justificado",

        texto:
          justificativa

      };

    }


    return {

      tipo:
        "falta",

      titulo:
        "Falta",

      texto:
        "Falta sem justificativa registrada pelo médium"

    };

  }


  /* ======================================
     FALTA ADICIONADA PELA ADM
  ====================================== */

  if (
    presenca?.status ===
    "falta"
  ) {

    return {

      tipo:
        "falta",

      titulo:
        "Falta",

      texto:
        "Falta adicionada pela ADM"

    };

  }


  /* ======================================
     JUSTIFICADA SEM TEXTO
  ====================================== */

  if (
    presenca?.status ===
    "justificada"
  ) {

    return {

      tipo:
        "justificada",

      titulo:
        "Justificado",

      texto:
        "Justificativa registrada sem texto disponível"

    };

  }


  /* ======================================
     PENDENTE
  ====================================== */

  return {

    tipo:
      "pendente",

    titulo:
      "Pendente",

    texto:
      ""

  };
}


/* ==========================================
   CRIAR ITEM
========================================== */

function criarItemRelatorioJustificativas(
  atividade
) {

  const situacao =
    obterSituacaoJustificativas(
      atividade
    );


  const item =
    document.createElement(
      "div"
    );


  item.style.padding =
    "14px";

  item.style.marginBottom =
    "12px";

  item.style.border =
    "1px solid var(--cor-borda)";

  item.style.borderRadius =
    "14px";

  item.style.background =
    "#ffffff";


  /* ======================================
     LINHA PRINCIPAL
  ====================================== */

  const linhaPrincipal =
    document.createElement(
      "div"
    );


  linhaPrincipal.style.display =
    "flex";

  linhaPrincipal.style.alignItems =
    "center";

  linhaPrincipal.style.gap =
    "12px";

  linhaPrincipal.style.width =
    "100%";


  /* ======================================
     DATA
  ====================================== */

  const data =
    document.createElement(
      "span"
    );


  data.textContent =
    formatarDataJustificativas(
      atividade.data
    );


  data.style.flexShrink =
    "0";

  data.style.color =
    "var(--cor-texto)";

  data.style.fontSize =
    "13px";

  data.style.fontWeight =
    "400";

  data.style.lineHeight =
    "1.35";


  linhaPrincipal.appendChild(
    data
  );


  /* ======================================
     ATIVIDADE
  ====================================== */

  const titulo =
    document.createElement(
      "span"
    );


  titulo.textContent =
    atividade.titulo ||
    "Atividade";


  titulo.style.flex =
    "1";

  titulo.style.minWidth =
    "0";

  titulo.style.color =
    "var(--cor-texto)";

  titulo.style.fontSize =
    "13px";

  titulo.style.fontWeight =
    "400";

  titulo.style.lineHeight =
    "1.35";


  linhaPrincipal.appendChild(
    titulo
  );


  /* ======================================
     STATUS
  ====================================== */

  const status =
    document.createElement(
      "span"
    );


  status.textContent =
    situacao.titulo;


  status.style.flexShrink =
    "0";

  status.style.padding =
    "6px 9px";

  status.style.borderRadius =
    "9px";

  status.style.fontSize =
    "11px";

  status.style.fontWeight =
    "700";

  status.style.whiteSpace =
    "nowrap";


  if (
    situacao.tipo ===
    "presente"
  ) {

    status.style.background =
      "#e4f3e8";

    status.style.color =
      "#267341";

  }


  if (
    situacao.tipo ===
    "falta"
  ) {

    status.style.background =
      "#f9e4e4";

    status.style.color =
      "#a12626";

  }


  if (
    situacao.tipo ===
    "justificada"
  ) {

    status.style.background =
      "#fff1c8";

    status.style.color =
      "#8a6500";

  }


  if (
    situacao.tipo ===
    "pendente"
  ) {

    status.style.background =
      "#efefef";

    status.style.color =
      "#666666";

  }


  linhaPrincipal.appendChild(
    status
  );


  item.appendChild(
    linhaPrincipal
  );


  /* ======================================
     PRESENTE E PENDENTE
     NÃO MOSTRAM QUADRO INFERIOR
  ====================================== */

  if (
    situacao.tipo ===
      "presente" ||
    situacao.tipo ===
      "pendente"
  ) {

    return item;

  }


  /* ======================================
     FALTA E JUSTIFICADO
     MOSTRAM DETALHE
  ====================================== */

  const texto =
    document.createElement(
      "div"
    );


  texto.textContent =
    situacao.texto;


  texto.style.marginTop =
    "12px";

  texto.style.padding =
    "11px 12px";

  texto.style.borderRadius =
    "10px";

  texto.style.fontSize =
    "13px";

  texto.style.lineHeight =
    "1.45";

  texto.style.whiteSpace =
    "pre-wrap";


  if (
    situacao.tipo ===
    "falta"
  ) {

    texto.style.background =
      "#fff1f1";

    texto.style.color =
      "#8f2424";

    texto.style.border =
      "1px solid #f2caca";

  }


  if (
    situacao.tipo ===
    "justificada"
  ) {

    texto.style.background =
      "#fff9e8";

    texto.style.color =
      "#5c4a14";

    texto.style.border =
      "1px solid #f0df9b";

  }


  item.appendChild(
    texto
  );


  return item;
}


/* ==========================================
   RENDERIZAR
========================================== */

function renderizarRelatorioJustificativas() {

  if (
    !associadoAtualJustificativas
  ) {

    areaRelatorioJustificativas.hidden =
      true;


    return;

  }


  const ano =
    anoRelatorioJustificativas.value;


  if (
    !ano
  ) {

    areaRelatorioJustificativas.hidden =
      false;


    tituloAssociadoRelatorioJustificativas.textContent =
      formatarNomeJustificativas(
        associadoAtualJustificativas
          .nome_completo
      );


    listaRelatorioJustificativas.innerHTML =
      "";


    mensagemSemDadosJustificativas.hidden =
      false;


    mensagemSemDadosJustificativas.textContent =
      modoSomenteJustificativas()
        ? "Nenhuma justificativa cadastrada para este associado."
        : "Nenhuma atividade encontrada para esta seleção.";


    return;

  }


  let atividadesDoAno =
    atividadesJustificativas
      .filter(
        (atividade) =>
          String(
            atividade.data
          ).startsWith(
            `${ano}-`
          )
      );


  if (
    modoSomenteJustificativas()
  ) {

    atividadesDoAno =
      atividadesDoAno.filter(
        atividadeTemJustificativaDoMedium
      );

  }


  atividadesDoAno.sort(
    (a, b) => {

      const comparacaoData =
        String(
          b.data
        ).localeCompare(
          String(
            a.data
          )
        );


      if (
        comparacaoData !==
        0
      ) {

        return comparacaoData;

      }


      return String(
        b.hora_inicio ||
        ""
      ).localeCompare(
        String(
          a.hora_inicio ||
          ""
        )
      );

    }
  );


  areaRelatorioJustificativas.hidden =
    false;


  tituloAssociadoRelatorioJustificativas.textContent =
    modoSomenteJustificativas()
      ? `Justificativas - ${formatarNomeJustificativas(
          associadoAtualJustificativas
            .nome_completo
        )}`
      : formatarNomeJustificativas(
          associadoAtualJustificativas
            .nome_completo
        );


  listaRelatorioJustificativas.innerHTML =
    "";


  if (
    atividadesDoAno.length ===
    0
  ) {

    mensagemSemDadosJustificativas.hidden =
      false;


    mensagemSemDadosJustificativas.textContent =
      modoSomenteJustificativas()
        ? "Nenhuma justificativa cadastrada neste ano."
        : "Nenhuma atividade encontrada para esta seleção.";


    listaRelatorioJustificativas.hidden =
      true;


    return;

  }


  mensagemSemDadosJustificativas.hidden =
    true;


  listaRelatorioJustificativas.hidden =
    false;


  atividadesDoAno.forEach(
    (atividade) => {

      const item =
        criarItemRelatorioJustificativas(
          atividade
        );


      listaRelatorioJustificativas.appendChild(
        item
      );

    }
  );
}


/* ==========================================
   TROCAR ASSOCIADO
========================================== */

async function trocarAssociadoJustificativas() {

  const associadoId =
    associadoRelatorioJustificativas.value;


  associadoAtualJustificativas =
    associadosJustificativas.find(
      (associado) =>
        associado.id ===
        associadoId
    ) ||
    null;


  if (
    !associadoAtualJustificativas
  ) {

    areaRelatorioJustificativas.hidden =
      true;


    return;

  }


  try {

    await carregarPresencasDoAssociadoJustificativas();

    await carregarConfirmacoesDoAssociadoJustificativas();


    carregarAnosJustificativas();

    renderizarRelatorioJustificativas();


  } catch (erro) {

    console.error(
      "Erro ao carregar relatório do associado:",
      erro
    );


    areaRelatorioJustificativas.hidden =
      false;


    listaRelatorioJustificativas.innerHTML =
      `
        <p>
          Não foi possível carregar o relatório.
        </p>
      `;

  }
}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

async function iniciarRelatorioJustificativas() {

  if (
    !window.supabaseClient
  ) {

    return;

  }


  try {

    await validarDiretoriaJustificativas();

    await carregarAssociadosJustificativas();

    await carregarAtividadesJustificativas();


    if (
      associadoAtualJustificativas
    ) {

      await carregarPresencasDoAssociadoJustificativas();

      await carregarConfirmacoesDoAssociadoJustificativas();

    }


    carregarAnosJustificativas();

    renderizarRelatorioJustificativas();


  } catch (erro) {

    console.error(
      "Erro ao iniciar relatório de justificativas:",
      erro
    );


    areaRelatorioJustificativas.hidden =
      false;


    listaRelatorioJustificativas.innerHTML =
      `
        <p>
          Não foi possível carregar o relatório de justificativas.
        </p>
      `;

  }
}


/* ==========================================
   EVENTOS
========================================== */

associadoRelatorioJustificativas.addEventListener(
  "change",
  trocarAssociadoJustificativas
);


anoRelatorioJustificativas.addEventListener(
  "change",
  renderizarRelatorioJustificativas
);


/* ==========================================
   INICIAR
========================================== */

iniciarRelatorioJustificativas();
