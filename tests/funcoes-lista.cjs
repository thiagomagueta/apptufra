const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/../permissao-usuario.js','utf8');
const i=source.indexOf('function criarCheckboxFuncao('),end=source.indexOf('\n}\n',i)+3;
const document={createElement(tag){return {tag,children:[],dataset:{},appendChild(n){this.children.push(n)},addEventListener(name,fn){this[name]=fn}}}};
const checkboxes=[];const ctx={document,listaFuncoesPermissao:{querySelectorAll(){return checkboxes}}};vm.createContext(ctx);vm.runInContext(source.slice(i,end),ctx);
for(const nome of ['Médium Corrente Principal','Médium em Desenvolvimento','Banco do Desenvolvimento','Corrente do Desenvolvimento','Banco sábado','Cantina']){
 const linha=ctx.criarCheckboxFuncao({id:nome,nome,ativo:true},[]);checkboxes.push(linha.children[0]);
}
const porNome=nome=>checkboxes.find(c=>c.dataset.funcaoNome===nome);
const clicar=nome=>{const c=porNome(nome);c.checked=!c.checked;c.change()};
assert.ok(checkboxes.every(c=>!c.disabled));
clicar('Cantina');clicar('Banco sábado');
assert.equal(porNome('Médium em Desenvolvimento').checked,true);
clicar('Médium Corrente Principal');
assert.equal(porNome('Banco sábado').checked,false);assert.equal(porNome('Médium em Desenvolvimento').checked,false);assert.equal(porNome('Cantina').checked,true);
clicar('Corrente do Desenvolvimento');
assert.equal(porNome('Médium Corrente Principal').checked,false);assert.equal(porNome('Médium em Desenvolvimento').checked,true);
clicar('Banco do Desenvolvimento');assert.equal(porNome('Corrente do Desenvolvimento').checked,false);
clicar('Médium em Desenvolvimento');assert.equal(porNome('Banco do Desenvolvimento').checked,false);
console.log('Lista de funções: opções liberadas, seleção coerente e demais funções preservadas.');
