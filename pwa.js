// ========================================
// APP TUFRA - PWA
// Instalação Android + iPhone
// ========================================


// ========================================
// SERVICE WORKER
// ========================================

if ("serviceWorker" in navigator) {

  window.addEventListener("load", async () => {

    try {

      const registro = await navigator.serviceWorker.register(
        "./service-worker.js"
      );

      console.log(
        "TUFRA PWA - Service Worker registrado:",
        registro.scope
      );

    } catch (erro) {

      console.error(
        "TUFRA PWA - Erro ao registrar Service Worker:",
        erro
      );

    }

  });

}


// ========================================
// VARIÁVEL DO EVENTO DE INSTALAÇÃO
// ANDROID / CHROME
// ========================================

let eventoInstalacaoTufra = null;


// ========================================
// VERIFICA SE O APP JÁ ESTÁ INSTALADO
// ========================================

function appEstaInstalado() {

  const modoStandalone =
    window.matchMedia(
      "(display-mode: standalone)"
    ).matches;

  const standaloneIOS =
    window.navigator.standalone === true;

  return (
    modoStandalone ||
    standaloneIOS
  );

}


// ========================================
// IDENTIFICA IPHONE / IPAD
// ========================================

function dispositivoIOS() {

  const userAgent =
    window.navigator.userAgent.toLowerCase();

  const plataforma =
    window.navigator.platform;

  const pontosToque =
    window.navigator.maxTouchPoints || 0;


  const iphoneOuIpad =
    /iphone|ipad|ipod/.test(
      userAgent
    );


  const ipadModerno =
    plataforma === "MacIntel" &&
    pontosToque > 1;


  return (
    iphoneOuIpad ||
    ipadModerno
  );

}


// ========================================
// IDENTIFICA SAFARI NO IOS
// ========================================

function navegadorSafariIOS() {

  const userAgent =
    window.navigator.userAgent;


  const temSafari =
    /Safari/i.test(
      userAgent
    );


  const outroNavegador =
    /CriOS|FxiOS|EdgiOS|OPiOS/i.test(
      userAgent
    );


  return (
    temSafari &&
    !outroNavegador
  );

}


// ========================================
// CRIA BOTÃO INSTALAR APP
// ========================================

function criarBotaoInstalarTufra() {

  if (appEstaInstalado()) {
    return;
  }


  if (
    document.getElementById(
      "botaoInstalarTufra"
    )
  ) {
    return;
  }


  const formulario =
    document.getElementById(
      "formularioLogin"
    );


  if (!formulario) {
    return;
  }


  const botao =
    document.createElement(
      "button"
    );


  botao.id =
    "botaoInstalarTufra";

  botao.type =
    "button";

  botao.className =
    "botao-entrar";

  botao.textContent =
    "📲 INSTALAR APP TUFRA";


  botao.style.marginTop =
    "16px";


  botao.addEventListener(
    "click",
    executarInstalacaoTufra
  );


  formulario.appendChild(
    botao
  );

}


// ========================================
// EVENTO DE INSTALAÇÃO DO ANDROID
// ========================================

window.addEventListener(
  "beforeinstallprompt",
  (evento) => {

    evento.preventDefault();

    eventoInstalacaoTufra =
      evento;

    criarBotaoInstalarTufra();

  }
);


// ========================================
// EXECUTA INSTALAÇÃO
// ========================================

async function executarInstalacaoTufra() {

  // ======================================
  // IPHONE / IPAD
  // ======================================

  if (dispositivoIOS()) {

    mostrarOrientacaoIOS();

    return;

  }


  // ======================================
  // ANDROID
  // ======================================

  if (eventoInstalacaoTufra) {

    try {

      eventoInstalacaoTufra.prompt();


      const escolha =
        await eventoInstalacaoTufra.userChoice;


      console.log(
        "TUFRA PWA - Escolha:",
        escolha.outcome
      );


      if (
        escolha.outcome ===
        "accepted"
      ) {

        removerBotaoInstalarTufra();

      }

    } catch (erro) {

      console.error(
        "TUFRA PWA - Erro na instalação:",
        erro
      );

    }


    eventoInstalacaoTufra =
      null;

    return;

  }


  alert(
    "Para instalar o APP TUFRA, abra o menu do navegador e escolha a opção de instalar ou adicionar à tela inicial."
  );

}


// ========================================
// ORIENTAÇÃO PARA IPHONE / IPAD
// ========================================

function mostrarOrientacaoIOS() {

  if (
    document.getElementById(
      "modalInstalacaoIOS"
    )
  ) {
    return;
  }


  const fundo =
    document.createElement(
      "div"
    );


  fundo.id =
    "modalInstalacaoIOS";


  fundo.style.position =
    "fixed";

  fundo.style.top =
    "0";

  fundo.style.left =
    "0";

  fundo.style.width =
    "100%";

  fundo.style.height =
    "100%";

  fundo.style.background =
    "rgba(0, 0, 0, 0.55)";

  fundo.style.display =
    "flex";

  fundo.style.alignItems =
    "center";

  fundo.style.justifyContent =
    "center";

  fundo.style.padding =
    "20px";

  fundo.style.boxSizing =
    "border-box";

  fundo.style.zIndex =
    "9999";


  const caixa =
    document.createElement(
      "div"
    );


  caixa.style.background =
    "#ffffff";

  caixa.style.width =
    "100%";

  caixa.style.maxWidth =
    "420px";

  caixa.style.borderRadius =
    "16px";

  caixa.style.padding =
    "24px";

  caixa.style.boxSizing =
    "border-box";

  caixa.style.textAlign =
    "left";

  caixa.style.color =
    "#222222";


  const titulo =
    document.createElement(
      "h2"
    );


  titulo.textContent =
    "Instalar APP TUFRA";

  titulo.style.marginTop =
    "0";

  titulo.style.color =
    "#651b1d";


  const texto =
    document.createElement(
      "div"
    );


  if (navegadorSafariIOS()) {

    texto.innerHTML = `
      <p>
        Para instalar o TUFRA no iPhone:
      </p>

      <p>
        <strong>1.</strong>
        Toque no botão
        <strong>Compartilhar</strong>
        do Safari.
      </p>

      <p>
        <strong>2.</strong>
        Escolha
        <strong>Adicionar à Tela de Início</strong>.
      </p>

      <p>
        <strong>3.</strong>
        Toque em
        <strong>Adicionar</strong>.
      </p>

      <p>
        Depois, abra o TUFRA pelo ícone criado
        na tela do iPhone.
      </p>
    `;

  } else {

    texto.innerHTML = `
      <p>
        Para instalar o TUFRA no iPhone,
        abra esta página no
        <strong>Safari</strong>.
      </p>

      <p>
        Depois:
      </p>

      <p>
        <strong>1.</strong>
        Toque em
        <strong>Compartilhar</strong>.
      </p>

      <p>
        <strong>2.</strong>
        Escolha
        <strong>Adicionar à Tela de Início</strong>.
      </p>

      <p>
        <strong>3.</strong>
        Toque em
        <strong>Adicionar</strong>.
      </p>
    `;

  }


  const botaoFechar =
    document.createElement(
      "button"
    );


  botaoFechar.type =
    "button";

  botaoFechar.textContent =
    "ENTENDI";

  botaoFechar.style.width =
    "100%";

  botaoFechar.style.marginTop =
    "16px";

  botaoFechar.style.padding =
    "14px";

  botaoFechar.style.border =
    "none";

  botaoFechar.style.borderRadius =
    "10px";

  botaoFechar.style.background =
    "#651b1d";

  botaoFechar.style.color =
    "#ffffff";

  botaoFechar.style.fontWeight =
    "bold";

  botaoFechar.style.cursor =
    "pointer";


  botaoFechar.addEventListener(
    "click",
    () => {

      fundo.remove();

    }
  );


  caixa.appendChild(
    titulo
  );

  caixa.appendChild(
    texto
  );

  caixa.appendChild(
    botaoFechar
  );

  fundo.appendChild(
    caixa
  );

  document.body.appendChild(
    fundo
  );

}


// ========================================
// REMOVE BOTÃO DE INSTALAÇÃO
// ========================================

function removerBotaoInstalarTufra() {

  const botao =
    document.getElementById(
      "botaoInstalarTufra"
    );


  if (botao) {

    botao.remove();

  }

}


// ========================================
// APP INSTALADO
// ========================================

window.addEventListener(
  "appinstalled",
  () => {

    console.log(
      "TUFRA PWA - Aplicativo instalado."
    );

    eventoInstalacaoTufra =
      null;

    removerBotaoInstalarTufra();

  }
);


// ========================================
// INICIALIZAÇÃO
// ========================================

window.addEventListener(
  "DOMContentLoaded",
  () => {

    // No iPhone não existe
    // beforeinstallprompt.
    // Por isso criamos o botão diretamente.

    if (
      dispositivoIOS() &&
      !appEstaInstalado()
    ) {

      criarBotaoInstalarTufra();

    }

  }
);
