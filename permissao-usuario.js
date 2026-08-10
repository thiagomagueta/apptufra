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

    areaAprovacaoCadastro.hidden =
      tipo !== "pendente";

  } catch (erro) {
    console.error(
      "Erro ao carregar usuário:",
      erro
    );

    subtituloPermissaoUsuario.textContent =
      "Não foi possível carregar os dados deste usuário.";
  }
}

carregarUsuario();
