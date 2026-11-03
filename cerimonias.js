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
 for(const p of detalhe.periodos){
  const inscritos=detalhe.participantes.filter(x=>x.leitura&&x.periodo_leitura_id===p.id&&x.situacao!=='cancelado').length;
  const restantes=Math.max(0,Number(p.vagas)-inscritos);
  const texto=p.data_leitura+' — '+p.periodo+' ('+p.vagas+' vagas) - '+inscritos+' '+(inscritos===1?'inscrição':'inscrições')+' ('+restantes+' restantes)';
  if($('periodos'))node('p',texto,$('periodos'));
  if(ps)ps.add(new Option(p.data_leitura+' — '+p.periodo+' ('+restantes+' restantes)',p.id));
 }
 if(modoConfig)return;
 const existentes=$('inscricaoExistente');existentes.replaceChildren(new Option('Nova inscrição',''));detalhe.participantes.filter(p=>['interesse','espera'].includes(p.situacao)).forEach(p=>existentes.add(new Option(p.nome,p.id)));renderParticipantes();
}
if($('inscricaoExistente'))$('inscricaoExistente').onchange=()=>{const p=detalhe?.participantes.find(x=>x.id===$('inscricaoExistente').value);if(!p)return;$('origem').value=p.associado_id?'associado':'externo';$('origem').onchange();$('associado').value=p.associado_id||'';$('formInscricao').elements.nome_externo.value=p.nome_externo||'';$('leitura').checked=p.leitura;$('batismo').checked=p.batismo;$('periodo').value=p.periodo_leitura_id||'';$('formInscricao').elements.padrinho.value=p.padrinho||'';$('formInscricao').elements.madrinha.value=p.madrinha||'';atualizarCampos();};
function botao(label,container,callback){const b=node('button',label,container);b.type='button';b.onclick=async()=>{b.disabled=true;try{await callback();await selecionar();aviso('Operação concluída.');}catch(e){aviso(e.message||'Falha na operação.');}finally{b.disabled=false;}};return b;}
function renderParticipantes(){
 const lista=$('participantes');lista.replaceChildren();
 const participantes=detalhe.participantes.filter(p=>p.situacao!=='cancelado');
 const grupos=detalhe.periodos.map((periodo,i)=>({
  titulo:'Leitura período '+(i+1)+' — '+periodo.data_leitura+' · '+periodo.periodo,
  pessoas:participantes.filter(p=>p.leitura&&p.periodo_leitura_id===periodo.id)
 }));
 const semPeriodo=participantes.filter(p=>p.leitura&&!detalhe.periodos.some(x=>x.id===p.periodo_leitura_id));
 if(semPeriodo.length)grupos.push({titulo:'Leitura — período não definido',pessoas:semPeriodo});
 grupos.push({titulo:'Batismo',pessoas:participantes.filter(p=>p.batismo)});
 for(const grupo of grupos){
  const sec=node('section',null,lista);sec.className='cer-grupo';
  node('h3',grupo.titulo,sec);
  const pessoas=[...grupo.pessoas].sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR',{sensitivity:'base'}));
  if(!pessoas.length){node('p','Nenhuma inscrição.',sec);continue;}
  for(const p of pessoas){
   const linha=node('details',null,sec);linha.className='cer-pessoa';
   const cab=node('summary',null,linha);
   const nome=node('span',p.nome,cab);nome.className='cer-nome';
   const pago=Number(p.valor_pago||0),previsto=Number(p.valor_previsto||0);
   if(previsto>0&&pago>=previsto){const pg=node('strong','(PG)',cab);pg.className='cer-pg';}
   const corpo=node('div',null,linha);corpo.className='cer-pessoa-acoes';
   node('p','Previsto: '+dinheiro(previsto)+' · Recebido: '+dinheiro(pago)+' · Saldo: '+dinheiro(Math.max(0,previsto-pago)),corpo);
   if(acesso.gerenciar){
    const editar=node('button','Editar inscrição',corpo);editar.type='button';
    const painel=node('div',null,corpo);painel.className='cer-painel-edicao';painel.hidden=true;
    const campos=node('form',null,painel);campos.className='cer-editar';
    if(p.leitura){
     const label=node('label','Período da leitura',campos);
     const sel=node('select',null,label);sel.name='periodo_leitura_id';
     sel.add(new Option('Sem período definido',''));
     for(const periodo of detalhe.periodos){
      const ocupadas=detalhe.participantes.filter(x=>x.leitura&&x.periodo_leitura_id===periodo.id&&x.situacao!=='cancelado'&&x.id!==p.id).length;
      if(ocupadas>=Number(periodo.vagas)&&periodo.id!==p.periodo_leitura_id)continue;
      sel.add(new Option(periodo.data_leitura+' — '+periodo.periodo,periodo.id));
     }
     sel.value=p.periodo_leitura_id||'';
    }
    if(p.batismo)for(const campo of ['padrinho','madrinha']){
     const label=node('label',campo==='padrinho'?'Padrinho':'Madrinha',campos);
     const input=node('input',null,label);input.name=campo;input.maxLength=200;input.value=p[campo]||'';
    }
    const acoes=node('div',null,campos);acoes.className='cer-editar-botoes';
    const salvar=node('button','Salvar alterações',acoes);salvar.type='submit';
    const cancelar=node('button','Cancelar',acoes);cancelar.type='button';
    cancelar.onclick=()=>{painel.hidden=true;editar.textContent='Editar inscrição';};
    editar.onclick=()=>{painel.hidden=!painel.hidden;editar.textContent=painel.hidden?'Editar inscrição':'Fechar edição';};
    campos.onsubmit=async e=>{
     e.preventDefault();salvar.disabled=true;
     try{
      const d=dadosForm(campos);
      await rpc('editar_inscricao',{participante_id:p.id,periodo_leitura_id:p.leitura?(d.periodo_leitura_id||null):null,padrinho:d.padrinho||null,madrinha:d.madrinha||null});
      await selecionar();aviso('Inscrição atualizada com sucesso.');
     }catch(err){aviso(err.message||String(err));salvar.disabled=false;}
    };
   }
   if(acesso.pagamentos&&pago<previsto)botao('Confirmar pagamento',corpo,async()=>{
    const valor=prompt('Valor efetivamente recebido (R$):',String(Math.max(0,previsto-pago)).replace('.',','));
    if(valor===null)return;
    const n=Number(valor.trim().replace(',','.'));
    if(!Number.isFinite(n)||n<=0)throw Error('Informe um valor positivo.');
    const opcoes=['PIX','Dinheiro','Débito','Crédito','Transferência','Boleto','Outro'];
    const escolha=prompt('Forma de pagamento:\\n'+opcoes.map((f,i)=>(i+1)+' - '+f).join('\\n')+'\\nDigite o número da opção:','1');
    if(escolha===null)return;
    const forma=opcoes[Number(escolha)-1];
    if(!forma)throw Error('Selecione uma forma de pagamento válida.');
    await rpc('confirmar_pagamento',{participante_id:p.id,valor:n,forma_pagamento:forma});
   });
   if(acesso.gerenciar&&pago===0)botao('Excluir inscrição',corpo,async()=>{
    if(!confirm('Excluir a inscrição de '+p.nome+'?'))return;
    await rpc('excluir_inscricao',{participante_id:p.id});
   });
  }
 }
}
$('cerimonia').onchange=()=>selecionar().catch(e=>aviso(e.message));
if($('origem'))$('origem').onchange=()=>{$('campoAssociado').hidden=$('origem').value!=='associado';$('campoExterno').hidden=$('origem').value!=='externo';};
function atualizarCampos(){$('campoPeriodo').hidden=!$('leitura').checked;$('camposPadrinhos').hidden=!$('batismo').checked;}
if($('leitura'))$('leitura').onchange=atualizarCampos;if($('batismo'))$('batismo').onchange=atualizarCampos;
if($('formCerimonia'))$('formCerimonia').onsubmit=async e=>{
 e.preventDefault();const form=e.currentTarget,b=e.submitter;b.disabled=true;
 try{await rpc('salvar_cerimonia',dadosForm(form));form.reset();await carregar();aviso('Cerimônia cadastrada com sucesso.');}catch(err){aviso(err.message);}finally{b.disabled=false;}
};
if($('formPeriodo'))$('formPeriodo').onsubmit=async e=>{
 e.preventDefault();const form=e.currentTarget,b=e.submitter;b.disabled=true;
 try{if(!atual)throw Error('Selecione uma cerimônia.');await rpc('salvar_periodo',{...dadosForm(form),cerimonia_id:atual.id});form.reset();await selecionar();aviso('Período cadastrado.');}catch(err){aviso(err.message);}finally{b.disabled=false;}
};
if($('formInscricao'))$('formInscricao').onsubmit=async e=>{
 e.preventDefault();const form=e.currentTarget,b=e.submitter;b.disabled=true;
 try{
  if(!atual)throw Error('Selecione uma cerimônia.');
  const d=dadosForm(form),externo=$('origem').value==='externo';
  await rpc('inscrever',{id:$('inscricaoExistente').value||null,cerimonia_id:atual.id,associado_id:externo?null:d.associado_id,nome_externo:externo?d.nome_externo:null,
   leitura:$('leitura').checked,batismo:$('batismo').checked,
   periodo_leitura_id:$('leitura').checked?d.periodo_leitura_id:null,padrinho:d.padrinho||null,madrinha:d.madrinha||null});
  form.reset();$('origem').onchange();atualizarCampos();await selecionar();aviso('Interesse registrado.');
 }catch(err){aviso(err.message);}finally{b.disabled=false;}
};

try{
 acesso=await rpc('acesso');
 if(modoConfig?!acesso.valores:!(acesso.gerenciar&&acesso.pagamentos))throw Error('Sem permissão para esta área.');
 $('area').hidden=false;
 if(!modoConfig && $('secInscricao'))$('secInscricao').hidden=false;
 if(modoConfig){$('secConfiguracao').hidden=false;$('secPeriodos').hidden=false;}
 if(!modoConfig && acesso.gerenciar){const r=await rpc('associados');associados=r.associados||[];$('associado').replaceChildren(new Option('Selecione',''));associados.forEach(a=>$('associado').add(new Option(a.nome,a.id)));}
 await carregar();aviso('');
}catch(e){aviso(e.message||'Não foi possível abrir cerimônias.');}
})();
