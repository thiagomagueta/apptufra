"use strict";

/* ==========================================
   ELEMENTOS
========================================== */

const arquivoExcel =
  document.getElementById(
    "arquivoExcel"
  );

const dadosArquivoExcel =
  document.getElementById(
    "dadosArquivoExcel"
  );

const nomeArquivoExcel =
  document.getElementById(
    "nomeArquivoExcel"
  );

const resumoArquivoExcel =
  document.getElementById(
    "resumoArquivoExcel"
  );

const mensagemImportarExcel =
  document.getElementById(
    "mensagemImportarExcel"
  );

const areaPreviaExcel =
  document.getElementById(
    "areaPreviaExcel"
  );

const listaPreviaExcel =
  document.getElementById(
    "listaPreviaExcel"
  );

const areaConfirmarImportacao =
  document.getElementById(
    "areaConfirmarImportacao"
  );

const botaoImportarExcel =
  document.getElementById(
    "botaoImportarExcel"
  );


/* ==========================================
   DADOS DA IMPORTAÇÃO
========================================== */

let atividadesValidas = [];
let atividadesComErro = [];


/* ==========================================
   TIPOS ACEITOS
========================================== */

const tiposAtividade = {
  "gira principal":
    "gira_principal",

  "gira de desenvolvimento":
    "gira_desenvolvimento",

  "aula":
    "aula",

  "trabalho de cura":
    "trabalho_cura",

  "eventos":
    "eventos",

  "obrigações":
    "obrigacoes",

  "obrigacoes":
    "obrigacoes",

  "outros":
    "outros"
};


/* ==========================================
   MENSAGENS
========================================== */

function mostrarMensagem(
  texto
) {
  mensagemImportarExcel.textContent =
    texto;

  mensagemImportarExcel.hidden =
    false;
}


function esconderMensagem() {
  mensagemImportarExcel.textContent =
    "";

  mensagemImportarExcel.hidden =
    true;
}


/* ==========================================
   NORMALIZAÇÃO
========================================== */

function normalizarTexto(
  valor
) {
  return String(
    valor ?? ""
  )
    .trim()
    .replace(/\s+/g, " ");
}


function normalizarCabecalho(
  texto
) {
  return normalizarTexto(
    texto
  )
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    );
}


/* ==========================================
   DATA
========================================== */

function formatarNumeroData(
  numero
) {
  const partes =
    XLSX.SSF.parse_date_code(
      numero
    );

  if (!partes) {
    return null;
  }

  const ano =
    String(partes.y);

  const mes =
    String(partes.m)
      .padStart(2, "0");

  const dia =
    String(partes.d)
      .padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}


function formatarDataExcel(
  valor
) {
  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {
    return null;
  }

  if (
    typeof valor === "number"
  ) {
    return formatarNumeroData(
      valor
    );
  }

  const texto =
    normalizarTexto(
      valor
    );

  const padraoBrasil =
    texto.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    );

  if (padraoBrasil) {
    const dia =
      padraoBrasil[1]
        .padStart(2, "0");

    const mes =
      padraoBrasil[2]
        .padStart(2, "0");

    const ano =
      padraoBrasil[3];

    return `${ano}-${mes}-${dia}`;
  }

  const padraoISO =
    texto.match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );

  if (padraoISO) {
    return texto;
  }

  return null;
}


/* ==========================================
   HORÁRIO
========================================== */

function converterNumeroHorario(
  valor
) {
  const totalMinutos =
    Math.round(
      valor * 24 * 60
    );

  const hora =
    Math.floor(
      totalMinutos / 60
    ) % 24;

  const minuto =
    totalMinutos % 60;

  return (
    String(hora)
      .padStart(2, "0") +
    ":" +
    String(minuto)
      .padStart(2, "0")
  );
}


function formatarHorarioExcel(
  valor
) {
  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {
    return "";
  }

  if (
    typeof valor === "number"
  ) {
    return converterNumeroHorario(
      valor
    );
  }

  const texto =
    normalizarTexto(
      valor
    );

  const padrao =
    texto.match(
      /^(\d{1,2}):(\d{2})(?::\d{2})?$/
    );

  if (!padrao) {
    return null;
  }

  const hora =
    Number(
      padrao[1]
    );

  const minuto =
    Number(
      padrao[2]
    );

  if (
    hora < 0 ||
    hora > 23 ||
    minuto < 0 ||
    minuto > 59
  ) {
    return null;
  }

  return (
    String(hora)
      .padStart(2, "0") +
    ":" +
    String(minuto)
      .padStart(2, "0")
  );
}


/* ==========================================
   LOCALIZA COLUNAS
========================================== */

function obterValorColuna(
  linha,
  nomesPossiveis
) {
  const chaves =
    Object.keys(
      linha
    );

  for (
    const chave of chaves
  ) {
    const chaveNormalizada =
      normalizarCabecalho(
        chave
      );

    const encontrou =
      nomesPossiveis.some(
        (nome) =>
          chaveNormalizada ===
          normalizarCabecalho(
            nome
          )
      );

    if (encontrou) {
      return linha[chave];
    }
  }

  return "";
}


/* ==========================================
   VALIDAÇÃO
========================================== */

function validarLinha(
  linha,
  numeroLinha
) {
  const erros = [];

  const titulo =
    normalizarTexto(
      obterValorColuna(
        linha,
        [
          "Título",
          "Titulo"
        ]
      )
    );

  const dataOriginal =
    obterValorColuna(
      linha,
      ["Data"]
    );

  const horaInicioOriginal =
    obterValorColuna(
      linha,
      [
        "Hora Início",
        "Hora Inicio"
      ]
    );

  const horaFimOriginal =
    obterValorColuna(
      linha,
      ["Hora Fim"]
    );

  const tipoOriginal =
    normalizarTexto(
      obterValorColuna(
        linha,
        [
          "Tipo da Atividade",
          "Tipo Atividade"
        ]
      )
    );

  const tipoOutro =
    normalizarTexto(
      obterValorColuna(
        linha,
        [
          "Tipo Outros",
          "Tipo Outro"
        ]
      )
    );

  const observacao =
    normalizarTexto(
      obterValorColuna(
        linha,
        [
          "Observação",
          "Observacao"
        ]
      )
    );


  if (!titulo) {
    erros.push(
      "Título não informado"
    );
  }


  const data =
    formatarDataExcel(
      dataOriginal
    );

  if (!data) {
    erros.push(
      "Data inválida"
    );
  }


  const horaInicio =
    formatarHorarioExcel(
      horaInicioOriginal
    );

  if (!horaInicio) {
    erros.push(
      "Hora de início inválida"
    );
  }


  const horaFim =
    formatarHorarioExcel(
      horaFimOriginal
    );

  if (
    horaFimOriginal &&
    !horaFim
  ) {
    erros.push(
      "Hora de fim inválida"
    );
  }


  if (
    horaInicio &&
    horaFim &&
    horaFim <= horaInicio
  ) {
    erros.push(
      "Hora de fim deve ser posterior à hora de início"
    );
  }


  const tipoNormalizado =
    tipoOriginal
      .toLowerCase()
      .replace(/\s+/g, " ");

  const tipoAtividade =
    tiposAtividade[
      tipoNormalizado
    ];


  if (!tipoAtividade) {
    erros.push(
      "Tipo da atividade não reconhecido"
    );
  }


  if (
    tipoAtividade ===
      "outros" &&
    !tipoOutro
  ) {
    erros.push(
      'Tipo "Outros" sem descrição'
    );
  }


  return {
    numeroLinha,

    valido:
      erros.length === 0,

    erros,

    atividade: {
      titulo,

      data,

      hora_inicio:
        horaInicio,

      hora_fim:
        horaFim || null,

      tipo_atividade:
        tipoAtividade || null,

      tipo_outro:
        tipoAtividade ===
          "outros"
          ? tipoOutro
          : null,

      observacao:
        observacao || null
    }
  };
}


/* ==========================================
   PRÉVIA
========================================== */

function criarItemPrevia(
  resultado
) {
  const item =
    document.createElement(
      "div"
    );

  item.className =
    resultado.valido
      ? "item-previa-excel"
      : "item-previa-excel erro";


  const titulo =
    document.createElement(
      "strong"
    );


  if (resultado.valido) {
    titulo.textContent =
      resultado.atividade.titulo;
  } else {
    titulo.textContent =
      `Linha ${resultado.numeroLinha}`;
  }


  item.appendChild(
    titulo
  );


  if (resultado.valido) {
    const dados =
      document.createElement(
        "span"
      );

    dados.textContent =
      `${resultado.atividade.data} • ` +
      `${resultado.atividade.hora_inicio}`;

    item.appendChild(
      dados
    );


    const tipo =
      document.createElement(
        "span"
      );

    tipo.textContent =
      resultado.atividade
        .tipo_atividade;

    item.appendChild(
      tipo
    );

  } else {

    resultado.erros.forEach(
      (erro) => {
        const mensagemErro =
          document.createElement(
            "span"
          );

        mensagemErro.textContent =
          erro;

        item.appendChild(
          mensagemErro
        );
      }
    );
  }


  return item;
}


function mostrarPrevia(
  resultados
) {
  listaPreviaExcel.innerHTML =
    "";

  resultados.forEach(
    (resultado) => {
      listaPreviaExcel.appendChild(
        criarItemPrevia(
          resultado
        )
      );
    }
  );

  areaPreviaExcel.hidden =
    false;
}


/* ==========================================
   PROCESSAR ARQUIVO
========================================== */

async function processarArquivo(
  arquivo
) {
  esconderMensagem();

  atividadesValidas = [];
  atividadesComErro = [];

  botaoImportarExcel.disabled =
    true;


  try {
    const dados =
      await arquivo.arrayBuffer();

    const workbook =
      XLSX.read(
        dados
      );

    const nomePrimeiraAba =
      workbook.SheetNames[0];

    if (!nomePrimeiraAba) {
      throw new Error(
        "A planilha não possui abas."
      );
    }


    const planilha =
      workbook.Sheets[
        nomePrimeiraAba
      ];


    const linhas =
      XLSX.utils.sheet_to_json(
        planilha,
        {
          defval: "",
          raw: true
        }
      );


    if (
      linhas.length === 0
    ) {
      mostrarMensagem(
        "A planilha está vazia."
      );

      return;
    }


    const resultados =
      linhas.map(
        (linha, indice) =>
          validarLinha(
            linha,
            indice + 2
          )
      );


    atividadesValidas =
      resultados.filter(
        (resultado) =>
          resultado.valido
      );


    atividadesComErro =
      resultados.filter(
        (resultado) =>
          !resultado.valido
      );


    nomeArquivoExcel.textContent =
      arquivo.name;


    resumoArquivoExcel.textContent =
      `${resultados.length} atividades encontradas • ` +
      `${atividadesValidas.length} válidas • ` +
      `${atividadesComErro.length} com erro`;


    dadosArquivoExcel.hidden =
      false;


    mostrarPrevia(
      resultados
    );


    areaConfirmarImportacao.hidden =
      false;


    botaoImportarExcel.disabled =
      atividadesValidas.length ===
      0;


    if (
      atividadesComErro.length >
      0
    ) {
      mostrarMensagem(
        "Existem linhas com erro. Somente as atividades válidas serão importadas."
      );
    }

  } catch (erro) {
    console.error(
      "Erro ao ler planilha:",
      erro
    );

    mostrarMensagem(
      "Não foi possível ler a planilha. Verifique se o arquivo está no formato correto."
    );

    dadosArquivoExcel.hidden =
      true;

    areaPreviaExcel.hidden =
      true;

    areaConfirmarImportacao.hidden =
      true;
  }
}


/* ==========================================
   USUÁRIO TES OUREIRO LOGADO
========================================== */

async function obterUsuarioLogado() {
  const resultadoSessao =
    await window.supabaseClient.auth
      .getSession();

  if (resultadoSessao.error) {
    throw resultadoSessao.error;
  }


  const sessao =
    resultadoSessao.data.session;


  if (!sessao) {
    window.location.href =
      "index.html";

    throw new Error(
      "Sessão não encontrada."
    );
  }


  const resultadoUsuario =
    await window.supabaseClient
      .from("usuarios")
      .select("id")
      .eq(
        "auth_id",
        sessao.user.id
      )
      .maybeSingle();


  if (resultadoUsuario.error) {
    throw resultadoUsuario.error;
  }


  if (!resultadoUsuario.data) {
    throw new Error(
      "Usuário não encontrado."
    );
  }


  return resultadoUsuario.data.id;
}


/* ==========================================
   DUPLICIDADE
========================================== */

function atividadeJaExiste(
  atividade,
  atividadesExistentes
) {
  return atividadesExistentes.some(
    (existente) => {

      const horaExistente =
        existente.hora_inicio
          ? existente.hora_inicio
              .slice(0, 5)
          : "";

      return (
        existente.data ===
          atividade.data &&

        horaExistente ===
          atividade.hora_inicio &&

        normalizarTexto(
          existente.titulo
        ).toLowerCase() ===
          normalizarTexto(
            atividade.titulo
          ).toLowerCase()
      );
    }
  );
}


/* ==========================================
   IMPORTAÇÃO REAL
========================================== */

async function importarAtividades() {
  if (
    atividadesValidas.length ===
    0
  ) {
    return;
  }


  botaoImportarExcel.disabled =
    true;

  botaoImportarExcel.textContent =
    "IMPORTANDO...";

  esconderMensagem();


  try {

    const criadoPor =
      await obterUsuarioLogado();


    /*
      Carregamos as atividades atuais
      para evitar importar novamente
      a mesma combinação de:
      data + horário + título.
    */

    const resultadoExistentes =
      await window.supabaseClient
        .from("atividades")
        .select(`
          titulo,
          data,
          hora_inicio
        `);


    if (
      resultadoExistentes.error
    ) {
      throw resultadoExistentes.error;
    }


    const existentes =
      resultadoExistentes.data ||
      [];


    const novas = [];

    let duplicadas = 0;


    atividadesValidas.forEach(
      (resultado) => {

        const atividade =
          resultado.atividade;


        if (
          atividadeJaExiste(
            atividade,
            existentes
          )
        ) {

          duplicadas += 1;

          return;
        }


        /*
          Também evita duplicidade dentro
          da própria planilha.
        */

        if (
          atividadeJaExiste(
            atividade,
            novas
          )
        ) {

          duplicadas += 1;

          return;
        }


        novas.push({
          titulo:
            atividade.titulo,

          data:
            atividade.data,

          hora_inicio:
            atividade.hora_inicio,

          hora_fim:
            atividade.hora_fim,

          tipo_atividade:
            atividade.tipo_atividade,

          tipo_outro:
            atividade.tipo_outro,

          observacao:
            atividade.observacao,

          origem:
            "excel",

          google_event_id:
            null,

          criado_por:
            criadoPor
        });
      }
    );


    if (
      novas.length === 0
    ) {

      mostrarMensagem(
        duplicadas > 0
          ? "Nenhuma atividade nova para importar. Todas já estão cadastradas."
          : "Nenhuma atividade válida para importar."
      );

      botaoImportarExcel.disabled =
        false;

      botaoImportarExcel.textContent =
        "Importar atividades";

      return;
    }


    const resultadoImportacao =
      await window.supabaseClient
        .from("atividades")
        .insert(
          novas
        );


    if (
      resultadoImportacao.error
    ) {
      throw resultadoImportacao.error;
    }


    let mensagem =
      `${novas.length} ` +
      (
        novas.length === 1
          ? "atividade importada"
          : "atividades importadas"
      ) +
      " com sucesso.";


    if (duplicadas > 0) {
      mensagem +=
        ` ${duplicadas} ` +
        (
          duplicadas === 1
            ? "atividade duplicada foi ignorada."
            : "atividades duplicadas foram ignoradas."
        );
    }


    if (
      atividadesComErro.length >
      0
    ) {
      mensagem +=
        ` ${atividadesComErro.length} ` +
        (
          atividadesComErro.length ===
          1
            ? "linha com erro não foi importada."
            : "linhas com erro não foram importadas."
        );
    }


    mostrarMensagem(
      mensagem
    );


    botaoImportarExcel.textContent =
      "Importação concluída";


    setTimeout(
      () => {
        window.location.href =
          "calendario.html";
      },
      1800
    );

  } catch (erro) {

    console.error(
      "Erro ao importar atividades:",
      erro
    );


    mostrarMensagem(
      "Não foi possível importar as atividades."
    );


    botaoImportarExcel.disabled =
      false;


    botaoImportarExcel.textContent =
      "Importar atividades";
  }
}


/* ==========================================
   SELEÇÃO DO ARQUIVO
========================================== */

arquivoExcel.addEventListener(
  "change",
  () => {

    const arquivo =
      arquivoExcel.files?.[0];


    if (!arquivo) {
      return;
    }


    const nome =
      arquivo.name
        .toLowerCase();


    if (
      !nome.endsWith(".xlsx") &&
      !nome.endsWith(".xls")
    ) {

      mostrarMensagem(
        "Selecione um arquivo Excel no formato .xlsx ou .xls."
      );


      arquivoExcel.value =
        "";

      return;
    }


    processarArquivo(
      arquivo
    );
  }
);


/* ==========================================
   BOTÃO IMPORTAR
========================================== */

botaoImportarExcel.addEventListener(
  "click",
  importarAtividades
);
