"use strict";
(async()=>{try{const r=await window.supabaseClient.rpc("financeiro_conferencia_responsaveis");if(!r.error)document.getElementById("linkResponsaveisConferencia").hidden=false;}catch(e){console.error("Erro ao verificar permissão de conferência",e);}})();
