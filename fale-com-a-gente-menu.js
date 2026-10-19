"use strict";
// Todos os elementos começam ocultos; a autorização vem do servidor, nunca do sessionStorage.
(async () => {
  try {
    const r = await window.supabaseClient.rpc('fale_com_a_gente', {p_acao:'acesso'});
    if (r.error || !r.data?.permitido) return;
    const lista = document.querySelector('.lista-acoes-administrativas');
    const pagina = location.pathname.replace(/\/+$/, '').split('/').pop().replace(/\.html$/, '');
    if (pagina === 'dashboard') {
      const atividade = document.getElementById('proximaAtividadeDashboard')?.closest('section');
      if (atividade) {
        const card = document.createElement('section');
        card.className = 'cartao-app';
        card.innerHTML = '<h2>💬 Fale com a gente</h2><p>Precisa de ajuda, quer compartilhar uma dificuldade ou deixar uma sugestão? Este espaço é seu.</p><div class="fale-acoes"><a class="fale-botao" href="fale-com-a-gente.html?novo=1">Escrever uma mensagem</a><a class="fale-botao secundario" href="fale-com-a-gente.html">Acompanhar minhas mensagens <span id="faleAvisosMeus"></span></a></div>';
        atividade.after(card);
      }
    } else if (pagina === 'administrativo' && lista) {
      const a = document.createElement('a');
      a.className = 'item-acao-administrativa';
      a.href = 'fale-com-a-gente.html?equipe=1';
      a.innerHTML = '<div class="conteudo-item-adm"><strong class="titulo-item-adm">Atendimentos — Fale com a gente <span id="faleAvisosEquipe"></span></strong><span class="descricao-item-adm">Relatos, respostas e histórico dos associados.</span></div><span class="seta-permissao-lista">›</span>';
      lista.append(a);
    } else if (pagina === 'adm-permissoes' && lista) {
      const a = document.createElement('a');
      a.className = 'item-acao-administrativa';
      a.href = 'fale-com-a-gente.html?responsaveis=1';
      a.innerHTML = '<span>Responsáveis — Fale com a gente</span><span class="seta-permissao-lista">›</span>';
      lista.append(a);
    }
    async function avisos() {
      if (document.hidden) return;
      const avisos = await window.supabaseClient.rpc('fale_com_a_gente', {p_acao:'avisos'});
      if (avisos.error) return;
      for (const [id, campo] of [['faleAvisosMeus','meus'],['faleAvisosEquipe','equipe']]) {
        const el = document.getElementById(id);
        if (el) el.textContent = avisos.data[campo] ? `(${avisos.data[campo]})` : '';
      }
    }
    await avisos();
    setInterval(() => avisos().catch(console.error), 30000);
  } catch (e) { console.error('Erro ao carregar Fale com a gente:', e); }
})();
