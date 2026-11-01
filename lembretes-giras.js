"use strict";
(async () => {
  const client = window.supabaseClient;
  const area = document.getElementById("proximaAtividadeDashboard");
  if (!client || !area) return;
  const { data: acesso, error } = await client.rpc("gerenciar_lembretes_giras", { p_acao: "autorizado" });
  if (error || !acesso?.autorizado) return;

  const permitidos = ["gira_principal", "gira_desenvolvimento", "aula", "trabalho_cura", "obrigacoes"];
  const formatarData = iso => iso?.split("-").reverse().join("/") || "Conforme calendário";
  const prazo = (iso, dias) => {
    const [ano, mes, dia] = iso.split("-").map(Number);
    const d = new Date(Date.UTC(ano, mes - 1, dia - dias, 12));
    return [String(d.getUTCDate()).padStart(2, "0"), String(d.getUTCMonth() + 1).padStart(2, "0"), d.getUTCFullYear()].join("/");
  };
  const mensagem = async a => {
    const data = formatarData(a.data);
    const horario = a.hora_inicio ? a.hora_inicio.slice(0, 5) : "Conforme calendário";
    const titulo = a.titulo || "Conforme calendário";
    const info = `📅 *Data:* ${data}\n🕗 *Horário:* ${horario}`;
    if (a.tipo_atividade === "gira_desenvolvimento") return `🔔 *LEMBRETE — GIRA DE DESENVOLVIMENTO*\n\nSalve, família TUFRA! 🙏\n\nNossa próxima Gira de Desenvolvimento será:\n\n${info}\n🌿 *Linha de trabalho:* ${titulo}\n\nPedimos a todos que acessem o *APP TUFRA* e registrem sua confirmação de presença ou, caso não possam comparecer, justifiquem sua ausência.\n\nEssa organização é muito importante para o planejamento dos nossos trabalhos espirituais.\n\nAxé a todos! 🙏`;
    if (a.tipo_atividade === "gira_principal") return `🔔 *LEMBRETE — GIRA DA CORRENTE PRINCIPAL*\n\nSalve, família TUFRA! 🙏\n\nEstamos nos preparando para mais um trabalho espiritual em nossa casa!\n\n${info}\n🌿 *Linha de trabalho:* ${titulo}\n\nPedimos que todos os integrantes da Corrente Principal acessem o *APP TUFRA* para confirmar sua presença ou justificar sua ausência.\n\nA participação e o compromisso de cada um são fundamentais para a organização da nossa corrente e o bom andamento dos trabalhos.\n\nAxé e até nossa próxima gira! 🙏`;
    if (a.tipo_atividade === "aula") return `🔔 *LEMBRETE — AULA TUFRA*\n\nSalve, família TUFRA! 🙏\n\nTeremos mais um momento de aprendizado e conhecimento em nossa casa!\n\n📚 *Atividade:* ${titulo}\n${info}\n\nA participação de cada um é muito importante para o nosso crescimento e desenvolvimento espiritual.\n\n🌟 *Lembramos que nossas aulas são abertas a todos!* Familiares, amigos e qualquer pessoa que tenha interesse em conhecer e aprender mais sobre a Umbanda são muito bem-vindos!\n\n*Convide quem você quiser para participar conosco!*\n\nEsperamos vocês para mais esse momento de aprendizado, troca de experiências e fortalecimento da nossa caminhada!\n\nAxé a todos! 🙏`;
    if (a.tipo_atividade === "trabalho_cura") return `🔔 *LEMBRETE — TRABALHO DE CURA*\n\nSalve, família TUFRA! 🙏\n\nTeremos mais um trabalho de cura espiritual em nossa casa!\n\n🌿 *Atividade:* ${titulo}\n${info}\n\n✨ *Médiuns em Desenvolvimento:* As energias desse trabalho são uma importante oportunidade para exercitar a concentração e fortalecer a conexão com nossas entidades.\n\n🤍 *Médiuns da Corrente Principal:* A presença de vocês é fundamental! A cada dia, mais pessoas chegam à nossa casa precisando de acolhimento e auxílio espiritual.\n\n*Contamos com todos para fortalecer nossa corrente e continuar nossa missão de caridade!*\n\nAxé a todos! 🙏`;
    if (a.tipo_atividade === "obrigacoes") {
      const { data: valor, error: erroValor } = await client.rpc("valor_obrigacao_lembrete", { p_atividade_id: a.id });
      if (erroValor || valor == null) throw new Error("Não foi possível consultar o valor desta obrigação no Financeiro.");
      const moeda = Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      return `🔔 *LEMBRETE — OBRIGAÇÃO ESPIRITUAL*\n\nSalve, família TUFRA! 🙏\n\nEstá chegando nossa próxima obrigação!\n\n🕯️ *Obrigação:* ${titulo}\n${info}\n💰 *Valor:* ${moeda}\n\nO valor será destinado à compra de velas, bebidas e demais materiais necessários.\n\n📲 *Confirme sua participação respondendo à enquete no APP TUFRA até ${prazo(a.data, 7)}.*\n\n💳 *Prazo para pagamento: ${prazo(a.data, 4)}.*\n\nLembramos que a participação dos médiuns em Desenvolvimento e dos Cambones é opcional.\n\n⚠️ Após o prazo de confirmação, não será possível incluir novos participantes, pois os materiais serão comprados conforme a quantidade de pessoas confirmadas.\n\nQue Oxalá abençoe a todos! Axé! 🙏`;
    }
    return "";
  };
  let atividadeRenderizada = null;
  const render = () => {
    const a = typeof proximaAtividadeAtualDashboard !== "undefined" ? proximaAtividadeAtualDashboard : null;
    const anterior = document.getElementById("botaoLembreteGira");
    if (!a || !permitidos.includes(a.tipo_atividade)) { anterior?.remove(); atividadeRenderizada = null; return; }
    if (anterior && atividadeRenderizada === a.id) return;
    anterior?.remove();
    atividadeRenderizada = a.id;
    const b = document.createElement("button");
    b.id = "botaoLembreteGira";
    b.type = "button";
    b.textContent = "📲 Enviar lembrete no WhatsApp";
    b.className = "botao-confirmar-presenca-dashboard";
    b.style.cssText = "display:block;width:100%;margin-top:12px;background:#e3f5e9;color:#176c3a;border:1px solid #65ac7d;border-radius:10px;padding:12px;font-weight:700;cursor:pointer";
    b.addEventListener("click", async () => {
      const aba = window.open("about:blank", "_blank");
      b.disabled = true;
      try {
        const texto = await mensagem(a);
        const url = "https://api.whatsapp.com/send?text=" + encodeURIComponent(texto);
        if (aba) aba.location.href = url;
        else window.location.href = url;
      } catch (e) {
        aba?.close();
        alert(e.message || "Não foi possível preparar o lembrete.");
      } finally { b.disabled = false; }
    });
    area.parentElement.appendChild(b);
  };
  new MutationObserver(render).observe(area, { childList: true, subtree: true });
  render();
})();