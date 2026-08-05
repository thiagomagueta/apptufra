"use strict";

const CHAVE_FICHA_ASSOCIADO = "tufra_ficha_associado";
const CHAVE_CADASTRO_USUARIO = "tufra_cadastro_completo";

const formularioAssociado1 = document.getElementById(
  "formularioAssociado1"
);

const campoNome = document.getElementById("associadoNome");
const campoNascimento = document.getElementById(
  "associadoNascimento"
);
const campoIdade = document.getElementById("idadeAssociado");
const campoGenero = document.getElementById("generoAssociado");
const areaGeneroOutro = document.getElementById(
  "campoGeneroOutro"
);
const campoGeneroOutro = document.getElementById(
  "generoAutodeclarado"
);
const campoCPF = document.getElementById("cpfAssociado");

function somenteNumeros(valor) {
  return String(valor ?? "").replace(/\D/g, "");
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

function converterDataBrasileira(valor) {
  const partes = String(valor).split("/");

  if (partes.length !== 3) {
    return null;
  }

  const dia = Number(partes[0]);
  const mes = Number(partes[1]);
  const ano = Number(partes[2]);

  if (
    !dia ||
    !mes ||
    !ano ||
    ano < 1900 ||
    mes < 1 ||
    mes > 12
  ) {
    return null;
  }

  const data = new Date(ano, mes - 1, dia);

  if (
    data.getFullYear() !== ano ||
    data.getMonth() !== mes - 1 ||
    data.getDate() !== dia
  ) {
    return null;
  }

  return data;
}

function calcularIdade(valorData) {
  const nascimento = converterDataBrasileira(valorData);

  if (!nascimento) {
    return "";
  }

  const hoje = new Date();

  if (nascimento > hoje) {
    return "";
  }

  let idade = hoje.getFullYear() - nascimento.getFullYear();

  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (
      hoje.getMonth() === nascimento.getMonth() &&
      hoje.getDate() < nascimento.getDate()
    );

  if (aindaNaoFezAniversario) {
    idade--;
  }

  return idade >= 0 ? idade : "";
}

function carregarObjeto(chave) {
  try {
    const valor = sessionStorage.getItem(chave);

    return valor ? JSON.parse(valor) : {};
  } catch (erro) {
    console.error(`Erro ao carregar ${chave}:`, erro);
    return {};
  }
}

function salvarFicha(ficha) {
  sessionStorage.setItem(
    CHAVE_FICHA_ASSOCIADO,
    JSON.stringify(ficha)
  );
}

function obterFichaAtual() {
  const ficha = carregarObjeto(CHAVE_FICHA_ASSOCIADO);

  return {
    dadosPessoais: ficha.dadosPessoais ?? {},
    enderecoContato: ficha.enderecoContato ?? {},
    historicoUmbanda: ficha.historicoUmbanda ?? {},
    administrativo: ficha.administrativo ?? {}
  };
}

function preencherDadosAnteriores() {
  const cadastroUsuario = carregarObjeto(
    CHAVE_CADASTRO_USUARIO
  );

  const ficha = obterFichaAtual();
  const dados = ficha.dadosPessoais;

  campoNome.value =
    dados.nome ??
    cadastroUsuario.nomeCompleto ??
    "";

  campoNascimento.value =
    dados.nascimento ??
    cadastroUsuario.dataNascimento ??
    "";

  campoCPF.value =
    dados.cpf ??
    cadastroUsuario.cpf ??
    "";

  document.getElementById("cidadeNascimento").value =
    dados.cidadeNascimento ?? "";

  document.getElementById("estadoNascimento").value =
    dados.estadoNascimento ?? "";

  campoGenero.value = dados.genero ?? "";

  campoGeneroOutro.value =
    dados.generoAutodeclarado ?? "";

  document.getElementById("nacionalidadeAssociado").value =
    dados.nacionalidade ?? "Brasileira";

  document.getElementById("rgAssociado").value =
    dados.rg ?? "";

  controlarGeneroOutro();
  atualizarIdade();
}

function controlarGeneroOutro() {
  const outroSelecionado =
    campoGenero.value === "Outro / Autodeclarado";

  areaGeneroOutro.hidden = !outroSelecionado;
  campoGeneroOutro.required = outroSelecionado;

  if (!outroSelecionado) {
    campoGeneroOutro.value = "";
  }
}

function atualizarIdade() {
  campoIdade.value = calcularIdade(
    campoNascimento.value
  );
}

function obterValor(id) {
  return document.getElementById(id).value.trim();
}

function mostrarErro(id, texto) {
  document.getElementById(id).textContent = texto;
}

function limparErros() {
  document
    .querySelectorAll(".mensagem-campo")
    .forEach((elemento) => {
      elemento.textContent = "";
    });
}

function validarCampos() {
  limparErros();

  let valido = true;

  const validacoes = [
    [
      "associadoNome",
      "erroAssociadoNome",
      "Informe seu nome completo."
    ],
    [
      "associadoNascimento",
      "erroAssociadoNascimento",
      "Informe sua data de nascimento."
    ],
    [
      "cidadeNascimento",
      "erroCidadeNascimento",
      "Informe sua cidade de nascimento."
    ],
    [
      "estadoNascimento",
      "erroEstadoNascimento",
      "Selecione seu estado de nascimento."
    ],
    [
      "generoAssociado",
      "erroGeneroAssociado",
      "Selecione uma opção de gênero."
    ],
    [
      "nacionalidadeAssociado",
      "erroNacionalidadeAssociado",
      "Informe sua nacionalidade."
    ],
    [
      "rgAssociado",
      "erroRgAssociado",
      "Informe seu RG."
    ],
    [
      "cpfAssociado",
      "erroCpfAssociado",
      "Informe seu CPF."
    ]
  ];

  validacoes.forEach(([campoId, erroId, mensagem]) => {
    if (!obterValor(campoId)) {
      mostrarErro(erroId, mensagem);
      valido = false;
    }
  });

  if (
    campoNascimento.value &&
    !converterDataBrasileira(campoNascimento.value)
  ) {
    mostrarErro(
      "erroAssociadoNascimento",
      "Informe uma data válida."
    );

    valido = false;
  }

  if (
    campoGenero.value === "Outro / Autodeclarado" &&
    !campoGeneroOutro.value.trim()
  ) {
    mostrarErro(
      "erroGeneroOutro",
      "Informe como você se autodeclara."
    );

    valido = false;
  }

  if (somenteNumeros(campoCPF.value).length !== 11) {
    mostrarErro(
      "erroCpfAssociado",
      "O CPF deve possuir 11 números."
    );

    valido = false;
  }

  return valido;
}

function salvarPrimeiraEtapa(evento) {
  evento.preventDefault();

  if (!validarCampos()) {
    return;
  }

  const ficha = obterFichaAtual();

  ficha.dadosPessoais = {
    nome: obterValor("associadoNome"),
    nascimento: obterValor("associadoNascimento"),
    idade: Number(campoIdade.value),
    cidadeNascimento: obterValor("cidadeNascimento"),
    estadoNascimento: obterValor("estadoNascimento"),
    genero: obterValor("generoAssociado"),
    generoAutodeclarado:
      campoGenero.value === "Outro / Autodeclarado"
        ? campoGeneroOutro.value.trim()
        : "",
    nacionalidade: obterValor(
      "nacionalidadeAssociado"
    ),
    rg: obterValor("rgAssociado"),
    cpf: obterValor("cpfAssociado")
  };

  salvarFicha(ficha);

  window.location.href = "associado2.html";
}

campoNascimento.addEventListener("input", () => {
  campoNascimento.value = formatarData(
    campoNascimento.value
  );

  atualizarIdade();
});

campoCPF.addEventListener("input", () => {
  campoCPF.value = formatarCPF(campoCPF.value);
});

campoGenero.addEventListener(
  "change",
  controlarGeneroOutro
);

formularioAssociado1.addEventListener(
  "submit",
  salvarPrimeiraEtapa
);

preencherDadosAnteriores();

/* =====================================================
   ETAPA 2 - ENDEREÇO E CONTATO
===================================================== */

const formularioAssociado2 =
    document.getElementById("formularioAssociado2");

if (formularioAssociado2) {

    const ficha = obterFichaAtual();
    const cadastroUsuario = carregarObjeto(CHAVE_CADASTRO_USUARIO);

    const endereco = ficha.enderecoContato ?? {};

    function preencherEndereco() {

        document.getElementById("cepAssociado").value =
            endereco.cep ?? "";

        document.getElementById("enderecoAssociado").value =
            endereco.endereco ?? "";

        document.getElementById("numeroAssociado").value =
            endereco.numero ?? "";

        document.getElementById("complementoAssociado").value =
            endereco.complemento ?? "";

        document.getElementById("bairroAssociado").value =
            endereco.bairro ?? "";

        document.getElementById("cidadeAssociado").value =
            endereco.cidade ?? "";

        document.getElementById("estadoAssociado").value =
            endereco.estado ?? "";

        document.getElementById("telefoneFixoAssociado").value =
            endereco.telefoneFixo ?? "";

        document.getElementById("celularAssociado").value =
            endereco.celular ??
            cadastroUsuario.telefone ??
            "";

        document.getElementById("emailAssociado").value =
            endereco.email ??
            cadastroUsuario.email ??
            "";
    }

    preencherEndereco();

    const campoCep =
        document.getElementById("cepAssociado");

    const campoTelefoneFixo =
        document.getElementById("telefoneFixoAssociado");

    const campoCelular =
        document.getElementById("celularAssociado");

    campoCep.addEventListener("input", () => {

        let valor = somenteNumeros(campoCep.value)
            .slice(0,8);

        valor = valor.replace(
            /^(\d{5})(\d)/,
            "$1-$2"
        );

        campoCep.value = valor;

    });

    campoTelefoneFixo.addEventListener("input", () => {

        let valor = somenteNumeros(
            campoTelefoneFixo.value
        ).slice(0,10);

        valor = valor
            .replace(
                /^(\d{2})(\d)/,
                "($1) $2"
            )
            .replace(
                /(\d{4})(\d)/,
                "$1-$2"
            );

        campoTelefoneFixo.value = valor;

    });

    campoCelular.addEventListener("input", () => {

        campoCelular.value =
            formatarTelefone(
                campoCelular.value
            );

    });

    formularioAssociado2.addEventListener(
        "submit",
        function(evento){

            evento.preventDefault();

            ficha.enderecoContato = {

                cep:
                    document.getElementById("cepAssociado").value,

                endereco:
                    document.getElementById("enderecoAssociado").value,

                numero:
                    document.getElementById("numeroAssociado").value,

                complemento:
                    document.getElementById("complementoAssociado").value,

                bairro:
                    document.getElementById("bairroAssociado").value,

                cidade:
                    document.getElementById("cidadeAssociado").value,

                estado:
                    document.getElementById("estadoAssociado").value,

                telefoneFixo:
                    document.getElementById("telefoneFixoAssociado").value,

                celular:
                    document.getElementById("celularAssociado").value,

                email:
                    document.getElementById("emailAssociado").value

            };

            salvarFicha(ficha);

            window.location.href =
                "associado3.html";

        }

    );

}
