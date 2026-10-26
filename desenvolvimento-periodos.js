"use strict";
// Única regra para chamadas, consultas, relatórios e resumo pessoal.
window.TufraPeriodos = (() => {
  let periodos = [], carregamento;
  const grupos = {banco_terca:'Banco do Desenvolvimento',corrente_terca:'Corrente do Desenvolvimento',banco_sabado:'Banco sábado',principal:'Médium Corrente Principal',fora:'Fora das correntes mediúnicas'};
  const gerenciada = nome => ['Desenvolvimento','Banco sábado','Corrente Principal'].includes(nome);
  async function carregar(recarregar=false) {
    if (!carregamento || recarregar) carregamento = (async () => {
      const registros=[];
      for(let inicio=0;;inicio+=500){
        const r = await window.supabaseClient.from('desenvolvimento_periodos').select('usuario_id,grupo,data_inicio,data_fim').order('usuario_id').order('data_inicio').range(inicio,inicio+499);
        if(r.error) throw r.error;
        registros.push(...(r.data||[]));
        if((r.data||[]).length<500) break;
      }
      periodos = registros;
      return periodos;
    })();
    return carregamento;
  }
  const daPessoa = id => periodos.filter(p=>p.usuario_id===id);
  function participa(id,nome,data) {
    if(!gerenciada(nome)) return null;
    const ps=daPessoa(id);
    if(!ps.length) return nome==='Banco sábado' ? false : null;
    return ps.some(p=>(!data || (p.data_inicio<=data && (!p.data_fim || data<p.data_fim))) &&
      (nome==='Banco sábado' ? p.grupo==='banco_sabado' : nome==='Corrente Principal' ? p.grupo==='principal' : ['banco_terca','corrente_terca'].includes(p.grupo)));
  }
  function listas(id,atuais) {
    if(!daPessoa(id).length) return atuais;
    return [...new Set([...atuais.filter(n=>!gerenciada(n)),...['Desenvolvimento','Banco sábado','Corrente Principal'].filter(n=>participa(id,n,null))])];
  }
  function filtrar(id,nome,atividades) {
    return atividades.filter(a=>participa(id,nome,a.data)!==false);
  }
  function associadoNaData(u,data) {
    return (!u.data_entrada_tufra || u.data_entrada_tufra<=data) &&
      (!u.data_saida_tufra || data<u.data_saida_tufra) &&
      !(u.baixas||[]).some(b=>b.data_saida<=data && (!b.data_retorno || data<b.data_retorno));
  }
  return {associadoNaData,carregar,daPessoa,participa,listas,filtrar,gerenciada,grupos};
})();
