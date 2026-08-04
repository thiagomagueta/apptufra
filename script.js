"use strict";

const formularioLogin = document.getElementById("formularioLogin");
const campoLogin = document.getElementById("login");
const campoSenha = document.getElementById("senha");
const botaoMostrarSenha = document.getElementById("botaoMostrarSenha");
const mensagemLogin = document.getElementById("mensagemLogin");
const linkEsqueciSenha = document.getElementById("linkEsqueciSenha");
const linkCadastrar = document.getElementById("linkCadastrar");

function limparMensagem() {
  mensagemLogin.textContent = "";
}

function mostrarMensagem(texto) {
  mensagemLogin.textContent = texto;
}

function alternarVisibilidadeSenha() {
  const senhaEstaOculta = campoSenha.type === "password";

  campoSenha.type = senhaEstaOculta ? "text" : "password";

  botaoMostrarSenha.textContent = senhaEstaOculta ? "🙈" : "👁";

  botaoMostrarSenha.setAttribute(
    "aria-label",
    senhaEstaOculta ? "Ocultar senha" : "Mostrar senha"
  );
}

function validarLogin(evento) {
  evento.preventDefault();

  limparMensagem();

  const login = campoLogin.value.trim();
  const senha = campoSenha.value.trim();

  if (!login && !senha) {
    mostrarMensagem("Informe seu e-mail ou CPF e sua senha.");
    campoLogin.focus();
    return;
  }

  if (!login) {
    mostrarMensagem("Informe seu e-mail ou CPF.");
    campoLogin.focus();
    return;
  }

  if (!senha) {
    mostrarMensagem("Informe sua senha.");
    campoSenha.focus();
    return;
  }

  mostrarMensagem(
    "Tela de login criada com sucesso. A autenticação será conectada posteriormente."
  );
}

function abrirRecuperacaoSenha(evento) {
  evento.preventDefault();

  alert(
    "A tela de recuperação de senha será criada em uma próxima etapa."
  );
}

function abrirCadastro(evento) {
  evento.preventDefault();

  alert(
    "A tela para criar um novo cadastro será desenvolvida depois da tela de login."
  );
}

botaoMostrarSenha.addEventListener(
  "click",
  alternarVisibilidadeSenha
);

formularioLogin.addEventListener(
  "submit",
  validarLogin
);

linkEsqueciSenha.addEventListener(
  "click",
  abrirRecuperacaoSenha
);

linkCadastrar.addEventListener(
  "click",
  abrirCadastro
);

campoLogin.addEventListener("input", limparMensagem);
campoSenha.addEventListener("input", limparMensagem);
