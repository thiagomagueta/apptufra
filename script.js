
"use strict";

const formularioLogin =
  document.getElementById("formularioLogin");

const campoLogin =
  document.getElementById("login");

const campoSenha =
  document.getElementById("senha");

const botaoMostrarSenha =
  document.getElementById("botaoMostrarSenha");

const botaoEntrar =
  document.querySelector(".botao-entrar");

const mensagemLogin =
  document.getElementById("mensagemLogin");

const linkEsqueciSenha =
  document.getElementById("linkEsqueciSenha");

const areaConfirmacaoEmail =
  document.getElementById("areaConfirmacaoEmail");

const tituloConfirmacaoEmail =
  document.getElementById("tituloConfirmacaoEmail");

const textoConfirmacaoEmail =
  document.getElementById("textoConfirmacaoEmail");

const areaEmailReenvio =
  document.getElementById("areaEmailReenvio");

const emailReenvio =
  document.getElementById("emailReenvio");

const mensagemReenvio =
  document.getElementById("mensagemReenvio");

const botaoReenviarConfirmacao =
  document.getElementById("botaoReenviarConfirmacao");

let emailParaConfirmacao = "";


function limparMensagem() {
  mensagemLogin.textContent = "";
}


function mostrarMensagem(texto) {
  mensagemLogin.textContent = texto;
}


function normalizarEmail(valor) {
  return String(valor || "")
    .trim()
    .toLowerCase();
}


function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


function recuperarEmailCadastro() {
  try {
    const cadastro = JSON.parse(
      sessionStorage.getItem(
        "tufra_cadastro_completo"
      ) || "null"
    );

    return normalizarEmail(cadastro?.email);

  } catch {
    return "";
  }
}


function mostrarAreaConfirmacao(expirado = false) {
  areaConfirmacaoEmail.hidden = false;

  tituloConfirmacaoEmail.textContent =
    expirado
      ? "Seu link expirou!"
      : "E-mail não confirmado";

  textoConfirmacaoEmail.textContent =
    expirado
      ? "O link de confirmação expirou ou não é mais válido. Solicite um novo link para confirmar seu cadastro."
      : "Seu e-mail ainda não foi confirmado. Você pode solicitar um novo link de confirmação.";

  mensagemReenvio.textContent = "";

  emailParaConfirmacao =
    normalizarEmail(
      campoLogin.value ||
      recuperarEmailCadastro()
    );

  areaEmailReenvio.hidden =
    Boolean(emailParaConfirmacao);

  emailReenvio.value =
    emailParaConfirmacao;

  if (expirado) {
    formularioLogin.hidden = true;
  }
}


function verificarLinkExpirado() {
  const parametrosHash =
    new URLSearchParams(
      window.location.hash.replace(/^#/, "")
    );

  const parametrosURL =
    new URLSearchParams(
      window.location.search
    );

  const codigo =
    parametrosHash.get("error_code") ||
    parametrosURL.get("error_code") ||
    "";

  const erro =
    parametrosHash.get("error") ||
    parametrosURL.get("error") ||
    "";

  const descricao =
    parametrosHash.get("error_description") ||
    parametrosURL.get("error_description") ||
    "";

  const texto =
    `${codigo} ${erro} ${descricao}`.toLowerCase();

  const expirado =
    texto.includes("otp_expired") ||
    texto.includes("expired") ||
    texto.includes("invalid token") ||
    texto.includes("invalid otp");

  if (!expirado) {
    return;
  }

  mostrarAreaConfirmacao(true);

  // Remove os parâmetros de erro para que a
  // mensagem não reapareça ao atualizar a página.
  window.history.replaceState(
    null,
    "",
    window.location.pathname
  );
}


async function reenviarConfirmacao() {
  const email = normalizarEmail(
    emailParaConfirmacao ||
    emailReenvio.value
  );

  if (!emailValido(email)) {
    areaEmailReenvio.hidden = false;

    mensagemReenvio.textContent =
      "Informe um endereço de e-mail válido.";

    emailReenvio.focus();
    return;
  }

  if (!window.supabaseClient) {
    mensagemReenvio.textContent =
      "Não foi possível conectar ao sistema.";
    return;
  }

  botaoReenviarConfirmacao.disabled = true;

  botaoReenviarConfirmacao.textContent =
    "ENVIANDO...";

  mensagemReenvio.textContent = "";

  try {
    const resultado =
      await window.supabaseClient.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo:
            window.location.origin + "/"
        }
      });

    if (resultado.error) {
      throw resultado.error;
    }

    mensagemReenvio.textContent =
      "Solicitação realizada. Verifique sua caixa de entrada e também o spam. Confirme seu e-mail em até 30 minutos.";

    botaoReenviarConfirmacao.textContent =
      "Solicitar novamente";

  } catch (erro) {
    console.error(
      "Erro ao reenviar confirmação:",
      erro
    );

    const texto =
      String(erro.message || "").toLowerCase();

    if (
      texto.includes("rate limit") ||
      texto.includes("too many") ||
      texto.includes("security purposes")
    ) {
      mensagemReenvio.textContent =
        "Aguarde alguns minutos antes de solicitar outro e-mail.";
    } else {
      mensagemReenvio.textContent =
        "Não foi possível solicitar o novo link. Tente novamente mais tarde.";
    }

    botaoReenviarConfirmacao.textContent =
      "Reenviar e-mail de confirmação";

  } finally {
    botaoReenviarConfirmacao.disabled = false;
  }
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
  const texto =
    String(mensagem || "").toLowerCase();

  if (
    texto.includes("email not confirmed") ||
    texto.includes("email_not_confirmed")
  ) {
    return "Seu e-mail ainda não foi confirmado.";
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
  const resultado =
    await window.supabaseClient
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

  const email =
    normalizarEmail(campoLogin.value);

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

    const usuarioAuth =
      resultadoLogin.data.user;

    if (!usuarioAuth) {
      throw new Error(
        "Usuário não retornado pelo Supabase."
      );
    }

    const cadastro =
      await buscarCadastroUsuario(
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

    const status =
      String(cadastro.status || "")
        .toLowerCase();

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

    const metadados =
      usuarioAuth.user_metadata || {};

    sessionStorage.setItem(
      "tufra_usuario_logado",
      JSON.stringify({
        authId: usuarioAuth.id,
        nomeCompleto: cadastro.nome_completo,
        cpf: metadados.cpf || "",
        telefone: metadados.telefone || "",
        dataNascimento:
          metadados.data_nascimento || "",
        email: usuarioAuth.email || "",
        nomeUsuario:
          metadados.nome_usuario || "",
        status: cadastro.status,
        fichaConcluida:
          cadastro.ficha_concluida
      })
    );

    if (!cadastro.ficha_concluida) {
      window.location.href =
        "associado1.html";
      return;
    }

    window.location.href =
      "dashboard.html";

  } catch (erro) {
    console.error("Erro no login:", erro);

    const texto =
      String(erro.message || "")
        .toLowerCase();

    if (
      texto.includes("email not confirmed") ||
      texto.includes("email_not_confirmed")
    ) {
      emailParaConfirmacao = email;

      mostrarAreaConfirmacao(false);

      // Garante que o e-mail informado no
      // login seja usado no reenvio.
      emailParaConfirmacao = email;
      areaEmailReenvio.hidden = true;

    } else {
      mostrarMensagem(
        traduzirErroLogin(erro.message)
      );
    }

    liberarFormulario();
  }
}


function abrirRecuperacaoSenha(evento) {
  evento.preventDefault();

  window.location.href =
    "recuperar-senha.html";
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

botaoReenviarConfirmacao.addEventListener(
  "click",
  reenviarConfirmacao
);

campoLogin.addEventListener(
  "input",
  limparMensagem
);

campoSenha.addEventListener(
  "input",
  limparMensagem
);

verificarLinkExpirado();
