"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const listaCarometro =
  document.getElementById(
    "listaCarometro"
  );

const mensagemSemCarometro =
  document.getElementById(
    "mensagemSemCarometro"
  );


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
   ORDENAR PELO NOME
========================================== */

function ordenarAssociados(
  associados
) {

  return associados.sort(
    (a, b) => {

      const nomeA =
        String(
          a.nome_completo || ""
        );

      const nomeB =
        String(
          b.nome_completo || ""
        );


      return nomeA.localeCompare(
        nomeB,
        "pt-BR",
        {
          sensitivity: "base"
        }
      );

    }
  );
}


/* ==========================================
   CRIAR FOTO
========================================== */

async function obterUrlFoto(
  fotoPath
) {

  if (!fotoPath) {
    return null;
  }


  try {

    const resultadoFoto =
      await window.supabaseClient.storage
        .from(
          "fotos-associados"
        )
        .createSignedUrl(
          fotoPath,
          60 * 60
        );


    if (
      resultadoFoto.error
    ) {

      console.error(
        "Erro ao carregar foto:",
        resultadoFoto.error
      );

      return null;
    }


    return (
      resultadoFoto.data?.signedUrl ||
      null
    );


  } catch (erro) {

    console.error(
      "Erro ao gerar URL da foto:",
      erro
    );


    return null;
  }

}


/* ==========================================
   CRIAR ITEM DO CARÔMETRO
========================================== */

async function criarItemCarometro(
  associado
) {

  const link =
    document.createElement(
      "a"
    );


  link.className =
    "item-carometro";


  link.href =
    `associado-resumo.html?id=${associado.id}`;


  /* FOTO */

  const areaFoto =
    document.createElement(
      "div"
    );


  areaFoto.className =
    "area-foto-carometro";


  const urlFoto =
    await obterUrlFoto(
      associado.foto_path
    );


  if (urlFoto) {

    const foto =
      document.createElement(
        "img"
      );


    foto.className =
      "foto-carometro";


    foto.src =
      urlFoto;


    foto.alt =
      `Foto de ${formatarNome(
        associado.nome_completo
      )}`;


    areaFoto.appendChild(
      foto
    );


  } else {

    const fotoPadrao =
      document.createElement(
        "div"
      );


    fotoPadrao.className =
      "foto-carometro foto-carometro-padrao";


    fotoPadrao.textContent =
      "👤";


    areaFoto.appendChild(
      fotoPadrao
    );

  }


  /* NOME */

  const nome =
    document.createElement(
      "strong"
    );


  nome.className =
    "nome-carometro";


  nome.textContent =
    formatarNome(
      associado.nome_completo
    );


  link.appendChild(
    areaFoto
  );


  link.appendChild(
    nome
  );


  return link;
}


/* ==========================================
   CARREGAR ASSOCIADOS
========================================== */

async function carregarCarometro() {

  if (
    !window.supabaseClient
  ) {

    return;

  }


  try {

    const resultado =
      await window.supabaseClient
        .from("usuarios")
        .select(`
          id,
          nome_completo,
          foto_path,
          status
        `)
        .eq(
          "status",
          "ativo"
        );


    if (
      resultado.error
    ) {

      throw resultado.error;

    }


    const associados =
      ordenarAssociados(
        resultado.data || []
      );


    listaCarometro.innerHTML =
      "";


    mensagemSemCarometro.hidden =
      associados.length > 0;


    for (
      const associado of associados
    ) {

      const item =
        await criarItemCarometro(
          associado
        );


      listaCarometro.appendChild(
        item
      );

    }


  } catch (erro) {

    console.error(
      "Erro ao carregar carômetro:",
      erro
    );


    listaCarometro.innerHTML =
      "<p>Não foi possível carregar os associados.</p>";

  }

}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

carregarCarometro();
