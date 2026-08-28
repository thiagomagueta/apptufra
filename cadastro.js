"use strict";

const campoCPF = document.getElementById("cpf");
const campoDataNascimento = document.getElementById("dataNascimento");
const campoTelefone = document.getElementById("telefone");
const campoEmail = document.getElementById("email");
const campoConfirmarEmail = document.getElementById(
  "confirmarEmail"
);
const erroConfirmarEmail = document.getElementById(
  "erroConfirmarEmail"
);

const CHAVE_DADOS_PESSOAIS =
  "tufra_dados_pessoais";

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

campoConfirmarEmail.addEventListener(
  "paste",
  (evento) => {
    evento.preventDefault();

    erroConfirmarEmail.textContent =
      "Digite novamente seu e-mail para confirmação.";
  }
);

campoConfirmarEmail.addEventListener(
  "drop",
  (evento) => {
    evento.preventDefault();

    erroConfirmarEmail.textContent =
      "Digite novamente seu e-mail para confirmação.";
  }
);

campoConfirmarEmail.addEventListener(
  "input",
  () => {
    erroConfirmarEmail.textContent = "";
  }
);

const formularioDadosPessoais = document.getElementById(
  "formularioDadosPessoais"
);

formularioDadosPessoais.addEventListener(
  "submit",
  (evento) => {
    evento.preventDefault();

    const email = campoEmail.value.trim();
    const confirmarEmail =
      campoConfirmarEmail.value.trim();

    if (
      email.toLowerCase() !==
      confirmarEmail.toLowerCase()
    ) {
      erroConfirmarEmail.textContent =
        "Os e-mails informados não são iguais. Confira e tente novamente.";

      campoConfirmarEmail.focus();

      return;
    }

    erroConfirmarEmail.textContent = "";

    const dadosPessoais = {
      nomeCompleto:
        document
          .getElementById("nomeCompleto")
          .value
          .trim(),

      cpf:
        campoCPF.value,

      dataNascimento:
        campoDataNascimento.value,

      telefone:
        campoTelefone.value,

      email:
        email
    };

    localStorage.setItem(
      CHAVE_DADOS_PESSOAIS,
      JSON.stringify(dadosPessoais)
    );

    window.location.href =
      "cadastro2.html";
  }
);
