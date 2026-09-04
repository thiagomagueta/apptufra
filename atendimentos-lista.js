"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const listaPessoasAtendidas =
  document.getElementById(
    "listaPessoasAtendidas"
  );

const secaoHistoricoAtendimentos =
  document.getElementById(
    "secaoHistoricoAtendimentos"
  );

const nomePessoaHistorico =
  document.getElementById(
    "nomePessoaHistorico"
  );

const tipoPessoaHistorico =
  document.getElementById(
    "tipoPessoaHistorico"
  );

const listaHistoricoAtendimentos =
  document.getElementById(
    "listaHistoricoAtendimentos"
  );

const mensagemAtendimentosLista =
  document.getElementById(
    "mensagemAtendimentosLista"
  );


/* ==========================================
   ESTADO
========================================== */

let usuarioLogadoId =
  null;

let pessoasComAtendimento =
  [];

let audioEmReproducao =
  null;


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


function formatarData(
  data
) {

  if (
    !data
  ) {

    return "";

  }


  const partes =
    String(
      data
    ).split(
      "-"
    );


  if (
    partes.length !== 3
  ) {

    return data;

  }


  return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


function formatarDataHora(
  data
) {

  if (
    !data
  ) {

    return "";

  }


  try {

    return new Intl.DateTimeFormat(
      "pt-BR",
      {
        dateStyle:
          "short",

        timeStyle:
          "short"
      }
    )
      .format(
        new Date(
          data
        )
      );

  } catch (erro) {

    return data;

  }

}


function formatarDuracaoAudio(
  segundos
) {

  const total =
    Math.max(
      0,
      Number(
        segundos || 0
      )
    );


  const minutos =
    Math.floor(
      total / 60
    );


  const restante =
    Math.floor(
      total % 60
    );


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


/* ==========================================
   MENSAGENS
========================================== */

function mostrarMensagem(
  texto
) {

  mensagemAtendimentosLista.textContent =
    texto;


  mensagemAtendimentosLista.hidden =
    false;

}


function esconderMensagem() {

  mensagemAtendimentosLista.textContent =
    "";


  mensagemAtendimentosLista.hidden =
    true;

}


/* ==========================================
   LEITURA EM VOZ ALTA
========================================== */

function podeUsarLeituraVoz() {

  return (
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window
  );

}


function pararLeitura() {

  if (
    podeUsarLeituraVoz()
  ) {

    window.speechSynthesis.cancel();

  }

}


function falarTexto(
  texto
) {

  if (
    !podeUsarLeituraVoz()
  ) {

    mostrarMensagem(
      "A leitura em voz alta não está disponível neste aparelho ou navegador."
    );

    return;

  }


  const textoLimpo =
    String(
      texto || ""
    ).trim();


  if (
    !textoLimpo
  ) {

    mostrarMensagem(
      "Não há texto disponível para leitura."
    );

    return;

  }


  esconderMensagem();


  pararLeitura();


  pararAudioAtual();


  const fala =
    new SpeechSynthesisUtterance(
      textoLimpo
    );


  fala.lang =
    "pt-BR";


  fala.rate =
    1;


  fala.pitch =
    1;


  window.speechSynthesis.speak(
    fala
  );

}


/* ==========================================
   BOTÃO DE LEITURA
========================================== */

function criarBotaoLeitura(
  textoBotao,
  textoLeitura
) {

  const botao =
    document.createElement(
      "button"
    );


  botao.type =
    "button";


  botao.textContent =
    textoBotao;


  botao.style.padding =
    "7px 10px";


  botao.style.border =
    "1px solid #bbb";


  botao.style.borderRadius =
    "8px";


  botao.style.background =
    "#fff";


  botao.style.cursor =
    "pointer";


  botao.style.fontSize =
    "13px";


  botao.addEventListener(
    "click",
    () => {

      falarTexto(
        textoLeitura
      );

    }
  );


  return botao;

}


/* ==========================================
   ÁUDIO ORIGINAL
========================================== */

function pararAudioAtual() {

  if (
    !audioEmReproducao
  ) {

    return;

  }


  try {

    audioEmReproducao.pause();


    audioEmReproducao.currentTime =
      0;

  } catch (erro) {

    console.warn(
      "Não foi possível parar o áudio:",
      erro
    );

  }


  audioEmReproducao =
    null;

}


/* ==========================================
   REPRODUZIR ÁUDIO
========================================== */

async function reproduzirAudioOriginal(
  caminho,
  audio,
  botaoReproduzir
) {

  if (
    !caminho
  ) {

    return;

  }


  esconderMensagem();


  pararLeitura();


  pararAudioAtual();


  botaoReproduzir.disabled =
    true;


  botaoReproduzir.textContent =
    "Carregando...";


  try {

    if (
      !audio.src
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


      audio.src =
        resultado.data.signedUrl;

    }


    audio.currentTime =
      0;


    audioEmReproducao =
      audio;


    await audio.play();


  } catch (erro) {

    console.error(
      "Erro ao reproduzir áudio original:",
      erro
    );


    audioEmReproducao =
      null;


    mostrarMensagem(
      "Não foi possível reproduzir o áudio original."
    );

  } finally {

    botaoReproduzir.disabled =
      false;


    botaoReproduzir.textContent =
      "▶ Reproduzir";

  }

}


/* ==========================================
   CONTROLE DO ÁUDIO
========================================== */

function criarAreaAudioOriginal(
  caminho,
  duracao
) {

  const area =
    document.createElement(
      "div"
    );


  area.style.display =
    "flex";


  area.style.flexWrap =
    "wrap";


  area.style.alignItems =
    "center";


  area.style.gap =
    "8px";


  area.style.marginTop =
    "10px";


  const audio =
    document.createElement(
      "audio"
    );


  audio.preload =
    "metadata";


  const botaoReproduzir =
    document.createElement(
      "button"
    );


  botaoReproduzir.type =
    "button";


  botaoReproduzir.textContent =
    "▶ Reproduzir";


  botaoReproduzir.style.padding =
    "8px 10px";


  botaoReproduzir.style.border =
    "1px solid #bbb";


  botaoReproduzir.style.borderRadius =
    "8px";


  botaoReproduzir.style.background =
    "#fff";


  botaoReproduzir.style.cursor =
    "pointer";


  botaoReproduzir.style.fontSize =
    "13px";


  const botaoParar =
    document.createElement(
      "button"
    );


  botaoParar.type =
    "button";


  botaoParar.textContent =
    "■ Parar";


  botaoParar.style.padding =
    "8px 10px";


  botaoParar.style.border =
    "1px solid #bbb";


  botaoParar.style.borderRadius =
    "8px";


  botaoParar.style.background =
    "#fff";


  botaoParar.style.cursor =
    "pointer";


  botaoParar.style.fontSize =
    "13px";


  const duracaoElemento =
    document.createElement(
      "span"
    );


  duracaoElemento.style.fontSize =
    "13px";


  duracaoElemento.style.fontWeight =
    "600";


  if (
    Number(
      duracao
    ) > 0
  ) {

    duracaoElemento.textContent =
      `⏱ ${formatarDuracaoAudio(
        duracao
      )}`;

  } else {

    duracaoElemento.textContent =
      "⏱ duração não registrada";

  }


  botaoReproduzir.addEventListener(
    "click",
    () => {

      reproduzirAudioOriginal(
        caminho,
        audio,
        botaoReproduzir
      );

    }
  );


  botaoParar.addEventListener(
    "click",
    () => {

      if (
        audioEmReproducao === audio
      ) {

        pararAudioAtual();

      } else {

        try {

          audio.pause();


          audio.currentTime =
            0;

        } catch (erro) {

          console.warn(
            "Não foi possível parar o áudio:",
            erro
          );

        }

      }

    }
  );


  audio.addEventListener(
    "ended",
    () => {

      if (
        audioEmReproducao === audio
      ) {

        audioEmReproducao =
          null;

      }

    }
  );


  area.appendChild(
    botaoReproduzir
  );


  area.appendChild(
    botaoParar
  );


  area.appendChild(
    duracaoElemento
  );


  area.appendChild(
    audio
  );


  return area;

}


/* ==========================================
   BOTÃO DA PESSOA
========================================== */

function criarBotaoPessoa(
  pessoa
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


  const nome =
    document.createElement(
      "strong"
    );


  nome.textContent =
    formatarNome(
      pessoa.nome_completo
    );


  const tipo =
    document.createElement(
      "span"
    );


  tipo.textContent =
    pessoa.tipo === "nao_associado"
      ? "Não associado"
      : "Associado";


  dados.appendChild(
    nome
  );


  dados.appendChild(
    tipo
  );


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
    () => {

      pararLeitura();


      pararAudioAtual();


      abrirHistoricoPessoa(
        pessoa
      );

    }
  );


  return botao;

}


/* ==========================================
   MOSTRAR LISTA
========================================== */

function mostrarLista() {

  const filtroSelecionado =
    document.querySelector(
      'input[name="filtroTipoPessoa"]:checked'
    )?.value ||
    "todos";


  let pessoasFiltradas =
    [
      ...pessoasComAtendimento
    ];


  if (
    filtroSelecionado ===
    "associado"
  ) {

    pessoasFiltradas =
      pessoasFiltradas.filter(
        (pessoa) =>
          pessoa.tipo ===
            "associado" ||
          pessoa.tipo ===
            "associado_base"
      );

  }


  if (
    filtroSelecionado ===
    "nao_associado"
  ) {

    pessoasFiltradas =
      pessoasFiltradas.filter(
        (pessoa) =>
          pessoa.tipo ===
          "nao_associado"
      );

  }


  listaPessoasAtendidas.innerHTML =
    "";


  if (
    !pessoasFiltradas.length
  ) {

    listaPessoasAtendidas.innerHTML =
      "<p>Nenhuma pessoa encontrada neste filtro.</p>";

    return;

  }


  pessoasFiltradas.forEach(
    (pessoa) => {

      listaPessoasAtendidas.appendChild(
        criarBotaoPessoa(
          pessoa
        )
      );

    }
  );

}


/* ==========================================
   CARREGAR PESSOAS
========================================== */

async function carregarPessoasComAtendimento() {

  listaPessoasAtendidas.innerHTML =
    "<p>Carregando pessoas...</p>";


  const resultadoAtendimentos =
    await window.supabaseClient
      .from(
        "atendimentos"
      )
      .select(`
        usuario_id,
        associado_base_id,
        pessoa_nao_associada_id
      `);


  if (
    resultadoAtendimentos.error
  ) {

    throw resultadoAtendimentos.error;

  }


  const registros =
    resultadoAtendimentos.data ||
    [];


  const idsAssociados =
    [
      ...new Set(
        registros
          .map(
            (item) =>
              item.usuario_id
          )
          .filter(
            Boolean
          )
      )
    ];


  const idsAssociadosBase =
    [
      ...new Set(
        registros
          .map(
            (item) =>
              item.associado_base_id
          )
          .filter(
            Boolean
          )
      )
    ];


  const idsNaoAssociados =
    [
      ...new Set(
        registros
          .map(
            (item) =>
              item.pessoa_nao_associada_id
          )
          .filter(
            Boolean
          )
      )
    ];


  let associados =
    [];


  let associadosBase =
    [];


  let naoAssociados =
    [];


  if (
    idsAssociados.length > 0
  ) {

    const resultadoAssociados =
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
          idsAssociados
        );


    if (
      resultadoAssociados.error
    ) {

      throw resultadoAssociados.error;

    }


    associados =
      (
        resultadoAssociados.data ||
        []
      )
        .map(
          (pessoa) => ({

            id:
              pessoa.id,

            usuario_id:
              pessoa.id,

            associado_base_id:
              null,

            nome_completo:
              pessoa.nome_completo,

            tipo:
              "associado"

          })
        );

  }


  if (
    idsAssociadosBase.length > 0
  ) {

    const resultadoAssociadosBase =
      await window.supabaseClient
        .from(
          "atendimentos_associados_base"
        )
        .select(`
          id,
          nome_completo,
          usuario_id
        `)
        .in(
          "id",
          idsAssociadosBase
        );


    if (
      resultadoAssociadosBase.error
    ) {

      throw resultadoAssociadosBase.error;

    }


    associadosBase =
      (
        resultadoAssociadosBase.data ||
        []
      )
        .map(
          (pessoa) => ({

            id:
              pessoa.id,

            usuario_id:
              pessoa.usuario_id ||
              null,

            associado_base_id:
              pessoa.id,

            nome_completo:
              pessoa.nome_completo,

            tipo:
              "associado_base"

          })
        );

  }


  if (
    idsNaoAssociados.length > 0
  ) {

    const resultadoNaoAssociados =
      await window.supabaseClient
        .from(
          "pessoas_atendimentos"
        )
        .select(`
          id,
          nome_completo
        `)
        .in(
          "id",
          idsNaoAssociados
        );


    if (
      resultadoNaoAssociados.error
    ) {

      throw resultadoNaoAssociados.error;

    }


    naoAssociados =
      (
        resultadoNaoAssociados.data ||
        []
      )
        .map(
          (pessoa) => ({

            id:
              pessoa.id,

            nome_completo:
              pessoa.nome_completo,

            tipo:
              "nao_associado"

          })
        );

  }


  /*
    Junta associados oficiais e associados
    da base auxiliar.

    Se o mesmo nome existir nas duas bases,
    mostramos somente uma pessoa.
  */

  const associadosUnificados =
    new Map();


  associados.forEach(
    (pessoa) => {

      const chave =
        normalizarTexto(
          pessoa.nome_completo
        );


      associadosUnificados.set(
        chave,
        pessoa
      );

    }
  );


  associadosBase.forEach(
    (pessoa) => {

      const chave =
        normalizarTexto(
          pessoa.nome_completo
        );


      if (
        associadosUnificados.has(
          chave
        )
      ) {

        const existente =
          associadosUnificados.get(
            chave
          );


        existente.associado_base_id =
          pessoa.associado_base_id;


        if (
          !existente.usuario_id &&
          pessoa.usuario_id
        ) {

          existente.usuario_id =
            pessoa.usuario_id;

        }


        return;

      }


      associadosUnificados.set(
        chave,
        pessoa
      );

    }
  );


  pessoasComAtendimento =
    [
      ...Array.from(
        associadosUnificados.values()
      ),
      ...naoAssociados
    ]
      .sort(
        (a, b) =>
          String(
            a.nome_completo || ""
          ).localeCompare(
            String(
              b.nome_completo || ""
            ),
            "pt-BR",
            {
              sensitivity:
                "base"
            }
          )
      );


  mostrarLista();

}


/* ==========================================
   BLOCO DE TEXTO
========================================== */

function criarBlocoTexto(
  titulo,
  texto,
  textoBotaoLeitura = null,
  audioPath = null,
  audioDuracao = null
) {

  const bloco =
    document.createElement(
      "div"
    );


  bloco.style.marginTop =
    "16px";


  const cabecalho =
    document.createElement(
      "div"
    );


  cabecalho.style.display =
    "flex";


  cabecalho.style.alignItems =
    "center";


  cabecalho.style.justifyContent =
    "space-between";


  cabecalho.style.gap =
    "10px";


  cabecalho.style.flexWrap =
    "wrap";


  const tituloElemento =
    document.createElement(
      "strong"
    );


  tituloElemento.textContent =
    titulo;


  cabecalho.appendChild(
    tituloElemento
  );


  if (
    textoBotaoLeitura &&
    String(
      texto || ""
    ).trim()
  ) {

    cabecalho.appendChild(
      criarBotaoLeitura(
        textoBotaoLeitura,
        texto
      )
    );

  }


  bloco.appendChild(
    cabecalho
  );


  const textoElemento =
    document.createElement(
      "p"
    );


  textoElemento.style.marginTop =
    "6px";


  textoElemento.style.whiteSpace =
    "pre-wrap";


  if (
    String(
      texto || ""
    ).trim()
  ) {

    textoElemento.textContent =
      texto;

  } else if (
    audioPath
  ) {

    textoElemento.textContent =
      "Registro realizado em áudio.";

  } else {

    textoElemento.textContent =
      "Não informado.";

  }


  bloco.appendChild(
    textoElemento
  );


  if (
    audioPath
  ) {

    bloco.appendChild(
      criarAreaAudioOriginal(
        audioPath,
        audioDuracao
      )
    );

  }


  return bloco;

}


/* ==========================================
   ITEM DO ATENDIMENTO
========================================== */

function criarItemAtendimento(
  atendimento
) {

  const item =
    document.createElement(
      "article"
    );


  item.style.padding =
    "18px 0";


  item.style.borderBottom =
    "1px solid #ddd";


  const cabecalho =
    document.createElement(
      "div"
    );


  const data =
    document.createElement(
      "strong"
    );


  data.textContent =
    formatarData(
      atendimento.data_atendimento
    );


  cabecalho.appendChild(
    data
  );


  if (
    atendimento.responsavel
  ) {

    const responsavel =
      document.createElement(
        "div"
      );


    responsavel.style.marginTop =
      "4px";


    responsavel.style.fontSize =
      "14px";


    responsavel.textContent =
      `Atendimento realizado por ${formatarNome(
        atendimento.responsavel.nome_completo
      )}`;


    cabecalho.appendChild(
      responsavel
    );

  }


  item.appendChild(
    cabecalho
  );


  if (
    atendimento.motivo
  ) {

    item.appendChild(
      criarBlocoTexto(
        "Motivo",
        atendimento.motivo
      )
    );

  }


  item.appendChild(
    criarBlocoTexto(
      "Relato",
      atendimento.relato,
      "🔊 Ouvir relato",
      atendimento.relato_audio_path,
      atendimento.relato_audio_duracao
    )
  );


  item.appendChild(
    criarBlocoTexto(
      "Orientação / Conduta",
      atendimento.orientacao_conduta,
      "🔊 Ouvir orientação",
      atendimento.orientacao_audio_path,
      atendimento.orientacao_audio_duracao
    )
  );


  const acompanhamento =
    document.createElement(
      "div"
    );


  acompanhamento.style.marginTop =
    "16px";


  const tituloAcompanhamento =
    document.createElement(
      "strong"
    );


  tituloAcompanhamento.textContent =
    "Acompanhamento";


  const textoAcompanhamento =
    document.createElement(
      "p"
    );


  textoAcompanhamento.style.marginTop =
    "6px";


  if (
    atendimento.precisa_acompanhamento
  ) {

    textoAcompanhamento.textContent =
      atendimento.data_retorno
        ? `Sim — retorno sugerido para ${formatarData(
            atendimento.data_retorno
          )}`
        : "Sim — sem data definida.";

  } else {

    textoAcompanhamento.textContent =
      "Não.";

  }


  acompanhamento.appendChild(
    tituloAcompanhamento
  );


  acompanhamento.appendChild(
    textoAcompanhamento
  );


  item.appendChild(
    acompanhamento
  );


  /* ======================================
     LEITURA COMPLETA
  ====================================== */

  const possuiTexto =
    Boolean(
      String(
        atendimento.relato || ""
      ).trim() ||
      String(
        atendimento.orientacao_conduta || ""
      ).trim()
    );


  if (
    possuiTexto
  ) {

    const areaLeituraCompleta =
      document.createElement(
        "div"
      );


    areaLeituraCompleta.style.display =
      "flex";


    areaLeituraCompleta.style.flexWrap =
      "wrap";


    areaLeituraCompleta.style.gap =
      "8px";


    areaLeituraCompleta.style.marginTop =
      "18px";


    const nomeResponsavel =
      atendimento.responsavel
        ? formatarNome(
            atendimento.responsavel.nome_completo
          )
        : "responsável não informado";


    const acompanhamentoFalado =
      atendimento.precisa_acompanhamento
        ? (
            atendimento.data_retorno
              ? `Sim. Retorno sugerido para ${formatarData(
                  atendimento.data_retorno
                )}.`
              : "Sim. Sem data definida."
          )
        : "Não.";


    const textoCompleto =
      [
        `Atendimento do dia ${formatarData(
          atendimento.data_atendimento
        )}.`,

        `Realizado por ${nomeResponsavel}.`,

        atendimento.motivo
          ? `Motivo: ${atendimento.motivo}.`
          : "",

        atendimento.relato
          ? `Relato: ${atendimento.relato}`
          : atendimento.relato_audio_path
            ? "Relato registrado somente em áudio."
            : "Relato não informado.",

        atendimento.orientacao_conduta
          ? `Orientação e conduta: ${atendimento.orientacao_conduta}`
          : atendimento.orientacao_audio_path
            ? "Orientação registrada somente em áudio."
            : "Orientação não informada.",

        `Acompanhamento: ${acompanhamentoFalado}`

      ]
        .filter(
          Boolean
        )
        .join(
          " "
        );


    areaLeituraCompleta.appendChild(
      criarBotaoLeitura(
        "🔊 Ouvir atendimento completo",
        textoCompleto
      )
    );


    const botaoParar =
      document.createElement(
        "button"
      );


    botaoParar.type =
      "button";


    botaoParar.textContent =
      "■ Parar leitura";


    botaoParar.style.padding =
      "10px 12px";


    botaoParar.style.border =
      "1px solid #bbb";


    botaoParar.style.borderRadius =
      "8px";


    botaoParar.style.background =
      "#fff";


    botaoParar.style.cursor =
      "pointer";


    botaoParar.style.fontSize =
      "14px";


    botaoParar.addEventListener(
      "click",
      pararLeitura
    );


    areaLeituraCompleta.appendChild(
      botaoParar
    );


    item.appendChild(
      areaLeituraCompleta
    );

  }


  /* ======================================
     EDITAR
  ====================================== */

  const linkEditar =
    document.createElement(
      "a"
    );


  linkEditar.href =
    `editar-atendimento.html?id=${atendimento.id}&origem=lista`;


  linkEditar.className =
    "link-administrativo";


  linkEditar.style.display =
    "inline-block";


  linkEditar.style.marginTop =
    "18px";


  linkEditar.textContent =
    "Editar atendimento";


  item.appendChild(
    linkEditar
  );


  /* ======================================
     AUDITORIA
  ====================================== */

  const auditoria =
    document.createElement(
      "div"
    );


  auditoria.style.marginTop =
    "14px";


  auditoria.style.fontSize =
    "13px";


  auditoria.style.opacity =
    "0.75";


  let textoAuditoria =
    `Registrado em ${formatarDataHora(
      atendimento.criado_em
    )}`;


  if (
    atendimento.atualizado_em
  ) {

    textoAuditoria +=
      ` • Última alteração em ${formatarDataHora(
        atendimento.atualizado_em
      )}`;


    if (
      atendimento.atualizado_por_usuario
    ) {

      textoAuditoria +=
        ` por ${formatarNome(
          atendimento.atualizado_por_usuario.nome_completo
        )}`;

    }

  }


  auditoria.textContent =
    textoAuditoria;


  item.appendChild(
    auditoria
  );


  return item;

}


/* ==========================================
   ABRIR HISTÓRICO
========================================== */

async function abrirHistoricoPessoa(
  pessoa
) {

  esconderMensagem();


  pararLeitura();


  pararAudioAtual();


  nomePessoaHistorico.textContent =
    formatarNome(
      pessoa.nome_completo
    );


  tipoPessoaHistorico.textContent =
    pessoa.tipo === "nao_associado"
      ? "Não associado"
      : "Associado";


  secaoHistoricoAtendimentos.hidden =
    false;


  listaHistoricoAtendimentos.innerHTML =
    "<p>Carregando atendimentos...</p>";


  try {

    let consulta =
      window.supabaseClient
        .from(
          "atendimentos"
        )
        .select(`
          id,
          usuario_id,
          associado_base_id,
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
          data_retorno,
          criado_em,
          atualizado_em,
          responsavel:responsavel_id (
            id,
            nome_completo
          ),
          atualizado_por_usuario:atualizado_por (
            id,
            nome_completo
          )
        `)
        .order(
          "data_atendimento",
          {
            ascending:
              false
          }
        )
        .order(
          "criado_em",
          {
            ascending:
              false
          }
        );


    if (
      pessoa.tipo ===
      "nao_associado"
    ) {

      consulta =
        consulta.eq(
          "pessoa_nao_associada_id",
          pessoa.id
        );

    } else {

      const filtros =
        [];


      if (
        pessoa.usuario_id
      ) {

        filtros.push(
          `usuario_id.eq.${pessoa.usuario_id}`
        );

      }


      if (
        pessoa.associado_base_id
      ) {

        filtros.push(
          `associado_base_id.eq.${pessoa.associado_base_id}`
        );

      }


      if (
        filtros.length === 1
      ) {

        if (
          pessoa.usuario_id
        ) {

          consulta =
            consulta.eq(
              "usuario_id",
              pessoa.usuario_id
            );

        } else {

          consulta =
            consulta.eq(
              "associado_base_id",
              pessoa.associado_base_id
            );

        }

      } else if (
        filtros.length > 1
      ) {

        consulta =
          consulta.or(
            filtros.join(
              ","
            )
          );

      }

    }


    const resultado =
      await consulta;


    if (
      resultado.error
    ) {

      throw resultado.error;

    }


    const atendimentos =
      resultado.data ||
      [];


    listaHistoricoAtendimentos.innerHTML =
      "";


    if (
      !atendimentos.length
    ) {

      listaHistoricoAtendimentos.innerHTML =
        "<p>Nenhum atendimento registrado para esta pessoa.</p>";

      return;

    }


    atendimentos.forEach(
      (atendimento) => {

        listaHistoricoAtendimentos.appendChild(
          criarItemAtendimento(
            atendimento
          )
        );

      }
    );


  } catch (erro) {

    console.error(
      "Erro ao carregar histórico:",
      erro
    );


    listaHistoricoAtendimentos.innerHTML =
      "<p>Não foi possível carregar o histórico de atendimentos.</p>";

  }

}


/* ==========================================
   USUÁRIO E PERMISSÃO
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
   FILTROS
========================================== */

document
  .querySelectorAll(
    'input[name="filtroTipoPessoa"]'
  )
  .forEach(
    (campo) => {

      campo.addEventListener(
        "change",
        () => {

          pararLeitura();


          pararAudioAtual();


          secaoHistoricoAtendimentos.hidden =
            true;


          mostrarLista();

        }
      );

    }
  );


/* ==========================================
   SAÍDA
========================================== */

window.addEventListener(
  "beforeunload",
  () => {

    pararLeitura();


    pararAudioAtual();

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


  try {

    const autorizado =
      await carregarUsuarioLogado();


    if (
      !autorizado
    ) {

      return;

    }


    await carregarPessoasComAtendimento();


  } catch (erro) {

    console.error(
      "Erro ao carregar lista de atendimentos:",
      erro
    );


    listaPessoasAtendidas.innerHTML =
      "<p>Não foi possível carregar a lista de pessoas.</p>";


    mostrarMensagem(
      "Não foi possível carregar esta tela."
    );

  }

}


/* ==========================================
   INICIAR
========================================== */

iniciarPagina();
