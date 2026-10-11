"use strict";
(() => {
 const db=window.supabaseClient, $=id=>document.getElementById(id);
 const moeda=n=>Number(n).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
 const data=d=>new Date(d+'T12:00:00').toLocaleDateString('pt-BR');
 const hoje=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const tipos={aporte:'Aporte para a Reserva',resgate:'Resgate para o Caixa',ajuste_caixa:'Correção do Caixa',ajuste_reserva:'Correção da Reserva'};
 let ocupado=false,acesso={},offset=0,total=0,consulta=hoje,pedidoInicial=null,pedidoMovimento=null;
 const rpc=async(nome,args={})=>{const r=await db.rpc(nome,args);if(r.error)throw r.error;return r.data;};
 const msg=t=>{$('mensagem').textContent=t;};
 const node=(tag,t,parent)=>{const n=document.createElement(tag);n.textContent=t;parent.append(n);return n;};
 function bloquear(v){ocupado=v;$('conteudo').querySelectorAll('input,select,textarea,button').forEach(n=>n.disabled=v);if(!v){$('anterior').disabled=offset===0;$('proxima').disabled=offset+30>=total;}}
 function requisicao(atual,args){const assinatura=JSON.stringify(args);return atual&&atual.assinatura===assinatura?atual:{assinatura,id:crypto.randomUUID()};}
 async function historico(){
  const r=await rpc('financeiro_reserva_historico',{p_data:consulta,p_offset:offset});total=Number(r.total);$('historico').replaceChildren();
  if(!r.movimentos.length)node('p','Nenhuma movimentação neste período.',$('historico'));
  for(const m of r.movimentos){const box=node('div','',$('historico'));box.className='registro';node('strong',data(m.data)+' · '+tipos[m.tipo],box);node('p',moeda(m.valor),box);node('p',m.motivo,box);node('p','Registrado por '+m.responsavel+' em '+new Date(m.registrado_em).toLocaleString('pt-BR'),box);}
  $('pagina').textContent=total?`${offset+1}–${Math.min(offset+30,total)} de ${total}`:'0 registros';
 }
 async function carregar(){
  $('posicao').hidden=true;$('painelMovimento').hidden=true;$('painelInicial').hidden=true;$('painelHistorico').hidden=true;$('avisoInicial').hidden=true;
  acesso=await rpc('financeiro_reserva_acesso');if(!acesso.visualizar){$('conteudo').hidden=true;throw new Error('Acesso não autorizado.');}
  const r=await rpc('financeiro_reserva_posicao',{p_data:consulta});
  if(!r.configurado){$('painelInicial').hidden=!acesso.movimentar;$('avisoInicial').hidden=acesso.movimentar;return;}
  $('saldoCaixa').textContent=moeda(r.caixa);$('saldoReserva').textContent=moeda(r.reserva);$('saldoTotal').textContent=moeda(r.total);
  $('periodo').textContent='De '+data(r.abertura.inicio)+' até '+data(r.data);
  $('resultado').textContent='Entradas: '+moeda(r.entradas)+' · Saídas: '+moeda(r.saidas)+' · Resultado do período: '+moeda(r.resultado);
  $('variacoes').textContent='Transferências e correções: Caixa '+moeda(r.variacao_caixa)+' · Reserva '+moeda(r.variacao_reserva);
  $('abertura').textContent='Início: '+data(r.abertura.inicio)+' · Caixa inicial: '+moeda(r.abertura.caixa)+' · Reserva inicial: '+moeda(r.abertura.reserva);
  $('motivoAbertura').textContent=r.abertura.motivo;
  $('dataConsulta').min=r.abertura.inicio;$('dataMovimento').min=r.abertura.inicio;
  await historico();$('posicao').hidden=false;$('painelHistorico').hidden=false;$('painelMovimento').hidden=!acesso.movimentar;
 }
 async function executar(fn){if(ocupado)return;bloquear(true);msg('Carregando...');try{await fn();}catch(e){msg(e.message||'Não foi possível concluir.');}finally{bloquear(false);}}
 $('formConsulta').onsubmit=e=>{e.preventDefault();executar(async()=>{consulta=$('dataConsulta').value;offset=0;await carregar();msg('Posição atualizada.');});};
 $('formInicial').onsubmit=e=>{e.preventDefault();executar(async()=>{
  const args={p_inicio:$('inicio').value,p_caixa:$('caixaInicial').value,p_reserva:$('reservaInicial').value,p_motivo:$('motivoInicial').value.trim()};
  if(!args.p_motivo)throw new Error('Informe a justificativa.');pedidoInicial=requisicao(pedidoInicial,args);
  await rpc('financeiro_reserva_iniciar',{...args,p_requisicao:pedidoInicial.id});pedidoInicial=null;consulta=hoje;$('dataConsulta').value=hoje;offset=0;await carregar();msg('Saldos iniciais confirmados.');
 });};
 $('tipo').onchange=()=>{const ajuste=$('tipo').value.startsWith('ajuste');if(ajuste)$('valor').removeAttribute('min');else $('valor').min='0.01';$('dicaValor').textContent=ajuste?'Informe a diferença a corrigir: positiva para aumentar ou negativa para diminuir o saldo.':'Aporte e resgate transferem valores entre Caixa e Reserva, mantendo o total acumulado.';};
 $('formMovimento').onsubmit=e=>{e.preventDefault();executar(async()=>{
  const args={p_data:$('dataMovimento').value,p_tipo:$('tipo').value,p_valor:$('valor').value,p_motivo:$('motivo').value.trim()};
  if(!args.p_motivo)throw new Error('Informe a justificativa.');pedidoMovimento=requisicao(pedidoMovimento,args);
  await rpc('financeiro_reserva_registrar',{...args,p_requisicao:pedidoMovimento.id});pedidoMovimento=null;$('valor').value='';$('motivo').value='';consulta=hoje;$('dataConsulta').value=hoje;offset=0;await carregar();msg('Movimentação registrada.');
 });};
 $('anterior').onclick=()=>executar(async()=>{offset=Math.max(0,offset-30);await historico();msg('Histórico atualizado.');});
 $('proxima').onclick=()=>executar(async()=>{if(offset+30<total)offset+=30;await historico();msg('Histórico atualizado.');});
 db?.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT'){$('conteudo').hidden=true;msg('Sessão encerrada. Entre novamente.');}});
 (async()=>{try{
  for(const id of ['dataConsulta','dataMovimento','inicio']){$(id).value=hoje;$(id).max=hoje;}
  bloquear(true);await carregar();$('conteudo').hidden=false;msg('Área restrita de Caixa e Fundo de Reserva.');
 }catch(e){msg(e.message||'Não foi possível verificar o acesso.');}finally{bloquear(false);}})();
})();
