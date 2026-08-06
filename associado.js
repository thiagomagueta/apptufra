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
const campoRG = document.getElementById("rgAssociado");

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

function formatarRG(valor) {
  return String(valor ?? "")
    .toUpperCase()
    .replace(/[^0-9A-Z.\-\s]/g, "")
    .slice(0, 20);
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

function formatarData(valor) {
  const numeros = somenteNumeros(valor).slice(0, 8);

  return numeros
    .replace(/^(\d{2})(\d)/, "$1/$2")
    .replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
}function converterDataBrasileira(valor) {
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

if (formularioAssociado1) {
 function tratarDataNascimento() {
  campoNascimento.value = formatarData(
    campoNascimento.value
  );

  atualizarIdade();
}
campoRG.addEventListener("input", () => {
  campoRG.value = formatarRG(campoRG.value);
});
campoNascimento.addEventListener(
  "input",
  tratarDataNascimento
);

campoNascimento.addEventListener(
  "change",
  tratarDataNascimento
);

campoNascimento.addEventListener(
  "blur",
  tratarDataNascimento
);
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
}
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

/* =====================================================
   ETAPA 3 - CONTROLES VISUAIS
===================================================== */

const formularioAssociado3 =
    document.getElementById("formularioAssociado3");

if (formularioAssociado3) {

    const areaQuantidadeTerreiros =
        document.getElementById(
            "areaQuantidadeTerreiros"
        );

    const areaDadosBatismo =
        document.getElementById(
            "areaDadosBatismo"
        );

    const radiosOutrosTerreiros =
        document.querySelectorAll(
            'input[name="participouOutrosTerreiros"]'
        );

    const radiosBatizado =
        document.querySelectorAll(
            'input[name="batizadoUmbanda"]'
        );

    function atualizarOutrosTerreiros() {

        const selecionado =
            document.querySelector(
                'input[name="participouOutrosTerreiros"]:checked'
            );

        areaQuantidadeTerreiros.hidden =
            !(selecionado &&
              selecionado.value === "Sim");
/* ==========================================
   MELHOR DIA PARA PAGAMENTO
========================================== */

const campoMelhorDia =
    document.getElementById("melhorDiaPagamento");

for (let dia = 1; dia <= 31; dia++) {

    const opcao = document.createElement("option");

    opcao.value = dia;

    opcao.textContent =
          "Dia " +
        dia.toString().padStart(2, "0");

    campoMelhorDia.appendChild(opcao);
/* ==========================================
   CARREGAMENTO E SALVAMENTO DA ETAPA 3
========================================== */

const fichaEtapa3 = obterFichaAtual();
const historicoSalvo = fichaEtapa3.historicoUmbanda ?? {};

const campoTempoUmbanda =
  document.getElementById("tempoUmbanda");

const campoQuantidadeTerreiros =
  document.getElementById("quantidadeTerreiros");

const campoReligiaoBatismo =
  document.getElementById("religiaoBatismo");

const campoComoChegou =
  document.getElementById("comoChegouUmbanda");

const campoTerreiroBatismo =
  document.getElementById("terreiroBatismo");

const campoDataBatismo =
  document.getElementById("dataBatismoAnterior");

const campoCidadeBatismo =
  document.getElementById("cidadeBatismo");

const campoEstadoBatismo =
  document.getElementById("estadoBatismo");

const campoOrixaFrente =
  document.getElementById("orixaFrente");

const campoOrixaAdjunto =
  document.getElementById("orixaAdjunto");

function selecionarRadio(nome, valor) {
  if (!valor) {
    return;
  }

  const radio = document.querySelector(
    `input[name="${nome}"][value="${valor}"]`
  );

  if (radio) {
    radio.checked = true;
  }
}

function preencherHistoricoSalvo() {
  campoTempoUmbanda.value =
    historicoSalvo.tempoUmbanda ?? "";

  selecionarRadio(
    "participouOutrosTerreiros",
    historicoSalvo.participouOutrosTerreiros
  );

  campoQuantidadeTerreiros.value =
    historicoSalvo.quantidadeTerreiros ?? "";

  campoReligiaoBatismo.value =
    historicoSalvo.religiaoBatismo ?? "";

  campoComoChegou.value =
    historicoSalvo.comoChegouUmbanda ?? "";

  selecionarRadio(
    "batizadoUmbanda",
    historicoSalvo.batizadoUmbanda
  );

  campoTerreiroBatismo.value =
    historicoSalvo.terreiroBatismo ?? "";

  campoDataBatismo.value =
    historicoSalvo.dataBatismo ?? "";

  campoCidadeBatismo.value =
    historicoSalvo.cidadeBatismo ?? "";

  campoEstadoBatismo.value =
    historicoSalvo.estadoBatismo ?? "";

  campoOrixaFrente.value =
    historicoSalvo.orixaFrente ?? "";

  campoOrixaAdjunto.value =
    historicoSalvo.orixaAdjunto ?? "";

  campoMelhorDia.value =
    historicoSalvo.melhorDiaPagamento ?? "";

  atualizarOutrosTerreiros();
  atualizarBatismo();
}

function obterRadioSelecionado(nome) {
  const selecionado = document.querySelector(
    `input[name="${nome}"]:checked`
  );

  return selecionado ? selecionado.value : "";
}

function limparErrosEtapa3() {
  formularioAssociado3
    .querySelectorAll(".mensagem-campo")
    .forEach((elemento) => {
      elemento.textContent = "";
    });
}

function exibirErroEtapa3(id, mensagem) {
  document.getElementById(id).textContent = mensagem;
}

function validarEtapa3() {
  limparErrosEtapa3();

  let valido = true;

  const participouOutros =
    obterRadioSelecionado(
      "participouOutrosTerreiros"
    );

  const batizado =
    obterRadioSelecionado("batizadoUmbanda");

  if (!campoTempoUmbanda.value) {
    exibirErroEtapa3(
      "erroTempoUmbanda",
      "Selecione há quanto tempo é umbandista."
    );
    valido = false;
  }

  if (!participouOutros) {
    exibirErroEtapa3(
      "erroOutrosTerreiros",
      "Selecione Sim ou Não."
    );
    valido = false;
  }

  if (
    participouOutros === "Sim" &&
    (
      !campoQuantidadeTerreiros.value ||
      Number(campoQuantidadeTerreiros.value) < 1
    )
  ) {
    exibirErroEtapa3(
      "erroQuantidadeTerreiros",
      "Informe a quantidade de terreiros."
    );
    valido = false;
  }

  if (!campoReligiaoBatismo.value.trim()) {
    exibirErroEtapa3(
      "erroReligiaoBatismo",
      "Informe sua religião de batismo."
    );
    valido = false;
  }

  if (!campoComoChegou.value.trim()) {
    exibirErroEtapa3(
      "erroComoChegouUmbanda",
      "Conte como chegou à Umbanda."
    );
    valido = false;
  }

  if (!batizado) {
    exibirErroEtapa3(
      "erroBatizadoUmbanda",
      "Selecione Sim ou Não."
    );
    valido = false;
  }

  if (batizado === "Sim") {
    if (!campoTerreiroBatismo.value.trim()) {
      exibirErroEtapa3(
        "erroTerreiroBatismo",
        "Informe o nome do terreiro."
      );
      valido = false;
    }

    if (
      !campoDataBatismo.value ||
      !converterDataBrasileira(
        campoDataBatismo.value
      )
    ) {
      exibirErroEtapa3(
        "erroDataBatismo",
        "Informe uma data válida."
      );
      valido = false;
    }

    if (!campoCidadeBatismo.value.trim()) {
      exibirErroEtapa3(
        "erroCidadeBatismo",
        "Informe a cidade do batismo."
      );
      valido = false;
    }

    if (!campoEstadoBatismo.value) {
      exibirErroEtapa3(
        "erroEstadoBatismo",
        "Selecione o estado do batismo."
      );
      valido = false;
    }
  }

  if (!campoMelhorDia.value) {
    exibirErroEtapa3(
      "erroMelhorDiaPagamento",
      "Selecione o melhor dia para pagamento."
    );
    valido = false;
  }

  return valido;
}

campoDataBatismo.addEventListener("input", () => {
  campoDataBatismo.value = formatarData(
    campoDataBatismo.value
  );
});

formularioAssociado3.addEventListener(
  "submit",
  (evento) => {
    evento.preventDefault();

    if (!validarEtapa3()) {
      return;
    }

    const participouOutros =
      obterRadioSelecionado(
        "participouOutrosTerreiros"
      );

    const batizado =
      obterRadioSelecionado("batizadoUmbanda");

    fichaEtapa3.historicoUmbanda = {
      tempoUmbanda: campoTempoUmbanda.value,

      participouOutrosTerreiros:
        participouOutros,

      quantidadeTerreiros:
        participouOutros === "Sim"
          ? Number(campoQuantidadeTerreiros.value)
          : 0,

      religiaoBatismo:
        campoReligiaoBatismo.value.trim(),

      comoChegouUmbanda:
        campoComoChegou.value.trim(),

      batizadoUmbanda: batizado,

      terreiroBatismo:
        batizado === "Sim"
          ? campoTerreiroBatismo.value.trim()
          : "",

      dataBatismo:
        batizado === "Sim"
          ? campoDataBatismo.value
          : "",

      cidadeBatismo:
        batizado === "Sim"
          ? campoCidadeBatismo.value.trim()
          : "",

      estadoBatismo:
        batizado === "Sim"
          ? campoEstadoBatismo.value
          : "",

      orixaFrente:
        campoOrixaFrente.value.trim(),

      orixaAdjunto:
        campoOrixaAdjunto.value.trim(),

      melhorDiaPagamento:
        Number(campoMelhorDia.value)
    };

    salvarFicha(fichaEtapa3);

    window.location.href = "associado4.html";
  }
);

preencherHistoricoSalvo();
}
    }

    function atualizarBatismo() {

        const selecionado =
            document.querySelector(
                'input[name="batizadoUmbanda"]:checked'
            );

        areaDadosBatismo.hidden =
            !(selecionado &&
              selecionado.value === "Sim");

    }

    radiosOutrosTerreiros.forEach(function(radio){

        radio.addEventListener(
            "change",
            atualizarOutrosTerreiros
        );

    });

    radiosBatizado.forEach(function(radio){

        radio.addEventListener(
            "change",
            atualizarBatismo
        );

    });

}
