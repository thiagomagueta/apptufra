const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/../listas-presenca.js','utf8');const a=source.indexOf('function calcularSituacaoAtividade('),b=source.indexOf('\n}\n',a)+3;
const ctx={TufraPeriodos:{associadoNaData:(u,d)=>(!u.data_saida_tufra || d<u.data_saida_tufra),participa:(id,nome,data)=>data>='2026-10-25'}};vm.createContext(ctx);vm.runInContext(source.slice(a,b),ctx);
const pessoas=[{id:'a',data_entrada_tufra:'2026-01-01'},{id:'b',data_entrada_tufra:'2026-01-01'}], atividade={id:'gira',data:'2026-10-31'};
assert.equal(ctx.calcularSituacaoAtividade(atividade,[],[],'Banco sábado'),'Sem participantes');
assert.equal(ctx.calcularSituacaoAtividade({...atividade,data:'2026-10-24'},pessoas,[],'Banco sábado'),'Sem participantes');
assert.equal(ctx.calcularSituacaoAtividade(atividade,pessoas,[],'Banco sábado'),'Pendente');
const um=[{atividade_id:'gira',usuario_id:'a',status:'presente'}];
assert.equal(ctx.calcularSituacaoAtividade(atividade,pessoas,um,'Banco sábado'),'Pendente');
assert.equal(ctx.calcularSituacaoAtividade(atividade,pessoas,[...um,{atividade_id:'gira',usuario_id:'b',status:'justificada'}],'Banco sábado'),'✓ Preenchida');
assert.equal(ctx.calcularSituacaoAtividade(atividade,pessoas,[...um,...um],'Banco sábado'),'Pendente');
assert.equal(ctx.calcularSituacaoAtividade(atividade,pessoas,[{atividade_id:'gira',usuario_id:'antigo',status:'presente'}],'Banco sábado'),'Pendente');
console.log('7 casos passaram: lista vazia, período sem participantes, pendência, preenchimento parcial e completo e registros antigos.');

assert.equal(ctx.calcularSituacaoAtividade(atividade,[{id:'a',data_saida_tufra:'2026-10-30'}],[],'Banco sábado'),'Sem participantes');
