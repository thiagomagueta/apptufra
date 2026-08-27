"use strict";


const formularioNovaSenha =
  document.getElementById(
    "formularioNovaSenha"
  );


const campoNovaSenha =
  document.getElementById(
    "novaSenha"
  );


const campoConfirmarNovaSenha =
  document.getElementById(
    "confirmarNovaSenha"
  );


const botaoMostrarNovaSenha =
  document.getElementById(
    "botaoMostrarNovaSenha"
  );


const botaoMostrarConfirmacaoSenha =
  document.getElementById(
    "botaoMostrarConfirmacaoSenha"
  );


const botaoSalvarNovaSenha =
  document.getElementById(
    "botaoSalvarNovaSenha"
  );


const mensagemNovaSenha =
  document.getElementById(
    "mensagemNovaSenha"
  );


let recuperacaoValida =
  false;


/* ==========================================
   MENSAGENS
========================================== */

function mostrarMensagemNovaSenha(
  texto
) {

  mensagemNovaSenha.textContent =
    texto;

}


function limparMensagemNovaSenha() {

  mensagemNovaSenha.textContent =
    "";

}


/* ==========================================
   MOSTRAR / OCULTAR SENHA
========================================== */

function alternarSenha(
  campo,
  botao
) {

  const estaOculta =
    campo.type ===
    "password";


  campo.type =
    estaOculta
      ? "text"
      : "password";


  botao.textContent =
    estaOculta
      ? "🙈"
      : "👁";


  botao.setAttribute(
    "aria-label",
    estaOculta
      ? "Ocultar senha"
      : "Mostrar senha"
  );

}


/* ==========================================
   VALIDAR LINK DE RECUPERAÇÃO
========================================== */

async function validarRecuperacaoSenha() {

  if (
    !window.supabaseClient
  ) {

    mostrarMensagemNovaSenha(
      "Não foi possível conectar ao sistema."
    );


    botaoSalvarNovaSenha.disabled =
      true;


    return;

  }


  try {

    /*
      O Supabase recebe os tokens de recuperação
      no endereço da página e cria a sessão
      automaticamente.
    */

    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          500
        )
    );


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

      recuperacaoValida =
        false;


      botaoSalvarNovaSenha.disabled =
        true;


      mostrarMensagemNovaSenha(
        "Este link de recuperação é inválido ou expirou. Solicite uma nova recuperação de senha."
      );


      return;

    }


    recuperacaoValida =
      true;


    botaoSalvarNovaSenha.disabled =
      false;


    limparMensagemNovaSenha();


  } catch (erro) {

    console.error(
      "Erro ao validar recuperação:",
      erro
    );


    recuperacaoValida =
      false;


    botaoSalvarNovaSenha.disabled =
      true;


    mostrarMensagemNovaSenha(
      "Não foi possível validar este link. Solicite uma nova recuperação de senha."
    );

  }

}


/* ==========================================
   SALVAR NOVA SENHA
========================================== */

async function salvarNovaSenha(
  evento
) {

  evento.preventDefault();


  limparMensagemNovaSenha();


  if (
    !recuperacaoValida
  ) {

    mostrarMensagemNovaSenha(
      "O link de recuperação não é mais válido."
    );


    return;

  }


  const novaSenha =
    campoNovaSenha.value;


  const confirmacao =
    campoConfirmarNovaSenha.value;


  if (
    !novaSenha
  ) {

    mostrarMensagemNovaSenha(
      "Informe a nova senha."
    );


    campoNovaSenha.focus();


    return;

  }


  if (
    novaSenha.length < 6
  ) {

    mostrarMensagemNovaSenha(
      "A nova senha deve possuir pelo menos 6 caracteres."
    );


    campoNovaSenha.focus();


    return;

  }


  if (
    !confirmacao
  ) {

    mostrarMensagemNovaSenha(
      "Confirme a nova senha."
    );


    campoConfirmarNovaSenha.focus();


    return;

  }


  if (
    novaSenha !==
    confirmacao
  ) {

    mostrarMensagemNovaSenha(
      "As senhas são diferentes."
    );


    campoConfirmarNovaSenha.focus();


    return;

  }


  botaoSalvarNovaSenha.disabled =
    true;


  botaoSalvarNovaSenha.textContent =
    "SALVANDO...";


  try {

    const resultado =
      await window.supabaseClient.auth
        .updateUser({
          password:
            novaSenha
        });


    if (
      resultado.error
    ) {

      throw resultado.error;

    }


    mostrarMensagemNovaSenha(
      "Senha alterada com sucesso."
    );


    botaoSalvarNovaSenha.textContent =
      "Senha alterada";


    /*
      Encerra a sessão temporária
      criada pelo link de recuperação.
    */

    await window.supabaseClient.auth
      .signOut();


    setTimeout(
      () => {

        window.location.href =
          "index.html";

      },
      1800
    );


  } catch (erro) {

    console.error(
      "Erro ao alterar senha:",
      erro
    );


    botaoSalvarNovaSenha.disabled =
      false;


    botaoSalvarNovaSenha.textContent =
      "Salvar nova senha";


    mostrarMensagemNovaSenha(
      "Não foi possível alterar sua senha. Solicite uma nova recuperação e tente novamente."
    );

  }

}


/* ==========================================
   EVENTOS
========================================== */

botaoMostrarNovaSenha.addEventListener(
  "click",
  () => {

    alternarSenha(
      campoNovaSenha,
      botaoMostrarNovaSenha
    );

  }
);


botaoMostrarConfirmacaoSenha.addEventListener(
  "click",
  () => {

    alternarSenha(
      campoConfirmarNovaSenha,
      botaoMostrarConfirmacaoSenha
    );

  }
);


campoNovaSenha.addEventListener(
  "input",
  limparMensagemNovaSenha
);


campoConfirmarNovaSenha.addEventListener(
  "input",
  limparMensagemNovaSenha
);


formularioNovaSenha.addEventListener(
  "submit",
  salvarNovaSenha
);


/* ==========================================
   INICIALIZAÇÃO
========================================== */

botaoSalvarNovaSenha.disabled =
  true;


validarRecuperacaoSenha();
