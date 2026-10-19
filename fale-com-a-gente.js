"use strict";
(() => {
  const params = new URLSearchParams(location.search);
  const equipe = params.get('equipe') === '1';
  const responsaveis = params.get('responsaveis') === '1';
  const conteudo = document.getElementById('faleConteudo');
  const aviso = document.getElementById('faleMensagem');
  const titulo = document.getElementById('faleTitulo');
  const voltar = document.getElementById('faleVoltar');
  const situacoes = {nao_lido:'Não lido',lido:'Lido',em_acompanhamento:'Em acompanhamento',aguardando_confirmacao:'Aguardando confirmação de encerramento',finalizado:'Finalizado'};
  const avaliacoes = {satisfeito:'😊 Satisfeito',parcialmente_satisfeito:'😐 Parcialmente satisfeito',nao_satisfeito:'🙁 Não satisfeito'};
  let offset = 0;
  let busy = false;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const data = value => value ? new Date(value).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo',dateStyle:'short',timeStyle:'short'}) : '';
  const badge = s => `<span class="fale-situacao">${esc(situacoes[s] || s)}</span>`;
  function informar(texto = '', erro = false) { aviso.textContent = texto; aviso.classList.toggle('erro', erro); }
  async function rpc(acao, dados = {}) {
    const r = await window.supabaseClient.rpc('fale_com_a_gente',{p_acao:acao,p_dados:{...dados,equipe}});
    if (r.error) throw new Error(r.error.message || 'Não foi possível concluir a operação.');
    return r.data;
  }
  async function executar(botao, acao) {
    if (busy) return;
    busy = true;
    if (botao) botao.disabled = true;
    informar();
    try { await acao(); } catch (e) { informar(e.message, true); }
    finally { busy = false; if (botao?.isConnected) botao.disabled = false; }
  }
  function formSubmit(id, fn) {
    const form = document.getElementById(id);
    form.addEventListener('submit', e => {e.preventDefault(); executar(form.querySelector('[type=submit]'),()=>fn(new FormData(form)));});
  }
  function novo() {
    titulo.textContent = 'Escrever uma mensagem';
    conteudo.innerHTML = `<section class="cartao-app"><form id="formNovo">
      <label class="fale-campo">Tipo de mensagem<select name="categoria" required>${['Pedido de ajuda','Sugestão','Dificuldade','Relato','Outro'].map(x=>`<option>${x}</option>`).join('')}</select></label>
      <label class="fale-campo">Assunto<input name="assunto" required maxlength="160" placeholder="Sobre o que você quer conversar?"></label>
      <label class="fale-campo">Mensagem<textarea name="texto" required maxlength="10000" placeholder="Escreva aqui sua mensagem."></textarea></label>
      <button class="fale-botao" type="submit">Enviar mensagem</button></form></section><a class="fale-historico" href="fale-com-a-gente.html">Acompanhar minhas mensagens</a>`;
    formSubmit('formNovo',async f=>{
      const r = await rpc('criar',Object.fromEntries(f));
      location.href = `fale-com-a-gente.html?id=${encodeURIComponent(r.id)}`;
    });
  }
  function filtroSituacao() { return '<option value="">Todas as situações</option>'+Object.entries(situacoes).map(([k,v])=>`<option value="${k}">${v}</option>`).join(''); }
  async function listar() {
    titulo.textContent = equipe ? 'Atendimentos — Fale com a gente' : 'Minhas mensagens';
    conteudo.innerHTML = `${!equipe ? '<a class="fale-botao" href="fale-com-a-gente.html?novo=1">Escrever uma mensagem</a>' : ''}
      <section class="cartao-app"><form id="formFiltros" class="fale-filtros">
      <label class="fale-campo largo">${equipe?'Nome ou assunto':'Assunto'}<input name="busca" maxlength="160"></label>
      <label class="fale-campo largo">Situação<select name="situacao">${filtroSituacao()}</select></label>
      <label class="fale-campo">Desde<input type="date" name="inicio"></label><label class="fale-campo">Até<input type="date" name="fim"></label>
      <button type="submit" class="fale-botao largo">Filtrar</button></form>
      <div id="filtroPessoa"></div></section><div class="fale-lista" id="listaFale"></div>
      <div class="fale-acoes"><button class="fale-botao secundario" id="maisFale" hidden>Carregar mais</button><button class="fale-botao secundario" id="atualizarFale">Atualizar lista</button></div>`;
    async function carregar(mais = false) {
      const filtros = Object.fromEntries(new FormData(document.getElementById('formFiltros')));
      if (filtros.inicio && filtros.fim && filtros.inicio>filtros.fim) throw new Error('A data inicial deve ser anterior à final.');
      if (!mais) {offset=0; document.getElementById('listaFale').replaceChildren();}
      const r = await rpc('listar',{...filtros,usuario_id:params.get('usuario_id') || '',offset});
      const lista = document.getElementById('listaFale');
      for (const a of r.atendimentos) {
        const card = document.createElement('article'); card.className='fale-item';
        card.innerHTML = `<a href="fale-com-a-gente.html?id=${encodeURIComponent(a.id)}${equipe?'&equipe=1':''}" style="color:inherit;text-decoration:none"><strong>${esc(a.assunto)}</strong>${equipe?`<small>${esc(a.nome)}</small>`:''}<small>${esc(a.categoria)} · ${data(a.criado_em)}</small>${badge(a.situacao)}${a.novo?'<span class="fale-novo">Nova mensagem</span>':''}${a.avaliacao?`<small style="margin-top:8px">${esc(avaliacoes[a.avaliacao])}</small>`:''}</a>${equipe?`<br><a class="fale-historico" href="fale-com-a-gente.html?equipe=1&usuario_id=${encodeURIComponent(a.usuario_id)}">Histórico deste associado</a>`:''}`;
        lista.append(card);
      }
      if (!mais && !r.atendimentos.length) lista.textContent='Nenhum atendimento encontrado.';
      offset += r.atendimentos.length;
      document.getElementById('maisFale').hidden = r.atendimentos.length < 50;
    }
    if (params.get('usuario_id')) document.getElementById('filtroPessoa').innerHTML='<p>Exibindo o histórico deste associado.</p><a href="fale-com-a-gente.html?equipe=1">Ver todos os associados</a>';
    formSubmit('formFiltros',()=>carregar());
    document.getElementById('maisFale').onclick=e=>executar(e.currentTarget,()=>carregar(true));
    document.getElementById('atualizarFale').onclick=e=>executar(e.currentTarget,()=>carregar());
    await carregar();
  }
  async function detalhe(id) {
    const r = await rpc('detalhe',{id});
    const a = r.atendimento;
    titulo.textContent = a.assunto;
    const encerrado = a.situacao === 'finalizado';
    conteudo.innerHTML = `<section class="cartao-app"><p>${badge(a.situacao)}</p><p class="fale-meta">${equipe?esc(a.nome)+'<br>':''}${esc(a.categoria)} · Enviado em ${data(a.criado_em)}${a.finalizado_em?'<br>Finalizado em '+data(a.finalizado_em):''}</p>
      ${equipe?`<a class="fale-historico" href="fale-com-a-gente.html?equipe=1&usuario_id=${encodeURIComponent(a.usuario_id)}">Histórico deste associado</a>`:''}</section>
      <section class="cartao-app" aria-label="Conversa">${r.mensagens.map(m=>`<article class="fale-mensagem ${esc(m.tipo)}"><strong>${esc(m.autor_nome)}${m.tipo==='interna'?' · Anotação interna':m.tipo==='encerramento'?' · Encerramento':''}</strong><small>${data(m.criado_em)}</small><p>${esc(m.texto)}</p></article>`).join('')}</section>
      ${equipe && r.leituras.length?`<details class="cartao-app"><summary>Leituras da equipe</summary>${r.leituras.map(l=>`<p class="fale-meta">${esc(l.nome)} — ${data(l.lido_em)}</p>`).join('')}</details>`:''}
      ${!encerrado?`<section class="cartao-app"><form id="formMensagem"><label class="fale-campo">${equipe?'Escrever resposta':'Escrever complemento'}<textarea name="texto" required maxlength="10000"></textarea></label>
      ${equipe?'<label class="fale-responsavel"><input type="checkbox" name="interna">Anotação interna — somente equipe</label>':''}
      <button class="fale-botao" type="submit">${equipe?'Enviar registro':'Enviar complemento'}</button></form></section>`:''}
      ${!equipe && a.situacao==='aguardando_confirmacao'?'<section class="cartao-app"><h2>Confirmar encerramento</h2><p>A equipe solicitou o encerramento. Confirme para encerrar este atendimento.</p><button id="confirmarFale" class="fale-botao">Confirmar encerramento</button></section>':''}
      ${equipe && !encerrado?`<section class="cartao-app"><h2>Acompanhamento</h2>${a.situacao!=='aguardando_confirmacao'?'<form id="formEncerrar"><button class="fale-botao" type="submit">Solicitar encerramento</button></form>':'<p>Aguardando o associado confirmar o encerramento.</p>'}</section>`:''}
      ${encerrado?`<section class="cartao-app"><h2>Atendimento finalizado</h2><p>Para conversar novamente, abra outro atendimento.</p>${!equipe?'<a class="fale-botao secundario" href="fale-com-a-gente.html?novo=1">Abrir outro atendimento</a>':''}</section>`:''}
      ${encerrado && !equipe && !a.avaliacao?`<section class="cartao-app"><h2>Como você avalia este atendimento?</h2><form id="formAvaliacao"><label class="fale-campo">Sua avaliação<select name="avaliacao" required><option value="">Selecione</option>${Object.entries(avaliacoes).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><label class="fale-campo">Comentário (opcional)<textarea name="comentario" maxlength="4000"></textarea></label><button class="fale-botao" type="submit">Enviar avaliação</button></form></section>`:''}
      ${a.avaliacao?`<section class="cartao-app"><h2>Avaliação do atendimento</h2><p>${esc(avaliacoes[a.avaliacao])}</p>${a.comentario_avaliacao?`<p style="white-space:pre-wrap">${esc(a.comentario_avaliacao)}</p>`:''}<p class="fale-meta">${data(a.avaliado_em)}</p></section>`:''}
      <button id="atualizarConversa" class="fale-botao secundario">Atualizar conversa</button>`;
    voltar.href = 'fale-com-a-gente.html'+(equipe?'?equipe=1':'');
    voltar.textContent = equipe?'Voltar aos atendimentos':'Voltar às minhas mensagens';
    if (!encerrado) formSubmit('formMensagem',async f=>{await rpc('mensagem',{id,texto:f.get('texto'),interna:f.has('interna')});await detalhe(id);informar('Registro enviado.');});
    if (document.getElementById('formEncerrar')) formSubmit('formEncerrar',async ()=>{
      if (!confirm('Solicitar a confirmação de encerramento ao associado?')) return;
      await rpc('encerrar',{id});await detalhe(id);
    });
    document.getElementById('confirmarFale')?.addEventListener('click',e=>executar(e.currentTarget,async()=>{
      if (!confirm('Confirma o encerramento? Este atendimento não poderá ser reaberto.')) return;
      await rpc('confirmar',{id});await detalhe(id);informar('Atendimento finalizado. Você já pode avaliar o atendimento.');
    }));
    if (document.getElementById('formAvaliacao')) formSubmit('formAvaliacao',async f=>{await rpc('avaliar',{id,...Object.fromEntries(f)});await detalhe(id);informar('Avaliação registrada.');});
    document.getElementById('atualizarConversa').onclick=e=>executar(e.currentTarget,()=>detalhe(id));
  }
  async function gerenciar() {
    titulo.textContent = 'Responsáveis — Fale com a gente';
    voltar.href='adm-permissoes.html';voltar.textContent='Voltar à Gestão APP';
    const r = await rpc('responsaveis');
    conteudo.innerHTML = `<section class="cartao-app"><p>Nesta fase, o módulo está disponível somente para Tesoureiro. A seleção abaixo fica preparada para a futura liberação e ainda não concede acesso.</p><label class="fale-campo">Buscar pessoa<input id="buscarResponsavel" type="search" placeholder="Digite um nome"></label><form id="formResponsaveis"><div id="listaResponsaveis">${r.usuarios.map(u=>`<label class="fale-responsavel" data-nome="${esc(u.nome?.toLocaleLowerCase('pt-BR'))}"><input name="usuarios" value="${esc(u.id)}" type="checkbox" ${u.selecionado?'checked':''}><span>${esc(u.nome)}</span></label>`).join('')}</div><button class="fale-botao" type="submit">Salvar responsáveis</button></form></section>`;
    document.getElementById('buscarResponsavel').oninput=e=>{
      const busca=e.target.value.toLocaleLowerCase('pt-BR');
      document.querySelectorAll('[data-nome]').forEach(l=>l.hidden=!l.dataset.nome.includes(busca));
    };
    formSubmit('formResponsaveis',async f=>{await rpc('salvar_responsaveis',{usuarios:f.getAll('usuarios')});informar('Responsáveis salvos. O acesso permanece exclusivo para Tesoureiro.');});
  }
  (async()=>{
    try {
      const sessao = await window.supabaseClient.auth.getSession();
      if (!sessao.data?.session) { location.replace('index.html'); return; }
      const acesso = await rpc('acesso');
      if (!acesso.permitido) { informar('Módulo indisponível para seu perfil.',true); return; }
      informar();conteudo.hidden=false;
      if (equipe) {voltar.href='administrativo.html';voltar.textContent='Voltar ao ADM';}
      if (responsaveis) await gerenciar();
      else if (params.get('id')) await detalhe(params.get('id'));
      else if (params.get('novo')==='1') novo();
      else await listar();
    } catch(e) { informar(e.message,true); }
  })();
})();
