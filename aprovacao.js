"use strict";

const funcaoMediumDesenvolvimento = document.getElementById(
  "funcaoMediumDesenvolvimento"
);

const funcaoCambone = document.getElementById("funcaoCambone");

const subopcoesMedium = document.getElementById(
  "subopcoesMedium"
);

const subopcoesCambone = document.getElementById(
  "subopcoesCambone"
);

const erroFuncoes = document.getElementById("erroFuncoes");
const mensagemAprovacao = document.getElementById(
  "mensagemAprovacao"
);

const botaoAprovar = document.getElementById("botaoAprovar");
const botaoReprovar = document.getElementById("botaoReprovar");

function controlarSubopcoes(
  campoPrincipal,
  areaSubopcoes
) {
  areaSubopcoes.hidden = !campoPrincipal.checked;

  if (!campoPrincipal.checked) {
    const subopcoes = areaSubopcoes.querySelectorAll(
      'input[type="checkbox"]'
    );

    subopcoes.forEach((opcao) => {
      opcao.checked = false;
    });
  }
}

function obterFuncoesSelecionadas() {
  const funcoes = [];

  document
    .querySelectorAll('input[name="funcoes"]:checked')
    .forEach((campo) => {
      funcoes.push(campo.value);
    });

  if (funcaoMediumDesenvolvimento.checked) {
    document
      .querySelectorAll(
        'input[name="mediumDesenvolvimento"]:checked'
      )
      .forEach((campo) => {
        funcoes.push(
          `Médium em Desenvolvimento — ${campo.value}`
        );
      });
  }

  if (funcaoCambone.checked) {
    document
      .querySelectorAll('input[name="cambone"]:checked')
      .forEach((campo) => {
        funcoes.push(`Cambone — ${campo.value}`);
      });
  }

  return funcoes;
}

function aprovarUsuario() {
  erroFuncoes.textContent = "";
  mensagemAprovacao.textContent = "";
  mensagemAprovacao.className = "mensagem-aprovacao";

  const funcoesSelecionadas = obterFuncoesSelecionadas();

  if (funcoesSelecionadas.length === 0) {
    erroFuncoes.textContent =
      "Selecione pelo menos uma função antes de aprovar.";

    document
      .querySelector(".secao-funcoes")
      .scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

    return;
  }

  const dadosAprovacao = {
    status: "Ativo",
    funcoes: funcoesSelecionadas,
    observacao: document
      .getElementById("observacaoAprovacao")
      .value
      .trim(),
    dataAprovacao: new Date().toISOString(),
    aprovadoPor: "Administrador"
  };

  sessionStorage.setItem(
    "tufra_ultima_aprovacao",
    JSON.stringify(dadosAprovacao)
  );

  mensagemAprovacao.textContent =
    "Usuário aprovado e funções registradas com sucesso.";

  mensagemAprovacao.classList.add("mensagem-aprovada");
}

function reprovarUsuario() {
  erroFuncoes.textContent = "";
  mensagemAprovacao.textContent =
    "Solicitação reprovada.";

  mensagemAprovacao.className =
    "mensagem-aprovacao mensagem-reprovada";
}

funcaoMediumDesenvolvimento.addEventListener(
  "change",
  () => {
    controlarSubopcoes(
      funcaoMediumDesenvolvimento,
      subopcoesMedium
    );
  }
);

funcaoCambone.addEventListener("change", () => {
  controlarSubopcoes(
    funcaoCambone,
    subopcoesCambone
  );
});

botaoAprovar.addEventListener("click", aprovarUsuario);
botaoReprovar.addEventListener("click", reprovarUsuario);
