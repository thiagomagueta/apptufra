"use strict";

async function sairDoAplicativo() {
  const confirmouSaida = window.confirm(
    "Deseja realmente sair do aplicativo?"
  );

  if (!confirmouSaida) {
    return;
  }

  const botaoSair = document.getElementById("botaoSair");

  if (botaoSair) {
    botaoSair.style.pointerEvents = "none";

    const texto = botaoSair.querySelector(".texto-menu");

    if (texto) {
      texto.textContent = "Saindo...";
    }
  }

  try {
    if (!window.supabaseClient) {
      throw new Error(
        "O cliente do Supabase não foi inicializado."
      );
    }

    const resultado =
      await window.supabaseClient.auth.signOut();

    if (resultado.error) {
      throw resultado.error;
    }
  } catch (erro) {
    console.error(
      "Erro ao encerrar a sessão:",
      erro
    );
  } finally {
    sessionStorage.clear();
    localStorage.removeItem("tufra_usuario_logado");

    window.location.replace("index.html");
  }
}

function configurarBotaoSair() {
  const botaoSair = document.getElementById("botaoSair");

  if (!botaoSair) {
    console.error(
      "O botão Sair não foi encontrado na página."
    );

    return;
  }

  botaoSair.addEventListener("click", (evento) => {
    evento.preventDefault();
    sairDoAplicativo();
  });
}

configurarBotaoSair();
