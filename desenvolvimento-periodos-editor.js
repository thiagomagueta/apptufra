"use strict";
// A mudança acontece na lista de funções; neste resumo só se corrigem datas.
window.montarHistoricoPeriodosResumo = async function(usuarioId,podeEditar) {
  const anterior=document.getElementById('historicoPeriodosMediunicos');if(anterior)anterior.remove();
  const periodos=TufraPeriodos.daPessoa(usuarioId).map(({grupo,data_inicio,data_fim})=>({grupo,data_inicio,data_fim}));
  if(!periodos.length)return;
  const secao=document.createElement('section');secao.id='historicoPeriodosMediunicos';secao.className='cartao-app';
  const h=document.createElement('h2');h.textContent='Histórico das mudanças de função';secao.append(h);
  const orientacao=document.createElement('p');orientacao.textContent='As mudanças são registradas ao salvar as funções na Gestão APP. Aqui você pode conferir e corrigir as datas.';secao.append(orientacao);
  const msg=document.createElement('p');msg.setAttribute('role','status');
  const hoje=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo'}).format(new Date());
  periodos.forEach((p,i)=>{
    const box=document.createElement('div');box.className='grupo-campo';
    const titulo=document.createElement('strong');titulo.textContent=TufraPeriodos.grupos[p.grupo];
    const texto=document.createElement('p');texto.textContent='Desde '+p.data_inicio.split('-').reverse().join('/')+(p.data_fim?' — próxima mudança em '+p.data_fim.split('-').reverse().join('/'):' — atual');
    box.append(titulo,texto);
    if(podeEditar){
      const label=document.createElement('label');label.textContent='Data de início';
      const inicio=document.createElement('input');inicio.type='date';inicio.value=p.data_inicio;inicio.max=hoje;label.append(inicio);
      const salvar=document.createElement('button');salvar.type='button';salvar.className='link-administrativo';salvar.textContent='Salvar correção da data';
      salvar.onclick=async()=>{
        if(!inicio.value||inicio.value>hoje){msg.textContent='Informe uma data válida até hoje.';return;}
        const novos=periodos.map(x=>({...x}));novos[i].data_inicio=inicio.value;if(i>0)novos[i-1].data_fim=inicio.value;
        secao.querySelectorAll('button').forEach(b=>b.disabled=true);msg.textContent='Salvando...';
        try{
          const r=await window.supabaseClient.rpc('salvar_periodos_desenvolvimento',{p_usuario_id:usuarioId,p_periodos:novos});if(r.error)throw r.error;
          location.reload();
        }catch(e){msg.textContent=e.message||'Não foi possível corrigir a data.';secao.querySelectorAll('button').forEach(b=>b.disabled=false);}
      };
      box.append(label,salvar);
    }
    secao.append(box);
  });
  secao.append(msg);document.getElementById('areaResumoPresencaAssociado').before(secao);
};
