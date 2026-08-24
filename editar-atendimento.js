"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const nomePessoaAtendida =
  document.getElementById(
    "nomePessoaAtendida"
  );

const dataAtendimento =
  document.getElementById(
    "dataAtendimento"
  );

const motivoAtendimento =
  document.getElementById(
    "motivoAtendimento"
  );

const relatoAtendimento =
  document.getElementById(
    "relatoAtendimento"
  );

const orientacaoAtendimento =
  document.getElementById(
    "orientacaoAtendimento"
  );

const precisaAcompanhamento =
  document.getElementById(
    "precisaAcompanhamento"
  );

const areaDataRetorno =
  document.getElementById(
    "areaDataRetorno"
  );

const dataRetorno =
  document.getElementById(
    "dataRetorno"
  );

const mensagemEditarAtendimento =
  document.getElementById(
    "mensagemEditarAtendimento"
  );

const botaoSalvarAlteracoes =
  document.getElementById(
    "botaoSalvarAlteracoes"
  );

const linkVoltarAtendimentos =
  document.getElementById(
    "linkVoltarAtendimentos"
  );


/* ==========================================
   RELATO - FALAR PARA TEXTO
========================================== */

const botaoFalarTextoRelato =
  document.getElementById(
    "botaoFalarTextoRelato"
  );

const statusFalaTextoRelato =
  document.getElementById(
    "statusFalaTextoRelato"
  );


/* ==========================================
   RELATO - ÁUDIO
========================================== */

const botaoGravarRelato =
  document.getElementById(
    "botaoGravarRelato"
  );

const areaAudioRelato =
  document.getElementById(
    "areaAudioRelato"
  );

const statusAudioRelato =
  document.getElementById(
    "statusAudioRelato"
  );

const playerAudioRelato =
  document.getElementById(
    "playerAudioRelato"
  );

const botaoReproduzirAudioRelato =
  document.getElementById(
    "botaoReproduzirAudioRelato"
  );

const botaoPararAudioRelato =
  document.getElementById(
    "botaoPararAudioRelato"
  );

const duracaoAudioRelato =
  document.getElementById(
    "duracaoAudioRelato"
  );

const botaoApagarAudioRelato =
  document.getElementById(
    "botaoApagarAudioRelato"
  );


/* ==========================================
   ORIENTAÇÃO - FALAR PARA TEXTO
========================================== */

const botaoFalarTextoOrientacao =
  document.getElementById(
    "botaoFalarTextoOrientacao"
  );

const statusFalaTextoOrientacao =
  document.getElementById(
    "statusFalaTextoOrientacao"
  );


/* ==========================================
   ORIENTAÇÃO - ÁUDIO
========================================== */

const botaoGravarOrientacao =
  document.getElementById(
    "botaoGravarOrientacao"
  );

const areaAudioOrientacao =
  document.getElementById(
    "areaAudioOrientacao"
  );

const statusAudioOrientacao =
  document.getElementById(
    "statusAudioOrientacao"
  );

const playerAudioOrientacao =
  document.getElementById(
    "playerAudioOrientacao"
  );

const botaoReproduzirAudioOrientacao =
  document.getElementById(
    "botaoReproduzirAudioOrientacao"
  );

const botaoPararAudioOrientacao =
  document.getElementById(
    "botaoPararAudioOrientacao"
  );

const duracaoAudioOrientacao =
  document.getElementById(
    "duracaoAudioOrientacao"
  );

const botaoApagarAudioOrientacao =
  document.getElementById(
    "botaoApagarAudioOrientacao"
  );


/* ==========================================
   ESTADO GERAL
========================================== */

let atendimentoId =
  null;

let usuarioLogadoId =
  null;


/* ==========================================
   ÁUDIO EXISTENTE
========================================== */

let relatoAudioPathAtual =
  null;

let relatoAudioDuracaoAtual =
  null;

let orientacaoAudioPathAtual =
  null;

let orientacaoAudioDuracaoAtual =
  null;


/* ==========================================
   NOVOS ÁUDIOS
========================================== */

let novoAudioRelatoBlob =
  null;

let novoAudioRelatoUrl =
  null;

let novoAudioRelatoDuracao =
  null;


let novoAudioOrientacaoBlob =
  null;

let novoAudioOrientacaoUrl =
  null;

let novoAudioOrientacaoDuracao =
  null;


/* ==========================================
   APAGAR ÁUDIO EXISTENTE
========================================== */

let apagarRelatoAudio =
  false;

let apagarOrientacaoAudio =
  false;


/* ==========================================
   GRAVAÇÃO
========================================== */

let gravacaoAtual =
  null;

let intervaloCronometro =
  null;

let segundosGravacao =
  0;


/* ==========================================
   FALAR PARA TEXTO
========================================== */

let reconhecimentoTextoAtual =
  null;

let tipoReconhecimentoTextoAtual =
  null;

let textoReconhecidoAtual =
  "";

let reconhecimentoTextoFinalizando =
  false;


/* ==========================================
   PARÂMETROS
========================================== */

function obterParametros() {

  const parametros =
    new URLSearchParams(
      window.location.search
    );


  atendimentoId =
    parametros.get(
      "id"
    );


  const origem =
    parametros.get(
      "origem"
    );


  if (
    origem === "lista"
  ) {

    linkVoltarAtendimentos.href =
      "atendimentos-lista.html";

  } else {

    linkVoltarAtendimentos.href =
      "atendimentos-realizados.html";

  }

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


function juntarTextos(
  ...partes
) {

  return partes
    .map(
      (parte) =>
        String(
          parte || ""
        ).trim()
    )
    .filter(
      Boolean
    )
    .join(
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();

}


/* ==========================================
   MENSAGENS
========================================== */

function mostrarMensagem(
  texto
) {

  mensagemEditarAtendimento.textContent =
    texto;


  mensagemEditarAtendimento.hidden =
    false;

}


function esconderMensagem() {

  mensagemEditarAtendimento.textContent =
    "";


  mensagemEditarAtendimento.hidden =
    true;

}


/* ==========================================
   TEMPO
========================================== */

function formatarTempo(
  segundos
) {

  const total =
    Number(
      segundos || 0
    );


  const minutos =
    Math.floor(
      total / 60
    );


  const restante =
    total % 60;


  return `${String(
    minutos
  ).padStart(
    2,
    "0"
  )}:${String(
    restante
  ).padStart(
    2,
    "0"
  )}`;

}


function pararCronometro() {

  if (
    intervaloCronometro
  ) {

    clearInterval(
      intervaloCronometro
    );


    intervaloCronometro =
      null;

  }

}


/* ==========================================
   ACOMPANHAMENTO
========================================== */

function atualizarAcompanhamento() {

  areaDataRetorno.hidden =
    !precisaAcompanhamento.checked;


  if (
    !precisaAcompanhamento.checked
  ) {

    dataRetorno.value =
      "";

  }

}


/* ==========================================
   SUPORTE À GRAVAÇÃO
========================================== */

function gravacaoDisponivel() {

  return Boolean(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia &&
    window.MediaRecorder
  );

}


/* ==========================================
   TIPO DE ÁUDIO
========================================== */

function obterTipoAudioSuportado() {

  const tipos =
    [
      "audio/mp4",
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus"
    ];


  for (
    const tipo
    of tipos
  ) {

    if (
      window.MediaRecorder &&
      MediaRecorder.isTypeSupported(
        tipo
      )
    ) {

      return tipo;

    }

  }


  return "";

}


/* ==========================================
   EXTENSÃO
========================================== */

function obterExtensaoAudio(
  blob
) {

  const tipo =
    String(
      blob?.type || ""
    ).toLowerCase();


  if (
    tipo.includes(
      "mp4"
    )
  ) {

    return "mp4";

  }


  if (
    tipo.includes(
      "ogg"
    )
  ) {

    return "ogg";

  }


  if (
    tipo.includes(
      "mpeg"
    ) ||
    tipo.includes(
      "mp3"
    )
  ) {

    return "mp3";

  }


  return "webm";

}


/* ==========================================
   URL LOCAL
========================================== */

function liberarUrlAudio(
  url
) {

  if (
    url
  ) {

    URL.revokeObjectURL(
      url
    );

  }

}


/* ==========================================
   REPRODUÇÃO
========================================== */

function pararTodosAudios() {

  playerAudioRelato.pause();


  try {

    playerAudioRelato.currentTime =
      0;

  } catch (erro) {

    console.warn(
      "Não foi possível reiniciar o áudio do relato.",
      erro
    );

  }


  playerAudioOrientacao.pause();


  try {

    playerAudioOrientacao.currentTime =
      0;

  } catch (erro) {

    console.warn(
      "Não foi possível reiniciar o áudio da orientação.",
      erro
    );

  }

}


async function reproduzirAudio(
  player
) {

  esconderMensagem();


  pararTodosAudios();


  try {

    player.currentTime =
      0;


    await player.play();

  } catch (erro) {

    console.error(
      "Erro ao reproduzir áudio:",
      erro
    );


    mostrarMensagem(
      "Não foi possível reproduzir o áudio."
    );

  }

}


function pararAudio(
  player
) {

  player.pause();


  try {

    player.currentTime =
      0;

  } catch (erro) {

    console.warn(
      "Não foi possível reiniciar o áudio.",
      erro
    );

  }

}


/* ==========================================
   URL ASSINADA DO ÁUDIO EXISTENTE
========================================== */

async function obterUrlAudioExistente(
  caminho
) {

  const resultado =
    await window.supabaseClient
      .storage
      .from(
        "audios-atendimentos"
      )
      .createSignedUrl(
        caminho,
        3600
      );


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  if (
    !resultado.data?.signedUrl
  ) {

    throw new Error(
      "URL temporária do áudio não encontrada."
    );

  }


  return resultado.data.signedUrl;

}


/* ==========================================
   CONFIGURAR ÁUDIO DO RELATO
========================================== */

async function configurarAudioRelatoExistente() {

  if (
    !relatoAudioPathAtual
  ) {

    return;

  }


  areaAudioRelato.hidden =
    false;


  statusAudioRelato.textContent =
    "Áudio atual";


  duracaoAudioRelato.textContent =
    Number(
      relatoAudioDuracaoAtual
    ) > 0
      ? `⏱ ${formatarTempo(
          relatoAudioDuracaoAtual
        )}`
      : "⏱ duração não registrada";


  duracaoAudioRelato.hidden =
    false;


  botaoReproduzirAudioRelato.hidden =
    false;


  botaoPararAudioRelato.hidden =
    false;


  botaoApagarAudioRelato.hidden =
    false;


  try {

    const url =
      await obterUrlAudioExistente(
        relatoAudioPathAtual
      );


    playerAudioRelato.src =
      url;


  } catch (erro) {

    console.error(
      "Erro ao carregar áudio do relato:",
      erro
    );


    statusAudioRelato.textContent =
      "Não foi possível carregar o áudio atual.";

  }

}


/* ==========================================
   CONFIGURAR ÁUDIO DA ORIENTAÇÃO
========================================== */

async function configurarAudioOrientacaoExistente() {

  if (
    !orientacaoAudioPathAtual
  ) {

    return;

  }


  areaAudioOrientacao.hidden =
    false;


  statusAudioOrientacao.textContent =
    "Áudio atual";


  duracaoAudioOrientacao.textContent =
    Number(
      orientacaoAudioDuracaoAtual
    ) > 0
      ? `⏱ ${formatarTempo(
          orientacaoAudioDuracaoAtual
        )}`
      : "⏱ duração não registrada";


  duracaoAudioOrientacao.hidden =
    false;


  botaoReproduzirAudioOrientacao.hidden =
    false;


  botaoPararAudioOrientacao.hidden =
    false;


  botaoApagarAudioOrientacao.hidden =
    false;


  try {

    const url =
      await obterUrlAudioExistente(
        orientacaoAudioPathAtual
      );


    playerAudioOrientacao.src =
      url;


  } catch (erro) {

    console.error(
      "Erro ao carregar áudio da orientação:",
      erro
    );


    statusAudioOrientacao.textContent =
      "Não foi possível carregar o áudio atual.";

  }

}


/* ==========================================
   RECONHECIMENTO DE VOZ
========================================== */

function obterClasseReconhecimento() {

  return (
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    null
  );

}


function reconhecimentoDisponivel() {

  return Boolean(
    obterClasseReconhecimento()
  );

}


/* ==========================================
   CAMPO DO TEXTO
========================================== */

function obterCampoTexto(
  tipo
) {

  return tipo === "relato"
    ? relatoAtendimento
    : orientacaoAtendimento;

}


function obterBotaoFalaTexto(
  tipo
) {

  return tipo === "relato"
    ? botaoFalarTextoRelato
    : botaoFalarTextoOrientacao;

}


function atualizarStatusFalaTexto(
  tipo,
  texto,
  visivel = true
) {

  const elemento =
    tipo === "relato"
      ? statusFalaTextoRelato
      : statusFalaTextoOrientacao;


  elemento.textContent =
    texto;


  elemento.hidden =
    !visivel;

}


/* ==========================================
   FINALIZAR FALAR PARA TEXTO
========================================== */

function finalizarFalarParaTexto() {

  if (
    !reconhecimentoTextoAtual
  ) {

    return;

  }


  reconhecimentoTextoFinalizando =
    true;


  try {

    reconhecimentoTextoAtual.stop();

  } catch (erro) {

    console.warn(
      "Não foi possível finalizar o reconhecimento:",
      erro
    );

  }

}


/* ==========================================
   INICIAR FALAR PARA TEXTO
========================================== */

function iniciarFalarParaTexto(
  tipo
) {

  esconderMensagem();


  pararTodosAudios();


  if (
    gravacaoAtual
  ) {

    mostrarMensagem(
      "Finalize a gravação de áudio antes de usar Falar para texto."
    );


    return;

  }


  if (
    reconhecimentoTextoAtual &&
    tipoReconhecimentoTextoAtual ===
      tipo
  ) {

    finalizarFalarParaTexto();


    return;

  }


  if (
    reconhecimentoTextoAtual
  ) {

    mostrarMensagem(
      "Finalize o reconhecimento de voz atual antes de iniciar outro."
    );


    return;

  }


  if (
    !reconhecimentoDisponivel()
  ) {

    atualizarStatusFalaTexto(
      tipo,
      "Falar para texto não está disponível neste navegador."
    );


    return;

  }


  const ClasseReconhecimento =
    obterClasseReconhecimento();


  const reconhecimento =
    new ClasseReconhecimento();


  reconhecimento.lang =
    "pt-BR";


  reconhecimento.interimResults =
    false;


  reconhecimento.continuous =
    true;


  reconhecimento.maxAlternatives =
    1;


  reconhecimentoTextoAtual =
    reconhecimento;


  tipoReconhecimentoTextoAtual =
    tipo;


  textoReconhecidoAtual =
    "";


  reconhecimentoTextoFinalizando =
    false;


  const botao =
    obterBotaoFalaTexto(
      tipo
    );


  botao.textContent =
    "■ Finalizar fala";


  atualizarStatusFalaTexto(
    tipo,
    "Ouvindo... fale normalmente. O texto aparecerá somente quando finalizar."
  );


  reconhecimento.onresult =
    (evento) => {

      for (
        let indice =
          evento.resultIndex;
        indice <
          evento.results.length;
        indice += 1
      ) {

        const resultado =
          evento.results[
            indice
          ];


        if (
          !resultado.isFinal
        ) {

          continue;

        }


        const trecho =
          String(
            resultado[0]?.transcript ||
            ""
          ).trim();


        if (
          !trecho
        ) {

          continue;

        }


        textoReconhecidoAtual =
          juntarTextos(
            textoReconhecidoAtual,
            trecho
          );

      }

    };


  reconhecimento.onerror =
    (evento) => {

      console.warn(
        "Erro no reconhecimento de voz:",
        evento.error
      );


      if (
        evento.error ===
          "not-allowed" ||
        evento.error ===
          "service-not-allowed"
      ) {

        atualizarStatusFalaTexto(
          tipo,
          "O acesso ao microfone não foi autorizado."
        );


        reconhecimentoTextoFinalizando =
          true;

      }


      if (
        evento.error ===
        "no-speech"
      ) {

        atualizarStatusFalaTexto(
          tipo,
          "Nenhuma fala foi detectada."
        );

      }


      if (
        evento.error ===
        "audio-capture"
      ) {

        atualizarStatusFalaTexto(
          tipo,
          "Não foi possível acessar o microfone."
        );

      }

    };


  reconhecimento.onend =
    () => {

      if (
        !reconhecimentoTextoFinalizando
      ) {

        try {

          reconhecimento.start();


          return;

        } catch (erro) {

          console.warn(
            "Não foi possível continuar o reconhecimento:",
            erro
          );

        }

      }


      const campo =
        obterCampoTexto(
          tipo
        );


      const textoFinal =
        String(
          textoReconhecidoAtual || ""
        ).trim();


      if (
        textoFinal
      ) {

        campo.value =
          juntarTextos(
            campo.value,
            textoFinal
          );


        atualizarStatusFalaTexto(
          tipo,
          "Texto inserido com sucesso."
        );

      } else {

        atualizarStatusFalaTexto(
          tipo,
          "Nenhum texto foi reconhecido."
        );

      }


      botao.textContent =
        "🎤 Falar para texto";


      reconhecimentoTextoAtual =
        null;


      tipoReconhecimentoTextoAtual =
        null;


      textoReconhecidoAtual =
        "";


      reconhecimentoTextoFinalizando =
        false;

    };


  try {

    reconhecimento.start();

  } catch (erro) {

    console.error(
      "Erro ao iniciar reconhecimento:",
      erro
    );


    botao.textContent =
      "🎤 Falar para texto";


    reconhecimentoTextoAtual =
      null;


    tipoReconhecimentoTextoAtual =
      null;


    atualizarStatusFalaTexto(
      tipo,
      "Não foi possível iniciar o reconhecimento de voz."
    );

  }

}


/* ==========================================
   FINALIZAR GRAVAÇÃO
========================================== */

function finalizarGravacaoAtual() {

  if (
    gravacaoAtual &&
    gravacaoAtual.mediaRecorder &&
    gravacaoAtual.mediaRecorder.state !==
      "inactive"
  ) {

    gravacaoAtual.mediaRecorder.stop();

  }

}


/* ==========================================
   INICIAR GRAVAÇÃO
========================================== */

async function iniciarGravacao(
  tipo
) {

  esconderMensagem();


  pararTodosAudios();


  if (
    reconhecimentoTextoAtual
  ) {

    mostrarMensagem(
      "Finalize Falar para texto antes de iniciar uma gravação de áudio."
    );


    return;

  }


  if (
    !gravacaoDisponivel()
  ) {

    mostrarMensagem(
      "A gravação de áudio não está disponível neste navegador."
    );


    return;

  }


  if (
    gravacaoAtual
  ) {

    finalizarGravacaoAtual();


    return;

  }


  let stream =
    null;


  try {

    stream =
      await navigator.mediaDevices
        .getUserMedia({
          audio: true
        });


    const mimeType =
      obterTipoAudioSuportado();


    const opcoes =
      mimeType
        ? {
            mimeType:
              mimeType
          }
        : undefined;


    const mediaRecorder =
      new MediaRecorder(
        stream,
        opcoes
      );


    const partesAudio =
      [];


    const ehRelato =
      tipo === "relato";


    const botao =
      ehRelato
        ? botaoGravarRelato
        : botaoGravarOrientacao;


    const area =
      ehRelato
        ? areaAudioRelato
        : areaAudioOrientacao;


    const status =
      ehRelato
        ? statusAudioRelato
        : statusAudioOrientacao;


    area.hidden =
      false;


    botao.textContent =
      "■ Finalizar gravação";


    segundosGravacao =
      0;


    status.textContent =
      `● Gravando... ${formatarTempo(
        segundosGravacao
      )}`;


    intervaloCronometro =
      setInterval(
        () => {

          segundosGravacao +=
            1;


          status.textContent =
            `● Gravando... ${formatarTempo(
              segundosGravacao
            )}`;

        },
        1000
      );


    mediaRecorder.addEventListener(
      "dataavailable",
      (evento) => {

        if (
          evento.data &&
          evento.data.size > 0
        ) {

          partesAudio.push(
            evento.data
          );

        }

      }
    );


    mediaRecorder.addEventListener(
      "stop",
      () => {

        pararCronometro();


        const duracaoFinal =
          Math.max(
            1,
            segundosGravacao
          );


        const tipoFinal =
          mediaRecorder.mimeType ||
          mimeType ||
          "audio/webm";


        const blob =
          new Blob(
            partesAudio,
            {
              type:
                tipoFinal
            }
          );


        stream
          .getTracks()
          .forEach(
            (track) => {

              track.stop();

            }
          );


        if (
          ehRelato
        ) {

          salvarNovoAudioRelato(
            blob,
            duracaoFinal
          );

        } else {

          salvarNovoAudioOrientacao(
            blob,
            duracaoFinal
          );

        }


        gravacaoAtual =
          null;

      }
    );


    mediaRecorder.addEventListener(
      "error",
      () => {

        pararCronometro();


        stream
          .getTracks()
          .forEach(
            (track) => {

              track.stop();

            }
          );


        gravacaoAtual =
          null;


        botao.textContent =
          "🎙️ Gravar novo áudio";


        mostrarMensagem(
          "Não foi possível concluir a gravação do áudio."
        );

      }
    );


    gravacaoAtual = {

      tipo:
        tipo,

      mediaRecorder:
        mediaRecorder,

      stream:
        stream

    };


    mediaRecorder.start();


  } catch (erro) {

    console.error(
      "Erro ao acessar microfone:",
      erro
    );


    pararCronometro();


    if (
      stream
    ) {

      stream
        .getTracks()
        .forEach(
          (track) => {

            track.stop();

          }
        );

    }


    gravacaoAtual =
      null;


    if (
      erro.name ===
      "NotAllowedError"
    ) {

      mostrarMensagem(
        "O acesso ao microfone não foi autorizado."
      );


      return;

    }


    mostrarMensagem(
      "Não foi possível acessar o microfone deste aparelho."
    );

  }

}


/* ==========================================
   NOVO ÁUDIO DO RELATO
========================================== */

function salvarNovoAudioRelato(
  blob,
  duracao
) {

  liberarUrlAudio(
    novoAudioRelatoUrl
  );


  novoAudioRelatoBlob =
    blob;


  novoAudioRelatoDuracao =
    duracao;


  novoAudioRelatoUrl =
    URL.createObjectURL(
      blob
    );


  playerAudioRelato.src =
    novoAudioRelatoUrl;


  apagarRelatoAudio =
    false;


  statusAudioRelato.textContent =
    "Novo áudio gravado — substituirá o áudio atual ao salvar";


  duracaoAudioRelato.textContent =
    `⏱ ${formatarTempo(
      novoAudioRelatoDuracao
    )}`;


  duracaoAudioRelato.hidden =
    false;


  botaoReproduzirAudioRelato.hidden =
    false;


  botaoPararAudioRelato.hidden =
    false;


  botaoApagarAudioRelato.hidden =
    false;


  areaAudioRelato.hidden =
    false;


  botaoGravarRelato.textContent =
    "🎙️ Gravar novamente";

}


/* ==========================================
   NOVO ÁUDIO DA ORIENTAÇÃO
========================================== */

function salvarNovoAudioOrientacao(
  blob,
  duracao
) {

  liberarUrlAudio(
    novoAudioOrientacaoUrl
  );


  novoAudioOrientacaoBlob =
    blob;


  novoAudioOrientacaoDuracao =
    duracao;


  novoAudioOrientacaoUrl =
    URL.createObjectURL(
      blob
    );


  playerAudioOrientacao.src =
    novoAudioOrientacaoUrl;


  apagarOrientacaoAudio =
    false;


  statusAudioOrientacao.textContent =
    "Novo áudio gravado — substituirá o áudio atual ao salvar";


  duracaoAudioOrientacao.textContent =
    `⏱ ${formatarTempo(
      novoAudioOrientacaoDuracao
    )}`;


  duracaoAudioOrientacao.hidden =
    false;


  botaoReproduzirAudioOrientacao.hidden =
    false;


  botaoPararAudioOrientacao.hidden =
    false;


  botaoApagarAudioOrientacao.hidden =
    false;


  areaAudioOrientacao.hidden =
    false;


  botaoGravarOrientacao.textContent =
    "🎙️ Gravar novamente";

}


/* ==========================================
   APAGAR ÁUDIO DO RELATO
========================================== */

function apagarAudioRelato() {

  if (
    gravacaoAtual
  ) {

    return;

  }


  pararAudio(
    playerAudioRelato
  );


  if (
    novoAudioRelatoBlob
  ) {

    liberarUrlAudio(
      novoAudioRelatoUrl
    );


    novoAudioRelatoBlob =
      null;


    novoAudioRelatoUrl =
      null;


    novoAudioRelatoDuracao =
      null;

  }


  if (
    relatoAudioPathAtual
  ) {

    apagarRelatoAudio =
      true;

  }


  playerAudioRelato.removeAttribute(
    "src"
  );


  areaAudioRelato.hidden =
    true;


  statusAudioRelato.textContent =
    "";


  duracaoAudioRelato.textContent =
    "";


  duracaoAudioRelato.hidden =
    true;


  botaoReproduzirAudioRelato.hidden =
    true;


  botaoPararAudioRelato.hidden =
    true;


  botaoApagarAudioRelato.hidden =
    true;


  botaoGravarRelato.textContent =
    "🎙️ Gravar novo áudio";

}


/* ==========================================
   APAGAR ÁUDIO DA ORIENTAÇÃO
========================================== */

function apagarAudioOrientacao() {

  if (
    gravacaoAtual
  ) {

    return;

  }


  pararAudio(
    playerAudioOrientacao
  );


  if (
    novoAudioOrientacaoBlob
  ) {

    liberarUrlAudio(
      novoAudioOrientacaoUrl
    );


    novoAudioOrientacaoBlob =
      null;


    novoAudioOrientacaoUrl =
      null;


    novoAudioOrientacaoDuracao =
      null;

  }


  if (
    orientacaoAudioPathAtual
  ) {

    apagarOrientacaoAudio =
      true;

  }


  playerAudioOrientacao.removeAttribute(
    "src"
  );


  areaAudioOrientacao.hidden =
    true;


  statusAudioOrientacao.textContent =
    "";


  duracaoAudioOrientacao.textContent =
    "";


  duracaoAudioOrientacao.hidden =
    true;


  botaoReproduzirAudioOrientacao.hidden =
    true;


  botaoPararAudioOrientacao.hidden =
    true;


  botaoApagarAudioOrientacao.hidden =
    true;


  botaoGravarOrientacao.textContent =
    "🎙️ Gravar novo áudio";

}


/* ==========================================
   UPLOAD DO NOVO ÁUDIO
========================================== */

async function enviarNovoAudio(
  tipo,
  blob
) {

  const extensao =
    obterExtensaoAudio(
      blob
    );


  const nomeArquivo =
    `${tipo}-${Date.now()}.${extensao}`;


  const caminho =
    `${atendimentoId}/${nomeArquivo}`;


  const resultado =
    await window.supabaseClient
      .storage
      .from(
        "audios-atendimentos"
      )
      .upload(
        caminho,
        blob,
        {

          contentType:
            blob.type ||
            "audio/webm",

          upsert:
            false

        }
      );


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  return caminho;

}


/* ==========================================
   REMOVER ÁUDIOS DO STORAGE
========================================== */

async function removerAudiosStorage(
  caminhos
) {

  const validos =
    caminhos.filter(
      Boolean
    );


  if (
    !validos.length
  ) {

    return;

  }


  const resultado =
    await window.supabaseClient
      .storage
      .from(
        "audios-atendimentos"
      )
      .remove(
        validos
      );


  if (
    resultado.error
  ) {

    console.warn(
      "Não foi possível remover um áudio antigo:",
      resultado.error
    );

  }

}


/* ==========================================
   USUÁRIO LOGADO
========================================== */

async function carregarUsuarioLogado() {

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


    return false;

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


  usuarioLogadoId =
    resultadoUsuario.data.id;


  const resultadoPermissao =
    await window.supabaseClient
      .from(
        "responsaveis_atendimentos"
      )
      .select(
        "id"
      )
      .eq(
        "usuario_id",
        usuarioLogadoId
      )
      .maybeSingle();


  if (
    resultadoPermissao.error
  ) {

    throw resultadoPermissao.error;

  }


  if (
    !resultadoPermissao.data
  ) {

    window.location.href =
      "administrativo.html";


    return false;

  }


  return true;

}


/* ==========================================
   CARREGAR ATENDIMENTO
========================================== */

async function carregarAtendimento() {

  const resultado =
    await window.supabaseClient
      .from(
        "atendimentos"
      )
      .select(`
        id,
        usuario_id,
        pessoa_nao_associada_id,
        data_atendimento,
        motivo,
        relato,
        orientacao_conduta,
        relato_audio_path,
        relato_audio_duracao,
        orientacao_audio_path,
        orientacao_audio_duracao,
        precisa_acompanhamento,
        data_retorno
      `)
      .eq(
        "id",
        atendimentoId
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
      "Atendimento não encontrado."
    );

  }


  const atendimento =
    resultado.data;


  relatoAudioPathAtual =
    atendimento.relato_audio_path ||
    null;


  relatoAudioDuracaoAtual =
    atendimento.relato_audio_duracao ||
    null;


  orientacaoAudioPathAtual =
    atendimento.orientacao_audio_path ||
    null;


  orientacaoAudioDuracaoAtual =
    atendimento.orientacao_audio_duracao ||
    null;


/* ======================================
   NOME DO ASSOCIADO
====================================== */

  if (
    atendimento.usuario_id
  ) {

    const resultadoPessoa =
      await window.supabaseClient
        .from(
          "usuarios"
        )
        .select(
          "nome_completo"
        )
        .eq(
          "id",
          atendimento.usuario_id
        )
        .maybeSingle();


    if (
      resultadoPessoa.error
    ) {

      throw resultadoPessoa.error;

    }


    nomePessoaAtendida.textContent =
      resultadoPessoa.data
        ? `${formatarNome(
            resultadoPessoa.data.nome_completo
          )} — Associado`
        : "Associado";

  }


/* ======================================
   NOME DO NÃO ASSOCIADO
====================================== */

  if (
    atendimento.pessoa_nao_associada_id
  ) {

    const resultadoPessoa =
      await window.supabaseClient
        .from(
          "pessoas_atendimentos"
        )
        .select(
          "nome_completo"
        )
        .eq(
          "id",
          atendimento.pessoa_nao_associada_id
        )
        .maybeSingle();


    if (
      resultadoPessoa.error
    ) {

      throw resultadoPessoa.error;

    }


    nomePessoaAtendida.textContent =
      resultadoPessoa.data
        ? `${formatarNome(
            resultadoPessoa.data.nome_completo
          )} — Não associado`
        : "Não associado";

  }


  dataAtendimento.value =
    atendimento.data_atendimento ||
    "";


  motivoAtendimento.value =
    atendimento.motivo ||
    "";


  relatoAtendimento.value =
    atendimento.relato ||
    "";


  orientacaoAtendimento.value =
    atendimento.orientacao_conduta ||
    "";


  precisaAcompanhamento.checked =
    atendimento.precisa_acompanhamento ===
    true;


  dataRetorno.value =
    atendimento.data_retorno ||
    "";


  atualizarAcompanhamento();


  if (
    relatoAudioPathAtual
  ) {

    await configurarAudioRelatoExistente();

  }


  if (
    orientacaoAudioPathAtual
  ) {

    await configurarAudioOrientacaoExistente();

  }


  botaoSalvarAlteracoes.disabled =
    false;

}


/* ==========================================
   VERIFICAR SE RELATO TEM CONTEÚDO
========================================== */

function relatoTemConteudo() {

  return Boolean(

    relatoAtendimento.value.trim() ||

    novoAudioRelatoBlob ||

    (
      relatoAudioPathAtual &&
      !apagarRelatoAudio
    )

  );

}


/* ==========================================
   VERIFICAR SE ORIENTAÇÃO TEM CONTEÚDO
========================================== */

function orientacaoTemConteudo() {

  return Boolean(

    orientacaoAtendimento.value.trim() ||

    novoAudioOrientacaoBlob ||

    (
      orientacaoAudioPathAtual &&
      !apagarOrientacaoAudio
    )

  );

}


/* ==========================================
   VALIDAÇÃO
========================================== */

function validarFormulario() {

  if (
    gravacaoAtual
  ) {

    mostrarMensagem(
      "Finalize a gravação de áudio antes de salvar."
    );


    return false;

  }


  if (
    reconhecimentoTextoAtual
  ) {

    mostrarMensagem(
      "Finalize Falar para texto antes de salvar."
    );


    return false;

  }


  if (
    !dataAtendimento.value
  ) {

    mostrarMensagem(
      "Informe a data do atendimento."
    );


    return false;

  }


  if (
    !relatoTemConteudo()
  ) {

    mostrarMensagem(
      "O relato precisa ter texto ou áudio."
    );


    return false;

  }


  if (
    !orientacaoTemConteudo()
  ) {

    mostrarMensagem(
      "A orientação / conduta precisa ter texto ou áudio."
    );


    return false;

  }


  return true;

}


/* ==========================================
   SALVAR ALTERAÇÕES
========================================== */

async function salvarAlteracoes() {

  esconderMensagem();


  pararTodosAudios();


  if (
    !validarFormulario()
  ) {

    return;

  }


  botaoSalvarAlteracoes.disabled =
    true;


  botaoSalvarAlteracoes.textContent =
    "SALVANDO...";


  let novoRelatoPath =
    null;


  let novaOrientacaoPath =
    null;


  try {

    /* ======================================
       NOVO ÁUDIO DO RELATO
    ====================================== */

    if (
      novoAudioRelatoBlob
    ) {

      botaoSalvarAlteracoes.textContent =
        "ENVIANDO ÁUDIO DO RELATO...";


      novoRelatoPath =
        await enviarNovoAudio(
          "relato",
          novoAudioRelatoBlob
        );

    }


    /* ======================================
       NOVO ÁUDIO DA ORIENTAÇÃO
    ====================================== */

    if (
      novoAudioOrientacaoBlob
    ) {

      botaoSalvarAlteracoes.textContent =
        "ENVIANDO ÁUDIO DA ORIENTAÇÃO...";


      novaOrientacaoPath =
        await enviarNovoAudio(
          "orientacao",
          novoAudioOrientacaoBlob
        );

    }


    /* ======================================
       DEFINIR CAMINHOS FINAIS
    ====================================== */

    let relatoPathFinal =
      relatoAudioPathAtual;


    let relatoDuracaoFinal =
      relatoAudioDuracaoAtual;


    if (
      apagarRelatoAudio
    ) {

      relatoPathFinal =
        null;


      relatoDuracaoFinal =
        null;

    }


    if (
      novoRelatoPath
    ) {

      relatoPathFinal =
        novoRelatoPath;


      relatoDuracaoFinal =
        novoAudioRelatoDuracao;

    }


    let orientacaoPathFinal =
      orientacaoAudioPathAtual;


    let orientacaoDuracaoFinal =
      orientacaoAudioDuracaoAtual;


    if (
      apagarOrientacaoAudio
    ) {

      orientacaoPathFinal =
        null;


      orientacaoDuracaoFinal =
        null;

    }


    if (
      novaOrientacaoPath
    ) {

      orientacaoPathFinal =
        novaOrientacaoPath;


      orientacaoDuracaoFinal =
        novoAudioOrientacaoDuracao;

    }


    /* ======================================
       ATUALIZAR BANCO
    ====================================== */

    botaoSalvarAlteracoes.textContent =
      "SALVANDO ALTERAÇÕES...";


    const resultado =
      await window.supabaseClient
        .from(
          "atendimentos"
        )
        .update({

          data_atendimento:
            dataAtendimento.value,

          motivo:
            motivoAtendimento.value.trim() ||
            null,

          relato:
            relatoAtendimento.value.trim() ||
            null,

          orientacao_conduta:
            orientacaoAtendimento.value.trim() ||
            null,

          relato_audio_path:
            relatoPathFinal,

          relato_audio_duracao:
            relatoDuracaoFinal,

          orientacao_audio_path:
            orientacaoPathFinal,

          orientacao_audio_duracao:
            orientacaoDuracaoFinal,

          precisa_acompanhamento:
            precisaAcompanhamento.checked,

          data_retorno:
            precisaAcompanhamento.checked &&
            dataRetorno.value
              ? dataRetorno.value
              : null,

          atualizado_em:
            new Date().toISOString(),

          atualizado_por:
            usuarioLogadoId

        })
        .eq(
          "id",
          atendimentoId
        );


    if (
      resultado.error
    ) {

      throw resultado.error;

    }


    /* ======================================
       REMOVER ÁUDIOS ANTIGOS
       SOMENTE DEPOIS DO BANCO ATUALIZADO
    ====================================== */

    const audiosAntigosParaRemover =
      [];


    if (
      relatoAudioPathAtual &&
      (
        apagarRelatoAudio ||
        novoRelatoPath
      )
    ) {

      audiosAntigosParaRemover.push(
        relatoAudioPathAtual
      );

    }


    if (
      orientacaoAudioPathAtual &&
      (
        apagarOrientacaoAudio ||
        novaOrientacaoPath
      )
    ) {

      audiosAntigosParaRemover.push(
        orientacaoAudioPathAtual
      );

    }


    await removerAudiosStorage(
      audiosAntigosParaRemover
    );


    mostrarMensagem(
      "Atendimento atualizado com sucesso."
    );


    botaoSalvarAlteracoes.textContent =
      "Alterações salvas";


    setTimeout(
      () => {

        window.location.href =
          linkVoltarAtendimentos.href;

      },
      1200
    );


  } catch (erro) {

    console.error(
      "Erro ao atualizar atendimento:",
      erro
    );


    /*
      Se os novos áudios chegaram a ser
      enviados mas o banco não foi atualizado,
      removemos esses novos arquivos.
    */

    await removerAudiosStorage([
      novoRelatoPath,
      novaOrientacaoPath
    ]);


    mostrarMensagem(
      "Não foi possível atualizar o atendimento."
    );


    botaoSalvarAlteracoes.disabled =
      false;


    botaoSalvarAlteracoes.textContent =
      "Salvar alterações";

  }

}


/* ==========================================
   EVENTOS
========================================== */

precisaAcompanhamento.addEventListener(
  "change",
  atualizarAcompanhamento
);


/* ==========================================
   FALAR PARA TEXTO
========================================== */

botaoFalarTextoRelato.addEventListener(
  "click",
  () => {

    iniciarFalarParaTexto(
      "relato"
    );

  }
);


botaoFalarTextoOrientacao.addEventListener(
  "click",
  () => {

    iniciarFalarParaTexto(
      "orientacao"
    );

  }
);


/* ==========================================
   GRAVAÇÃO
========================================== */

botaoGravarRelato.addEventListener(
  "click",
  () => {

    if (
      gravacaoAtual &&
      gravacaoAtual.tipo ===
        "relato"
    ) {

      finalizarGravacaoAtual();


      return;

    }


    iniciarGravacao(
      "relato"
    );

  }
);


botaoGravarOrientacao.addEventListener(
  "click",
  () => {

    if (
      gravacaoAtual &&
      gravacaoAtual.tipo ===
        "orientacao"
    ) {

      finalizarGravacaoAtual();


      return;

    }


    iniciarGravacao(
      "orientacao"
    );

  }
);


/* ==========================================
   REPRODUÇÃO
========================================== */

botaoReproduzirAudioRelato.addEventListener(
  "click",
  () => {

    reproduzirAudio(
      playerAudioRelato
    );

  }
);


botaoPararAudioRelato.addEventListener(
  "click",
  () => {

    pararAudio(
      playerAudioRelato
    );

  }
);


botaoReproduzirAudioOrientacao.addEventListener(
  "click",
  () => {

    reproduzirAudio(
      playerAudioOrientacao
    );

  }
);


botaoPararAudioOrientacao.addEventListener(
  "click",
  () => {

    pararAudio(
      playerAudioOrientacao
    );

  }
);


/* ==========================================
   APAGAR ÁUDIO
========================================== */

botaoApagarAudioRelato.addEventListener(
  "click",
  apagarAudioRelato
);


botaoApagarAudioOrientacao.addEventListener(
  "click",
  apagarAudioOrientacao
);


/* ==========================================
   SALVAR
========================================== */

botaoSalvarAlteracoes.addEventListener(
  "click",
  salvarAlteracoes
);


/* ==========================================
   SAÍDA
========================================== */

window.addEventListener(
  "beforeunload",
  () => {

    pararCronometro();


    pararTodosAudios();


    if (
      reconhecimentoTextoAtual
    ) {

      reconhecimentoTextoFinalizando =
        true;


      try {

        reconhecimentoTextoAtual.stop();

      } catch (erro) {

        console.warn(
          "Erro ao encerrar reconhecimento:",
          erro
        );

      }

    }


    if (
      gravacaoAtual
    ) {

      gravacaoAtual.stream
        .getTracks()
        .forEach(
          (track) => {

            track.stop();

          }
        );

    }


    liberarUrlAudio(
      novoAudioRelatoUrl
    );


    liberarUrlAudio(
      novoAudioOrientacaoUrl
    );

  }
);


/* ==========================================
   INICIALIZAÇÃO
========================================== */

async function iniciarPagina() {

  obterParametros();


  if (
    !atendimentoId
  ) {

    mostrarMensagem(
      "Atendimento não informado."
    );


    return;

  }


  if (
    !window.supabaseClient
  ) {

    mostrarMensagem(
      "Não foi possível conectar ao banco de dados."
    );


    return;

  }


  if (
    !gravacaoDisponivel()
  ) {

    botaoGravarRelato.disabled =
      true;


    botaoGravarOrientacao.disabled =
      true;

  }


  if (
    !reconhecimentoDisponivel()
  ) {

    botaoFalarTextoRelato.disabled =
      true;


    botaoFalarTextoOrientacao.disabled =
      true;


    atualizarStatusFalaTexto(
      "relato",
      "Falar para texto não está disponível neste navegador."
    );


    atualizarStatusFalaTexto(
      "orientacao",
      "Falar para texto não está disponível neste navegador."
    );

  }


  try {

    const autorizado =
      await carregarUsuarioLogado();


    if (
      !autorizado
    ) {

      return;

    }


    await carregarAtendimento();


  } catch (erro) {

    console.error(
      "Erro ao carregar edição do atendimento:",
      erro
    );


    mostrarMensagem(
      "Não foi possível carregar este atendimento."
    );

  }

}


/* ==========================================
   INICIAR
========================================== */

iniciarPagina();
