"use strict";

const TufraAtividadesPorAno = {
  async buscar(colunas, tipoAtividade = null) {
    const atividades = [];
    const tamanhoPagina = 500;

    for (let inicio = 0; ; inicio += tamanhoPagina) {
      let consulta = window.supabaseClient
        .from("atividades")
        .select(colunas)
        .not("data", "is", null);

      if (tipoAtividade !== null) consulta = consulta.eq("tipo_atividade", tipoAtividade);

      const { data, error } = await consulta
        .order("data")
        .order("hora_inicio")
        .order("id")
        .range(inicio, inicio + tamanhoPagina - 1);

      if (error) throw error;
      atividades.push(...data);
      if (data.length < tamanhoPagina) return atividades;
    }
  },

  async montar(filtro, atividades, exibir, agora = new Date()) {
    const seletor = filtro.querySelector("select");
    const anoVigente = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      year: "numeric"
    }).format(agora);
    const anos = new Set([anoVigente]);

    for (const atividade of atividades) anos.add(atividade.data.slice(0, 4));

    seletor.replaceChildren(...[...anos].sort().reverse().map(ano => new Option(ano, ano)));
    seletor.value = anoVigente;

    async function trocarAno() {
      seletor.disabled = true;
      try {
        await exibir(seletor.value);
      } finally {
        seletor.disabled = false;
      }
    }

    seletor.onchange = trocarAno;
    filtro.hidden = false;
    await trocarAno();
  },

  filtrar(atividades, ano) {
    return atividades.filter(atividade => atividade.data.startsWith(ano + "-"));
  }
};
