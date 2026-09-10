"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const conteudoRegrasObrigacoes =
  document.getElementById(
    "conteudoRegrasObrigacoes"
  );

const mensagemRegrasObrigacoes =
  document.getElementById(
    "mensagemRegrasObrigacoes"
  );

const listaRegrasObrigacoes =
  document.getElementById(
    "listaRegrasObrigacoes"
  );


/* ==========================================
   CRIAR SELECT DE REGRA
========================================== */

function criarSelectRegraObrigacao(
  regraAtual
) {

  const select =
    document.createElement(
      "select"
    );


  select.style.width =
    "100%";

  select.style.padding =
    "10px";

  select.style.border =
    "1px solid #cfc2c2";

  select.style.borderRadius =
    "8px";

  select.style.fontFamily =
    "inherit";

  select.style.fontSize =
    "15px";

  select.style.background =
    "#ffffff";


  const opcoes = [
    {
      valor: "",
      texto: "Selecione"
    },
    {
      valor: "obrigatorio",
      texto: "Obrigatório"
    },
    {
      valor: "isento",
      texto: "Isento"
    },
    {
      valor: "opcional",
      texto: "Opcional"
    }
  ];


  opcoes.forEach(
    (opcao) => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        opcao.valor;

      option.textContent =
        opcao.texto;


      if (
        regraAtual ===
        opcao.valor
      ) {

        option.selected =
          true;

      }


      select.appendChild(
        option
      );

    }
  );


  return select;
}


/* ==========================================
   CRIAR BOTÃO SALVAR
========================================== */

function criarBotaoSalvarRegra() {

  const botao =
    document.createElement(
      "button"
    );


  botao.type =
    "button";

  botao.textContent =
    "Salvar";

  botao.style.marginTop =
    "10px";

  botao.style.width =
    "100%";

  botao.style.padding =
    "10px 12px";

  botao.style.border =
    "1px solid #651b1d";

  botao.style.borderRadius =
    "9px";

  botao.style.background =
    "#ffffff";

  botao.style.color =
    "#651b1d";

  botao.style.fontWeight =
    "700";

  botao.style.cursor =
    "pointer";


  return botao;
}


/* ==========================================
   SALVAR REGRA
========================================== */

async function salvarRegraObrigacao(
  funcao,
  regraAtual,
  select,
  mensagem,
  botao
) {

  const novaRegra =
    select.value;


  if (
    !novaRegra
  ) {

    mensagem.textContent =
      "Selecione uma regra.";

    mensagem.style.color =
      "#9a2929";

    return;

  }


  botao.disabled =
    true;

  mensagem.textContent =
    "Salvando...";

  mensagem.style.color =
    "#6b5d5d";


  try {

    let resultado;


    if (
      regraAtual
    ) {

      resultado =
        await window.supabaseClient
          .from(
            "financeiro_regras_obrigacoes"
          )
          .update({
            regra:
              novaRegra,

            atualizado_em:
              new Date()
                .toISOString()
          })
          .eq(
            "funcao_id",
            funcao.id
          );

    }

    else {

      resultado =
        await window.supabaseClient
          .from(
            "financeiro_regras_obrigacoes"
          )
          .insert({
            funcao_id:
              funcao.id,

            regra:
              novaRegra
          });

    }


    if (
      resultado.error
    ) {

      throw resultado.error;

    }


    mensagem.textContent =
      "Regra salva com sucesso.";

    mensagem.style.color =
      "#267341";


    setTimeout(
      () => {

        carregarRegrasObrigacoes();

      },
      500
    );


  } catch (erro) {

    console.error(
      "Erro ao salvar regra da obrigação:",
      erro
    );


    mensagem.textContent =
      "Não foi possível salvar a regra.";

    mensagem.style.color =
      "#9a2929";

    botao.disabled =
      false;

  }

}


/* ==========================================
   CRIAR BLOCO DA FUNÇÃO
========================================== */

function criarBlocoFuncao(
  funcao,
  regraAtual
) {

  const bloco =
    document.createElement(
      "div"
    );


  bloco.style.padding =
    "14px";

  bloco.style.marginTop =
    "12px";

  bloco.style.border =
    "1px solid #d8d8d8";

  bloco.style.borderRadius =
    "10px";

  bloco.style.background =
    "#ffffff";


  /* --------------------------------------
     NOME DA FUNÇÃO
  -------------------------------------- */

  const titulo =
    document.createElement(
      "div"
    );


  titulo.style.fontWeight =
    "700";

  titulo.style.marginBottom =
    "10px";

  titulo.textContent =
    funcao.nome;


  bloco.appendChild(
    titulo
  );


  /* --------------------------------------
     SELECT
  -------------------------------------- */

  const select =
    criarSelectRegraObrigacao(
      regraAtual
    );


  bloco.appendChild(
    select
  );


  /* --------------------------------------
     MENSAGEM
  -------------------------------------- */

  const mensagem =
    document.createElement(
      "div"
    );


  mensagem.style.marginTop =
    "8px";

  mensagem.style.fontSize =
    "13px";


  bloco.appendChild(
    mensagem
  );


  /* --------------------------------------
     BOTÃO
  -------------------------------------- */

  const botao =
    criarBotaoSalvarRegra();


  botao.addEventListener(
    "click",
    () => {

      salvarRegraObrigacao(
        funcao,
        regraAtual,
        select,
        mensagem,
        botao
      );

    }
  );


  bloco.appendChild(
    botao
  );


  return bloco;
}


/* ==========================================
   CARREGAR FUNÇÕES E REGRAS
========================================== */

async function carregarRegrasObrigacoes() {

  if (
    !window.supabaseClient ||
    !listaRegrasObrigacoes
  ) {

    return;

  }


  listaRegrasObrigacoes.innerHTML =
    "";


  if (
    mensagemRegrasObrigacoes
  ) {

    mensagemRegrasObrigacoes.hidden =
      false;

    mensagemRegrasObrigacoes.textContent =
      "Carregando funções...";

  }


  try {

    /* ======================================
       1. BUSCAR FUNÇÕES ATIVAS
    ====================================== */

    const resultadoFuncoes =
      await window.supabaseClient
        .from(
          "funcoes"
        )
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
        )
        .order(
          "ordem",
          {
            ascending:
              true,
            nullsFirst:
              false
          }
        )
        .order(
          "nome",
          {
            ascending:
              true
          }
        );


    if (
      resultadoFuncoes.error
    ) {

      throw resultadoFuncoes.error;

    }


    const funcoes =
      resultadoFuncoes.data ||
      [];


    if (
      funcoes.length === 0
    ) {

      if (
        mensagemRegrasObrigacoes
      ) {

        mensagemRegrasObrigacoes.hidden =
          false;

        mensagemRegrasObrigacoes.textContent =
          "Nenhuma função ativa foi encontrada.";

      }


      return;

    }


    /* ======================================
       2. BUSCAR REGRAS JÁ SALVAS
    ====================================== */

    const resultadoRegras =
      await window.supabaseClient
        .from(
          "financeiro_regras_obrigacoes"
        )
        .select(`
          id,
          funcao_id,
          regra
        `);


    if (
      resultadoRegras.error
    ) {

      throw resultadoRegras.error;

    }


    const regras =
      resultadoRegras.data ||
      [];


    /* ======================================
       3. MONTAR TELA
    ====================================== */

    if (
      mensagemRegrasObrigacoes
    ) {

      mensagemRegrasObrigacoes.hidden =
        true;

    }


    funcoes.forEach(
      (funcao) => {

        const regraEncontrada =
          regras.find(
            (regra) =>
              regra.funcao_id ===
              funcao.id
          ) ||
          null;


        const regraAtual =
          regraEncontrada
            ? regraEncontrada.regra
            : "";


        const bloco =
          criarBlocoFuncao(
            funcao,
            regraAtual
          );


        listaRegrasObrigacoes.appendChild(
          bloco
        );

      }
    );


  } catch (erro) {

    console.error(
      "Erro ao carregar regras das obrigações:",
      erro
    );


    if (
      mensagemRegrasObrigacoes
    ) {

      mensagemRegrasObrigacoes.hidden =
        false;

      mensagemRegrasObrigacoes.textContent =
        "Não foi possível carregar as regras das obrigações.";

    }

  }

}


/* ==========================================
   VALIDAR ACESSO
========================================== */

async function carregarAcessoRegrasObrigacoes() {

  if (
    !window.supabaseClient
  ) {

    window.location.href =
      "adm-permissoes.html";

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


    /* ======================================
       USUÁRIO
    ====================================== */

    const resultadoUsuario =
      await window.supabaseClient
        .from(
          "usuarios"
        )
        .select(
          "id"
        )
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

      window.location.href =
        "adm-permissoes.html";

      return;

    }


    /* ======================================
       ACESSO FINANCEIRO
    ====================================== */

    const resultadoAcesso =
      await window.supabaseClient
        .rpc(
          "usuario_pode_acessar_financeiro"
        );


    if (
      resultadoAcesso.error
    ) {

      throw resultadoAcesso.error;

    }


    if (
      resultadoAcesso.data !== true
    ) {

      window.location.href =
        "adm-permissoes.html";

      return;

    }


    /* ======================================
       LIBERAR TELA
    ====================================== */

    if (
      conteudoRegrasObrigacoes
    ) {

      conteudoRegrasObrigacoes.hidden =
        false;

    }


    await carregarRegrasObrigacoes();


  } catch (erro) {

    console.error(
      "Erro ao verificar acesso às regras das obrigações:",
      erro
    );


    window.location.href =
      "adm-permissoes.html";

  }

}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

carregarAcessoRegrasObrigacoes();
