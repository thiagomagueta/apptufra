"use strict";

const formularioDadosAcesso = document.getElementById(
  "formularioDadosAcesso"
);

const campoNomeUsuario = document.getElementById(
  "nomeUsuario"
);

const campoNovaSenha = document.getElementById(
  "novaSenha"
);

const campoConfirmarSenha = document.getElementById(
  "confirmarSenha"
);

const botaoMostrarNovaSenha = document.getElementById(
  "mostrarNovaSenha"
);

const botaoMostrarConfirmacao = document.getElementById(
  "mostrarConfirmacaoSenha"
);

const aceiteTermos = document.getElementById(
  "aceiteTermos"
);

const erroUsuario = document.getElementById(
  "erroUsuario"
);

const erroSenha = document.getElementById(
  "erroSenha"
);

const erroConfirmacao = document.getElementById(
  "erroConfirmacao"
);

const erroTermos = document.getElementById(
  "erroTermos"
);

const botaoSolicitar = document.querySelector(
  ".botao-solicitar"
);

function limparMensagem(elemento) {
  if (elemento) {
    elemento.textContent = "";
  }
}

function mostrarMensagem(elemento, texto) {
  if (elemento) {
    elemento.textContent = texto;
  }
}

function alternarSenha(campo, botao) {
  const senhaOculta =
    campo.type === "password";

  campo.type =
    senhaOculta ? "text" : "password";

  botao.textContent =
    senhaOculta ? "🙈" : "👁";

  botao.setAttribute(
    "aria-label",
    senhaOculta
      ? "Ocultar senha"
      : "Mostrar senha"
  );
}

function validarNomeUsuario() {
  const nomeUsuario =
    campoNomeUsuario.value.trim();

  limparMensagem(erroUsuario);

  if (!nomeUsuario) {
    mostrarMensagem(
      erroUsuario,
      "Informe um nome de usuário."
    );

    return false;
  }

  if (nomeUsuario.includes(" ")) {
    mostrarMensagem(
      erroUsuario,
      "O nome de usuário não pode conter espaços."
    );

    return false;
  }

  if (nomeUsuario.length < 3) {
    mostrarMensagem(
      erroUsuario,
      "O nome de usuário deve possuir pelo menos 3 caracteres."
    );

    return false;
  }

  return true;
}

function validarSenha() {
  const senha = campoNovaSenha.value;

  limparMensagem(erroSenha);

  if (!senha) {
    mostrarMensagem(
      erroSenha,
      "Informe uma senha."
    );

    return false;
  }

  if (senha.length < 6) {
    mostrarMensagem(
      erroSenha,
      "A senha deve possuir pelo menos 6 caracteres."
    );

    return false;
  }

  return true;
}

function validarConfirmacaoSenha() {
  const senha = campoNovaSenha.value;
  const confirmacao =
    campoConfirmarSenha.value;

  limparMensagem(erroConfirmacao);

  erroConfirmacao.classList.remove(
    "mensagem-sucesso"
  );

  if (!confirmacao) {
    mostrarMensagem(
      erroConfirmacao,
      "Confirme a senha."
    );

    return false;
  }

  if (senha !== confirmacao) {
    mostrarMensagem(
      erroConfirmacao,
      "As senhas são diferentes."
    );

    return false;
  }

  mostrarMensagem(
    erroConfirmacao,
    "As senhas coincidem."
  );

  erroConfirmacao.classList.add(
    "mensagem-sucesso"
  );

  return true;
}

function validarTermos() {
  limparMensagem(erroTermos);

  if (!aceiteTermos.checked) {
    mostrarMensagem(
      erroTermos,
      "Você precisa aceitar os termos."
    );

    return false;
  }

  return true;
}

function atualizarEstadoBotao() {
  botaoSolicitar.disabled =
    !aceiteTermos.checked;
}

function obterDadosPessoais() {
  try {
    const dadosSalvos =
      sessionStorage.getItem(
        "tufra_dados_pessoais"
      );

    return dadosSalvos
      ? JSON.parse(dadosSalvos)
      : null;
  } catch (erro) {
    console.error(
      "Erro ao carregar os dados pessoais:",
      erro
    );

    return null;
  }
}

function enviarSolicitacao(evento) {
  evento.preventDefault();

  erroConfirmacao.classList.remove(
    "mensagem-sucesso"
  );

  const usuarioValido =
    validarNomeUsuario();

  const senhaValida =
    validarSenha();

  const confirmacaoValida =
    validarConfirmacaoSenha();

  const termosValidos =
    validarTermos();

  if (
    !usuarioValido ||
    !senhaValida ||
    !confirmacaoValida ||
    !termosValidos
  ) {
    return;
  }

  const dadosPessoais =
    obterDadosPessoais();

  if (
    !dadosPessoais ||
    !dadosPessoais.nomeCompleto ||
    !dadosPessoais.email ||
    !dadosPessoais.cpf
  ) {
    mostrarMensagem(
      erroUsuario,
      "Os dados da primeira etapa não foram encontrados. Volte e preencha novamente."
    );

    return;
  }

  const nomeUsuario =
    campoNomeUsuario.value
      .trim()
      .toLowerCase();

  const cadastroPendente = {
    ...dadosPessoais,

    nomeUsuario,

    senha:
      campoNovaSenha.value,

    fotoToken:
      crypto.randomUUID()
  };

  sessionStorage.setItem(
    "tufra_cadastro_pendente",
    JSON.stringify(cadastroPendente)
  );

  window.location.href =
    "cadastro-foto.html";
}

botaoMostrarNovaSenha.addEventListener(
  "click",
  () => {
    alternarSenha(
      campoNovaSenha,
      botaoMostrarNovaSenha
    );
  }
);

botaoMostrarConfirmacao.addEventListener(
  "click",
  () => {
    alternarSenha(
      campoConfirmarSenha,
      botaoMostrarConfirmacao
    );
  }
);

campoNomeUsuario.addEventListener(
  "input",
  () => {
    limparMensagem(erroUsuario);
  }
);

campoNovaSenha.addEventListener(
  "input",
  () => {
    limparMensagem(erroSenha);
    limparMensagem(erroConfirmacao);

    erroConfirmacao.classList.remove(
      "mensagem-sucesso"
    );
  }
);

campoConfirmarSenha.addEventListener(
  "input",
  () => {
    limparMensagem(erroConfirmacao);

    erroConfirmacao.classList.remove(
      "mensagem-sucesso"
    );

    if (
      campoConfirmarSenha.value &&
      campoNovaSenha.value ===
        campoConfirmarSenha.value
    ) {
      mostrarMensagem(
        erroConfirmacao,
        "As senhas coincidem."
      );

      erroConfirmacao.classList.add(
        "mensagem-sucesso"
      );
    }
  }
);

aceiteTermos.addEventListener(
  "change",
  () => {
    limparMensagem(erroTermos);
    atualizarEstadoBotao();
  }
);

formularioDadosAcesso.addEventListener(
  "submit",
  enviarSolicitacao
);

atualizarEstadoBotao();
