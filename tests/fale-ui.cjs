const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
(async()=>{
 const browser = await chromium.launch({headless:true,...(process.env.FALE_CHROMIUM_PATH?{executablePath:process.env.FALE_CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 async function page(permitido=true,viewport={width:390,height:844}) {
  const context=await browser.newContext({viewport});
  const p=await context.newPage();
  await p.addInitScript(({permitido})=>{
   window.fake = {
    state:'nao_lido',rating:null,mensagens:[{id:1,autor_nome:'Associado de teste',tipo:'associado',texto:'Gostaria de conversar sobre minha participação nas atividades.',criado_em:'2026-10-18T23:00:00Z'}],
    async rpc(name,{p_acao:a,p_dados:d={}}={}) {
     if(name!=='fale_com_a_gente') return {data:false,error:null};
     const self=window.fake;
     if(a==='acesso') return {data:{permitido,equipe:permitido,piloto:true}};
     if(!permitido) return {error:{message:'Módulo indisponível'}};
     let data={salvo:true};
     if(a==='avisos') data={meus:1,equipe:2};
     if(a==='detalhe') {if(d.equipe&&self.state==='nao_lido')self.state='lido';data={atendimento:{id:'t1',usuario_id:'u1',assunto:'Quero conversar',categoria:'Pedido de ajuda',nome:'Associado de teste',situacao:self.state,criado_em:'2026-10-18T23:00:00Z',avaliacao:self.rating},mensagens:self.mensagens.filter(m=>d.equipe||m.tipo!=='interna'),leituras:d.equipe?[{nome:'Responsável de teste',lido_em:'2026-10-18T23:00:00Z'}]:[]};}
     if(a==='listar') data={atendimentos:[{id:'t1',usuario_id:'u1',nome:'Associado de teste',assunto:'Quero conversar',situacao:self.state,categoria:'Pedido de ajuda',criado_em:'2026-10-18T23:00:00Z',novo:true}]};
     if(a==='mensagem')self.mensagens.push({id:self.mensagens.length+1,autor_nome:'Responsável de teste',tipo:d.interna?'interna':d.equipe?'resposta':'associado',texto:d.texto,criado_em:'2026-10-18T23:10:00Z'});
     if(a==='mensagem' && d.equipe && !d.interna)self.state='em_acompanhamento';
     if(a==='encerrar')self.state='aguardando_confirmacao';
     if(a==='confirmar')self.state='finalizado';
     if(a==='avaliar')self.rating=d.avaliacao;
     if(a==='responsaveis')data={usuarios:[{id:'u1',nome:'Responsável de teste',selecionado:true},{id:'u2',nome:'Outra pessoa',selecionado:false}]};
     if(a==='criar')data={id:'t1'};
     return {data,error:null};
    },auth:{getSession:async()=>({data:{session:{user:{id:'x'}}}})}
   };
   window.supabase={createClient:()=>window.fake};
  },{permitido});
  await p.route('**/*',async route=>{
   const u=new URL(route.request().url());
   if(u.hostname==='cdn.jsdelivr.net')return route.fulfill({contentType:'text/javascript',body:''});
   let file=u.pathname.replace(/\/+$/, '').split('/').pop()||'dashboard.html';
   if(!file.includes('.')) file += '.html';
   if(['menu-global.js','menu-adm.js','menu-financeiro.js','app.js','dashboard.js','dashboard-comunicados.js','financeiro-conferencia-alerta.js','administrativo.js','menu-reserva.js','cadastro-administrativo-menu.js','permissoes-conferencia-menu.js'].includes(file)) return route.fulfill({contentType:'text/javascript',body:''});
   const local=path.join(root,file);
   if(fs.existsSync(local))return route.fulfill({path:local});
   return route.fulfill({status:404,body:''});
  });
  return p;
 }
 function semOverflow(p){return p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);}
 const normal=await page(false);
 await normal.goto('http://127.0.0.1:8765/dashboard.html');
 assert.equal(await normal.getByRole('link',{name:'Escrever uma mensagem'}).count(),0);
 await normal.goto('http://127.0.0.1:8765/fale-com-a-gente.html?equipe=1');
 await normal.getByText('Módulo indisponível para seu perfil.').waitFor();
 assert.equal(await normal.locator('#faleConteudo').isVisible(),false);
 const p=await page();
 for (const suffix of ['dashboard','dashboard/','dashboard.html']) {
  await p.goto('http://127.0.0.1:8765/'+suffix);
  await p.getByRole('link',{name:'Escrever uma mensagem'}).waitFor();
 }
 for (const suffix of ['administrativo','administrativo.html','adm-permissoes','adm-permissoes.html']) {
  await p.goto('http://127.0.0.1:8765/'+suffix);
  await p.getByRole('link',{name:suffix.startsWith('administrativo')?'Atendimentos — Fale com a gente':'Responsáveis — Fale com a gente'}).waitFor();
 }
 await p.goto('http://127.0.0.1:8765/dashboard.html');
 await p.getByRole('link',{name:'Escrever uma mensagem'}).waitFor();
 assert(await p.evaluate(()=>document.getElementById('proximaAtividadeDashboard').closest('section').nextElementSibling.textContent.includes('Fale com a gente')));
 assert(await semOverflow(p));
 await p.screenshot({path:'/tmp/fale-dashboard.png',fullPage:true});
 await p.goto('http://127.0.0.1:8765/fale-com-a-gente.html?novo=1');
 await p.getByLabel('Assunto',{exact:true}).fill('Teste UI');await p.getByLabel('Mensagem',{exact:true}).fill('Minha mensagem');
 assert(await semOverflow(p));
 await p.screenshot({path:'/tmp/fale-novo.png',fullPage:true});
 await p.goto('http://127.0.0.1:8765/fale-com-a-gente.html?id=t1&equipe=1');
 await p.getByLabel('Escrever resposta').fill('Nota interna de teste');await p.getByText('Anotação interna — somente equipe',{exact:true}).click();
 await p.getByRole('button',{name:'Enviar registro'}).click();await p.getByText('Registro enviado.',{exact:true}).waitFor();
 assert(await p.getByText('Nota interna de teste',{exact:true}).isVisible());
 assert.equal(await p.getByRole('button',{name:'Marcar em acompanhamento'}).count(),0);
 await p.getByLabel('Escrever resposta').fill('Resposta ao associado');
 await p.getByRole('button',{name:'Enviar registro'}).click();
 await p.getByText('Em acompanhamento',{exact:true}).waitFor();
 assert.equal(await p.getByLabel('Parecer final').count(),0);
 p.on('dialog',d=>d.accept());await p.getByRole('button',{name:'Solicitar encerramento'}).click();
 await p.getByText('Aguardando o associado confirmar o encerramento.',{exact:true}).waitFor();
 // Trocar apenas a visão conservando a fixture: navegação reinicia o estado mock.
 await p.evaluate(()=>{window.fake.state='aguardando_confirmacao';});
 assert(await semOverflow(p));await p.screenshot({path:'/tmp/fale-equipe.png',fullPage:true});
 const user=await page();
 await user.goto('http://127.0.0.1:8765/fale-com-a-gente.html?id=t1');
 await user.evaluate(()=>window.fake.state='aguardando_confirmacao');
 await user.getByRole('button',{name:'Atualizar conversa'}).click();
 user.on('dialog',d=>d.accept());await user.getByRole('button',{name:'Confirmar encerramento',exact:true}).click();
 await user.getByText('Como você avalia este atendimento?',{exact:true}).waitFor();
 assert.equal(await user.getByLabel('Escrever complemento').count(),0);
 await user.getByLabel('Sua avaliação').selectOption('parcialmente_satisfeito');await user.getByRole('button',{name:'Enviar avaliação'}).click();await user.getByText('Avaliação registrada.',{exact:true}).waitFor();
 assert(await semOverflow(user));await user.screenshot({path:'/tmp/fale-finalizado.png',fullPage:true});
 await p.goto('http://127.0.0.1:8765/fale-com-a-gente.html?responsaveis=1');
 await p.getByLabel('Buscar pessoa').fill('Outra');assert.equal(await p.locator('.fale-responsavel:visible').count(),1);
 await p.getByRole('button',{name:'Salvar responsáveis'}).click();await p.getByText('Responsáveis salvos. O acesso permanece exclusivo para Tesoureiro.').waitFor();
 await p.goto('http://127.0.0.1:8765/fale-com-a-gente.html?equipe=1');await p.getByText('Histórico deste associado').waitFor();assert(await semOverflow(p));
 const desktop=await page(true,{width:1280,height:900});await desktop.goto('http://127.0.0.1:8765/fale-com-a-gente.html?id=t1&equipe=1');await desktop.getByLabel('Escrever resposta').waitFor();assert(await semOverflow(desktop));
 await desktop.screenshot({path:'/tmp/fale-desktop.png',fullPage:true});
 await browser.close();console.log('UI OK: acesso negado, posição do cartão, formulários, notas internas, encerramento, avaliação, responsáveis, lista e layouts móvel/desktop.');
})().catch(e=>{console.error(e);process.exit(1)});
