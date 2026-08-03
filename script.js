"use strict";

/*
  Gestão TUFRA
  Módulo: Cadastro de Associados

  Nesta primeira versão, os dados ficam armazenados
  no próprio navegador usando localStorage.
*/

const CHAVE_ARMAZENAMENTO = "tufra_associados";

const listaAssociadosElemento = document.getElementById("listaAssociados");
const campoPesquisa = document.getElementById("campoPesquisa");
const botaoNovoAssociado = document.getElementById("botaoNovoAssociado");
const totalAssociadosElemento = document.getElementById("totalAssociados");
const totalAtivosElemento = document.getElementById("totalAtivos");

/**
 * Busca os associados armazenados no navegador.
 */
function carregarAssociados() {
  try {
    const dadosSalvos = localStorage.getItem(CHAVE_ARMAZENAMENTO);

    if (!dadosSalvos) {
      return [];
    }

    const associados = JSON.parse(dadosSalvos);

    return Array.isArray(associados) ? associados : [];
  } catch (erro) {
    console.error("Erro ao carregar os associados:", erro);
    return [];
  }
}

/**
 * Salva a lista de associados no navegador.
 */
function salvarAssociados(associados) {
  try {
    localStorage.setItem(
      CHAVE_ARMAZENAMENTO,
      JSON.stringify(associados)
    );
  } catch (erro) {
    console.error("Erro ao salvar os associados:", erro);
  }
}

/**
 * Evita que textos inseridos pelo usuário sejam interpretados como código.
 */
function escaparHTML(texto) {
  return String(texto ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * Remove pontos, traços, espaços e outros caracteres.
 * Será usado na pesquisa de CPF e telefone.
 */
function somenteNumeros(valor) {
  return String(valor ?? "").replace(/\D/g, "");
}

/**
 * Mostra quantos associados existem e quantos estão ativos.
 */
function atualizarResumo(associados) {
  const total = associados.length;

  const ativos = associados.filter((associado) => {
    return associado.situacao === "Ativo";
  }).length;

  totalAssociadosElemento.textContent = total;
  totalAtivosElemento.textContent = ativos;
}

/**
 * Cria o conteúdo visual da lista.
 */
function exibirAssociados(associados) {
  listaAssociadosElemento.innerHTML = "";

  if (associados.length === 0) {
    listaAssociadosElemento.innerHTML = `
      <div class="estado-vazio">
        <div class="icone-vazio">👥</div>

        <h3>Nenhum associado encontrado</h3>

        <p>
          Toque no botão “Novo” para realizar o primeiro cadastro.
        </p>
      </div>
    `;

    return;
  }

  associados.forEach((associado) => {
    const item = document.createElement("article");

    item.className = "associado-item";

    item.innerHTML = `
      <div class="associado-avatar">
        ${escaparHTML(obterIniciais(associado.nome))}
      </div>

      <div class="associado-informacoes">
        <strong>${escaparHTML(associado.nome)}</strong>

        <span>
          CPF: ${escaparHTML(associado.cpf || "Não informado")}
        </span>

        <small>
          ${escaparHTML(associado.situacao || "Situação não informada")}
        </small>
      </div>

      <button
        class="botao-detalhes"
        type="button"
        aria-label="Abrir cadastro de ${escaparHTML(associado.nome)}"
      >
        ›
      </button>
    `;

    listaAssociadosElemento.appendChild(item);
  });
}

/**
 * Obtém as primeiras letras do nome para formar o avatar.
 */
function obterIniciais(nome) {
  if (!nome) {
    return "?";
  }

  const partesDoNome = nome
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (partesDoNome.length === 1) {
    return partesDoNome[0].charAt(0).toUpperCase();
  }

  const primeiraLetra = partesDoNome[0].charAt(0);
  const ultimaLetra = partesDoNome[partesDoNome.length - 1].charAt(0);

  return `${primeiraLetra}${ultimaLetra}`.toUpperCase();
}

/**
 * Filtra os associados conforme o que foi digitado.
 */
function pesquisarAssociados() {
  const termoDigitado = campoPesquisa.value
    .trim()
    .toLowerCase();

  const termoNumerico = somenteNumeros(termoDigitado);

  const associadosFiltrados = associados.filter((associado) => {
    const nome = String(associado.nome ?? "").toLowerCase();
    const cpf = somenteNumeros(associado.cpf);

    const correspondeAoNome = nome.includes(termoDigitado);

    const correspondeAoCPF =
      termoNumerico !== "" &&
      cpf.includes(termoNumerico);

    return correspondeAoNome || correspondeAoCPF;
  });

  exibirAssociados(associadosFiltrados);
}

/**
 * A tela de cadastro será criada na próxima etapa.
 */
function abrirNovoAssociado() {
  alert(
    "A tela para cadastrar um novo associado será construída na próxima etapa."
  );
}

const associados = carregarAssociados();

atualizarResumo(associados);
exibirAssociados(associados);

campoPesquisa.addEventListener("input", pesquisarAssociados);
botaoNovoAssociado.addEventListener("click", abrirNovoAssociado);
