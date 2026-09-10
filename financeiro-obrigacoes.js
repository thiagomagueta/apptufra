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
   CONVERTER VALOR INFORMADO
========================================== */

function converterValorObrigacao(
  valor
) {

  let texto =
    String(
      valor || ""
    )
      .trim()
      .replace(
        "R$",
        ""
      )
      .replace(
        /\s/g,
        ""
      );


  if (
    texto.includes(",")
  ) {

    texto =
      texto
        .replace(
          /\./g,
          ""
        )
        .replace(
          ",",
          "."
        );

  }


  const numero =
    Number(
      texto
    );


  if (
    !Number.isFinite(
      numero
    ) ||
    numero < 0
  ) {

    return null;

  }


  return Number(
    numero.toFixed(
      2
    )
  );
}


/* ==========================================
   CRIAR BOTÃO
========================================== */

function criarBotaoObrigacao(
  texto
) {

  const botao =
    document.createElement(
      "button"
    );


  botao.type =
    "button";

  botao.textContent =
    texto;


  botao.style.width =
    "100%";

  botao.style.marginTop =
    "10px";

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
   ABRIR FORMULÁRIO DE VALOR
========================================== */

function abrirFormularioValorObrigacao(
  atividade,
  configuracao,
  bloco
) {

  const areaExistente =
    bloco.querySelector(
      ".area-edicao-valor-obrigacao"
    );


  if (
    areaExistente
  ) {

    areaExistente.remove();

  }


  const area =
    document.createElement(
      "div"
    );


  area.className =
    "area-edicao-valor-obrigacao";


  area.style.marginTop =
    "12px";

  area.style.paddingTop =
    "12px";

  area.style.borderTop =
    "1px solid #e1d6d6";


  /* --------------------------------------
     LABEL
  -------------------------------------- */

  const label =
    document.createElement(
      "label"
    );


  label.textContent =
    "Valor da obrigação";


  label.style.display =
    "block";

  label.style.marginBottom =
    "6px";

  label.style.fontWeight =
    "700";


  area.appendChild(
    label
  );


  /* --------------------------------------
     INPUT
  -------------------------------------- */

  const input =
    document.createElement(
      "input"
    );


  input.type =
    "text";

  input.inputMode =
    "decimal";

  input.placeholder =
    "Ex.: 150,00";


  if (
    configuracao
  ) {

    input.value =
      Number(
        configuracao.valor || 0
      )
        .toFixed(
          2
        )
        .replace(
          ".",
          ","
        );

  }


  input.style.width =
    "100%";

  input.style.boxSizing =
    "border-box";

  input.style.padding =
    "10px";

  input.style.border =
    "1px solid #cfc2c2";

  input.style.borderRadius =
    "8px";

  input.style.fontFamily =
    "inherit";

  input.style.fontSize =
    "15px";


  area.appendChild(
    input
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


  area.appendChild(
    mensagem
  );


  /* --------------------------------------
     BOTÃO SALVAR
  -------------------------------------- */

  const botaoSalvar =
    criarBotaoObrigacao(
      "Salvar valor"
    );


  botaoSalvar.addEventListener(
    "click",
    async () => {

      const valor =
        converterValorObrigacao(
          input.value
        );


      if (
        valor === null
      ) {

        mensagem.textContent =
          "Informe um valor válido.";

        mensagem.style.color =
          "#9a2929";

        return;

      }


      botaoSalvar.disabled =
        true;


      mensagem.textContent =
        "Salvando...";

      mensagem.style.color =
        "#6b5d5d";


      try {

        let resultado;


        /* ----------------------------------
           EDITAR CONFIGURAÇÃO EXISTENTE
        ---------------------------------- */

        if (
          configuracao
        ) {

          resultado =
            await window.supabaseClient
              .from(
                "financeiro_obrigacoes"
              )
              .update({
                valor:
                  valor,

                atualizado_em:
                  new Date()
                    .toISOString()
              })
              .eq(
                "id",
                configuracao.id
              );

        }


        /* ----------------------------------
           CRIAR NOVA CONFIGURAÇÃO
        ---------------------------------- */

        else {

          resultado =
            await window.supabaseClient
              .from(
                "financeiro_obrigacoes"
              )
              .insert({
                atividade_id:
                  atividade.id,

                valor:
                  valor,

                ativo:
                  true
              });

        }


        if (
          resultado.error
        ) {

          throw resultado.error;

        }


        mensagem.textContent =
          "Valor salvo com sucesso.";

        mensagem.style.color =
          "#267341";


        await carregarObrigacoesFinanceiro();


      } catch (erro) {

        console.error(
          "Erro ao salvar valor da obrigação:",
          erro
        );


        mensagem.textContent =
          "Não foi possível salvar o valor.";

        mensagem.style.color =
          "#9a2929";


        botaoSalvar.disabled =
          false;

      }

    }
  );


  area.appendChild(
    botaoSalvar
  );


  /* --------------------------------------
     BOTÃO CANCELAR
  -------------------------------------- */

  const botaoCancelar =
    criarBotaoObrigacao(
      "Cancelar"
    );


  botaoCancelar.style.borderColor =
    "#b9abab";

  botaoCancelar.style.color =
    "#5f5555";


  botaoCancelar.addEventListener(
    "click",
    () => {

      area.remove();

    }
  );


  area.appendChild(
    botaoCancelar
  );


  bloco.appendChild(
    area
  );


  input.focus();

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


  /* --------------------------------------
     DATA
  -------------------------------------- */

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


  /* --------------------------------------
     TÍTULO
  -------------------------------------- */

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


  /* --------------------------------------
     CONFIGURAÇÃO FINANCEIRA
  -------------------------------------- */

  const configuracao =
    atividade.financeiro_obrigacoes?.[0] ||
    null;


  /* ======================================
     JÁ CONFIGURADA
  ====================================== */

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

    status.style.color =
      "#267341";

    status.style.fontWeight =
      "700";


    status.textContent =
      `✅ Configurada — ${formatarValorObrigacao(
        configuracao.valor
      )}`;


    bloco.appendChild(
      status
    );


    const botaoEditar =
      criarBotaoObrigacao(
        "Editar valor"
      );


    botaoEditar.addEventListener(
      "click",
      () => {

        abrirFormularioValorObrigacao(
          atividade,
          configuracao,
          bloco
        );

      }
    );


    bloco.appendChild(
      botaoEditar
    );


    /* --------------------------------------
       PARTICIPANTES
    -------------------------------------- */

    const botaoParticipantes =
      criarBotaoObrigacao(
        "Participantes"
      );


    botaoParticipantes.addEventListener(
      "click",
      () => {

        window.location.href =
          "financeiro-obrigacao-participantes.html?id=" +
          configuracao.id;

      }
    );


    bloco.appendChild(
      botaoParticipantes
    );

  }


  /* ======================================
     AINDA NÃO CONFIGURADA
  ====================================== */

  else {

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


    const botaoDefinir =
      criarBotaoObrigacao(
        "Definir valor"
      );


    botaoDefinir.addEventListener(
      "click",
      () => {

        abrirFormularioValorObrigacao(
          atividade,
          null,
          bloco
        );

      }
    );


    bloco.appendChild(
      botaoDefinir
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

    mensagemObrigacoesFinanceiro.hidden =
      false;

    mensagemObrigacoesFinanceiro.textContent =
      "Carregando obrigações...";

  }


  try {

    /* ======================================
       1. BUSCAR ATIVIDADES COM OBRIGAÇÃO
    ====================================== */

    const resultadoAtividades =
      await window.supabaseClient
        .from(
          "atividades"
        )
        .select(`
          id,
          titulo,
          data,
          tipo_atividade
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
      resultadoAtividades.error
    ) {

      throw resultadoAtividades.error;

    }


    const atividades =
      resultadoAtividades.data ||
      [];


    if (
      atividades.length === 0
    ) {

      if (
        mensagemObrigacoesFinanceiro
      ) {

        mensagemObrigacoesFinanceiro.hidden =
          false;

        mensagemObrigacoesFinanceiro.textContent =
          "Nenhuma obrigação foi encontrada no calendário.";

      }


      return;

    }


    /* ======================================
       2. BUSCAR CONFIGURAÇÕES FINANCEIRAS
    ====================================== */

    const resultadoObrigacoes =
      await window.supabaseClient
        .from(
          "financeiro_obrigacoes"
        )
        .select(`
          id,
          atividade_id,
          valor,
          ativo
        `);


    if (
      resultadoObrigacoes.error
    ) {

      throw resultadoObrigacoes.error;

    }


    const obrigacoes =
      resultadoObrigacoes.data ||
      [];


    /* ======================================
       3. LIGAR CONFIGURAÇÃO À ATIVIDADE
    ====================================== */

    atividades.forEach(
      (atividade) => {

        const configuracao =
          obrigacoes.find(
            (obrigacao) =>
              obrigacao.atividade_id ===
              atividade.id
          ) ||
          null;


        atividade.financeiro_obrigacoes =
          configuracao
            ? [configuracao]
            : [];

      }
    );


    /* ======================================
       4. MONTAR TELA
    ====================================== */

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

    /* --------------------------------------
       SESSÃO
    -------------------------------------- */

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


    /* --------------------------------------
       USUÁRIO
    -------------------------------------- */

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


    /* --------------------------------------
       RESPONSÁVEL PELO FINANCEIRO
    -------------------------------------- */

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


    /* --------------------------------------
       ACESSO LIBERADO
    -------------------------------------- */

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
