"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const dadosAtividadeConfirmacao =
  document.getElementById(
    "dadosAtividadeConfirmacao"
  );

const opcaoEstareiPresente =
  document.getElementById(
    "opcaoEstareiPresente"
  );

const opcaoNaoEstareiPresente =
  document.getElementById(
    "opcaoNaoEstareiPresente"
  );

const areaJustificativaPresenca =
  document.getElementById(
    "areaJustificativaPresenca"
  );

const justificativaPresenca =
  document.getElementById(
    "justificativaPresenca"
  );

const mensagemConfirmacaoPresenca =
  document.getElementById(
    "mensagemConfirmacaoPresenca"
  );

const botaoSalvarConfirmacaoPresenca =
  document.getElementById(
    "botaoSalvarConfirmacaoPresenca"
  );


/* ==========================================
   DADOS
========================================== */

let atividadeConfirmacaoAtual =
  null;

let usuarioConfirmacaoAtual =
  null;

let tipoListaConfirmacaoAtual =
  null;


/* ==========================================
   DATA LOCAL
========================================== */

function criarDataLocalConfirmacao(
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

function formatarMesCurtoConfirmacao(
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

function formatarDiaSemanaConfirmacao(
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

function removerSegundosConfirmacao(
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

function formatarTipoAtividadeConfirmacao(
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

function obterHojeISOConfirmacao() {

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
   MENSAGEM
========================================== */

function mostrarMensagemConfirmacao(
  texto,
  tipo
) {

  if (
    !mensagemConfirmacaoPresenca
  ) {

    return;

  }


  mensagemConfirmacaoPresenca.hidden =
    false;


  mensagemConfirmacaoPresenca.className =
    "mensagem-confirmacao-presenca";


  if (
    tipo
  ) {

    mensagemConfirmacaoPresenca.classList.add(
      tipo
    );

  }


  mensagemConfirmacaoPresenca.textContent =
    texto;
}


function esconderMensagemConfirmacao() {

  if (
    !mensagemConfirmacaoPresenca
  ) {

    return;

  }


  mensagemConfirmacaoPresenca.hidden =
    true;

  mensagemConfirmacaoPresenca.textContent =
    "";

  mensagemConfirmacaoPresenca.className =
    "mensagem-confirmacao-presenca";
}


/* ==========================================
   JUSTIFICATIVA
========================================== */

function atualizarAreaJustificativa() {

  if (
    !areaJustificativaPresenca
  ) {

    return;

  }


  const ausente =
    opcaoNaoEstareiPresente
      ?.checked;


  areaJustificativaPresenca.hidden =
    !ausente;


  if (
    !ausente &&
    justificativaPresenca
  ) {

    justificativaPresenca.value =
      "";

  }
}


/* ==========================================
   CARREGAR USUÁRIO
========================================== */

async function carregarUsuarioConfirmacao() {

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


  usuarioConfirmacaoAtual =
    resultadoUsuario.data;
}


/* ==========================================
   CARREGAR PRÓXIMA ATIVIDADE
========================================== */

async function carregarAtividadeConfirmacao() {

  const agora =
    new Date();


  const hojeISO =
    obterHojeISOConfirmacao();


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
          removerSegundosConfirmacao(
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

    atividadeConfirmacaoAtual =
      null;


    dadosAtividadeConfirmacao.innerHTML =
      `
        <div class="dados-atividade">

          <span>
            Nenhuma próxima atividade disponível.
          </span>

        </div>
      `;


    return;

  }


  atividadeConfirmacaoAtual =
    proxima;


  const data =
    criarDataLocalConfirmacao(
      proxima.data
    );


  const horario =
    removerSegundosConfirmacao(
      proxima.hora_inicio
    );


  const tipo =
    formatarTipoAtividadeConfirmacao(
      proxima
    );


  dadosAtividadeConfirmacao.innerHTML =
    `
      <div class="data-atividade">

        ${String(
          data.getDate()
        ).padStart(
          2,
          "0"
        )}

        <br>

        ${formatarMesCurtoConfirmacao(
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

          ${formatarDiaSemanaConfirmacao(
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
   IDENTIFICAR LISTA DE PRESENÇA
========================================== */

async function carregarTipoListaConfirmacao() {

  if (
    !atividadeConfirmacaoAtual
  ) {

    tipoListaConfirmacaoAtual =
      null;

    return;

  }


  let nomeLista =
    null;


  if (
    atividadeConfirmacaoAtual
      .tipo_atividade ===
    "gira_principal"
  ) {

    nomeLista =
      "Corrente Principal";

  }


  if (
    atividadeConfirmacaoAtual
      .tipo_atividade ===
    "gira_desenvolvimento"
  ) {

    nomeLista =
      "Desenvolvimento";

  }


  if (
    !nomeLista
  ) {

    tipoListaConfirmacaoAtual =
      null;

    return;

  }


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
        "nome",
        nomeLista
      )
      .eq(
        "ativo",
        true
      )
      .limit(
        1
      );


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  const registros =
    resultado.data ||
    [];


  tipoListaConfirmacaoAtual =
    registros.length > 0
      ? registros[0]
      : null;


  if (
    !tipoListaConfirmacaoAtual
  ) {

    throw new Error(
      "Lista de presença não encontrada."
    );

  }
}


/* ==========================================
   CARREGAR CONFIRMAÇÃO EXISTENTE
========================================== */

async function carregarConfirmacaoExistente() {

  if (
    !usuarioConfirmacaoAtual ||
    !atividadeConfirmacaoAtual
  ) {

    return;

  }


  const resultado =
    await window.supabaseClient
      .from(
        "confirmacoes_presenca"
      )
      .select(`
        resposta,
        justificativa
      `)
      .eq(
        "atividade_id",
        atividadeConfirmacaoAtual.id
      )
      .eq(
        "usuario_id",
        usuarioConfirmacaoAtual.id
      )
      .limit(
        1
      );


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  const registros =
    resultado.data ||
    [];


  if (
    registros.length === 0
  ) {

    return;

  }


  const confirmacao =
    registros[0];


  if (
    confirmacao.resposta ===
    "presente"
  ) {

    opcaoEstareiPresente.checked =
      true;

  }


  if (
    confirmacao.resposta ===
    "ausente"
  ) {

    opcaoNaoEstareiPresente.checked =
      true;

  }


  if (
    justificativaPresenca
  ) {

    justificativaPresenca.value =
      confirmacao.justificativa ||
      "";

  }


  atualizarAreaJustificativa();
}


/* ==========================================
   BUSCAR PRESENÇA OFICIAL EXISTENTE
========================================== */

async function buscarPresencaOficialExistente() {

  if (
    !usuarioConfirmacaoAtual ||
    !atividadeConfirmacaoAtual ||
    !tipoListaConfirmacaoAtual
  ) {

    return null;

  }


  const resultado =
    await window.supabaseClient
      .from(
        "presencas"
      )
      .select(`
        tipo_lista_id,
        atividade_id,
        usuario_id,
        status,
        origem
      `)
      .eq(
        "tipo_lista_id",
        tipoListaConfirmacaoAtual.id
      )
      .eq(
        "atividade_id",
        atividadeConfirmacaoAtual.id
      )
      .eq(
        "usuario_id",
        usuarioConfirmacaoAtual.id
      )
      .limit(
        1
      );


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  const registros =
    resultado.data ||
    [];


  return registros.length > 0
    ? registros[0]
    : null;
}


/* ==========================================
   SINCRONIZAR LISTA OFICIAL
========================================== */

async function sincronizarPresencaOficial(
  resposta,
  justificativa
) {

  if (
    !tipoListaConfirmacaoAtual
  ) {

    return;

  }


  const presencaExistente =
    await buscarPresencaOficialExistente();


  /* ======================================
     MÉDIUM INFORMOU QUE VAI ESTAR PRESENTE
  ====================================== */

  if (
    resposta ===
    "presente"
  ) {

    /*
      Só removemos a marcação se ela tiver
      sido criada pela confirmação prévia.

      Qualquer registro administrativo
      permanece intacto.
    */

    if (
      presencaExistente?.origem ===
      "confirmacao_previa"
    ) {

      const resultadoExcluir =
        await window.supabaseClient
          .from(
            "presencas"
          )
          .delete()
          .eq(
            "tipo_lista_id",
            tipoListaConfirmacaoAtual.id
          )
          .eq(
            "atividade_id",
            atividadeConfirmacaoAtual.id
          )
          .eq(
            "usuario_id",
            usuarioConfirmacaoAtual.id
          )
          .eq(
            "origem",
            "confirmacao_previa"
          );


      if (
        resultadoExcluir.error
      ) {

        throw resultadoExcluir.error;

      }

    }


    return;

  }


  /* ======================================
     MÉDIUM INFORMOU AUSÊNCIA
  ====================================== */

  /*
    Se a administração já registrou alguma
    coisa, a confirmação prévia não altera.
  */

  if (
    presencaExistente &&
    presencaExistente.origem !==
      "confirmacao_previa"
  ) {

    return;

  }


  const status =
    justificativa
      ? "justificada"
      : "falta";


  const registro = {

    tipo_lista_id:
      tipoListaConfirmacaoAtual.id,

    atividade_id:
      atividadeConfirmacaoAtual.id,

    usuario_id:
      usuarioConfirmacaoAtual.id,

    status:
      status,

    origem:
      "confirmacao_previa"

  };


  const resultadoSalvar =
    await window.supabaseClient
      .from(
        "presencas"
      )
      .upsert(
        registro,
        {
          onConflict:
            "tipo_lista_id,atividade_id,usuario_id"
        }
      );


  if (
    resultadoSalvar.error
  ) {

    throw resultadoSalvar.error;

  }
}


/* ==========================================
   SALVAR CONFIRMAÇÃO
========================================== */

async function salvarConfirmacaoPresenca() {

  esconderMensagemConfirmacao();


  if (
    !atividadeConfirmacaoAtual ||
    !usuarioConfirmacaoAtual
  ) {

    mostrarMensagemConfirmacao(
      "Não foi possível identificar a atividade ou o usuário.",
      "erro"
    );


    return;

  }


  const opcaoSelecionada =
    document.querySelector(
      'input[name="confirmacaoPresenca"]:checked'
    );


  if (
    !opcaoSelecionada
  ) {

    mostrarMensagemConfirmacao(
      "Escolha se você estará presente ou não.",
      "erro"
    );


    return;

  }


  const resposta =
    opcaoSelecionada.value;


  const justificativa =
    resposta ===
      "ausente"
      ? String(
          justificativaPresenca?.value ||
          ""
        ).trim()
      : "";


  try {

    botaoSalvarConfirmacaoPresenca.disabled =
      true;

    botaoSalvarConfirmacaoPresenca.textContent =
      "Salvando...";


    /* ======================================
       SALVAR CONFIRMAÇÃO PRÉVIA
    ====================================== */

    const dadosConfirmacao = {

      atividade_id:
        atividadeConfirmacaoAtual.id,

      usuario_id:
        usuarioConfirmacaoAtual.id,

      resposta:
        resposta,

      justificativa:
        justificativa ||
        null,

      atualizado_em:
        new Date().toISOString()

    };


    const resultadoConfirmacao =
      await window.supabaseClient
        .from(
          "confirmacoes_presenca"
        )
        .upsert(
          dadosConfirmacao,
          {
            onConflict:
              "atividade_id,usuario_id"
          }
        );


    if (
      resultadoConfirmacao.error
    ) {

      throw resultadoConfirmacao.error;

    }


    /* ======================================
       SINCRONIZAR COM PRESENÇA OFICIAL
    ====================================== */

    await sincronizarPresencaOficial(
      resposta,
      justificativa
    );


    /* ======================================
       MENSAGEM FINAL
    ====================================== */

    if (
      resposta ===
      "presente"
    ) {

      mostrarMensagemConfirmacao(
        "Sua presença foi confirmada.",
        "sucesso"
      );


    } else if (
      justificativa
    ) {

      mostrarMensagemConfirmacao(
        "Sua ausência e justificativa foram registradas.",
        "sucesso"
      );


    } else {

      mostrarMensagemConfirmacao(
        "Sua ausência foi registrada.",
        "sucesso"
      );

    }


  } catch (erro) {

    console.error(
      "Erro ao salvar confirmação:",
      erro
    );


    mostrarMensagemConfirmacao(
      "Não foi possível salvar sua resposta.",
      "erro"
    );


  } finally {

    botaoSalvarConfirmacaoPresenca.disabled =
      false;

    botaoSalvarConfirmacaoPresenca.textContent =
      "Salvar resposta";

  }
}


/* ==========================================
   EVENTOS
========================================== */

if (
  opcaoEstareiPresente
) {

  opcaoEstareiPresente.addEventListener(
    "change",
    () => {

      esconderMensagemConfirmacao();

      atualizarAreaJustificativa();

    }
  );

}


if (
  opcaoNaoEstareiPresente
) {

  opcaoNaoEstareiPresente.addEventListener(
    "change",
    () => {

      esconderMensagemConfirmacao();

      atualizarAreaJustificativa();

    }
  );

}


if (
  botaoSalvarConfirmacaoPresenca
) {

  botaoSalvarConfirmacaoPresenca.addEventListener(
    "click",
    salvarConfirmacaoPresenca
  );

}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

async function iniciarConfirmacaoPresenca() {

  if (
    !window.supabaseClient
  ) {

    return;

  }


  try {

    esconderMensagemConfirmacao();


    botaoSalvarConfirmacaoPresenca.disabled =
      true;


    await carregarUsuarioConfirmacao();

    await carregarAtividadeConfirmacao();


    if (
      !atividadeConfirmacaoAtual
    ) {

      return;

    }


    await carregarTipoListaConfirmacao();

    await carregarConfirmacaoExistente();


    botaoSalvarConfirmacaoPresenca.disabled =
      false;


  } catch (erro) {

    console.error(
      "Erro ao iniciar confirmação de presença:",
      erro
    );


    mostrarMensagemConfirmacao(
      "Não foi possível carregar sua confirmação de presença.",
      "erro"
    );


    botaoSalvarConfirmacaoPresenca.disabled =
      true;

  }
}


atualizarAreaJustificativa();

iniciarConfirmacaoPresenca();
