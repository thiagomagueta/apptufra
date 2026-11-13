const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync(require('path').join(__dirname,'../fale-com-a-gente.js'),'utf8');
let atendimento={id:'teste',criado_em:'2026-11-12T12:00:00Z',assunto:'Teste',categoria:'Outro',situacao:'aguardando_confirmacao',encerramento_solicitado_em:'2026-11-12T12:00:00Z'};
const ctx={avaliacoes:{satisfeito:"Satisfeito"},equipe:false,conteudo:{innerHTML:''},titulo:{},voltar:{},rpc:async()=>({atendimento,mensagens:[],leituras:[]}),esc:s=>s??'',data:v=>new Date(v).toISOString(),badge:s=>s,formSubmit(){},document:{getElementById:id=>id==='atualizarConversa'?{}:null}};
vm.createContext(ctx);vm.runInContext(source.slice(source.indexOf('  const prazoEncerramento'),source.indexOf('  const badge')),ctx);vm.runInContext(source.slice(source.indexOf('  async function detalhe('),source.indexOf('  async function gerenciar(')),ctx);
(async()=>{
 await ctx.detalhe('teste');assert(ctx.conteudo.innerHTML.includes('2026-11-17T12:00:00.000Z'));assert(ctx.conteudo.innerHTML.includes('Após 5 dias sem confirmação'));assert(ctx.conteudo.innerHTML.includes('Confirmar encerramento'));
 atendimento={...atendimento,situacao:'finalizado',encerrado_automaticamente:true};await ctx.detalhe('teste');assert(ctx.conteudo.innerHTML.includes('Encerrado automaticamente após 5 dias'));assert(!ctx.conteudo.innerHTML.includes('id="formMensagem"'));assert(!ctx.conteudo.innerHTML.includes('id="confirmarFale"'));assert(ctx.conteudo.innerHTML.includes('Abra outro atendimento')||ctx.conteudo.innerHTML.includes('abra outro atendimento'));
 console.log('OK: prazo visível, finalização automática identificada, conversa encerrada sem campo para novas mensagens.');
})();
