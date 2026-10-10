"use strict";
(() => {
 const db=window.supabaseClient, panel=document.getElementById("painelConferencia"), msg=document.getElementById("mensagemConferencia"), list=document.getElementById("listaConferencia"), filter=document.getElementById("filtroConferencia");
 const prev=document.getElementById("anteriorConferencia"), next=document.getElementById("proximaConferencia"), reload=document.getElementById("atualizarConferencia");
 const n=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
 const money=v=>Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
 const date=v=>v?String(v).split("-").reverse().join("/"):"—";
 const timestamp=v=>v?new Date(v).toLocaleString("pt-BR",{timeZone:"America/Sao_Paulo"}):"—";
 const forms={pix:"PIX",dinheiro:"Dinheiro",debito:"Débito",credito:"Crédito"};
 const months=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
 let offset=0,busy=false,total=0;
 function lock(v){busy=v;panel.querySelectorAll("button,select,textarea,input").forEach(e=>e.disabled=v||e.dataset.bloqueado==="sim");if(!v){prev.disabled=offset===0;next.disabled=offset+30>=total;}}
 async function openFile(e){
  const tab=window.open("about:blank","_blank");if(tab)tab.opener=null;
  try{const r=await db.storage.from("financeiro-comprovantes").createSignedUrl(e.arquivo_path,60);if(r.error)throw r.error;if(tab)tab.location.href=r.data.signedUrl;else msg.textContent="Permita abrir uma nova aba para ver o comprovante.";}
  catch(err){tab?.close();msg.textContent="Não foi possível abrir o comprovante: "+err.message;}
 }
 function card(e){
  const box=n("article");box.className="conferencia-cartao";
  box.append(n("strong",e.status==="aguardando_conferencia"?"Pagamento aguardando conferência":e.status==="aprovado"?"Pagamento confirmado":"Pagamento recusado"),n("p","Pagamento realizado por: "+e.nome_pagador),n("p","Valor informado: "+money(e.valor)),n("p","Data do pagamento: "+date(e.data_pagamento)),n("p","Forma: "+(forms[e.forma_pagamento]||e.forma_pagamento)),n("p","Enviado em: "+timestamp(e.enviado_em)));
  for(const d of e.destinacoes){
   const ref=d.tipo==="mensalidade"&&d.competencia?"Mensalidade "+months[Number(d.competencia.slice(5,7))-1]+"/"+d.competencia.slice(0,4):d.descricao;
   box.appendChild(n("p",d.nome+" · "+ref+" · "+money(d.valor)));
  }
  if(e.redistribuicoes?.length){
   const history=n("details"),summary=n("summary","Ver alterações da distribuição");history.append(summary);
   for(const r of e.redistribuicoes){
    const block=n("div");block.append(n("p",r.realizado_por+" · "+timestamp(r.registrado_em)),n("strong","Antes"));
    r.anteriores.forEach(d=>block.appendChild(n("p",d.nome+" · "+d.descricao+" · "+money(d.valor))));
    block.appendChild(n("strong","Depois"));r.posteriores.forEach(d=>block.appendChild(n("p",d.nome+" · "+d.descricao+" · "+money(d.valor))));history.append(block);
   }box.append(history);
  }
  if(e.observacao)box.appendChild(n("p","Observação: "+e.observacao));
  const actions=n("div");actions.className="conferencia-acoes";
  const file=n("button","Ver comprovante");file.type="button";file.addEventListener("click",()=>openFile(e));actions.append(file);box.append(actions);
  if(e.status!=="aguardando_conferencia"){
   box.appendChild(n("p","Conferido por: "+(e.nome_conferente||"—")+" · "+timestamp(e.conferido_em)));
   if(e.motivo_recusa)box.appendChild(n("p","Motivo da recusa: "+e.motivo_recusa));
   return box;
  }
  const confirm=n("button","Confirmar"),reject=n("button","Recusar");confirm.type=reject.type="button";actions.append(confirm,reject);
  const redistribute=n("button","Redistribuir pagamento");redistribute.type="button";actions.append(redistribute);
  const review=n("div");review.className="conferencia-confirmacao";review.hidden=true;box.append(review);
  redistribute.addEventListener("click",()=>editDistribution(e,review));
  function prepare(decision){
   if(busy)return;review.replaceChildren();review.hidden=false;
   review.appendChild(n("p",decision==="aprovado"?"Confirmar "+money(e.valor)+" conforme a distribuição acima? O sistema dará baixa nos valores indicados.":"Informe o motivo da recusa. As cobranças permanecerão sem baixa."));
   let reason;
   if(decision==="rejeitado"){const label=n("label","Motivo da recusa");reason=n("textarea");reason.id="motivo-"+e.id;reason.maxLength=1000;reason.rows=3;label.htmlFor=reason.id;review.append(label,reason);}
   const apply=n("button",decision==="aprovado"?"Confirmar pagamento":"Confirmar recusa"),cancel=n("button","Cancelar");apply.type=cancel.type="button";review.append(apply,cancel);
   cancel.addEventListener("click",()=>review.hidden=true);
   apply.addEventListener("click",async()=>{
    if(busy)return;const motive=reason?.value.trim()||"";
    if(decision==="rejeitado"&&!motive){msg.textContent="Informe o motivo da recusa.";reason.focus();return;}
    lock(true);msg.textContent="Registrando conferência...";
    try{
     const r=await db.rpc("financeiro_conferir_atual",{p_envio:e.id,p_decisao:decision,p_motivo:motive,p_versao:e.distribuicao_versao});if(r.error)throw r.error;
     await load();msg.textContent=decision==="aprovado"?"Pagamento confirmado. Valores aplicados às cobranças.":"Pagamento recusado. Motivo registrado no histórico.";
    }catch(err){msg.textContent="Não foi possível concluir: "+err.message+" Atualize a lista antes de tentar novamente.";}
    finally{lock(false);}
   });
   if(reason)reason.focus();else apply.focus();
  }
  confirm.addEventListener("click",()=>prepare("aprovado"));reject.addEventListener("click",()=>prepare("rejeitado"));return box;
 }
 async function editDistribution(e,review){
  if(busy)return;lock(true);msg.textContent="Carregando cobranças para redistribuir...";
  try{
   const r=await db.rpc("financeiro_redistribuicao_opcoes",{p_envio:e.id});if(r.error)throw r.error;
   const data=r.data,charges=data.cobrancas,selected=new Map(data.destinacoes.map(d=>[String(d.cobranca_id),String(d.valor)]));
   const ids=new Map(charges.map(c=>[String(c.id),c]));let attempt=null;
   if([...selected.keys()].some(id=>!ids.has(id)))throw Error("Uma cobrança não está disponível. Atualize a lista antes de continuar.");
   review.replaceChildren();review.hidden=false;
   review.append(n("h3","Redistribuir pagamento"),n("p","Valor pago: "+money(data.valor)));
   const form=n("form"),rows=n("div"),sumText=n("p"),search=n("input"),people=n("select"),charge=n("select"),add=n("button","Adicionar cobrança"),save=n("button","Salvar distribuição"),cancel=n("button","Cancelar");
   search.type="search";search.placeholder="Buscar associado";search.id="busca-"+e.id;
   people.id="pessoa-"+e.id;charge.id="cobranca-"+e.id;add.type=cancel.type="button";save.type="submit";
   const searchLabel=n("label","Buscar associado"),personLabel=n("label","Associado"),chargeLabel=n("label","Cobrança");searchLabel.htmlFor=search.id;personLabel.htmlFor=people.id;chargeLabel.htmlFor=charge.id;
   form.append(rows,sumText,n("h4","Adicionar cobrança"),searchLabel,search,personLabel,people,chargeLabel,charge,add);
   const actions=n("div");actions.className="conferencia-acoes";actions.append(save,cancel);form.append(actions);review.append(form);
   function ref(c){return c.tipo==="mensalidade"&&c.competencia?"Mensalidade "+months[Number(c.competencia.slice(5,7))-1]+"/"+c.competencia.slice(0,4):c.descricao||"Cobrança";}
   const cents=v=>Math.round(Number(v)*100);
   function destinations(){return [...selected].map(([id,value])=>({cobranca_id:ids.get(id).id,valor:Number(value)}));}
   function valid(){return selected.size>0&&[...selected].every(([id,v])=>Number.isFinite(Number(v))&&Number(v)>0&&Number(v)===cents(v)/100&&cents(v)<=cents(ids.get(id).saldo))&&[...selected.values()].reduce((s,v)=>s+cents(v),0)===cents(data.valor);}
   function total(){const sum=[...selected.values()].reduce((s,v)=>s+cents(v||0),0),difference=cents(data.valor)-sum;sumText.textContent="Total distribuído: "+money(sum/100)+(difference===0?" — total correto":difference>0?" · Falta distribuir: "+money(difference/100):" · Acima do valor pago: "+money(-difference/100));save.dataset.bloqueado=valid()?"nao":"sim";save.disabled=busy||!valid();}
   function drawCharges(){
    charge.replaceChildren();const placeholder=n("option","Selecione a cobrança");placeholder.value="";charge.append(placeholder);
    for(const c of charges.filter(c=>c.usuario_id===people.value&&!selected.has(String(c.id))&&Number(c.saldo)>0)){const o=n("option",ref(c)+" · Disponível: "+money(c.saldo));o.value=String(c.id);charge.append(o);}
   }
   function drawPeople(){
    const old=people.value;people.replaceChildren();const placeholder=n("option","Selecione o associado");placeholder.value="";people.append(placeholder);
    const names=new Map(charges.filter(c=>Number(c.saldo)>0).map(c=>[c.usuario_id,c.nome]));
    for(const [id,name] of names){if(search.value&&!name.toLocaleLowerCase("pt-BR").includes(search.value.toLocaleLowerCase("pt-BR")))continue;const o=n("option",name);o.value=id;people.append(o);}
    if([...people.options].some(o=>o.value===old))people.value=old;drawCharges();
   }
   function drawRows(){
    rows.replaceChildren();if(!selected.size)rows.append(n("p","Nenhuma cobrança selecionada."));
    for(const [id,v] of selected){
     const c=ids.get(id),row=n("div"),label=n("label",c.nome+" · "+ref(c)),input=n("input"),remove=n("button","Retirar");row.className="redistribuicao-cobranca";
     input.id="valor-"+e.id+"-"+id;label.htmlFor=input.id;input.type="number";input.min="0.01";input.step="0.01";input.max=String(c.saldo);input.required=true;input.value=v;remove.type="button";remove.setAttribute("aria-label","Retirar "+c.nome+" · "+ref(c));
     input.addEventListener("input",()=>{selected.set(id,input.value);total();});remove.addEventListener("click",()=>{if(busy||attempt)return;selected.delete(id);drawRows();drawCharges();total();});
     row.append(label,n("p","Disponível: "+money(c.saldo)),input,remove);rows.append(row);
    }
   }
   people.addEventListener("change",drawCharges);search.addEventListener("input",drawPeople);
   add.addEventListener("click",()=>{if(busy||attempt||!charge.value)return;const c=ids.get(charge.value);const current=[...selected.values()].reduce((s,v)=>s+cents(v||0),0);selected.set(charge.value,String(Math.max(0,Math.min(cents(c.saldo),cents(data.valor)-current))/100));drawRows();drawCharges();total();});
   cancel.addEventListener("click",()=>{if(!busy)review.hidden=true;});
   form.addEventListener("submit",async event=>{
    event.preventDefault();if(busy)return;if(!attempt&&!valid()){msg.textContent="Confira os valores. A distribuição deve fechar com o total pago e respeitar o saldo das cobranças.";return;}
    if(!attempt)attempt={id:crypto.randomUUID(),dest:destinations()};
    lock(true);msg.textContent="Salvando distribuição...";
    try{
     const saved=await db.rpc("financeiro_redistribuir",{p_envio:e.id,p_versao:data.versao,p_destinacoes:attempt.dest,p_alteracao:attempt.id});if(saved.error)throw saved.error;
     review.hidden=true;attempt=null;
     try{await load();msg.textContent="Distribuição salva. O pagamento continua aguardando conferência.";}
     catch(err){msg.textContent="Distribuição salva. Atualize a lista para conferir os novos valores.";}
    }catch(err){
     msg.textContent="Não foi possível confirmar a alteração: "+err.message+" Tente salvar novamente ou atualize a lista.";
     form.querySelectorAll("input,select,button").forEach(control=>{if(control!==save&&control!==cancel)control.dataset.bloqueado="sim";});
     save.textContent="Tentar salvar novamente";save.dataset.bloqueado="nao";
    }finally{lock(false);}
   });
   drawRows();drawPeople();total();msg.textContent="";
  }catch(err){msg.textContent="Não foi possível abrir a redistribuição: "+err.message;}
  finally{lock(false);}
 }
 async function load(){
  const r=await db.rpc("financeiro_conferencia_listar",{p_status:filter.value,p_offset:offset});if(r.error)throw r.error;
  total=Number(r.data.total);
  if(offset>=total&&offset>0){offset=Math.max(0,Math.floor((Math.max(1,total)-1)/30)*30);return load();}
  list.replaceChildren();for(const e of r.data.envios)list.append(card(e));
  if(!r.data.envios.length)list.appendChild(n("p","Nenhum pagamento nesta situação."));
  document.getElementById("paginaConferencia").textContent=total?`${offset+1}–${Math.min(offset+30,total)} de ${total}`:"0 pagamentos";
 }
 async function refresh(){if(busy)return;lock(true);msg.textContent="Carregando pagamentos...";try{await load();msg.textContent="";}catch(e){list.replaceChildren();msg.textContent="Não foi possível carregar: "+e.message;}finally{lock(false);}}
 filter.addEventListener("change",()=>{offset=0;refresh();});reload.addEventListener("click",refresh);
 prev.addEventListener("click",()=>{if(busy)return;offset=Math.max(0,offset-30);refresh();});next.addEventListener("click",()=>{if(busy)return;offset+=30;refresh();});
 (async()=>{try{
  const s=await db.auth.getSession();if(s.error)throw s.error;if(!s.data.session){location.href="index.html";return;}
  const r=await db.rpc("financeiro_pode_conferir");if(r.error)throw r.error;
  if(r.data!==true){msg.textContent="Você não tem permissão para conferir pagamentos.";return;}
  panel.hidden=false;await refresh();
 }catch(e){msg.textContent="Não foi possível verificar o acesso: "+e.message;}})();
})();
