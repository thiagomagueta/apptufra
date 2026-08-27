"use strict";

function estaEmModoEdicao() {
  const parametros = new URLSearchParams(
    window.location.search
  );

  return parametros.get("modo") === "edicao";
}

async function obterUsuarioAtual() {
  if (!window.supabaseClient) {
    throw new Error(
      "Não foi possível conectar ao banco de dados."
    );
  }

  const resultadoSessao =
    await window.supabaseClient.auth.getSession();

  if (resultadoSessao.error) {
    throw resultadoSessao.error;
  }

  const sessao = resultadoSessao.data.session;

  if (!sessao) {
    throw new Error("Usuário não está conectado.");
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

  return resultadoUsuario.data;
}

async function salvarSecaoFicha(nomeColuna, dados) {
  const colunasPermitidas = [
    "dados_pessoais",
    "endereco_contato",
    "historico_umbanda"
  ];

  if (!colunasPermitidas.includes(nomeColuna)) {
    throw new Error(
      "Seção da ficha não reconhecida."
    );
  }

  const usuario = await obterUsuarioAtual();

  const resultado =
    await window.supabaseClient
      .from("fichas_associados")
      .update({
        [nomeColuna]: dados,
        atualizado_em: new Date().toISOString()
      })
      .eq("usuario_id", usuario.id)
      .select("usuario_id")
      .maybeSingle();

  if (resultado.error) {
    throw resultado.error;
  }

  if (!resultado.data) {
    throw new Error(
      "A ficha do associado não foi encontrada."
    );
  }


  /* ==========================================
     SINCRONIZAR NOME COM PUBLIC.USUARIOS
  ========================================== */

  if (
    nomeColuna === "dados_pessoais" &&
    dados?.nome
  ) {
    const nomeAtualizado =
      String(dados.nome).trim();

    if (nomeAtualizado) {
      const resultadoAtualizacaoUsuario =
        await window.supabaseClient
          .from("usuarios")
          .update({
            nome_completo: nomeAtualizado
          })
          .eq("id", usuario.id);

      if (resultadoAtualizacaoUsuario.error) {
        throw resultadoAtualizacaoUsuario.error;
      }
    }
  }
}

window.fichaTufra = {
  estaEmModoEdicao,
  salvarSecaoFicha
};
