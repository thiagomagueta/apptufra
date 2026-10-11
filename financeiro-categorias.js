"use strict";
(()=>{
 const el=id=>document.getElementById(id),db=window.supabaseClient;
 let editando=null,salvando=false;
 function msg(t){el('mensagemCategorias').textContent=t;}
 function limpar(){editando=null;el('formCategoria').reset();el('tipoCategoria').disabled=false;el('tituloFormulario').textContent='Nova categoria';el('cancelarCategoria').hidden=true;}
 async function carregar(){
  const r=await db.from('financeiro_categorias').select('id,tipo,nome,ativo,atualizado_em').order('nome');
  if(r.error)throw r.error;
  el('receitasCategorias').replaceChildren();el('despesasCategorias').replaceChildren();
  for(const c of r.data){
   const row=document.createElement('div');row.className='categoria';
   const label=document.createElement('span');label.textContent=c.nome+(c.ativo?'':' — Inativa');
   const button=document.createElement('button');button.type='button';button.className='botao-categoria';button.textContent='Editar';button.setAttribute('aria-label','Editar '+c.nome);
   button.onclick=()=>{if(salvando)return;editando=c;el('tipoCategoria').value=c.tipo;el('tipoCategoria').disabled=true;el('nomeCategoria').value=c.nome;el('ativaCategoria').checked=c.ativo;el('tituloFormulario').textContent='Editar categoria';el('cancelarCategoria').hidden=false;el('nomeCategoria').focus();};
   row.append(label,button);el(c.tipo==='receita'?'receitasCategorias':'despesasCategorias').append(row);
  }
 }
 el('cancelarCategoria').onclick=()=>{if(!salvando)limpar();};
 el('formCategoria').onsubmit=async e=>{
  e.preventDefault();if(salvando)return;
  const nome=el('nomeCategoria').value.trim();if(!nome){msg('Informe o nome.');return;}
  salvando=true;el('salvarCategoria').disabled=true;el('cancelarCategoria').disabled=true;
  try{
   const r=await db.rpc('financeiro_categoria_salvar',{p_id:editando?.id??null,p_tipo:el('tipoCategoria').value,p_nome:nome,p_ativo:el('ativaCategoria').checked,p_versao:editando?.atualizado_em??null});
   if(r.error)throw r.error;limpar();
   try{await carregar();msg('Categoria salva.');}catch(e){msg('Categoria salva. Recarregue a página para atualizar a lista.');}
  }catch(e){msg(e.message||'Não foi possível salvar.');}
  finally{salvando=false;el('salvarCategoria').disabled=false;el('cancelarCategoria').disabled=false;}
 };
 (async()=>{try{if(!db)throw Error('Não foi possível iniciar.');const r=await db.rpc('financeiro_pode_negociar');if(r.error)throw r.error;if(r.data!==true){msg('Acesso não autorizado.');return;}await carregar();el('conteudoCategorias').hidden=false;msg('');}catch(e){msg(e.message||'Não foi possível carregar as categorias.');}})();
})();