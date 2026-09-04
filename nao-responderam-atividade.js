"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const dadosAtividadeNaoResponderam =
  document.getElementById(
    "dadosAtividadeNaoResponderam"
  );

const listaNaoResponderamAtividade =
  document.getElementById(
    "listaNaoResponderamAtividade"
  );


/* ==========================================
   DADOS
========================================== */

let atividadeNaoResponderamAtual =
  null;


/* ==========================================
   DATA LOCAL
========================================== */

function criarDataLocalNaoResponderam(
  dataISO
) {

  const [
    ano,
    mes,
    dia
  ] =
    String(
      dataISO
    )
      .split("-")
      .map(
        Number
      );


  return new Date(
    ano,
    mes - 1,
    dia
  );
}


/* ==========================================
   MÊS CURTO
========================================== */

function formatarMesCurtoNaoResponderam(
  data
) {

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      month:
        "short"
    }
  )
    .format(
      data
    )
    .replace(
      ".",
      ""
    )
    .toUpperCase();
}


/* ==========================================
   DIA DA SEMANA
========================================== */

function formatarDiaSemanaNaoResponderam(
  data
) {

  const texto =
    new Intl.DateTimeFormat(
      "pt-BR",
      {
        weekday:
          "long"
      }
    )
      .format(
        data
      );


  return (
    texto.charAt(
      0
    ).toUpperCase() +
    texto.slice(
      1
    )
  );
}


/* ==========================================
   HORÁRIO
========================================== */

function removerSegundosNaoResponderam(
  horario
) {

  if (
    !horario
  ) {

    return "";

  }


  return String(
    horario
  ).slice(
    0,
    5
  );
}


/* ==========================================
   TIPO DA ATIVIDADE
========================================== */

function formatarTipoAtividadeNaoResponderam(
  atividade
) {

  if (
    atividade.tipo_atividade ===
    "outros"
  ) {

    return (
      atividade.tipo_outro ||
      "Outros"
    );

  }


  const tipos = {

    gira_principal:
      "Gira Principal",

    gira_desenvolvimento:
      "Gira de Desenvolvimento",

    aula:
      "Aula",

    trabalho_cura:
      "Trabalho de Cura",

    eventos:
      "Eventos",

    obrigacoes:
      "Obrigações"

  };


  return (
    tipos[
      atividade.tipo_atividade
    ] ||
    "Atividade"
  );
}


/* ==========================================
   DATA ATUAL
========================================== */

function obterHojeISONaoResponderam() {

  const agora =
    new Date();


  const ano =
    agora.getFullYear();


  const mes =
    String(
      agora.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const dia =
    String(
      agora.getDate()
    ).padStart(
      2,
      "0"
    );


  return `${ano}-${mes}-${dia}`;
}


/* ==========================================
   VALIDAR USUÁRIO LOGADO
========================================== */

async function validarUsuarioLogadoNaoResponderam() {

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

    throw new Error(
      "Usuário não autenticado."
    );

  }
}


/* ==========================================
   CARREGAR PRÓXIMA ATIVIDADE
========================================== */

async function carregarAtividadeNaoResponderam() {

  const agora =
    new Date();


  const hojeISO =
    obterHojeISONaoResponderam();


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
        tipo_atividade,
        tipo_outro
      `)
      .gte(
        "data",
        hojeISO
      )
      .order(
        "data",
        {
          ascending:
            true
        }
      )
      .order(
        "hora_inicio",
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


  const atividades =
    resultado.data ||
    [];


  const agoraMinutos =
    agora.getHours() *
      60 +
    agora.getMinutes();


  const proxima =
    atividades.find(
      (atividade) => {

        if (
          atividade.data !==
          hojeISO
        ) {

          return true;

        }


        const horario =
          removerSegundosNaoResponderam(
            atividade.hora_inicio
          );


        if (
          !horario
        ) {

          return true;

        }


        const [
          hora,
          minuto
        ] =
          horario
            .split(
              ":"
            )
            .map(
              Number
            );


        const atividadeMinutos =
          hora * 60 +
          minuto;


        return (
          atividadeMinutos >=
          agoraMinutos
        );

      }
    );


  if (
    !proxima
  ) {

    atividadeNaoResponderamAtual =
      null;


    dadosAtividadeNaoResponderam.innerHTML =
      `
        <div class="dados-atividade">

          <span>
            Nenhuma próxima atividade disponível.
          </span>

        </div>
      `;


    listaNaoResponderamAtividade.innerHTML =
      `
        <p>
          Nenhuma atividade disponível.
        </p>
      `;


    return;

  }


  atividadeNaoResponderamAtual =
    proxima;


  const data =
    criarDataLocalNaoResponderam(
      proxima.data
    );


  const horario =
    removerSegundosNaoResponderam(
      proxima.hora_inicio
    );


  const tipo =
    formatarTipoAtividadeNaoResponderam(
      proxima
    );


  dadosAtividadeNaoResponderam.innerHTML =
    `
      <div class="data-atividade">

        ${String(
          data.getDate()
        ).padStart(
          2,
          "0"
        )}

        <br>

        ${formatarMesCurtoNaoResponderam(
          data
        )}

      </div>


      <div class="dados-atividade">

        <strong>
          ${tipo}
        </strong>

        <strong>
          ${proxima.titulo}
        </strong>

        <span>

          ${formatarDiaSemanaNaoResponderam(
            data
          )}

          ${
            horario
              ? ` • ${horario}`
              : ""
          }

        </span>

      </div>
    `;
}


/* ==========================================
   FUNÇÕES QUE DEVEM RESPONDER
========================================== */

function obterNomesFuncoesEsperadasNaoResponderam() {

  if (
    !atividadeNaoResponderamAtual
  ) {

    return [];

  }


  if (
    atividadeNaoResponderamAtual
      .tipo_atividade ===
    "gira_principal"
  ) {

    return [
      "Médium Corrente Principal",
      "Médium Principal"
    ];

  }


  if (
    atividadeNaoResponderamAtual
      .tipo_atividade ===
    "gira_desenvolvimento"
  ) {

    return [
      "Médium em Desenvolvimento"
    ];

  }


  return [];
}


/* ==========================================
   BUSCAR IDs DAS FUNÇÕES
========================================== */

async function buscarFuncoesEsperadasNaoResponderam() {

  const nomes =
    obterNomesFuncoesEsperadasNaoResponderam();


  if (
    nomes.length === 0
  ) {

    return [];

  }


  const resultado =
    await window.supabaseClient
      .from(
        "funcoes"
      )
      .select(`
        id,
        nome
      `)
      .in(
        "nome",
        nomes
      );


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  return resultado.data ||
    [];
}


/* ==========================================
   BUSCAR USUÁRIOS DAS FUNÇÕES
========================================== */

async function buscarIdsUsuariosEsperadosNaoResponderam(
  funcoes
) {

  if (
    funcoes.length === 0
  ) {

    return [];

  }


  const idsFuncoes =
    funcoes
      .map(
        (funcao) =>
          funcao.id
      )
      .filter(
        Boolean
      );


  if (
    idsFuncoes.length === 0
  ) {

    return [];

  }


  const resultado =
    await window.supabaseClient
      .from(
        "usuario_funcoes"
      )
      .select(`
        usuario_id,
        funcao_id
      `)
      .in(
        "funcao_id",
        idsFuncoes
      );


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  return [
    ...new Set(
      (
        resultado.data ||
        []
      )
        .map(
          (item) =>
            item.usuario_id
        )
        .filter(
          Boolean
        )
    )
  ];
}


/* ==========================================
   BUSCAR DADOS DOS USUÁRIOS ESPERADOS
========================================== */

async function buscarUsuariosEsperadosNaoResponderam(
  idsUsuarios
) {

  if (
    idsUsuarios.length === 0
  ) {

    return [];

  }


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
      .in(
        "id",
        idsUsuarios
      );


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  return (
    resultado.data ||
    []
  )
    .filter(
      (usuario) => {

        const status =
          String(
            usuario.status ||
            ""
          )
            .trim()
            .toLowerCase();


        return (
          status !==
            "inativo" &&
          status !==
            "inactive"
        );

      }
    );
}


/* ==========================================
   BUSCAR QUEM JÁ RESPONDEU
========================================== */

async function buscarIdsUsuariosQueResponderamNaoResponderam() {

  if (
    !atividadeNaoResponderamAtual
  ) {

    return [];

  }


  const resultado =
    await window.supabaseClient
      .from(
        "confirmacoes_presenca"
      )
      .select(`
        usuario_id,
        resposta
      `)
      .eq(
        "atividade_id",
        atividadeNaoResponderamAtual.id
      );


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  return [
    ...new Set(
      (
        resultado.data ||
        []
      )
        .map(
          (item) =>
            item.usuario_id
        )
        .filter(
          Boolean
        )
    )
  ];
}


/* ==========================================
   MONTAR LISTA DE QUEM NÃO RESPONDEU
========================================== */

async function buscarNaoResponderamAtividade() {

  const funcoes =
    await buscarFuncoesEsperadasNaoResponderam();


  const idsUsuariosEsperados =
    await buscarIdsUsuariosEsperadosNaoResponderam(
      funcoes
    );


  const usuariosEsperados =
    await buscarUsuariosEsperadosNaoResponderam(
      idsUsuariosEsperados
    );


  const idsQueResponderam =
    await buscarIdsUsuariosQueResponderamNaoResponderam();


  const conjuntoResponderam =
    new Set(
      idsQueResponderam
    );


  return usuariosEsperados
    .filter(
      (usuario) =>
        !conjuntoResponderam.has(
          usuario.id
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
          "pt-BR"
        )
    );
}


/* ==========================================
   RENDERIZAR LISTA
========================================== */

function renderizarNaoResponderam(
  usuarios
) {

  listaNaoResponderamAtividade.innerHTML =
    "";


  if (
    usuarios.length === 0
  ) {

    listaNaoResponderamAtividade.innerHTML =
      `
        <p>
          Todos já responderam.
        </p>
      `;


    return;

  }


  const resumo =
    document.createElement(
      "p"
    );


  resumo.style.fontWeight =
    "700";


  resumo.style.marginBottom =
    "12px";


  resumo.textContent =
    usuarios.length === 1
      ? "1 pessoa ainda não respondeu."
      : `${usuarios.length} pessoas ainda não responderam.`;


  listaNaoResponderamAtividade.appendChild(
    resumo
  );


  usuarios.forEach(
    (usuario) => {

      const linha =
        document.createElement(
          "div"
        );


      linha.className =
        "item-ausente-atividade";


      linha.textContent =
        usuario.nome_completo ||
        "Associado";


      listaNaoResponderamAtividade.appendChild(
        linha
      );

    }
  );
}


/* ==========================================
   CARREGAR LISTA
========================================== */

async function carregarNaoResponderam() {

  const usuarios =
    await buscarNaoResponderamAtividade();


  renderizarNaoResponderam(
    usuarios
  );
}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

async function iniciarTelaNaoResponderam() {

  if (
    !window.supabaseClient
  ) {

    return;

  }


  try {

    await validarUsuarioLogadoNaoResponderam();

    await carregarAtividadeNaoResponderam();


    if (
      !atividadeNaoResponderamAtual
    ) {

      return;

    }


    await carregarNaoResponderam();


  } catch (erro) {

    console.error(
      "Erro ao carregar quem não respondeu:",
      erro
    );


    listaNaoResponderamAtividade.innerHTML =
      `
        <p>
          Não foi possível carregar a lista.
        </p>
      `;

  }
}


iniciarTelaNaoResponderam();
