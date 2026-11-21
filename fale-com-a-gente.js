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
  const prazoEncerramento = a => a.encerramento_solicitado_em ? data(new Date(new Date(a.encerramento_solicitado_em).getTime() + 5 * 24 * 60 * 60 * 1000)) : '';
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

  const abasEquipe = {
    nao_lidas: 'Não lidas',
    nao_respondidas: 'Não respondidas',
    respondidas: 'Respondidas',
    finalizadas: 'Finalizadas'
  };
  function abaAtendimento(a) {
    if (a.situacao === 'finalizado') return 'finalizadas';
    if (a.novo) return 'nao_lidas';
    return ['em_acompanhamento', 'aguardando_confirmacao'].includes(a.situacao)
      ? 'respondidas' : 'nao_respondidas';
  }
  function linkAtendimento(a) {
    const origem = equipe ? '&equipe=1&aba=' + abaAtendimento(a) : '';
    const pessoa = equipe && params.has('usuario_id') ? '&usuario_id=' + encodeURIComponent(params.get('usuario_id')) : '';
    return 'fale-com-a-gente.html?id=' + encodeURIComponent(a.id) + origem + pessoa;
  }
  function exibirFinalizados(lista, atendimentos) {
    const grupos = new Map();
    for (const a of atendimentos) {
      if (!grupos.has(a.usuario_id)) grupos.set(a.usuario_id, []);
      grupos.get(a.usuario_id).push(a);
    }
    const ordenados = [...grupos.values()].sort(([a], [b]) => a.nome.localeCompare(b.nome, 'pt-BR'));
    for (const grupo of ordenados) {
      const secao = document.createElement('section');
      secao.className = 'fale-item fale-grupo-finalizado';
      secao.innerHTML = `<h2>${esc(grupo[0].nome)}</h2><ul>${grupo.map(a =>
        `<li><a href="${esc(linkAtendimento(a))}"><span>${esc(a.assunto)}</span><time>${data(a.finalizado_em || a.criado_em)}</time></a></li>`
      ).join('')}</ul>`;
      lista.append(secao);
    }
  }

  async function listar() {
    titulo.textContent = equipe ? 'Atendimentos — Fale com a gente' : 'Minhas mensagens';
    conteudo.innerHTML = `${!equipe ? '<a class="fale-botao" href="fale-com-a-gente.html?novo=1">Escrever uma mensagem</a>' : ''}
      <section class="cartao-app"><form id="formFiltros" class="fale-filtros">
      <label class="fale-campo largo">${equipe?'Nome ou assunto':'Assunto'}<input name="busca" maxlength="160"></label>
      ${equipe ? '' : `<label class="fale-campo largo">Situação<select name="situacao">${filtroSituacao()}</select></label>`}
      <label class="fale-campo">Desde<input type="date" name="inicio"></label><label class="fale-campo">Até<input type="date" name="fim"></label>
      <button type="submit" class="fale-botao largo">Filtrar</button></form>
      <div id="filtroPessoa"></div></section>${equipe ? `<div class="fale-abas" role="group" aria-label="Listas de atendimentos">${Object.entries(abasEquipe).map(([id, nome]) => `<button type="button" class="fale-botao secundario" data-aba="${id}">${nome}</button>`).join('')}</div>` : ''}<div class="fale-lista" id="listaFale"></div>
      <div class="fale-acoes"><button class="fale-botao secundario" id="maisFale" hidden>Carregar mais</button><button class="fale-botao secundario" id="atualizarFale">Atualizar lista</button></div>`;
    const lista = document.getElementById('listaFale');
    const maisBotao = document.getElementById('maisFale');
    const abas = [...conteudo.querySelectorAll('[data-aba]')];
    let aba = Object.hasOwn(abasEquipe, params.get('aba')) ? params.get('aba') : 'nao_lidas';
    let registros = [];
    let maisPaginas = false;
    let filtrosAplicados = {};
    const visiveis = () => equipe ? registros.filter(a => abaAtendimento(a) === aba) : registros;

    function renderizar() {
      for (const botao of abas) botao.setAttribute('aria-pressed', String(botao.dataset.aba === aba));
      lista.replaceChildren();
      const atendimentos = visiveis();
      maisBotao.hidden = !maisPaginas;
      if (!atendimentos.length) {
        lista.textContent = 'Nenhum atendimento encontrado.';
        return;
      }
      if (equipe && aba === 'finalizadas') {
        exibirFinalizados(lista, atendimentos);
        return;
      }
      for (const a of atendimentos) {
        const card = document.createElement('article'); card.className='fale-item';
        card.innerHTML = `<a href="${esc(linkAtendimento(a))}" style="color:inherit;text-decoration:none"><strong>${esc(a.assunto)}</strong>${equipe?`<small>${esc(a.nome)}</small>`:''}<small>${esc(a.categoria)} · ${data(a.criado_em)}</small>${badge(a.situacao)}${a.novo?'<span class="fale-novo">Nova mensagem</span>':''}${a.encerrado_automaticamente?'<small>Encerrado automaticamente após 5 dias.</small>':''}${a.avaliacao?`<small style="margin-top:8px">${esc(avaliacoes[a.avaliacao])}</small>`:''}</a>${equipe?`<br><a class="fale-historico" href="fale-com-a-gente.html?equipe=1&usuario_id=${encodeURIComponent(a.usuario_id)}">Histórico deste associado</a>`:''}`;
        lista.append(card);
      }
    }

    async function carregar(mais = false) {
      if (!mais) {
        const filtros = Object.fromEntries(new FormData(document.getElementById('formFiltros')));
        if (filtros.inicio && filtros.fim && filtros.inicio > filtros.fim) throw new Error('A data inicial deve ser anterior à final.');
        filtrosAplicados = filtros;
        offset = 0;
        registros = [];
        maisPaginas = true;
      }
      const quantidade = visiveis().length;
      do {
        const situacao = equipe && aba === 'finalizadas' ? 'finalizado' : filtrosAplicados.situacao;
        const r = await rpc('listar', {...filtrosAplicados, situacao, usuario_id:params.get('usuario_id') || '',offset});
        registros.push(...r.atendimentos);
        offset += r.atendimentos.length;
        maisPaginas = r.atendimentos.length === 50;
      } while (equipe && maisPaginas && visiveis().length === quantidade);
      renderizar();
    }
    for (const botao of abas) {
      botao.onclick = () => executar(botao, async () => {
        if (aba === botao.dataset.aba) return;
        aba = botao.dataset.aba;
        await carregar();
      });
    }
    if (params.get('usuario_id')) document.getElementById('filtroPessoa').innerHTML='<p>Exibindo o histórico deste associado.</p><a href="fale-com-a-gente.html?equipe=1">Ver todos os associados</a>';
    formSubmit('formFiltros',()=>carregar());
    document.getElementById('maisFale').onclick=e=>executar(e.currentTarget,()=>carregar(true));
    document.getElementById('atualizarFale').onclick=e=>executar(e.currentTarget,()=>carregar());
    await executar(null, () => carregar());
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
      ${a.situacao==='aguardando_confirmacao'?`<section class="cartao-app"><p>Confirmação de encerramento até <strong>${prazoEncerramento(a)}</strong>. Após 5 dias sem confirmação, o atendimento será encerrado automaticamente, sem avaliação automática.</p></section>`:''}
      ${!equipe && a.situacao==='aguardando_confirmacao'?'<section class="cartao-app"><h2>Confirmar encerramento</h2><p>A equipe solicitou o encerramento. Confirme para encerrar este atendimento.</p><button id="confirmarFale" class="fale-botao">Confirmar encerramento</button></section>':''}
      ${equipe && !encerrado?`<section class="cartao-app"><h2>Acompanhamento</h2>${a.situacao!=='aguardando_confirmacao'?'<form id="formEncerrar"><button class="fale-botao" type="submit">Solicitar encerramento</button></form>':'<p>Aguardando o associado confirmar o encerramento.</p>'}</section>`:''}
      ${encerrado?`<section class="cartao-app"><h2>Atendimento finalizado</h2>${a.encerrado_automaticamente?'<p>Encerrado automaticamente após 5 dias sem confirmação.</p>':''}<p>Para conversar novamente, abra outro atendimento.</p>${!equipe?'<a class="fale-botao secundario" href="fale-com-a-gente.html?novo=1">Abrir outro atendimento</a>':''}</section>`:''}
      ${encerrado && !equipe && !a.avaliacao?`<section class="cartao-app"><h2>Como você avalia este atendimento?</h2><form id="formAvaliacao"><label class="fale-campo">Sua avaliação<select name="avaliacao" required><option value="">Selecione</option>${Object.entries(avaliacoes).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><label class="fale-campo">Comentário (opcional)<textarea name="comentario" maxlength="4000"></textarea></label><button class="fale-botao" type="submit">Enviar avaliação</button></form></section>`:''}
      ${a.avaliacao?`<section class="cartao-app"><h2>Avaliação do atendimento</h2><p>${esc(avaliacoes[a.avaliacao])}</p>${a.comentario_avaliacao?`<p style="white-space:pre-wrap">${esc(a.comentario_avaliacao)}</p>`:''}<p class="fale-meta">${data(a.avaliado_em)}</p></section>`:''}
      <button id="atualizarConversa" class="fale-botao secundario">Atualizar conversa</button>`;
    const destino = new URLSearchParams();
    if (equipe) {
      destino.set('equipe', '1');
      destino.set('aba', abaAtendimento({...a, novo:false}));
      if (params.has('usuario_id')) destino.set('usuario_id', params.get('usuario_id'));
    }
    voltar.href = 'fale-com-a-gente.html' + (equipe ? '?' + destino : '');
    voltar.textContent = equipe?'Voltar aos atendimentos':'Voltar às minhas mensagens';
    if (!encerrado) formSubmit('formMensagem',async f=>{await rpc('mensagem',{id,texto:f.get('texto'),interna:f.has('interna')});await detalhe(id);informar('Registro enviado.');});
    if (document.getElementById('formEncerrar')) formSubmit('formEncerrar',async ()=>{
      if (!confirm('Solicitar o encerramento? O associado terá 5 dias para confirmar; após esse prazo, o atendimento será encerrado automaticamente.')) return;
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
    conteudo.innerHTML = `<section class="cartao-app"><p>Selecione as pessoas autorizadas a receber e acompanhar todos os atendimentos. Somente os selecionados terão acesso à área da equipe.</p><label class="fale-campo">Buscar pessoa<input id="buscarResponsavel" type="search" placeholder="Digite um nome"></label><form id="formResponsaveis"><div id="listaResponsaveis">${r.usuarios.map(u=>`<label class="fale-responsavel" data-nome="${esc(u.nome?.toLocaleLowerCase('pt-BR'))}"><input name="usuarios" value="${esc(u.id)}" type="checkbox" ${u.selecionado?'checked':''}><span>${esc(u.nome)}</span></label>`).join('')}</div><button class="fale-botao" type="submit">Salvar responsáveis</button></form></section>`;
    document.getElementById('buscarResponsavel').oninput=e=>{
      const busca=e.target.value.toLocaleLowerCase('pt-BR');
      document.querySelectorAll('[data-nome]').forEach(l=>l.hidden=!l.dataset.nome.includes(busca));
    };
    formSubmit('formResponsaveis',async f=>{await rpc('salvar_responsaveis',{usuarios:f.getAll('usuarios')});informar('Responsáveis salvos. As autorizações já estão em vigor.');});
  }
  (async()=>{
    try {
      const sessao = await window.supabaseClient.auth.getSession();
      if (!sessao.data?.session) { location.replace('index.html'); return; }
      const acesso = await rpc('acesso');
      if (!acesso.permitido || (equipe && !acesso.equipe) || (responsaveis && !acesso.gerenciar)) { informar('Módulo indisponível para seu perfil.',true); return; }
      informar();conteudo.hidden=false;
      if (equipe) {voltar.href='administrativo.html';voltar.textContent='Voltar ao ADM';}
      if (responsaveis) await gerenciar();
      else if (params.get('id')) await detalhe(params.get('id'));
      else if (params.get('novo')==='1') novo();
      else await listar();
    } catch(e) { informar(e.message,true); }
  })();
})();

