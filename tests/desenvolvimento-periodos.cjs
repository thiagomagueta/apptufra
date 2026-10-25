const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');
const rows=[
 {usuario_id:'a',grupo:'banco_terca',data_inicio:'2026-01-01',data_fim:'2026-06-01'},
 {usuario_id:'a',grupo:'banco_sabado',data_inicio:'2026-06-01',data_fim:'2026-09-01'},
 {usuario_id:'a',grupo:'corrente_terca',data_inicio:'2026-09-01',data_fim:null}
];
const query={select(){return this},order(){return this},range:async()=>({data:rows,error:null})};
const ctx={window:{supabaseClient:{from(){return query}}}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/../desenvolvimento-periodos.js','utf8'),ctx);
(async()=>{
 const t=ctx.window.TufraPeriodos;await t.carregar();
 assert.equal(t.participa('a','Desenvolvimento','2026-05-31'),true);
 assert.equal(t.participa('a','Desenvolvimento','2026-06-01'),false);
 assert.equal(t.participa('a','Banco sábado','2026-06-01'),true);
 assert.equal(t.participa('a','Banco sábado','2026-08-31'),true);
 assert.equal(t.participa('a','Banco sábado','2026-09-01'),false);
 assert.equal(t.participa('a','Desenvolvimento','2026-09-01'),true);
 assert.equal(t.participa('a','Desenvolvimento','2025-12-31'),false);
 assert.deepEqual(Array.from(t.listas('a',['Desenvolvimento','Cambones'])),['Cambones','Desenvolvimento','Banco sábado']);
 assert.equal(t.participa('sem-historico','Desenvolvimento','2026-01-01'),null);
 assert.equal(t.participa('sem-historico','Banco sábado','2026-01-01'),false);
 const atividades=['2026-05-31','2026-06-01','2026-08-31','2026-09-01'].map(data=>({data}));
 assert.deepEqual(Array.from(t.filtrar('a','Desenvolvimento',atividades),x=>x.data),['2026-05-31','2026-09-01']);
 assert.deepEqual(Array.from(t.filtrar('a','Banco sábado',atividades),x=>x.data),['2026-06-01','2026-08-31']);
 console.log('12 verificações de períodos passaram: fronteiras, retorno, histórico e frequência.');
})().catch(e=>{console.error(e);process.exitCode=1});
// Verifica os consumidores reais da regra: dashboard, chamadas e relatório geral.
(async()=>{
 const t=ctx.window.TufraPeriodos;await t.carregar();
 function funcao(file,nome){const s=fs.readFileSync(__dirname+'/../'+file,'utf8');const i=s.indexOf('function '+nome+'(');assert.ok(i>=0,nome);return s.slice(i,s.indexOf('\n}\n',i)+3);}
 const sandbox={TufraPeriodos:t,usuarioPresencaDashboard:{id:'a'},funcoesPresencaDashboard:[{nome:'Médium em Desenvolvimento'}],presencas:[{usuario_id:'a',atividade_id:'fora',status:'falta'},{usuario_id:'a',atividade_id:'dentro',status:'presente'}],tipoListaAtual:{nome:'Desenvolvimento'}};
 vm.createContext(sandbox);
 vm.runInContext(funcao('dashboard.js','obterNomeSecundariaDashboard')+funcao('dashboard.js','criarNomesFuncoesExibicaoDashboard'),sandbox);
 assert.equal(vm.runInContext("criarNomesFuncoesExibicaoDashboard([{id:'pai',nome:'Médium em Desenvolvimento'},{id:'filho',nome:'Banco sábado',funcao_pai_id:'pai'}])[0]",sandbox),'Médium em Desenvolvimento - Banco sábado');
 vm.runInContext(funcao('relatorio-presenca-lista.js','obterPresenca')+funcao('relatorio-presenca-lista.js','obterSituacaoCelula'),sandbox);
 sandbox.obterDataAtualISO=()=> '2026-10-25';sandbox.obterDataEntradaNaLista=()=>null;
 const fora=vm.runInContext("obterSituacaoCelula({id:'a'},{id:'fora',data:'2026-07-01'})",sandbox);
 assert.equal(fora.tipo,'nao_participava');assert.equal(fora.texto,'!');
 const dentro=vm.runInContext("obterSituacaoCelula({id:'a'},{id:'dentro',data:'2026-09-01'})",sandbox);
 assert.equal(dentro.tipo,'presente');
 assert.equal(sandbox.presencas.length,2,'Lançamentos antigos preservados');
 console.log('Integração: nome Banco sábado completo, falta fora do período excluída e registro preservado.');
})().catch(e=>{console.error(e);process.exitCode=1});
