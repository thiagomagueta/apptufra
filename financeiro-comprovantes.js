"use strict";
(() => {
 const db=()=>window.supabaseClient;
 const money=v=>Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
 const cents=v=>Math.round(Number(v)*100);
 const today=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"America/Sao_Paulo",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
 const date=v=>String(v).split("-").reverse().join("/");
 const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 let user,authId,pessoas=[],cobrancas=[],busy=false,review=null,attempt=null;
 const selected=new Set(),amounts=new Map(),chargeLists=new Map();
 const historyPage=location.pathname.includes("historico");
 const style=node("style");
 style.textContent=`
 .comprovantes [hidden]{display:none!important}
 .comprovantes label{display:block;margin:10px 0 4px}
 .comprovantes input:not([type=checkbox]),.comprovantes select,.comprovantes textarea{width:100%;max-width:100%;box-sizing:border-box;padding:10px;border:1px solid #ccc;border-radius:6px;font-size:16px}
 .comprovantes input[type=checkbox]{width:20px;height:20px;flex-shrink:0}
 .comprovantes button{padding:10px 12px;border:0;border-radius:6px;background:#eee;color:#651b1d;font-size:15px;cursor:pointer}
 .comprovantes button:disabled{opacity:.5;cursor:default}
 .comprovantes .cp-pessoa{display:flex;align-items:center;gap:8px}
 .comprovantes .cp-cobranca{border-bottom:1px solid #eee;padding:8px 0}
 .comprovantes .cp-cobranca label{display:flex;align-items:center;gap:8px}
 .comprovantes .cp-lista-cobrancas{margin-left:28px}
 .comprovantes .cp-bloco-pessoa{margin-bottom:12px}
 .comprovantes .cp-acoes{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
 .comprovantes .cp-envio{padding:10px;border:1px solid #d5c6a6;border-radius:8px;margin:8px 0;overflow-wrap:anywhere}
 .comprovantes .cp-envio p{margin:5px 0;font-size:14px}
 `;
 document.head.appendChild(style);
 const section=node("section",undefined,"cartao-app comprovantes");section.hidden=true;
 section.innerHTML=`
 <h2>Comprovantes de pagamento</h2>
 <p>Um comprovante pode cobrir suas cobranças e as das pessoas vinculadas. O envio fica aguardando conferência.</p>
 <button id="cp-abrir" type="button">Enviar comprovante</button>
 <form id="cp-form" hidden>
 <h3>1. Pessoas e cobranças</h3><div id="cp-pessoas"></div>
 <p id="cp-total" role="status"></p>
 <h3>2. Dados do pagamento</h3>
 <label for="cp-valor">Valor total pago (R$)</label><input id="cp-valor" type="number" min="0.01" step="0.01" required>
 <label for="cp-data">Data do pagamento</label><input id="cp-data" type="date" required>
 <label for="cp-forma">Forma de pagamento</label><select id="cp-forma"><option value="pix">PIX</option><option value="dinheiro">Dinheiro</option><option value="debito">Débito</option><option value="credito">Crédito</option></select>
 <label for="cp-arquivo">Comprovante (JPG, PNG ou PDF, até 10 MB)</label><input id="cp-arquivo" type="file" accept="image/jpeg,image/png,application/pdf" required>
 <label for="cp-observacao">Observação (opcional)</label><textarea id="cp-observacao" maxlength="1000" rows="2"></textarea>
 <div class="cp-acoes"><button type="submit">Revisar envio</button><button id="cp-cancelar" type="button">Cancelar</button></div>
 </form>
 <div id="cp-revisao" hidden><h3>3. Revisar e enviar</h3><div id="cp-resumo"></div><p>As cobranças continuam em aberto até a aprovação da tesouraria.</p><div class="cp-acoes"><button id="cp-enviar" type="button">Confirmar envio</button><button id="cp-editar" type="button">Voltar e editar</button></div></div>
 <p id="cp-mensagem" role="status" aria-live="polite"></p>
 <div id="cp-area-historico" hidden><h3>Comprovantes enviados</h3><div id="cp-historico"></div></div>`;
 const container=document.querySelector(".conteudo-app");if(!container)return;
 const back=container.querySelector('a[href="financeiro.html"]');if(back)container.insertBefore(section,back);else container.appendChild(section);
 const el=id=>section.querySelector("#cp-"+id);
 const message=t=>{el("mensagem").textContent=t;};
 function lock(v){busy=v;section.querySelectorAll("button,input,select,textarea").forEach(n=>n.disabled=v);}
 function sum(){return [...amounts.values()].reduce((s,v)=>s+cents(v),0);}
 function total(){el("total").textContent="Total distribuído: "+money(sum()/100);}
 function drawCharges(){
  for(const p of pessoas){
   const list=chargeLists.get(p.usuario_id);list.replaceChildren();list.hidden=!selected.has(p.usuario_id);
   if(list.hidden)continue;
   const cs=cobrancas.filter(c=>c.usuario_id===p.usuario_id);
   if(!cs.length)list.appendChild(node("p","Nenhuma cobrança em aberto."));
   for(const c of cs){
    const available=Math.max(0,cents(c.saldo)-cents(c.pendente))/100;
    const row=node("div",undefined,"cp-cobranca"),label=node("label"),check=node("input");
    check.type="checkbox";check.checked=amounts.has(c.id);check.disabled=busy||available<=0;
    check.dataset.indisponivel=available<=0?"sim":"nao";
    label.append(check,node("span",(c.descricao||c.tipo+" "+date(c.competencia||""))+" — "+money(available)));
    row.appendChild(label);
    if(Number(c.pendente)>0)row.appendChild(node("small","Aguardando conferência: "+money(c.pendente)));
    check.addEventListener("change",()=>{if(check.checked)amounts.set(c.id,available);else amounts.delete(c.id);total();});
    list.appendChild(row);
   }
  }
  total();
 }
 async function options(){
  const r=await db().rpc("financeiro_comprovante_opcoes");if(r.error)throw r.error;
  pessoas=r.data.pessoas||[];cobrancas=r.data.cobrancas||[];selected.clear();selected.add(user);amounts.clear();
  el("pessoas").replaceChildren();chargeLists.clear();
  for(const p of pessoas){
   const label=node("label",undefined,"cp-pessoa"),check=node("input");check.type="checkbox";check.checked=p.usuario_id===user;
   check.addEventListener("change",()=>{if(check.checked)selected.add(p.usuario_id);else{selected.delete(p.usuario_id);cobrancas.filter(c=>c.usuario_id===p.usuario_id).forEach(c=>amounts.delete(c.id));}drawCharges();});
   const block=node("div",undefined,"cp-bloco-pessoa"),list=node("div",undefined,"cp-lista-cobrancas");
   chargeLists.set(p.usuario_id,list);
   label.append(check,node("span",p.nome+(p.usuario_id===user?" (você)":"")));block.append(label,list);el("pessoas").appendChild(block);
  }
  drawCharges();
 }
 async function history(){
  const [es,ds]=await Promise.all([
   db().from("financeiro_comprovantes_envios").select("id,enviado_por,nome_pagador,valor,data_pagamento,forma_pagamento,status,arquivo_path,enviado_em,conferido_em,motivo_recusa").order("enviado_em",{ascending:false}).limit(100),
   db().from("financeiro_comprovantes_destinacoes").select("envio_id,usuario_id,descricao,valor").limit(1000)
  ]);if(es.error)throw es.error;if(ds.error)throw ds.error;
  if(ds.data?.length===1000)throw Error("O histórico atingiu o limite de consulta.");
  el("historico").replaceChildren();
  if(!es.data.length)el("historico").appendChild(node("p","Nenhum comprovante enviado."));
  for(const e of es.data){
   const mine=e.enviado_por===user;
   const dest=ds.data.filter(d=>d.envio_id===e.id&&(mine||d.usuario_id===user));
   const card=node("div",undefined,"cp-envio");
   card.append(node("strong",e.status==="aguardando_conferencia"?"Aguardando conferência":e.status==="aprovado"?"Confirmado":"Recusado"),
    node("p","Pagamento realizado por "+e.nome_pagador),
    node("p",date(e.data_pagamento)+" · "+e.forma_pagamento.toUpperCase()+" · "+money(mine?e.valor:dest.reduce((s,d)=>s+Number(d.valor),0))));
   dest.forEach(d=>card.appendChild(node("p",d.descricao+" — "+money(d.valor))));
   if(e.conferido_em)card.appendChild(node("p","Conferido em: "+new Date(e.conferido_em).toLocaleString("pt-BR",{timeZone:"America/Sao_Paulo"})));
   if(e.motivo_recusa)card.appendChild(node("p","Motivo da recusa: "+e.motivo_recusa));
   const b=node("button","Ver comprovante");b.type="button";
   b.addEventListener("click",async()=>{
    const tab=window.open("about:blank","_blank");if(tab)tab.opener=null;
    try{const r=await db().storage.from("financeiro-comprovantes").createSignedUrl(e.arquivo_path,60);if(r.error)throw r.error;if(tab)tab.location.href=r.data.signedUrl;else message("Permita abrir uma nova aba para ver o comprovante.");}
    catch(err){tab?.close();message("Não foi possível abrir o comprovante: "+err.message);}
   });card.appendChild(b);el("historico").appendChild(card);
  }
 }
 el("abrir").addEventListener("click",async()=>{
  if(busy)return;if(attempt){message("Há um envio ainda não confirmado. Use Confirmar envio para tentar novamente.");return;}lock(true);message("Carregando cobranças...");
  try{el("form").reset();await options();attempt=null;el("editar").hidden=false;el("data").value=today();el("data").max=today();el("form").hidden=false;el("revisao").hidden=true;message("");}
  catch(e){message("Não foi possível carregar: "+e.message);}finally{lock(false);}
 });
 el("cancelar").addEventListener("click",()=>{el("form").hidden=true;message("");});
 el("editar").addEventListener("click",()=>{el("form").hidden=false;el("revisao").hidden=true;});
 el("form").addEventListener("submit",event=>{
  event.preventDefault();if(busy)return;
  try{
   const value=el("valor").value, file=el("arquivo").files[0];
   if(!amounts.size||!Number.isFinite(Number(value))||cents(value)!==sum())throw Error("O valor pago deve ser igual ao total distribuído.");
   for(const [id,v] of amounts){const c=cobrancas.find(c=>c.id===id);if(!Number.isFinite(Number(v))||Number(v)<=0||Number(v)!==cents(v)/100||cents(v)>cents(c.saldo)-cents(c.pendente))throw Error("Revise os valores destinados às cobranças.");}
   if(!file||!["image/jpeg","image/png","application/pdf"].includes(file.type)||file.size===0||file.size>10485760)throw Error("Escolha um JPG, PNG ou PDF de até 10 MB.");
   if(!el("data").value||el("data").value>today())throw Error("Informe uma data válida, até hoje.");
   review={value:Number(value),date:el("data").value,form:el("forma").value,note:el("observacao").value,file,dest:[...amounts].map(([id,v])=>({cobranca_id:id,valor:Number(v)}))};
   el("resumo").replaceChildren();
   for(const d of review.dest){const c=cobrancas.find(c=>c.id===d.cobranca_id),p=pessoas.find(p=>p.usuario_id===c.usuario_id);el("resumo").appendChild(node("p",p.nome+" · "+(c.descricao||c.tipo)+" · "+money(d.valor)));}
   el("resumo").append(node("strong","Total: "+money(review.value)),node("p",date(review.date)+" · "+review.form.toUpperCase()),node("p","Comprovante: "+file.name));
   if(review.note)el("resumo").appendChild(node("p",review.note));
   el("form").hidden=true;el("revisao").hidden=false;message("");
  }catch(e){message(e.message);}
 });
 el("enviar").addEventListener("click",async()=>{
  if(busy||!review)return;lock(true);message("Enviando comprovante...");
  try{
   // Após erro de rede, repetir usa o mesmo UUID, arquivo e distribuição.
   if(!attempt){const id=crypto.randomUUID(),ext={"image/jpeg":"jpg","image/png":"png","application/pdf":"pdf"}[review.file.type];attempt={id,path:authId+"/"+id+"/comprovante."+ext,review,uploaded:false};}
   const a=attempt,r=a.review;
   if(!a.uploaded){
    const up=await db().storage.from("financeiro-comprovantes").upload(a.path,r.file,{contentType:r.file.type,upsert:false});
    if(up.error&&String(up.error.statusCode)!=="409")throw up.error;
    a.uploaded=true;
   }
   const result=await db().rpc("financeiro_comprovante_enviar",{p_id:a.id,p_valor:r.value,p_data:r.date,p_forma:r.form,p_observacao:r.note,p_path:a.path,p_nome:r.file.name,p_destinacoes:r.dest});
   if(result.error)throw result.error;
   el("form").hidden=true;el("revisao").hidden=true;attempt=null;review=null;
   message("Comprovante enviado. Aguardando conferência. As cobranças ainda não receberam baixa.");
   if(historyPage)try{await history();}catch(e){message("Envio registrado. Recarregue a página para atualizar o histórico.");}
  }catch(e){message("Envio não confirmado: "+e.message+" Você pode tentar novamente sem duplicar o envio.");if(attempt){el("editar").hidden=true;}}
  finally{lock(false);}
 });
 (async()=>{
  try{
   const s=await db().auth.getSession();if(s.error)throw s.error;if(!s.data.session)return;
   authId=s.data.session.user.id;
   const access=await db().rpc("usuario_pode_acessar_financeiro");if(access.error)throw access.error;if(access.data!==true)return;
   const u=await db().from("usuarios").select("id").eq("auth_id",authId).maybeSingle();if(u.error)throw u.error;if(!u.data)return;
   user=u.data.id;section.hidden=false;
   if(historyPage){el("abrir").hidden=true;section.querySelector("h2").textContent="Histórico de comprovantes";section.querySelector("p").hidden=true;el("area-historico").hidden=false;await history();}
  }catch(e){message("Não foi possível carregar os comprovantes: "+e.message);}
 })();
})();