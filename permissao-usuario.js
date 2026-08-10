"use strict";

/* ==========================================
   ELEMENTOS DA TELA
========================================== */

const tituloPermissaoUsuario =
  document.getElementById(
    "tituloPermissaoUsuario"
  );

const subtituloPermissaoUsuario =
  document.getElementById(
    "subtituloPermissaoUsuario"
  );

const nomeUsuarioPermissao =
  document.getElementById(
    "nomeUsuarioPermissao"
  );

const emailUsuarioPermissao =
  document.getElementById(
    "emailUsuarioPermissao"
  );

const statusUsuarioPermissao =
  document.getElementById(
    "statusUsuarioPermissao"
  );

const fotoUsuarioPermissao =
  document.getElementById(
    "fotoUsuarioPermissao"
  );

const fotoUsuarioPermissaoPadrao =
  document.getElementById(
    "fotoUsuarioPermissaoPadrao"
  );

const listaFuncoesPermissao =
  document.getElementById(
    "listaFuncoesPermissao"
  );

const areaAprovacaoCadastro =
  document.getElementById(
    "areaAprovacaoCadastro"
  );

const botaoAprovarCadastro =
  document.getElementById(
    "botaoAprovarCadastro"
  );

const areaSalvarFuncoes =
  document.getElementById(
    "areaSalvarFuncoes"
  );

const botaoSalvarFuncoes =
  document.getElementById(
    "botaoSalvarFuncoes"
  );

const mensagemSalvarFuncoes =
  document.getElementById(
    "mensagemSalvarFuncoes"
  );


/* ==========================================
   PARÂMETROS DA PÁGINA
========================================== */

function obterParametros() {
  const parametros =
    new URLSearchParams(
      window.location.search
    );

  return {
    usuarioId:
      parametros.get("id"),

    tipo:
      parametros.get("tipo")
  };
}


/* ==========================================
   FORMATAÇÃO
========================================== */

function formatarNome(nomeCompleto) {
  return String(nomeCompleto || "")
    .trim()
    .toLowerCase()
    .replace(
      /\b\p{L}/gu,
      (letra) =>
        letra.toUpperCase()
    );
}


/* ==========================================
   FOTO
========================================== */

async function carregarFoto(
  fotoPath
) {
  if (!fotoPath) {
    return;
  }

  try {
    const resultadoFoto =
      await window.supabaseClient.storage
        .from("fotos-associados")
        .createSignedUrl(
          fotoPath,
          60 * 60
        );

    if (
      resultadoFoto.error ||
      !resultadoFoto.data?.signedUrl
    ) {
      return;
    }

    fotoUsuarioPermissao.src =
      resultadoFoto.data.signedUrl;

    fotoUsuarioPermissao.hidden =
      false;

    fotoUsuarioPermissaoPadrao.hidden =
      true;

  } catch (erro) {
    console.error(
      "Erro ao carregar foto:",
      erro
    );
  }
}


/* ==========================================
   CHECKBOX DAS FUNÇÕES
========================================== */

function criarCheckboxFuncao(
  funcao,
  funcoesUsuario
) {
  const linha =
    document.createElement("label");

  linha.className =
    funcao.funcao_pai_id
      ? "linha-funcao linha-subfuncao"
      : "linha-funcao";

  const checkbox =
    document.createElement("input");

  checkbox.type = "checkbox";

  checkbox.value =
    funcao.id;

  checkbox.dataset.funcaoId =
    funcao.id;

  checkbox.checked =
    funcoesUsuario.includes(
      funcao.id
    );

  const texto =
    document.createElement("span");

  texto.textContent =
    funcao.nome;

  linha.appendChild(
    checkbox
  );

  linha.appendChild(
    texto
  );

  return linha;
}


/* ==========================================
   MONTA A ÁRVORE DE FUNÇÕES
========================================== */

function montarListaFuncoes(
  funcoes,
  funcoesUsuario
) {
  listaFuncoesPermissao.innerHTML =
    "";

  const principais =
    funcoes
      .filter(
        (funcao) =>
          !funcao.funcao_pai_id
      )
      .sort(
        (a, b) =>
          a.ordem - b.ordem
      );

  principais.forEach(
    (funcaoPrincipal) => {

      const bloco =
        document.createElement("div");

      bloco.className =
        "bloco-funcao-permissao";

      bloco.appendChild(
        criarCheckboxFuncao(
          funcaoPrincipal,
          funcoesUsuario
        )
      );

      const filhas =
        funcoes
          .filter(
            (funcao) =>
              funcao.funcao_pai_id ===
              funcaoPrincipal.id
          )
          .sort(
            (a, b) =>
              a.ordem - b.ordem
          );

      filhas.forEach(
        (funcaoFilha) => {

          bloco.appendChild(
            criarCheckboxFuncao(
              funcaoFilha,
              funcoesUsuario
            )
          );

        }
      );

      listaFuncoesPermissao.appendChild(
        bloco
      );

    }
  );
}


/* ==========================================
   CARREGA AS FUNÇÕES
========================================== */

async function carregarFuncoes(
  usuarioId
) {
  const resultadoFuncoes =
    await window.supabaseClient
      .from("funcoes")
      .select(`
        id,
        nome,
        ordem,
        ativo,
        funcao_pai_id
      `)
      .eq(
        "ativo",
        true
      );

  if (resultadoFuncoes.error) {
    throw resultadoFuncoes.error;
  }

  const resultadoFuncoesUsuario =
    await window.supabaseClient
      .from("usuario_funcoes")
      .select("funcao_id")
      .eq(
        "usuario_id",
        usuarioId
      );

  if (
    resultadoFuncoesUsuario.error
  ) {
    throw resultadoFuncoesUsuario.error;
  }

  const funcoesUsuario =
    (
      resultadoFuncoesUsuario.data ||
      []
    ).map(
      (item) =>
        item.funcao_id
    );

  montarListaFuncoes(
    resultadoFuncoes.data || [],
    funcoesUsuario
  );
}


/* ==========================================
   FUNÇÕES MARCADAS
========================================== */

function obterFuncoesMarcadas() {
  return Array.from(
    listaFuncoesPermissao.querySelectorAll(
      'input[type="checkbox"]:checked'
    )
  ).map(
    (checkbox) =>
      checkbox.dataset.funcaoId
  );
}


/* ==========================================
   DESCOBRE QUEM ESTÁ ADMINISTRANDO
========================================== */

async function obterUsuarioAdministrador() {
  const resultadoSessao =
    await window.supabaseClient.auth
      .getSession();

  if (resultadoSessao.error) {
    throw resultadoSessao.error;
  }

  const sessao =
    resultadoSessao.data.session;

  if (!sessao) {
    window.location.href =
      "index.html";

    throw new Error(
      "Sessão não encontrada."
    );
  }

  const resultadoUsuario =
    await window.supabaseClient
      .from("usuarios")
      .select("id")
      .eq(
        "auth_id",
        sessao.user.id
      )
      .maybeSingle();

  if (resultadoUsuario.error) {
    throw resultadoUsuario.error;
  }

  if (!resultadoUsuario.data) {
    throw new Error(
      "Usuário administrador não encontrado."
    );
  }

  return resultadoUsuario.data.id;
}


/* ==========================================
   SINCRONIZA FUNÇÕES DO USUÁRIO
========================================== */

async function sincronizarFuncoesUsuario(
  usuarioId,
  atribuidoPor
) {
  const resultadoAtuais =
    await window.supabaseClient
      .from("usuario_funcoes")
      .select(`
        id,
        funcao_id
      `)
      .eq(
        "usuario_id",
        usuarioId
      );

  if (resultadoAtuais.error) {
    throw resultadoAtuais.error;
  }

  const atuais =
    resultadoAtuais.data || [];

  const marcadas =
    obterFuncoesMarcadas();

  const adicionar =
    marcadas.filter(
      (funcaoId) =>
        !atuais.some(
          (item) =>
            item.funcao_id ===
            funcaoId
        )
    );

  const remover =
    atuais.filter(
      (item) =>
        !marcadas.includes(
          item.funcao_id
        )
    );

  for (const item of remover) {

    const resultadoRemocao =
      await window.supabaseClient
        .from("usuario_funcoes")
        .delete()
        .eq(
          "id",
          item.id
        );

    if (
      resultadoRemocao.error
    ) {
      throw resultadoRemocao.error;
    }

  }

  if (adicionar.length > 0) {

    const novosRegistros =
      adicionar.map(
        (funcaoId) => ({
          usuario_id:
            usuarioId,

          funcao_id:
            funcaoId,

          atribuido_por:
            atribuidoPor
        })
      );

    const resultadoInsercao =
      await window.supabaseClient
        .from("usuario_funcoes")
        .insert(
          novosRegistros
        );

    if (
      resultadoInsercao.error
    ) {
      throw resultadoInsercao.error;
    }

  }
}


/* ==========================================
   SALVAR FUNÇÕES DE USUÁRIO ATIVO
========================================== */

async function salvarFuncoesUsuario() {
  const {
    usuarioId,
    tipo
  } = obterParametros();

  if (
    !usuarioId ||
    tipo !== "ativo"
  ) {
    return;
  }

  mensagemSalvarFuncoes.textContent =
    "";

  botaoSalvarFuncoes.disabled =
    true;

  botaoSalvarFuncoes.textContent =
    "SALVANDO...";

  try {

    const atribuidoPor =
      await obterUsuarioAdministrador();

    await sincronizarFuncoesUsuario(
      usuarioId,
      atribuidoPor
    );

    mensagemSalvarFuncoes.textContent =
      "Funções atualizadas com sucesso.";

    botaoSalvarFuncoes.textContent =
      "Salvo";

    setTimeout(() => {

      window.location.href =
        "permissoes.html";

    }, 900);

  } catch (erro) {

    console.error(
      "Erro ao salvar funções:",
      erro
    );

    mensagemSalvarFuncoes.textContent =
      "Não foi possível salvar as funções.";

    botaoSalvarFuncoes.disabled =
      false;

    botaoSalvarFuncoes.textContent =
      "Salvar funções";

  }
}


/* ==========================================
   APROVAR NOVO CADASTRO
========================================== */

async function aprovarCadastro() {
  const {
    usuarioId,
    tipo
  } = obterParametros();

  if (
    !usuarioId ||
    tipo !== "pendente"
  ) {
    return;
  }

  const funcoesMarcadas =
    obterFuncoesMarcadas();

  /*
    Não permitimos aprovar alguém
    sem nenhuma função.
  */

  if (funcoesMarcadas.length === 0) {

    alert(
      "Selecione pelo menos uma função antes de aprovar o cadastro."
    );

    return;
  }

  botaoAprovarCadastro.disabled =
    true;

  botaoAprovarCadastro.textContent =
    "APROVANDO...";

  try {

    const aprovadoPor =
      await obterUsuarioAdministrador();

    /*
      Primeiro gravamos as funções.
    */

    await sincronizarFuncoesUsuario(
      usuarioId,
      aprovadoPor
    );

    /*
      Depois aprovamos o cadastro.
    */

    const resultadoAprovacao =
      await window.supabaseClient
        .from("usuarios")
        .update({
          status:
            "ativo",

          data_aprovacao:
            new Date().toISOString(),

          aprovado_por:
            aprovadoPor
        })
        .eq(
          "id",
          usuarioId
        );

    if (
      resultadoAprovacao.error
    ) {
      throw resultadoAprovacao.error;
    }

    botaoAprovarCadastro.textContent =
      "Cadastro aprovado";

    setTimeout(() => {

      window.location.href =
        "permissoes.html";

    }, 900);

  } catch (erro) {

    console.error(
      "Erro ao aprovar cadastro:",
      erro
    );

    alert(
      "Não foi possível aprovar o cadastro. Tente novamente."
    );

    botaoAprovarCadastro.disabled =
      false;

    botaoAprovarCadastro.textContent =
      "Aprovar cadastro";

  }
}


/* ==========================================
   CARREGA O USUÁRIO
========================================== */

async function carregarUsuario() {
  if (!window.supabaseClient) {
    return;
  }

  const {
    usuarioId,
    tipo
  } = obterParametros();

  if (!usuarioId) {

    window.location.href =
      "permissoes.html";

    return;
  }

  try {

    const resultadoUsuario =
      await window.supabaseClient
        .from("usuarios")
        .select(`
          id,
          nome_completo,
          email,
          status,
          foto_path
        `)
        .eq(
          "id",
          usuarioId
        )
        .maybeSingle();

    if (
      resultadoUsuario.error
    ) {
      throw resultadoUsuario.error;
    }

    const usuario =
      resultadoUsuario.data;

    if (!usuario) {
      throw new Error(
        "Usuário não encontrado."
      );
    }

    const nomeFormatado =
      formatarNome(
        usuario.nome_completo
      );

    tituloPermissaoUsuario.textContent =
      nomeFormatado;

    subtituloPermissaoUsuario.textContent =
      tipo === "pendente"
        ? "Cadastro aguardando aprovação"
        : "Gerencie as funções deste usuário.";

    nomeUsuarioPermissao.textContent =
      nomeFormatado;

    emailUsuarioPermissao.textContent =
      usuario.email || "";

    statusUsuarioPermissao.textContent =
      usuario.status || "";

    await carregarFoto(
      usuario.foto_path
    );

    await carregarFuncoes(
      usuario.id
    );

    areaAprovacaoCadastro.hidden =
      tipo !== "pendente";

    areaSalvarFuncoes.hidden =
      tipo !== "ativo";

  } catch (erro) {

    console.error(
      "Erro ao carregar usuário:",
      erro
    );

    subtituloPermissaoUsuario.textContent =
      "Não foi possível carregar os dados deste usuário.";

    listaFuncoesPermissao.innerHTML =
      "<p>Não foi possível carregar as funções.</p>";

  }
}


/* ==========================================
   EVENTOS
========================================== */

if (botaoSalvarFuncoes) {

  botaoSalvarFuncoes.addEventListener(
    "click",
    salvarFuncoesUsuario
  );

}

if (botaoAprovarCadastro) {

  botaoAprovarCadastro.addEventListener(
    "click",
    aprovarCadastro
  );

}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

carregarUsuario();
