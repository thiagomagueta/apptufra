"use strict";
(()=>{
 const db=window.supabaseClient,P=window.TufraExtratoParser,$=id=>document.getElementById(id);
 const node=(tag,t)=>{const e=document.createElement(tag);if(t!==undefined)e.textContent=t;return e;};
 const money=v=>Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}),date=v=>v.split('-').reverse().join('/');
 const states={pendente:'Pendente',revisar_duplicidade:'Revisar possível duplicidade',conciliado:'Conciliado',ignorado:'Ignorado'};
 let file,bytes,wb,raw=[],parsed=null,offset=0,total=0,item=null,parts=[],categories=[],action=null,busy=false,view=0;
 async function rpc(name,args){const r=await db.rpc(name,args);if(r.error)throw r.error;return r.data;}
 function message(t){$('mensagem').textContent=t;}
 function invalidate(){parsed=null;$('importar').disabled=true;$('previa').replaceChildren();$('aceitarErros').checked=false;}
 function map(){return {start:Number($('primeira').value)-1,date:Number($('colData').value),description:Number($('colDescricao').value),mode:$('modo').value,credit:Number($('colEntrada').value),debit:Number($('colSaida').value),value:Number($('colValor').value),reference:Number($('colReferencia').value),decimal:$('decimal').value,aba:$('aba').value,separador:$('separador').value};}
 function columns(){
  invalidate();const n=Math.max(0,...raw.slice(0,50).map(r=>r.length));
  for(const id of ['colData','colDescricao','colEntrada','colSaida','colValor','colReferencia']){
   $(id).replaceChildren();const empty=node('option','Não usar');empty.value='-1';$(id).append(empty);
   for(let i=0;i<n;i++){const sample=raw.slice(0,4).map(r=>String(r[i]??'').slice(0,35)).filter(Boolean).join(' / ');const o=node('option','Coluna '+(i+1)+' — '+sample);o.value=i;$(id).append(o);}
  }
  $('colData').value=0;$('colDescricao').value=1;$('colEntrada').value=2;$('colSaida').value=3;$('colValor').value=2;
  try{P.date(raw[0]?.[0]);$('primeira').value=1;}catch{$('primeira').value=2;}
 }
 function readSheet(){raw=wb?XLSX.utils.sheet_to_json(wb.Sheets[$('aba').value],{header:1,defval:null,blankrows:true,raw:true}):P.csv(new TextDecoder('utf-8',{fatal:true}).decode(bytes),$('separador').value==='tab'?'\t':$('separador').value);columns();}
 async function readFile(){
  invalidate();$('mapeamento').hidden=true;file=$('arquivo').files[0];if(!file)return;
  if(file.size>5*1024*1024||!/\.(csv|xlsx)$/i.test(file.name)){message('Selecione CSV ou XLSX de até 5 MB.');return;}
  try{bytes=await file.arrayBuffer();wb=null;$('aba').replaceChildren();
   if(/\.xlsx$/i.test(file.name)){if(!window.XLSX)throw Error('Não foi possível carregar a leitura do Excel. Atualize a página.');wb=XLSX.read(bytes,{type:'array',cellDates:false});for(const s of wb.SheetNames){const o=node('option',s);o.value=s;$('aba').append(o);}}
   $('aba').hidden=!wb;$('separador').hidden=!!wb;readSheet();$('mapeamento').hidden=false;message('Confira as colunas e a primeira linha antes de importar.');
  }catch(e){message('Não foi possível ler: '+e.message);}
 }
 $('arquivo').onchange=readFile;$('aba').onchange=$('separador').onchange=()=>{try{readSheet();}catch(e){message(e.message);}};
 for(const id of ['primeira','decimal','colData','colDescricao','colEntrada','colSaida','colValor','colReferencia','conta'])$(id).onchange=invalidate;
 $('modo').onchange=()=>{$('separados').hidden=$('modo').value!=='split';$('unico').hidden=$('modo').value==='split';invalidate();};
 function canImport(){return !busy&&parsed?.rows.length>0&&(!parsed.errors.length||$('aceitarErros').checked);}
 $('aceitarErros').onchange=()=>{$('importar').disabled=!canImport();};
 $('prever').onclick=()=>{
  try{const m=map();if(!Number.isInteger(m.start)||m.start<0||m.start>=raw.length)throw Error('Primeira linha inválida.');parsed=P.normalize(raw,m);$('previa').replaceChildren();
   const credits=parsed.rows.filter(r=>r.valor>0).reduce((n,r)=>n+Math.round(r.valor*100),0),debits=parsed.rows.filter(r=>r.valor<0).reduce((n,r)=>n-Math.round(r.valor*100),0);
   $('previa').append(node('p',`${parsed.rows.length} movimentações · Entradas ${money(credits/100)} · Saídas ${money(debits/100)} · ${parsed.errors.length} linhas excluídas.`));
   for(const r of parsed.rows.slice(0,15)){$('previa').append(node('p',`Linha ${r.linha} · ${date(r.data)} · ${r.descricao} · ${money(r.valor)}`));}
   for(const e of parsed.errors.slice(0,30))$('previa').append(node('p',`Linha ${e.linha}: ${e.mensagem}`));
   if(parsed.errors.length>30)$('previa').append(node('p','Mais linhas excluídas. Ajuste a primeira linha/arquivo antes de importar.'));
   $('importar').disabled=!canImport();message('Confira os totais com o extrato antes de importar.');
  }catch(e){invalidate();message(e.message);}
 };
 $('importar').onclick=async()=>{
  if(!canImport())return;const account=$('conta').value.trim();if(!account){message('Informe a identificação da conta.');return;}
  busy=true;$('mapeamento').querySelectorAll('input,select,button').forEach(e=>e.disabled=true);$('arquivo').disabled=$('conta').disabled=true;
  try{const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(n=>n.toString(16).padStart(2,'0')).join('');
   const id=await rpc('financeiro_extrato_importar',{p_id:crypto.randomUUID(),p_conta:account,p_nome:file.name,p_hash:hash,p_mapa:map(),p_itens:parsed.rows});
   await imports(id);invalidate();message('Extrato disponível para conciliação. Nenhuma baixa ou movimentação de Caixa foi confirmada.');
  }catch(e){message(e.message);}finally{busy=false;$('mapeamento').querySelectorAll('input,select,button').forEach(e=>e.disabled=false);$('arquivo').disabled=$('conta').disabled=false;$('importar').disabled=!canImport();}
 };
 async function imports(selected){
  const r=await db.from('financeiro_extratos').select('id,nome,conta,criado_em').order('criado_em',{ascending:false}).limit(100);if(r.error)throw r.error;
  $('extrato').replaceChildren();for(const x of r.data){const o=node('option',x.conta+' · '+x.nome+' · '+new Date(x.criado_em).toLocaleDateString('pt-BR'));o.value=x.id;$('extrato').append(o);}
  if(selected)$('extrato').value=selected;offset=0;await listing();
 }
 async function listing(){
  const token=++view,id=$('extrato').value;if(!id){$('lista').replaceChildren();$('resumo').textContent='Nenhum extrato importado.';return;}
  let q=db.from('financeiro_extrato_itens').select('*',{count:'exact'}).eq('extrato_id',id).order('data').order('id').range(offset,offset+29);if($('situacao').value)q=q.eq('status',$('situacao').value);
  const r=await q;if(r.error)throw r.error;if(token!==view)return;total=r.count;
  $('lista').replaceChildren();$('resumo').textContent=total+' movimentações neste filtro.';
  for(const i of r.data){const box=node('article');box.className='registro';box.append(node('strong',date(i.data)+' · '+money(i.valor)),node('p',i.descricao),node('p',states[i.status]+' · Linha '+i.linha));if(i.referencia)box.append(node('p','Identificador: '+i.referencia));if(i.duplicado_de)box.append(node('p','Possível repetição da movimentação #'+i.duplicado_de+'. Pode ser uma transação distinta; confira antes de confirmar.'));
   const b=node('button',i.status==='conciliado'||i.status==='ignorado'?'Ver histórico':'Conferir / classificar');b.className='botao';b.onclick=()=>open(i).catch(e=>message(e.message));box.append(b);$('lista').append(box);
  }
  $('anterior').disabled=offset===0;$('proxima').disabled=offset+30>=total;
 }
 function refresh(){if(!busy)listing().catch(e=>message(e.message));}
 $('extrato').onchange=$('situacao').onchange=()=>{offset=0;refresh();};$('atualizar').onclick=refresh;$('anterior').onclick=()=>{offset=Math.max(0,offset-30);refresh();};$('proxima').onclick=()=>{offset+=30;refresh();};
 function button(parent,label,fn){const b=node('button',label);b.className='botao';b.type='button';b.onclick=fn;parent.append(b);return b;}
 function prepare(acao,dados,text){action={acao,dados};$('revisaoTexto').textContent=text;$('confirmacao').hidden=false;$('opcoes').hidden=true;$('distribuir').hidden=true;$('motivo').value='';$('erroDialogo').textContent='';}
 async function proof(e){const tab=window.open('about:blank','_blank');if(tab)tab.opener=null;try{const r=await db.storage.from('financeiro-comprovantes').createSignedUrl(e.arquivo_path,60);if(r.error)throw r.error;if(tab)tab.location.href=r.data.signedUrl;else throw Error('Permita abrir uma nova aba.');}catch(err){tab?.close();$('erroDialogo').textContent=err.message;}}
 function showOptions(o){
  $('opcoes').replaceChildren();
  const history=node('details');history.append(node('summary','Histórico e linha original'));history.append(node('p',JSON.stringify(item.original)));
  for(const h of o.historico)history.append(node('p',new Date(h.data).toLocaleString('pt-BR')+' · '+h.nome+' · '+h.acao+' · '+h.motivo));
  if(item.resultado)history.append(node('p','Destinação confirmada: '+JSON.stringify(item.resultado)));$('opcoes').append(history);
  if(['conciliado','ignorado'].includes(item.status))return;
  if(item.status==='revisar_duplicidade'){
   button($('opcoes'),'Ignorar como duplicado',()=>prepare('ignorar',{},'Manter a movimentação no histórico sem gerar baixa ou lançamento.'));
   button($('opcoes'),'É uma transação distinta',()=>prepare('distinto',{},'A movimentação voltará à situação pendente. Esta ação não gera baixa nem lançamento. Informe por que são transações diferentes.'));return;
  }
  $('opcoes').append(node('p','As sugestões usam valor e proximidade de data. Confira a identidade do pagador e a destinação.'));
  for(const r of o.recebimentos){const box=node('div');box.className='registro';box.append(node('strong','Pagamento já confirmado: '+r.nome+' · '+date(r.data)+' · '+money(r.valor)));for(const d of r.destinacoes)box.append(node('p',d.nome+' · '+d.descricao+' · '+money(d.valor)));if(!r.extrato_item_id)button(box,'Ver comprovante',()=>proof(r));button(box,'Vincular pagamento confirmado',()=>prepare('recebimento',{id:r.id},'Vincular pagamento #'+r.id+' ao extrato. Não haverá nova receita nem baixa.'));$('opcoes').append(box);}
  for(const e of o.envios){const box=node('div');box.className='registro';box.append(node('strong','Comprovante pendente: '+e.nome_pagador+' · '+date(e.data_pagamento)+' · '+money(e.valor)));button(box,'Ver comprovante',()=>proof(e));button(box,'Revisar distribuição na conferência',()=>{window.location.href='financeiro-conferencia.html';});button(box,'Confirmar pagamento e conciliar',async()=>{
    try{const details=await rpc('financeiro_redistribuicao_opcoes',{p_envio:e.id});const text=details.destinacoes.map(d=>{const c=details.cobrancas.find(c=>c.id===d.cobranca_id);return (c?.nome||'Cobrança #'+d.cobranca_id)+' · '+(c?.descricao||'')+' · '+money(d.valor);}).join('\n');prepare('envio',{id:e.id,versao:details.versao},'Confirmar comprovante de '+e.nome_pagador+', efetivar as baixas abaixo e conciliar uma única vez:\n'+text);}catch(err){$('erroDialogo').textContent=err.message;}
   });$('opcoes').append(box);}
  for(const l of o.lancamentos){const box=node('div');box.className='registro';box.append(node('p','Caixa existente: '+l.descricao+' · '+l.categoria+' · '+date(l.data)+' · '+money(l.valor)));button(box,'Vincular lançamento existente',()=>prepare('lancamento',{id:l.id},'Vincular lançamento do Caixa #'+l.id+'. Não haverá novo lançamento.'));$('opcoes').append(box);}
  button($('opcoes'),'Classificar / distribuir novo pagamento',()=>{$('opcoes').hidden=true;$('distribuir').hidden=false;});button($('opcoes'),'Ignorar movimentação',()=>prepare('ignorar',{},'Manter apenas no histórico da importação, sem alterar o Caixa ou as cobranças. Informe o motivo.'));
  showCharges(o.cobrancas);
 }
 function showCharges(charges){
  $('cobrancas').replaceChildren();
  for(const c of charges){const row=node('div');row.className='opcao';row.append(node('p',c.nome+' · '+c.descricao+' · '+date(c.competencia||item.data)+' · Disponível '+money(c.saldo)+(c.comprovante?' · Comprovante pendente: sim':'')));
   const value=node('input');value.type='number';value.min='0.01';value.step='0.01';value.max=c.saldo;value.className='campo';value.setAttribute('aria-label','Valor para '+c.nome+' '+c.descricao);value.value=c.saldo;
   row.append(value);const b=button(row,'Adicionar cobrança',()=>{try{const n=P.cents(Number(value.value));if(!n||n<0||n>Math.round(c.saldo*100))throw Error('Valor inválido para esta cobrança.');if(parts.some(p=>p.cobranca_id===c.id))throw Error('Cobrança já adicionada. Remova para alterar o valor.');parts.push({cobranca_id:c.id,valor:n/100,label:c.nome+' · '+c.descricao});renderParts();}catch(e){$('erroDialogo').textContent=e.message;}});b.disabled=c.saldo<=0;row.append();$('cobrancas').append(row);
  }
 }
 function renderParts(){
  $('partes').replaceChildren();parts.forEach((p,index)=>{const r=node('p',p.label+' · '+money(p.valor));button(r,'Remover',()=>{parts.splice(index,1);renderParts();});$('partes').append(r);});const sum=parts.reduce((n,p)=>n+Math.round(p.valor*100),0);$('soma').textContent='Distribuído: '+money(sum/100)+' · Falta distribuir: '+money((Math.round(Math.abs(item.valor)*100)-sum)/100);$('revisar').disabled=sum!==Math.round(Math.abs(item.valor)*100)||!parts.length;
 }
 async function open(i){
  if(busy)return;item=i;parts=[];action=null;$('erroDialogo').textContent='';$('movimento').replaceChildren(node('strong',date(i.data)+' · '+i.descricao+' · '+money(i.valor)));$('confirmacao').hidden=true;$('opcoes').hidden=false;$('distribuir').hidden=true;$('busca').value='';$('formaExtrato').value='';$('doadorCategoria').value='';$('doadorBloco').hidden=i.valor<0;
  const o=await rpc('financeiro_extrato_opcoes',{p_item:i.id,p_busca:''});showOptions(o);$('categoria').replaceChildren();for(const c of categories.filter(c=>c.tipo===(i.valor>0?'receita':'despesa')&&c.ativo)){const option=node('option',c.nome);option.value=c.id;$('categoria').append(option);}renderParts();$('conciliacao').showModal();
 }
 $('buscar').onclick=async()=>{if(busy)return;try{const o=await rpc('financeiro_extrato_opcoes',{p_item:item.id,p_busca:$('busca').value.trim()});showCharges(o.cobrancas);}catch(e){$('erroDialogo').textContent=e.message;}};
 $('adicionarCategoria').onclick=()=>{try{const id=Number($('categoria').value),c=categories.find(c=>c.id===id),n=P.cents(Number($('valorCategoria').value));if(!c||!n||n<0)throw Error('Escolha categoria e valor positivo.');const favorecido=item.valor>0?$('doadorCategoria').value.trim():'';if(favorecido.length>150)throw Error('O nome do doador deve ter até 150 caracteres.');parts.push({categoria_id:id,valor:n/100,favorecido,label:c.nome+(favorecido?' · Doador / pagador: '+favorecido:'')});$('doadorCategoria').value='';$('valorCategoria').value='';renderParts();}catch(e){$('erroDialogo').textContent=e.message;}};
 $('revisar').onclick=()=>{if(parts.some(p=>p.cobranca_id)&&!$('formaExtrato').value){$('erroDialogo').textContent='Identifique a forma de pagamento.';return;}prepare('distribuir',{forma:$('formaExtrato').value,partes:parts.map(({label,...p})=>p)},'Registrar e conciliar:\n'+parts.map(p=>p.label+' · '+money(p.valor)).join('\n')+'\nTotal: '+money(Math.abs(item.valor)));};
 $('cancelarRevisao').onclick=()=>{$('confirmacao').hidden=true;if(action?.acao==='distribuir')$('distribuir').hidden=false;else $('opcoes').hidden=false;action=null;};
 $('confirmar').onclick=async()=>{
  if(busy||!action)return;const reason=$('motivo').value.trim();if(!reason){$('erroDialogo').textContent='Informe a observação / motivo.';return;}
  busy=true;$('conciliacao').querySelectorAll('button,input,select,textarea').forEach(e=>e.disabled=true);
  try{await rpc('financeiro_extrato_confirmar',{p_item:item.id,p_versao:item.atualizado_em,p_acao:action.acao,p_dados:action.dados,p_motivo:reason});$('conciliacao').close();await listing();message('Conferência registrada.');}
  catch(e){$('erroDialogo').textContent=e.message+' Se a operação já tiver sido concluída, feche e atualize a lista.';}
  finally{busy=false;$('conciliacao').querySelectorAll('button,input,select,textarea').forEach(e=>e.disabled=false);renderParts();}
 };
 $('fechar').onclick=()=>{if(!busy)$('conciliacao').close();};$('conciliacao').addEventListener('cancel',e=>{if(busy)e.preventDefault();});
 (async()=>{try{if(!db)throw Error('Não foi possível iniciar.');const [a,b]=await Promise.all([rpc('financeiro_pode_negociar',{}),rpc('financeiro_pode_conferir',{})]);if(a!==true||b!==true)throw Error('Acesso restrito aos responsáveis financeiros com permissão de conferência.');const r=await db.from('financeiro_categorias').select('id,nome,tipo,ativo').order('nome');if(r.error)throw r.error;categories=r.data;await imports();$('conteudo').hidden=false;message('Importação e conciliação manual. Confira os pagamentos existentes antes de registrar novas entradas.');}catch(e){message(e.message);}})();
})();
