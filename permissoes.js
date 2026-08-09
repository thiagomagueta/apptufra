"use strict";

const listaCadastrosPendentes = document.getElementById(
  "listaCadastrosPendentes"
);

const listaUsuariosAtivos = document.getElementById(
  "listaUsuariosAtivos"
);

function criarAvatarPadrao() {
  const avatar = document.createElement("div");

  avatar.className = "foto-permissao avatar-permissao-padrao";
  avatar.textContent = "👤";

  return avatar;
}

async function criarFotoUsuario(usuario) {
  if (
    !usuario.foto_path ||
    !window.supabaseClient
  ) {
    return criarAvatarPadrao();
  }

  try {
    const resultadoFoto =
      await window.supabaseClient.storage
        .from("fotos-associados")
        .createSignedUrl(
          usuario.foto_path,
          60 * 60
        );

    if (
      resultadoFoto.error ||
      !resultadoFoto.data?.signedUrl
    ) {
      return criarAvatarPadrao();
    }

    const imagem = document.createElement("img");

    imagem.className = "foto-permissao";
    imagem.src = resultadoFoto.data.signedUrl;
    imagem.alt =
      `Foto de ${usuario.nome_completo || "usuário"}`;

    return imagem;

  } catch (erro) {
    console.error(
      "Erro ao carregar foto do usuário:",
      erro
    );

    return criarAvatarPadrao();
  }
}

async function criarItemUsuario(
  usuario,
  tipo
) {
  const item = document.createElement("div");

  item.className = "item-permissao";

  const foto =
    await criarFotoUsuario(usuario);

  const dados = document.createElement("div");
  dados.className = "dados-permissao";

  const nome = document.createElement("strong");
  nome.textContent =
    usuario.nome_completo || "Usuário";

  const status = document.createElement("span");

  if (tipo === "pendente") {
    status.textContent =
      "Aguardando aprovação";
  } else {
    status.textContent =
      "Usuário ativo";
  }

  dados.appendChild(nome);
  dados.appendChild(status);

  const link = document.createElement("a");

  link.className = "link-permissao";

  if (tipo === "pendente") {
    link.textContent = "Analisar";

    link.href =
      `permissao-usuario.html?id=${usuario.id}&tipo=pendente`;
  } else {
    link.textContent = "Funções";

    link.href =
      `permissao-usuario.html?id=${usuario.id}&tipo=ativo`;
  }

  item.appendChild(foto);
  item.appendChild(dados);
  item.appendChild(link);

  return item;
}

async function preencherLista(
  elementoLista,
  usuarios,
  tipo
) {
  elementoLista.innerHTML = "";

  if (!usuarios.length) {
    const mensagem = document.createElement("p");

    mensagem.textContent =
      tipo === "pendente"
        ? "Nenhum cadastro aguardando aprovação."
        : "Nenhum usuário ativo encontrado.";

    elementoLista.appendChild(mensagem);

    return;
  }

  for (const usuario of usuarios) {
    const item =
      await criarItemUsuario(
        usuario,
        tipo
      );

    elementoLista.appendChild(item);
  }
}

async function carregarUsuarios() {
  if (!window.supabaseClient) {
    return;
  }

  try {
    const resultadoSessao =
      await window.supabaseClient.auth.getSession();

    if (resultadoSessao.error) {
      throw resultadoSessao.error;
    }

    const sessao =
      resultadoSessao.data.session;

    if (!sessao) {
      window.location.href =
        "index.html";

      return;
    }

    const resultadoUsuarios =
      await window.supabaseClient
        .from("usuarios")
        .select(`
          id,
          nome_completo,
          email,
          status,
          foto_path,
          data_solicitacao
        `)
        .order(
          "data_solicitacao",
          {
            ascending: false
          }
        );

    if (resultadoUsuarios.error) {
      throw resultadoUsuarios.error;
    }

    const usuarios =
      resultadoUsuarios.data || [];

    const pendentes =
      usuarios.filter((usuario) => {
        const status =
          String(
            usuario.status || ""
          ).toLowerCase();

        return (
          status.includes("aguardando") ||
          status.includes("pendente")
        );
      });

    const ativos =
      usuarios.filter((usuario) => {
        const status =
          String(
            usuario.status || ""
          ).toLowerCase();

        return status === "ativo";
      });

    await preencherLista(
      listaCadastrosPendentes,
      pendentes,
      "pendente"
    );

    await preencherLista(
      listaUsuariosAtivos,
      ativos,
      "ativo"
    );

  } catch (erro) {
    console.error(
      "Erro ao carregar usuários:",
      erro
    );

    listaCadastrosPendentes.innerHTML =
      "<p>Não foi possível carregar os cadastros.</p>";

    listaUsuariosAtivos.innerHTML =
      "<p>Não foi possível carregar os usuários.</p>";
  }
}

carregarUsuarios();
