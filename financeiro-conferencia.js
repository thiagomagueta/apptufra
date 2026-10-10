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
 function lock(v){busy=v;panel.querySelectorAll("button,select,textarea").forEach(e=>e.disabled=v);if(!v){prev.disabled=offset===0;next.disabled=offset+30>=total;}}
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
  if(e.observacao)box.appendChild(n("p","Observação: "+e.observacao));
  const actions=n("div");actions.className="conferencia-acoes";
  const file=n("button","Ver comprovante");file.type="button";file.addEventListener("click",()=>openFile(e));actions.append(file);box.append(actions);
  if(e.status!=="aguardando_conferencia"){
   box.appendChild(n("p","Conferido por: "+(e.nome_conferente||"—")+" · "+timestamp(e.conferido_em)));
   if(e.motivo_recusa)box.appendChild(n("p","Motivo da recusa: "+e.motivo_recusa));
   return box;
  }
  const confirm=n("button","Confirmar"),reject=n("button","Recusar");confirm.type=reject.type="button";actions.append(confirm,reject);
  const review=n("div");review.className="conferencia-confirmacao";review.hidden=true;box.append(review);
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
     const r=await db.rpc("financeiro_conferir",{p_envio:e.id,p_decisao:decision,p_motivo:motive});if(r.error)throw r.error;
     await load();msg.textContent=decision==="aprovado"?"Pagamento confirmado. Valores aplicados às cobranças.":"Pagamento recusado. Motivo registrado no histórico.";
    }catch(err){msg.textContent="Não foi possível concluir: "+err.message+" Atualize a lista antes de tentar novamente.";}
    finally{lock(false);}
   });
   if(reason)reason.focus();else apply.focus();
  }
  confirm.addEventListener("click",()=>prepare("aprovado"));reject.addEventListener("click",()=>prepare("rejeitado"));return box;
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
