"use strict";
(async()=>{
 const $=id=>document.getElementById(id),db=window.supabaseClient;
 const aviso=t=>{$('mensagem').textContent=t||'';};
 const rpc=async(acao,dados={})=>{const r=await db.rpc('cerimonias_gerenciar',{p_acao:acao,p_dados:dados});if(r.error)throw r.error;return r.data;};
 const dados=form=>Object.fromEntries(new FormData(form).entries());
 let cerimonias=[],selecionada=null;
 const painels=['painelCriar','painelAlterar','painelExcluir'];
 function abrir(id){for(const p of painels)$(p).hidden=p!==id;aviso('');}
 function opcoes(sel){const anterior=sel.value;sel.replaceChildren(new Option('Selecione uma cerimônia',''));for(const c of cerimonias)sel.add(new Option(c.titulo,c.id));if(cerimonias.some(c=>c.id===anterior))sel.value=anterior;}
 async function carregar(){const r=await rpc('listar');cerimonias=r.cerimonias||[];for(const id of ['cerimoniaAlterar','cerimoniaExcluir'])opcoes($(id));const lista=$('listaCerimonias');lista.replaceChildren();if(!cerimonias.length){lista.textContent='Nenhuma cerimônia cadastrada.';return;}for(const c of cerimonias){const p=document.createElement('p');p.textContent=c.titulo;lista.append(p);}}
 async function selecionar(){const id=$('cerimoniaAlterar').value;selecionada=null;$('formAlteracao').reset();$('periodosAlterar').replaceChildren();if(!id)return;const d=await rpc('detalhe_config',{cerimonia_id:id});selecionada=d.cerimonia;for(const [key,value] of Object.entries(selecionada)){const el=$('formAlteracao').elements.namedItem(key);if(el&&value!==null)el.value=value;}for(const p of d.periodos||[]){const linha=document.createElement('p');linha.textContent=p.data_leitura+' — '+p.periodo+' ('+p.vagas+' vagas)';$('periodosAlterar').append(linha);}}
 async function salvar(e,alterar){e.preventDefault();const form=e.currentTarget,btn=e.submitter;btn.disabled=true;try{const d=dados(form);if(alterar){if(!selecionada)throw Error('Selecione uma cerimônia para alterar.');d.id=selecionada.id;}const retorno=await rpc('salvar_cerimonia',d);await carregar();if(alterar){$('cerimoniaAlterar').value=d.id;await selecionar();}else{form.reset();abrir('painelAlterar');$('cerimoniaAlterar').value=retorno.id;await selecionar();}aviso(alterar?'Alterações salvas.':'Cerimônia criada. Agora você pode cadastrar os períodos de leitura.');}catch(err){aviso(err.message||String(err));}finally{btn.disabled=false;}}
 try{const acesso=await rpc('acesso');if(!acesso.valores)throw Error('Sem permissão para configurar cerimônias.');$('area').hidden=false;await carregar();
 $('acaoCriar').onclick=()=>abrir('painelCriar');$('acaoAlterar').onclick=()=>abrir('painelAlterar');$('acaoExcluir').onclick=()=>abrir('painelExcluir');
 $('cerimoniaAlterar').onchange=()=>selecionar().catch(e=>aviso(e.message));
 $('formCerimonia').onsubmit=e=>salvar(e,false);$('formAlteracao').onsubmit=e=>salvar(e,true);
 $('formPeriodoAlterar').onsubmit=async e=>{e.preventDefault();const form=e.currentTarget,b=e.submitter;b.disabled=true;try{if(!selecionada)throw Error('Selecione uma cerimônia.');await rpc('salvar_periodo',{...dados(form),cerimonia_id:selecionada.id});form.reset();await selecionar();aviso('Período cadastrado.');}catch(err){aviso(err.message);}finally{b.disabled=false;}};
 $('confirmarExclusao').onclick=async()=>{const id=$('cerimoniaExcluir').value;const c=cerimonias.find(x=>x.id===id);if(!c){aviso('Selecione uma cerimônia.');return;}if(!confirm('Excluir definitivamente a cerimônia "'+c.titulo+'"? A operação não pode ser desfeita.'))return;const b=$('confirmarExclusao');b.disabled=true;try{await rpc('excluir_cerimonia',{cerimonia_id:id});await carregar();aviso('Cerimônia excluída.');}catch(err){aviso(err.message||String(err));}finally{b.disabled=false;}};
 aviso('');
 }catch(err){aviso(err.message||String(err));}
})();