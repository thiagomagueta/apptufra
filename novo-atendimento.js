"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const tipoAssociado =
  document.getElementById(
    "tipoAssociado"
  );

const tipoNaoAssociado =
  document.getElementById(
    "tipoNaoAssociado"
  );

const areaAssociado =
  document.getElementById(
    "areaAssociado"
  );

const areaNaoAssociado =
  document.getElementById(
    "areaNaoAssociado"
  );

const campoBuscaAssociado =
  document.getElementById(
    "campoBuscaAssociado"
  );

const resultadoBuscaAssociado =
  document.getElementById(
    "resultadoBuscaAssociado"
  );

const associadoSelecionado =
  document.getElementById(
    "associadoSelecionado"
  );

const nomeAssociadoSelecionado =
  document.getElementById(
    "nomeAssociadoSelecionado"
  );

const campoBuscaNaoAssociado =
  document.getElementById(
    "campoBuscaNaoAssociado"
  );

const resultadoBuscaNaoAssociado =
  document.getElementById(
    "resultadoBuscaNaoAssociado"
  );

const naoAssociadoSelecionado =
  document.getElementById(
    "naoAssociadoSelecionado"
  );

const nomeNaoAssociadoSelecionado =
  document.getElementById(
    "nomeNaoAssociadoSelecionado"
  );

const avisoNovoNaoAssociado =
  document.getElementById(
    "avisoNovoNaoAssociado"
  );

const dataAtendimento =
  document.getElementById(
    "dataAtendimento"
  );

const motivoAtendimento =
  document.getElementById(
    "motivoAtendimento"
  );

const relatoAtendimento =
  document.getElementById(
    "relatoAtendimento"
  );

const orientacaoAtendimento =
  document.getElementById(
    "orientacaoAtendimento"
  );

const precisaAcompanhamento =
  document.getElementById(
    "precisaAcompanhamento"
  );

const areaDataRetorno =
  document.getElementById(
    "areaDataRetorno"
  );

const dataRetorno =
  document.getElementById(
    "dataRetorno"
  );

const mensagemNovoAtendimento =
  document.getElementById(
    "mensagemNovoAtendimento"
  );

const botaoSalvarAtendimento =
  document.getElementById(
    "botaoSalvarAtendimento"
  );


/* ==========================================
   ESTADO
========================================== */

let usuarioLogadoId =
  null;

let associadoEscolhido =
  null;

let naoAssociadoEscolhido =
  null;

let temporizadorBuscaAssociado =
  null;

let temporizadorBuscaNaoAssociado =
  null;


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


function normalizarTexto(
  texto
) {

  return String(
    texto || ""
  )
    .normalize(
      "NFD"
    )
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim();

}


/* ==========================================
   DATA ATUAL
========================================== */

function definirDataAtual() {

  const agora =
    new Date();


  const ano =
    agora.getFullYear();


  const mes =
    String(
      agora.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const dia =
    String(
      agora.getDate()
    ).padStart(
      2,
      "0"
    );


  dataAtendimento.value =
    `${ano}-${mes}-${dia}`;

}


/* ==========================================
   MENSAGENS
========================================== */

function mostrarMensagem(
  texto
) {

  mensagemNovoAtendimento.textContent =
    texto;


  mensagemNovoAtendimento.hidden =
    false;

}


function esconderMensagem() {

  mensagemNovoAtendimento.textContent =
    "";


  mensagemNovoAtendimento.hidden =
    true;

}


/* ==========================================
   LIMPAR SELEÇÕES
========================================== */

function limparAssociadoSelecionado() {

  associadoEscolhido =
    null;


  associadoSelecionado.hidden =
    true;


  nomeAssociadoSelecionado.textContent =
    "";

}


function limparNaoAssociadoSelecionado() {

  naoAssociadoEscolhido =
    null;


  naoAssociadoSelecionado.hidden =
    true;


  nomeNaoAssociadoSelecionado.textContent =
    "";

}


/* ==========================================
   TIPO DE PESSOA
========================================== */

function atualizarTipoPessoa() {

  esconderMensagem();


  if (
    tipoAssociado.checked
  ) {

    areaAssociado.hidden =
      false;


    areaNaoAssociado.hidden =
      true;


    campoBuscaNaoAssociado.value =
      "";


    resultadoBuscaNaoAssociado.innerHTML =
      "<p>Digite pelo menos 2 letras para procurar.</p>";


    limparNaoAssociadoSelecionado();


    avisoNovoNaoAssociado.hidden =
      true;


    return;

  }


  areaAssociado.hidden =
    true;


  areaNaoAssociado.hidden =
    false;


  campoBuscaAssociado.value =
    "";


  resultadoBuscaAssociado.innerHTML =
    "<p>Digite o nome do associado.</p>";


  limparAssociadoSelecionado();

}


/* ==========================================
   CRIAR ITEM DE RESULTADO
========================================== */

function criarBotaoResultado(
  nome,
  descricao,
  acao
) {

  const botao =
    document.createElement(
      "button"
    );


  botao.type =
    "button";


  botao.className =
    "item-permissao-lista";


  botao.style.width =
    "100%";


  botao.style.border =
    "0";


  botao.style.background =
    "transparent";


  botao.style.cursor =
    "pointer";


  botao.style.textAlign =
    "left";


  const dados =
    document.createElement(
      "div"
    );


  dados.className =
    "dados-permissao-lista";


  const nomeElemento =
    document.createElement(
      "strong"
    );


  nomeElemento.textContent =
    formatarNome(
      nome
    );


  dados.appendChild(
    nomeElemento
  );


  if (
    descricao
  ) {

    const descricaoElemento =
      document.createElement(
        "span"
      );


    descricaoElemento.textContent =
      descricao;


    dados.appendChild(
      descricaoElemento
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


  botao.appendChild(
    dados
  );


  botao.appendChild(
    seta
  );


  botao.addEventListener(
    "click",
    acao
  );


  return botao;

}


/* ==========================================
   BUSCAR ASSOCIADOS
========================================== */

async function buscarAssociados() {

  const busca =
    campoBuscaAssociado.value.trim();


  limparAssociadoSelecionado();


  resultadoBuscaAssociado.innerHTML =
    "";


  if (
    busca.length < 2
  ) {

    resultadoBuscaAssociado.innerHTML =
      "<p>Digite pelo menos 2 letras para pesquisar.</p>";

    return;

  }


  resultadoBuscaAssociado.innerHTML =
    "<p>Pesquisando...</p>";


  try {

    const resultado =
      await window.supabaseClient
        .from(
          "usuarios"
        )
        .select(`
          id,
          nome_completo,
          status
        `)
        .eq(
          "status",
          "ativo"
        )
        .ilike(
          "nome_completo",
          `%${busca}%`
        )
        .order(
          "nome_completo",
          {
            ascending: true
          }
        )
        .limit(
          30
        );


    if (
      resultado.error
    ) {

      throw resultado.error;

    }


    const associados =
      resultado.data ||
      [];


    resultadoBuscaAssociado.innerHTML =
      "";


    if (
      !associados.length
    ) {

      resultadoBuscaAssociado.innerHTML =
        "<p>Nenhum associado encontrado.</p>";

      return;

    }


    associados.forEach(
      (associado) => {

        const botao =
          criarBotaoResultado(
            associado.nome_completo,
            "Associado",
            () => {

              associadoEscolhido =
                associado;


              campoBuscaAssociado.value =
                formatarNome(
                  associado.nome_completo
                );


              nomeAssociadoSelecionado.textContent =
                formatarNome(
                  associado.nome_completo
                );


              associadoSelecionado.hidden =
                false;


              resultadoBuscaAssociado.innerHTML =
                "";

            }
          );


        resultadoBuscaAssociado.appendChild(
          botao
        );

      }
    );


  } catch (erro) {

    console.error(
      "Erro ao pesquisar associados:",
      erro
    );


    resultadoBuscaAssociado.innerHTML =
      "<p>Não foi possível pesquisar os associados.</p>";

  }

}


/* ==========================================
   BUSCAR NÃO ASSOCIADOS
========================================== */

async function buscarNaoAssociados() {

  const busca =
    campoBuscaNaoAssociado.value.trim();


  limparNaoAssociadoSelecionado();


  avisoNovoNaoAssociado.hidden =
    true;


  resultadoBuscaNaoAssociado.innerHTML =
    "";


  if (
    busca.length < 2
  ) {

    resultadoBuscaNaoAssociado.innerHTML =
      "<p>Digite pelo menos 2 letras para procurar.</p>";

    return;

  }


  resultadoBuscaNaoAssociado.innerHTML =
    "<p>Pesquisando...</p>";


  try {

    const resultado =
      await window.supabaseClient
        .from(
          "pessoas_atendimentos"
        )
        .select(`
          id,
          nome_completo
        `)
        .ilike(
          "nome_completo",
          `%${busca}%`
        )
        .order(
          "nome_completo",
          {
            ascending: true
          }
        )
        .limit(
          30
        );


    if (
      resultado.error
    ) {

      throw resultado.error;

    }


    const pessoas =
      resultado.data ||
      [];


    resultadoBuscaNaoAssociado.innerHTML =
      "";


    pessoas.forEach(
      (pessoa) => {

        const botao =
          criarBotaoResultado(
            pessoa.nome_completo,
            "Não associado",
            () => {

              naoAssociadoEscolhido =
                pessoa;


              campoBuscaNaoAssociado.value =
                formatarNome(
                  pessoa.nome_completo
                );


              nomeNaoAssociadoSelecionado.textContent =
                formatarNome(
                  pessoa.nome_completo
                );


              naoAssociadoSelecionado.hidden =
                false;


              avisoNovoNaoAssociado.hidden =
                true;


              resultadoBuscaNaoAssociado.innerHTML =
                "";

            }
          );


        resultadoBuscaNaoAssociado.appendChild(
          botao
        );

      }
    );


    const nomeExatoExiste =
      pessoas.some(
        (pessoa) => {

          return (
            normalizarTexto(
              pessoa.nome_completo
            ) ===
            normalizarTexto(
              busca
            )
          );

        }
      );


    if (
      !nomeExatoExiste
    ) {

      avisoNovoNaoAssociado.hidden =
        false;

    }


    if (
      !pessoas.length
    ) {

      resultadoBuscaNaoAssociado.innerHTML =
        "<p>Nenhuma pessoa já cadastrada com esse nome.</p>";

    }


  } catch (erro) {

    console.error(
      "Erro ao pesquisar pessoas não associadas:",
      erro
    );


    resultadoBuscaNaoAssociado.innerHTML =
      "<p>Não foi possível pesquisar as pessoas.</p>";

  }

}


/* ==========================================
   CRIAR PESSOA NÃO ASSOCIADA
========================================== */

async function criarPessoaNaoAssociada() {

  const nome =
    formatarNome(
      campoBuscaNaoAssociado.value
    );


  if (
    nome.length < 2
  ) {

    throw new Error(
      "Informe o nome da pessoa atendida."
    );

  }


  const resultado =
    await window.supabaseClient
      .from(
        "pessoas_atendimentos"
      )
      .insert({
        nome_completo:
          nome,

        criado_por:
          usuarioLogadoId
      })
      .select(`
        id,
        nome_completo
      `)
      .single();


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  return resultado.data;

}


/* ==========================================
   VALIDAÇÃO
========================================== */

function validarFormulario() {

  if (
    !dataAtendimento.value
  ) {

    mostrarMensagem(
      "Informe a data do atendimento."
    );

    return false;

  }


  if (
    tipoAssociado.checked &&
    !associadoEscolhido
  ) {

    mostrarMensagem(
      "Selecione o associado atendido."
    );

    return false;

  }


  if (
    tipoNaoAssociado.checked &&
    !naoAssociadoEscolhido &&
    campoBuscaNaoAssociado.value.trim().length < 2
  ) {

    mostrarMensagem(
      "Informe o nome da pessoa atendida."
    );

    return false;

  }


  if (
    !relatoAtendimento.value.trim()
  ) {

    mostrarMensagem(
      "Preencha o relato do atendimento."
    );

    return false;

  }


  if (
    !orientacaoAtendimento.value.trim()
  ) {

    mostrarMensagem(
      "Preencha a orientação / conduta."
    );

    return false;

  }


  return true;

}


/* ==========================================
   SALVAR ATENDIMENTO
========================================== */

async function salvarAtendimento() {

  esconderMensagem();


  if (
    !validarFormulario()
  ) {

    return;

  }


  botaoSalvarAtendimento.disabled =
    true;


  botaoSalvarAtendimento.textContent =
    "SALVANDO...";


  try {

    let usuarioAtendidoId =
      null;


    let pessoaNaoAssociadaId =
      null;


    /* ======================================
       ASSOCIADO
    ====================================== */

    if (
      tipoAssociado.checked
    ) {

      usuarioAtendidoId =
        associadoEscolhido.id;

    }


    /* ======================================
       NÃO ASSOCIADO
    ====================================== */

    if (
      tipoNaoAssociado.checked
    ) {

      if (
        naoAssociadoEscolhido
      ) {

        pessoaNaoAssociadaId =
          naoAssociadoEscolhido.id;

      } else {

        const novaPessoa =
          await criarPessoaNaoAssociada();


        pessoaNaoAssociadaId =
          novaPessoa.id;

      }

    }


    /* ======================================
       REGISTRAR ATENDIMENTO
    ====================================== */

    const resultado =
      await window.supabaseClient
        .from(
          "atendimentos"
        )
        .insert({

          usuario_id:
            usuarioAtendidoId,

          pessoa_nao_associada_id:
            pessoaNaoAssociadaId,

          data_atendimento:
            dataAtendimento.value,

          motivo:
            motivoAtendimento.value.trim() ||
            null,

          relato:
            relatoAtendimento.value.trim(),

          orientacao_conduta:
            orientacaoAtendimento.value.trim(),

          precisa_acompanhamento:
            precisaAcompanhamento.checked,

          data_retorno:
            precisaAcompanhamento.checked &&
            dataRetorno.value
              ? dataRetorno.value
              : null,

          responsavel_id:
            usuarioLogadoId

        });


    if (
      resultado.error
    ) {

      throw resultado.error;

    }


    mostrarMensagem(
      "Atendimento salvo com sucesso."
    );


    botaoSalvarAtendimento.textContent =
      "Atendimento salvo";


    setTimeout(
      () => {

        window.location.href =
          "adm-atendimentos.html";

      },
      1200
    );


  } catch (erro) {

    console.error(
      "Erro ao salvar atendimento:",
      erro
    );


    mostrarMensagem(
      erro.message ||
      "Não foi possível salvar o atendimento."
    );


    botaoSalvarAtendimento.disabled =
      false;


    botaoSalvarAtendimento.textContent =
      "Salvar atendimento";

  }

}


/* ==========================================
   ACOMPANHAMENTO
========================================== */

function atualizarAcompanhamento() {

  areaDataRetorno.hidden =
    !precisaAcompanhamento.checked;


  if (
    !precisaAcompanhamento.checked
  ) {

    dataRetorno.value =
      "";

  }

}


/* ==========================================
   USUÁRIO LOGADO E PERMISSÃO
========================================== */

async function carregarUsuarioLogado() {

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

    return false;

  }


  const resultadoUsuario =
    await window.supabaseClient
      .from(
        "usuarios"
      )
      .select(`
        id
      `)
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


  usuarioLogadoId =
    resultadoUsuario.data.id;


  const resultadoPermissao =
    await window.supabaseClient
      .from(
        "responsaveis_atendimentos"
      )
      .select(
        "id"
      )
      .eq(
        "usuario_id",
        usuarioLogadoId
      )
      .maybeSingle();


  if (
    resultadoPermissao.error
  ) {

    throw resultadoPermissao.error;

  }


  if (
    !resultadoPermissao.data
  ) {

    window.location.href =
      "administrativo.html";

    return false;

  }


  return true;

}


/* ==========================================
   EVENTOS
========================================== */

tipoAssociado.addEventListener(
  "change",
  atualizarTipoPessoa
);


tipoNaoAssociado.addEventListener(
  "change",
  atualizarTipoPessoa
);


campoBuscaAssociado.addEventListener(
  "input",
  () => {

    limparAssociadoSelecionado();


    clearTimeout(
      temporizadorBuscaAssociado
    );


    temporizadorBuscaAssociado =
      setTimeout(
        buscarAssociados,
        300
      );

  }
);


campoBuscaNaoAssociado.addEventListener(
  "input",
  () => {

    limparNaoAssociadoSelecionado();


    clearTimeout(
      temporizadorBuscaNaoAssociado
    );


    temporizadorBuscaNaoAssociado =
      setTimeout(
        buscarNaoAssociados,
        300
      );

  }
);


precisaAcompanhamento.addEventListener(
  "change",
  atualizarAcompanhamento
);


botaoSalvarAtendimento.addEventListener(
  "click",
  salvarAtendimento
);


/* ==========================================
   INICIALIZAÇÃO
========================================== */

async function iniciarPagina() {

  if (
    !window.supabaseClient
  ) {

    mostrarMensagem(
      "Não foi possível conectar ao banco de dados."
    );

    return;

  }


  definirDataAtual();


  atualizarTipoPessoa();


  atualizarAcompanhamento();


  try {

    const autorizado =
      await carregarUsuarioLogado();


    if (
      !autorizado
    ) {

      return;

    }


    botaoSalvarAtendimento.disabled =
      false;


  } catch (erro) {

    console.error(
      "Erro ao iniciar Novo Atendimento:",
      erro
    );


    mostrarMensagem(
      "Não foi possível carregar esta tela."
    );

  }

}


/* ==========================================
   INICIAR
========================================== */

iniciarPagina();
