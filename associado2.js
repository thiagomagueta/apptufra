"use strict";

const CHAVE_FICHA = "tufra_ficha_associado";
const CHAVE_USUARIO = "tufra_usuario_logado";

const formulario = document.getElementById("formularioAssociado2");

const campoCEP = document.getElementById("cepAssociado");
const campoEndereco = document.getElementById("enderecoAssociado");
const campoNumero = document.getElementById("numeroAssociado");
const campoComplemento = document.getElementById("complementoAssociado");
const campoBairro = document.getElementById("bairroAssociado");
const campoCidade = document.getElementById("cidadeAssociado");
const campoEstado = document.getElementById("estadoAssociado");
const campoTelefoneFixo = document.getElementById(
  "telefoneFixoAssociado"
);
const campoCelular = document.getElementById("celularAssociado");
const campoEmail = document.getElementById("emailAssociado");

const mensagemCEP = document.getElementById("mensagemBuscaCep");

function somenteNumeros(valor) {
  return String(valor ?? "").replace(/\D/g, "");
}

function formatarCEP(valor) {
  const numeros = somenteNumeros(valor).slice(0, 8);

  if (numeros.length <= 5) {
    return numeros;
  }

  return `${numeros.slice(0, 5)}-${numeros.slice(5)}`;
}

function formatarTelefoneFixo(valor) {
  const numeros = somenteNumeros(valor).slice(0, 10);

  if (numeros.length <= 2) {
    return numeros;
  }

  if (numeros.length <= 6) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  }

  return (
    `(${numeros.slice(0, 2)}) ` +
    `${numeros.slice(2, 6)}-` +
    `${numeros.slice(6)}`
  );
}

function formatarCelular(valor) {
  const numeros = somenteNumeros(valor).slice(0, 11);

  if (numeros.length <= 2) {
    return numeros;
  }

  if (numeros.length <= 7) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  }

  return (
    `(${numeros.slice(0, 2)}) ` +
    `${numeros.slice(2, 7)}-` +
    `${numeros.slice(7)}`
  );
}

function carregarObjeto(chave) {
  try {
    const dados = sessionStorage.getItem(chave);
    return dados ? JSON.parse(dados) : {};
  } catch (erro) {
    console.error("Erro ao carregar dados:", erro);
    return {};
  }
}

function mostrarMensagemCEP(texto, tipo = "") {
  mensagemCEP.textContent = texto;
  mensagemCEP.className = "mensagem-busca-cep";

  if (tipo) {
    mensagemCEP.classList.add(tipo);
  }
}

function limparEndereco() {
  campoEndereco.value = "";
  campoBairro.value = "";
  campoCidade.value = "";
  campoEstado.value = "";
}

async function buscarCEP() {
  const cep = somenteNumeros(campoCEP.value);

  if (cep.length !== 8) {
    mostrarMensagemCEP("");
    return;
  }

  mostrarMensagemCEP("Buscando endereço...");

  campoCEP.disabled = true;

  try {
    const resposta = await fetch(
      `https://viacep.com.br/ws/${cep}/json/`
    );

    if (!resposta.ok) {
      throw new Error("Falha na consulta do CEP.");
    }

    const dados = await resposta.json();

    if (dados.erro) {
      limparEndereco();
      mostrarMensagemCEP(
        "CEP não encontrado. Confira os números informados.",
        "mensagem-cep-erro"
      );
      return;
    }

    campoEndereco.value = dados.logradouro || "";
    campoBairro.value = dados.bairro || "";
    campoCidade.value = dados.localidade || "";
    campoEstado.value = dados.uf || "";

    mostrarMensagemCEP(
      "Endereço encontrado.",
      "mensagem-cep-sucesso"
    );

    if (campoEndereco.value) {
      campoNumero.focus();
    } else {
      campoEndereco.focus();
    }
  } catch (erro) {
    console.error("Erro ao buscar CEP:", erro);

    mostrarMensagemCEP(
      "Não foi possível consultar o CEP. Preencha o endereço manualmente.",
      "mensagem-cep-erro"
    );
  } finally {
    campoCEP.disabled = false;
  }
}

function preencherDadosAnteriores() {
  const ficha = carregarObjeto(CHAVE_FICHA);
  const usuario = carregarObjeto(CHAVE_USUARIO);
  const dados = ficha.enderecoContato ?? {};

  campoCEP.value = dados.cep ?? "";
  campoEndereco.value = dados.endereco ?? "";
  campoNumero.value = dados.numero ?? "";
  campoComplemento.value = dados.complemento ?? "";
  campoBairro.value = dados.bairro ?? "";
  campoCidade.value = dados.cidade ?? "";
  campoEstado.value = dados.estado ?? "";
  campoTelefoneFixo.value = dados.telefoneFixo ?? "";

campoCelular.value =
  dados.celular ||
  usuario.telefone ||
  "";

campoEmail.value =
  dados.email ||
  usuario.email ||
  "";

  campoCEP.value = formatarCEP(campoCEP.value);
  campoTelefoneFixo.value = formatarTelefoneFixo(
    campoTelefoneFixo.value
  );
  campoCelular.value = formatarCelular(campoCelular.value);
}

function limparErros() {
  formulario
    .querySelectorAll(".mensagem-campo")
    .forEach((elemento) => {
      elemento.textContent = "";
    });
}

function mostrarErro(id, mensagem) {
  document.getElementById(id).textContent = mensagem;
}

function validarFormulario() {
  limparErros();

  let valido = true;

  const campos = [
    [campoCEP, "erroCepAssociado", "Informe o CEP."],
    [
      campoEndereco,
      "erroEnderecoAssociado",
      "Informe o endereço."
    ],
    [campoNumero, "erroNumeroAssociado", "Informe o número."],
    [campoBairro, "erroBairroAssociado", "Informe o bairro."],
    [campoCidade, "erroCidadeAssociado", "Informe a cidade."],
    [campoEstado, "erroEstadoAssociado", "Selecione o estado."],
  
    [campoCelular, "erroCelularAssociado", "Informe o celular."],
    [campoEmail, "erroEmailAssociado", "Informe o e-mail."]
  ];

  campos.forEach(([campo, erroId, mensagem]) => {
    if (!campo.value.trim()) {
      mostrarErro(erroId, mensagem);
      valido = false;
    }
  });

  if (
    campoCEP.value &&
    somenteNumeros(campoCEP.value).length !== 8
  ) {
    mostrarErro(
      "erroCepAssociado",
      "O CEP deve possuir 8 números."
    );
    valido = false;
  }

  if (
    campoTelefoneFixo.value &&
    somenteNumeros(campoTelefoneFixo.value).length !== 10
  ) {
    mostrarErro(
      "erroTelefoneFixoAssociado",
      "Informe o telefone com DDD."
    );
    valido = false;
  }

  if (
    campoCelular.value &&
    somenteNumeros(campoCelular.value).length !== 11
  ) {
    mostrarErro(
      "erroCelularAssociado",
      "Informe o celular com DDD."
    );
    valido = false;
  }

  if (
    campoEmail.value &&
    !campoEmail.checkValidity()
  ) {
    mostrarErro(
      "erroEmailAssociado",
      "Informe um e-mail válido."
    );
    valido = false;
  }

  return valido;
}

function salvarEtapa(evento) {
  evento.preventDefault();

  if (!validarFormulario()) {
    return;
  }

  const ficha = carregarObjeto(CHAVE_FICHA);

  ficha.enderecoContato = {
    cep: campoCEP.value,
    endereco: campoEndereco.value.trim(),
    numero: campoNumero.value.trim(),
    complemento: campoComplemento.value.trim(),
    bairro: campoBairro.value.trim(),
    cidade: campoCidade.value.trim(),
    estado: campoEstado.value,
    telefoneFixo: campoTelefoneFixo.value,
    celular: campoCelular.value,
    email: campoEmail.value.trim()
  };

  sessionStorage.setItem(
    CHAVE_FICHA,
    JSON.stringify(ficha)
  );

  window.location.href = "associado3.html";
}

campoCEP.addEventListener("input", () => {
  campoCEP.value = formatarCEP(campoCEP.value);

  if (somenteNumeros(campoCEP.value).length === 8) {
    buscarCEP();
  } else {
    mostrarMensagemCEP("");
  }
});

campoCEP.addEventListener("blur", buscarCEP);

campoTelefoneFixo.addEventListener("input", () => {
  campoTelefoneFixo.value = formatarTelefoneFixo(
    campoTelefoneFixo.value
  );
});

campoCelular.addEventListener("input", () => {
  campoCelular.value = formatarCelular(
    campoCelular.value
  );
});

formulario.addEventListener("submit", salvarEtapa);

preencherDadosAnteriores();
