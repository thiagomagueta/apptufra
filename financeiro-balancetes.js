"use strict";
(() => {
 const db=window.supabaseClient, $=id=>document.getElementById(id);
 const moeda=n=>Number(n).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
 const mes=d=>new Date(d+'T12:00:00').toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
 let previa=null,pedido=null,ocupado=false,consulta=0;
 const msg=t=>{$('mensagem').textContent=t;};
 const rpc=async(nome,args={})=>{const r=await db.rpc(nome,args);if(r.error)throw r.error;return r.data;};
 const node=(tag,text,parent)=>{const n=document.createElement(tag);n.textContent=text;parent.append(n);return n;};
 function limpar(){previa=null;pedido=null;$('relatorio').hidden=true;$('acoesRelatorio').hidden=true;$('formFechar').hidden=true;}
 function mostrar(r,versao){
  $('tituloRelatorio').textContent='Movimento do Caixa — '+mes(r.competencia);
  $('estadoRelatorio').textContent=versao?'Fechado · versão '+versao.versao+' · '+new Date(versao.fechado_em).toLocaleString('pt-BR'):'Prévia · aguardando conferência';
  $('categorias').replaceChildren();
  for(const [tipo,titulo] of [['receita','Entradas'],['despesa','Saídas']]){
   node('h3',titulo,$('categorias'));const itens=r.categorias.filter(c=>c.tipo===tipo);
   if(!itens.length){node('p','Sem movimentação.',$('categorias'));continue;}
   const tabela=node('table','',$('categorias')),cab=node('tr','',node('thead','',tabela));node('th','Categoria',cab).scope='col';node('th','Valor',cab).scope='col';const corpo=node('tbody','',tabela);
   for(const item of itens){const linha=node('tr','',corpo);node('td',item.categoria,linha);node('td',moeda(item.valor),linha);}
  }
  $('totalEntradas').textContent='Total de entradas: '+moeda(r.entradas);
  $('totalSaidas').textContent='Total de saídas: '+moeda(r.saidas);
  $('resultado').textContent='Resultado do mês: '+moeda(r.resultado);
  $('alerta').textContent=Number(r.divergencia_classificacao)?'Classificação divergente em recebimentos: '+moeda(r.divergencia_classificacao)+'. Confira o Caixa antes de fechar.':'';
  $('relatorio').hidden=false;$('acoesRelatorio').hidden=false;$('formFechar').hidden=!!versao||Number(r.divergencia_classificacao)!==0;
 }
 async function historico(){const lista=await rpc('financeiro_balancetes_historico');$('historico').replaceChildren();if(!lista.length)node('p','Nenhum balancete fechado.',$('historico'));
  for(const item of lista){const box=node('div','',$('historico'));box.className='registro';node('strong',mes(item.competencia)+' · versão '+item.versao,box);node('p',new Date(item.fechado_em).toLocaleString('pt-BR')+' · '+item.responsavel,box);node('p',item.motivo,box);const b=node('button','Consultar versão',box);b.className='botao';b.type='button';b.onclick=()=>{if(ocupado)return;++consulta;limpar();mostrar(item.resumo,item);msg('Versão fechada carregada.');$('relatorio').scrollIntoView({behavior:'smooth',block:'start'});};}
 }
 function bloquear(v){ocupado=v;for(const id of ['gerar','fechar','competencia','motivo','atualizarHistorico'])$(id).disabled=v;}
 $('competencia').onchange=()=>{++consulta;limpar();msg('Gere a prévia do mês selecionado.');};
 $('formConsulta').onsubmit=async e=>{e.preventDefault();if(ocupado)return;const atual=++consulta;limpar();bloquear(true);msg('Gerando balancete...');try{const r=await rpc('financeiro_balancete_previa',{p_competencia:$('competencia').value+'-01'});if(atual!==consulta)return;previa=r;$('motivo').value='Fechamento mensal';mostrar(r);msg('Confira os valores antes de fechar.');}catch(e){msg(e.message||'Não foi possível gerar o balancete.');}finally{bloquear(false);}};
 $('formFechar').onsubmit=async e=>{e.preventDefault();if(ocupado||!previa)return;const motivo=$('motivo').value.trim();if(!motivo){msg('Informe a observação do fechamento.');return;}if(!pedido||pedido.motivo!==motivo||pedido.digest!==previa.digest)pedido={id:crypto.randomUUID(),motivo,digest:previa.digest};bloquear(true);msg('Fechando balancete...');try{const r=await rpc('financeiro_balancete_fechar',{p_competencia:previa.competencia,p_digest:previa.digest,p_requisicao:pedido.id,p_motivo:motivo});limpar();await historico();msg('Balancete fechado · versão '+r.versao+'. Consulte no histórico.');}catch(e){msg(e.message||'Não foi possível fechar. Tente novamente.');}finally{bloquear(false);}};
 $('imprimir').onclick=()=>window.print();
 $('atualizarHistorico').onclick=async()=>{if(ocupado)return;bloquear(true);try{await historico();msg('Histórico atualizado.');}catch(e){msg(e.message);}finally{bloquear(false);}};
 (async()=>{try{if(!db||await rpc('financeiro_pode_negociar')!==true){msg('Acesso não autorizado.');return;}const d=new Date();$('competencia').value=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');await historico();$('conteudo').hidden=false;msg('Selecione o mês para gerar a prévia.');}catch(e){msg(e.message||'Não foi possível iniciar.');}})();
})();
