"use strict";

const CHAVE_FICHA = "tufra_ficha_associado";
const CHAVE_USUARIO = "tufra_usuario_logado";

const formulario = document.getElementById("formularioAssociado1");
const campoNome = document.getElementById("associadoNome");
const campoNascimento = document.getElementById("associadoNascimento");
const campoIdade = document.getElementById("idadeAssociado");
const campoCidadeNascimento = document.getElementById("cidadeNascimento");
const campoEstadoNascimento = document.getElementById("estadoNascimento");
const campoGenero = document.getElementById("generoAssociado");
const areaGeneroOutro = document.getElementById("campoGeneroOutro");
const campoGeneroOutro = document.getElementById("generoAutodeclarado");
const campoNacionalidade = document.getElementById("nacionalidadeAssociado");
const campoRG = document.getElementById("rgAssociado");
const campoCPF = document.getElementById("cpfAssociado");

function somenteNumeros(valor) {
  return String(valor ?? "").replace(/\D/g, "");
}

function formatarData(valor) {
  const numeros = somenteNumeros(valor).slice(0, 8);

  if (numeros.length <= 2) {
    return numeros;
  }

  if (numeros.length <= 4) {
    return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
  }

  return (
    `${numeros.slice(0, 2)}/` +
    `${numeros.slice(2, 4)}/` +
    `${numeros.slice(4)}`
  );
}

function formatarCPF(valor) {
  const numeros = somenteNumeros(valor).slice(0, 11);

  if (numeros.length <= 3) {
    return numeros;
  }

  if (numeros.length <= 6) {
    return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
  }

  if (numeros.length <= 9) {
    return (
      `${numeros.slice(0, 3)}.` +
      `${numeros.slice(3, 6)}.` +
      `${numeros.slice(6)}`
    );
  }

  return (
    `${numeros.slice(0, 3)}.` +
    `${numeros.slice(3, 6)}.` +
    `${numeros.slice(6, 9)}-` +
    `${numeros.slice(9)}`
  );
}

function formatarRG(valor) {
  return String(valor ?? "")
    .toUpperCase()
    .replace(/[^0-9A-Z.\-\s]/g, "")
    .slice(0, 20);
}

function converterData(valor) {
  const partes = String(valor).split("/");

  if (partes.length !== 3) {
    return null;
  }

  const dia = Number(partes[0]);
  const mes = Number(partes[1]);
  const ano = Number(partes[2]);

  if (!dia || !mes || !ano || ano < 1900) {
    return null;
  }

  const data = new Date(ano, mes - 1, dia);

  if (
    data.getDate() !== dia ||
    data.getMonth() !== mes - 1 ||
    data.getFullYear() !== ano
  ) {
    return null;
  }

  return data;
}

function calcularIdade(valor) {
  const nascimento = converterData(valor);

  if (!nascimento || nascimento > new Date()) {
    return "";
  }

  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();

  const aniversarioPendente =
    hoje.getMonth() < nascimento.getMonth() ||
    (
      hoje.getMonth() === nascimento.getMonth() &&
      hoje.getDate() < nascimento.getDate()
    );

  if (aniversarioPendente) {
    idade--;
  }

  return idade;
}

function carregarObjeto(chave) {
  try {
    const dados = sessionStorage.getItem(chave);
    return dados ? JSON.parse(dados) : {};
  } catch {
    return {};
  }
}

function controlarGeneroOutro() {
  const mostrar =
    campoGenero.value === "Outro / Autodeclarado";

  areaGeneroOutro.hidden = !mostrar;
  campoGeneroOutro.required = mostrar;

  if (!mostrar) {
    campoGeneroOutro.value = "";
  }
}

function atualizarNascimento() {
  campoNascimento.value = formatarData(campoNascimento.value);
  campoIdade.value = calcularIdade(campoNascimento.value);
}

function preencherDados() {
  const usuario = carregarObjeto(CHAVE_USUARIO);
  const ficha = carregarObjeto(CHAVE_FICHA);
  const dados = ficha.dadosPessoais ?? {};

  campoNome.value =
    dados.nome ?? usuario.nomeCompleto ?? "";

  campoNascimento.value =
    dados.nascimento ?? usuario.dataNascimento ?? "";

  campoCidadeNascimento.value =
    dados.cidadeNascimento ?? "";

  campoEstadoNascimento.value =
    dados.estadoNascimento ?? "";

  campoGenero.value =
    dados.genero ?? "";

  campoGeneroOutro.value =
    dados.generoAutodeclarado ?? "";

  campoNacionalidade.value =
    dados.nacionalidade ?? "Brasileira";

  campoRG.value =
    dados.rg ?? "";

  campoCPF.value =
    dados.cpf ?? usuario.cpf ?? "";

  campoNascimento.value = formatarData(campoNascimento.value);
  campoCPF.value = formatarCPF(campoCPF.value);

  controlarGeneroOutro();
  campoIdade.value = calcularIdade(campoNascimento.value);
}

function salvarEtapa(evento) {
  evento.preventDefault();

  if (!formulario.checkValidity()) {
    formulario.reportValidity();
    return;
  }

  if (!converterData(campoNascimento.value)) {
    document.getElementById("erroAssociadoNascimento").textContent =
      "Informe uma data válida.";
    return;
  }

  if (somenteNumeros(campoCPF.value).length !== 11) {
    document.getElementById("erroCpfAssociado").textContent =
      "O CPF deve possuir 11 números.";
    return;
  }

  const ficha = carregarObjeto(CHAVE_FICHA);

  ficha.dadosPessoais = {
    nome: campoNome.value.trim(),
    nascimento: campoNascimento.value,
    idade: Number(campoIdade.value),
    cidadeNascimento: campoCidadeNascimento.value.trim(),
    estadoNascimento: campoEstadoNascimento.value,
    genero: campoGenero.value,
    generoAutodeclarado:
      campoGenero.value === "Outro / Autodeclarado"
        ? campoGeneroOutro.value.trim()
        : "",
    nacionalidade: campoNacionalidade.value.trim(),
    rg: campoRG.value.trim(),
    cpf: campoCPF.value
  };

  sessionStorage.setItem(CHAVE_FICHA, JSON.stringify(ficha));

  window.location.href = "associado2.html";
}

campoNascimento.addEventListener("input", atualizarNascimento);
campoNascimento.addEventListener("blur", atualizarNascimento);

campoCPF.addEventListener("input", () => {
  campoCPF.value = formatarCPF(campoCPF.value);
});

campoRG.addEventListener("input", () => {
  campoRG.value = formatarRG(campoRG.value);
});

campoGenero.addEventListener("change", controlarGeneroOutro);
formulario.addEventListener("submit", salvarEtapa);

function configurarBotaoVoltarOuSair() {
  const botao = document.getElementById(
    "botaoVoltarOuSair"
  );

  if (!botao) {
    return;
  }

  const parametros = new URLSearchParams(
    window.location.search
  );

  const modoEdicao =
    parametros.get("modo") === "edicao";

  if (modoEdicao) {
    botao.textContent = "Voltar";
    botao.href = "minha-ficha.html";
  }
}

configurarBotaoVoltarOuSair();

preencherDados();
