"use strict";

async function obterSessaoAtual() {
  if (!window.supabaseClient) {
    return null;
  }

  const resultado =
    await window.supabaseClient.auth.getSession();

  if (resultado.error) {
    console.error(
      "Erro ao verificar sessão:",
      resultado.error
    );

    return null;
  }

  return resultado.data.session;
}

async function verificarUsuarioLogado() {
  const sessao = await obterSessaoAtual();

  if (!sessao) {
    sessionStorage.clear();
    window.location.href = "index.html";
    return false;
  }

  return true;
}

async function sairDoAplicativo() {
  const confirmar = window.confirm(
    "Deseja realmente sair do aplicativo?"
  );

  if (!confirmar) {
    return;
  }

  try {
    if (window.supabaseClient) {
      await window.supabaseClient.auth.signOut();
    }
  } catch (erro) {
    console.error(
      "Erro ao encerrar sessão:",
      erro
    );
  } finally {
    sessionStorage.clear();
    window.location.href = "index.html";
  }
}

function configurarBotaoSair() {
  const botaoSair = document.getElementById(
    "botaoSair"
  );

  if (!botaoSair) {
    return;
  }

  botaoSair.addEventListener(
    "click",
    (evento) => {
      evento.preventDefault();
      sairDoAplicativo();
    }
  );
}

document.addEventListener(
  "DOMContentLoaded",
  async () => {
    const usuarioValido =
      await verificarUsuarioLogado();

    if (!usuarioValido) {
      return;
    }

    configurarBotaoSair();
  }
);
