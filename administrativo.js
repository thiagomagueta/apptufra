"use strict";

const opcaoPermissoes = document.getElementById(
  "opcaoPermissoes"
);

const semOpcoesAdministrativas = document.getElementById(
  "semOpcoesAdministrativas"
);

async function carregarOpcoesAdministrativas() {
  if (!window.supabaseClient) {
    return;
  }

  try {
    const resultadoSessao =
      await window.supabaseClient.auth.getSession();

    if (resultadoSessao.error) {
      throw resultadoSessao.error;
    }
const opcaoCalendarioAdmin = document.getElementById(
  "opcaoCalendarioAdmin"
);
    const sessao =
      resultadoSessao.data.session;

    if (!sessao) {
      window.location.href =
        "index.html";

      return;
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
      return;
    }

    const resultadoFuncoes =
      await window.supabaseClient
        .from("usuario_funcoes")
        .select(`
          funcoes (
            nome
          )
        `)
        .eq(
          "usuario_id",
          resultadoUsuario.data.id
        );

    if (resultadoFuncoes.error) {
      throw resultadoFuncoes.error;
    }

    const nomesFuncoes =
      (resultadoFuncoes.data || [])
        .map(
          (item) =>
            item.funcoes?.nome
        )
        .filter(Boolean);

    const podeGerenciarPermissoes =
      nomesFuncoes.includes(
        "Tesoureiro"
      );

    opcaoPermissoes.hidden =
      !podeGerenciarPermissoes;

    semOpcoesAdministrativas.hidden =
      podeGerenciarPermissoes;

  } catch (erro) {
    console.error(
      "Erro ao carregar opções administrativas:",
      erro
    );

    semOpcoesAdministrativas.hidden =
      false;
  }
}

carregarOpcoesAdministrativas();
