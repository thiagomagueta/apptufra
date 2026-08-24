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
   ESTADO
========================================== */

let atendimentoId =
  null;

let usuarioLogadoId =
  null;


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


  botaoSalvarAlteracoes.disabled =
    false;

}


/* ==========================================
   VALIDAÇÃO
========================================== */

function validarFormulario() {

  if (
    !dataAtendimento.value
  ) {

    mostrarMensagem(
      "Informe a data do atendimento."
    );

    return false;

  }


  if (
    !relatoAtendimento.value.trim()
  ) {

    mostrarMensagem(
      "Preencha o relato do atendimento."
    );

    return false;

  }


  if (
    !orientacaoAtendimento.value.trim()
  ) {

    mostrarMensagem(
      "Preencha a orientação / conduta."
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


  if (
    !validarFormulario()
  ) {

    return;

  }


  botaoSalvarAlteracoes.disabled =
    true;


  botaoSalvarAlteracoes.textContent =
    "SALVANDO...";


  try {

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
            relatoAtendimento.value.trim(),

          orientacao_conduta:
            orientacaoAtendimento.value.trim(),

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


botaoSalvarAlteracoes.addEventListener(
  "click",
  salvarAlteracoes
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
