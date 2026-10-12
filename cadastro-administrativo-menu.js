"use strict";
(async()=>{try {
 const r=await window.supabaseClient.rpc('cadastro_administrativo',{p_acao:'acesso'}); if(r.error)throw r.error;
 const a=r.data;
 for(const id of ['linkCadastroAdministrativo','linkAssociadosSemConta']) document.getElementById(id).hidden=!a.cadastrar;
 for(const id of ['linkVincularCadastro','linkResponsaveisCadastro']) document.getElementById(id).hidden=!a.gerenciar;
 if(!a.gerenciar)document.querySelectorAll('.lista-acoes-administrativas > a:not([data-cadastro])').forEach(el=>el.remove());
}catch(e){console.error('Erro ao verificar cadastro administrativo',e);}})();