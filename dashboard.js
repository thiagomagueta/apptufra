"use strict";

/* ==========================================
   ELEMENTOS DO DASHBOARD
========================================== */

const saudacaoDashboard = document.getElementById(
  "saudacaoDashboard"
);

const fotoUsuarioDashboard = document.getElementById(
  "fotoUsuarioDashboard"
);

const fotoUsuarioPadrao = document.getElementById(
  "fotoUsuarioPadrao"
);

const listaFuncoesDashboard = document.getElementById(
  "listaFuncoesDashboard"
);

const areaAdministrativo = document.getElementById(
  "areaAdministrativo"
);


/* ==========================================
   USUÁRIO LOGADO
========================================== */

function carregarUsuarioLogado() {
  try {
    const dados = sessionStorage.getItem(
      "tufra_usuario_logado"
    );

    return dados
      ? JSON.parse(dados)
      : {};

  } catch (erro) {
    console.error(
      "Erro ao carregar usuário logado:",
      erro
    );

    return {};
  }
}


/* ==========================================
   SAUDAÇÃO
========================================== */

function obterPrimeiroNome(nomeCompleto) {
  const nome =
    String(nomeCompleto || "").trim();

  if (!nome) {
    return "";
  }

  return nome.split(/\s+/)[0];
}


function obterSaudacaoPorHorario() {
  const horaAtual =
    new Date().getHours();

  if (
    horaAtual >= 5 &&
    horaAtual < 12
  ) {
    return "Bom dia com muita alegria";
  }

  if (
    horaAtual >= 12 &&
    horaAtual < 18
  ) {
    return "Boa tarde com muita alegria";
  }

  return "Boa noite com muita alegria";
}


function atualizarSaudacao() {
  const usuario =
    carregarUsuarioLogado();

  const primeiroNome =
    obterPrimeiroNome(
      usuario.nomeCompleto
    );

  const saudacao =
    obterSaudacaoPorHorario();

  if (!saudacaoDashboard) {
    return;
  }

  saudacaoDashboard.textContent =
    primeiroNome
      ? `${saudacao}, ${primeiroNome}!`
      : `${saudacao}!`;
}


/* ==========================================
   FOTO DO USUÁRIO
========================================== */

async function carregarFotoUsuario() {
  const usuario =
    carregarUsuarioLogado();

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
        .eq(
          "auth_id",
          usuario.authId
        )
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


/* ==========================================
   FUNÇÕES DO USUÁRIO
========================================== */

async function carregarFuncoesUsuario() {
  if (
    !window.supabaseClient ||
    !listaFuncoesDashboard
  ) {
    return;
  }

  try {
    const resultadoSessao =
      await window.supabaseClient.auth
        .getSession();

    if (resultadoSessao.error) {
      throw resultadoSessao.error;
    }

    const sessao =
      resultadoSessao.data.session;

    if (!sessao) {
      listaFuncoesDashboard.innerHTML =
        "<p>Nenhuma função atribuída.</p>";

      return;
    }

    const resultadoUsuario =
      await window.supabaseClient
        .from("usuarios")
        .select("id")
        .eq(
          "auth_id",
          sessao.user.id
        )
        .maybeSingle();

    if (resultadoUsuario.error) {
      throw resultadoUsuario.error;
    }

    if (!resultadoUsuario.data) {
      listaFuncoesDashboard.innerHTML =
        "<p>Nenhuma função atribuída.</p>";

      return;
    }

    const usuarioId =
      resultadoUsuario.data.id;

    const resultadoFuncoes =
      await window.supabaseClient
        .from("usuario_funcoes")
        .select(`
          funcao_id,
          funcoes (
            id,
            nome
          )
        `)
        .eq(
          "usuario_id",
          usuarioId
        );

    if (resultadoFuncoes.error) {
      throw resultadoFuncoes.error;
    }

    const funcoes =
      resultadoFuncoes.data || [];

    listaFuncoesDashboard.innerHTML =
      "";

    if (funcoes.length === 0) {
      listaFuncoesDashboard.innerHTML =
        "<p>Nenhuma função atribuída.</p>";

      return;
    }

    const nomesFuncoes = [];

    funcoes.forEach((item) => {
      const nome =
        item.funcoes?.nome;

      if (!nome) {
        return;
      }

      nomesFuncoes.push(nome);

      const elemento =
        document.createElement(
          "span"
        );

      elemento.className =
        "funcao-dashboard";

      elemento.textContent =
        nome;

      listaFuncoesDashboard.appendChild(
        elemento
      );
    });

    verificarAdministrativo(
      nomesFuncoes
    );

  } catch (erro) {
    console.error(
      "Erro ao carregar funções:",
      erro
    );

    listaFuncoesDashboard.innerHTML =
      "<p>Não foi possível carregar suas funções.</p>";
  }
}


/* ==========================================
   ACESSO ADMINISTRATIVO
========================================== */

function verificarAdministrativo(funcoes) {
  if (!areaAdministrativo) {
    return;
  }

  const funcoesAdministrativas = [
    "Presidente",
    "Secretária",
    "Tesoureiro",
    "Pai/Mãe Pequeno (a)",
    "Sacerdote",
    "Líder dos Ogans",
    "Líder dos Cambones",
    "Líder da Cantina"
  ];

  const possuiAcesso =
    funcoes.some((funcao) =>
      funcoesAdministrativas.includes(funcao)
    );

  areaAdministrativo.hidden =
    !possuiAcesso;

  if (!possuiAcesso) {
    return;
  }

  if (funcoes.includes("Tesoureiro")) {
    areaAdministrativo.href =
      "permissoes.html";
  } else {
    areaAdministrativo.href =
      "#";
  }
}


/* ==========================================
   INICIALIZAÇÃO DO DASHBOARD
========================================== */

atualizarSaudacao();
carregarFotoUsuario();
carregarFuncoesUsuario();
