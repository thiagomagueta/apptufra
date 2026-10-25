"use strict";
// As alterações de função e suas datas integram os dados administrativos.
window.montarHistoricoPeriodosResumo = async function(usuarioId,podeEditar) {
  document.getElementById('historicoPeriodosMediunicos')?.remove();
  const ps=TufraPeriodos.daPessoa(usuarioId);
  const visual=document.getElementById('visualizacaoDatasAdministrativas');
  const edicao=document.getElementById('edicaoDatasAdministrativas');
  for(const id of ['funcoesDatasVisualizacao','funcoesDatasEdicao'])document.getElementById(id)?.remove();
  const v=document.createElement('div');v.id='funcoesDatasVisualizacao';
  const e=document.createElement('div');e.id='funcoesDatasEdicao';
  ps.forEach((p,i)=>{
    const nome=TufraPeriodos.grupos[p.grupo];
    const titulo=i===0?'Início como '+nome:'Alteração de função: '+TufraPeriodos.grupos[ps[i-1].grupo]+' → '+nome;
    const linha=document.createElement('div');linha.className='item-resumo-associado';
    const label=document.createElement('span');label.textContent=titulo;
    const data=document.createElement('strong');data.textContent=p.data_inicio.split('-').reverse().join('/');linha.append(label,data);v.append(linha);
    if(podeEditar){
      const campo=document.createElement('div');campo.className='campo-data-administrativa';
      const texto=document.createElement('label');texto.textContent=titulo;texto.htmlFor='dataMudancaFuncao'+i;
      const input=document.createElement('input');input.id=texto.htmlFor;input.type='text';input.inputMode='numeric';input.maxLength=10;input.placeholder='dd/mm/aaaa';input.autocomplete='off';input.value=data.textContent;input.dataset.periodoIndice=i;input.addEventListener('input',()=>aplicarMascaraData(input));
      campo.append(texto,input);e.append(campo);
    }
  });
  visual.append(v);edicao.insertBefore(e,document.getElementById('areaEdicaoHistoricoFuncoes'));
};
window.obterPeriodosDadosAdministrativos=function(usuarioId){
  const ps=TufraPeriodos.daPessoa(usuarioId).map(({grupo,data_inicio,data_fim})=>({grupo,data_inicio,data_fim}));
  for(let i=0;i<ps.length;i++){
    const campo=document.getElementById('dataMudancaFuncao'+i);
    if(!campo)continue;
    const data=converterDataParaISO(campo.value);
    if(!data)throw Error('Informe uma data válida para a alteração de função.');
    ps[i].data_inicio=data;
    if(i>0)ps[i-1].data_fim=data;
  }
  return ps;
};
