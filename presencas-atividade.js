"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const dadosAtividadePresencas =
  document.getElementById(
    "dadosAtividadePresencas"
  );

const listaPresentesAtividade =
  document.getElementById(
    "listaPresentesAtividade"
  );


/* ==========================================
   DADOS
========================================== */

let atividadePresencasAtual =
  null;


/* ==========================================
   DATA LOCAL
========================================== */

function criarDataLocalPresencas(
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

function formatarMesCurtoPresencas(
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

function formatarDiaSemanaPresencas(
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

function removerSegundosPresencas(
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

function formatarTipoAtividadePresencas(
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

function obterHojeISOPresencas() {

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

async function validarUsuarioLogadoPresencas() {

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

async function carregarAtividadePresencas() {

  const agora =
    new Date();


  const hojeISO =
    obterHojeISOPresencas();


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
          removerSegundosPresencas(
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

    atividadePresencasAtual =
      null;


    dadosAtividadePresencas.innerHTML =
      `
        <div class="dados-atividade">

          <span>
            Nenhuma próxima atividade disponível.
          </span>

        </div>
      `;


    listaPresentesAtividade.innerHTML =
      `
        <p>
          Nenhuma atividade disponível.
        </p>
      `;


    return;

  }


  atividadePresencasAtual =
    proxima;


  const data =
    criarDataLocalPresencas(
      proxima.data
    );


  const horario =
    removerSegundosPresencas(
      proxima.hora_inicio
    );


  const tipo =
    formatarTipoAtividadePresencas(
      proxima
    );


  dadosAtividadePresencas.innerHTML =
    `
      <div class="data-atividade">

        ${String(
          data.getDate()
        ).padStart(
          2,
          "0"
        )}

        <br>

        ${formatarMesCurtoPresencas(
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

          ${formatarDiaSemanaPresencas(
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
   BUSCAR CONFIRMAÇÕES DE PRESENÇA
========================================== */

async function buscarConfirmacoesPresenca() {

  if (
    !atividadePresencasAtual
  ) {

    return [];

  }


  const resultado =
    await window.supabaseClient
      .from(
        "confirmacoes_presenca"
      )
      .select(`
        id,
        usuario_id,
        resposta,
        criado_em
      `)
      .eq(
        "atividade_id",
        atividadePresencasAtual.id
      )
      .eq(
        "resposta",
        "presente"
      )
      .order(
        "criado_em",
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


  return resultado.data ||
    [];
}


/* ==========================================
   BUSCAR NOMES DOS USUÁRIOS
========================================== */

async function buscarUsuariosDasPresencas(
  presencas
) {

  if (
    presencas.length === 0
  ) {

    return [];

  }


  const idsUsuarios =
    [
      ...new Set(
        presencas
          .map(
            (item) =>
              item.usuario_id
          )
          .filter(
            Boolean
          )
      )
    ];


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
        nome_completo
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


  return resultado.data ||
    [];
}


/* ==========================================
   JUNTAR PRESENÇAS COM USUÁRIOS
========================================== */

function juntarPresencasComUsuarios(
  presencas,
  usuarios
) {

  const usuariosPorId =
    new Map();


  usuarios.forEach(
    (usuario) => {

      usuariosPorId.set(
        usuario.id,
        usuario
      );

    }
  );


  return presencas.map(
    (presenca) => {

      return {

        ...presenca,

        usuario:
          usuariosPorId.get(
            presenca.usuario_id
          ) ||
          null

      };

    }
  );
}


/* ==========================================
   BUSCAR PRESENÇAS COMPLETAS
========================================== */

async function buscarPresencasAtividade() {

  const presencas =
    await buscarConfirmacoesPresenca();


  if (
    presencas.length === 0
  ) {

    return [];

  }


  const usuarios =
    await buscarUsuariosDasPresencas(
      presencas
    );


  return juntarPresencasComUsuarios(
    presencas,
    usuarios
  );
}


/* ==========================================
   ORDENAR POR NOME
========================================== */

function ordenarPresencasPorNome(
  presencas
) {

  return [...presencas].sort(
    (a, b) => {

      const nomeA =
        String(
          a.usuario?.nome_completo ||
          ""
        );


      const nomeB =
        String(
          b.usuario?.nome_completo ||
          ""
        );


      return nomeA.localeCompare(
        nomeB,
        "pt-BR"
      );

    }
  );
}


/* ==========================================
   LISTA DE PRESENTES
========================================== */

function renderizarListaPresentes(
  presencas
) {

  listaPresentesAtividade.innerHTML =
    "";


  if (
    presencas.length === 0
  ) {

    listaPresentesAtividade.innerHTML =
      `
        <p>
          Nenhuma presença confirmada.
        </p>
      `;


    return;

  }


  const presencasOrdenadas =
    ordenarPresencasPorNome(
      presencas
    );


  presencasOrdenadas.forEach(
    (item) => {

      const nome =
        item.usuario?.nome_completo ||
        "Associado";


      const linha =
        document.createElement(
          "div"
        );


      linha.className =
        "item-ausente-atividade";


      linha.textContent =
        nome;


      listaPresentesAtividade.appendChild(
        linha
      );

    }
  );
}


/* ==========================================
   CARREGAR PRESENÇAS
========================================== */

async function carregarPresencas() {

  const presencas =
    await buscarPresencasAtividade();


  renderizarListaPresentes(
    presencas
  );
}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

async function iniciarTelaPresencas() {

  if (
    !window.supabaseClient
  ) {

    return;

  }


  try {

    await validarUsuarioLogadoPresencas();

    await carregarAtividadePresencas();


    if (
      !atividadePresencasAtual
    ) {

      return;

    }


    await carregarPresencas();


  } catch (erro) {

    console.error(
      "Erro ao carregar tela de presenças:",
      erro
    );


    listaPresentesAtividade.innerHTML =
      `
        <p>
          Não foi possível carregar as presenças.
        </p>
      `;

  }
}


iniciarTelaPresencas();
