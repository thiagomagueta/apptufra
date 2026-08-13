"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const nomeTipoLista =
  document.getElementById(
    "nomeTipoLista"
  );

const listaResponsaveisDisponiveis =
  document.getElementById(
    "listaResponsaveisDisponiveis"
  );

const mensagemSemResponsaveis =
  document.getElementById(
    "mensagemSemResponsaveis"
  );

const mensagemSalvarResponsaveis =
  document.getElementById(
    "mensagemSalvarResponsaveis"
  );

const botaoSalvarResponsaveis =
  document.getElementById(
    "botaoSalvarResponsaveis"
  );


/* ==========================================
   DADOS
========================================== */

let tipoListaId =
  null;

let responsaveisOriginais =
  [];

let associadosCarregados =
  [];


/* ==========================================
   PARÂMETROS
========================================== */

function obterTipoListaId() {

  const parametros =
    new URLSearchParams(
      window.location.search
    );

  return parametros.get(
    "id"
  );
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

  mensagemSalvarResponsaveis.textContent =
    texto;

  mensagemSalvarResponsaveis.hidden =
    false;
}


function esconderMensagem() {

  mensagemSalvarResponsaveis.textContent =
    "";

  mensagemSalvarResponsaveis.hidden =
    true;
}


/* ==========================================
   CRIAR ITEM
========================================== */

function criarItemAssociado(
  associado
) {

  const label =
    document.createElement(
      "label"
    );

  label.className =
    "item-responsavel-presenca";


  const checkbox =
    document.createElement(
      "input"
    );

  checkbox.type =
    "checkbox";

  checkbox.value =
    associado.id;

  checkbox.className =
    "checkbox-responsavel-presenca";


  checkbox.checked =
    responsaveisOriginais.includes(
      associado.id
    );


  const nome =
    document.createElement(
      "span"
    );

  nome.textContent =
    formatarNome(
      associado.nome_completo
    );


  label.appendChild(
    checkbox
  );

  label.appendChild(
    nome
  );


  return label;
}


/* ==========================================
   CARREGAR TIPO DE LISTA
========================================== */

async function carregarTipoLista() {

  const resultado =
    await window.supabaseClient
      .from(
        "tipos_lista_presenca"
      )
      .select(`
        id,
        nome,
        ativo
      `)
      .eq(
        "id",
        tipoListaId
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
      "Lista de presença não encontrada."
    );

  }


  nomeTipoLista.textContent =
    resultado.data.nome;
}


/* ==========================================
   CARREGAR RESPONSÁVEIS ATUAIS
========================================== */

async function carregarResponsaveisAtuais() {

  const resultado =
    await window.supabaseClient
      .from(
        "responsaveis_lista_presenca"
      )
      .select(`
        usuario_id
      `)
      .eq(
        "tipo_lista_id",
        tipoListaId
      );


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  responsaveisOriginais =
    (
      resultado.data ||
      []
    )
      .map(
        (item) =>
          item.usuario_id
      )
      .filter(Boolean);
}


/* ==========================================
   CARREGAR ASSOCIADOS
========================================== */

async function carregarAssociados() {

  const resultado =
    await window.supabaseClient
      .from("usuarios")
      .select(`
        id,
        nome_completo,
        status
      `)
      .eq(
        "status",
        "ativo"
      );


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  associadosCarregados =
    (
      resultado.data ||
      []
    )
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
              sensitivity: "base"
            }
          )
      );


  listaResponsaveisDisponiveis.innerHTML =
    "";


  mensagemSemResponsaveis.hidden =
    associadosCarregados.length > 0;


  associadosCarregados.forEach(
    (associado) => {

      listaResponsaveisDisponiveis.appendChild(
        criarItemAssociado(
          associado
        )
      );

    }
  );


  botaoSalvarResponsaveis.disabled =
    false;
}


/* ==========================================
   RESPONSÁVEIS SELECIONADOS
========================================== */

function obterResponsaveisSelecionados() {

  return Array.from(
    document.querySelectorAll(
      ".checkbox-responsavel-presenca:checked"
    )
  )
    .map(
      (checkbox) =>
        checkbox.value
    );
}


/* ==========================================
   SALVAR
========================================== */

async function salvarResponsaveis() {

  esconderMensagem();


  const selecionados =
    obterResponsaveisSelecionados();


  const adicionar =
    selecionados.filter(
      (usuarioId) =>
        !responsaveisOriginais.includes(
          usuarioId
        )
    );


  const remover =
    responsaveisOriginais.filter(
      (usuarioId) =>
        !selecionados.includes(
          usuarioId
        )
    );


  botaoSalvarResponsaveis.disabled =
    true;

  botaoSalvarResponsaveis.textContent =
    "SALVANDO...";


  try {

    /* --------------------------------------
       REMOVER
    -------------------------------------- */

    if (
      remover.length > 0
    ) {

      const resultadoRemover =
        await window.supabaseClient
          .from(
            "responsaveis_lista_presenca"
          )
          .delete()
          .eq(
            "tipo_lista_id",
            tipoListaId
          )
          .in(
            "usuario_id",
            remover
          );


      if (
        resultadoRemover.error
      ) {

        throw resultadoRemover.error;

      }

    }


    /* --------------------------------------
       ADICIONAR
    -------------------------------------- */

    if (
      adicionar.length > 0
    ) {

      const novosResponsaveis =
        adicionar.map(
          (usuarioId) => ({
            tipo_lista_id:
              tipoListaId,

            usuario_id:
              usuarioId
          })
        );


      const resultadoAdicionar =
        await window.supabaseClient
          .from(
            "responsaveis_lista_presenca"
          )
          .insert(
            novosResponsaveis
          );


      if (
        resultadoAdicionar.error
      ) {

        throw resultadoAdicionar.error;

      }

    }


    responsaveisOriginais =
      [...selecionados];


    mostrarMensagem(
      "Responsáveis atualizados com sucesso."
    );


    botaoSalvarResponsaveis.textContent =
      "Responsáveis salvos";


    setTimeout(
      () => {

        botaoSalvarResponsaveis.disabled =
          false;

        botaoSalvarResponsaveis.textContent =
          "Salvar responsáveis";

      },
      1000
    );


  } catch (erro) {

    console.error(
      "Erro ao salvar responsáveis:",
      erro
    );


    mostrarMensagem(
      "Não foi possível salvar os responsáveis."
    );


    botaoSalvarResponsaveis.disabled =
      false;


    botaoSalvarResponsaveis.textContent =
      "Salvar responsáveis";

  }

}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

async function iniciarPagina() {

  tipoListaId =
    obterTipoListaId();


  if (
    !tipoListaId
  ) {

    window.location.href =
      "responsaveis-presenca.html";

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

    await carregarTipoLista();

    await carregarResponsaveisAtuais();

    await carregarAssociados();


  } catch (erro) {

    console.error(
      "Erro ao carregar responsáveis:",
      erro
    );


    listaResponsaveisDisponiveis.innerHTML =
      "<p>Não foi possível carregar os associados.</p>";


    mostrarMensagem(
      "Não foi possível carregar esta lista."
    );

  }

}


/* ==========================================
   EVENTO
========================================== */

botaoSalvarResponsaveis.addEventListener(
  "click",
  salvarResponsaveis
);


/* ==========================================
   INICIAR
========================================== */

iniciarPagina();
