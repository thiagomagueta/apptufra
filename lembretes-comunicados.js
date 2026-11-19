"use strict";
(async () => {
  const client = window.supabaseClient;
  if (!client) return;
  const {data: acesso, error: erroAcesso} = await client.rpc("gerenciar_lembretes_giras", {p_acao:"autorizado"});
  if (erroAcesso || !acesso?.autorizado) return;

  function datasDoTexto(texto) {
    const t = String(texto || "");
    const encontradas = [...t.matchAll(/\b\d{1,2}\/\d{1,2}(?:\/\d{4})?\b/g)].map(m => m[0]);
    const prazo = t.match(/(?:confirma(?:ção|r)|responder|participa(?:ção|r))[^.!?\n]{0,130}?(?:até|prazo)\s*(?:o\s+dia\s*)?(\d{1,2}\/\d{1,2}(?:\/\d{4})?)/i)
      || t.match(/(?:até|prazo)\s*(?:o\s+dia\s*)?(\d{1,2}\/\d{1,2}(?:\/\d{4})?)[^.!?\n]{0,100}?(?:confirma(?:ção|r)|responder|participa(?:ção|r))/i);
    const evento = t.match(/(?:acontecerá|teremos|ocorrerá|realizada|realizado)[^.!?\n]{0,120}?\b(?:dia|em)\s*(\d{1,2}\/\d{1,2}(?:\/\d{4})?)/i)
      || t.match(/\b(?:dia|em)\s*(\d{1,2}\/\d{1,2}(?:\/\d{4})?)[^.!?\n]{0,100}?(?:obriga(?:ção|ções)|teremos)/i);
    return {evento:evento?.[1] || (encontradas.length === 1 ? encontradas[0] : null), prazo:prazo?.[1] || null};
  }

  async function mensagem(comunicado) {
    const titulo = String(comunicado.titulo || "Comunicado").trim();
    const enquete = comunicado.tipo === "enquete";
    const obrigacao = /obriga(?:ção|ções)/i.test(titulo);
    const nome = titulo.replace(/^obriga(?:ção|ções)\s*(?:de|do|da|dos|das)?\s*/i,"").trim();
    const datas = datasDoTexto(comunicado.mensagem);
    const linhas = ["🔔 *LEMBRETE – "+titulo.toLocaleUpperCase("pt-BR")+"*","","Saravá, família TUFRA! 🤍🕊️",""];
    if (obrigacao && datas.evento) linhas.push("Passando para lembrar da nossa obrigação de *"+nome+"*, que acontecerá no dia *"+datas.evento+"*.","");
    else linhas.push("Passando para lembrar: *"+titulo+"*.","");
    if (enquete) {
      if (datas.prazo) linhas.push("📅 *Confirmação de participação:* até *"+datas.prazo+"*, diretamente na enquete do aplicativo.","");
      if (obrigacao) linhas.push("⚠️ *Importante:* Precisamos da confirmação de todos, inclusive daqueles que não poderão participar, para organizarmos a compra dos materiais necessários.","");
      const {data,error} = await client.rpc("obter_resultado_publico_enquete",{p_comunicado_id:comunicado.id});
      if (error) throw error;
      const resumo = Array.isArray(data) ? data[0] : data;
      if (!resumo || !["total_aptos","total_responderam","faltam_votar"].every(k => resumo[k] != null && Number.isFinite(Number(resumo[k])))) throw new Error("Não foi possível consultar a contagem da enquete.");
      const total = Number(resumo.total_aptos), respondidos = Number(resumo.total_responderam), faltam = Number(resumo.faltam_votar);
      linhas.push("📊 *Situação da enquete:*","✅ *"+respondidos+" de "+total+" pessoas* já responderam.",faltam ? "🔴 *Ainda faltam "+faltam+" "+(faltam === 1 ? "pessoa responder!" : "pessoas responderem!")+"*" : "✅ *Todos já responderam à enquete!*","");
      linhas.push("🙏 Pedimos que acessem o *App TUFRA* e registrem sua resposta dentro do prazo.","");
    } else if (comunicado.mensagem) linhas.push(comunicado.mensagem.trim(),"");
    linhas.push("*Axé, família TUFRA!* 🤍");
    return linhas.join("\n");
  }

  function criarBotao(comunicado) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "botao-confirmar-presenca-dashboard";
    botao.textContent = "📲 Enviar lembrete no WhatsApp";
    botao.style.cssText = "display:block;width:100%;margin-top:12px;background:#e3f5e9;color:#176c3a;border:1px solid #65ac7d;border-radius:10px;padding:12px;font-weight:700;cursor:pointer";
    botao.addEventListener("click",async () => {
      const aba = window.open("about:blank","_blank");
      botao.disabled = true;
      try {
        const texto = await mensagem(comunicado);
        const url = "https://api.whatsapp.com/send?text="+encodeURIComponent(texto);
        if (aba) aba.location.href = url; else window.location.href = url;
      } catch(e) {
        aba?.close();
        alert(e.message || "Não foi possível preparar o lembrete.");
      } finally {botao.disabled = false;}
    });
    return botao;
  }

  function renderizar() {
    if (typeof comunicadosAtivos === "undefined") return;
    const cards = document.querySelectorAll("#listaComunicadosDashboard .item-comunicado-dashboard");
    cards.forEach((card,indice) => {
      if (card.querySelector(".botao-lembrete-comunicado")) return;
      const comunicado = comunicadosAtivos[indice];
      if (!comunicado) return;
      const botao = criarBotao(comunicado);
      botao.classList.add("botao-lembrete-comunicado");
      const publicado = card.querySelector(".publicado-por-comunicado-dashboard");
      if (publicado) publicado.before(botao); else card.appendChild(botao);
    });
    const popup = document.getElementById("popupComunicadoDashboard");
    const anterior = document.getElementById("botaoLembretePopupComunicado");
    const atual = typeof comunicadoPopupAtual !== "undefined" ? comunicadoPopupAtual : null;
    if (!popup || popup.hidden || !atual) {anterior?.remove();return;}
    if (anterior?.dataset.comunicadoId === String(atual.id)) return;
    anterior?.remove();
    const botao = criarBotao(atual);
    botao.id = "botaoLembretePopupComunicado";
    botao.dataset.comunicadoId = String(atual.id);
    document.getElementById("botaoFecharPopupComunicadoDashboardInferior")?.before(botao);
  }

  const lista = document.getElementById("listaComunicadosDashboard");
  const popup = document.getElementById("popupComunicadoDashboard");
  const observer = new MutationObserver(() => renderizar());
  if (lista) observer.observe(lista,{childList:true});
  if (popup) observer.observe(popup,{attributes:true,attributeFilter:["hidden"]});
  renderizar();
})();