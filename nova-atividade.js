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
   ÁUDIO - RELATO
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

const botaoApagarAudioRelato =
  document.getElementById(
    "botaoApagarAudioRelato"
  );

const botaoTranscreverRelato =
  document.getElementById(
    "botaoTranscreverRelato"
  );


/* ==========================================
   ÁUDIO - ORIENTAÇÃO
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

const botaoApagarAudioOrientacao =
  document.getElementById(
    "botaoApagarAudioOrientacao"
  );

const botaoTranscreverOrientacao =
  document.getElementById(
    "botaoTranscreverOrientacao"
  );


/* ==========================================
   ESTADO
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
   CRONÔMETRO
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
   TIPO DE ÁUDIO SUPORTADO

   PRIORIDADE:
   1. MP4
   2. WEBM
   3. OGG
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
   EXTENSÃO DO ÁUDIO
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
   VERIFICAR GRAVAÇÃO
========================================== */

function gravacaoDisponivel() {

  return Boolean(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia &&
    window.MediaRecorder
  );

}


/* ==========================================
   LIMPAR URL LOCAL
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
   FINALIZAR GRAVAÇÃO ATUAL
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


        /*
          Capturamos a duração DESTA gravação
          antes de iniciar qualquer outra.
        */

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
      (evento) => {

        console.error(
          "Erro no MediaRecorder:",
          evento
        );


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
   SALVAR GRAVAÇÃO LOCAL - RELATO
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


  playerAudioRelato.hidden =
    false;


  botaoApagarAudioRelato.hidden =
    false;


  botaoTranscreverRelato.hidden =
    false;


  botaoTranscreverRelato.disabled =
    true;


  statusAudioRelato.textContent =
    `Gravação finalizada — ${formatarTempo(
      audioRelatoDuracao
    )}`;


  botaoGravarRelato.textContent =
    "🎙️ Gravar novamente";

}


/* ==========================================
   SALVAR GRAVAÇÃO LOCAL - ORIENTAÇÃO
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


  playerAudioOrientacao.hidden =
    false;


  botaoApagarAudioOrientacao.hidden =
    false;


  botaoTranscreverOrientacao.hidden =
    false;


  botaoTranscreverOrientacao.disabled =
    true;


  statusAudioOrientacao.textContent =
    `Gravação finalizada — ${formatarTempo(
      audioOrientacaoDuracao
    )}`;


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


  playerAudioRelato.pause();


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


  playerAudioRelato.hidden =
    true;


  botaoApagarAudioRelato.hidden =
    true;


  botaoTranscreverRelato.hidden =
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


  playerAudioOrientacao.pause();


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


  playerAudioOrientacao.hidden =
    true;


  botaoApagarAudioOrientacao.hidden =
    true;


  botaoTranscreverOrientacao.hidden =
    true;


  statusAudioOrientacao.textContent =
    "";


  areaAudioOrientacao.hidden =
    true;


  botaoGravarOrientacao.textContent =
    "🎙️ Gravar áudio";

}


/* ==========================================
   UPLOAD DO ÁUDIO
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
   REMOVER ARQUIVOS EM CASO DE ERRO
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
   CRIAR ITEM DE RESULTADO
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
            ascending: true
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
            ascending: true
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
   CRIAR PESSOA NÃO ASSOCIADA
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
   SALVAR ATENDIMENTO
========================================== */

async function salvarAtendimento() {

  esconderMensagem();


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

      botaoSalvarAtendimento.textContent =
        "ENVIANDO ÁUDIO DO RELATO...";


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

      botaoSalvarAtendimento.textContent =
        "ENVIANDO ÁUDIO DA ORIENTAÇÃO...";


      orientacaoAudioPath =
        await enviarAudio(
          atendimentoId,
          "orientacao",
          audioOrientacaoBlob
        );

    }


    botaoSalvarAtendimento.textContent =
      "SALVANDO ATENDIMENTO...";


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


botaoGravarRelato.addEventListener(
  "click",
  () => {

    if (
      gravacaoAtual &&
      gravacaoAtual.tipo === "relato"
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
      gravacaoAtual.tipo === "orientacao"
    ) {

      finalizarGravacaoAtual();

      return;

    }


    iniciarGravacao(
      "orientacao"
    );

  }
);


botaoApagarAudioRelato.addEventListener(
  "click",
  apagarAudioRelato
);


botaoApagarAudioOrientacao.addEventListener(
  "click",
  apagarAudioOrientacao
);


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


    mostrarMensagem(
      "A gravação de áudio não está disponível neste navegador."
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
