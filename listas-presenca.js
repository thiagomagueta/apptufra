"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const listaPresencasDisponiveis =
  document.getElementById(
    "listaPresencasDisponiveis"
  );

const mensagemSemListasPresenca =
  document.getElementById(
    "mensagemSemListasPresenca"
  );


/* ==========================================
   CRIAR ITEM
========================================== */

function criarItemLista(
  tipoLista
) {

  const link =
    document.createElement(
      "a"
    );


  link.className =
    "item-acao-administrativa";


  link.href =
    `presenca-atividades.html?id=${tipoLista.id}`;


  const nome =
    document.createElement(
      "span"
    );


  nome.textContent =
    tipoLista.nome;


  const seta =
    document.createElement(
      "span"
    );


  seta.className =
    "seta-permissao-lista";


  seta.textContent =
    "›";


  link.appendChild(
    nome
  );


  link.appendChild(
    seta
  );


  return link;
}


/* ==========================================
   CARREGAR LISTAS DO USUÁRIO
========================================== */

async function carregarListasPresenca() {

  if (
    !window.supabaseClient
  ) {

    return;

  }


  try {

    /* --------------------------------------
       SESSÃO
    -------------------------------------- */

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


    /* --------------------------------------
       USUÁRIO
    -------------------------------------- */

    const resultadoUsuario =
      await window.supabaseClient
        .from("usuarios")
        .select("id")
        .eq(
          "auth_id",
          sessao.user.id
        )
        .maybeSingle();


    if (
      resultadoUsuario.error
    ) {

      throw resultadoUsuario.error;

    }


    if (
      !resultadoUsuario.data
    ) {

      throw new Error(
        "Usuário não encontrado."
      );

    }


    const usuarioId =
      resultadoUsuario.data.id;


    /* --------------------------------------
       LISTAS ATRIBUÍDAS
    -------------------------------------- */

    const resultadoResponsaveis =
      await window.supabaseClient
        .from(
          "responsaveis_lista_presenca"
        )
        .select(`
          tipo_lista_id,
          tipos_lista_presenca (
            id,
            nome,
            tipo_atividade,
            ativo,
            ordem
          )
        `)
        .eq(
          "usuario_id",
          usuarioId
        );


    if (
      resultadoResponsaveis.error
    ) {

      throw resultadoResponsaveis.error;

    }


    const listas =
      (
        resultadoResponsaveis.data ||
        []
      )
        .map(
          (item) =>
            item.tipos_lista_presenca
        )
        .filter(
          (item) =>
            item &&
            item.ativo
        )
        .sort(
          (a, b) =>
            Number(
              a.ordem || 0
            ) -
            Number(
              b.ordem || 0
            )
        );


    /* --------------------------------------
       EXIBIR
    -------------------------------------- */

    listaPresencasDisponiveis.innerHTML =
      "";


    mensagemSemListasPresenca.hidden =
      listas.length > 0;


    listas.forEach(
      (tipoLista) => {

        listaPresencasDisponiveis.appendChild(
          criarItemLista(
            tipoLista
          )
        );

      }
    );


  } catch (erro) {

    console.error(
      "Erro ao carregar listas de presença:",
      erro
    );


    listaPresencasDisponiveis.innerHTML =
      "<p>Não foi possível carregar suas listas.</p>";

  }

}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

carregarListasPresenca();
