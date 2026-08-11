"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const tituloFichaAssociado =
  document.getElementById(
    "tituloFichaAssociado"
  );

const areaDadosPessoais =
  document.getElementById(
    "fichaAssociadoDadosPessoais"
  );

const areaEnderecoContato =
  document.getElementById(
    "fichaAssociadoEnderecoContato"
  );

const areaHistoricoUmbanda =
  document.getElementById(
    "fichaAssociadoHistoricoUmbanda"
  );

const mensagemFichaAssociado =
  document.getElementById(
    "mensagemFichaAssociado"
  );

const fotoAssociadoFicha =
  document.getElementById(
    "fotoAssociadoFicha"
  );

const fotoAssociadoFichaPadrao =
  document.getElementById(
    "fotoAssociadoFichaPadrao"
  );

const voltarResumoAssociado =
  document.getElementById(
    "voltarResumoAssociado"
  );


/* ==========================================
   ID DO ASSOCIADO
========================================== */

function obterAssociadoId() {

  const parametros =
    new URLSearchParams(
      window.location.search
    );

  return parametros.get(
    "id"
  );
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


function valorOuTraco(
  valor
) {

  if (
    valor === undefined ||
    valor === null ||
    valor === ""
  ) {

    return "Não informado";

  }

  return String(
    valor
  );
}


/* ==========================================
   MENSAGEM
========================================== */

function mostrarMensagem(
  texto
) {

  mensagemFichaAssociado.textContent =
    texto;

  mensagemFichaAssociado.hidden =
    false;
}


/* ==========================================
   ITENS
========================================== */

function adicionarItem(
  area,
  titulo,
  valor
) {

  const item =
    document.createElement(
      "div"
    );

  item.className =
    "item-revisao";


  const rotulo =
    document.createElement(
      "span"
    );

  rotulo.textContent =
    titulo;


  const conteudo =
    document.createElement(
      "strong"
    );

  conteudo.textContent =
    valorOuTraco(
      valor
    );


  item.appendChild(
    rotulo
  );

  item.appendChild(
    conteudo
  );


  area.appendChild(
    item
  );
}


/* ==========================================
   DADOS PESSOAIS
========================================== */

function mostrarDadosPessoais(
  dados
) {

  adicionarItem(
    areaDadosPessoais,
    "Nome",
    dados.nome
  );


  adicionarItem(
    areaDadosPessoais,
    "Data de nascimento",
    dados.nascimento
  );


  adicionarItem(
    areaDadosPessoais,
    "Idade",
    dados.idade
  );


  adicionarItem(
    areaDadosPessoais,
    "Naturalidade",
    dados.cidadeNascimento &&
    dados.estadoNascimento
      ? `${dados.cidadeNascimento} - ${dados.estadoNascimento}`
      : ""
  );


  adicionarItem(
    areaDadosPessoais,
    "Gênero",
    dados.genero ===
      "Outro / Autodeclarado"
      ? dados.generoAutodeclarado
      : dados.genero
  );


  adicionarItem(
    areaDadosPessoais,
    "Nacionalidade",
    dados.nacionalidade
  );


  adicionarItem(
    areaDadosPessoais,
    "RG",
    dados.rg
  );


  adicionarItem(
    areaDadosPessoais,
    "CPF",
    dados.cpf
  );
}


/* ==========================================
   ENDEREÇO E CONTATO
========================================== */

function mostrarEnderecoContato(
  dados
) {

  adicionarItem(
    areaEnderecoContato,
    "CEP",
    dados.cep
  );


  adicionarItem(
    areaEnderecoContato,
    "Endereço",
    dados.endereco
  );


  adicionarItem(
    areaEnderecoContato,
    "Número",
    dados.numero
  );


  adicionarItem(
    areaEnderecoContato,
    "Complemento",
    dados.complemento
  );


  adicionarItem(
    areaEnderecoContato,
    "Bairro",
    dados.bairro
  );


  adicionarItem(
    areaEnderecoContato,
    "Cidade/Estado",
    dados.cidade &&
    dados.estado
      ? `${dados.cidade} - ${dados.estado}`
      : ""
  );


  adicionarItem(
    areaEnderecoContato,
    "Telefone fixo",
    dados.telefoneFixo
  );


  adicionarItem(
    areaEnderecoContato,
    "Celular",
    dados.celular
  );


  adicionarItem(
    areaEnderecoContato,
    "E-mail",
    dados.email
  );
}


/* ==========================================
   HISTÓRICO NA UMBANDA
========================================== */

function mostrarHistoricoUmbanda(
  dados
) {

  adicionarItem(
    areaHistoricoUmbanda,
    "Tempo de Umbanda",
    dados.tempoUmbanda
  );


  adicionarItem(
    areaHistoricoUmbanda,
    "Participou de outros terreiros",
    dados.participouOutrosTerreiros
  );


  if (
    dados.participouOutrosTerreiros ===
    "Sim"
  ) {

    adicionarItem(
      areaHistoricoUmbanda,
      "Quantidade de terreiros",
      dados.quantidadeTerreiros
    );

  }


  adicionarItem(
    areaHistoricoUmbanda,
    "Religião de batismo",
    dados.religiaoBatismo
  );


  adicionarItem(
    areaHistoricoUmbanda,
    "Como chegou à Umbanda",
    dados.comoChegouUmbanda
  );


  adicionarItem(
    areaHistoricoUmbanda,
    "Batizado na Umbanda",
    dados.batizadoUmbanda
  );


  if (
    dados.batizadoUmbanda ===
    "Sim"
  ) {

    adicionarItem(
      areaHistoricoUmbanda,
      "Terreiro do batismo",
      dados.terreiroBatismo
    );


    adicionarItem(
      areaHistoricoUmbanda,
      "Data do batismo",
      dados.dataBatismo
    );


    adicionarItem(
      areaHistoricoUmbanda,
      "Cidade/Estado do batismo",
      dados.cidadeBatismo &&
      dados.estadoBatismo
        ? `${dados.cidadeBatismo} - ${dados.estadoBatismo}`
        : ""
    );

  }


  adicionarItem(
    areaHistoricoUmbanda,
    "Orixá de frente",
    dados.orixaFrente
  );


  adicionarItem(
    areaHistoricoUmbanda,
    "Orixá adjunto",
    dados.orixaAdjunto
  );


  adicionarItem(
    areaHistoricoUmbanda,
    "Melhor dia para pagamento",
    dados.melhorDiaPagamento
      ? `Dia ${String(
          dados.melhorDiaPagamento
        ).padStart(
          2,
          "0"
        )}`
      : ""
  );
}


/* ==========================================
   CARREGAR FICHA
========================================== */

async function carregarFichaAssociado() {

  const associadoId =
    obterAssociadoId();


  if (!associadoId) {

    window.location.href =
      "lista-associados.html";

    return;

  }


  if (
    !window.supabaseClient
  ) {

    mostrarMensagem(
      "Não foi possível conectar ao banco de dados."
    );

    return;

  }


  try {

    /* --------------------------------------
       USUÁRIO
    -------------------------------------- */

    const resultadoUsuario =
      await window.supabaseClient
        .from("usuarios")
        .select(`
          id,
          nome_completo,
          foto_path
        `)
        .eq(
          "id",
          associadoId
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
        "Associado não encontrado."
      );

    }


    const usuario =
      resultadoUsuario.data;


    const nome =
      formatarNome(
        usuario.nome_completo
      );


    tituloFichaAssociado.textContent =
      nome
        ? `Ficha de ${nome}`
        : "Ficha do Associado";


    /* --------------------------------------
       LINK DE VOLTA
    -------------------------------------- */

    voltarResumoAssociado.href =
      `associado-resumo.html?id=${associadoId}`;


    /* --------------------------------------
       FICHA
    -------------------------------------- */

    const resultadoFicha =
      await window.supabaseClient
        .from(
          "fichas_associados"
        )
        .select(`
          dados_pessoais,
          endereco_contato,
          historico_umbanda
        `)
        .eq(
          "usuario_id",
          associadoId
        )
        .maybeSingle();


    if (
      resultadoFicha.error
    ) {

      throw resultadoFicha.error;

    }


    if (
      !resultadoFicha.data
    ) {

      mostrarMensagem(
        "A ficha deste associado ainda não foi encontrada."
      );

      return;

    }


    const dadosPessoais =
      resultadoFicha.data
        .dados_pessoais || {};


    const enderecoContato =
      resultadoFicha.data
        .endereco_contato || {};


    const historicoUmbanda =
      resultadoFicha.data
        .historico_umbanda || {};


    /* --------------------------------------
       LIMPAR ÁREAS
    -------------------------------------- */

    areaDadosPessoais.innerHTML =
      "";

    areaEnderecoContato.innerHTML =
      "";

    areaHistoricoUmbanda.innerHTML =
      "";


    /* --------------------------------------
       EXIBIR
    -------------------------------------- */

    mostrarDadosPessoais(
      dadosPessoais
    );


    mostrarEnderecoContato(
      enderecoContato
    );


    mostrarHistoricoUmbanda(
      historicoUmbanda
    );


    /* --------------------------------------
       FOTO
    -------------------------------------- */

    if (
      usuario.foto_path
    ) {

      const resultadoFoto =
        await window.supabaseClient.storage
          .from(
            "fotos-associados"
          )
          .createSignedUrl(
            usuario.foto_path,
            60 * 60
          );


      if (
        resultadoFoto.error
      ) {

        throw resultadoFoto.error;

      }


      const urlFoto =
        resultadoFoto.data?.signedUrl;


      if (
        urlFoto
      ) {

        fotoAssociadoFicha.src =
          urlFoto;

        fotoAssociadoFicha.hidden =
          false;

        fotoAssociadoFichaPadrao.hidden =
          true;

      }

    }


  } catch (erro) {

    console.error(
      "Erro ao carregar ficha do associado:",
      erro
    );


    mostrarMensagem(
      "Não foi possível carregar a ficha do associado."
    );

  }

}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

carregarFichaAssociado();
