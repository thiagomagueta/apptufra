"use strict";
(() => {
 const db=window.supabaseClient,$=id=>document.getElementById(id);let ocupado=false;
 const msg=t=>{$('mensagem').textContent=t;};
 const rpc=async args=>{const r=await db.rpc('financeiro_reserva_responsaveis',args);if(r.error)throw r.error;return r.data;};
 function mostrar(r){$('pessoas').replaceChildren();for(const p of r.pessoas){
  const box=document.createElement('div'),nome=document.createElement('strong');box.className='pessoa';nome.textContent=p.nome;box.append(nome);
  const selecionado=r.selecionados.find(s=>s.usuario_id===p.id),checks=[];
  for(const [tipo,texto] of [['visualizar','Visualizar'],['movimentar','Movimentar']]){const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.value=p.id;input.dataset.tipo=tipo;input.checked=tipo==='visualizar'?!!selecionado:!!selecionado?.movimentar;label.append(input,document.createTextNode(texto));box.append(label);checks.push(input);}
  checks[0].onchange=()=>{if(!checks[0].checked)checks[1].checked=false;};checks[1].onchange=()=>{if(checks[1].checked)checks[0].checked=true;};$('pessoas').append(box);
 }}
 function bloquear(v){ocupado=v;$('painel').querySelectorAll('input,button').forEach(n=>n.disabled=v);}
 $('salvar').onclick=async()=>{if(ocupado)return;bloquear(true);msg('Salvando...');try{const ids=tipo=>[...$('pessoas').querySelectorAll(`input[data-tipo="${tipo}"]:checked`)].map(n=>n.value);mostrar(await rpc({p_visualizadores:ids('visualizar'),p_editores:ids('movimentar')}));msg('Permissões atualizadas.');}catch(e){msg(e.message||'Não foi possível salvar.');}finally{bloquear(false);}};
 (async()=>{try{mostrar(await rpc());$('painel').hidden=false;msg('');}catch(e){msg(e.message||'Acesso não autorizado.');}})();
})();
