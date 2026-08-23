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
   BUSCAR PRÓXIMA ATIVIDADE
========================================== */

async function carregarAtividadeConfirmacao() {

  if (
    !window.supabaseClient ||
    !dadosAtividadeConfirmacao
  ) {

    return;

  }


  try {

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

      dadosAtividadeConfirmacao.innerHTML =
        `
          <div class="dados-atividade">

            <span>
              Nenhuma próxima atividade disponível.
            </span>

          </div>
        `;


      botaoSalvarConfirmacaoPresenca.disabled =
        true;


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


  } catch (erro) {

    console.error(
      "Erro ao carregar atividade para confirmação:",
      erro
    );


    dadosAtividadeConfirmacao.innerHTML =
      `
        <div class="dados-atividade">

          <span>
            Não foi possível carregar a atividade.
          </span>

        </div>
      `;


    botaoSalvarConfirmacaoPresenca.disabled =
      true;

  }
}


/* ==========================================
   MOSTRAR / ESCONDER JUSTIFICATIVA
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
   SALVAR - TESTE VISUAL
========================================== */

function salvarConfirmacaoTeste() {

  esconderMensagemConfirmacao();


  if (
    !atividadeConfirmacaoAtual
  ) {

    mostrarMensagemConfirmacao(
      "Nenhuma atividade disponível para confirmação.",
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


  if (
    opcaoSelecionada.value ===
    "presente"
  ) {

    mostrarMensagemConfirmacao(
      "Teste concluído: você marcou que estará presente.",
      "sucesso"
    );


    return;

  }


  const justificativa =
    String(
      justificativaPresenca?.value ||
      ""
    ).trim();


  if (
    justificativa
  ) {

    mostrarMensagemConfirmacao(
      "Teste concluído: ausência informada com justificativa.",
      "sucesso"
    );


  } else {

    mostrarMensagemConfirmacao(
      "Teste concluído: ausência informada sem justificativa.",
      "sucesso"
    );

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
    salvarConfirmacaoTeste
  );

}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

atualizarAreaJustificativa();

carregarAtividadeConfirmacao();
