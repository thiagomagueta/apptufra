"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const listaTiposPresenca =
  document.getElementById(
    "listaTiposPresenca"
  );

const mensagemSemTiposPresenca =
  document.getElementById(
    "mensagemSemTiposPresenca"
  );


/* ==========================================
   CRIAR ITEM
========================================== */

function criarItemTipoLista(
  tipo
) {

  const link =
    document.createElement(
      "a"
    );


  link.className =
    "item-acao-administrativa";


  link.href =
    `responsaveis-presenca-editar.html?id=${tipo.id}`;


  const nome =
    document.createElement(
      "span"
    );


  nome.textContent =
    tipo.nome;


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
   CARREGAR LISTAS
========================================== */

async function carregarTiposPresenca() {

  if (
    !window.supabaseClient
  ) {

    return;

  }


  try {

    const resultado =
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
      resultado.error
    ) {

      throw resultado.error;

    }


    const tipos =
      resultado.data || [];


    listaTiposPresenca.innerHTML =
      "";


    mensagemSemTiposPresenca.hidden =
      tipos.length > 0;


    tipos.forEach(
      (tipo) => {

        listaTiposPresenca.appendChild(
          criarItemTipoLista(
            tipo
          )
        );

      }
    );


  } catch (erro) {

    console.error(
      "Erro ao carregar listas de presença:",
      erro
    );


    listaTiposPresenca.innerHTML =
      "<p>Não foi possível carregar as listas de presença.</p>";

  }

}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

carregarTiposPresenca();
