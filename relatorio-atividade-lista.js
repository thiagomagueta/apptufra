"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const tituloRelatorioAtividade =
  document.getElementById(
    "tituloRelatorioAtividade"
  );

const anoRelatorioAtividade =
  document.getElementById(
    "anoRelatorioAtividade"
  );

const containerTabelaAtividade =
  document.getElementById(
    "containerTabelaAtividade"
  );

const corpoRelatorioAtividade =
  document.getElementById(
    "corpoRelatorioAtividade"
  );

const mensagemSemAtividadesRelatorio =
  document.getElementById(
    "mensagemSemAtividadesRelatorio"
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


  tituloRelatorioAtividade.textContent =
    tipoListaNome;

}


/* ==========================================
   CARREGAR ATIVIDADES
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


  anoRelatorioAtividade.innerHTML =
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


    anoRelatorioAtividade.appendChild(
      opcao
    );


    anoRelatorioAtividade.disabled =
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


      anoRelatorioAtividade.appendChild(
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

    anoRelatorioAtividade.value =
      String(
        anoAtual
      );

  } else {

    anoRelatorioAtividade.value =
      String(
        anos[0]
      );

  }


  anoRelatorioAtividade.disabled =
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
   SITUAÇÃO DA PESSOA
========================================== */

function obterSituacao(
  associado,
  atividade
) {

  const dataEntradaLista =
    obterDataEntradaNaLista(
      associado
    );


  if (
    dataEntradaLista &&
    dataEntradaLista >
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
   CALCULAR ATIVIDADE
========================================== */

function calcularDadosAtividade(
  atividade
) {

  let presentes =
    0;

  let faltas =
    0;

  let justificadas =
    0;

  let pendentes =
    0;


  associadosDaLista.forEach(
    (associado) => {

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
   RENDERIZAR RELATÓRIO
========================================== */

function renderizarRelatorio() {

  const ano =
    anoRelatorioAtividade.value;


  corpoRelatorioAtividade.innerHTML =
    "";


  if (
    !ano
  ) {

    containerTabelaAtividade.hidden =
      true;


    mensagemSemAtividadesRelatorio.hidden =
      false;


    return;

  }


  const hojeISO =
    obterDataAtualISO();


  const atividades =
    obterAtividadesDoAno(
      ano
    )
      .filter(
        (atividade) =>
          atividade.data <=
          hojeISO
      );


  if (
    atividades.length ===
    0
  ) {

    containerTabelaAtividade.hidden =
      true;


    mensagemSemAtividadesRelatorio.hidden =
      false;


    return;

  }


  containerTabelaAtividade.hidden =
    false;


  mensagemSemAtividadesRelatorio.hidden =
    true;


  atividades.forEach(
    (atividade) => {

      const dados =
        calcularDadosAtividade(
          atividade
        );


      const linha =
        document.createElement(
          "tr"
        );


      const colunaData =
        document.createElement(
          "td"
        );


      colunaData.textContent =
        formatarDataCurta(
          atividade.data
        );


      const colunaAtividade =
        document.createElement(
          "td"
        );


      colunaAtividade.className =
        "coluna-atividade-relatorio";


      colunaAtividade.textContent =
        atividade.titulo;


      const colunaP =
        document.createElement(
          "td"
        );


      colunaP.className =
        "valor-atividade-presente";


      colunaP.textContent =
        String(
          dados.presentes
        );


      const colunaF =
        document.createElement(
          "td"
        );


      colunaF.className =
        "valor-atividade-falta";


      colunaF.textContent =
        String(
          dados.faltas
        );


      const colunaJ =
        document.createElement(
          "td"
        );


      colunaJ.className =
        "valor-atividade-justificada";


      colunaJ.textContent =
        String(
          dados.justificadas
        );


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


      const colunaFrequencia =
        document.createElement(
          "td"
        );


      colunaFrequencia.className =
        "valor-frequencia-atividade";


      if (
        dados.frequencia ===
        null
      ) {

        colunaFrequencia.textContent =
          "—";

      } else {

        colunaFrequencia.textContent =
          `${dados.frequencia
            .toFixed(1)
            .replace(".", ",")}%`;

      }


      linha.appendChild(
        colunaData
      );

      linha.appendChild(
        colunaAtividade
      );

      linha.appendChild(
        colunaP
      );

      linha.appendChild(
        colunaF
      );

      linha.appendChild(
        colunaJ
      );

      linha.appendChild(
        colunaPendentes
      );

      linha.appendChild(
        colunaFrequencia
      );


      corpoRelatorioAtividade.appendChild(
        linha
      );

    }
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
      "relatorio-atividade-presenca.html";

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

    renderizarRelatorio();


  } catch (erro) {

    console.error(
      "Erro ao carregar relatório por atividade:",
      erro
    );


    corpoRelatorioAtividade.innerHTML =
      `
        <tr>
          <td colspan="7">
            Não foi possível carregar o relatório.
          </td>
        </tr>
      `;

  }

}


/* ==========================================
   TROCAR ANO
========================================== */

anoRelatorioAtividade.addEventListener(
  "change",
  renderizarRelatorio
);


/* ==========================================
   INICIAR
========================================== */

iniciarPagina();
