"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const campoBuscaPessoa =
  document.getElementById(
    "campoBuscaPessoa"
  );

const resultadoBuscaPessoa =
  document.getElementById(
    "resultadoBuscaPessoa"
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

const mensagemAtendimentosRealizados =
  document.getElementById(
    "mensagemAtendimentosRealizados"
  );


/* ==========================================
   ESTADO
========================================== */

let usuarioLogadoId =
  null;

let temporizadorBuscaPessoa =
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


/* ==========================================
   MENSAGENS
========================================== */

function mostrarMensagem(
  texto
) {

  mensagemAtendimentosRealizados.textContent =
    texto;

  mensagemAtendimentosRealizados.hidden =
    false;

}


function esconderMensagem() {

  mensagemAtendimentosRealizados.textContent =
    "";

  mensagemAtendimentosRealizados.hidden =
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

async function carregarAudioOriginal(
  caminho,
  areaPlayer,
  player,
  botao
) {

  if (
    !caminho
  ) {

    return;

  }


  esconderMensagem();


  botao.disabled =
    true;


  botao.textContent =
    "Carregando áudio...";


  try {

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
        "URL do áudio não encontrada."
      );

    }


    player.src =
      resultado.data.signedUrl;


    areaPlayer.hidden =
      false;


    player.hidden =
      false;


    try {

      await player.play();

    } catch (erroPlay) {

      console.warn(
        "Reprodução automática não iniciada:",
        erroPlay
      );

    }


    botao.textContent =
      "▶ Ouvir áudio original";


  } catch (erro) {

    console.error(
      "Erro ao carregar áudio original:",
      erro
    );


    mostrarMensagem(
      "Não foi possível carregar o áudio original."
    );


    botao.textContent =
      "▶ Ouvir áudio original";

  }


  botao.disabled =
    false;

}


/* ==========================================
   CRIAR ÁREA DO ÁUDIO ORIGINAL
========================================== */

function criarAreaAudioOriginal(
  caminho
) {

  const container =
    document.createElement(
      "div"
    );


  container.style.marginTop =
    "10px";


  const botao =
    document.createElement(
      "button"
    );


  botao.type =
    "button";


  botao.textContent =
    "▶ Ouvir áudio original";


  botao.style.padding =
    "8px 10px";


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


  const areaPlayer =
    document.createElement(
      "div"
    );


  areaPlayer.style.marginTop =
    "10px";


  areaPlayer.hidden =
    true;


  const player =
    document.createElement(
      "audio"
    );


  player.controls =
    true;


  player.style.width =
    "100%";


  player.hidden =
    true;


  areaPlayer.appendChild(
    player
  );


  botao.addEventListener(
    "click",
    () => {

      carregarAudioOriginal(
        caminho,
        areaPlayer,
        player,
        botao
      );

    }
  );


  container.appendChild(
    botao
  );


  container.appendChild(
    areaPlayer
  );


  return container;

}


/* ==========================================
   RESULTADO DA BUSCA
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
    pessoa.tipo === "associado"
      ? "Associado"
      : "Não associado";


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


      abrirHistoricoPessoa(
        pessoa
      );

    }
  );


  return botao;

}


/* ==========================================
   BUSCAR PESSOAS COM ATENDIMENTO
========================================== */

async function buscarPessoas() {

  esconderMensagem();


  pararLeitura();


  const busca =
    campoBuscaPessoa.value.trim();


  secaoHistoricoAtendimentos.hidden =
    true;


  resultadoBuscaPessoa.innerHTML =
    "";


  if (
    busca.length < 2
  ) {

    resultadoBuscaPessoa.innerHTML =
      "<p>Digite pelo menos 2 letras para pesquisar.</p>";

    return;

  }


  resultadoBuscaPessoa.innerHTML =
    "<p>Pesquisando...</p>";


  try {

    const resultadoAtendimentos =
      await window.supabaseClient
        .from(
          "atendimentos"
        )
        .select(`
          usuario_id,
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
          )
          .ilike(
            "nome_completo",
            `%${busca}%`
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

              nome_completo:
                pessoa.nome_completo,

              tipo:
                "associado"
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
          )
          .ilike(
            "nome_completo",
            `%${busca}%`
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


    const pessoas =
      [
        ...associados,
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
        )
        .slice(
          0,
          40
        );


    resultadoBuscaPessoa.innerHTML =
      "";


    if (
      !pessoas.length
    ) {

      resultadoBuscaPessoa.innerHTML =
        "<p>Nenhuma pessoa com atendimento encontrada.</p>";

      return;

    }


    pessoas.forEach(
      (pessoa) => {

        resultadoBuscaPessoa.appendChild(
          criarBotaoPessoa(
            pessoa
          )
        );

      }
    );


  } catch (erro) {

    console.error(
      "Erro ao pesquisar pessoas:",
      erro
    );


    resultadoBuscaPessoa.innerHTML =
      "<p>Não foi possível realizar a pesquisa.</p>";

  }

}


/* ==========================================
   BLOCO DE TEXTO
========================================== */

function criarBlocoTexto(
  titulo,
  texto,
  textoBotaoLeitura = null,
  audioPath = null
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


  textoElemento.textContent =
    String(
      texto || ""
    ).trim()
      ? texto
      : audioPath
        ? "Registro realizado em áudio."
        : "Não informado.";


  bloco.appendChild(
    textoElemento
  );


  if (
    audioPath
  ) {

    bloco.appendChild(
      criarAreaAudioOriginal(
        audioPath
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
      atendimento.relato_audio_path
    )
  );


  item.appendChild(
    criarBlocoTexto(
      "Orientação / Conduta",
      atendimento.orientacao_conduta,
      "🔊 Ouvir orientação",
      atendimento.orientacao_audio_path
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
     APENAS SE EXISTIR ALGUM TEXTO
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
          : "Relato registrado somente em áudio.",
        atendimento.orientacao_conduta
          ? `Orientação e conduta: ${atendimento.orientacao_conduta}`
          : "Orientação registrada somente em áudio.",
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
    `editar-atendimento.html?id=${atendimento.id}&origem=busca`;


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


  nomePessoaHistorico.textContent =
    formatarNome(
      pessoa.nome_completo
    );


  tipoPessoaHistorico.textContent =
    pessoa.tipo === "associado"
      ? "Associado"
      : "Não associado";


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
          data_atendimento,
          motivo,
          relato,
          orientacao_conduta,
          relato_audio_path,
          orientacao_audio_path,
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
      "associado"
    ) {

      consulta =
        consulta.eq(
          "usuario_id",
          pessoa.id
        );

    } else {

      consulta =
        consulta.eq(
          "pessoa_nao_associada_id",
          pessoa.id
        );

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
   EVENTO
========================================== */

campoBuscaPessoa.addEventListener(
  "input",
  () => {

    clearTimeout(
      temporizadorBuscaPessoa
    );


    temporizadorBuscaPessoa =
      setTimeout(
        buscarPessoas,
        300
      );

  }
);


/* ==========================================
   SAÍDA
========================================== */

window.addEventListener(
  "beforeunload",
  pararLeitura
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


    campoBuscaPessoa.disabled =
      false;


  } catch (erro) {

    console.error(
      "Erro ao iniciar Atendimentos Realizados:",
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
