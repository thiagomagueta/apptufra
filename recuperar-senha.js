"use strict";


const formularioRecuperarSenha =
  document.getElementById(
    "formularioRecuperarSenha"
  );


const campoEmailRecuperacao =
  document.getElementById(
    "emailRecuperacao"
  );


const mensagemRecuperacaoSenha =
  document.getElementById(
    "mensagemRecuperacaoSenha"
  );


const botaoEnviarRecuperacao =
  document.getElementById(
    "botaoEnviarRecuperacao"
  );


function mostrarMensagemRecuperacao(
  texto
) {

  mensagemRecuperacaoSenha.textContent =
    texto;

}


function limparMensagemRecuperacao() {

  mensagemRecuperacaoSenha.textContent =
    "";

}


async function enviarRecuperacaoSenha(
  evento
) {

  evento.preventDefault();


  limparMensagemRecuperacao();


  const email =
    campoEmailRecuperacao.value
      .trim()
      .toLowerCase();


  if (
    !email
  ) {

    mostrarMensagemRecuperacao(
      "Informe seu e-mail."
    );


    campoEmailRecuperacao.focus();


    return;

  }


  if (
    !window.supabaseClient
  ) {

    mostrarMensagemRecuperacao(
      "Não foi possível conectar ao sistema."
    );


    return;

  }


  botaoEnviarRecuperacao.disabled =
    true;


  botaoEnviarRecuperacao.textContent =
    "ENVIANDO...";


  try {

    const resultado =
      await window.supabaseClient.auth
        .resetPasswordForEmail(
          email,
          {
            redirectTo:
              "https://apptufra.tufra.workers.dev/nova-senha.html"
          }
        );


    if (
      resultado.error
    ) {

      throw resultado.error;

    }


    mostrarMensagemRecuperacao(
      "Se este e-mail estiver cadastrado, você receberá uma mensagem para criar uma nova senha."
    );


    botaoEnviarRecuperacao.textContent =
      "E-mail enviado";


  } catch (erro) {

    console.error(
      "Erro ao solicitar recuperação de senha:",
      erro
    );


    mostrarMensagemRecuperacao(
      "Não foi possível enviar a recuperação de senha. Tente novamente."
    );


    botaoEnviarRecuperacao.disabled =
      false;


    botaoEnviarRecuperacao.textContent =
      "Enviar recuperação";

  }

}


formularioRecuperarSenha.addEventListener(
  "submit",
  enviarRecuperacaoSenha
);


campoEmailRecuperacao.addEventListener(
  "input",
  limparMensagemRecuperacao
);
