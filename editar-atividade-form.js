"use strict";

const formEditarAtividade =
  document.getElementById(
    "formEditarAtividade"
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

const mensagemEditarAtividade =
  document.getElementById(
    "mensagemEditarAtividade"
  );

const botaoSalvarAtividade =
  document.getElementById(
    "botaoSalvarAtividade"
  );


function obterAtividadeId() {
  const parametros =
    new URLSearchParams(
      window.location.search
    );

  return parametros.get("id");
}


function mostrarMensagem(texto) {
  mensagemEditarAtividade.textContent =
    texto;

  mensagemEditarAtividade.hidden =
    false;
}


function esconderMensagem() {
  mensagemEditarAtividade.textContent =
    "";

  mensagemEditarAtividade.hidden =
    true;
}


function removerSegundos(horario) {
  if (!horario) {
    return "";
  }

  return horario.slice(0, 5);
}


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


async function carregarAtividade() {
  const atividadeId =
    obterAtividadeId();

  if (!atividadeId) {
    window.location.href =
      "editar-atividade.html";

    return;
  }

  if (!window.supabaseClient) {
    return;
  }

  try {

    const resultado =
      await window.supabaseClient
        .from("atividades")
        .select(`
          id,
          titulo,
          data,
          hora_inicio,
          hora_fim,
          tipo_atividade,
          tipo_outro,
          observacao
        `)
        .eq(
          "id",
          atividadeId
        )
        .maybeSingle();


    if (resultado.error) {
      throw resultado.error;
    }


    const atividade =
      resultado.data;


    if (!atividade) {
      throw new Error(
        "Atividade não encontrada."
      );
    }


    tituloAtividade.value =
      atividade.titulo || "";

    dataAtividade.value =
      atividade.data || "";

    horaInicioAtividade.value =
      removerSegundos(
        atividade.hora_inicio
      );

    horaFimAtividade.value =
      removerSegundos(
        atividade.hora_fim
      );

    tipoAtividade.value =
      atividade.tipo_atividade || "";

    tipoOutroAtividade.value =
      atividade.tipo_outro || "";

    observacaoAtividade.value =
      atividade.observacao || "";

    atualizarCampoOutro();

  } catch (erro) {

    console.error(
      "Erro ao carregar atividade:",
      erro
    );

    mostrarMensagem(
      "Não foi possível carregar a atividade."
    );
  }
}


async function salvarAlteracoes(
  evento
) {
  evento.preventDefault();

  esconderMensagem();


  const atividadeId =
    obterAtividadeId();


  if (!atividadeId) {
    return;
  }


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


  if (
    tipo === "outros" &&
    !tipoOutro
  ) {

    mostrarMensagem(
      "Informe qual é o tipo da atividade."
    );

    return;
  }


  if (
    horaFim &&
    horaFim <= horaInicio
  ) {

    mostrarMensagem(
      "A hora de fim deve ser posterior à hora de início."
    );

    return;
  }


  botaoSalvarAtividade.disabled =
    true;

  botaoSalvarAtividade.textContent =
    "SALVANDO...";


  try {

    const resultado =
      await window.supabaseClient
        .from("atividades")
        .update({

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

          observacao:
            observacao || null

        })
        .eq(
          "id",
          atividadeId
        );


    if (resultado.error) {
      throw resultado.error;
    }


    mostrarMensagem(
      "Atividade atualizada com sucesso."
    );


    botaoSalvarAtividade.textContent =
      "Alterações salvas";


    setTimeout(() => {

      window.location.href =
        "editar-atividade.html";

    }, 900);


  } catch (erro) {

    console.error(
      "Erro ao atualizar atividade:",
      erro
    );

    mostrarMensagem(
      "Não foi possível atualizar a atividade."
    );

    botaoSalvarAtividade.disabled =
      false;

    botaoSalvarAtividade.textContent =
      "Salvar alterações";
  }
}


tipoAtividade.addEventListener(
  "change",
  atualizarCampoOutro
);


formEditarAtividade.addEventListener(
  "submit",
  salvarAlteracoes
);


carregarAtividade();
