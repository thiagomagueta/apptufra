"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const listaComunicadosAtivos =
  document.getElementById(
    "listaComunicadosAtivos"
  );

const listaComunicadosEncerrados =
  document.getElementById(
    "listaComunicadosEncerrados"
  );

const mensagemSemComunicadosAtivos =
  document.getElementById(
    "mensagemSemComunicadosAtivos"
  );

const mensagemSemComunicadosEncerrados =
  document.getElementById(
    "mensagemSemComunicadosEncerrados"
  );


/* ==========================================
   FORMATAR DATA
========================================== */

function formatarDataHora(
  dataIso
) {

  if (
    !dataIso
  ) {

    return "";

  }


  const data =
    new Date(
      dataIso
    );


  return data.toLocaleString(
    "pt-BR",
    {
      dateStyle:
        "short",

      timeStyle:
        "short"
    }
  );

}


/* ==========================================
   TIPO
========================================== */

function formatarTipo(
  tipo
) {

  if (
    tipo === "enquete"
  ) {

    return "Enquete";

  }


  return "Recado";

}


/* ==========================================
   CRIAR ITEM
========================================== */

function criarItemComunicado(
  comunicado
) {

  const link =
    document.createElement(
      "a"
    );


  link.className =
    "item-acao-administrativa";


  link.href =
    `adm-comunicado-detalhe.html?id=${encodeURIComponent(
      comunicado.id
    )}`;


  const conteudo =
    document.createElement(
      "div"
    );


  conteudo.className =
    "conteudo-item-adm";


  const titulo =
    document.createElement(
      "strong"
    );


  titulo.className =
    "titulo-item-adm";


  titulo.textContent =
    comunicado.titulo ||
    "Sem título";


  const descricao =
    document.createElement(
      "span"
    );


  descricao.className =
    "descricao-item-adm";


  descricao.textContent =
    `${formatarTipo(
      comunicado.tipo
    )} • ${formatarDataHora(
      comunicado.data_inicio
    )} até ${formatarDataHora(
      comunicado.data_fim
    )}`;


  const seta =
    document.createElement(
      "span"
    );


  seta.className =
    "seta-permissao-lista";


  seta.textContent =
    "›";


  conteudo.appendChild(
    titulo
  );


  conteudo.appendChild(
    descricao
  );


  link.appendChild(
    conteudo
  );


  link.appendChild(
    seta
  );


  return link;

}


/* ==========================================
   RENDERIZAR LISTAS
========================================== */

function renderizarListas(
  comunicados
) {

  listaComunicadosAtivos.innerHTML =
    "";


  listaComunicadosEncerrados.innerHTML =
    "";


  const agora =
    new Date();


  const ativos =
    [];


  const encerrados =
    [];


  comunicados.forEach(
    (comunicado) => {

      const dataFim =
        new Date(
          comunicado.data_fim
        );


      const estaEncerrado =
        comunicado.status ===
          "encerrado" ||
        dataFim < agora;


      if (
        estaEncerrado
      ) {

        encerrados.push(
          comunicado
        );

      } else {

        ativos.push(
          comunicado
        );

      }

    }
  );


  /* --------------------------------------
     ATIVOS
  -------------------------------------- */

  mensagemSemComunicadosAtivos.hidden =
    ativos.length > 0;


  ativos.forEach(
    (comunicado) => {

      listaComunicadosAtivos.appendChild(
        criarItemComunicado(
          comunicado
        )
      );

    }
  );


  /* --------------------------------------
     ENCERRADOS
  -------------------------------------- */

  mensagemSemComunicadosEncerrados.hidden =
    encerrados.length > 0;


  encerrados.forEach(
    (comunicado) => {

      listaComunicadosEncerrados.appendChild(
        criarItemComunicado(
          comunicado
        )
      );

    }
  );

}


/* ==========================================
   CARREGAR COMUNICADOS
========================================== */

async function carregarComunicados() {

  if (
    !window.supabaseClient
  ) {

    listaComunicadosAtivos.innerHTML =
      "<p>Não foi possível conectar ao banco de dados.</p>";


    listaComunicadosEncerrados.innerHTML =
      "";

    return;

  }


  try {

    const resultado =
      await window.supabaseClient
        .from(
          "comunicados"
        )
        .select(`
          id,
          tipo,
          titulo,
          mensagem,
          data_inicio,
          data_fim,
          status,
          criado_em
        `)
        .order(
          "criado_em",
          {
            ascending:
              false
          }
        );


    if (
      resultado.error
    ) {

      throw resultado.error;

    }


    renderizarListas(
      resultado.data ||
      []
    );


  } catch (erro) {

    console.error(
      "Erro ao carregar Recados e Enquetes:",
      erro
    );


    listaComunicadosAtivos.innerHTML =
      "<p>Não foi possível carregar os comunicados.</p>";


    listaComunicadosEncerrados.innerHTML =
      "";


    mensagemSemComunicadosAtivos.hidden =
      true;


    mensagemSemComunicadosEncerrados.hidden =
      true;

  }

}


/* ==========================================
   INICIAR
========================================== */

carregarComunicados();
