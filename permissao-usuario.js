"use strict";

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
    )
      .map(
        (item) =>
          item.funcao_id
      );

  montarListaFuncoes(
    resultadoFuncoes.data || [],
    funcoesUsuario
  );
}


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

    if (resultadoUsuario.error) {
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


carregarUsuario();
