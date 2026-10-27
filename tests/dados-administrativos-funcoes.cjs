const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const nodes=new Map();
class Element {
 constructor(tag){this.tag=tag;this.children=[];this.dataset={}}
 set id(v){this._id=v;nodes.set(v,this)}get id(){return this._id}
 addEventListener(nome,fn){this[nome]=fn}
 append(...ns){ns.forEach(n=>{n.parent=this;this.children.push(n)})}
 insertBefore(n,antes){n.parent=this;this.children.splice(this.children.indexOf(antes),0,n)}
 remove(){nodes.delete(this.id);if(this.parent)this.parent.children=this.parent.children.filter(n=>n!==this)}
}
const document={createElement:t=>new Element(t),getElementById:id=>nodes.get(id)};
for(const id of ['visualizacaoDatasAdministrativas','edicaoDatasAdministrativas','areaEdicaoHistoricoFuncoes']){const n=new Element('div');n.id=id;}
nodes.get('edicaoDatasAdministrativas').append(nodes.get('areaEdicaoHistoricoFuncoes'));
const ps=[{grupo:'banco_terca',data_inicio:'2026-01-01',data_fim:'2026-10-25'},{grupo:'banco_sabado',data_inicio:'2026-10-25',data_fim:null}];
const ctx={window:{},document,TufraPeriodos:{daPessoa:()=>ps,grupos:{banco_terca:'Banco do Desenvolvimento',banco_sabado:'Banco sábado'}},converterDataParaISO:v=>v.split('/').reverse().join('-')};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/../desenvolvimento-periodos-editor.js','utf8'),ctx);
(async()=>{
 await ctx.window.montarHistoricoPeriodosResumo('pessoa',true);
 assert.equal(nodes.get('funcoesDatasVisualizacao').parent.id,'visualizacaoDatasAdministrativas');
 assert.equal(nodes.get('funcoesDatasEdicao').parent.id,'edicaoDatasAdministrativas');
 assert.equal(nodes.has('historicoPeriodosMediunicos'),false);
 assert.equal(nodes.get('dataMudancaFuncao1').value,'25/10/2026');
 nodes.get('dataMudancaFuncao1').value='24/10/2026';
 const editados=ctx.window.obterPeriodosDadosAdministrativos('pessoa');
 assert.equal(editados[0].data_fim,'2026-10-24');assert.equal(editados[1].data_inicio,'2026-10-24');
 // A entrada na Principal usa o campo existente, sem outra linha ou outro input.
 ps.splice(0,ps.length,{grupo:'principal',data_inicio:'2026-01-01',data_fim:null});
 ctx.TufraPeriodos.grupos.principal='Médium Corrente Principal';
 nodes.delete('dataMudancaFuncao0');nodes.delete('dataMudancaFuncao1');
 const item=new Element('div');item.id='itemDataCorrentePrincipal';item.hidden=false;
 const campo=new Element('input');campo.id='dataCorrentePrincipal';campo.value='01/01/2026';
 await ctx.window.montarHistoricoPeriodosResumo('pessoa',true);
 assert.equal(nodes.get('funcoesDatasVisualizacao').children.length,0);
 assert.equal(nodes.get('funcoesDatasEdicao').children.length,0);
 campo.value='02/01/2026';
 assert.equal(ctx.window.obterPeriodosDadosAdministrativos('pessoa')[0].data_inicio,'2026-01-02');
 ps.splice(0,ps.length,{grupo:'fora',data_inicio:'2026-01-01',data_fim:'2026-10-26'},{grupo:'banco_terca',data_inicio:'2026-10-26',data_fim:null});
 nodes.delete('dataMudancaFuncao0');
 await ctx.window.montarHistoricoPeriodosResumo('pessoa',true);
 assert.equal(nodes.get('funcoesDatasVisualizacao').children.length,1);
 assert.equal(nodes.get('funcoesDatasVisualizacao').children[0].children[0].textContent,'Início no Desenvolvimento');
 assert.equal(nodes.has('dataMudancaFuncao0'),false);
 nodes.get('dataMudancaFuncao1').value='25/10/2026';
 const corrigidos=ctx.window.obterPeriodosDadosAdministrativos('pessoa');
 assert.equal(corrigidos[0].data_inicio,'2026-01-01');
 assert.equal(corrigidos[0].data_fim,'2026-10-25');
 assert.equal(corrigidos[1].data_inicio,'2026-10-25');
 console.log('Dados administrativos: visualização e edição integradas; fronteiras corrigidas pelo mesmo formulário.');
})().catch(e=>{console.error(e);process.exitCode=1});
