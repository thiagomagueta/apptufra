"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const tituloPermissoes =
  document.getElementById(
    "tituloPermissoes"
  );

const subtituloPermissoes =
  document.getElementById(
    "subtituloPermissoes"
  );

const secaoCadastrosPendentes =
  document.getElementById(
    "secaoCadastrosPendentes"
  );

const secaoAtribuirFuncoes =
  document.getElementById(
    "secaoAtribuirFuncoes"
  );

const listaCadastrosPendentes =
  document.getElementById(
    "listaCadastrosPendentes"
  );

const listaUsuariosAtivos =
  document.getElementById(
    "listaUsuariosAtivos"
  );


/* ==========================================
   SEÇÃO
========================================== */

function obterSecaoAtual() {

  const parametros =
    new URLSearchParams(
      window.location.search
    );


  return parametros.get(
    "secao"
  );

}


function configurarSecao() {

  const secao =
    obterSecaoAtual();


  if (
    secao === "pendentes"
  ) {

    tituloPermissoes.textContent =
      "Cadastros aguardando aprovação";


    subtituloPermissoes.textContent =
      "Analise e aprove os novos cadastros da TUFRA.";


    secaoCadastrosPendentes.hidden =
      false;


    secaoAtribuirFuncoes.hidden =
      true;


    return "pendentes";

  }


  if (
    secao === "funcoes"
  ) {

    tituloPermissoes.textContent =
      "Atribuir Funções";


    subtituloPermissoes.textContent =
      "Gerencie as funções dos usuários ativos.";


    secaoCadastrosPendentes.hidden =
      true;


    secaoAtribuirFuncoes.hidden =
      false;


    return "funcoes";

  }


  /*
    Se a página for aberta sem parâmetro,
    volta para a tela anterior.
  */

  window.location.href =
    "adm-permissoes.html";


  return null;
}


/* ==========================================
   FORMATAÇÃO
========================================== */

function formatarNome(
  nomeCompleto
) {

  return String(
    nomeCompleto || ""
  )
    .trim()
    .toLowerCase()
    .replace(
      /\b\p{L}/gu,
      (letra) =>
        letra.toUpperCase()
    );

}


/* ==========================================
   ITEM DO USUÁRIO
========================================== */

function criarItemUsuario(
  usuario,
  tipo
) {

  const link =
    document.createElement(
      "a"
    );


  link.className =
    "item-permissao-lista";


  if (
    tipo === "pendente"
  ) {

    link.href =
      `permissao-usuario.html?id=${usuario.id}&tipo=pendente`;

  } else {

    link.href =
      `permissao-usuario.html?id=${usuario.id}&tipo=ativo`;

  }


  const dados =
    document.createElement(
      "div"
    );


  dados.className =
    "dados-permissao-lista";


  const nome =
    document.createElement(
      "strong"
    );


  nome.textContent =
    formatarNome(
      usuario.nome_completo
    ) ||
    "Usuário";


  dados.appendChild(
    nome
  );


  if (
    tipo === "pendente"
  ) {

    const status =
      document.createElement(
        "span"
      );


    status.textContent =
      "Aguardando aprovação";


    dados.appendChild(
      status
    );

  }


  const seta =
    document.createElement(
      "span"
    );


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


/* ==========================================
   PREENCHER LISTA
========================================== */

function preencherLista(
  elementoLista,
  usuarios,
  tipo
) {

  elementoLista.innerHTML =
    "";


  if (
    !usuarios.length
  ) {

    const mensagem =
      document.createElement(
        "p"
      );


    mensagem.textContent =
      tipo === "pendente"
        ? "Nenhum cadastro aguardando aprovação."
        : "Nenhum usuário ativo encontrado.";


    elementoLista.appendChild(
      mensagem
    );


    return;

  }


  usuarios.forEach(
    (usuario) => {

      const item =
        criarItemUsuario(
          usuario,
          tipo
        );


      elementoLista.appendChild(
        item
      );

    }
  );

}


/* ==========================================
   CARREGAR USUÁRIOS
========================================== */

async function carregarUsuarios(
  secao
) {

  if (
    !window.supabaseClient
  ) {

    return;

  }


  try {

    const resultadoSessao =
      await window.supabaseClient.auth
        .getSession();


    if (
      resultadoSessao.error
    ) {

      throw resultadoSessao.error;

    }


    const sessao =
      resultadoSessao.data.session;


    if (
      !sessao
    ) {

      window.location.href =
        "index.html";


      return;

    }


    const resultadoUsuarios =
      await window.supabaseClient
        .from(
          "usuarios"
        )
        .select(`
          id,
          nome_completo,
          email,
          status,
          foto_path,
          data_solicitacao
        `)
        .order(
          "nome_completo",
          {
            ascending:
              true
          }
        );


    if (
      resultadoUsuarios.error
    ) {

      throw resultadoUsuarios.error;

    }


    const usuarios =
      resultadoUsuarios.data ||
      [];


    /* ======================================
       CADASTROS PENDENTES
    ====================================== */

    if (
      secao === "pendentes"
    ) {

      const pendentes =
        usuarios.filter(
          (usuario) => {

            const status =
              String(
                usuario.status || ""
              ).toLowerCase();


            return (
              status.includes(
                "aguardando"
              ) ||
              status.includes(
                "pendente"
              )
            );

          }
        );


      preencherLista(
        listaCadastrosPendentes,
        pendentes,
        "pendente"
      );


      return;

    }


    /* ======================================
       USUÁRIOS ATIVOS
    ====================================== */

    if (
      secao === "funcoes"
    ) {

      const ativos =
        usuarios.filter(
          (usuario) => {

            const status =
              String(
                usuario.status || ""
              ).toLowerCase();


            return status ===
              "ativo";

          }
        );


      preencherLista(
        listaUsuariosAtivos,
        ativos,
        "ativo"
      );

    }


  } catch (erro) {

    console.error(
      "Erro ao carregar usuários:",
      erro
    );


    if (
      secao === "pendentes"
    ) {

      listaCadastrosPendentes.innerHTML =
        "<p>Não foi possível carregar os cadastros.</p>";

    }


    if (
      secao === "funcoes"
    ) {

      listaUsuariosAtivos.innerHTML =
        "<p>Não foi possível carregar os usuários.</p>";

    }

  }

}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

const secaoAtual =
  configurarSecao();


if (
  secaoAtual
) {

  carregarUsuarios(
    secaoAtual
  );

}
