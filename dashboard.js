"use strict";

const saudacaoDashboard = document.getElementById(
  "saudacaoDashboard"
);

function carregarUsuarioLogado() {
  try {
    const dados = sessionStorage.getItem(
      "tufra_usuario_logado"
    );

    return dados ? JSON.parse(dados) : {};
  } catch (erro) {
    console.error(
      "Erro ao carregar usuário logado:",
      erro
    );

    return {};
  }
}

function obterPrimeiroNome(nomeCompleto) {
  const nome = String(nomeCompleto || "").trim();

  if (!nome) {
    return "";
  }

  return nome.split(/\s+/)[0];
}

function obterSaudacaoPorHorario() {
  const horaAtual = new Date().getHours();

  if (horaAtual >= 5 && horaAtual < 12) {
    return "Bom dia com muita alegria";
  }

  if (horaAtual >= 12 && horaAtual < 18) {
    return "Boa tarde com muita alegria";
  }

  return "Boa noite com muita alegria";
}

function atualizarSaudacao() {
  const usuario = carregarUsuarioLogado();

  const primeiroNome = obterPrimeiroNome(
    usuario.nomeCompleto
  );

  const saudacao = obterSaudacaoPorHorario();

  saudacaoDashboard.textContent = primeiroNome
    ? `${saudacao}, ${primeiroNome}!`
    : `${saudacao}!`;
}

atualizarSaudacao();
