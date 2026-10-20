const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
(async()=>{
 for(const papel of ['associado','responsavel','tesoureiro']) {
  const equipe=papel==='responsavel',gestor=papel==='tesoureiro';
  for(const [arquivo,iniciar] of [['menu-adm.js','configurarMenuAdm'],['administrativo.js','carregarModulosAdministrativos']]) {
   const els=new Map();
   const doc={getElementById(id){if(!els.has(id))els.set(id,{hidden:true});return els.get(id);}};
   const client={auth:{getSession:async()=>({data:{session:{user:{id:'auth'}}}})},
    rpc:async name=>({data:name==='cadastro_administrativo'?{cadastrar:gestor,gerenciar:gestor}:{permitido:true,equipe,gerenciar:gestor}}),
    from(table){const result={data:table==='usuarios'?{id:'user'}:table==='usuario_funcoes'&&gestor?[{funcoes:{nome:'Tesoureiro'}}]:[]};
      const q={select(){return q;},eq(){return q;},limit(){return q;},maybeSingle(){return Promise.resolve(result);},then(a,b){return Promise.resolve(result).then(a,b);}};return q;}
   };
   const ctx={done:null,window:{supabaseClient:client,location:{href:''}},document:doc,console};
   vm.createContext(ctx);
   const code=fs.readFileSync(path.join(__dirname,'..',arquivo),'utf8').replace(iniciar+'();','done = '+iniciar+'();');
   vm.runInContext(code,ctx);await ctx.done;
   if(arquivo==='menu-adm.js')assert.equal(els.get('itemMenuAdm').hidden,!equipe&&!gestor,papel+' ADM');
   else if(equipe){assert.equal(ctx.window.location.href,'');assert.equal(els.get('moduloPermissoes').hidden,true);assert.equal(els.get('moduloAtendimentos').hidden,true);assert.equal(els.get('moduloAssociados').hidden,true);}
   else if(!gestor)assert.equal(ctx.window.location.href,'dashboard.html');
  }
 }
 console.log('ADM OK: responsável entra sem receber Gestão APP nem outros módulos; associado comum permanece sem ADM.');
})().catch(e=>{console.error(e);process.exit(1);});
