"use strict";
(() => {
 const $ = id => document.getElementById(id);
 let base={previos:[],pendentes:[],funcoes:[]}, acesso={}, atual=null, conta=null, responsaveis=[];
 const normalizar = v => String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();
 const numeros = v => String(v||'').replace(/\D/g,'');
 const mensagem = texto => { $('mensagemCadastro').textContent=texto; };
 async function rpc(acao,dados={}) { const r=await window.supabaseClient.rpc('cadastro_administrativo',{p_acao:acao,p_dados:dados});if(r.error)throw r.error;return r.data; }
 const secoes = [
 ['administrativo','Identificação e datas',[
 ['nome_completo','Nome completo','text',true],['cpf','CPF','text'],['email','E-mail','email'],['telefone','Celular com DDD','tel'],['data_entrada_tufra','Entrada no TUFRA','date'],['data_corrente_desenvolvimento','Ingresso no Desenvolvimento','date'],['data_corrente_principal','Ingresso na Corrente Principal','date']]],
 ['dados_pessoais','Dados pessoais',[
 ['nascimento','Data de nascimento','date'],['idade','Idade','number'],['cidadeNascimento','Cidade de nascimento'],['estadoNascimento','Estado de nascimento'],['genero','Gênero',['Feminino','Masculino','Outro / Autodeclarado']],['generoAutodeclarado','Gênero autodeclarado'],['nacionalidade','Nacionalidade'],['rg','RG']]],
 ['endereco_contato','Endereço e contato',[
 ['cep','CEP'],['endereco','Endereço'],['numero','Número'],['complemento','Complemento'],['bairro','Bairro'],['cidade','Cidade'],['estado','Estado'],['telefoneFixo','Telefone fixo','tel']]],
 ['historico_umbanda','Histórico na Umbanda',[
 ['tempoUmbanda','Tempo na Umbanda'],['participouOutrosTerreiros','Participou de outros terreiros?',['Sim','Não']],['quantidadeTerreiros','Quantidade de terreiros','number'],['religiaoBatismo','Religião de batismo'],['comoChegouUmbanda','Como chegou à Umbanda','textarea'],['batizadoUmbanda','Batizado na Umbanda?',['Sim','Não']],['terreiroBatismo','Terreiro do batismo'],['dataBatismo','Data do batismo','date'],['cidadeBatismo','Cidade do batismo'],['estadoBatismo','Estado do batismo'],['orixaFrente','Orixá de frente'],['orixaAdjunto','Orixá adjunto'],['melhorDiaPagamento','Melhor dia para pagamento','number']]]
 ];
 function montarFicha() {
  for(const [secao,titulo,campos] of secoes) {
   const bloco=document.createElement(secao==='administrativo'?'div':'details'); if(secao!=='administrativo')bloco.open=true;
   const heading=document.createElement(secao==='administrativo'?'h3':'summary'); heading.textContent=titulo;bloco.append(heading);
   const grid=document.createElement('div');grid.className='cadastro-campos';
   for(const [chave,label,tipo='text',required=false] of campos) {
    const rotulo=document.createElement('label');rotulo.textContent=label+(required?' *':'');
    const campo=document.createElement(Array.isArray(tipo)?'select':tipo==='textarea'?'textarea':'input');campo.id=`cad-${secao}-${chave}`;campo.dataset.secao=secao;campo.dataset.chave=chave;campo.required=required;
    if(Array.isArray(tipo)) { for(const op of ['',...tipo]){const opt=document.createElement('option');opt.value=op;opt.textContent=op||'Não informado';campo.append(opt);} } else if(tipo!=='textarea')campo.type=tipo;
    if(chave==='idade'){campo.readOnly=true;campo.min='0';}if(chave==='melhorDiaPagamento'){campo.min='1';campo.max='31';}if(chave==='quantidadeTerreiros')campo.min='0';if(chave==='cpf'){campo.inputMode='numeric';campo.maxLength=14;}
    rotulo.append(campo);grid.append(rotulo);
   }bloco.append(grid);$('camposFicha').append(bloco);
  }
  $('cad-dados_pessoais-nascimento').addEventListener('input',()=>{const s=$('cad-dados_pessoais-nascimento').value;if(!s){$('cad-dados_pessoais-idade').value='';return;}const d=new Date(`${s}T12:00:00`),h=new Date();let n=h.getFullYear()-d.getFullYear();if(h.getMonth()<d.getMonth()||(h.getMonth()===d.getMonth()&&h.getDate()<d.getDate()))n--;$('cad-dados_pessoais-idade').value=n>=0?n:'';});
 }
 function painel(nome){for(const n of ['Lista','Ficha','Vinculos','Responsaveis'])$('painel'+n).hidden=n!==nome;mensagem('');}
 function dataInput(s){if(!s)return '';if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s;const m=s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);return m?`${m[3]}-${m[2]}-${m[1]}`:'';}
 function dataBR(s){return s?s.split('-').reverse().join('/'):'';}
 function editar(u=null){atual=u;$('formCadastro').reset();$('tituloFicha').textContent=u?'Editar associado sem conta':'Cadastrar associado';for(const [secao,,campos] of secoes)for(const [chave,,tipo] of campos){const campo=$(`cad-${secao}-${chave}`);let valor=secao==='administrativo'?(chave==='cpf'?u?.cpf_previo:u?.[chave]):u?.ficha?.[secao]?.[chave];campo.value=tipo==='date'?dataInput(valor||''):valor??'';}
  $('funcoesCadastro').replaceChildren();for(const f of base.funcoes){const l=document.createElement('label'),c=document.createElement('input');c.type='checkbox';c.value=f.id;c.checked=u?.funcoes?.includes(f.id)||false;c.disabled=!f.ativo;l.append(c,document.createTextNode(f.nome+(f.ativo?'':' (desativada)')));$('funcoesCadastro').append(l);}painel('Ficha');$('cad-administrativo-nome_completo').focus();
 }
 function linha(nome,detalhe){const d=document.createElement('div');d.className='cadastro-item';const info=document.createElement('div'),strong=document.createElement('strong'),small=document.createElement('small');strong.textContent=nome;small.textContent=detalhe;small.className='cadastro-status';info.append(strong,small);d.append(info);return d;}
 function botao(texto,acao){const b=document.createElement('button');b.type='button';b.textContent=texto;b.addEventListener('click',acao);return b;}
 function bate(u,busca){return normalizar([u.nome_completo,u.email,u.telefone,u.cpf_previo].join(' ')).includes(normalizar(busca))||(numeros(busca).length>=3&&numeros([u.cpf_previo,u.telefone].join(' ')).includes(numeros(busca)));}
 function listarPrevios(){const lista=$('listaPrevios');lista.replaceChildren();const us=base.previos.filter(u=>bate(u,$('buscarCadastro').value));if(!us.length){lista.textContent='Nenhum associado sem conta encontrado.';return;}for(const u of us){const d=linha(u.nome_completo,`Sem conta de acesso${u.data_entrada_tufra?' · Entrada: '+dataBR(u.data_entrada_tufra):' · Data de entrada não informada'}`);d.append(botao('Editar ficha',()=>editar(u)),botao('Excluir cadastro',async()=>{
 if(!confirm(`Excluir o cadastro administrativo de ${u.nome_completo}?\n\nA exclusão só será permitida se ainda não houver conta de acesso, histórico ou outros vínculos.`))return;
 const botoes=[...d.querySelectorAll('button')];botoes.forEach(b=>b.disabled=true);
 try{const r=await window.supabaseClient.rpc('excluir_cadastro_previo',{p_usuario_id:u.id});if(r.error)throw r.error;await carregar();mensagem('Cadastro administrativo excluído.');}
 catch(e){mensagem(e.message||'Não foi possível excluir o cadastro.');botoes.forEach(b=>b.disabled=false);}
 }));lista.append(d);}}
 function coincidencias(u,c){const a=[];if(u.cpf_previo&&numeros(u.cpf_previo)===numeros(c.cpf))a.push('CPF igual');if(u.email&&normalizar(u.email)===normalizar(c.email))a.push('E-mail igual');if(u.telefone&&numeros(u.telefone)===numeros(c.telefone))a.push('Telefone igual');const tokens=normalizar(c.nome_completo).split(/\s+/).filter(x=>x.length>2);if(tokens.some(t=>normalizar(u.nome_completo).includes(t)))a.push('Nome semelhante');return a;}
 function listarVinculos(){const lista=$('listaVinculos');lista.replaceChildren();if(!conta)return;const busca=$('buscarVinculo').value;let candidatos=base.previos.filter(u=>!busca||bate(u,busca)).map(u=>({u,m:coincidencias(u,conta)})).sort((a,b)=>b.m.length-a.m.length);if(!busca)candidatos=candidatos.filter(x=>x.m.length);if(!candidatos.length){lista.textContent='Sem correspondência sugerida. Busque pelo nome do cadastro administrativo.';return;}for(const {u,m} of candidatos){const d=linha(u.nome_completo,[m.join(' · '),u.cpf_previo?'CPF: '+u.cpf_previo:'CPF não informado',u.email,u.telefone].filter(Boolean).join(' | '));d.append(botao('Vincular esta pessoa',async()=>{
  const aviso=u.cpf_previo&&numeros(u.cpf_previo)!==numeros(conta.cpf)?'\nATENÇÃO: os CPFs são diferentes. Confira a identidade e corrija o cadastro se necessário.':'';
  if(!confirm(`Vincular a conta de ${conta.nome_completo} (${conta.email}, CPF ${conta.cpf||'não informado'}) ao associado ${u.nome_completo}?${aviso}\n\nO histórico e as datas serão preservados. Esta ação aprova o vínculo de acesso.`))return;
  const id=conta.id;try{d.querySelector('button').disabled=true;await rpc('vincular',{associado_id:u.id,conta_id:id});conta=null;$('selecaoVinculo').hidden=true;await carregar();mensagem('Conta vinculada. A pessoa poderá entrar e completar a ficha.');}catch(e){mensagem(e.message||'Não foi possível vincular.');d.querySelector('button').disabled=false;}
 }));lista.append(d);}}
 function listarContas(){const lista=$('listaContas');lista.replaceChildren();if(!base.pendentes.length){lista.textContent='Nenhuma conta aguardando aprovação.';return;}for(const c of base.pendentes){const d=linha(c.nome_completo,`${c.email} · ${c.email_confirmado?'E-mail confirmado':'Aguardando confirmação do e-mail'}`);const b=botao('Escolher cadastro existente',()=>{conta=c;$('tituloVinculo').textContent=`Conta: ${c.nome_completo} · ${c.email}`;$('buscarVinculo').value='';$('selecaoVinculo').hidden=false;listarVinculos();});b.disabled=!c.email_confirmado;d.append(b);lista.append(d);}}
 function listarResponsaveis(){const lista=$('listaResponsaveis');lista.replaceChildren();for(const u of responsaveis.filter(u=>normalizar(u.nome_completo).includes(normalizar($('buscarResponsavel').value)))){const d=linha(u.nome_completo,u.gestor?'Gestor de permissões — acesso já incluído':u.autorizado?'Autorizado a cadastrar':'Sem autorização');if(!u.gestor)d.append(botao(u.autorizado?'Retirar autorização':'Autorizar',async()=>{try{d.querySelector('button').disabled=true;responsaveis=await rpc('autorizar',{usuario_id:u.id,autorizado:!u.autorizado});listarResponsaveis();mensagem('Autorização atualizada.');}catch(e){mensagem(e.message);d.querySelector('button').disabled=false;}}));lista.append(d);}}
 async function carregar(){base=await rpc('listar');listarPrevios();listarContas();}
 $('formCadastro').addEventListener('submit',async e=>{e.preventDefault();const dados={id:atual?.id||null,ficha:{dados_pessoais:{},endereco_contato:{},historico_umbanda:{}},funcoes:[...$('funcoesCadastro').querySelectorAll('input:checked')].map(c=>c.value)};for(const [secao,,campos]of secoes)for(const [chave,,tipo]of campos){const valor=$(`cad-${secao}-${chave}`).value.trim();if(secao==='administrativo')dados[chave]=valor;else dados.ficha[secao][chave]=tipo==='date'?dataBR(valor):tipo==='number'?(valor===''?null:Number(valor)):valor;}
  if(dados.cpf&&numeros(dados.cpf).length!==11){mensagem('Informe um CPF com 11 números ou deixe vazio.');return;}
  $('salvarCadastro').disabled=true;try{await rpc('salvar',dados);await carregar();painel('Lista');mensagem('Associado salvo, sem conta de acesso. Já pode receber registros financeiros e de presença conforme suas funções e datas.');atual=null;}catch(err){mensagem(err.message||'Não foi possível salvar.');}finally{$('salvarCadastro').disabled=false;}
 });
 $('novoCadastro').onclick=()=>editar();$('verPrevios').onclick=()=>painel('Lista');$('verResponsaveis').onclick=async()=>{try{responsaveis=await rpc('responsaveis');listarResponsaveis();painel('Responsaveis');}catch(e){mensagem(e.message);}};
 $('buscarCadastro').oninput=listarPrevios;$('buscarVinculo').oninput=listarVinculos;$('buscarResponsavel').oninput=listarResponsaveis;
 (async()=>{try{acesso=await rpc('acesso');if(!acesso.cadastrar){mensagem('Você não tem autorização para cadastrar associados.');return;}montarFicha();await carregar();$('conteudoCadastro').hidden=false;$('verResponsaveis').hidden=!acesso.gerenciar;const modo=new URLSearchParams(location.search).get('modo');if(modo==='novo')editar();else if(modo==='responsaveis')$('verResponsaveis').click();else mensagem('');}catch(e){mensagem(e.message||'Não foi possível carregar o cadastro administrativo.');}})();
})();
