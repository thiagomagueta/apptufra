"use strict";
(async()=>{
const $=id=>document.getElementById(id),db=window.supabaseClient;
const dinheiro=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const modoConfig=document.body.dataset.cerimoniasModo==='config';
let acesso={},cerimonias=[],atual=null,detalhe=null,associados=[];
function aviso(t){$('mensagem').textContent=t||'';}
function node(tag,text,p){const n=document.createElement(tag);if(text!==null)n.textContent=text;p.append(n);return n;}
async function rpc(acao,dados={}){const r=await db.rpc('cerimonias_gerenciar',{p_acao:acao,p_dados:dados});if(r.error)throw r.error;return r.data;}
function dadosForm(form){return Object.fromEntries(new FormData(form).entries());}
async function carregar(){
 const r=await rpc('listar');cerimonias=r.cerimonias||[];
 const sel=$('cerimonia'),prev=sel.value;sel.replaceChildren(new Option('Selecione uma cerimônia',''));
 cerimonias.forEach(c=>sel.add(new Option(c.titulo+' — '+c.data_oficial,c.id)));
 if(cerimonias.length){sel.value=cerimonias.some(c=>c.id===prev)?prev:cerimonias[0].id;await selecionar();}
 else {atual=null;detalhe=null;limparDetalhe();}
}
function limparDetalhe(){$('resumo').replaceChildren();if($('periodos'))$('periodos').replaceChildren();if($('participantes'))$('participantes').replaceChildren();}
async function selecionar(){
 const id=$('cerimonia').value;atual=cerimonias.find(c=>c.id===id)||null;
 if(!atual){limparDetalhe();return;}
 detalhe=await rpc(modoConfig?'detalhe_config':'detalhe',{cerimonia_id:id});limparDetalhe();
 const c=detalhe.cerimonia;
 node('p',c.data_oficial+' · '+c.status,$('resumo'));
 node('p','Associados: leitura '+dinheiro(c.valor_leitura_associado)+' · batismo '+dinheiro(c.valor_batismo_associado)+' · pacote '+dinheiro(c.valor_conjunto_associado),$('resumo'));
 node('p','Externos: leitura '+dinheiro(c.valor_leitura_externo)+' · batismo '+dinheiro(c.valor_batismo_externo),$('resumo'));
 const ps=$('periodo');if(ps)ps.replaceChildren(new Option('Selecione',''));
 for(const p of detalhe.periodos){if($('periodos'))node('p',p.data_leitura+' — '+p.periodo+' ('+p.vagas+' vagas)',$('periodos'));if(ps)ps.add(new Option(p.data_leitura+' — '+p.periodo,p.id));}
 if(modoConfig)return;
 const existentes=$('inscricaoExistente');existentes.replaceChildren(new Option('Nova inscrição',''));detalhe.participantes.filter(p=>['interesse','espera'].includes(p.situacao)).forEach(p=>existentes.add(new Option(p.nome,p.id)));renderParticipantes();
}
if($('inscricaoExistente'))$('inscricaoExistente').onchange=()=>{const p=detalhe?.participantes.find(x=>x.id===$('inscricaoExistente').value);if(!p)return;$('origem').value=p.associado_id?'associado':'externo';$('origem').onchange();$('associado').value=p.associado_id||'';$('formInscricao').elements.nome_externo.value=p.nome_externo||'';$('leitura').checked=p.leitura;$('batismo').checked=p.batismo;$('periodo').value=p.periodo_leitura_id||'';$('formInscricao').elements.padrinho.value=p.padrinho||'';$('formInscricao').elements.madrinha.value=p.madrinha||'';atualizarCampos();};
function botao(label,container,callback){const b=node('button',label,container);b.type='button';b.onclick=async()=>{b.disabled=true;try{await callback();await selecionar();aviso('Operação concluída.');}catch(e){aviso(e.message||'Falha na operação.');}finally{b.disabled=false;}};return b;}
function renderParticipantes(){
 const lista=$('participantes');lista.replaceChildren();
 if(!detalhe.participantes.length){node('p','Nenhuma inscrição nesta cerimônia.',lista);return;}
 for(const p of detalhe.participantes){
  const card=node('article',null,lista);card.className='cer-card';
  node('strong',p.nome,card);
  node('p',(p.leitura?'Leitura ':'')+(p.batismo?'Batismo':'')+' · '+p.situacao,card);
  node('p','Previsto '+dinheiro(p.valor_previsto)+' · Recebido '+dinheiro(p.valor_pago)+' · Saldo '+dinheiro(Number(p.valor_previsto)-Number(p.valor_pago)),card);
  if(p.batismo)node('p','Padrinho: '+(p.padrinho||'—')+' · Madrinha: '+(p.madrinha||'—'),card);
  if(p.orixa_frente||p.orixa_adjunto)node('p','Orixás: '+(p.orixa_frente||'—')+' / '+(p.orixa_adjunto||'—'),card);
  const actions=node('div',null,card);actions.className='cer-actions';
  if(acesso.gerenciar && p.situacao!=='cancelado')
   botao('Excluir inscrição',actions,async()=>{
    if(!confirm('Excluir a inscrição de '+p.nome+' e liberar a vaga? Esta ação não é permitida quando já existe pagamento registrado.'))throw Error('Operação cancelada.');
    await rpc('excluir_inscricao',{participante_id:p.id});
   });
  if(acesso.pagamentos)botao('Registrar pagamento',actions,async()=>{
   const valor=prompt('Valor efetivamente recebido (R$):');if(valor===null)throw Error('Operação cancelada.');
   const n=Number(valor.trim().replace(',','.'));if(!Number.isFinite(n)||n<=0)throw Error('Informe um valor positivo.');
   const opcoes=['PIX','Dinheiro','Débito','Crédito','Transferência','Boleto','Outro'];
   const escolha=prompt('Forma de pagamento:\n'+opcoes.map((f,i)=>(i+1)+' - '+f).join('\n')+'\nDigite o número da opção:','1');
   if(escolha===null)throw Error('Operação cancelada.');
   const forma=opcoes[Number(escolha)-1];if(!forma)throw Error('Selecione uma forma de pagamento válida.');
   await rpc('confirmar_pagamento',{participante_id:p.id,valor:n,forma_pagamento:forma});
  });
  if(acesso.gerenciar && p.situacao!=='confirmado' && p.situacao!=='cancelado')
   botao('Confirmar vaga',actions,()=>rpc('confirmar_vaga',{participante_id:p.id}));
  if(acesso.gerenciar && p.situacao==='confirmado')
   botao('Registrar realização',actions,async()=>{
    const d={participante_id:p.id};
    if(p.leitura){
     const f=prompt('Orixá de Frente:',p.orixa_frente||'');if(f===null)throw Error('Operação cancelada.');
     const a=prompt('Orixá Adjunto:',p.orixa_adjunto||'');if(a===null)throw Error('Operação cancelada.');
     const dt=prompt('Data da leitura (AAAA-MM-DD):',p.leitura_realizada_em||atual.data_oficial);if(dt===null)throw Error('Operação cancelada.');
     Object.assign(d,{orixa_frente:f,orixa_adjunto:a,leitura_realizada_em:dt});
    }
    if(p.batismo){const dt=prompt('Data do batismo (AAAA-MM-DD):',p.batismo_realizado_em||atual.data_oficial);if(dt===null)throw Error('Operação cancelada.');d.batismo_realizado_em=dt;}
    await rpc('salvar_resultado',d);
   });
 }
}
$('cerimonia').onchange=()=>selecionar().catch(e=>aviso(e.message));
if($('origem'))$('origem').onchange=()=>{$('campoAssociado').hidden=$('origem').value!=='associado';$('campoExterno').hidden=$('origem').value!=='externo';};
function atualizarCampos(){$('campoPeriodo').hidden=!$('leitura').checked;$('camposPadrinhos').hidden=!$('batismo').checked;}
if($('leitura'))$('leitura').onchange=atualizarCampos;if($('batismo'))$('batismo').onchange=atualizarCampos;
if($('formCerimonia'))$('formCerimonia').onsubmit=async e=>{
 e.preventDefault();const b=e.submitter;b.disabled=true;
 try{await rpc('salvar_cerimonia',dadosForm(e.currentTarget));e.currentTarget.reset();await carregar();aviso('Cerimônia cadastrada.');}catch(err){aviso(err.message);}finally{b.disabled=false;}
};
if($('formPeriodo'))$('formPeriodo').onsubmit=async e=>{
 e.preventDefault();const b=e.submitter;b.disabled=true;
 try{if(!atual)throw Error('Selecione uma cerimônia.');await rpc('salvar_periodo',{...dadosForm(e.currentTarget),cerimonia_id:atual.id});e.currentTarget.reset();await selecionar();aviso('Período cadastrado.');}catch(err){aviso(err.message);}finally{b.disabled=false;}
};
if($('formInscricao'))$('formInscricao').onsubmit=async e=>{
 e.preventDefault();const b=e.submitter;b.disabled=true;
 try{
  if(!atual)throw Error('Selecione uma cerimônia.');
  const d=dadosForm(e.currentTarget),externo=$('origem').value==='externo';
  await rpc('inscrever',{id:$('inscricaoExistente').value||null,cerimonia_id:atual.id,associado_id:externo?null:d.associado_id,nome_externo:externo?d.nome_externo:null,
   leitura:$('leitura').checked,batismo:$('batismo').checked,
   periodo_leitura_id:$('leitura').checked?d.periodo_leitura_id:null,padrinho:d.padrinho||null,madrinha:d.madrinha||null});
  e.currentTarget.reset();$('origem').onchange();atualizarCampos();await selecionar();aviso('Interesse registrado.');
 }catch(err){aviso(err.message);}finally{b.disabled=false;}
};

try{
 acesso=await rpc('acesso');
 if(modoConfig?!acesso.valores:!(acesso.gerenciar&&acesso.pagamentos))throw Error('Sem permissão para esta área.');
 $('area').hidden=false;
 if(!modoConfig && acesso.gerenciar){const r=await rpc('associados');associados=r.associados||[];$('associado').replaceChildren(new Option('Selecione',''));associados.forEach(a=>$('associado').add(new Option(a.nome,a.id)));}
 await carregar();aviso('');
}catch(e){aviso(e.message||'Não foi possível abrir cerimônias.');}
})();
