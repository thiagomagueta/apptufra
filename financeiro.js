"use strict";

const textoSituacaoFinanceira = document.getElementById("textoSituacaoFinanceira");
const textoMensalidades = document.getElementById("textoMensalidades");
const listaMensalidades = document.getElementById("listaMensalidades");
const textoObrigacoes = document.getElementById("textoObrigacoes");
const listaObrigacoes = document.getElementById("listaObrigacoes");
const secaoAcordos = document.getElementById("secaoAcordos");
const listaAcordos = document.getElementById("listaAcordos");
const modalMensalidade = document.getElementById("modalMensalidade");
const tituloModalMensalidade = document.getElementById("tituloModalMensalidade");
const conteudoModalMensalidade = document.getElementById("conteudoModalMensalidade");
const botaoFecharModalMensalidade = document.getElementById("botaoFecharModalMensalidade");
const modalObrigacao = document.getElementById("modalObrigacao");
const tituloModalObrigacao = document.getElementById("tituloModalObrigacao");
const conteudoModalObrigacao = document.getElementById("conteudoModalObrigacao");
const botaoFecharModalObrigacao = document.getElementById("botaoFecharModalObrigacao");

function fecharModalObrigacao() {
  if (!modalObrigacao) return;
  modalObrigacao.hidden = true;
  modalObrigacao.style.display = "none";
}

if (botaoFecharModalObrigacao) {
  botaoFecharModalObrigacao.addEventListener("click", fecharModalObrigacao);
}

if (modalObrigacao) {
  modalObrigacao.addEventListener("click", event => {
    if (event.target === modalObrigacao) fecharModalObrigacao();
  });
}

function fecharModalMensalidade() {
  if (!modalMensalidade) return;
  modalMensalidade.hidden = true;
  modalMensalidade.style.display = "none";
}

if (botaoFecharModalMensalidade) {
  botaoFecharModalMensalidade.addEventListener("click", fecharModalMensalidade);
}

if (modalMensalidade) {
  modalMensalidade.addEventListener("click", event => {
    if (event.target === modalMensalidade) fecharModalMensalidade();
  });
}

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
    cartao.style.cursor = cobranca ? "pointer" : "default";

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
        situacao = cobranca.status === "renegociada" ? "Em acordo" : cobranca.status || "Sem cobrança";
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

    if (cobranca) {
      cartao.addEventListener("click", () => {
        abrirDetalheMensalidade(cobranca);
      });
    }

    listaMensalidades.appendChild(cartao);
  }

  textoMensalidades.textContent = `Mensalidades de ${ano}`;
  listaMensalidades.hidden = false;
}

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

async function abrirDetalheMensalidade(cobranca) {
  try {
    const resultadoAplicacoes = await window.supabaseClient
      .from("financeiro_pagamento_aplicacoes")
      .select("valor_aplicado, recebimento_id")
      .eq("cobranca_id", cobranca.id);

    if (resultadoAplicacoes.error) throw resultadoAplicacoes.error;

    const aplicacoes = resultadoAplicacoes.data || [];
    const totalPago = aplicacoes.reduce(
      (total, item) => total + Number(item.valor_aplicado || 0),
      0
    );

    let dataPagamento = "—";
    let formaPagamento = "—";

    if (aplicacoes.length > 0) {
      const ids = [...new Set(aplicacoes.map(item => item.recebimento_id).filter(Boolean))];

      if (ids.length > 0) {
        const resultadoRecebimentos = await window.supabaseClient
          .from("financeiro_recebimentos")
          .select("id, data_pagamento, forma_pagamento")
          .in("id", ids)
          .order("data_pagamento", { ascending: false });

        if (resultadoRecebimentos.error) throw resultadoRecebimentos.error;

        const recebimentos = resultadoRecebimentos.data || [];
        if (recebimentos.length > 0) {
          dataPagamento = formatarData(recebimentos[0].data_pagamento);
          formaPagamento = recebimentos
            .map(item => item.forma_pagamento)
            .filter(Boolean)
            .filter((item, indice, lista) => lista.indexOf(item) === indice)
            .join(", ") || "—";
        }
      }
    }

    const partes = String(cobranca.competencia || "").split("-");
    const mes = Number(partes[1]);
    const ano = partes[0] || "";
    const nomeMes = nomesMeses[mes - 1] || "Mensalidade";

    const status =
      cobranca.status === "paga" ? "Pago" :
      cobranca.status === "parcial" ? "Parcial" :
      cobranca.status === "aberta" ? "Em aberto" :
      (cobranca.status === "renegociada" ? "Incluída em acordo" : cobranca.status || "—");

    if (!modalMensalidade || !tituloModalMensalidade || !conteudoModalMensalidade) return;

    tituloModalMensalidade.textContent = `${nomeMes}/${ano}`;

    conteudoModalMensalidade.innerHTML = `
      <div style="display:grid; gap:10px;">
        <div><strong>Situação:</strong> ${status}</div>
        <div><strong>Valor devido:</strong> ${formatarMoeda(cobranca.valor_original)}</div>
        <div><strong>Valor pago:</strong> ${formatarMoeda(totalPago)}</div>
        <div><strong>Data do pagamento:</strong> ${dataPagamento}</div>
        <div><strong>Forma de pagamento:</strong> ${formaPagamento}</div>
      </div>
    `;

    modalMensalidade.hidden = false;
    modalMensalidade.style.display = "flex";

  } catch (erro) {
    console.error("Erro ao carregar detalhes da mensalidade:", erro);
    window.alert("Não foi possível carregar os detalhes desta mensalidade.");
  }
}


async function abrirDetalheObrigacao(item) {
  try {
    let totalPago = 0;
    let dataPagamento = "—";
    let formaPagamento = "—";

    if (item.cobranca_id) {
      const resultadoAplicacoes = await window.supabaseClient
        .from("financeiro_pagamento_aplicacoes")
        .select("valor_aplicado, recebimento_id")
        .eq("cobranca_id", item.cobranca_id);

      if (resultadoAplicacoes.error) throw resultadoAplicacoes.error;

      const aplicacoes = resultadoAplicacoes.data || [];
      totalPago = aplicacoes.reduce(
        (total, aplicacao) => total + Number(aplicacao.valor_aplicado || 0),
        0
      );

      const ids = [...new Set(aplicacoes.map(aplicacao => aplicacao.recebimento_id).filter(Boolean))];

      if (ids.length > 0) {
        const resultadoRecebimentos = await window.supabaseClient
          .from("financeiro_recebimentos")
          .select("id, data_pagamento, forma_pagamento")
          .in("id", ids)
          .order("data_pagamento", { ascending: false });

        if (resultadoRecebimentos.error) throw resultadoRecebimentos.error;

        const recebimentos = resultadoRecebimentos.data || [];
        if (recebimentos.length > 0) {
          dataPagamento = formatarData(recebimentos[0].data_pagamento);
          formaPagamento = recebimentos
            .map(recebimento => recebimento.forma_pagamento)
            .filter(Boolean)
            .filter((valor, indice, lista) => lista.indexOf(valor) === indice)
            .join(", ") || "—";
        }
      }
    }

    const situacao = formatarSituacaoObrigacao(item);

    tituloModalObrigacao.textContent = "Detalhes da obrigação";
    conteudoModalObrigacao.innerHTML = `
      <div style="display:grid;gap:10px;">
        <div style="font-weight:700;">${item.descricao}</div>
        <div><strong>Situação:</strong> ${situacao}</div>
        <div><strong>Valor:</strong> ${formatarMoeda(item.valor)}</div>
        <div><strong>Valor pago:</strong> ${formatarMoeda(totalPago)}</div>
        <div><strong>Data do pagamento:</strong> ${dataPagamento}</div>
        <div><strong>Forma de pagamento:</strong> ${formaPagamento}</div>
      </div>
    `;

    modalObrigacao.hidden = false;
    modalObrigacao.style.display = "flex";
  } catch (erro) {
    console.error("Erro ao carregar detalhes da obrigação:", erro);
    window.alert("Não foi possível carregar os detalhes desta obrigação.");
  }
}


function formatarSituacaoObrigacao(item) {
  if (item.situacao === "isento") return "Isento";
  if (item.situacao === "nao_obrigatorio") return "Não obrigatório";
  if (item.cobranca_status === "renegociada") return "Incluída em acordo";
  if (item.cobranca_status === "cancelada") return "Cobrança cancelada";
  if (item.cobranca_status === "paga") return "Pago";
  if (item.cobranca_status === "parcial") return "Parcial";
  if (item.cobranca_status === "aberta") return "Em aberto";
  if (item.situacao === "opcional_confirmado") return "Confirmado";
  return item.situacao || "—";
}

async function carregarObrigacoes(usuarioId) {
  if (!textoObrigacoes || !listaObrigacoes) return;

  const resultadoParticipacoes = await window.supabaseClient
    .from("financeiro_obrigacao_participantes")
    .select("id, obrigacao_id, situacao, origem, cobranca_id")
    .eq("usuario_id", usuarioId)
    .order("id", { ascending: false });

  if (resultadoParticipacoes.error) throw resultadoParticipacoes.error;

  const participacoes = resultadoParticipacoes.data || [];

  if (participacoes.length === 0) {
    textoObrigacoes.textContent = "Você não possui outras obrigações financeiras.";
    listaObrigacoes.hidden = true;
    return;
  }

  const obrigacaoIds = [...new Set(participacoes.map(item => item.obrigacao_id).filter(Boolean))];
  const cobrancaIds = [...new Set(participacoes.map(item => item.cobranca_id).filter(Boolean))];

  let obrigacoes = [];
  let cobrancas = [];

  if (obrigacaoIds.length > 0) {
    const resultadoObrigacoes = await window.supabaseClient
      .from("financeiro_obrigacoes")
      .select("id, valor, orixas")
      .in("id", obrigacaoIds);

    if (resultadoObrigacoes.error) throw resultadoObrigacoes.error;
    obrigacoes = resultadoObrigacoes.data || [];
  }

  if (cobrancaIds.length > 0) {
    const resultadoCobrancas = await window.supabaseClient
      .from("financeiro_cobrancas")
      .select("id, valor_original, descricao, status")
      .in("id", cobrancaIds);

    if (resultadoCobrancas.error) throw resultadoCobrancas.error;
    cobrancas = resultadoCobrancas.data || [];
  }

  const itens = participacoes.map(participacao => {
    const obrigacao = obrigacoes.find(item => item.id === participacao.obrigacao_id) || {};
    const cobranca = cobrancas.find(item => item.id === participacao.cobranca_id) || {};

    return {
      ...participacao,
      valor: cobranca.valor_original ?? obrigacao.valor ?? 0,
      descricao: cobranca.descricao || (
        Array.isArray(obrigacao.orixas) && obrigacao.orixas.length
          ? `Obrigação: ${obrigacao.orixas.join(", ")}`
          : "Obrigação financeira"
      ),
      cobranca_status: cobranca.status || null
    };
  });

  listaObrigacoes.innerHTML = "";
  listaObrigacoes.style.display = "grid";
  listaObrigacoes.style.gap = "10px";

  itens.forEach(item => {
    const situacao = formatarSituacaoObrigacao(item);
    const cartao = document.createElement("div");

    cartao.style.padding = "12px";
    cartao.style.border = "1px solid #d8d8d8";
    cartao.style.borderRadius = "8px";
    cartao.style.background = "#f8f8f8";
    cartao.style.cursor = "pointer";

    if (situacao === "Pago" || situacao === "Isento") {
      cartao.style.borderColor = "#70ad7d";
      cartao.style.background = "#e4f3e8";
    } else if (situacao === "Em aberto" || situacao === "Parcial") {
      cartao.style.borderColor = "#c97575";
      cartao.style.background = "#f7dddd";
    }

    cartao.innerHTML = `
      <div style="font-weight:700; margin-bottom:7px;">${item.descricao}</div>
      <div style="font-size:13px;"><strong>Valor:</strong> ${formatarMoeda(item.valor)}</div>
      <div style="font-size:13px; margin-top:4px;"><strong>Situação:</strong> ${situacao}</div>
    `;

    cartao.addEventListener("click", () => abrirDetalheObrigacao(item));

    listaObrigacoes.appendChild(cartao);
  });

  textoObrigacoes.textContent =
    itens.length === 1
      ? "Você possui 1 outra obrigação registrada."
      : `Você possui ${itens.length} outras obrigações registradas.`;

  listaObrigacoes.hidden = false;
}


async function carregarAcordosEAjustes(usuarioId) {
  if (!secaoAcordos || !listaAcordos) return;

  secaoAcordos.hidden = true;
  listaAcordos.innerHTML = "";

  const [resultadoAcordos, resultadoAjustes] = await Promise.all([
    window.supabaseClient
      .from("financeiro_acordos")
      .select("id, valor_divida_original, valor_acordado, quantidade_parcelas, data_acordo, primeira_parcela, status")
      .eq("usuario_id", usuarioId)
      .neq("status", "cancelado")
      .order("data_acordo", { ascending: false }),

    window.supabaseClient
      .from("financeiro_ajustes_mensalidade")
      .select("id, valor_temporario, inicio_vigencia, fim_vigencia, ativo")
      .eq("usuario_id", usuarioId)
      .eq("ativo", true)
      .order("inicio_vigencia", { ascending: false })
  ]);

  if (resultadoAcordos.error) throw resultadoAcordos.error;
  if (resultadoAjustes.error) throw resultadoAjustes.error;

  const acordos = resultadoAcordos.data || [];
  const ajustes = resultadoAjustes.data || [];

  if (acordos.length === 0 && ajustes.length === 0) return;

  listaAcordos.style.display = "grid";
  listaAcordos.style.gap = "10px";

  for (const acordo of acordos) {
    const resultadoParcelas = await window.supabaseClient
      .from("financeiro_acordo_parcelas")
      .select("numero_parcela, data_vencimento, valor, status, cobranca_id")
      .eq("acordo_id", acordo.id)
      .order("numero_parcela", { ascending: true });

    if (resultadoParcelas.error) throw resultadoParcelas.error;

    const parcelas = resultadoParcelas.data || [];
    const pagas = parcelas.filter(parcela => parcela.status === "paga").length;
    const idsParcelas = parcelas.map(p => p.cobranca_id).filter(Boolean);
    const resultadoPagamentos = idsParcelas.length ? await window.supabaseClient
      .from("financeiro_pagamento_aplicacoes").select("cobranca_id, valor_aplicado")
      .in("cobranca_id", idsParcelas) : { data: [] };
    if (resultadoPagamentos.error) throw resultadoPagamentos.error;
    const saldo = parcelas.filter(p => p.status !== "cancelada").reduce((total,p) =>
      total + Math.max(0, Number(p.valor) - resultadoPagamentos.data.filter(a => a.cobranca_id === p.cobranca_id)
        .reduce((t,a) => t + Number(a.valor_aplicado),0)),0);

    const cartao = document.createElement("div");
    cartao.style.padding = "12px";
    cartao.style.border = "1px solid #d8d8d8";
    cartao.style.borderRadius = "8px";
    cartao.style.background = acordo.status === "quitado" ? "#e4f3e8" : "#f8f8f8";

    cartao.innerHTML = `
      <div style="font-weight:700;margin-bottom:7px;">Acordo de dívida</div>
      <div style="font-size:13px;"><strong>Valor acordado:</strong> ${formatarMoeda(acordo.valor_acordado)}</div>
      <div style="font-size:13px;margin-top:4px;"><strong>Parcelas:</strong> ${pagas} de ${acordo.quantidade_parcelas} pagas</div>
      <div style="font-size:13px;margin-top:4px;"><strong>Saldo restante:</strong> ${formatarMoeda(saldo)}</div>
      <div style="font-size:13px;margin-top:4px;"><strong>Situação:</strong> ${acordo.status === "quitado" ? "Quitado" : "Ativo"}</div>
    `;

    const detalhes = document.createElement("details");
    const resumo = document.createElement("summary");
    resumo.textContent = "Ver origem e parcelas";
    detalhes.appendChild(resumo);
    const origens = await window.supabaseClient.from("financeiro_acordo_origens")
      .select("cobranca_id, valor_incorporado").eq("acordo_id", acordo.id);
    if (origens.error) throw origens.error;
    if (origens.data.length) {
      const cobrancasOriginais = await window.supabaseClient.from("financeiro_cobrancas")
        .select("id, descricao, competencia").in("id", origens.data.map(o => o.cobranca_id));
      if (cobrancasOriginais.error) throw cobrancasOriginais.error;
      origens.data.forEach(o => {
        const c = cobrancasOriginais.data.find(c => c.id === o.cobranca_id);
        const linha = document.createElement("p");
        linha.textContent = `Origem: ${c?.descricao || "Cobrança"} · ${formatarData(c?.competencia)} · ${formatarMoeda(o.valor_incorporado)}`;
        detalhes.appendChild(linha);
      });
    }
    parcelas.forEach(p => {
      const linha = document.createElement("p");
      const pago = resultadoPagamentos.data.filter(a => a.cobranca_id === p.cobranca_id)
        .reduce((t,a) => t + Number(a.valor_aplicado),0);
      linha.textContent = `Parcela ${p.numero_parcela}/${acordo.quantidade_parcelas} · ${formatarData(p.data_vencimento)} · ${formatarMoeda(p.valor)} · ${p.status === "paga" ? "Paga" : p.status === "parcial" ? "Parcial" : "Em aberto"} · saldo ${formatarMoeda(Math.max(0, Number(p.valor)-pago))}`;
      detalhes.appendChild(linha);
    });
    cartao.appendChild(detalhes);
    listaAcordos.appendChild(cartao);
  }

  ajustes.forEach(ajuste => {
    const cartao = document.createElement("div");
    cartao.style.padding = "12px";
    cartao.style.border = "1px solid #d8d8d8";
    cartao.style.borderRadius = "8px";
    cartao.style.background = "#f8f8f8";

    cartao.innerHTML = `
      <div style="font-weight:700;margin-bottom:7px;">Ajuste temporário de mensalidade</div>
      <div style="font-size:13px;"><strong>Valor temporário:</strong> ${formatarMoeda(ajuste.valor_temporario)}</div>
      <div style="font-size:13px;margin-top:4px;"><strong>Vigência:</strong> ${formatarData(ajuste.inicio_vigencia)} a ${formatarData(ajuste.fim_vigencia)}</div>
      <div style="font-size:13px;margin-top:4px;">Após esse período, a mensalidade retorna ao valor normal.</div>
    `;

    listaAcordos.appendChild(cartao);
  });

  secaoAcordos.hidden = false;
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
    let totalAberto = 0;
    if (abertas.length > 0) {
      const resultadoPagamentos = await window.supabaseClient
        .from("financeiro_pagamento_aplicacoes")
        .select("cobranca_id, valor_aplicado")
        .in("cobranca_id", abertas.map(item => item.id));
      if (resultadoPagamentos.error) throw resultadoPagamentos.error;

      const pagamentosPorCobranca = new Map();
      for (const item of resultadoPagamentos.data || []) {
        pagamentosPorCobranca.set(
          item.cobranca_id,
          (pagamentosPorCobranca.get(item.cobranca_id) || 0) + Number(item.valor_aplicado || 0)
        );
      }

      totalAberto = abertas.reduce((total, item) => {
        const pago = pagamentosPorCobranca.get(item.id) || 0;
        return total + Math.max(0, Number(item.valor_original || 0) - pago);
      }, 0);
    }

    carregarQuadroMensalidades(cobrancas, anoAtual);
    await carregarObrigacoes(usuarioId);
    await carregarAcordosEAjustes(usuarioId);

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
