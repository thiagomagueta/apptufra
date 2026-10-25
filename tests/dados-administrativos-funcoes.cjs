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
 console.log('Dados administrativos: visualização e edição integradas; fronteiras corrigidas pelo mesmo formulário.');
})().catch(e=>{console.error(e);process.exitCode=1});
