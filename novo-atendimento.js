"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const tipoAssociado =
  document.getElementById(
    "tipoAssociado"
  );

const tipoNaoAssociado =
  document.getElementById(
    "tipoNaoAssociado"
  );

const areaAssociado =
  document.getElementById(
    "areaAssociado"
  );

const areaNaoAssociado =
  document.getElementById(
    "areaNaoAssociado"
  );

const campoBuscaAssociado =
  document.getElementById(
    "campoBuscaAssociado"
  );

const resultadoBuscaAssociado =
  document.getElementById(
    "resultadoBuscaAssociado"
  );

const associadoSelecionado =
  document.getElementById(
    "associadoSelecionado"
  );

const nomeAssociadoSelecionado =
  document.getElementById(
    "nomeAssociadoSelecionado"
  );

const campoBuscaNaoAssociado =
  document.getElementById(
    "campoBuscaNaoAssociado"
  );

const resultadoBuscaNaoAssociado =
  document.getElementById(
    "resultadoBuscaNaoAssociado"
  );

const naoAssociadoSelecionado =
  document.getElementById(
    "naoAssociadoSelecionado"
  );

const nomeNaoAssociadoSelecionado =
  document.getElementById(
    "nomeNaoAssociadoSelecionado"
  );

const avisoNovoNaoAssociado =
  document.getElementById(
    "avisoNovoNaoAssociado"
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

const mensagemNovoAtendimento =
  document.getElementById(
    "mensagemNovoAtendimento"
  );

const botaoSalvarAtendimento =
  document.getElementById(
    "botaoSalvarAtendimento"
  );


/* ==========================================
   RELATO
========================================== */

const botaoGravarRelato =
  document.getElementById(
    "botaoGravarRelato"
  );

const botaoFalarTextoRelato =
  document.getElementById(
    "botaoFalarTextoRelato"
  );

const statusFalaTextoRelato =
  document.getElementById(
    "statusFalaTextoRelato"
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
   ORIENTAÇÃO
========================================== */

const botaoGravarOrientacao =
  document.getElementById(
    "botaoGravarOrientacao"
  );

const botaoFalarTextoOrientacao =
  document.getElementById(
    "botaoFalarTextoOrientacao"
  );

const statusFalaTextoOrientacao =
  document.getElementById(
    "statusFalaTextoOrientacao"
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

let usuarioLogadoId =
  null;

let associadoEscolhido =
  null;

let naoAssociadoEscolhido =
  null;

let temporizadorBuscaAssociado =
  null;

let temporizadorBuscaNaoAssociado =
  null;


/* ==========================================
   ESTADO DOS ÁUDIOS
========================================== */

let audioRelatoBlob =
  null;

let audioRelatoUrl =
  null;

let audioRelatoDuracao =
  null;


let audioOrientacaoBlob =
  null;

let audioOrientacaoUrl =
  null;

let audioOrientacaoDuracao =
  null;


let gravacaoAtual =
  null;

let intervaloCronometro =
  null;

let segundosGravacao =
  0;


/* ==========================================
   ESTADO FALAR PARA TEXTO
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


function normalizarTexto(
  texto
) {

  return String(
    texto || ""
  )
    .normalize(
      "NFD"
    )
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim();

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
   DATA ATUAL
========================================== */

function definirDataAtual() {

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


  dataAtendimento.value =
    `${ano}-${mes}-${dia}`;

}


/* ==========================================
   MENSAGENS
========================================== */

function mostrarMensagem(
  texto
) {

  mensagemNovoAtendimento.textContent =
    texto;


  mensagemNovoAtendimento.hidden =
    false;

}


function esconderMensagem() {

  mensagemNovoAtendimento.textContent =
    "";


  mensagemNovoAtendimento.hidden =
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
   ÁUDIO
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


function gravacaoDisponivel() {

  return Boolean(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia &&
    window.MediaRecorder
  );

}


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

  playerAudioRelato.currentTime =
    0;


  playerAudioOrientacao.pause();

  playerAudioOrientacao.currentTime =
    0;

}


async function reproduzirAudio(
  player
) {

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


  player.currentTime =
    0;

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
   STATUS FALAR PARA TEXTO
========================================== */

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
   BOTÃO FALAR PARA TEXTO
========================================== */

function obterBotaoFalaTexto(
  tipo
) {

  return tipo === "relato"
    ? botaoFalarTextoRelato
    : botaoFalarTextoOrientacao;

}


function obterCampoTexto(
  tipo
) {

  return tipo === "relato"
    ? relatoAtendimento
    : orientacaoAtendimento;

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


  /*
    Se já está reconhecendo este campo,
    o toque serve para finalizar.
  */

  if (
    reconhecimentoTextoAtual &&
    tipoReconhecimentoTextoAtual === tipo
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


  /*
    Muito importante:

    Não usamos resultados provisórios.
    Isso evita aquela duplicação que
    aconteceu no primeiro teste.
  */

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

      /*
        Começamos em resultIndex para
        não processar resultados antigos
        novamente.
      */

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
        evento.error === "not-allowed" ||
        evento.error === "service-not-allowed"
      ) {

        atualizarStatusFalaTexto(
          tipo,
          "O acesso ao microfone não foi autorizado."
        );


        reconhecimentoTextoFinalizando =
          true;

      }


      if (
        evento.error === "no-speech"
      ) {

        atualizarStatusFalaTexto(
          tipo,
          "Nenhuma fala foi detectada."
        );

      }


      if (
        evento.error === "audio-capture"
      ) {

        atualizarStatusFalaTexto(
          tipo,
          "Não foi possível acessar o microfone."
        );

      }

    };


  reconhecimento.onend =
    () => {

      /*
        Se o navegador encerrou sozinho
        durante uma pausa e o usuário ainda
        não pediu para finalizar, tentamos
        continuar ouvindo.
      */

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

          salvarGravacaoRelato(
            blob,
            duracaoFinal
          );

        } else {

          salvarGravacaoOrientacao(
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
          "🎙️ Gravar áudio";


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
   SALVAR RELATO
========================================== */

function salvarGravacaoRelato(
  blob,
  duracao
) {

  liberarUrlAudio(
    audioRelatoUrl
  );


  audioRelatoBlob =
    blob;


  audioRelatoDuracao =
    duracao;


  audioRelatoUrl =
    URL.createObjectURL(
      blob
    );


  playerAudioRelato.src =
    audioRelatoUrl;


  statusAudioRelato.textContent =
    "Gravação finalizada";


  duracaoAudioRelato.textContent =
    `⏱ ${formatarTempo(
      audioRelatoDuracao
    )}`;


  duracaoAudioRelato.hidden =
    false;


  botaoReproduzirAudioRelato.hidden =
    false;


  botaoPararAudioRelato.hidden =
    false;


  botaoApagarAudioRelato.hidden =
    false;


  botaoGravarRelato.textContent =
    "🎙️ Gravar novamente";

}


/* ==========================================
   SALVAR ORIENTAÇÃO
========================================== */

function salvarGravacaoOrientacao(
  blob,
  duracao
) {

  liberarUrlAudio(
    audioOrientacaoUrl
  );


  audioOrientacaoBlob =
    blob;


  audioOrientacaoDuracao =
    duracao;


  audioOrientacaoUrl =
    URL.createObjectURL(
      blob
    );


  playerAudioOrientacao.src =
    audioOrientacaoUrl;


  statusAudioOrientacao.textContent =
    "Gravação finalizada";


  duracaoAudioOrientacao.textContent =
    `⏱ ${formatarTempo(
      audioOrientacaoDuracao
    )}`;


  duracaoAudioOrientacao.hidden =
    false;


  botaoReproduzirAudioOrientacao.hidden =
    false;


  botaoPararAudioOrientacao.hidden =
    false;


  botaoApagarAudioOrientacao.hidden =
    false;


  botaoGravarOrientacao.textContent =
    "🎙️ Gravar novamente";

}


/* ==========================================
   APAGAR RELATO
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


  playerAudioRelato.removeAttribute(
    "src"
  );


  liberarUrlAudio(
    audioRelatoUrl
  );


  audioRelatoBlob =
    null;


  audioRelatoUrl =
    null;


  audioRelatoDuracao =
    null;


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


  statusAudioRelato.textContent =
    "";


  areaAudioRelato.hidden =
    true;


  botaoGravarRelato.textContent =
    "🎙️ Gravar áudio";

}


/* ==========================================
   APAGAR ORIENTAÇÃO
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


  playerAudioOrientacao.removeAttribute(
    "src"
  );


  liberarUrlAudio(
    audioOrientacaoUrl
  );


  audioOrientacaoBlob =
    null;


  audioOrientacaoUrl =
    null;


  audioOrientacaoDuracao =
    null;


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


  statusAudioOrientacao.textContent =
    "";


  areaAudioOrientacao.hidden =
    true;


  botaoGravarOrientacao.textContent =
    "🎙️ Gravar áudio";

}


/* ==========================================
   UPLOAD
========================================== */

async function enviarAudio(
  atendimentoId,
  tipo,
  blob
) {

  if (
    !blob
  ) {

    return null;

  }


  const extensao =
    obterExtensaoAudio(
      blob
    );


  const caminho =
    `${atendimentoId}/${tipo}.${extensao}`;


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
   REMOVER EM CASO DE ERRO
========================================== */

async function removerAudiosEnviados(
  caminhos
) {

  const caminhosValidos =
    caminhos.filter(
      Boolean
    );


  if (
    !caminhosValidos.length
  ) {

    return;

  }


  try {

    await window.supabaseClient
      .storage
      .from(
        "audios-atendimentos"
      )
      .remove(
        caminhosValidos
      );

  } catch (erro) {

    console.warn(
      "Não foi possível remover arquivos temporários:",
      erro
    );

  }

}


/* ==========================================
   LIMPAR SELEÇÕES
========================================== */

function limparAssociadoSelecionado() {

  associadoEscolhido =
    null;


  associadoSelecionado.hidden =
    true;


  nomeAssociadoSelecionado.textContent =
    "";

}


function limparNaoAssociadoSelecionado() {

  naoAssociadoEscolhido =
    null;


  naoAssociadoSelecionado.hidden =
    true;


  nomeNaoAssociadoSelecionado.textContent =
    "";

}


/* ==========================================
   TIPO DE PESSOA
========================================== */

function atualizarTipoPessoa() {

  esconderMensagem();


  if (
    tipoAssociado.checked
  ) {

    areaAssociado.hidden =
      false;


    areaNaoAssociado.hidden =
      true;


    campoBuscaNaoAssociado.value =
      "";


    resultadoBuscaNaoAssociado.innerHTML =
      "<p>Digite pelo menos 2 letras para procurar.</p>";


    limparNaoAssociadoSelecionado();


    avisoNovoNaoAssociado.hidden =
      true;


    return;

  }


  areaAssociado.hidden =
    true;


  areaNaoAssociado.hidden =
    false;


  campoBuscaAssociado.value =
    "";


  resultadoBuscaAssociado.innerHTML =
    "<p>Digite o nome do associado.</p>";


  limparAssociadoSelecionado();

}


/* ==========================================
   ITEM DE RESULTADO
========================================== */

function criarBotaoResultado(
  nome,
  descricao,
  acao
) {

  const botao =
    document.createElement(
      "button"
    );


  botao.type =
    "button";


  botao.className =
    "item-permissao-lista";


  botao.style.width =
    "100%";


  botao.style.border =
    "0";


  botao.style.background =
    "transparent";


  botao.style.cursor =
    "pointer";


  botao.style.textAlign =
    "left";


  const dados =
    document.createElement(
      "div"
    );


  dados.className =
    "dados-permissao-lista";


  const nomeElemento =
    document.createElement(
      "strong"
    );


  nomeElemento.textContent =
    formatarNome(
      nome
    );


  dados.appendChild(
    nomeElemento
  );


  if (
    descricao
  ) {

    const descricaoElemento =
      document.createElement(
        "span"
      );


    descricaoElemento.textContent =
      descricao;


    dados.appendChild(
      descricaoElemento
    );

  }


  const seta =
    document.createElement(
      "span"
    );


  seta.className =
    "seta-permissao-lista";


  seta.textContent =
    "›";


  botao.appendChild(
    dados
  );


  botao.appendChild(
    seta
  );


  botao.addEventListener(
    "click",
    acao
  );


  return botao;

}


/* ==========================================
   BUSCAR ASSOCIADOS
========================================== */

async function buscarAssociados() {

  const busca =
    campoBuscaAssociado.value.trim();


  limparAssociadoSelecionado();


  resultadoBuscaAssociado.innerHTML =
    "";


  if (
    busca.length < 2
  ) {

    resultadoBuscaAssociado.innerHTML =
      "<p>Digite pelo menos 2 letras para pesquisar.</p>";

    return;

  }


  resultadoBuscaAssociado.innerHTML =
    "<p>Pesquisando...</p>";


  try {

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
        .eq(
          "status",
          "ativo"
        )
        .ilike(
          "nome_completo",
          `%${busca}%`
        )
        .order(
          "nome_completo",
          {
            ascending:
              true
          }
        )
        .limit(
          30
        );


    if (
      resultado.error
    ) {

      throw resultado.error;

    }


    const associados =
      resultado.data ||
      [];


    resultadoBuscaAssociado.innerHTML =
      "";


    if (
      !associados.length
    ) {

      resultadoBuscaAssociado.innerHTML =
        "<p>Nenhum associado encontrado.</p>";

      return;

    }


    associados.forEach(
      (associado) => {

        resultadoBuscaAssociado.appendChild(
          criarBotaoResultado(
            associado.nome_completo,
            "Associado",
            () => {

              associadoEscolhido =
                associado;


              campoBuscaAssociado.value =
                formatarNome(
                  associado.nome_completo
                );


              nomeAssociadoSelecionado.textContent =
                formatarNome(
                  associado.nome_completo
                );


              associadoSelecionado.hidden =
                false;


              resultadoBuscaAssociado.innerHTML =
                "";

            }
          )
        );

      }
    );


  } catch (erro) {

    console.error(
      "Erro ao pesquisar associados:",
      erro
    );


    resultadoBuscaAssociado.innerHTML =
      "<p>Não foi possível pesquisar os associados.</p>";

  }

}


/* ==========================================
   BUSCAR NÃO ASSOCIADOS
========================================== */

async function buscarNaoAssociados() {

  const busca =
    campoBuscaNaoAssociado.value.trim();


  limparNaoAssociadoSelecionado();


  avisoNovoNaoAssociado.hidden =
    true;


  resultadoBuscaNaoAssociado.innerHTML =
    "";


  if (
    busca.length < 2
  ) {

    resultadoBuscaNaoAssociado.innerHTML =
      "<p>Digite pelo menos 2 letras para procurar.</p>";

    return;

  }


  resultadoBuscaNaoAssociado.innerHTML =
    "<p>Pesquisando...</p>";


  try {

    const resultado =
      await window.supabaseClient
        .from(
          "pessoas_atendimentos"
        )
        .select(`
          id,
          nome_completo
        `)
        .ilike(
          "nome_completo",
          `%${busca}%`
        )
        .order(
          "nome_completo",
          {
            ascending:
              true
          }
        )
        .limit(
          30
        );


    if (
      resultado.error
    ) {

      throw resultado.error;

    }


    const pessoas =
      resultado.data ||
      [];


    resultadoBuscaNaoAssociado.innerHTML =
      "";


    pessoas.forEach(
      (pessoa) => {

        resultadoBuscaNaoAssociado.appendChild(
          criarBotaoResultado(
            pessoa.nome_completo,
            "Não associado",
            () => {

              naoAssociadoEscolhido =
                pessoa;


              campoBuscaNaoAssociado.value =
                formatarNome(
                  pessoa.nome_completo
                );


              nomeNaoAssociadoSelecionado.textContent =
                formatarNome(
                  pessoa.nome_completo
                );


              naoAssociadoSelecionado.hidden =
                false;


              avisoNovoNaoAssociado.hidden =
                true;


              resultadoBuscaNaoAssociado.innerHTML =
                "";

            }
          )
        );

      }
    );


    const nomeExatoExiste =
      pessoas.some(
        (pessoa) => {

          return (
            normalizarTexto(
              pessoa.nome_completo
            ) ===
            normalizarTexto(
              busca
            )
          );

        }
      );


    if (
      !nomeExatoExiste
    ) {

      avisoNovoNaoAssociado.hidden =
        false;

    }


    if (
      !pessoas.length
    ) {

      resultadoBuscaNaoAssociado.innerHTML =
        "<p>Nenhuma pessoa já cadastrada com esse nome.</p>";

    }


  } catch (erro) {

    console.error(
      "Erro ao pesquisar pessoas não associadas:",
      erro
    );


    resultadoBuscaNaoAssociado.innerHTML =
      "<p>Não foi possível pesquisar as pessoas.</p>";

  }

}


/* ==========================================
   CRIAR NÃO ASSOCIADO
========================================== */

async function criarPessoaNaoAssociada() {

  const nome =
    formatarNome(
      campoBuscaNaoAssociado.value
    );


  if (
    nome.length < 2
  ) {

    throw new Error(
      "Informe o nome da pessoa atendida."
    );

  }


  const resultado =
    await window.supabaseClient
      .from(
        "pessoas_atendimentos"
      )
      .insert({
        nome_completo:
          nome,

        criado_por:
          usuarioLogadoId
      })
      .select(`
        id,
        nome_completo
      `)
      .single();


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  return resultado.data;

}


/* ==========================================
   VALIDAÇÃO
========================================== */

function validarFormulario() {

  if (
    gravacaoAtual
  ) {

    mostrarMensagem(
      "Finalize a gravação de áudio antes de salvar o atendimento."
    );


    return false;

  }


  if (
    reconhecimentoTextoAtual
  ) {

    mostrarMensagem(
      "Finalize Falar para texto antes de salvar o atendimento."
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
    tipoAssociado.checked &&
    !associadoEscolhido
  ) {

    mostrarMensagem(
      "Selecione o associado atendido."
    );


    return false;

  }


  if (
    tipoNaoAssociado.checked &&
    !naoAssociadoEscolhido &&
    campoBuscaNaoAssociado.value.trim().length < 2
  ) {

    mostrarMensagem(
      "Informe o nome da pessoa atendida."
    );


    return false;

  }


  if (
    !relatoAtendimento.value.trim() &&
    !audioRelatoBlob
  ) {

    mostrarMensagem(
      "Preencha o relato ou grave um áudio do relato."
    );


    return false;

  }


  if (
    !orientacaoAtendimento.value.trim() &&
    !audioOrientacaoBlob
  ) {

    mostrarMensagem(
      "Preencha a orientação / conduta ou grave um áudio."
    );


    return false;

  }


  return true;

}


/* ==========================================
   SALVAR
========================================== */

async function salvarAtendimento() {

  esconderMensagem();


  pararTodosAudios();


  if (
    !validarFormulario()
  ) {

    return;

  }


  botaoSalvarAtendimento.disabled =
    true;


  botaoSalvarAtendimento.textContent =
    "SALVANDO...";


  let relatoAudioPath =
    null;


  let orientacaoAudioPath =
    null;


  try {

    let usuarioAtendidoId =
      null;


    let pessoaNaoAssociadaId =
      null;


    if (
      tipoAssociado.checked
    ) {

      usuarioAtendidoId =
        associadoEscolhido.id;

    }


    if (
      tipoNaoAssociado.checked
    ) {

      if (
        naoAssociadoEscolhido
      ) {

        pessoaNaoAssociadaId =
          naoAssociadoEscolhido.id;

      } else {

        const novaPessoa =
          await criarPessoaNaoAssociada();


        pessoaNaoAssociadaId =
          novaPessoa.id;

      }

    }


    const atendimentoId =
      crypto.randomUUID();


    if (
      audioRelatoBlob
    ) {

      relatoAudioPath =
        await enviarAudio(
          atendimentoId,
          "relato",
          audioRelatoBlob
        );

    }


    if (
      audioOrientacaoBlob
    ) {

      orientacaoAudioPath =
        await enviarAudio(
          atendimentoId,
          "orientacao",
          audioOrientacaoBlob
        );

    }


    const resultado =
      await window.supabaseClient
        .from(
          "atendimentos"
        )
        .insert({

          id:
            atendimentoId,

          usuario_id:
            usuarioAtendidoId,

          pessoa_nao_associada_id:
            pessoaNaoAssociadaId,

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
            relatoAudioPath,

          relato_audio_duracao:
            relatoAudioPath
              ? audioRelatoDuracao
              : null,

          orientacao_audio_path:
            orientacaoAudioPath,

          orientacao_audio_duracao:
            orientacaoAudioPath
              ? audioOrientacaoDuracao
              : null,

          precisa_acompanhamento:
            precisaAcompanhamento.checked,

          data_retorno:
            precisaAcompanhamento.checked &&
            dataRetorno.value
              ? dataRetorno.value
              : null,

          responsavel_id:
            usuarioLogadoId

        });


    if (
      resultado.error
    ) {

      throw resultado.error;

    }


    mostrarMensagem(
      "Atendimento salvo com sucesso."
    );


    botaoSalvarAtendimento.textContent =
      "Atendimento salvo";


    setTimeout(
      () => {

        window.location.href =
          "adm-atendimentos.html";

      },
      1200
    );


  } catch (erro) {

    console.error(
      "Erro ao salvar atendimento:",
      erro
    );


    await removerAudiosEnviados([
      relatoAudioPath,
      orientacaoAudioPath
    ]);


    mostrarMensagem(
      erro.message ||
      "Não foi possível salvar o atendimento."
    );


    botaoSalvarAtendimento.disabled =
      false;


    botaoSalvarAtendimento.textContent =
      "Salvar atendimento";

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
   USUÁRIO
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
   EVENTOS
========================================== */

tipoAssociado.addEventListener(
  "change",
  atualizarTipoPessoa
);


tipoNaoAssociado.addEventListener(
  "change",
  atualizarTipoPessoa
);


campoBuscaAssociado.addEventListener(
  "input",
  () => {

    limparAssociadoSelecionado();


    clearTimeout(
      temporizadorBuscaAssociado
    );


    temporizadorBuscaAssociado =
      setTimeout(
        buscarAssociados,
        300
      );

  }
);


campoBuscaNaoAssociado.addEventListener(
  "input",
  () => {

    limparNaoAssociadoSelecionado();


    clearTimeout(
      temporizadorBuscaNaoAssociado
    );


    temporizadorBuscaNaoAssociado =
      setTimeout(
        buscarNaoAssociados,
        300
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
   APAGAR
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
   OUTROS
========================================== */

precisaAcompanhamento.addEventListener(
  "change",
  atualizarAcompanhamento
);


botaoSalvarAtendimento.addEventListener(
  "click",
  salvarAtendimento
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
      audioRelatoUrl
    );


    liberarUrlAudio(
      audioOrientacaoUrl
    );

  }
);


/* ==========================================
   INICIALIZAÇÃO
========================================== */

async function iniciarPagina() {

  if (
    !window.supabaseClient
  ) {

    mostrarMensagem(
      "Não foi possível conectar ao banco de dados."
    );


    return;

  }


  definirDataAtual();


  atualizarTipoPessoa();


  atualizarAcompanhamento();


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


    botaoSalvarAtendimento.disabled =
      false;


  } catch (erro) {

    console.error(
      "Erro ao iniciar Novo Atendimento:",
      erro
    );


    mostrarMensagem(
      "Não foi possível carregar esta tela."
    );

  }

}


/* ==========================================
   INICIAR
========================================== */

iniciarPagina();
