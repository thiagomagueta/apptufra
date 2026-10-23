'use strict';
(() => {
 const $=id=>document.getElementById(id);
 let funcoes=[],ocupado=false;
 const mensagem=t=>{$('mensagemFuncoes').textContent=t;};
 async function rpc(acao,dados={}) {
  const r=await window.supabaseClient.rpc('gerenciar_funcoes',{p_acao:acao,p_dados:dados});
  if(r.error) throw new Error(r.error.message || 'Não foi possível concluir.');
  return r.data;
 }
 function pais(id='',selecionado='') {
  $('funcaoPai').replaceChildren(new Option('Sem função pai (principal)',''));
  for(const f of funcoes.filter(f=>!f.funcao_pai_id && f.id!==id)) {
   const o=new Option(f.nome+(f.ativo?'':' (desativada)'),f.id);
   o.disabled=!f.ativo && f.id!==selecionado;
   $('funcaoPai').append(o);
  }
  $('funcaoPai').value=selecionado || '';
 }
 function editar(f) {
  $('formFuncao').reset();$('funcaoId').value=f?.id || '';
  $('tituloFormulario').textContent=f?'Editar função':'Nova função';
  $('funcaoNome').value=f?.nome || '';$('funcaoOrdem').value=f?.ordem || 0;
  $('funcaoAtiva').checked=f?!!f.ativo:true;pais(f?.id,f?.funcao_pai_id);
  for(const id of ['funcaoNome','funcaoPai','funcaoAtiva']) $(id).disabled=!!f?.protegida;
  $('avisoProtegida').hidden=!f?.protegida;
 }
 function renderizar() {
  $('listaGestaoFuncoes').replaceChildren();
  function linha(f,filha) {
   const div=document.createElement('div');div.className='funcao-gestao'+(filha?' filha':'');
   const nome=document.createElement('strong');nome.textContent=f.nome;div.append(nome);
   const info=document.createElement('p');info.textContent=`${f.ativo?'Ativa':'Desativada'} · ${f.associados} associado(s) · Ordem ${f.ordem ?? 0}${f.protegida?' · Protegida pelo aplicativo':''}`;div.append(info);
   const acoes=document.createElement('div');acoes.className='acoes-funcao';
   const e=document.createElement('button');e.type='button';e.textContent='Editar';e.onclick=()=>{if(ocupado)return;editar(f);$('tituloFormulario').scrollIntoView({behavior:'smooth',block:'center'});};acoes.append(e);
   const d=document.createElement('button');d.type='button';d.textContent='Excluir';
   d.disabled=f.protegida || Number(f.associados)>0 || Number(f.regras)>0 || funcoes.some(c=>c.funcao_pai_id===f.id);
   d.title=d.disabled?'Função protegida ou com vínculos.':'Excluir função sem vínculos';
   d.onclick=async()=>{
    if(ocupado || !confirm(`Excluir a função “${f.nome}”?`))return;
    ocupado=true;d.disabled=true;
    try{await rpc('excluir',{id:f.id});await carregar();editar();mensagem('Função excluída.');}
    catch(err){mensagem(err.message);d.disabled=false;}finally{ocupado=false;}
   };acoes.append(d);div.append(acoes);$('listaGestaoFuncoes').append(div);
  }
  for(const f of funcoes.filter(f=>!f.funcao_pai_id)) {linha(f,false);for(const c of funcoes.filter(c=>c.funcao_pai_id===f.id))linha(c,true);}
 }
 async function carregar(){funcoes=await rpc('listar');renderizar();$('gestaoFuncoes').hidden=false;}
 $('novaFuncao').onclick=()=>{if(!ocupado)editar();};
 $('formFuncao').onsubmit=async ev=>{
  ev.preventDefault();if(ocupado)return;
  ocupado=true;$('salvarFuncao').disabled=true;
  const dados={id:$('funcaoId').value,nome:$('funcaoNome').value,funcao_pai_id:$('funcaoPai').value,ordem:Number($('funcaoOrdem').value),ativo:$('funcaoAtiva').checked};
  try{await rpc('salvar',dados);await carregar();editar();mensagem('Função salva com sucesso.');}
  catch(err){mensagem(err.message);}finally{ocupado=false;$('salvarFuncao').disabled=false;}
 };
 carregar().then(()=>{editar();mensagem('');}).catch(err=>{mensagem(err.message);$('gestaoFuncoes').hidden=true;});
})();
