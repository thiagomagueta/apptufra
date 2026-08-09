"use strict";

const saudacaoDashboard = document.getElementById(
  "saudacaoDashboard"
);
const fotoUsuarioDashboard = document.getElementById(
  "fotoUsuarioDashboard"
);

const fotoUsuarioPadrao = document.getElementById(
  "fotoUsuarioPadrao"
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
async function carregarFotoUsuario() {
  const usuario = carregarUsuarioLogado();

  if (
    !usuario.authId ||
    !window.supabaseClient
  ) {
    return;
  }

  try {
    const resultadoUsuario =
      await window.supabaseClient
        .from("usuarios")
        .select("foto_path")
        .eq("auth_id", usuario.authId)
        .maybeSingle();

    if (resultadoUsuario.error) {
      throw resultadoUsuario.error;
    }

    const fotoPath =
      resultadoUsuario.data?.foto_path;

    if (!fotoPath) {
      return;
    }

    const resultadoFoto =
      await window.supabaseClient.storage
        .from("fotos-associados")
        .createSignedUrl(
          fotoPath,
          60 * 60
        );

    if (resultadoFoto.error) {
      throw resultadoFoto.error;
    }

    const urlFoto =
      resultadoFoto.data?.signedUrl;

    if (!urlFoto) {
      return;
    }

    fotoUsuarioDashboard.src =
      urlFoto;

    fotoUsuarioDashboard.hidden =
      false;

    fotoUsuarioPadrao.hidden =
      true;

  } catch (erro) {
    console.error(
      "Erro ao carregar foto do usuário:",
      erro
    );
  }
}
