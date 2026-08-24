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

    /* ======================================
       PRIMEIRO:
       BUSCAR QUEM POSSUI ATENDIMENTO
    ====================================== */

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


    /* ======================================
       IDs ÚNICOS DE ASSOCIADOS
    ====================================== */

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


    /* ======================================
       IDs ÚNICOS DE NÃO ASSOCIADOS
    ====================================== */

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


    /* ======================================
       SE NÃO EXISTIR NENHUM ATENDIMENTO
    ====================================== */

    if (
      idsAssociados.length === 0 &&
      idsNaoAssociados.length === 0
    ) {

      resultadoBuscaPessoa.innerHTML =
        "<p>Nenhum atendimento registrado.</p>";

      return;

    }


    /* ======================================
       CONSULTAS DOS NOMES
    ====================================== */

    let associados =
      [];

    let naoAssociados =
      [];


    /* --------------------------------------
       ASSOCIADOS
    -------------------------------------- */

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
          )
          .order(
            "nome_completo",
            {
              ascending:
                true
            }
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


    /* --------------------------------------
       NÃO ASSOCIADOS
    -------------------------------------- */

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
          )
          .order(
            "nome_completo",
            {
              ascending:
                true
            }
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


    /* ======================================
       JUNTAR E ORDENAR
    ====================================== */

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


    /* ======================================
       SEM RESULTADOS
    ====================================== */

    if (
      !pessoas.length
    ) {

      resultadoBuscaPessoa.innerHTML =
        "<p>Nenhuma pessoa com atendimento encontrada.</p>";

      return;

    }


    /* ======================================
       MOSTRAR RESULTADOS
    ====================================== */

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
      "Erro ao pesquisar pessoas com atendimento:",
      erro
    );


    resultadoBuscaPessoa.innerHTML =
      "<p>Não foi possível realizar a pesquisa.</p>";

  }

}


/* ==========================================
   CRIAR CAMPO DO HISTÓRICO
========================================== */

function criarBlocoTexto(
  titulo,
  texto
) {

  const bloco =
    document.createElement(
      "div"
    );


  bloco.style.marginTop =
    "16px";


  const tituloElemento =
    document.createElement(
      "strong"
    );


  tituloElemento.textContent =
    titulo;


  const textoElemento =
    document.createElement(
      "p"
    );


  textoElemento.style.marginTop =
    "6px";


  textoElemento.style.whiteSpace =
    "pre-wrap";


  textoElemento.textContent =
    texto ||
    "Não informado.";


  bloco.appendChild(
    tituloElemento
  );


  bloco.appendChild(
    textoElemento
  );


  return bloco;

}


/* ==========================================
   CRIAR ATENDIMENTO
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


  /* ======================================
     DATA
  ====================================== */

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


  /* ======================================
     RESPONSÁVEL
  ====================================== */

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


  /* ======================================
     MOTIVO
  ====================================== */

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


  /* ======================================
     RELATO
  ====================================== */

  item.appendChild(
    criarBlocoTexto(
      "Relato",
      atendimento.relato
    )
  );


  /* ======================================
     ORIENTAÇÃO
  ====================================== */

  item.appendChild(
    criarBlocoTexto(
      "Orientação / Conduta",
      atendimento.orientacao_conduta
    )
  );


  /* ======================================
     ACOMPANHAMENTO
  ====================================== */

  const acompanhamento =
    document.createElement(
      "div"
    );


  acompanhamento.style.marginTop =
    "16px";


  const acompanhamentoTitulo =
    document.createElement(
      "strong"
    );


  acompanhamentoTitulo.textContent =
    "Acompanhamento";


  const acompanhamentoTexto =
    document.createElement(
      "p"
    );


  acompanhamentoTexto.style.marginTop =
    "6px";


  if (
    atendimento.precisa_acompanhamento
  ) {

    acompanhamentoTexto.textContent =
      atendimento.data_retorno
        ? `Sim — retorno sugerido para ${formatarData(
            atendimento.data_retorno
          )}`
        : "Sim — sem data definida.";

  } else {

    acompanhamentoTexto.textContent =
      "Não.";

  }


  acompanhamento.appendChild(
    acompanhamentoTitulo
  );


  acompanhamento.appendChild(
    acompanhamentoTexto
  );


  item.appendChild(
    acompanhamento
  );


  /* ======================================
     AUDITORIA
  ====================================== */

  const auditoria =
    document.createElement(
      "div"
    );


  auditoria.style.marginTop =
    "18px";


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
   EVENTO DE BUSCA
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
