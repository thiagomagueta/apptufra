"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const listaResponsaveisBaixas =
  document.getElementById(
    "listaResponsaveisBaixas"
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

let responsaveisOriginais =
  [];

let associadosCarregados =
  [];


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
   CARREGAR RESPONSÁVEIS ATUAIS
========================================== */

async function carregarResponsaveisAtuais() {

  const resultado =
    await window.supabaseClient
      .from(
        "responsaveis_baixas_associados"
      )
      .select(`
        usuario_id
      `);


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
      .filter(
        Boolean
      );
}


/* ==========================================
   CARREGAR ASSOCIADOS
========================================== */

async function carregarAssociados() {

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
              sensitivity:
                "base"
            }
          )
      );


  listaResponsaveisBaixas.innerHTML =
    "";


  mensagemSemResponsaveis.hidden =
    associadosCarregados.length > 0;


  associadosCarregados.forEach(
    (associado) => {

      listaResponsaveisBaixas.appendChild(
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
            "responsaveis_baixas_associados"
          )
          .delete()
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
            usuario_id:
              usuarioId
          })
        );


      const resultadoAdicionar =
        await window.supabaseClient
          .from(
            "responsaveis_baixas_associados"
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
      "Erro ao salvar responsáveis por Baixas:",
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

  if (
    !window.supabaseClient
  ) {

    mostrarMensagem(
      "Não foi possível conectar ao banco de dados."
    );

    return;
  }


  try {

    await carregarResponsaveisAtuais();


    await carregarAssociados();


  } catch (erro) {

    console.error(
      "Erro ao carregar responsáveis por Baixas:",
      erro
    );


    listaResponsaveisBaixas.innerHTML =
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
