"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const tituloPreencherPresenca =
  document.getElementById(
    "tituloPreencherPresenca"
  );

const dadosAtividadePresenca =
  document.getElementById(
    "dadosAtividadePresenca"
  );

const listaChamadaPresenca =
  document.getElementById(
    "listaChamadaPresenca"
  );

const mensagemSemAssociadosPresenca =
  document.getElementById(
    "mensagemSemAssociadosPresenca"
  );

const mensagemSalvarPresenca =
  document.getElementById(
    "mensagemSalvarPresenca"
  );

const botaoSalvarPresenca =
  document.getElementById(
    "botaoSalvarPresenca"
  );

const botaoMarcarPendentes =
  document.getElementById(
    "botaoMarcarPendentes"
  );

const voltarAtividadesPresenca =
  document.getElementById(
    "voltarAtividadesPresenca"
  );


/* ==========================================
   DADOS
========================================== */

let tipoListaId =
  null;

let atividadeId =
  null;

let tipoListaNome =
  "";

let dataAtividade =
  null;

let associadosDaLista =
  [];

let presencasExistentes =
  [];


/* ==========================================
   PARÂMETROS
========================================== */

function obterParametros() {

  const parametros =
    new URLSearchParams(
      window.location.search
    );


  return {

    lista:
      parametros.get(
        "lista"
      ),

    atividade:
      parametros.get(
        "atividade"
      )

  };
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


function criarDataLocal(
  dataISO
) {

  const [
    ano,
    mes,
    dia
  ] =
    dataISO
      .split("-")
      .map(Number);


  return new Date(
    ano,
    mes - 1,
    dia
  );
}


function formatarData(
  dataISO
) {

  return new Intl.DateTimeFormat(
    "pt-BR"
  ).format(
    criarDataLocal(
      dataISO
    )
  );
}


function removerSegundos(
  horario
) {

  if (
    !horario
  ) {

    return "";

  }


  return horario.slice(
    0,
    5
  );
}


/* ==========================================
   MENSAGENS
========================================== */

function mostrarMensagem(
  texto
) {

  mensagemSalvarPresenca.textContent =
    texto;


  mensagemSalvarPresenca.hidden =
    false;
}


function esconderMensagem() {

  mensagemSalvarPresenca.textContent =
    "";


  mensagemSalvarPresenca.hidden =
    true;
}


/* ==========================================
   FUNÇÕES QUE COMPÕEM CADA LISTA
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
        tipo_atividade
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
      "Lista não encontrada."
    );

  }


  tipoListaNome =
    resultado.data.nome;


  tituloPreencherPresenca.textContent =
    tipoListaNome;
}


/* ==========================================
   VALIDAR RESPONSÁVEL
========================================== */

async function validarResponsavel() {

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


  const resultadoResponsavel =
    await window.supabaseClient
      .from(
        "responsaveis_lista_presenca"
      )
      .select(
        "id"
      )
      .eq(
        "tipo_lista_id",
        tipoListaId
      )
      .eq(
        "usuario_id",
        resultadoUsuario.data.id
      )
      .maybeSingle();


  if (
    resultadoResponsavel.error
  ) {

    throw resultadoResponsavel.error;

  }


  if (
    !resultadoResponsavel.data
  ) {

    window.location.href =
      "listas-presenca.html";


    throw new Error(
      "Usuário não autorizado."
    );

  }
}


/* ==========================================
   CARREGAR ATIVIDADE
========================================== */

async function carregarAtividade() {

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
        "id",
        atividadeId
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
      "Atividade não encontrada."
    );

  }


  const atividade =
    resultado.data;


  dataAtividade =
    atividade.data;


  const horario =
    removerSegundos(
      atividade.hora_inicio
    );


  dadosAtividadePresenca.textContent =
    `${atividade.titulo} • ` +
    `${formatarData(
      atividade.data
    )}` +
    (
      horario
        ? ` • ${horario}`
        : ""
    );


  /* --------------------------------------
     VOLTAR PARA A MESMA LISTA E ANO
  -------------------------------------- */

  const anoAtividade =
    String(
      atividade.data
    ).slice(
      0,
      4
    );


  voltarAtividadesPresenca.href =
    `listas-presenca.html?lista=${encodeURIComponent(
      tipoListaId
    )}&ano=${encodeURIComponent(
      anoAtividade
    )}`;
}


/* ==========================================
   VERIFICAR SE JÁ ERA ASSOCIADO
========================================== */

function associadoParticipavaNaData(
  usuario
) {

  if (
    !usuario.data_entrada_tufra
  ) {

    return true;

  }


  if (
    !dataAtividade
  ) {

    return true;

  }


  return (
    usuario.data_entrada_tufra <=
    dataAtividade
  );
}


/* ==========================================
   CARREGAR ASSOCIADOS DA LISTA
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
      .filter(
        (usuario) =>
          associadoParticipavaNaData(
            usuario
          )
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
   CARREGAR PRESENÇAS EXISTENTES
========================================== */

async function carregarPresencasExistentes() {

  const resultado =
    await window.supabaseClient
      .from(
        "presencas"
      )
      .select(`
        id,
        usuario_id,
        status
      `)
      .eq(
        "tipo_lista_id",
        tipoListaId
      )
      .eq(
        "atividade_id",
        atividadeId
      );


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  presencasExistentes =
    resultado.data ||
    [];
}


/* ==========================================
   STATUS ATUAL
========================================== */

function obterStatusExistente(
  usuarioId
) {

  const registro =
    presencasExistentes.find(
      (item) =>
        item.usuario_id ===
        usuarioId
    );


  return registro?.status ||
    "";
}


/* ==========================================
   CRIAR LINHA DA CHAMADA
========================================== */

function criarItemChamada(
  associado
) {

  const item =
    document.createElement(
      "div"
    );


  item.className =
    "item-chamada-presenca";


  const nome =
    document.createElement(
      "strong"
    );


  nome.className =
    "nome-chamada-presenca";


  nome.textContent =
    formatarNome(
      associado.nome_completo
    );


  const opcoes =
    document.createElement(
      "div"
    );


  opcoes.className =
    "opcoes-chamada-presenca";


  const statusAtual =
    obterStatusExistente(
      associado.id
    );


  const statuses = [

    {
      valor:
        "presente",

      texto:
        "P",

      classe:
        "status-presente"
    },

    {
      valor:
        "falta",

      texto:
        "F",

      classe:
        "status-falta"
    },

    {
      valor:
        "justificada",

      texto:
        "J",

      classe:
        "status-justificada"
    }

  ];


  statuses.forEach(
    (status) => {

      const label =
        document.createElement(
          "label"
        );


      label.className =
        `opcao-status-presenca ${status.classe}`;


      const radio =
        document.createElement(
          "input"
        );


      radio.type =
        "radio";


      radio.name =
        `presenca_${associado.id}`;


      radio.value =
        status.valor;


      radio.dataset.usuarioId =
        associado.id;


      radio.checked =
        statusAtual ===
        status.valor;


      const texto =
        document.createElement(
          "span"
        );


      texto.textContent =
        status.texto;


      label.appendChild(
        radio
      );


      label.appendChild(
        texto
      );


      opcoes.appendChild(
        label
      );

    }
  );


  item.appendChild(
    nome
  );


  item.appendChild(
    opcoes
  );


  return item;
}


/* ==========================================
   RENDERIZAR CHAMADA
========================================== */

function renderizarChamada() {

  listaChamadaPresenca.innerHTML =
    "";


  mensagemSemAssociadosPresenca.hidden =
    associadosDaLista.length >
    0;


  associadosDaLista.forEach(
    (associado) => {

      listaChamadaPresenca.appendChild(
        criarItemChamada(
          associado
        )
      );

    }
  );


  const possuiAssociados =
    associadosDaLista.length >
    0;


  botaoSalvarPresenca.disabled =
    !possuiAssociados;


  botaoMarcarPendentes.disabled =
    !possuiAssociados;
}


/* ==========================================
   MARCAR PENDENTES COMO PRESENTES
========================================== */

function marcarPendentesComoPresente() {

  esconderMensagem();


  let quantidadeMarcada =
    0;


  associadosDaLista.forEach(
    (associado) => {

      const jaSelecionado =
        document.querySelector(
          `input[name="presenca_${associado.id}"]:checked`
        );


      if (
        jaSelecionado
      ) {

        return;

      }


      const radioPresente =
        document.querySelector(
          `input[name="presenca_${associado.id}"][value="presente"]`
        );


      if (
        radioPresente
      ) {

        radioPresente.checked =
          true;


        quantidadeMarcada +=
          1;

      }

    }
  );


  if (
    quantidadeMarcada ===
    0
  ) {

    mostrarMensagem(
      "Não existem associados pendentes nesta lista."
    );


    return;

  }


  mostrarMensagem(
    `${quantidadeMarcada} associado(s) pendente(s) marcado(s) como presente.`
  );
}


/* ==========================================
   OBTER MARCAÇÕES
========================================== */

function obterMarcacoes() {

  const marcacoes =
    [];


  associadosDaLista.forEach(
    (associado) => {

      const selecionado =
        document.querySelector(
          `input[name="presenca_${associado.id}"]:checked`
        );


      if (
        selecionado
      ) {

        marcacoes.push({

          usuario_id:
            associado.id,

          status:
            selecionado.value

        });

      }

    }
  );


  return marcacoes;
}


/* ==========================================
   SALVAR
========================================== */

async function salvarLista() {

  esconderMensagem();


  const marcacoes =
    obterMarcacoes();


  if (
    marcacoes.length !==
    associadosDaLista.length
  ) {

    mostrarMensagem(
      "Defina P, F ou J para todos os associados antes de salvar."
    );


    return;

  }


  botaoSalvarPresenca.disabled =
    true;


  botaoSalvarPresenca.textContent =
    "SALVANDO...";


  try {

    const registros =
      marcacoes.map(
        (item) => ({

          tipo_lista_id:
            tipoListaId,

          atividade_id:
            atividadeId,

          usuario_id:
            item.usuario_id,

          status:
            item.status

        })
      );


    const resultado =
      await window.supabaseClient
        .from(
          "presencas"
        )
        .upsert(
          registros,
          {
            onConflict:
              "tipo_lista_id,atividade_id,usuario_id"
          }
        );


    if (
      resultado.error
    ) {

      throw resultado.error;

    }


    mostrarMensagem(
      "Lista de presença salva com sucesso."
    );


    botaoSalvarPresenca.textContent =
      "Lista salva";


    presencasExistentes =
      registros.map(
        (item) => ({

          usuario_id:
            item.usuario_id,

          status:
            item.status

        })
      );


    setTimeout(
      () => {

        botaoSalvarPresenca.disabled =
          false;


        botaoSalvarPresenca.textContent =
          "Salvar lista de presença";

      },
      1000
    );


  } catch (erro) {

    console.error(
      "Erro ao salvar lista de presença:",
      erro
    );


    mostrarMensagem(
      "Não foi possível salvar a lista de presença."
    );


    botaoSalvarPresenca.disabled =
      false;


    botaoSalvarPresenca.textContent =
      "Salvar lista de presença";

  }
}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

async function iniciarPagina() {

  const parametros =
    obterParametros();


  tipoListaId =
    parametros.lista;


  atividadeId =
    parametros.atividade;


  if (
    !tipoListaId ||
    !atividadeId
  ) {

    window.location.href =
      "listas-presenca.html";


    return;

  }


  try {

    await validarResponsavel();

    await carregarTipoLista();

    await carregarAtividade();

    await carregarAssociados();

    await carregarPresencasExistentes();

    renderizarChamada();


  } catch (erro) {

    console.error(
      "Erro ao carregar lista de presença:",
      erro
    );


    listaChamadaPresenca.innerHTML =
      "<p>Não foi possível carregar a lista de presença.</p>";

  }
}


/* ==========================================
   EVENTOS
========================================== */

botaoSalvarPresenca.addEventListener(
  "click",
  salvarLista
);


botaoMarcarPendentes.addEventListener(
  "click",
  marcarPendentesComoPresente
);


/* ==========================================
   INICIAR
========================================== */

iniciarPagina();
