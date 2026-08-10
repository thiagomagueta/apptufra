"use strict";

const listaAtividadesExcluir =
  document.getElementById(
    "listaAtividadesExcluir"
  );

const mensagemSemAtividadesExcluir =
  document.getElementById(
    "mensagemSemAtividadesExcluir"
  );


function criarDataLocal(dataISO) {
  const [ano, mes, dia] =
    dataISO
      .split("-")
      .map(Number);

  return new Date(
    ano,
    mes - 1,
    dia
  );
}


function formatarData(dataISO) {
  const data =
    criarDataLocal(dataISO);

  return new Intl.DateTimeFormat(
    "pt-BR"
  ).format(data);
}


function removerSegundos(horario) {
  if (!horario) {
    return "";
  }

  return horario.slice(0, 5);
}


function formatarTipoAtividade(
  atividade
) {
  if (
    atividade.tipo_atividade ===
    "outros"
  ) {
    return (
      atividade.tipo_outro ||
      "Outros"
    );
  }

  const tipos = {
    gira_principal:
      "Gira Principal",

    gira_desenvolvimento:
      "Gira de Desenvolvimento",

    aula:
      "Aula",

    trabalho_cura:
      "Trabalho de Cura",

    eventos:
      "Eventos",

    obrigacoes:
      "Obrigações"
  };

  return (
    tipos[
      atividade.tipo_atividade
    ] || "Atividade"
  );
}


function criarItemAtividade(
  atividade
) {
  const link =
    document.createElement("a");

  link.className =
    "item-editar-atividade";

  link.href =
    `excluir-atividade-confirmar.html?id=${atividade.id}`;


  const dados =
    document.createElement("div");

  dados.className =
    "dados-editar-atividade";


  const tipo =
    document.createElement("strong");

  tipo.textContent =
    formatarTipoAtividade(
      atividade
    );


  const titulo =
    document.createElement("span");

  titulo.className =
    "titulo-editar-atividade";

  titulo.textContent =
    atividade.titulo;


  const dataHorario =
    document.createElement("span");

  const inicio =
    removerSegundos(
      atividade.hora_inicio
    );

  dataHorario.textContent =
    `${formatarData(
      atividade.data
    )}` +
    (
      inicio
        ? ` • ${inicio}`
        : ""
    );


  dados.appendChild(
    tipo
  );

  dados.appendChild(
    titulo
  );

  dados.appendChild(
    dataHorario
  );


  const seta =
    document.createElement("span");

  seta.className =
    "seta-permissao-lista";

  seta.textContent =
    "›";


  link.appendChild(
    dados
  );

  link.appendChild(
    seta
  );


  return link;
}


async function carregarAtividades() {
  if (!window.supabaseClient) {
    return;
  }

  try {

    const resultado =
      await window.supabaseClient
        .from("atividades")
        .select(`
          id,
          titulo,
          data,
          hora_inicio,
          tipo_atividade,
          tipo_outro
        `)
        .order(
          "data",
          {
            ascending: true
          }
        )
        .order(
          "hora_inicio",
          {
            ascending: true
          }
        );


    if (resultado.error) {
      throw resultado.error;
    }


    const atividades =
      resultado.data || [];


    listaAtividadesExcluir.innerHTML =
      "";


    mensagemSemAtividadesExcluir.hidden =
      atividades.length > 0;


    atividades.forEach(
      (atividade) => {

        listaAtividadesExcluir.appendChild(
          criarItemAtividade(
            atividade
          )
        );

      }
    );

  } catch (erro) {

    console.error(
      "Erro ao carregar atividades:",
      erro
    );

    listaAtividadesExcluir.innerHTML =
      "<p>Não foi possível carregar as atividades.</p>";
  }
}


carregarAtividades();
