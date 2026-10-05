"use strict";

function criarMenuGlobal() {
  const alvo = document.getElementById("menuGlobalTufra");
  if (!alvo) return;

  const pagina = window.location.pathname.split("/").pop() || "dashboard.html";

  const ativo = (arquivo) =>
    pagina === arquivo ? " ativo" : "";

  alvo.innerHTML = `
    <nav class="menu-inferior" aria-label="Navegação principal">
      <div class="menu-inferior-conteudo">

        <a class="item-menu${ativo("dashboard.html")}" href="dashboard.html">
          <span class="icone-menu">⌂</span>
          <span class="texto-menu">Início</span>
        </a>

        <a class="item-menu${ativo("calendario.html")}" href="calendario.html">
          <span class="icone-menu">📅</span>
          <span class="texto-menu">Calendário</span>
        </a>

        <a class="item-menu${ativo("minha-ficha.html")}" href="minha-ficha.html">
          <span class="icone-menu">👤</span>
          <span class="texto-menu">Minha ficha</span>
        </a>

        <a
          id="itemMenuFinanceiro"
          class="item-menu${ativo("financeiro.html")}"
          href="financeiro.html"
          hidden
        >
          <span class="icone-menu">💰</span>
          <span class="texto-menu">Financeiro</span>
        </a>

        <a
          id="itemMenuAdm"
          class="item-menu${ativo("administrativo.html")}"
          href="administrativo.html"
          hidden
        >
          <span class="icone-menu">☰</span>
          <span class="texto-menu">ADM</span>
        </a>

        <a class="item-menu" href="#" id="botaoSair">
          <span class="icone-menu">🚪</span>
          <span class="texto-menu">Sair</span>
        </a>

      </div>
    </nav>
  `;
}

criarMenuGlobal();
