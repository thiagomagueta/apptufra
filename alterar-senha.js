"use strict";

const novaSenha = document.getElementById(
  "novaSenha"
);

const confirmarNovaSenha = document.getElementById(
  "confirmarNovaSenha"
);

const mensagemAlterarSenha = document.getElementById(
  "mensagemAlterarSenha"
);

const botaoAlterarSenha = document.getElementById(
  "botaoAlterarSenha"
);


function mostrarMensagem(texto) {
  mensagemAlterarSenha.textContent = texto;
  mensagemAlterarSenha.hidden = false;
}


function esconderMensagem() {
  mensagemAlterarSenha.textContent = "";
  mensagemAlterarSenha.hidden = true;
}


async function verificarSessao() {
  if (!window.supabaseClient) {
    mostrarMensagem(
      "Não foi possível conectar ao sistema."
    );

    return false;
  }

  try {
    const resultadoSessao =
      await window.supabaseClient.auth.getSession();

    if (resultadoSessao.error) {
      throw resultadoSessao.error;
    }

    const sessao =
      resultadoSessao.data.session;

    if (!sessao) {
      window.location.href = "index.html";
      return false;
    }

    return true;

  } catch (erro) {
    console.error(
      "Erro ao verificar sessão:",
      erro
    );

    mostrarMensagem(
      "Não foi possível verificar sua sessão."
    );

    return false;
  }
}


async function alterarSenha() {
  esconderMensagem();

  const senha =
    novaSenha.value.trim();

  const confirmacao =
    confirmarNovaSenha.value.trim();


  if (!senha) {
    mostrarMensagem(
      "Digite a nova senha."
    );

    novaSenha.focus();
    return;
  }


  if (senha.length < 6) {
    mostrarMensagem(
      "A nova senha deve ter pelo menos 6 caracteres."
    );

    novaSenha.focus();
    return;
  }


  if (!confirmacao) {
    mostrarMensagem(
      "Confirme a nova senha."
    );

    confirmarNovaSenha.focus();
    return;
  }


  if (senha !== confirmacao) {
    mostrarMensagem(
      "As senhas não são iguais."
    );

    confirmarNovaSenha.focus();
    return;
  }


  if (!window.supabaseClient) {
    mostrarMensagem(
      "Não foi possível conectar ao sistema."
    );

    return;
  }


  botaoAlterarSenha.disabled = true;

  botaoAlterarSenha.textContent =
    "ALTERANDO...";


  try {

    const resultado =
      await window.supabaseClient.auth.updateUser({
        password: senha
      });


    if (resultado.error) {
      throw resultado.error;
    }


    novaSenha.value = "";
    confirmarNovaSenha.value = "";


    mostrarMensagem(
      "Senha alterada com sucesso."
    );


    botaoAlterarSenha.textContent =
      "Senha alterada";


    setTimeout(() => {
      window.location.href =
        "minha-ficha.html";
    }, 1500);


  } catch (erro) {

    console.error(
      "Erro ao alterar senha:",
      erro
    );


    const codigo =
      erro?.code || "";

    const mensagem =
      (
        erro?.message || ""
      ).toLowerCase();


    if (
      codigo === "reauthentication_needed" ||
      mensagem.includes(
        "reauthentication"
      )
    ) {

      mostrarMensagem(
        "Por segurança, faça login novamente antes de alterar sua senha."
      );

    } else if (
      codigo === "same_password" ||
      mensagem.includes(
        "same password"
      )
    ) {

      mostrarMensagem(
        "A nova senha deve ser diferente da senha atual."
      );

    } else if (
      codigo === "weak_password" ||
      mensagem.includes(
        "weak password"
      )
    ) {

      mostrarMensagem(
        "A nova senha não atende aos requisitos de segurança."
      );

    } else {

      mostrarMensagem(
        "Não foi possível alterar a senha. Tente novamente."
      );

    }


    botaoAlterarSenha.disabled = false;

    botaoAlterarSenha.textContent =
      "Alterar senha";
  }
}


botaoAlterarSenha.addEventListener(
  "click",
  alterarSenha
);


verificarSessao();
