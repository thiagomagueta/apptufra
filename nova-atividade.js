"use strict";

/* ==========================================
   ELEMENTOS
========================================== */

const formNovaAtividade =
  document.getElementById(
    "formNovaAtividade"
  );

const tituloAtividade =
  document.getElementById(
    "tituloAtividade"
  );

const dataAtividade =
  document.getElementById(
    "dataAtividade"
  );

const horaInicioAtividade =
  document.getElementById(
    "horaInicioAtividade"
  );

const horaFimAtividade =
  document.getElementById(
    "horaFimAtividade"
  );

const tipoAtividade =
  document.getElementById(
    "tipoAtividade"
  );

const areaTipoOutro =
  document.getElementById(
    "areaTipoOutro"
  );

const tipoOutroAtividade =
  document.getElementById(
    "tipoOutroAtividade"
  );

const observacaoAtividade =
  document.getElementById(
    "observacaoAtividade"
  );

const mensagemNovaAtividade =
  document.getElementById(
    "mensagemNovaAtividade"
  );

const botaoCadastrarAtividade =
  document.getElementById(
    "botaoCadastrarAtividade"
  );


/* ==========================================
   MENSAGEM
========================================== */

function mostrarMensagem(
  texto
) {
  mensagemNovaAtividade.textContent =
    texto;

  mensagemNovaAtividade.hidden =
    false;
}


function esconderMensagem() {
  mensagemNovaAtividade.textContent =
    "";

  mensagemNovaAtividade.hidden =
    true;
}


/* ==========================================
   CAMPO OUTROS
========================================== */

function atualizarCampoOutro() {
  const selecionouOutros =
    tipoAtividade.value ===
    "outros";

  areaTipoOutro.hidden =
    !selecionouOutros;

  tipoOutroAtividade.required =
    selecionouOutros;

  if (!selecionouOutros) {
    tipoOutroAtividade.value =
      "";
  }
}


/* ==========================================
   USUÁRIO LOGADO
========================================== */

async function obterUsuarioLogado() {
  const resultadoSessao =
    await window.supabaseClient.auth
      .getSession();

  if (resultadoSessao.error) {
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

  if (resultadoUsuario.error) {
    throw resultadoUsuario.error;
  }

  if (!resultadoUsuario.data) {
    throw new Error(
      "Usuário não encontrado."
    );
  }

  return resultadoUsuario.data.id;
}


/* ==========================================
   CADASTRAR ATIVIDADE
========================================== */

async function cadastrarAtividade(
  evento
) {
  evento.preventDefault();

  esconderMensagem();

  const titulo =
    tituloAtividade.value.trim();

  const data =
    dataAtividade.value;

  const horaInicio =
    horaInicioAtividade.value;

  const horaFim =
    horaFimAtividade.value;

  const tipo =
    tipoAtividade.value;

  const tipoOutro =
    tipoOutroAtividade.value.trim();

  const observacao =
    observacaoAtividade.value.trim();


  /* CAMPOS OBRIGATÓRIOS */

  if (
    !titulo ||
    !data ||
    !horaInicio ||
    !tipo
  ) {
    mostrarMensagem(
      "Preencha os campos obrigatórios."
    );

    return;
  }


  /* OUTROS */

  if (
    tipo === "outros" &&
    !tipoOutro
  ) {
    mostrarMensagem(
      "Informe qual é o tipo da atividade."
    );

    tipoOutroAtividade.focus();

    return;
  }


  /* HORÁRIO FINAL */

  if (
    horaFim &&
    horaFim <= horaInicio
  ) {
    mostrarMensagem(
      "A hora de fim deve ser posterior à hora de início."
    );

    return;
  }


  botaoCadastrarAtividade.disabled =
    true;

  botaoCadastrarAtividade.textContent =
    "CADASTRANDO...";


  try {

    const criadoPor =
      await obterUsuarioLogado();

    const novaAtividade = {
      titulo:
        titulo,

      data:
        data,

      hora_inicio:
        horaInicio,

      hora_fim:
        horaFim || null,

      tipo_atividade:
        tipo,

      tipo_outro:
        tipo === "outros"
          ? tipoOutro
          : null,

      origem:
        "app",

      google_event_id:
        null,

      observacao:
        observacao || null,

      criado_por:
        criadoPor
    };


    const resultado =
      await window.supabaseClient
        .from("atividades")
        .insert(
          novaAtividade
        );


    if (resultado.error) {
      throw resultado.error;
    }


    mostrarMensagem(
      "Atividade cadastrada com sucesso."
    );


    formNovaAtividade.reset();

    atualizarCampoOutro();


    botaoCadastrarAtividade.textContent =
      "Atividade cadastrada";


    setTimeout(() => {

      botaoCadastrarAtividade.disabled =
        false;

      botaoCadastrarAtividade.textContent =
        "Cadastrar atividade";

    }, 1200);


  } catch (erro) {

    console.error(
      "Erro ao cadastrar atividade:",
      erro
    );

    mostrarMensagem(
      "Não foi possível cadastrar a atividade."
    );

    botaoCadastrarAtividade.disabled =
      false;

    botaoCadastrarAtividade.textContent =
      "Cadastrar atividade";

  }
}


/* ==========================================
   EVENTOS
========================================== */

tipoAtividade.addEventListener(
  "change",
  atualizarCampoOutro
);

formNovaAtividade.addEventListener(
  "submit",
  cadastrarAtividade
);


/* ==========================================
   INICIALIZAÇÃO
========================================== */

atualizarCampoOutro();
