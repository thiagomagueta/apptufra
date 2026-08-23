"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const dadosAtividadeAusencias =
  document.getElementById(
    "dadosAtividadeAusencias"
  );

const listaAusentesAtividade =
  document.getElementById(
    "listaAusentesAtividade"
  );

const listaJustificativasAtividade =
  document.getElementById(
    "listaJustificativasAtividade"
  );


/* ==========================================
   DADOS
========================================== */

let atividadeAusenciasAtual =
  null;

let usuarioDiretoriaAtual =
  null;


/* ==========================================
   DATA LOCAL
========================================== */

function criarDataLocalAusencias(
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

function formatarMesCurtoAusencias(
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

function formatarDiaSemanaAusencias(
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

function removerSegundosAusencias(
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

function formatarTipoAtividadeAusencias(
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

function obterHojeISOAusencias() {

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
   CARREGAR USUÁRIO DA DIRETORIA
========================================== */

async function carregarUsuarioDiretoria() {

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


  usuarioDiretoriaAtual =
    resultadoUsuario.data;
}


/* ==========================================
   CARREGAR PRÓXIMA ATIVIDADE
========================================== */

async function carregarAtividadeAusencias() {

  const agora =
    new Date();


  const hojeISO =
    obterHojeISOAusencias();


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
          removerSegundosAusencias(
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

    atividadeAusenciasAtual =
      null;


    dadosAtividadeAusencias.innerHTML =
      `
        <div class="dados-atividade">

          <span>
            Nenhuma próxima atividade disponível.
          </span>

        </div>
      `;


    listaAusentesAtividade.innerHTML =
      `
        <p>
          Nenhuma atividade disponível.
        </p>
      `;


    listaJustificativasAtividade.innerHTML =
      `
        <p>
          Nenhuma atividade disponível.
        </p>
      `;


    return;

  }


  atividadeAusenciasAtual =
    proxima;


  const data =
    criarDataLocalAusencias(
      proxima.data
    );


  const horario =
    removerSegundosAusencias(
      proxima.hora_inicio
    );


  const tipo =
    formatarTipoAtividadeAusencias(
      proxima
    );


  dadosAtividadeAusencias.innerHTML =
    `
      <div class="data-atividade">

        ${String(
          data.getDate()
        ).padStart(
          2,
          "0"
        )}

        <br>

        ${formatarMesCurtoAusencias(
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

          ${formatarDiaSemanaAusencias(
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
   BUSCAR AUSÊNCIAS
========================================== */

async function buscarAusenciasAtividade() {

  if (
    !atividadeAusenciasAtual
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
        justificativa,
        lido_diretoria,
        lido_em,
        lido_por,

        usuarios (
          id,
          nome_completo
        )
      `)
      .eq(
        "atividade_id",
        atividadeAusenciasAtual.id
      )
      .eq(
        "resposta",
        "ausente"
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
   ORDENAR POR NOME
========================================== */

function ordenarAusenciasPorNome(
  ausencias
) {

  return [...ausencias].sort(
    (a, b) => {

      const nomeA =
        String(
          a.usuarios?.nome_completo ||
          ""
        );


      const nomeB =
        String(
          b.usuarios?.nome_completo ||
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
   LISTA SIMPLES DE AUSENTES
========================================== */

function renderizarListaAusentes(
  ausencias
) {

  listaAusentesAtividade.innerHTML =
    "";


  if (
    ausencias.length === 0
  ) {

    listaAusentesAtividade.innerHTML =
      `
        <p>
          Nenhuma ausência informada.
        </p>
      `;


    return;

  }


  const ausenciasOrdenadas =
    ordenarAusenciasPorNome(
      ausencias
    );


  ausenciasOrdenadas.forEach(
    (item) => {

      const nome =
        item.usuarios?.nome_completo ||
        "Associado";


      const linha =
        document.createElement(
          "div"
        );


      linha.className =
        "item-ausente-atividade";


      linha.textContent =
        nome;


      listaAusentesAtividade.appendChild(
        linha
      );

    }
  );
}


/* ==========================================
   FORMATAR LEITURA
========================================== */

function formatarDataHoraLeitura(
  dataISO
) {

  if (
    !dataISO
  ) {

    return "";

  }


  const data =
    new Date(
      dataISO
    );


  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle:
        "short",

      timeStyle:
        "short"
    }
  ).format(
    data
  );
}


/* ==========================================
   MARCAR COMO LIDO
========================================== */

async function marcarJustificativaComoLida(
  confirmacaoId,
  botao
) {

  if (
    !usuarioDiretoriaAtual
  ) {

    return;

  }


  try {

    botao.disabled =
      true;

    botao.textContent =
      "Salvando...";


    const agora =
      new Date().toISOString();


    const resultado =
      await window.supabaseClient
        .from(
          "confirmacoes_presenca"
        )
        .update({

          lido_diretoria:
            true,

          lido_em:
            agora,

          lido_por:
            usuarioDiretoriaAtual.id

        })
        .eq(
          "id",
          confirmacaoId
        );


    if (
      resultado.error
    ) {

      throw resultado.error;

    }


    await carregarAusencias();


  } catch (erro) {

    console.error(
      "Erro ao marcar justificativa como lida:",
      erro
    );


    botao.disabled =
      false;

    botao.textContent =
      "✓ Lido";


    window.alert(
      "Não foi possível registrar a leitura."
    );

  }
}


/* ==========================================
   JUSTIFICATIVAS
========================================== */

function renderizarJustificativas(
  ausencias
) {

  listaJustificativasAtividade.innerHTML =
    "";


  const justificadas =
    ordenarAusenciasPorNome(
      ausencias.filter(
        (item) =>
          String(
            item.justificativa ||
            ""
          ).trim()
      )
    );


  if (
    justificadas.length === 0
  ) {

    listaJustificativasAtividade.innerHTML =
      `
        <p>
          Nenhuma justificativa cadastrada.
        </p>
      `;


    return;

  }


  justificadas.forEach(
    (item) => {

      const nome =
        item.usuarios?.nome_completo ||
        "Associado";


      const bloco =
        document.createElement(
          "div"
        );


      bloco.className =
        "item-justificativa-atividade";


      const titulo =
        document.createElement(
          "strong"
        );


      titulo.className =
        "nome-justificativa-atividade";


      titulo.textContent =
        nome;


      bloco.appendChild(
        titulo
      );


      const texto =
        document.createElement(
          "p"
        );


      texto.className =
        "texto-justificativa-atividade";


      texto.textContent =
        item.justificativa;


      bloco.appendChild(
        texto
      );


      const areaLeitura =
        document.createElement(
          "div"
        );


      areaLeitura.className =
        "area-leitura-justificativa";


      if (
        item.lido_diretoria
      ) {

        const status =
          document.createElement(
            "span"
          );


        status.className =
          "status-justificativa-lida";


        status.textContent =
          "✓ Lido";


        areaLeitura.appendChild(
          status
        );


        if (
          item.lido_em
        ) {

          const dataLeitura =
            document.createElement(
              "span"
            );


          dataLeitura.className =
            "data-leitura-justificativa";


          dataLeitura.textContent =
            formatarDataHoraLeitura(
              item.lido_em
            );


          areaLeitura.appendChild(
            dataLeitura
          );

        }


      } else {

        const botao =
          document.createElement(
            "button"
          );


        botao.type =
          "button";


        botao.className =
          "botao-marcar-justificativa-lida";


        botao.textContent =
          "✓ Lido";


        botao.addEventListener(
          "click",
          () => {

            marcarJustificativaComoLida(
              item.id,
              botao
            );

          }
        );


        areaLeitura.appendChild(
          botao
        );

      }


      bloco.appendChild(
        areaLeitura
      );


      listaJustificativasAtividade.appendChild(
        bloco
      );

    }
  );
}


/* ==========================================
   CARREGAR AUSÊNCIAS
========================================== */

async function carregarAusencias() {

  const ausencias =
    await buscarAusenciasAtividade();


  renderizarListaAusentes(
    ausencias
  );


  renderizarJustificativas(
    ausencias
  );
}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

async function iniciarTelaAusencias() {

  if (
    !window.supabaseClient
  ) {

    return;

  }


  try {

    await carregarUsuarioDiretoria();

    await carregarAtividadeAusencias();


    if (
      !atividadeAusenciasAtual
    ) {

      return;

    }


    await carregarAusencias();


  } catch (erro) {

    console.error(
      "Erro ao carregar tela de ausências:",
      erro
    );


    listaAusentesAtividade.innerHTML =
      `
        <p>
          Não foi possível carregar as ausências.
        </p>
      `;


    listaJustificativasAtividade.innerHTML =
      `
        <p>
          Não foi possível carregar as justificativas.
        </p>
      `;

  }
}


iniciarTelaAusencias();
