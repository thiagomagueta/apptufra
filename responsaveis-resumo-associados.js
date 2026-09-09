"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const listaResponsaveisResumoAssociados =
  document.getElementById(
    "listaResponsaveisResumoAssociados"
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
   VERIFICAR PERMISSÃO DE GERENCIAMENTO
========================================== */

async function verificarPermissaoGerenciamento() {

  const resultado =
    await window.supabaseClient
      .rpc(
        "usuario_pode_gerenciar_permissoes"
      );


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  return resultado.data === true;
}


/* ==========================================
   CARREGAR RESPONSÁVEIS ATUAIS
========================================== */

async function carregarResponsaveisAtuais() {

  const resultado =
    await window.supabaseClient
      .rpc(
        "listar_responsaveis_resumo_associados"
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


  listaResponsaveisResumoAssociados.innerHTML =
    "";


  mensagemSemResponsaveis.hidden =
    associadosCarregados.length > 0;


  associadosCarregados.forEach(
    (associado) => {

      listaResponsaveisResumoAssociados.appendChild(
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


  botaoSalvarResponsaveis.disabled =
    true;


  botaoSalvarResponsaveis.textContent =
    "SALVANDO...";


  try {

    const resultado =
      await window.supabaseClient
        .rpc(
          "salvar_responsaveis_resumo_associados",
          {
            p_usuarios:
              selecionados
          }
        );


    if (
      resultado.error
    ) {

      throw resultado.error;

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
      "Erro ao salvar responsáveis pelo resumo dos associados:",
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
   BLOQUEAR ACESSO SEM PERMISSÃO
========================================== */

function bloquearPaginaSemPermissao() {

  listaResponsaveisResumoAssociados.innerHTML =
    `
      <p>
        Você não possui permissão para
        gerenciar os responsáveis pelo
        resumo dos associados.
      </p>
    `;


  mensagemSemResponsaveis.hidden =
    true;


  botaoSalvarResponsaveis.hidden =
    true;
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

    const podeGerenciar =
      await verificarPermissaoGerenciamento();


    if (
      !podeGerenciar
    ) {

      bloquearPaginaSemPermissao();

      return;
    }


    await carregarResponsaveisAtuais();


    await carregarAssociados();


  } catch (erro) {

    console.error(
      "Erro ao carregar responsáveis pelo resumo dos associados:",
      erro
    );


    listaResponsaveisResumoAssociados.innerHTML =
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
