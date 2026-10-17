"use strict";
(() => {
 const normalizar = v => String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("pt-BR").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
 const numeros = v => String(v||"").replace(/\D/g,"");
 const params = new URLSearchParams(location.search);
 if(params.get("tipo")!=="pendente") return;
 const id=params.get("id");
 let revisao=null, candidatos=[], liberado=false, carregando=null;
 const area=document.getElementById("areaAprovacaoCadastro");
 const botao=document.getElementById("botaoAprovarCadastro");
 if(!area||!botao||!id)return;
 const painel=document.createElement("div");
 painel.id="verificacaoCadastroExistente";
 painel.style.cssText="padding:16px;margin:12px 0;border:1px solid #d7cccc;border-radius:10px";
 const titulo=document.createElement("h3");titulo.textContent="Verificação de cadastro existente";
 const estado=document.createElement("p");estado.setAttribute("role","status");
 const lista=document.createElement("div");
 painel.append(titulo,estado,lista);
 area.insertBefore(painel,area.firstChild);
 const rpc=async(acao,dados={})=>{const r=await window.supabaseClient.rpc("cadastro_administrativo",{p_acao:acao,p_dados:dados});if(r.error)throw r.error;return r.data;};
 const comparar=(u,c)=>{
  const a=normalizar(u.nome_completo),b=normalizar(c.nome_completo);
  const ta=a.split(" ").filter(x=>x.length>2),tb=b.split(" ").filter(x=>x.length>2);
  const comuns=ta.filter(x=>tb.includes(x)).length;
  const motivos=[];
  if(numeros(u.cpf_previo).length===11&&numeros(u.cpf_previo)===numeros(c.cpf))motivos.push("CPF igual");
  if(u.email&&c.email&&normalizar(u.email)===normalizar(c.email))motivos.push("E-mail igual");
  if(numeros(u.telefone).length>=10&&numeros(u.telefone)===numeros(c.telefone))motivos.push("Telefone igual");
  if(a&&b&&(a===b||(comuns>=2&&comuns>=Math.min(ta.length,tb.length)-1)))motivos.push("Nome semelhante");
  return motivos;
 };
 function desenhar(){
  lista.replaceChildren();
  if(!candidatos.length){estado.textContent="Nenhum cadastro administrativo semelhante encontrado. Aprovação normal disponível.";liberado=true;botao.disabled=false;return;}
  estado.textContent="Possível cadastro existente. Confira antes de aprovar; nenhuma vinculação é automática.";
  for(const c of candidatos){
   const linha=document.createElement("div");linha.style.cssText="padding:12px 0;border-bottom:1px solid #ddd";
   const nome=document.createElement("strong");nome.textContent=c.nome_completo;
   const motivo=document.createElement("p");motivo.textContent=c.motivos.join(" · ");
   const vincular=document.createElement("button");vincular.type="button";vincular.textContent="Vincular a este cadastro";vincular.style.cssText="padding:10px;margin:6px 0";
   vincular.onclick=async()=>{
    if(!confirm("Vincular a conta solicitante ao cadastro de "+c.nome_completo+"? A ficha e o histórico administrativos serão preservados."))return;
    vincular.disabled=true;botao.disabled=true;
    try{await rpc("vincular",{associado_id:c.id,conta_id:id});alert("Conta vinculada ao cadastro existente.");location.href="permissoes.html?secao=pendentes";}
    catch(e){alert("Não foi possível vincular: "+(e.message||e));vincular.disabled=false;botao.disabled=false;}
   };
   linha.append(nome,motivo,vincular);lista.append(linha);
  }
  const ignorar=document.createElement("button");ignorar.type="button";ignorar.textContent="Não é a mesma pessoa — continuar aprovação normal";ignorar.style.cssText="padding:10px;margin-top:14px";
  ignorar.onclick=()=>{if(confirm("Confirma que esta solicitação não pertence a nenhum dos cadastros sugeridos?")){liberado=true;estado.textContent="Conferência realizada. Aprovação normal liberada.";botao.disabled=false;}};
  lista.append(ignorar);botao.disabled=true;
 }
 async function verificar(){
  liberado=false;botao.disabled=true;estado.textContent="Conferindo cadastros existentes...";
  const r=await window.supabaseClient.from("usuarios").select("id,nome_completo,cpf,email,telefone,status").eq("id",id).maybeSingle();
  if(r.error||!r.data)throw r.error||new Error("Solicitação não encontrada.");
  if(r.data.status!=="aguardando_aprovacao")throw new Error("Esta solicitação não está mais pendente.");
  const base=await rpc("listar");
  candidatos=(base.previos||[]).map(u=>({...u,motivos:comparar(u,r.data)})).filter(u=>u.motivos.length).sort((a,b)=>b.motivos.length-a.motivos.length);
  desenhar();
 }
 async function iniciar(){
  try{await verificar();}catch(e){liberado=false;botao.disabled=true;estado.textContent="Não foi possível conferir possíveis duplicidades: "+(e.message||e)+". A aprovação ficará bloqueada até nova tentativa.";lista.replaceChildren();const retry=document.createElement("button");retry.textContent="Tentar novamente";retry.onclick=()=>{carregando=iniciar();};lista.append(retry);}
 }
 window.validarDuplicidadeAntesDeAprovar=async()=>{
  if(carregando)await carregando;
  if(!liberado){alert("Confira primeiro os possíveis cadastros existentes.");return false;}
  const anteriores=candidatos.map(c=>c.id).sort().join(',');
  try { await verificar(); } catch(e) { liberado=false;botao.disabled=true;estado.textContent='Falha na reconferência: '+(e.message||e);return false; }
  const atuais=candidatos.map(c=>c.id).sort().join(',');
  if(anteriores!==atuais){alert('Os possíveis cadastros existentes mudaram. Revise novamente antes de aprovar.');return false;}
  liberado=true;botao.disabled=false;
  return true;
 };
 carregando=iniciar();
})();
