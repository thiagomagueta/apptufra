"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const listasRelatorioAtividade =
  document.getElementById(
    "listasRelatorioAtividade"
  );

const mensagemSemListasRelatorioAtividade =
  document.getElementById(
    "mensagemSemListasRelatorioAtividade"
  );


/* ==========================================
   DIRETORIA
========================================== */

const funcoesDiretoria = [
  "Sacerdote",
  "Pai/Mãe Pequeno (a)",
  "Tesoureiro",
  "Secretária",
  "Presidente"
];


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
    `relatorio-atividade-lista.html?id=${tipoLista.id}`;


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
   VALIDAR DIRETORIA
========================================== */

async function validarDiretoria() {

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


    throw new Error(
      "Sessão não encontrada."
    );

  }


  const resultadoUsuario =
    await window.supabaseClient
      .from(
        "usuarios"
      )
      .select(
        "id"
      )
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


  const resultadoFuncoes =
    await window.supabaseClient
      .from(
        "usuario_funcoes"
      )
      .select(`
        funcoes (
          nome
        )
      `)
      .eq(
        "usuario_id",
        resultadoUsuario.data.id
      );


  if (
    resultadoFuncoes.error
  ) {

    throw resultadoFuncoes.error;

  }


  const nomesFuncoes =
    (
      resultadoFuncoes.data ||
      []
    )
      .map(
        (item) =>
          item.funcoes?.nome
      )
      .filter(Boolean);


  const pertenceDiretoria =
    nomesFuncoes.some(
      (funcao) =>
        funcoesDiretoria.includes(
          funcao
        )
    );


  if (
    !pertenceDiretoria
  ) {

    window.location.href =
      "administrativo.html";


    throw new Error(
      "Usuário não autorizado."
    );

  }

}


/* ==========================================
   CARREGAR LISTAS
========================================== */

async function carregarListas() {

  if (
    !window.supabaseClient
  ) {

    return;

  }


  try {

    await validarDiretoria();


    const resultadoListas =
      await window.supabaseClient
        .from(
          "tipos_lista_presenca"
        )
        .select(`
          id,
          nome,
          tipo_atividade,
          ativo,
          ordem
        `)
        .eq(
          "ativo",
          true
        )
        .order(
          "ordem",
          {
            ascending: true
          }
        );


    if (
      resultadoListas.error
    ) {

      throw resultadoListas.error;

    }


    const listas =
      resultadoListas.data ||
      [];


    listasRelatorioAtividade.innerHTML =
      "";


    mensagemSemListasRelatorioAtividade.hidden =
      listas.length > 0;


    listas.forEach(
      (tipoLista) => {

        listasRelatorioAtividade.appendChild(
          criarItemLista(
            tipoLista
          )
        );

      }
    );


  } catch (erro) {

    console.error(
      "Erro ao carregar listas para relatório por atividade:",
      erro
    );


    listasRelatorioAtividade.innerHTML =
      "<p>Não foi possível carregar as listas de presença.</p>";

  }

}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

carregarListas();
