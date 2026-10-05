"use strict";

const textoHistorico = document.getElementById("textoHistorico");
const listaHistorico = document.getElementById("listaHistorico");

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function formatarData(dataISO) {
  if (!dataISO) return "—";
  const partes = String(dataISO).split("-");
  if (partes.length !== 3) return dataISO;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatarFormaPagamento(forma) {
  const nomes = {
    pix: "PIX",
    dinheiro: "Dinheiro",
    debito: "Débito",
    credito: "Crédito"
  };
  return nomes[forma] || forma || "—";
}

function descreverCobranca(cobranca) {
  if (!cobranca) return "Pagamento";

  if (cobranca.tipo === "mensalidade" && cobranca.competencia) {
    const partes = String(cobranca.competencia).split("-");
    const meses = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const mes = meses[Number(partes[1]) - 1] || "";
    return `Mensalidade ${mes}/${partes[0]}`;
  }

  return cobranca.descricao || "Pagamento financeiro";
}

async function carregarHistorico() {
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

    const resultadoRecebimentos = await window.supabaseClient
      .from("financeiro_recebimentos")
      .select("id, valor_recebido, forma_pagamento, data_pagamento")
      .eq("usuario_id", usuarioId)
      .order("data_pagamento", { ascending: false });

    if (resultadoRecebimentos.error) throw resultadoRecebimentos.error;

    const recebimentos = resultadoRecebimentos.data || [];

    if (recebimentos.length === 0) {
      textoHistorico.textContent = "Nenhum pagamento foi registrado até o momento.";
      listaHistorico.hidden = true;
      return;
    }

    const recebimentoIds = recebimentos.map(item => item.id);

    const resultadoAplicacoes = await window.supabaseClient
      .from("financeiro_pagamento_aplicacoes")
      .select("recebimento_id, cobranca_id, valor_aplicado")
      .in("recebimento_id", recebimentoIds);

    if (resultadoAplicacoes.error) throw resultadoAplicacoes.error;

    const aplicacoes = resultadoAplicacoes.data || [];
    const cobrancaIds = [...new Set(aplicacoes.map(item => item.cobranca_id).filter(Boolean))];

    let cobrancas = [];

    if (cobrancaIds.length > 0) {
      const resultadoCobrancas = await window.supabaseClient
        .from("financeiro_cobrancas")
        .select("id, tipo, competencia, descricao")
        .in("id", cobrancaIds);

      if (resultadoCobrancas.error) throw resultadoCobrancas.error;
      cobrancas = resultadoCobrancas.data || [];
    }

    listaHistorico.innerHTML = "";
    listaHistorico.style.display = "grid";
    listaHistorico.style.gap = "10px";

    recebimentos.forEach(recebimento => {
      const aplicacoesDoRecebimento = aplicacoes.filter(
        item => item.recebimento_id === recebimento.id
      );

      const descricoes = aplicacoesDoRecebimento.map(aplicacao => {
        const cobranca = cobrancas.find(item => item.id === aplicacao.cobranca_id);
        return descreverCobranca(cobranca);
      });

      const descricao = [...new Set(descricoes)].join(" + ") || "Pagamento financeiro";

      const cartao = document.createElement("div");
      cartao.style.padding = "12px";
      cartao.style.border = "1px solid #70ad7d";
      cartao.style.borderRadius = "8px";
      cartao.style.background = "#e4f3e8";

      cartao.innerHTML = `
        <div style="font-weight:700;margin-bottom:7px;">${descricao}</div>
        <div style="font-size:13px;"><strong>Data:</strong> ${formatarData(recebimento.data_pagamento)}</div>
        <div style="font-size:13px;margin-top:4px;"><strong>Valor recebido:</strong> ${formatarMoeda(recebimento.valor_recebido)}</div>
        <div style="font-size:13px;margin-top:4px;"><strong>Forma de pagamento:</strong> ${formatarFormaPagamento(recebimento.forma_pagamento)}</div>
      `;

      listaHistorico.appendChild(cartao);
    });

    textoHistorico.textContent =
      recebimentos.length === 1
        ? "1 pagamento encontrado."
        : `${recebimentos.length} pagamentos encontrados.`;

    listaHistorico.hidden = false;

  } catch (erro) {
    console.error("Erro ao carregar histórico financeiro:", erro);
    textoHistorico.textContent = "Não foi possível carregar seu histórico financeiro.";
    listaHistorico.hidden = true;
  }
}

carregarHistorico();
