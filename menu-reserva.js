"use strict";
(async()=>{try{
 const r=await window.supabaseClient.rpc('financeiro_reserva_acesso');if(r.error)return;
 const caixa=document.getElementById('linkCaixaReserva'),permissoes=document.getElementById('linkResponsaveisReserva');
 if(caixa)caixa.hidden=!r.data.visualizar;if(permissoes)permissoes.hidden=!r.data.permissoes;
}catch(e){console.error('Erro ao verificar acesso à Reserva',e);}})();
