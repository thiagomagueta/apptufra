"use strict";
(async () => {
  const client = window.supabaseClient;
  const area = document.getElementById("proximaAtividadeDashboard");
  if (!client || !area) return;
  const { data, error } = await client.rpc("gerenciar_lembretes_giras", { p_acao: "autorizado" });
  if (error || !data?.autorizado) return;
  const mensagem = a => {
    const desenv = a.tipo_atividade === "gira_desenvolvimento";
    const data = a.data.split("-").reverse().join("/");
    const horario = a.hora_inicio ? a.hora_inicio.slice(0, 5) : "Conforme calendário";
    const cabecalho = desenv ? "GIRA DE DESENVOLVIMENTO" : "GIRA DA CORRENTE PRINCIPAL";
    const intro = desenv ? "Nossa próxima Gira de Desenvolvimento será:" : "Estamos nos preparando para mais um trabalho espiritual em nossa casa!";
    const pedido = desenv ? "Pedimos a todos que acessem o *APP TUFRA* e registrem sua confirmação de presença ou, caso não possam comparecer, justifiquem sua ausência." : "Pedimos que todos os integrantes da Corrente Principal acessem o *APP TUFRA* para confirmar sua presença ou justificar sua ausência.";
    const final = desenv ? "Essa organização é muito importante para o planejamento dos nossos trabalhos espirituais.\n\nAxé a todos! 🙏" : "A participação e o compromisso de cada um são fundamentais para a organização da nossa corrente e o bom andamento dos trabalhos.\n\nAxé e até nossa próxima gira! 🙏";
    return `🔔 *LEMBRETE — ${cabecalho}*\n\nSalve, família TUFRA! 🙏\n\n${intro}\n\n📅 *Data:* ${data}\n🕗 *Horário:* ${horario}\n🌿 *Linha de trabalho:* ${a.titulo || "Conforme calendário"}\n\n${pedido}\n\n${final}`;
  };
  const render = () => {
    const a = typeof proximaAtividadeAtualDashboard !== "undefined" ? proximaAtividadeAtualDashboard : null;
    const anterior = document.getElementById("botaoLembreteGira");
    if (!a || !["gira_principal", "gira_desenvolvimento"].includes(a.tipo_atividade)) { anterior?.remove(); return; }
    if (anterior) return;
    const b = document.createElement("button");
    b.id = "botaoLembreteGira";
    b.type = "button";
    b.textContent = "📲 Enviar lembrete no WhatsApp";
    b.className = "botao-confirmar-presenca-dashboard";
    b.style.cssText = "display:block;width:100%;margin-top:12px;background:#e3f5e9;color:#176c3a;border:1px solid #65ac7d;border-radius:10px;padding:12px;font-weight:700;cursor:pointer";
    b.addEventListener("click", () => window.open("https://api.whatsapp.com/send?text=" + encodeURIComponent(mensagem(a)), "_blank", "noopener"));
    area.parentElement.appendChild(b);
  };
  new MutationObserver(render).observe(area, { childList: true, subtree: true });
  render();
})();