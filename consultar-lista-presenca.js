"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const tituloConsultaPresenca =
  document.getElementById(
    "tituloConsultaPresenca"
  );

const dadosAtividadeConsulta =
  document.getElementById(
    "dadosAtividadeConsulta"
  );

const listaConsultaChamada =
  document.getElementById(
    "listaConsultaChamada"
  );

const mensagemSemAssociadosConsulta =
  document.getElementById(
    "mensagemSemAssociadosConsulta"
  );

const voltarConsultaAtividades =
  document.getElementById(
    "voltarConsultaAtividades"
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

  if (!horario) {
    return "";
  }


  return horario.slice(
    0,
    5
  );
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


  if (!sessao) {

    window.location.href =
      "index.html";


    throw new Error(
      "Sessão não encontrada."
    );

  }


  const resultadoUsuario =
    await window.supabaseClient
      .from("usuarios")
      .select("id")
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
      "Usuário não autorizado para consultar listas."
    );

  }

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


  tituloConsultaPresenca.textContent =
    tipoListaNome;

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


  dadosAtividadeConsulta.textContent =
    `${atividade.titulo} • ` +
    `${formatarData(
      atividade.data
    )}` +
    (
      horario
        ? ` • ${horario}`
        : ""
    );

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
      .from("usuarios")
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
            a.nome_completo || ""
          ).localeCompare(
            String(
              b.nome_completo || ""
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
   OBTER STATUS
========================================== */

function obterStatus(
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
   CRIAR STATUS
========================================== */

function criarStatusConsulta(
  status
) {

  const elemento =
    document.createElement(
      "span"
    );


  elemento.className =
    "status-consulta-presenca";


  if (
    status ===
    "presente"
  ) {

    elemento.classList.add(
      "presente"
    );


    elemento.textContent =
      "Presente";


    return elemento;

  }


  if (
    status ===
    "falta"
  ) {

    elemento.classList.add(
      "falta"
    );


    elemento.textContent =
      "Falta";


    return elemento;

  }


  if (
    status ===
    "justificada"
  ) {

    elemento.classList.add(
      "justificada"
    );


    elemento.textContent =
      "Justificado";


    return elemento;

  }


  elemento.classList.add(
    "pendente"
  );


  elemento.textContent =
    "Pendente";


  return elemento;
}


/* ==========================================
   CRIAR LINHA
========================================== */

function criarItemConsulta(
  associado
) {

  const item =
    document.createElement(
      "div"
    );


  item.className =
    "item-chamada-presenca item-consulta-presenca";


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


  const status =
    criarStatusConsulta(
      obterStatus(
        associado.id
      )
    );


  item.appendChild(
    nome
  );


  item.appendChild(
    status
  );


  return item;
}


/* ==========================================
   RENDERIZAR
========================================== */

function renderizarConsulta() {

  listaConsultaChamada.innerHTML =
    "";


  mensagemSemAssociadosConsulta.hidden =
    associadosDaLista.length >
    0;


  associadosDaLista.forEach(
    (associado) => {

      listaConsultaChamada.appendChild(
        criarItemConsulta(
          associado
        )
      );

    }
  );

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
      "consultar-presenca.html";


    return;

  }


  voltarConsultaAtividades.href =
    `consultar-atividades-presenca.html?id=${tipoListaId}`;


  if (
    !window.supabaseClient
  ) {

    return;

  }


  try {

    await validarDiretoria();

    await carregarTipoLista();

    await carregarAtividade();

    await carregarAssociados();

    await carregarPresencas();

    renderizarConsulta();


  } catch (erro) {

    console.error(
      "Erro ao consultar lista de presença:",
      erro
    );


    listaConsultaChamada.innerHTML =
      "<p>Não foi possível carregar a lista de presença.</p>";

  }

}


/* ==========================================
   INICIAR
========================================== */

iniciarPagina();
