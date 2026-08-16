"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const listaRelatorioAssociado =
  document.getElementById(
    "listaRelatorioAssociado"
  );

const anoRelatorioAssociado =
  document.getElementById(
    "anoRelatorioAssociado"
  );

const areaRelatorioAssociado =
  document.getElementById(
    "areaRelatorioAssociado"
  );

const tituloListaRelatorioAssociado =
  document.getElementById(
    "tituloListaRelatorioAssociado"
  );

const containerTabelaRelatorioAssociado =
  document.getElementById(
    "containerTabelaRelatorioAssociado"
  );

const corpoRelatorioAssociado =
  document.getElementById(
    "corpoRelatorioAssociado"
  );

const mensagemSemDadosRelatorioAssociado =
  document.getElementById(
    "mensagemSemDadosRelatorioAssociado"
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

let historicosFuncoes =
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


function formatarPercentual(
  valor
) {

  if (
    valor === null
  ) {

    return "—";

  }


  return `${valor
    .toFixed(1)
    .replace(".", ",")}%`;
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
   NOME DA FUNÇÃO HISTÓRICA
========================================== */

function obterNomeFuncaoHistorica() {

  if (
    tipoListaAtual?.nome ===
    "Ogans"
  ) {

    return "Ogam";

  }


  if (
    tipoListaAtual?.nome ===
    "Cambones"
  ) {

    return "Cambone";

  }


  if (
    tipoListaAtual?.nome ===
    "Cantina"
  ) {

    return "Cantina";

  }


  return null;
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


  const funcaoHistorica =
    obterNomeFuncaoHistorica();


  if (
    funcaoHistorica
  ) {

    const periodoAberto =
      historicosFuncoes.find(
        (registro) =>
          registro.usuario_id ===
            associado.id &&
          registro.funcao_nome ===
            funcaoHistorica &&
          !registro.data_fim
      );


    if (
      periodoAberto?.data_inicio
    ) {

      return periodoAberto.data_inicio;

    }

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


  listaRelatorioAssociado.innerHTML =
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


    listaRelatorioAssociado.appendChild(
      opcao
    );


    listaRelatorioAssociado.disabled =
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


      listaRelatorioAssociado.appendChild(
        opcao
      );

    }
  );


  listaRelatorioAssociado.disabled =
    false;


  tipoListaAtual =
    listasPresenca[0];


  listaRelatorioAssociado.value =
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
   CARREGAR ANOS
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


  anoRelatorioAssociado.innerHTML =
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


    anoRelatorioAssociado.appendChild(
      opcao
    );


    anoRelatorioAssociado.disabled =
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


      anoRelatorioAssociado.appendChild(
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

    anoRelatorioAssociado.value =
      String(
        anoAtual
      );

  } else {

    anoRelatorioAssociado.value =
      String(
        anos[0]
      );

  }


  anoRelatorioAssociado.disabled =
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
   CARREGAR HISTÓRICO
========================================== */

async function carregarHistoricoFuncoes() {

  historicosFuncoes =
    [];


  const funcaoHistorica =
    obterNomeFuncaoHistorica();


  if (
    !funcaoHistorica
  ) {

    return;

  }


  const resultado =
    await window.supabaseClient
      .from(
        "historico_funcoes_associado"
      )
      .select(`
        id,
        usuario_id,
        funcao_nome,
        data_inicio,
        data_fim
      `)
      .eq(
        "funcao_nome",
        funcaoHistorica
      );


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  historicosFuncoes =
    resultado.data ||
    [];
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

function obterAtividadesRealizadasDoAno() {

  const ano =
    anoRelatorioAssociado.value;


  if (
    !ano
  ) {

    return [];

  }


  const hojeISO =
    obterDataAtualISO();


  return todasAtividades.filter(
    (atividade) =>
      String(
        atividade.data
      ).startsWith(
        `${ano}-`
      ) &&
      atividade.data <=
        hojeISO
  );
}


/* ==========================================
   PRESENÇA
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
   SITUAÇÃO
========================================== */

function obterSituacao(
  associado,
  atividade
) {

  const dataEntrada =
    obterDataEntradaNaLista(
      associado
    );


  if (
    dataEntrada &&
    dataEntrada >
      atividade.data
  ) {

    return "nao_participava";

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

    return "presente";

  }


  if (
    registro?.status ===
    "falta"
  ) {

    return "falta";

  }


  if (
    registro?.status ===
    "justificada"
  ) {

    return "justificada";

  }


  return "pendente";
}


/* ==========================================
   CALCULAR ASSOCIADO
========================================== */

function calcularDadosAssociado(
  associado,
  atividades
) {

  let presentes =
    0;

  let faltas =
    0;

  let justificadas =
    0;

  let pendentes =
    0;


  atividades.forEach(
    (atividade) => {

      const situacao =
        obterSituacao(
          associado,
          atividade
        );


      if (
        situacao ===
        "nao_participava"
      ) {

        return;

      }


      if (
        situacao ===
        "presente"
      ) {

        presentes++;

      }


      if (
        situacao ===
        "falta"
      ) {

        faltas++;

      }


      if (
        situacao ===
        "justificada"
      ) {

        justificadas++;

      }


      if (
        situacao ===
        "pendente"
      ) {

        pendentes++;

      }

    }
  );


  const totalValidos =
    presentes +
    faltas +
    justificadas;


  let frequencia =
    null;


  if (
    totalValidos > 0
  ) {

    frequencia =
      (
        presentes /
        totalValidos
      ) * 100;

  }


  return {

    presentes,
    faltas,
    justificadas,
    pendentes,
    frequencia

  };
}


/* ==========================================
   RENDERIZAR
========================================== */

function renderizarRelatorio() {

  corpoRelatorioAssociado.innerHTML =
    "";


  const atividades =
    obterAtividadesRealizadasDoAno();


  if (
    !tipoListaAtual ||
    !anoRelatorioAssociado.value
  ) {

    areaRelatorioAssociado.hidden =
      true;

    return;

  }


  areaRelatorioAssociado.hidden =
    false;


  tituloListaRelatorioAssociado.textContent =
    tipoListaAtual.nome;


  if (
    associadosDaLista.length === 0 ||
    atividades.length === 0
  ) {

    containerTabelaRelatorioAssociado.hidden =
      true;


    mensagemSemDadosRelatorioAssociado.hidden =
      false;


    return;

  }


  containerTabelaRelatorioAssociado.hidden =
    false;


  mensagemSemDadosRelatorioAssociado.hidden =
    true;


  associadosDaLista.forEach(
    (associado) => {

      const dados =
        calcularDadosAssociado(
          associado,
          atividades
        );


      const linha =
        document.createElement(
          "tr"
        );


      /* NOME */

      const colunaNome =
        document.createElement(
          "td"
        );


      colunaNome.className =
        "coluna-nome-associado-relatorio";


      colunaNome.textContent =
        formatarNome(
          associado.nome_completo
        );


      /* P */

      const colunaPresencas =
        document.createElement(
          "td"
        );


      colunaPresencas.className =
        "valor-atividade-presente";


      colunaPresencas.textContent =
        String(
          dados.presentes
        );


      /* F */

      const colunaFaltas =
        document.createElement(
          "td"
        );


      colunaFaltas.className =
        "valor-atividade-falta";


      colunaFaltas.textContent =
        String(
          dados.faltas
        );


      /* J */

      const colunaJustificadas =
        document.createElement(
          "td"
        );


      colunaJustificadas.className =
        "valor-atividade-justificada";


      colunaJustificadas.textContent =
        String(
          dados.justificadas
        );


      /* PENDENTES */

      const colunaPendentes =
        document.createElement(
          "td"
        );


      colunaPendentes.className =
        "valor-atividade-pendente";


      colunaPendentes.textContent =
        String(
          dados.pendentes
        );


      /* FREQUÊNCIA */

      const colunaFrequencia =
        document.createElement(
          "td"
        );


      colunaFrequencia.className =
        "valor-frequencia-atividade";


      colunaFrequencia.textContent =
        formatarPercentual(
          dados.frequencia
        );


      linha.appendChild(
        colunaNome
      );


      linha.appendChild(
        colunaPresencas
      );


      linha.appendChild(
        colunaFaltas
      );


      linha.appendChild(
        colunaJustificadas
      );


      linha.appendChild(
        colunaPendentes
      );


      linha.appendChild(
        colunaFrequencia
      );


      corpoRelatorioAssociado.appendChild(
        linha
      );

    }
  );
}


/* ==========================================
   TROCAR LISTA
========================================== */

async function trocarLista() {

  const listaId =
    listaRelatorioAssociado.value;


  tipoListaAtual =
    listasPresenca.find(
      (lista) =>
        lista.id ===
        listaId
    ) || null;


  areaRelatorioAssociado.hidden =
    true;


  anoRelatorioAssociado.disabled =
    true;


  anoRelatorioAssociado.innerHTML =
    `
      <option value="">
        Carregando...
      </option>
    `;


  try {

    await carregarAtividades();

    carregarAnosDisponiveis();

    await carregarAssociados();

    await carregarHistoricoFuncoes();

    await carregarPresencas();

    renderizarRelatorio();


  } catch (erro) {

    console.error(
      "Erro ao trocar lista do relatório por associado:",
      erro
    );


    areaRelatorioAssociado.hidden =
      false;


    containerTabelaRelatorioAssociado.hidden =
      true;


    mensagemSemDadosRelatorioAssociado.hidden =
      false;


    mensagemSemDadosRelatorioAssociado.textContent =
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
      "Erro ao iniciar relatório por associado:",
      erro
    );


    areaRelatorioAssociado.hidden =
      false;


    containerTabelaRelatorioAssociado.hidden =
      true;


    mensagemSemDadosRelatorioAssociado.hidden =
      false;


    mensagemSemDadosRelatorioAssociado.textContent =
      "Não foi possível carregar o relatório.";

  }
}


/* ==========================================
   EVENTOS
========================================== */

listaRelatorioAssociado.addEventListener(
  "change",
  trocarLista
);


anoRelatorioAssociado.addEventListener(
  "change",
  renderizarRelatorio
);


/* ==========================================
   INICIAR
========================================== */

iniciarPagina();
