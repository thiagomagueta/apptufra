"use strict";

const listaCadastrosPendentes = document.getElementById(
  "listaCadastrosPendentes"
);

const listaUsuariosAtivos = document.getElementById(
  "listaUsuariosAtivos"
);

function criarItemUsuario(
  usuario,
  tipo
) {
  const link = document.createElement("a");

  link.className =
    "item-permissao-lista";

  if (tipo === "pendente") {
    link.href =
      `permissao-usuario.html?id=${usuario.id}&tipo=pendente`;
  } else {
    link.href =
      `permissao-usuario.html?id=${usuario.id}&tipo=ativo`;
  }

  const dados =
    document.createElement("div");

  dados.className =
    "dados-permissao-lista";

  const nome =
    document.createElement("strong");

  nome.textContent =
    usuario.nome_completo ||
    "Usuário";

  const status =
    document.createElement("span");

  status.textContent =
    tipo === "pendente"
      ? "Aguardando aprovação"
      : "Usuário ativo";

  dados.appendChild(nome);
  dados.appendChild(status);

  const seta =
    document.createElement("span");

  seta.className =
    "seta-permissao-lista";

  seta.textContent = "›";

  link.appendChild(dados);
  link.appendChild(seta);

  return link;
}

function preencherLista(
  elementoLista,
  usuarios,
  tipo
) {
  elementoLista.innerHTML = "";

  if (!usuarios.length) {
    const mensagem =
      document.createElement("p");

    mensagem.textContent =
      tipo === "pendente"
        ? "Nenhum cadastro aguardando aprovação."
        : "Nenhum usuário ativo encontrado.";

    elementoLista.appendChild(
      mensagem
    );

    return;
  }

  usuarios.forEach((usuario) => {
    const item =
      criarItemUsuario(
        usuario,
        tipo
      );

    elementoLista.appendChild(
      item
    );
  });
}

async function carregarUsuarios() {
  if (!window.supabaseClient) {
    return;
  }

  try {
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
          "nome_completo",
          {
            ascending: true
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

    preencherLista(
      listaCadastrosPendentes,
      pendentes,
      "pendente"
    );

    preencherLista(
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
