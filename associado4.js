"use strict";

const CHAVE_FICHA = "tufra_ficha_associado";

const areaDadosPessoais = document.getElementById(
  "revisaoDadosPessoais"
);

const areaEnderecoContato = document.getElementById(
  "revisaoEnderecoContato"
);

const areaHistoricoUmbanda = document.getElementById(
  "revisaoHistoricoUmbanda"
);

const avisoFichaIncompleta = document.getElementById(
  "mensagemFichaIncompleta"
);

const campoConfirmacao = document.getElementById(
  "confirmarDados"
);

const erroConfirmacao = document.getElementById(
  "erroConfirmacaoDados"
);

const botaoFinalizar = document.getElementById(
  "botaoFinalizarFicha"
);

function carregarFicha() {
  try {
    const dados = sessionStorage.getItem(CHAVE_FICHA);

    return dados ? JSON.parse(dados) : {};
  } catch (erro) {
    console.error("Erro ao carregar ficha:", erro);
    return {};
  }
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

function fichaEstaCompleta(ficha) {
  return Boolean(
    ficha.dadosPessoais &&
    ficha.enderecoContato &&
    ficha.historicoUmbanda
  );
}

function carregarRevisao() {
  const ficha = carregarFicha();

  if (!fichaEstaCompleta(ficha)) {
    avisoFichaIncompleta.hidden = false;
    campoConfirmacao.disabled = true;
    botaoFinalizar.disabled = true;
  }

  mostrarDadosPessoais(
    ficha.dadosPessoais ?? {}
  );

  mostrarEnderecoContato(
    ficha.enderecoContato ?? {}
  );

  mostrarHistoricoUmbanda(
    ficha.historicoUmbanda ?? {}
  );
}

function atualizarBotaoFinalizar() {
  botaoFinalizar.disabled =
    !campoConfirmacao.checked;

  erroConfirmacao.textContent = "";
}

async function finalizarFicha() {
  if (!campoConfirmacao.checked) {
    erroConfirmacao.textContent =
      "Confirme que revisou os dados.";

    return;
  }

  const ficha = carregarFicha();

  if (!fichaEstaCompleta(ficha)) {
    avisoFichaIncompleta.hidden = false;
    return;
  }

  if (!window.supabaseClient) {
    erroConfirmacao.textContent =
      "Não foi possível conectar ao banco de dados.";

    return;
  }

  botaoFinalizar.disabled = true;
  botaoFinalizar.textContent = "FINALIZANDO...";

try {
  const usuarioSalvo = sessionStorage.getItem(
    "tufra_usuario_logado"
  );

  if (!usuarioSalvo) {
    throw new Error(
      "Usuário logado não encontrado."
    );
  }

  const usuario = JSON.parse(usuarioSalvo);

  const resultadoUsuario =
    await window.supabaseClient
      .from("usuarios")
      .select("id")
      .eq("auth_id", usuario.authId)
      .single();

  if (resultadoUsuario.error) {
    throw resultadoUsuario.error;
  }

  const resultadoFicha =
    await window.supabaseClient
      .from("fichas_associados")
      .upsert(
        {
          usuario_id: resultadoUsuario.data.id,
          dados_pessoais:
            ficha.dadosPessoais,
          endereco_contato:
            ficha.enderecoContato,
          historico_umbanda:
            ficha.historicoUmbanda,
          atualizado_em:
            new Date().toISOString()
        },
        {
          onConflict: "usuario_id"
        }
      );

  if (resultadoFicha.error) {
    throw resultadoFicha.error;
  }

  const resultado =
    await window.supabaseClient.rpc(
      "finalizar_ficha_tufra"
    );

  if (resultado.error) {
    throw resultado.error;
  }

  ficha.statusFicha = "Concluída";
    ficha.statusUsuario = "Ativo";
    ficha.dataConclusao = new Date().toISOString();

    sessionStorage.setItem(
      CHAVE_FICHA,
      JSON.stringify(ficha)
    );

    if (usuarioSalvo) {
      const usuario = JSON.parse(usuarioSalvo);

      usuario.status = "ativo";
      usuario.fichaConcluida = true;

      sessionStorage.setItem(
        "tufra_usuario_logado",
        JSON.stringify(usuario)
      );
    }

    window.location.href =
      "associado-sucesso.html";
  } catch (erro) {
    console.error(
      "Erro ao finalizar a ficha:",
      erro
    );

    erroConfirmacao.textContent =
      "Não foi possível finalizar o cadastro. Tente novamente.";

    botaoFinalizar.disabled = false;
    botaoFinalizar.textContent =
      "Finalizar cadastro";
  }
}

campoConfirmacao.addEventListener(
  "change",
  atualizarBotaoFinalizar
);

botaoFinalizar.addEventListener(
  "click",
  finalizarFicha
);

carregarRevisao();
atualizarBotaoFinalizar();
