"use strict";
(async()=>{
 try{
  const db=window.supabaseClient,s=await db.auth.getSession();if(s.error||!s.data.session)return;
  const r=await db.rpc("financeiro_conferencia_pendentes");if(r.error||Number(r.data)<=0)return;
  const section=document.createElement("section"),title=document.createElement("h2"),link=document.createElement("a");section.className="cartao-app";section.setAttribute("role","status");title.textContent="Pagamentos aguardando conferência";link.href="financeiro-conferencia.html";link.className="link-administrativo";link.textContent=Number(r.data)===1?"1 pagamento pendente — Conferir":""+r.data+" pagamentos pendentes — Conferir";section.append(title,link);
  const container=document.querySelector(".conteudo-app"),header=container?.querySelector(".cabecalho-app");if(header)header.after(section);
 }catch(e){console.error("Erro ao consultar pendências de pagamento",e);}
})();
