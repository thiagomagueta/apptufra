"use strict";
// Leitura pura: nenhuma operação financeira é executada aqui.
(function(root){
 function csv(text,separator){
  text=text.replace(/^\uFEFF/,'');
  if(!separator){const line=text.split(/\r?\n/).find(x=>x.trim())||'';separator=[';',',','\t'].sort((a,b)=>line.split(b).length-line.split(a).length)[0];}
  const rows=[];let row=[],cell='',quoted=false;
  for(let i=0;i<text.length;i++){
   const c=text[i];
   if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else if(quoted||cell==='')quoted=!quoted;else throw Error('Aspas inválidas no CSV.');}
   else if(c===separator&&!quoted){row.push(cell);cell='';}
   else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell='';}
   else cell+=c;
  }
  if(quoted)throw Error('Aspas não fechadas no CSV.');
  if(cell!==''||row.length){row.push(cell);rows.push(row);}
  return rows;
 }
 function cents(v,decimal=','){
  if(typeof v==='number'){if(!Number.isFinite(v)||Math.abs(v*100-Math.round(v*100))>0.00001)throw Error('Valor inválido ou com mais de duas casas decimais.');return Math.round(v*100);}
  let s=String(v??'').trim().replace(/^R\$\s*/i,'').replace(/\s/g,'');if(!s)return null;
  if(/^\(.*\)$/.test(s))s='-'+s.slice(1,-1);
  const group=decimal===','?'.':',';
  const escaped=group==='.'?'\\.':',';
  const re=new RegExp('^[+-]?(?:\\d+|\\d{1,3}(?:'+escaped+'\\d{3})+)(?:'+(decimal===','?',':'\\.')+'\\d{1,2})?$');
  if(!re.test(s))throw Error('Valor inválido: '+v);
  s=s.split(group).join('').replace(decimal,'.');const n=Math.round(Number(s)*100);
  if(!Number.isSafeInteger(n)||Math.abs(n)>9999999999)throw Error('Valor fora do limite.');return n;
 }
 function date(v){
  let s;
  if(v instanceof Date){if(!Number.isFinite(v.getTime()))throw Error('Data inválida.');s=v.toISOString().slice(0,10);}
  else if(typeof v==='number'){if(!Number.isInteger(v)||v<1)throw Error('Data Excel inválida.');s=new Date(Date.UTC(1899,11,30)+v*86400000).toISOString().slice(0,10);}
  else {s=String(v??'').trim();const m=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);if(m)s=m[3]+'-'+m[2]+'-'+m[1];}
  if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||new Date(s+'T00:00:00Z').toISOString().slice(0,10)!==s||s<'2000-01-01'||s>'2100-12-31')throw Error('Data inválida: '+v);
  return s;
 }
 function normalize(rows,map){
  const output=[],errors=[],counts=new Map();
  if(map.date===map.description||map.date<0||map.description<0)throw Error('Selecione colunas distintas para data e descrição.');
  const chosen=[map.date,map.description,...(map.mode==='split'?[map.credit,map.debit]:[map.value])];
  if(chosen.some(x=>x<0)||new Set(chosen).size!==chosen.length)throw Error('Selecione colunas distintas para os campos obrigatórios.');
  for(let i=map.start;i<rows.length;i++){
   const r=rows[i];if(!r.some(v=>v!==null&&v!==undefined&&String(v).trim()!==''))continue;
   try{
    let n;if(map.mode==='split'){const a=cents(r[map.credit],map.decimal),b=cents(r[map.debit],map.decimal);if(a&&b)throw Error('Entrada e saída preenchidas na mesma linha.');if(a!==null&&a<0)throw Error('Entrada negativa.');n=a||-(Math.abs(b||0));}else n=cents(r[map.value],map.decimal);
    if(!n)throw Error('Sem movimentação. Saldo/total deve ficar fora da importação.');
    const d=date(r[map.date]),description=String(r[map.description]??'').trim();if(!description||description.length>300)throw Error('Descrição vazia ou maior que 300 caracteres.');
    const reference=map.reference>=0?String(r[map.reference]??'').trim():'';if(reference.length>150)throw Error('Identificador muito longo.');
    const key=JSON.stringify([d,description,n,reference]);const occurrence=(counts.get(key)||0)+1;counts.set(key,occurrence);
    output.push({linha:i+1,data:d,descricao:description,valor:n/100,referencia:reference,ocorrencia:occurrence,original:r.map(v=>v instanceof Date?v.toISOString():v??null)});
   }catch(e){errors.push({linha:i+1,mensagem:e.message});}
  }
  if(output.length>2000)throw Error('Importe até 2.000 movimentações por arquivo.');
  return {rows:output,errors};
 }
 const api={csv,cents,date,normalize};root.TufraExtratoParser=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
