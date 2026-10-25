"use strict";
(async () => {
  const usuario = new URLSearchParams(location.search).get('usuario');
  // A página de permissões usa o parâmetro id em algumas versões.
  const params = new URLSearchParams(location.search);
  const usuarioId = usuario || params.get('id') || params.get('usuario_id');
  if(!usuarioId || params.get('tipo')!=='ativo') return;
  const secao=document.createElement('section'); secao.className='cartao-app';
  secao.innerHTML=`<h2>Histórico do Desenvolvimento</h2>
    <p>Registre quando a pessoa passou para terça ou sábado. As datas podem ser retroativas. O último período define a função atual.</p>
    <div id="periodosDesenvolvimento"></div>
    <h3>Registrar mudança</h3>
    <div class="grupo-campo"><label for="grupoDesenvolvimento">Novo grupo</label><select id="grupoDesenvolvimento"></select></div>
    <div class="grupo-campo"><label for="inicioDesenvolvimento">Válido a partir de</label><input id="inicioDesenvolvimento" type="date"></div>
    <button type="button" id="registrarPeriodoDesenvolvimento" class="botao-solicitar">Registrar mudança</button>
    <p id="mensagemPeriodoDesenvolvimento" role="status"></p>`;
  document.getElementById('areaSalvarFuncoes').before(secao);
  const lista=secao.querySelector('#periodosDesenvolvimento'), select=secao.querySelector('select'), data=secao.querySelector('#inicioDesenvolvimento'), msg=secao.querySelector('[role=status]');
  const hoje=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo'}).format(new Date());
  data.max=hoje; data.value=hoje;
  for(const [valor,nome] of Object.entries(TufraPeriodos.grupos)){const o=document.createElement('option');o.value=valor;o.textContent=nome;select.append(o);}
  let periodos=[],busy=false;
  async function atualizar(){
    await TufraPeriodos.carregar(true);
    periodos=TufraPeriodos.daPessoa(usuarioId).map(({grupo,data_inicio,data_fim})=>({grupo,data_inicio,data_fim}));
    if(!periodos.length){
      const r=await window.supabaseClient.from('usuarios').select('data_entrada_tufra,usuario_funcoes!usuario_funcoes_usuario_id_fkey(funcoes(nome))').eq('id',usuarioId).maybeSingle();
      if(r.error)throw r.error;
      const nomes=(r.data?.usuario_funcoes||[]).map(x=>x.funcoes?.nome);
      if(nomes.includes('Médium em Desenvolvimento'))periodos=[{grupo:nomes.includes('Banco sábado')?'banco_sabado':nomes.includes('Corrente do Desenvolvimento')?'corrente_terca':'banco_terca',data_inicio:r.data.data_entrada_tufra||hoje,data_fim:null}];
    }
    if(periodos.length) select.value=periodos[periodos.length-1].grupo;
    renderizar();
    const conferencia=await window.supabaseClient.rpc('conferir_presencas_desenvolvimento',{p_usuario_id:usuarioId});
    if(conferencia.error) throw conferencia.error;
    const avisos=conferencia.data||[];
    if(avisos.length){
      const aviso=document.createElement('p');aviso.textContent=avisos.length+' registro(s) fora dos períodos, preservados e excluídos da frequência:';lista.append(aviso);
      for(const item of avisos){const linha=document.createElement('p');linha.textContent=item.data.split('-').reverse().join('/')+' — '+item.lista+' — '+item.status;lista.append(linha);}
    }

  }
  function renderizar(){
    lista.replaceChildren();
    if(!periodos.length){const p=document.createElement('p');p.textContent='Nenhum período registrado. Informe a data inicial de participação no desenvolvimento.';lista.append(p);}
    periodos.forEach((p,i)=>{
      const box=document.createElement('div');box.className='grupo-campo';
      const titulo=document.createElement('strong');titulo.textContent=TufraPeriodos.grupos[p.grupo];
      const texto=document.createElement('p');texto.textContent=`Desde ${p.data_inicio.split('-').reverse().join('/')} ${p.data_fim ? 'até a mudança em '+p.data_fim.split('-').reverse().join('/') : '— atual'}`;
      const label=document.createElement('label');label.textContent='Corrigir início deste período';
      const inicio=document.createElement('input');inicio.type='date';inicio.value=p.data_inicio;inicio.max=hoje;label.append(inicio);
      const grupo=select.cloneNode(true);grupo.removeAttribute('id');grupo.value=p.grupo;grupo.setAttribute('aria-label','Corrigir grupo do período');
      const salvar=document.createElement('button');salvar.type='button';salvar.textContent='Salvar correção';salvar.className='link-administrativo';
      salvar.onclick=()=>{
        const novos=periodos.map(x=>({...x}));novos[i].data_inicio=inicio.value;novos[i].grupo=grupo.value;
        if(i>0)novos[i-1].data_fim=inicio.value;
        enviar(novos);
      };
      box.append(titulo,texto,label,grupo,salvar);lista.append(box);
    });
  }
  async function enviar(novos){
    if(busy)return;busy=true;msg.textContent='Salvando...';
    secao.querySelectorAll('button').forEach(b=>b.disabled=true);
    try{
      const r=await window.supabaseClient.rpc('salvar_periodos_desenvolvimento',{p_usuario_id:usuarioId,p_periodos:novos});
      if(r.error)throw r.error;
      await atualizar();
      // Atualiza as funções marcadas para que um salvamento posterior não desfaça a mudança.
      await carregarFuncoes(usuarioId);
      msg.textContent='Períodos salvos. Função atual e listas de presença atualizadas.';
    }catch(e){msg.textContent=e.message || 'Não foi possível salvar os períodos.';}
    finally{busy=false;secao.querySelectorAll('button').forEach(b=>b.disabled=false);}
  }
  secao.querySelector('#registrarPeriodoDesenvolvimento').onclick=()=>{
    const inicio=data.value;
    if(!inicio || inicio>hoje){msg.textContent='Informe uma data válida até hoje.';return;}
    const novos=periodos.map(p=>({...p}));
    if(!novos.length)novos.push({grupo:select.value,data_inicio:inicio,data_fim:null});
    else{
      const i=novos.findIndex(p=>p.data_inicio<=inicio && (!p.data_fim||inicio<p.data_fim));
      if(i<0){msg.textContent='Para antecipar o primeiro período, use Salvar correção.';return;}
      if(novos[i].data_inicio===inicio)novos[i].grupo=select.value;
      else{const fim=novos[i].data_fim;novos[i].data_fim=inicio;novos.splice(i+1,0,{grupo:select.value,data_inicio:inicio,data_fim:fim});}
    }
    enviar(novos);
  };
  try{await atualizar();}catch(e){msg.textContent='Não foi possível carregar os períodos: '+e.message;}
})();
