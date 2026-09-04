"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const conteudoObrigacoesFinanceiro =
  document.getElementById(
    "conteudoObrigacoesFinanceiro"
  );

const mensagemObrigacoesFinanceiro =
  document.getElementById(
    "mensagemObrigacoesFinanceiro"
  );

const listaObrigacoesFinanceiro =
  document.getElementById(
    "listaObrigacoesFinanceiro"
  );


/* ==========================================
   FORMATAR DATA
========================================== */

function formatarDataObrigacao(
  dataISO
) {

  if (
    !dataISO
  ) {

    return "";

  }


  const partes =
    String(
      dataISO
    ).split(
      "-"
    );


  if (
    partes.length !== 3
  ) {

    return dataISO;

  }


  return (
    `${partes[2]}/${partes[1]}/${partes[0]}`
  );
}


/* ==========================================
   FORMATAR VALOR
========================================== */

function formatarValorObrigacao(
  valor
) {

  const numero =
    Number(
      valor || 0
    );


  return numero.toLocaleString(
    "pt-BR",
    {
      style:
        "currency",

      currency:
        "BRL"
    }
  );
}


/* ==========================================
   CRIAR BLOCO DA OBRIGAÇÃO
========================================== */

function criarBlocoObrigacao(
  atividade
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


  const data =
    document.createElement(
      "div"
    );


  data.style.fontSize =
    "13px";

  data.style.fontWeight =
    "700";

  data.style.marginBottom =
    "6px";


  data.textContent =
    formatarDataObrigacao(
      atividade.data
    );


  bloco.appendChild(
    data
  );


  const titulo =
    document.createElement(
      "div"
    );


  titulo.style.fontWeight =
    "700";

  titulo.style.lineHeight =
    "1.4";


  titulo.textContent =
    atividade.titulo ||
    "Obrigação";


  bloco.appendChild(
    titulo
  );


  const configuracao =
    atividade.financeiro_obrigacoes?.[0] ||
    null;


  if (
    configuracao
  ) {

    const status =
      document.createElement(
        "div"
      );


    status.style.marginTop =
      "10px";

    status.style.fontSize =
      "14px";


    status.textContent =
      `✅ Configurada — ${formatarValorObrigacao(
        configuracao.valor
      )}`;


    bloco.appendChild(
      status
    );


    const botao =
      document.createElement(
        "button"
      );


    botao.type =
      "button";

    botao.textContent =
      "Editar valor";

    botao.style.marginTop =
      "10px";

    botao.style.width =
      "100%";


    botao.addEventListener(
      "click",
      () => {

        alert(
          "A edição do valor será liberada no próximo passo."
        );

      }
    );


    bloco.appendChild(
      botao
    );

  } else {

    const status =
      document.createElement(
        "div"
      );


    status.style.marginTop =
      "10px";

    status.style.fontSize =
      "14px";


    status.textContent =
      "Ainda não configurada no Financeiro.";


    bloco.appendChild(
      status
    );


    const botao =
      document.createElement(
        "button"
      );


    botao.type =
      "button";

    botao.textContent =
      "Definir valor";

    botao.style.marginTop =
      "10px";

    botao.style.width =
      "100%";


    botao.addEventListener(
      "click",
      () => {

        alert(
          "O cadastro do valor será liberado no próximo passo."
        );

      }
    );


    bloco.appendChild(
      botao
    );

  }


  return bloco;
}


/* ==========================================
   CARREGAR OBRIGAÇÕES
========================================== */

async function carregarObrigacoesFinanceiro() {

  if (
    !window.supabaseClient ||
    !listaObrigacoesFinanceiro
  ) {

    return;

  }


  listaObrigacoesFinanceiro.innerHTML =
    "";


  if (
    mensagemObrigacoesFinanceiro
  ) {

    mensagemObrigacoesFinanceiro.textContent =
      "Carregando obrigações...";

  }


  try {

    const resultado =
      await window.supabaseClient
        .from(
          "atividades"
        )
        .select(`
          id,
          titulo,
          data,
          tipo_atividade,

          financeiro_obrigacoes (
            id,
            valor,
            ativo
          )
        `)
        .ilike(
          "titulo",
          "%obrigação%"
        )
        .order(
          "data",
          {
            ascending:
              true
          }
        );


    if (
      resultado.error
    ) {

      throw resultado.error;

    }


    const atividades =
      resultado.data ||
      [];


    if (
      atividades.length === 0
    ) {

      if (
        mensagemObrigacoesFinanceiro
      ) {

        mensagemObrigacoesFinanceiro.textContent =
          "Nenhuma obrigação foi encontrada no calendário.";

      }


      return;

    }


    if (
      mensagemObrigacoesFinanceiro
    ) {

      mensagemObrigacoesFinanceiro.hidden =
        true;

    }


    atividades.forEach(
      (atividade) => {

        const bloco =
          criarBlocoObrigacao(
            atividade
          );


        listaObrigacoesFinanceiro.appendChild(
          bloco
        );

      }
    );


  } catch (erro) {

    console.error(
      "Erro ao carregar obrigações:",
      erro
    );


    if (
      mensagemObrigacoesFinanceiro
    ) {

      mensagemObrigacoesFinanceiro.hidden =
        false;

      mensagemObrigacoesFinanceiro.textContent =
        "Não foi possível carregar as obrigações.";

    }

  }
}


/* ==========================================
   VALIDAR ACESSO AO FINANCEIRO
========================================== */

async function carregarAcessoObrigacoesFinanceiro() {

  if (
    !window.supabaseClient
  ) {

    window.location.href =
      "adm-financeiro.html";

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
        "adm-financeiro.html";

      return;

    }


    const usuarioId =
      resultadoUsuario.data.id;


    const resultadoResponsavel =
      await window.supabaseClient
        .from(
          "responsaveis_financeiro"
        )
        .select(
          "id"
        )
        .eq(
          "usuario_id",
          usuarioId
        )
        .limit(
          1
        );


    if (
      resultadoResponsavel.error
    ) {

      throw resultadoResponsavel.error;

    }


    const possuiAcesso =
      (
        resultadoResponsavel.data ||
        []
      ).length > 0;


    if (
      !possuiAcesso
    ) {

      window.location.href =
        "adm-financeiro.html";

      return;

    }


    if (
      conteudoObrigacoesFinanceiro
    ) {

      conteudoObrigacoesFinanceiro.hidden =
        false;

    }


    await carregarObrigacoesFinanceiro();


  } catch (erro) {

    console.error(
      "Erro ao verificar acesso às obrigações:",
      erro
    );


    window.location.href =
      "adm-financeiro.html";

  }

}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

carregarAcessoObrigacoesFinanceiro();
