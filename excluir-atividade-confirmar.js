"use strict";

const dadosAtividadeExcluir =
  document.getElementById(
    "dadosAtividadeExcluir"
  );

const botaoConfirmarExclusao =
  document.getElementById(
    "botaoConfirmarExclusao"
  );

const mensagemExcluirAtividade =
  document.getElementById(
    "mensagemExcluirAtividade"
  );


function obterAtividadeId() {
  const parametros =
    new URLSearchParams(
      window.location.search
    );

  return parametros.get("id");
}


function criarDataLocal(dataISO) {
  const [ano, mes, dia] =
    dataISO
      .split("-")
      .map(Number);

  return new Date(
    ano,
    mes - 1,
    dia
  );
}


function formatarData(dataISO) {
  const data =
    criarDataLocal(dataISO);

  return new Intl.DateTimeFormat(
    "pt-BR"
  ).format(data);
}


function removerSegundos(horario) {
  if (!horario) {
    return "";
  }

  return horario.slice(0, 5);
}


function formatarTipoAtividade(
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
    ] || "Atividade"
  );
}


function montarHorario(
  atividade
) {
  const inicio =
    removerSegundos(
      atividade.hora_inicio
    );

  const fim =
    removerSegundos(
      atividade.hora_fim
    );

  if (inicio && fim) {
    return `${inicio} às ${fim}`;
  }

  if (inicio) {
    return inicio;
  }

  return "Horário não informado";
}


function mostrarMensagem(
  texto
) {
  mensagemExcluirAtividade.textContent =
    texto;

  mensagemExcluirAtividade.hidden =
    false;
}


async function carregarAtividade() {
  const atividadeId =
    obterAtividadeId();

  if (!atividadeId) {
    window.location.href =
      "excluir-atividade.html";

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


    dadosAtividadeExcluir.innerHTML =
      `
        <strong class="tipo-exclusao-atividade">
          ${formatarTipoAtividade(
            atividade
          )}
        </strong>

        <strong class="titulo-exclusao-atividade">
          ${atividade.titulo}
        </strong>

        <span>
          ${formatarData(
            atividade.data
          )}
        </span>

        <span>
          ${montarHorario(
            atividade
          )}
        </span>

        ${
          atividade.observacao
            ? `
              <p>
                ${atividade.observacao}
              </p>
            `
            : ""
        }
      `;


    botaoConfirmarExclusao.disabled =
      false;

  } catch (erro) {

    console.error(
      "Erro ao carregar atividade:",
      erro
    );

    dadosAtividadeExcluir.innerHTML =
      "<p>Não foi possível carregar a atividade.</p>";
  }
}


async function excluirAtividade() {
  const atividadeId =
    obterAtividadeId();

  if (!atividadeId) {
    return;
  }

  botaoConfirmarExclusao.disabled =
    true;

  botaoConfirmarExclusao.textContent =
    "EXCLUINDO...";


  try {

    const resultado =
      await window.supabaseClient
        .from("atividades")
        .delete()
        .eq(
          "id",
          atividadeId
        );


    if (resultado.error) {
      throw resultado.error;
    }


    mostrarMensagem(
      "Atividade excluída com sucesso."
    );


    botaoConfirmarExclusao.textContent =
      "Atividade excluída";


    setTimeout(() => {

      window.location.href =
        "excluir-atividade.html";

    }, 900);


  } catch (erro) {

    console.error(
      "Erro ao excluir atividade:",
      erro
    );

    mostrarMensagem(
      "Não foi possível excluir a atividade."
    );

    botaoConfirmarExclusao.disabled =
      false;

    botaoConfirmarExclusao.textContent =
      "Excluir atividade";
  }
}


botaoConfirmarExclusao.addEventListener(
  "click",
  excluirAtividade
);


carregarAtividade();
