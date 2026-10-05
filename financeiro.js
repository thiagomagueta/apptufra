"use strict";

const textoSituacaoFinanceira = document.getElementById("textoSituacaoFinanceira");

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
  }
}

carregarFinanceiroAssociado();
