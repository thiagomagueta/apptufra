const {chromium}=require('playwright');const fs=require('fs');const path=require('path');const assert=require('assert');
(async()=>{
const browser=await chromium.launch({executablePath:'/workspace/scratch/67c9c5bbef35/browser-runtime/chromium',headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:844}});
const root=path.resolve(__dirname,'..');let html=fs.readFileSync(path.join(root,'gerenciar-funcoes.html'),'utf8').replace(/<script[\s\S]*?<\/script>/g,'');
await page.setContent(html);await page.evaluate(()=>{
 window.confirm=()=>true;window.calls=[];
 window.rows=[{id:'pai',nome:'Cambone',ordem:1,ativo:true,protegida:true,associados:12,regras:0,funcao_pai_id:null},{id:'filha',nome:'Acolhimento',ordem:1,ativo:true,protegida:false,associados:1,regras:0,funcao_pai_id:'pai'}];
 window.supabaseClient={rpc:async(name,p)=>{calls.push(p);if(p.p_acao==='listar')return {data:rows};if(p.p_acao==='salvar'){const d={...p.p_dados,protegida:false,associados:0,regras:0};d.id ||= 'nova';const i=rows.findIndex(r=>r.id===d.id);if(i<0)rows.push(d);else rows[i]=d;}if(p.p_acao==='excluir')rows=rows.filter(r=>r.id!==p.p_dados.id);return {data:{ok:true}};}};
});
await page.addScriptTag({path:path.join(root,'gerenciar-funcoes.js')});await page.locator('#gestaoFuncoes').waitFor({state:'visible'});
await page.getByRole('button',{name:'Editar',exact:true}).first().click();assert(await page.locator('#funcaoNome').isDisabled());assert(await page.locator('#funcaoPai').isDisabled());assert(await page.locator('#funcaoAtiva').isDisabled());
await page.locator('#novaFuncao').click();await page.locator('#funcaoNome').fill('Equipe de eventos');await page.locator('#funcaoPai').selectOption('pai');await page.locator('#salvarFuncao').click();await page.getByText('Função salva com sucesso.').waitFor();assert.equal(await page.locator('.funcao-gestao.filha').count(),2);
await page.locator('.funcao-gestao').filter({hasText:'Equipe de eventos'}).getByRole('button',{name:'Editar',exact:true}).click();await page.locator('#funcaoAtiva').uncheck();await page.locator('#salvarFuncao').click();await page.waitForFunction(()=>rows.find(x=>x.id==='nova')?.ativo===false);
await page.locator('.funcao-gestao').filter({hasText:'Equipe de eventos'}).getByRole('button',{name:'Excluir',exact:true}).click();await page.getByText('Função excluída.').waitFor();assert.equal(await page.locator('.funcao-gestao').count(),2);
// Falha de autorização deve manter controles ocultos.
await page.reload().catch(()=>{});await page.setContent(html);await page.evaluate(()=>window.supabaseClient={rpc:async()=>({error:{message:'Acesso restrito à Gestão APP.'}})});await page.addScriptTag({path:path.join(root,'gerenciar-funcoes.js')});await page.getByText('Acesso restrito à Gestão APP.').waitFor();assert(await page.locator('#gestaoFuncoes').isHidden());
await browser.close();console.log('OK: criação de filha, edição, desativação, exclusão, proteção dos campos e tela sem acesso.');
})();
