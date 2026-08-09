"use strict";

const CHAVE_FICHA = "tufra_ficha_associado";

const areaDadosPessoais = document.getElementById(
  "minhaFichaDadosPessoais"
);

const areaEnderecoContato = document.getElementById(
  "minhaFichaEnderecoContato"
);
const fotoUsuarioFicha = document.getElementById(
  "fotoUsuarioFicha"
);

const fotoUsuarioFichaPadrao = document.getElementById(
  "fotoUsuarioFichaPadrao"
);
const areaHistoricoUmbanda = document.getElementById(
  "minhaFichaHistoricoUmbanda"
);

const mensagemMinhaFicha = document.getElementById(
  "mensagemMinhaFicha"
);

function mostrarMensagem(texto) {
  mensagemMinhaFicha.textContent = texto;
  mensagemMinhaFicha.hidden = false;
}

function valorOuTraco(valor) {
  if (
    valor === undefined ||
    valor === null ||
    valor === ""
  ) {
    return "Não informado";
  }

  return String(valor);
}

function adicionarItem(area, titulo, valor) {
  const item = document.createElement("div");
  item.className = "item-revisao";

  const rotulo = document.createElement("span");
  rotulo.textContent = titulo;

  const conteudo = document.createElement("strong");
  conteudo.textContent = valorOuTraco(valor);

  item.appendChild(rotulo);
  item.appendChild(conteudo);

  area.appendChild(item);
}

function mostrarDadosPessoais(dados) {
  adicionarItem(areaDadosPessoais, "Nome", dados.nome);
  adicionarItem(
    areaDadosPessoais,
    "Data de nascimento",
    dados.nascimento
  );
  adicionarItem(areaDadosPessoais, "Idade", dados.idade);

  adicionarItem(
    areaDadosPessoais,
    "Naturalidade",
    dados.cidadeNascimento && dados.estadoNascimento
      ? `${dados.cidadeNascimento} - ${dados.estadoNascimento}`
      : ""
  );

  adicionarItem(
    areaDadosPessoais,
    "Gênero",
    dados.genero === "Outro / Autodeclarado"
      ? dados.generoAutodeclarado
      : dados.genero
  );

  adicionarItem(
    areaDadosPessoais,
    "Nacionalidade",
    dados.nacionalidade
  );

  adicionarItem(areaDadosPessoais, "RG", dados.rg);
  adicionarItem(areaDadosPessoais, "CPF", dados.cpf);
}

function mostrarEnderecoContato(dados) {
  adicionarItem(areaEnderecoContato, "CEP", dados.cep);
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
    dados.cidade && dados.estado
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

function mostrarHistoricoUmbanda(dados) {
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

  if (dados.participouOutrosTerreiros === "Sim") {
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

  if (dados.batizadoUmbanda === "Sim") {
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
      dados.cidadeBatismo && dados.estadoBatismo
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
        ).padStart(2, "0")}`
      : ""
  );
}

async function carregarMinhaFicha() {
  if (!window.supabaseClient) {
    mostrarMensagem(
      "Não foi possível conectar ao banco de dados."
    );

    return;
  }

  try {
    const resultadoSessao =
      await window.supabaseClient.auth.getSession();

    if (resultadoSessao.error) {
      throw resultadoSessao.error;
    }

    const sessao = resultadoSessao.data.session;

    if (!sessao) {
      window.location.href = "index.html";
      return;
    }

    const resultadoUsuario =
      await window.supabaseClient
        .from("usuarios")
        .select("id")
        .eq("auth_id", sessao.user.id)
        .single();

    if (resultadoUsuario.error) {
      throw resultadoUsuario.error;
    }

    const resultadoFicha =
      await window.supabaseClient
        .from("fichas_associados")
        .select(
          "dados_pessoais, endereco_contato, historico_umbanda"
        )
        .eq(
          "usuario_id",
          resultadoUsuario.data.id
        )
        .maybeSingle();

    if (resultadoFicha.error) {
      throw resultadoFicha.error;
    }

    if (!resultadoFicha.data) {
      mostrarMensagem(
        "Sua ficha ainda não foi encontrada."
      );

      return;
    }

    const ficha = {
      dadosPessoais:
        resultadoFicha.data.dados_pessoais || {},

      enderecoContato:
        resultadoFicha.data.endereco_contato || {},

      historicoUmbanda:
        resultadoFicha.data.historico_umbanda || {}
    };

    sessionStorage.setItem(
      CHAVE_FICHA,
      JSON.stringify(ficha)
    );

    mostrarDadosPessoais(ficha.dadosPessoais);
    mostrarEnderecoContato(ficha.enderecoContato);
    mostrarHistoricoUmbanda(ficha.historicoUmbanda);
  } catch (erro) {
    console.error(
      "Erro ao carregar a ficha:",
      erro
    );

    mostrarMensagem(
      "Não foi possível carregar sua ficha."
    );
  }
}

carregarMinhaFicha();
