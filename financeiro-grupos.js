"use strict";
(() => {
  const el = id => document.getElementById(id);
  const estado = { usuarios: [], grupos: [], integrantes: [], base: null, grupo: null, acao: "criar", selecionados: new Set(), ocupado: false, retornoFoco: null, desfazer: null };
  const cliente = () => window.supabaseClient;
  const nome = id => estado.usuarios.find(u => u.id === id)?.nome_completo || "Associado";
  const normalizar = texto => String(texto || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  function hoje() {
    const partes = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
    const obter = tipo => partes.find(p => p.type === tipo).value;
    return obter("year") + "-" + obter("month") + "-" + obter("day");
  }
  function mensagem(texto) { el("mensagemGrupos").textContent = texto; }
  function disponiveis() {
    const ocupados = new Set(estado.integrantes.filter(i => i.fim_vigencia === null || i.fim_vigencia > hoje()).map(i => i.usuario_id));
    return estado.usuarios.filter(u => u.status === "ativo" && !ocupados.has(u.id));
  }
  function criarBotao(texto, acao, secundario = false) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "botao-grupo" + (secundario ? " botao-secundario" : "");
    b.textContent = texto; b.disabled = estado.ocupado; b.addEventListener("click", acao);
    return b;
  }
  function listarPessoas(destino, pessoas, tipo, selecionado, alterar) {
    destino.replaceChildren();
    if (!pessoas.length) {
      const p = document.createElement("p"); p.textContent = "Nenhuma pessoa disponível."; destino.appendChild(p); return;
    }
    pessoas.forEach(u => {
      const label = document.createElement("label"); label.className = "pessoa-grupo";
      const input = document.createElement("input"); input.type = tipo; input.name = tipo === "radio" ? "pessoaBase" : "integrantes";
      input.value = u.id; input.checked = selecionado(u.id); input.disabled = estado.ocupado;
      input.addEventListener("change", () => alterar(u.id, input.checked));
      const span = document.createElement("span"); span.textContent = u.nome_completo;
      label.append(input, span); destino.appendChild(label);
    });
  }
  function renderDisponiveis() {
    const filtro = normalizar(el("buscarPessoa").value);
    const pessoas = disponiveis().filter(u => normalizar(u.nome_completo).includes(filtro));
    if (!disponiveis().some(u => u.id === estado.base)) estado.base = null;
    listarPessoas(el("listaDisponiveis"), pessoas, "radio", id => estado.base === id, id => {
      estado.base = id; el("iniciarVinculo").disabled = estado.ocupado || !estado.base;
    });
    el("iniciarVinculo").disabled = estado.ocupado || !estado.base;
  }
  function renderSelecionar() {
    const pessoas = disponiveis().filter(u => u.id !== estado.base);
    estado.selecionados = new Set([...estado.selecionados].filter(id => pessoas.some(u => u.id === id)));
    const filtro = normalizar(el("buscarIntegrantes").value);
    listarPessoas(el("listaSelecionarPessoas"), pessoas.filter(u => normalizar(u.nome_completo).includes(filtro)), "checkbox",
      id => estado.selecionados.has(id), (id, marcado) => {
        if (marcado) estado.selecionados.add(id); else estado.selecionados.delete(id);
        atualizarResumo();
      });
    atualizarResumo();
  }
  function atualizarResumo() {
    const ids = [...estado.selecionados];
    el("resumoSelecionados").textContent = ids.length ? "Selecionados: " + ids.map(nome).join(", ") : "Marque pelo menos uma pessoa.";
    el("confirmarVinculo").disabled = estado.ocupado || !ids.length;
  }
  function abrirModal(id) {
    estado.retornoFoco = document.activeElement;
    el(id).hidden = false;
    el(id).querySelector("input, button")?.focus();
  }
  function fecharModal(id) {
    if (estado.ocupado) return;
    el(id).hidden = true; estado.retornoFoco?.focus();
  }
  function selecionar(acao, grupo = null) {
    if (estado.ocupado || (acao === "criar" && !estado.base)) return;
    estado.acao = acao; estado.grupo = grupo; estado.selecionados.clear();
    if (acao === "adicionar") estado.base = null;
    el("tituloSelecionarPessoas").textContent = acao === "criar" ? "Vincular pessoas" : "Adicionar pessoas";
    el("resumoPessoaBase").textContent = acao === "criar" ? "Pessoa selecionada: " + nome(estado.base) : "Marque as pessoas que deseja adicionar a este vínculo.";
    el("buscarIntegrantes").value = ""; renderSelecionar(); abrirModal("modalSelecionarPessoas");
  }
  function prepararDesfazer(grupo, usuario = null) {
    if (estado.ocupado) return;
    estado.desfazer = { grupo, usuario };
    const membros = estado.integrantes.filter(i => i.grupo_id === grupo && i.fim_vigencia === null);
    el("resumoDesfazerVinculo").textContent = usuario
      ? "Retirar " + nome(usuario) + " deste vínculo?" + (membros.length <= 2 ? " Como restaria apenas uma pessoa, o vínculo inteiro será encerrado." : "")
      : "Desfazer o vínculo entre " + membros.map(i => nome(i.usuario_id)).join(", ") + "?";
    abrirModal("modalDesfazerVinculo");
  }
  function renderGrupos() {
    const lista = el("listaGruposVinculados"); lista.replaceChildren();
    const grupos = estado.grupos.filter(g => g.ativo);
    if (!grupos.length) { const p = document.createElement("p"); p.textContent = "Nenhum grupo vinculado."; lista.appendChild(p); }
    grupos.forEach(g => {
      const membros = estado.integrantes.filter(i => i.grupo_id === g.id && i.fim_vigencia === null);
      const card = document.createElement("div"); card.className = "cartao-grupo";
      const h = document.createElement("h3"); h.textContent = membros.map(i => nome(i.usuario_id)).join(" + ") || "Grupo sem integrantes ativos"; card.appendChild(h);
      membros.forEach(i => {
        const linha = document.createElement("div"); linha.className = "cartao-grupo";
        const p = document.createElement("p"); p.textContent = nome(i.usuario_id); linha.appendChild(p);
        if (i.inicio_vigencia > hoje()) { const data = document.createElement("p"); data.textContent = "Início do novo vínculo: " + i.inicio_vigencia.split("-").reverse().join("/"); linha.appendChild(data); }
        linha.appendChild(criarBotao("Desfazer vínculo desta pessoa", () => prepararDesfazer(g.id, i.usuario_id), true));
        card.appendChild(linha);
      });
      const acoes = document.createElement("div"); acoes.className = "acoes-grupos";
      acoes.append(criarBotao("Adicionar pessoas", () => selecionar("adicionar", g.id)),
        criarBotao("Desfazer todo o vínculo", () => prepararDesfazer(g.id), true));
      card.appendChild(acoes); lista.appendChild(card);
    });
  }
  async function carregarDados() {
    const resultados = await Promise.all([
      cliente().from("usuarios").select("id,nome_completo,status").order("nome_completo").range(0,999),
      cliente().from("financeiro_grupos_compartilhados").select("id,ativo").order("id").range(0,999),
      cliente().from("financeiro_grupo_integrantes").select("id,grupo_id,usuario_id,inicio_vigencia,fim_vigencia").order("id").range(0,999)
    ]);
    resultados.forEach(r => { if (r.error) throw r.error; if (r.data?.length === 1000) throw new Error("A lista atingiu o limite de consulta. Não foi possível carregar todos os vínculos."); });
    [estado.usuarios, estado.grupos, estado.integrantes] = resultados.map(r => r.data || []);
    renderDisponiveis(); renderGrupos();
  }
  function ocupar(ocupado) {
    estado.ocupado = ocupado;
    document.querySelectorAll("#conteudoGrupos button, #secaoVincular button, #secaoVincular input, #secaoVinculados button, .modal-grupo button, .modal-grupo input").forEach(b => { b.disabled = ocupado; });
    if (!ocupado) { el("iniciarVinculo").disabled = !estado.base; atualizarResumo(); }
  }
  async function operar(acao, grupo, ids) {
    if (estado.ocupado) return;
    ocupar(true); mensagem("Salvando vínculo...");
    let salvo = false;
    let atualizado = false;
    try {
      const r = await cliente().rpc("financeiro_grupo_operar", { p_acao: acao, p_grupo_id: grupo, p_usuarios: ids });
      if (r.error) throw r.error;
      salvo = true;
      el("modalSelecionarPessoas").hidden = true; el("modalDesfazerVinculo").hidden = true;
      estado.base = null; estado.selecionados.clear();
      await carregarDados();
      atualizado = true;
      mensagem("Vínculo atualizado. As cobranças já emitidas foram preservadas.");
      estado.retornoFoco?.focus();
    } catch (erro) {
      console.error("Erro ao administrar grupos:", erro);
      mensagem(salvo ? "O vínculo foi salvo, mas a lista não atualizou. Recarregue a página antes de continuar." : "Não foi possível salvar: " + (erro.message || "tente novamente."));
    } finally {
      if (!salvo || atualizado) ocupar(false);
    }
  }
  el("abrirVincular").addEventListener("click", () => { el("secaoVincular").hidden = false; el("secaoVinculados").hidden = true; estado.base = null; renderDisponiveis(); el("buscarPessoa").focus(); });
  el("abrirVinculados").addEventListener("click", () => { el("secaoVincular").hidden = true; el("secaoVinculados").hidden = false; renderGrupos(); });
  el("buscarPessoa").addEventListener("input", renderDisponiveis);
  el("buscarIntegrantes").addEventListener("input", renderSelecionar);
  el("iniciarVinculo").addEventListener("click", () => selecionar("criar"));
  el("confirmarVinculo").addEventListener("click", () => {
    if (!estado.selecionados.size) return;
    const ids = [...estado.selecionados]; if (estado.acao === "criar") ids.unshift(estado.base);
    operar(estado.acao, estado.grupo, ids);
  });
  el("confirmarDesfazer").addEventListener("click", () => {
    const d = estado.desfazer; if (!d) return;
    operar(d.usuario ? "retirar" : "desfazer", d.grupo, d.usuario ? [d.usuario] : null);
  });
  [["cancelarVinculo","modalSelecionarPessoas"],["cancelarDesfazer","modalDesfazerVinculo"]].forEach(([b,m]) => el(b).addEventListener("click", () => fecharModal(m)));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") { fecharModal("modalSelecionarPessoas"); fecharModal("modalDesfazerVinculo"); }
    if (event.key === "Tab") {
      const modal = ["modalSelecionarPessoas","modalDesfazerVinculo"].map(el).find(m => !m.hidden);
      if (!modal) return;
      const itens = [...modal.querySelectorAll("input:not(:disabled),button:not(:disabled)")];
      if (!itens.length) return;
      if (event.shiftKey && document.activeElement === itens[0]) { event.preventDefault(); itens[itens.length-1].focus(); }
      else if (!event.shiftKey && document.activeElement === itens[itens.length-1]) { event.preventDefault(); itens[0].focus(); }
    }
  });
  async function iniciar() {
    try {
      if (!cliente()) throw new Error("Conexão indisponível.");
      const s = await cliente().auth.getSession(); if (s.error) throw s.error;
      if (!s.data.session) { window.location.href = "index.html"; return; }
      const acesso = await cliente().rpc("usuario_pode_acessar_financeiro"); if (acesso.error) throw acesso.error;
      if (acesso.data !== true) { window.location.href = "dashboard.html"; return; }
      await carregarDados(); el("conteudoGrupos").hidden = false;
      mensagem("Escolha uma das opções abaixo.");
    } catch (erro) { console.error("Erro ao carregar grupos:", erro); mensagem("Não foi possível carregar os grupos. " + (erro.message || "")); }
  }
  iniciar();
})();
