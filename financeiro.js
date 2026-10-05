"use strict";

const textoSituacaoFinanceira = document.getElementById("textoSituacaoFinanceira");
const textoMensalidades = document.getElementById("textoMensalidades");
const listaMensalidades = document.getElementById("listaMensalidades");

const nomesMeses = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

function carregarQuadroMensalidades(cobrancas, ano) {
  if (!listaMensalidades || !textoMensalidades) return;

  listaMensalidades.innerHTML = "";
  listaMensalidades.style.display = "grid";
  listaMensalidades.style.gridTemplateColumns = "repeat(6, minmax(0, 1fr))";
  listaMensalidades.style.gap = "8px";

  for (let mes = 1; mes <= 12; mes++) {
    const cobranca = cobrancas.find(item => {
      if (!item.competencia) return false;
      const partes = String(item.competencia).split("-");
      return Number(partes[0]) === ano && Number(partes[1]) === mes;
    });

    const cartao = document.createElement("div");
    cartao.style.padding = "9px 4px";
    cartao.style.border = "1px solid #d8d8d8";
    cartao.style.borderRadius = "8px";
    cartao.style.textAlign = "center";
    cartao.style.fontSize = "11px";
    cartao.style.fontWeight = "700";

    let simbolo = "—";
    let situacao = "Sem cobrança";

    if (cobranca) {
      if (cobranca.status === "paga") {
        simbolo = "✓";
        situacao = "Pago";
        cartao.style.background = "#e4f3e8";
        cartao.style.borderColor = "#70ad7d";
        cartao.style.color = "#246b35";
      } else if (cobranca.status === "aberta" || cobranca.status === "parcial") {
        simbolo = "!";
        situacao = cobranca.status === "parcial" ? "Parcial" : "Em aberto";
        cartao.style.background = "#f7dddd";
        cartao.style.borderColor = "#c97575";
        cartao.style.color = "#9a2929";
      } else {
        situacao = cobranca.status || "Sem cobrança";
        cartao.style.background = "#f5f5f5";
      }
    } else {
      cartao.style.background = "#f5f5f5";
    }

    cartao.innerHTML = `
      <div style="font-size:12px; margin-bottom:3px;">${nomesMeses[mes - 1]}</div>
      <div style="font-size:16px; line-height:1;">${simbolo}</div>
      <div style="font-size:9px; margin-top:4px; font-weight:600;">${situacao}</div>
    `;

    listaMensalidades.appendChild(cartao);
  }

  textoMensalidades.textContent = `Mensalidades de ${ano}`;
  listaMensalidades.hidden = false;
}

async function carregarFinanceiroAssociado() {
  if (!window.supabaseClient) {
    window.location.href = "dashboard.html";
    return;
  }

  try {
    const resultadoSessao = await window.supabaseClient.auth.getSession();
    if (resultadoSessao.error) throw resultadoSessao.error;

    const sessao = resultadoSessao.data.session;
    if (!sessao) {
      window.location.href = "index.html";
      return;
    }

    const resultadoUsuario = await window.supabaseClient
      .from("usuarios")
      .select("id")
      .eq("auth_id", sessao.user.id)
      .maybeSingle();

    if (resultadoUsuario.error) throw resultadoUsuario.error;
    if (!resultadoUsuario.data) {
      window.location.href = "dashboard.html";
      return;
    }

    const usuarioId = resultadoUsuario.data.id;

    const resultadoAcesso = await window.supabaseClient
      .from("responsaveis_financeiro")
      .select("id")
      .eq("usuario_id", usuarioId)
      .limit(1);

    if (resultadoAcesso.error) throw resultadoAcesso.error;

    if ((resultadoAcesso.data || []).length === 0) {
      window.location.href = "dashboard.html";
      return;
    }

    const anoAtual = new Date().getFullYear();
    const inicioAno = `${anoAtual}-01-01`;
    const fimAno = `${anoAtual}-12-31`;

    const resultadoCobrancas = await window.supabaseClient
      .from("financeiro_cobrancas")
      .select("id, competencia, valor_original, status")
      .eq("usuario_id", usuarioId)
      .eq("tipo", "mensalidade")
      .gte("competencia", inicioAno)
      .lte("competencia", fimAno)
      .order("competencia", { ascending: true });

    if (resultadoCobrancas.error) throw resultadoCobrancas.error;

    const cobrancas = resultadoCobrancas.data || [];
    const abertas = cobrancas.filter(c => c.status === "aberta" || c.status === "parcial");
    const totalAberto = abertas.reduce((total, c) => total + Number(c.valor_original || 0), 0);

    carregarQuadroMensalidades(cobrancas, anoAtual);

    if (!textoSituacaoFinanceira) return;

    if (abertas.length === 0) {
      textoSituacaoFinanceira.textContent = "✅ Você está com todas as mensalidades em dia.";
      return;
    }

    const valor = totalAberto.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });

    textoSituacaoFinanceira.textContent =
      abertas.length === 1
        ? `⚠️ Você está com 1 mensalidade em aberto, totalizando ${valor}.`
        : `⚠️ Você está com ${abertas.length} mensalidades em aberto, totalizando ${valor}.`;

  } catch (erro) {
    console.error("Erro ao carregar Meu Financeiro:", erro);

    if (textoSituacaoFinanceira) {
      textoSituacaoFinanceira.textContent =
        "Não foi possível carregar sua situação financeira.";
    }

    if (textoMensalidades) {
      textoMensalidades.textContent =
        "Não foi possível carregar suas mensalidades.";
    }

    if (listaMensalidades) {
      listaMensalidades.hidden = true;
    }
  }
}

carregarFinanceiroAssociado();
