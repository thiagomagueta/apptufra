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

const secaoMigracaoHistorica =
  document.getElementById(
    "secaoMigracaoHistorica"
  );

const listaCadastrosPendentes =
  document.getElementById(
    "listaCadastrosPendentes"
  );

const listaUsuariosAtivos =
  document.getElementById(
    "listaUsuariosAtivos"
  );

const listaMigracaoHistorica =
  document.getElementById(
    "listaMigracaoHistorica"
  );

const resumoMigracao =
  document.getElementById(
    "resumoMigracao"
  );

const painelVinculoHistorico =
  document.getElementById(
    "painelVinculoHistorico"
  );

const nomeUsuarioMigracao =
  document.getElementById(
    "nomeUsuarioMigracao"
  );

const campoBuscaHistorico =
  document.getElementById(
    "campoBuscaHistorico"
  );

const listaHistoricosDisponiveis =
  document.getElementById(
    "listaHistoricosDisponiveis"
  );

const botaoUsuarioNovo =
  document.getElementById(
    "botaoUsuarioNovo"
  );

const botaoCancelarMigracao =
  document.getElementById(
    "botaoCancelarMigracao"
  );


/* ==========================================
   ESTADO DA MIGRAÇÃO
========================================== */

let usuarioSelecionadoMigracao =
  null;

let historicosDisponiveis =
  [];


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


function esconderTodasSecoes() {

  secaoCadastrosPendentes.hidden =
    true;

  secaoAtribuirFuncoes.hidden =
    true;

  secaoMigracaoHistorica.hidden =
    true;

  painelVinculoHistorico.hidden =
    true;

}


function configurarSecao() {

  const secao =
    obterSecaoAtual();

  esconderTodasSecoes();


  if (
    secao === "pendentes"
  ) {

    tituloPermissoes.textContent =
      "Cadastros aguardando aprovação";

    subtituloPermissoes.textContent =
      "Analise e aprove os novos cadastros da TUFRA.";

    secaoCadastrosPendentes.hidden =
      false;

    return "pendentes";

  }


  if (
    secao === "funcoes"
  ) {

    tituloPermissoes.textContent =
      "Atribuir Funções";

    subtituloPermissoes.textContent =
      "Gerencie as funções dos usuários ativos.";

    secaoAtribuirFuncoes.hidden =
      false;

    return "funcoes";

  }


  if (
    secao === "migracao"
  ) {

    tituloPermissoes.textContent =
      "Migração Histórica";

    subtituloPermissoes.textContent =
      "Vincule cadastros ao histórico anterior ou marque usuários novos.";

    secaoMigracaoHistorica.hidden =
      false;

    return "migracao";

  }


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


function formatarData(
  data
) {

  if (
    !data
  ) {

    return "";

  }


  const partes =
    String(
      data
    ).split(
      "-"
    );


  if (
    partes.length !== 3
  ) {

    return data;

  }


  return `${partes[2]}/${partes[1]}/${partes[0]}`;

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
   ITEM MIGRAÇÃO
========================================== */

function criarItemMigracao(
  usuario
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


  const nome =
    document.createElement(
      "strong"
    );


  nome.textContent =
    formatarNome(
      usuario.nome_completo
    );


  const status =
    document.createElement(
      "span"
    );


  status.textContent =
    "Revisar histórico";


  dados.appendChild(
    nome
  );


  dados.appendChild(
    status
  );


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
    () => {

      abrirVinculoHistorico(
        usuario
      );

    }
  );


  return botao;

}


/* ==========================================
   LISTA MIGRAÇÃO
========================================== */

function preencherListaMigracao(
  usuarios
) {

  listaMigracaoHistorica.innerHTML =
    "";


  resumoMigracao.textContent =
    usuarios.length === 1
      ? "1 cadastro aguardando revisão."
      : `${usuarios.length} cadastros aguardando revisão.`;


  if (
    !usuarios.length
  ) {

    listaMigracaoHistorica.innerHTML =
      "<p>Nenhum cadastro aguardando revisão histórica.</p>";

    return;

  }


  usuarios.forEach(
    (usuario) => {

      listaMigracaoHistorica.appendChild(
        criarItemMigracao(
          usuario
        )
      );

    }
  );

}


/* ==========================================
   CARREGAR HISTÓRICOS
========================================== */

async function carregarHistoricosDisponiveis() {

  const resultado =
    await window.supabaseClient.rpc(
      "listar_historicos_migracao"
    );


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  historicosDisponiveis =
    resultado.data ||
    [];

}


/* ==========================================
   ABRIR VÍNCULO
========================================== */

async function abrirVinculoHistorico(
  usuario
) {

  usuarioSelecionadoMigracao =
    usuario;


  nomeUsuarioMigracao.textContent =
    formatarNome(
      usuario.nome_completo
    );


  campoBuscaHistorico.value =
    "";


  listaHistoricosDisponiveis.innerHTML =
    "<p>Carregando históricos...</p>";


  secaoMigracaoHistorica.hidden =
    true;


  painelVinculoHistorico.hidden =
    false;


  try {

    await carregarHistoricosDisponiveis();


    listaHistoricosDisponiveis.innerHTML =
      "<p>Digite parte do nome para pesquisar.</p>";


    campoBuscaHistorico.focus();


  } catch (erro) {

    console.error(
      "Erro ao carregar históricos:",
      erro
    );


    listaHistoricosDisponiveis.innerHTML =
      "<p>Não foi possível carregar a base histórica.</p>";

  }

}


/* ==========================================
   CANCELAR VÍNCULO
========================================== */

function cancelarVinculoHistorico() {

  usuarioSelecionadoMigracao =
    null;


  painelVinculoHistorico.hidden =
    true;


  secaoMigracaoHistorica.hidden =
    false;

}


/* ==========================================
   FILTRAR HISTÓRICOS
========================================== */

function filtrarHistoricos() {

  const busca =
    String(
      campoBuscaHistorico.value ||
      ""
    )
      .trim()
      .toLowerCase();


  listaHistoricosDisponiveis.innerHTML =
    "";


  if (
    busca.length < 2
  ) {

    listaHistoricosDisponiveis.innerHTML =
      "<p>Digite pelo menos 2 letras para pesquisar.</p>";

    return;

  }


  const encontrados =
    historicosDisponiveis
      .filter(
        (historico) => {

          return String(
            historico.nome_historico ||
            ""
          )
            .toLowerCase()
            .includes(
              busca
            );

        }
      )
      .slice(
        0,
        30
      );


  if (
    !encontrados.length
  ) {

    listaHistoricosDisponiveis.innerHTML =
      "<p>Nenhum nome encontrado.</p>";

    return;

  }


  encontrados.forEach(
    (historico) => {

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


      const nome =
        document.createElement(
          "strong"
        );


      nome.textContent =
        historico.nome_historico;


      dados.appendChild(
        nome
      );


      if (
        historico.data_entrada_tufra
      ) {

        const entrada =
          document.createElement(
            "span"
          );


        entrada.textContent =
          `Entrada: ${formatarData(
            historico.data_entrada_tufra
          )}`;


        dados.appendChild(
          entrada
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
        () => {

          confirmarVinculoHistorico(
            historico
          );

        }
      );


      listaHistoricosDisponiveis.appendChild(
        botao
      );

    }
  );

}


/* ==========================================
   CONFIRMAR VÍNCULO
========================================== */

async function confirmarVinculoHistorico(
  historico
) {

  if (
    !usuarioSelecionadoMigracao
  ) {

    return;

  }


  const confirmar =
    window.confirm(
      `Confirmar vínculo?\n\n` +
      `Cadastro APP:\n` +
      `${formatarNome(
        usuarioSelecionadoMigracao.nome_completo
      )}\n\n` +
      `Histórico:\n` +
      `${historico.nome_historico}`
    );


  if (
    !confirmar
  ) {

    return;

  }


  try {

    const resultado =
      await window.supabaseClient.rpc(
        "vincular_migracao_historica_manual",
        {
          p_usuario_id:
            usuarioSelecionadoMigracao.id,

          p_historico_id:
            historico.id
        }
      );


    if (
      resultado.error
    ) {

      throw resultado.error;

    }


    alert(
      "Histórico vinculado com sucesso."
    );


    usuarioSelecionadoMigracao =
      null;


    painelVinculoHistorico.hidden =
      true;


    secaoMigracaoHistorica.hidden =
      false;


    await carregarMigracaoHistorica();


  } catch (erro) {

    console.error(
      "Erro ao vincular histórico:",
      erro
    );


    alert(
      "Não foi possível vincular o histórico."
    );

  }

}


/* ==========================================
   USUÁRIO NOVO
========================================== */

async function marcarUsuarioNovo() {

  if (
    !usuarioSelecionadoMigracao
  ) {

    return;

  }


  const confirmar =
    window.confirm(
      `Confirmar que ${formatarNome(
        usuarioSelecionadoMigracao.nome_completo
      )} é um usuário novo e não possui histórico anterior?`
    );


  if (
    !confirmar
  ) {

    return;

  }


  try {

    const resultado =
      await window.supabaseClient.rpc(
        "marcar_migracao_como_novo",
        {
          p_usuario_id:
            usuarioSelecionadoMigracao.id
        }
      );


    if (
      resultado.error
    ) {

      throw resultado.error;

    }


    alert(
      "Usuário marcado como novo."
    );


    usuarioSelecionadoMigracao =
      null;


    painelVinculoHistorico.hidden =
      true;


    secaoMigracaoHistorica.hidden =
      false;


    await carregarMigracaoHistorica();


  } catch (erro) {

    console.error(
      "Erro ao marcar usuário novo:",
      erro
    );


    alert(
      "Não foi possível marcar o usuário como novo."
    );

  }

}


/* ==========================================
   PROCESSAR PENDENTES AUTOMATICAMENTE
========================================== */

async function processarMigracoesPendentes(
  usuarios
) {

  const pendentes =
    usuarios.filter(
      (usuario) => {

        return (
          usuario.ficha_concluida ===
            true &&
          String(
            usuario.status_migracao_historica ||
            ""
          ) ===
            "pendente"
        );

      }
    );


  for (
    const usuario
    of pendentes
  ) {

    const resultado =
      await window.supabaseClient.rpc(
        "verificar_migracao_historica",
        {
          p_usuario_id:
            usuario.id
        }
      );


    if (
      resultado.error
    ) {

      console.error(
        "Erro ao verificar migração de",
        usuario.nome_completo,
        resultado.error
      );

    }

  }

}


/* ==========================================
   CARREGAR MIGRAÇÃO
========================================== */

async function carregarMigracaoHistorica() {

  listaMigracaoHistorica.innerHTML =
    "<p>Carregando cadastros...</p>";


  try {

    /*
      Primeiro carregamos todos os usuários
      para verificar quem terminou a ficha
      e ainda está pendente.
    */

    const resultadoInicial =
      await window.supabaseClient
        .from(
          "usuarios"
        )
        .select(`
          id,
          nome_completo,
          ficha_concluida,
          status_migracao_historica
        `)
        .order(
          "nome_completo",
          {
            ascending:
              true
          }
        );


    if (
      resultadoInicial.error
    ) {

      throw resultadoInicial.error;

    }


    const usuariosIniciais =
      resultadoInicial.data ||
      [];


    /*
      Ao abrir a tela, processamos quem
      concluiu a ficha e ainda está pendente.

      Se o nome bater:
      -> vinculado automaticamente.

      Se não bater:
      -> revisar.
    */

    await processarMigracoesPendentes(
      usuariosIniciais
    );


    /*
      Carrega novamente após o processamento.
    */

    const resultadoFinal =
      await window.supabaseClient
        .from(
          "usuarios"
        )
        .select(`
          id,
          nome_completo,
          ficha_concluida,
          status_migracao_historica
        `)
        .eq(
          "ficha_concluida",
          true
        )
        .eq(
          "status_migracao_historica",
          "revisar"
        )
        .order(
          "nome_completo",
          {
            ascending:
              true
          }
        );


    if (
      resultadoFinal.error
    ) {

      throw resultadoFinal.error;

    }


    preencherListaMigracao(
      resultadoFinal.data ||
      []
    );


  } catch (erro) {

    console.error(
      "Erro ao carregar migração histórica:",
      erro
    );


    listaMigracaoHistorica.innerHTML =
      "<p>Não foi possível carregar a migração histórica.</p>";


    resumoMigracao.textContent =
      "Não foi possível carregar os dados.";

  }

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


    /*
      Migração possui rotina própria.
    */

    if (
      secao === "migracao"
    ) {

      await carregarMigracaoHistorica();

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


    if (
      secao === "migracao"
    ) {

      listaMigracaoHistorica.innerHTML =
        "<p>Não foi possível carregar a migração histórica.</p>";

    }

  }

}


/* ==========================================
   EVENTOS MIGRAÇÃO
========================================== */

if (
  campoBuscaHistorico
) {

  campoBuscaHistorico.addEventListener(
    "input",
    filtrarHistoricos
  );

}


if (
  botaoUsuarioNovo
) {

  botaoUsuarioNovo.addEventListener(
    "click",
    marcarUsuarioNovo
  );

}


if (
  botaoCancelarMigracao
) {

  botaoCancelarMigracao.addEventListener(
    "click",
    cancelarVinculoHistorico
  );

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
