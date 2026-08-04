"use strict";

const campoCPF = document.getElementById("cpf");
const campoDataNascimento = document.getElementById("dataNascimento");
const campoTelefone = document.getElementById("telefone");

function somenteNumeros(valor) {
  return valor.replace(/\D/g, "");
}

function formatarCPF(valor) {
  const numeros = somenteNumeros(valor).slice(0, 11);

  return numeros
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function formatarData(valor) {
  const numeros = somenteNumeros(valor).slice(0, 8);

  return numeros
    .replace(/^(\d{2})(\d)/, "$1/$2")
    .replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
}

function formatarTelefone(valor) {
  const numeros = somenteNumeros(valor).slice(0, 11);

  if (numeros.length <= 10) {
    return numeros
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return numeros
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

campoCPF.addEventListener("input", () => {
  campoCPF.value = formatarCPF(campoCPF.value);
});

campoDataNascimento.addEventListener("input", () => {
  campoDataNascimento.value = formatarData(
    campoDataNascimento.value
  );
});

campoTelefone.addEventListener("input", () => {
  campoTelefone.value = formatarTelefone(
    campoTelefone.value
  );
});
const formularioDadosPessoais = document.getElementById(
  "formularioDadosPessoais"
);

formularioDadosPessoais.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const dadosPessoais = {
    nomeCompleto: document.getElementById("nomeCompleto").value.trim(),
    cpf: campoCPF.value,
    dataNascimento: campoDataNascimento.value,
    telefone: campoTelefone.value,
    email: document.getElementById("email").value.trim()
  };

  sessionStorage.setItem(
    "tufra_dados_pessoais",
    JSON.stringify(dadosPessoais)
  );

  window.location.href = "cadastro2.html";
});
