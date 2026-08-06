"use strict";

const formularioLogin = document.getElementById(
  "formularioLogin"
);

const campoLogin = document.getElementById("login");
const campoSenha = document.getElementById("senha");

const botaoMostrarSenha = document.getElementById(
  "botaoMostrarSenha"
);

const botaoEntrar = document.querySelector(
  ".botao-entrar"
);

const mensagemLogin = document.getElementById(
  "mensagemLogin"
);

const linkEsqueciSenha = document.getElementById(
  "linkEsqueciSenha"
);

function limparMensagem() {
  mensagemLogin.textContent = "";
}

function mostrarMensagem(texto) {
  mensagemLogin.textContent = texto;
}

function alternarVisibilidadeSenha() {
  const senhaEstaOculta =
    campoSenha.type === "password";

  campoSenha.type =
    senhaEstaOculta ? "text" : "password";

  botaoMostrarSenha.textContent =
    senhaEstaOculta ? "🙈" : "👁";

  botaoMostrarSenha.setAttribute(
    "aria-label",
    senhaEstaOculta
      ? "Ocultar senha"
      : "Mostrar senha"
  );
}

function bloquearFormulario() {
  botaoEntrar.disabled = true;
  botaoEntrar.textContent = "ENTRANDO...";
}

function liberarFormulario() {
  botaoEntrar.disabled = false;
  botaoEntrar.textContent = "ENTRAR";
}

function traduzirErroLogin(mensagem) {
  const texto = String(mensagem || "").toLowerCase();

  if (
    texto.includes("email not confirmed") ||
    texto.includes("email_not_confirmed")
  ) {
    return (
      "Seu e-mail ainda não foi confirmado. " +
      "Verifique a mensagem enviada para o seu e-mail."
    );
  }

  if (
    texto.includes("invalid login credentials") ||
    texto.includes("invalid_credentials")
  ) {
    return "E-mail ou senha incorretos.";
  }

  if (texto.includes("too many requests")) {
    return (
      "Muitas tentativas de acesso. " +
      "Aguarde alguns minutos e tente novamente."
    );
  }

  return (
    "Não foi possível entrar no aplicativo. " +
    "Tente novamente."
  );
}

async function buscarCadastroUsuario(authId) {
  const resultado = await window.supabaseClient
    .from("usuarios")
    .select(
      "id, nome_completo, status, ficha_concluida"
    )
    .eq("auth_id", authId)
    .maybeSingle();

  if (resultado.error) {
    throw resultado.error;
  }

  return resultado.data;
}

async function encerrarSessao() {
  await window.supabaseClient.auth.signOut();
}

async function validarLogin(evento) {
  evento.preventDefault();

  limparMensagem();

  const email = campoLogin.value
    .trim()
    .toLowerCase();

  const senha = campoSenha.value;

  if (!email && !senha) {
    mostrarMensagem(
      "Informe seu e-mail e sua senha."
    );

    campoLogin.focus();
    return;
  }

  if (!email) {
    mostrarMensagem("Informe seu e-mail.");
    campoLogin.focus();
    return;
  }

  if (!senha) {
    mostrarMensagem("Informe sua senha.");
    campoSenha.focus();
    return;
  }

  if (!window.supabaseClient) {
    mostrarMensagem(
      "Não foi possível conectar ao sistema."
    );

    return;
  }

  bloquearFormulario();

  try {
    const resultadoLogin =
      await window.supabaseClient.auth
        .signInWithPassword({
          email,
          password: senha
        });

    if (resultadoLogin.error) {
      throw resultadoLogin.error;
    }

    const usuarioAuth = resultadoLogin.data.user;

    if (!usuarioAuth) {
      throw new Error(
        "Usuário não retornado pelo Supabase."
      );
    }

    const cadastro = await buscarCadastroUsuario(
      usuarioAuth.id
    );

    if (!cadastro) {
      await encerrarSessao();

      mostrarMensagem(
        "Seu cadastro não foi encontrado. " +
        "Entre em contato com a administração."
      );

      liberarFormulario();
      return;
    }

    const status = String(
      cadastro.status || ""
    ).toLowerCase();

    if (status === "aguardando_aprovacao") {
      await encerrarSessao();

      mostrarMensagem(
        "Seu cadastro está aguardando aprovação " +
        "da administração da TUFRA."
      );

      liberarFormulario();
      return;
    }

    if (
      status === "bloqueado" ||
      status === "inativo"
    ) {
      await encerrarSessao();

      mostrarMensagem(
        "Seu acesso está indisponível. " +
        "Entre em contato com a administração."
      );

      liberarFormulario();
      return;
    }

    sessionStorage.setItem(
      "tufra_usuario_logado",
      JSON.stringify({
        authId: usuarioAuth.id,
        nomeCompleto: cadastro.nome_completo,
        status: cadastro.status,
        fichaConcluida:
          cadastro.ficha_concluida
      })
    );

    if (!cadastro.ficha_concluida) {
      window.location.href = "associado1.html";
      return;
    }

    window.location.href = "dashboard.html";
  } catch (erro) {
    console.error("Erro no login:", erro);

    mostrarMensagem(
      traduzirErroLogin(erro.message)
    );

    liberarFormulario();
  }
}

function abrirRecuperacaoSenha(evento) {
  evento.preventDefault();

  alert(
    "A recuperação de senha será conectada " +
    "na próxima etapa."
  );
}

botaoMostrarSenha.addEventListener(
  "click",
  alternarVisibilidadeSenha
);

formularioLogin.addEventListener(
  "submit",
  validarLogin
);

linkEsqueciSenha.addEventListener(
  "click",
  abrirRecuperacaoSenha
);

campoLogin.addEventListener(
  "input",
  limparMensagem
);

campoSenha.addEventListener(
  "input",
  limparMensagem
);
