"use strict";

const CHAVE_FICHA = "tufra_ficha_associado";

const formulario = document.getElementById(
  "formularioAssociado3"
);

const areaQuantidadeTerreiros = document.getElementById(
  "areaQuantidadeTerreiros"
);

const areaDadosBatismo = document.getElementById(
  "areaDadosBatismo"
);

const campoTempoUmbanda = document.getElementById(
  "tempoUmbanda"
);

const campoQuantidadeTerreiros = document.getElementById(
  "quantidadeTerreiros"
);

const campoReligiaoBatismo = document.getElementById(
  "religiaoBatismo"
);

const campoComoChegou = document.getElementById(
  "comoChegouUmbanda"
);

const campoTerreiroBatismo = document.getElementById(
  "terreiroBatismo"
);

const campoDataBatismo = document.getElementById(
  "dataBatismoAnterior"
);

const campoCidadeBatismo = document.getElementById(
  "cidadeBatismo"
);

const campoEstadoBatismo = document.getElementById(
  "estadoBatismo"
);

const campoOrixaFrente = document.getElementById(
  "orixaFrente"
);

const campoOrixaAdjunto = document.getElementById(
  "orixaAdjunto"
);

const campoMelhorDia = document.getElementById(
  "melhorDiaPagamento"
);

function somenteNumeros(valor) {
  return String(valor ?? "").replace(/\D/g, "");
}

function formatarData(valor) {
  const numeros = somenteNumeros(valor).slice(0, 8);

  if (numeros.length <= 2) {
    return numeros;
  }

  if (numeros.length <= 4) {
    return (
      numeros.slice(0, 2) +
      "/" +
      numeros.slice(2)
    );
  }

  return (
    numeros.slice(0, 2) +
    "/" +
    numeros.slice(2, 4) +
    "/" +
    numeros.slice(4)
  );
}

function converterData(valor) {
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
    data.getDate() !== dia ||
    data.getMonth() !== mes - 1 ||
    data.getFullYear() !== ano
  ) {
    return null;
  }

  return data;
}

function carregarFicha() {
  try {
    const dados = sessionStorage.getItem(CHAVE_FICHA);

    return dados ? JSON.parse(dados) : {};
  } catch (erro) {
    console.error("Erro ao carregar a ficha:", erro);
    return {};
  }
}

function salvarFicha(ficha) {
  sessionStorage.setItem(
    CHAVE_FICHA,
    JSON.stringify(ficha)
  );
}

function obterRadioSelecionado(nome) {
  const radio = document.querySelector(
    `input[name="${nome}"]:checked`
  );

  return radio ? radio.value : "";
}

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

function controlarOutrosTerreiros() {
  const resposta = obterRadioSelecionado(
    "participouOutrosTerreiros"
  );

  const mostrar = resposta === "Sim";

  areaQuantidadeTerreiros.hidden = !mostrar;
  campoQuantidadeTerreiros.required = mostrar;

  if (!mostrar) {
    campoQuantidadeTerreiros.value = "";
  }
}

function controlarBatismo() {
  const resposta = obterRadioSelecionado(
    "batizadoUmbanda"
  );

  const mostrar = resposta === "Sim";

  areaDadosBatismo.hidden = !mostrar;

  campoTerreiroBatismo.required = mostrar;
  campoDataBatismo.required = mostrar;
  campoCidadeBatismo.required = mostrar;
  campoEstadoBatismo.required = mostrar;

  if (!mostrar) {
    campoTerreiroBatismo.value = "";
    campoDataBatismo.value = "";
    campoCidadeBatismo.value = "";
    campoEstadoBatismo.value = "";
  }
}

function criarDiasPagamento() {
  campoMelhorDia.innerHTML =
    '<option value="">Selecione o dia</option>';

  for (let dia = 1; dia <= 31; dia++) {
    const opcao = document.createElement("option");

    opcao.value = String(dia);

    opcao.textContent =
      "Dia " +
      String(dia).padStart(2, "0");

    campoMelhorDia.appendChild(opcao);
  }
}

function preencherDadosSalvos() {
  const ficha = carregarFicha();
  const historico = ficha.historicoUmbanda ?? {};

  campoTempoUmbanda.value =
    historico.tempoUmbanda ?? "";

  selecionarRadio(
    "participouOutrosTerreiros",
    historico.participouOutrosTerreiros
  );

  campoQuantidadeTerreiros.value =
    historico.quantidadeTerreiros ?? "";

  campoReligiaoBatismo.value =
    historico.religiaoBatismo ?? "";

  campoComoChegou.value =
    historico.comoChegouUmbanda ?? "";

  selecionarRadio(
    "batizadoUmbanda",
    historico.batizadoUmbanda
  );

  campoTerreiroBatismo.value =
    historico.terreiroBatismo ?? "";

  campoDataBatismo.value =
    historico.dataBatismo ?? "";

  campoCidadeBatismo.value =
    historico.cidadeBatismo ?? "";

  campoEstadoBatismo.value =
    historico.estadoBatismo ?? "";

  campoOrixaFrente.value =
    historico.orixaFrente ?? "";

  campoOrixaAdjunto.value =
    historico.orixaAdjunto ?? "";

  campoMelhorDia.value =
    historico.melhorDiaPagamento
      ? String(historico.melhorDiaPagamento)
      : "";

  controlarOutrosTerreiros();
  controlarBatismo();
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

  const participouOutros = obterRadioSelecionado(
    "participouOutrosTerreiros"
  );

  const batizado = obterRadioSelecionado(
    "batizadoUmbanda"
  );

  if (!campoTempoUmbanda.value) {
    mostrarErro(
      "erroTempoUmbanda",
      "Selecione há quanto tempo é umbandista."
    );
    valido = false;
  }

  if (!participouOutros) {
    mostrarErro(
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
    mostrarErro(
      "erroQuantidadeTerreiros",
      "Informe a quantidade de terreiros."
    );
    valido = false;
  }

  if (!campoReligiaoBatismo.value.trim()) {
    mostrarErro(
      "erroReligiaoBatismo",
      "Informe sua religião de batismo."
    );
    valido = false;
  }

  if (!campoComoChegou.value.trim()) {
    mostrarErro(
      "erroComoChegouUmbanda",
      "Conte como chegou à Umbanda."
    );
    valido = false;
  }

  if (!batizado) {
    mostrarErro(
      "erroBatizadoUmbanda",
      "Selecione Sim ou Não."
    );
    valido = false;
  }

  if (batizado === "Sim") {
    if (!campoTerreiroBatismo.value.trim()) {
      mostrarErro(
        "erroTerreiroBatismo",
        "Informe o nome do terreiro."
      );
      valido = false;
    }

    if (
      !campoDataBatismo.value ||
      !converterData(campoDataBatismo.value)
    ) {
      mostrarErro(
        "erroDataBatismo",
        "Informe uma data válida."
      );
      valido = false;
    }

    if (!campoCidadeBatismo.value.trim()) {
      mostrarErro(
        "erroCidadeBatismo",
        "Informe a cidade do batismo."
      );
      valido = false;
    }

    if (!campoEstadoBatismo.value) {
      mostrarErro(
        "erroEstadoBatismo",
        "Selecione o estado do batismo."
      );
      valido = false;
    }
  }

  if (!campoMelhorDia.value) {
    mostrarErro(
      "erroMelhorDiaPagamento",
      "Selecione o melhor dia para pagamento."
    );
    valido = false;
  }

  return valido;
}

async function salvarEtapa(evento) {
  evento.preventDefault();

  if (!validarFormulario()) {
    return;
  }

  const participouOutros = obterRadioSelecionado(
    "participouOutrosTerreiros"
  );

  const batizado = obterRadioSelecionado(
    "batizadoUmbanda"
  );

  const historicoUmbanda = {
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

  const ficha = carregarFicha();

  ficha.historicoUmbanda = historicoUmbanda;

  salvarFicha(ficha);

  const modoEdicao =
    window.fichaTufra?.estaEmModoEdicao();

  if (!modoEdicao) {
    window.location.href = "associado4.html";
    return;
  }

  const botaoSalvar = formulario.querySelector(
    'button[type="submit"]'
  );

  botaoSalvar.disabled = true;
  botaoSalvar.textContent = "SALVANDO...";

  try {
    await window.fichaTufra.salvarSecaoFicha(
      "historico_umbanda",
      historicoUmbanda
    );

    window.location.href =
      "cadastro-atualizado.html";
  } catch (erro) {
    console.error(
      "Erro ao atualizar histórico na Umbanda:",
      erro
    );

    mostrarErro(
      "erroTempoUmbanda",
      "Não foi possível salvar as alterações. Tente novamente."
    );

    botaoSalvar.disabled = false;
    botaoSalvar.textContent =
      "Salvar alterações";
  }
}

document
  .querySelectorAll(
    'input[name="participouOutrosTerreiros"]'
  )
  .forEach((radio) => {
    radio.addEventListener(
      "change",
      controlarOutrosTerreiros
    );
  });

document
  .querySelectorAll(
    'input[name="batizadoUmbanda"]'
  )
  .forEach((radio) => {
    radio.addEventListener(
      "change",
      controlarBatismo
    );
  });

campoDataBatismo.addEventListener("input", () => {
  campoDataBatismo.value = formatarData(
    campoDataBatismo.value
  );
});

formulario.addEventListener("submit", salvarEtapa);
function configurarModoEdicao() {
  const botaoAnterior = document.getElementById(
    "botaoAnteriorAssociado3"
  );

  const botaoProximo = formulario.querySelector(
    'button[type="submit"]'
  );

  if (!botaoAnterior || !botaoProximo) {
    return;
  }

  const modoEdicao =
    window.fichaTufra?.estaEmModoEdicao();

  if (modoEdicao) {
    botaoAnterior.textContent = "Voltar";
    botaoAnterior.href = "minha-ficha.html";

    botaoProximo.textContent =
      "Salvar alterações";
  }
}
formulario.addEventListener(
  "submit",
  salvarEtapa
);

configurarModoEdicao();
criarDiasPagamento();
preencherDadosSalvos();
