'use strict';
(async()=>{const link=document.getElementById('linkGerenciarFuncoes');if(!link || !window.supabaseClient)return;try{const r=await window.supabaseClient.rpc('gerenciar_funcoes',{p_acao:'listar'});link.hidden=!!r.error;}catch{link.hidden=true;}})();
