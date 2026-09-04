"use strict";


/* ==========================================
   ELEMENTOS DO DASHBOARD
========================================== */

const saudacaoDashboard =
  document.getElementById(
    "saudacaoDashboard"
  );

const fotoUsuarioDashboard =
  document.getElementById(
    "fotoUsuarioDashboard"
  );

const fotoUsuarioPadrao =
  document.getElementById(
    "fotoUsuarioPadrao"
  );

const listaFuncoesDashboard =
  document.getElementById(
    "listaFuncoesDashboard"
  );

const itemMenuAdm =
  document.getElementById(
    "itemMenuAdm"
  );

const proximaAtividadeDashboard =
  document.getElementById(
    "proximaAtividadeDashboard"
  );


/* ==========================================
   FINANCEIRO
========================================== */

const areaFinanceiroEmConstrucaoDashboard =
  document.getElementById(
    "areaFinanceiroEmConstrucaoDashboard"
  );

const areaFinanceiroDashboard =
  document.getElementById(
    "areaFinanceiroDashboard"
  );

const resumoFinanceiroDashboard =
  document.getElementById(
    "resumoFinanceiroDashboard"
  );


/* ==========================================
   PRESENÇA
========================================== */

const areaPresencaDashboard =
  document.getElementById(
    "areaPresencaDashboard"
  );

const listasPresencaDashboard =
  document.getElementById(
    "listasPresencaDashboard"
  );

const mensagemSemPresencaDashboard =
  document.getElementById(
    "mensagemSemPresencaDashboard"
  );


/* ==========================================
   DADOS DA PRESENÇA
========================================== */

let usuarioPresencaDashboard =
  null;

let funcoesPresencaDashboard =
  [];

let historicoPresencaDashboard =
  [];


/* ==========================================
   PRÓXIMA ATIVIDADE
========================================== */

let proximaAtividadeAtualDashboard =
  null;

let nomesFuncoesUsuarioDashboard =
  [];

let proximaAtividadeCarregadaDashboard =
  false;

let funcoesUsuarioCarregadasDashboard =
  false;

let usuarioIdDashboard =
  null;

let confirmacaoAtualDashboard =
  null;


/* ==========================================
   USUÁRIO LOGADO
========================================== */

function carregarUsuarioLogado() {

  try {

    const dados =
      sessionStorage.getItem(
        "tufra_usuario_logado"
      );


    return dados
      ? JSON.parse(
          dados
        )
      : {};


  } catch (erro) {

    console.error(
      "Erro ao carregar usuário logado:",
      erro
    );


    return {};

  }
}


/* ==========================================
   SAUDAÇÃO
========================================== */

function obterPrimeiroNome(
  nomeCompleto
) {

  const nome =
    String(
      nomeCompleto || ""
    ).trim();


  if (
    !nome
  ) {

    return "";

  }


  return nome.split(
    /\s+/
  )[0];
}


function obterSaudacaoPorHorario() {

  const horaAtual =
    new Date().getHours();


  if (
    horaAtual >= 5 &&
    horaAtual < 12
  ) {

    return "Bom dia com muita alegria";

  }


  if (
    horaAtual >= 12 &&
    horaAtual < 18
  ) {

    return "Boa tarde com muita alegria";

  }


  return "Boa noite com muita alegria";
}


function atualizarSaudacao() {

  const usuario =
    carregarUsuarioLogado();


  const primeiroNome =
    obterPrimeiroNome(
      usuario.nomeCompleto
    );


  const saudacao =
    obterSaudacaoPorHorario();


  if (
    !saudacaoDashboard
  ) {

    return;

  }


  saudacaoDashboard.textContent =
    primeiroNome
      ? `${saudacao}, ${primeiroNome}!`
      : `${saudacao}!`;
}


/* ==========================================
   FOTO DO USUÁRIO
========================================== */

async function carregarFotoUsuario() {

  const usuario =
    carregarUsuarioLogado();


  if (
    !usuario.authId ||
    !window.supabaseClient
  ) {

    return;

  }


  try {

    const resultadoUsuario =
      await window.supabaseClient
        .from(
          "usuarios"
        )
        .select(
          "foto_path"
        )
        .eq(
          "auth_id",
          usuario.authId
        )
        .maybeSingle();


    if (
      resultadoUsuario.error
    ) {

      throw resultadoUsuario.error;

    }


    const fotoPath =
      resultadoUsuario.data
        ?.foto_path;


    if (
      !fotoPath
    ) {

      return;

    }


    const resultadoFoto =
      await window.supabaseClient.storage
        .from(
          "fotos-associados"
        )
        .createSignedUrl(
          fotoPath,
          60 * 60
        );


    if (
      resultadoFoto.error
    ) {

      throw resultadoFoto.error;

    }


    const urlFoto =
      resultadoFoto.data
        ?.signedUrl;


    if (
      !urlFoto
    ) {

      return;

    }


    fotoUsuarioDashboard.src =
      urlFoto;


    fotoUsuarioDashboard.hidden =
      false;


    fotoUsuarioPadrao.hidden =
      true;


  } catch (erro) {

    console.error(
      "Erro ao carregar foto do usuário:",
      erro
    );

  }
}


/* ==========================================
   FINANCEIRO
   ESTADO VISUAL DOS MESES
========================================== */

function definirEstadoMesFinanceiroDashboard(
  numeroMes,
  status
) {

  const numero =
    String(
      numeroMes
    ).padStart(
      2,
      "0"
    );


  const elemento =
    document.getElementById(
      `financeiroMes${numero}Dashboard`
    );


  if (
    !elemento
  ) {

    return;

  }


  const areaStatus =
    elemento.querySelector(
      "div"
    );


  /* --------------------------------------
     SEM COBRANÇA
  -------------------------------------- */

  if (
    !status
  ) {

    elemento.style.background =
      "#f5f5f5";

    elemento.style.borderColor =
      "#d8d8d8";

    elemento.style.color =
      "";


    if (
      areaStatus
    ) {

      areaStatus.textContent =
        "—";

    }


    return;

  }


  /* --------------------------------------
     MENSALIDADE PAGA
  -------------------------------------- */

  if (
    status ===
    "paga"
  ) {

    elemento.style.background =
      "#e4f3e8";

    elemento.style.borderColor =
      "#70ad7d";

    elemento.style.color =
      "#246b35";


    if (
      areaStatus
    ) {

      areaStatus.textContent =
        "✓";

    }


    return;

  }


  /* --------------------------------------
     MENSALIDADE EM ABERTO
  -------------------------------------- */

  if (
    status ===
    "aberta"
  ) {

    elemento.style.background =
      "#f7dddd";

    elemento.style.borderColor =
      "#c97575";

    elemento.style.color =
      "#9a2929";


    if (
      areaStatus
    ) {

      areaStatus.textContent =
        "!";

    }


    return;

  }


  /* --------------------------------------
     OUTRO STATUS
  -------------------------------------- */

  elemento.style.background =
    "#f5f5f5";

  elemento.style.borderColor =
    "#d8d8d8";

  elemento.style.color =
    "";


  if (
    areaStatus
  ) {

    areaStatus.textContent =
      "—";

  }

}


/* ==========================================
   FINANCEIRO
   LIMPAR QUADRO
========================================== */

function limparMesesFinanceiroDashboard() {

  for (
    let mes = 1;
    mes <= 12;
    mes++
  ) {

    definirEstadoMesFinanceiroDashboard(
      mes,
      null
    );

  }

}


/* ==========================================
   FINANCEIRO
   CARREGAR MENSALIDADES
========================================== */

async function carregarMensalidadesFinanceiroDashboard() {

  if (
    !window.supabaseClient ||
    !areaFinanceiroDashboard
  ) {

    return;

  }


  limparMesesFinanceiroDashboard();


  if (
    resumoFinanceiroDashboard
  ) {

    resumoFinanceiroDashboard.textContent =
      "Carregando situação financeira...";

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

      return;

    }


    const usuarioId =
      resultadoUsuario.data.id;


    const resultadoCobrancas =
      await window.supabaseClient
        .from(
          "financeiro_cobrancas"
        )
        .select(`
          id,
          competencia,
          status
        `)
        .eq(
          "usuario_id",
          usuarioId
        )
        .eq(
          "tipo",
          "mensalidade"
        )
        .gte(
          "competencia",
          "2026-01-01"
        )
        .lte(
          "competencia",
          "2026-12-31"
        )
        .order(
          "competencia",
          {
            ascending:
              true
          }
        );


    if (
      resultadoCobrancas.error
    ) {

      throw resultadoCobrancas.error;

    }


    const cobrancas =
      resultadoCobrancas.data ||
      [];


    cobrancas.forEach(
      (cobranca) => {

        if (
          !cobranca.competencia
        ) {

          return;

        }


        const partes =
          String(
            cobranca.competencia
          ).split(
            "-"
          );


        if (
          partes.length < 2
        ) {

          return;

        }


        const mes =
          Number(
            partes[1]
          );


        if (
          mes < 1 ||
          mes > 12
        ) {

          return;

        }


        definirEstadoMesFinanceiroDashboard(
          mes,
          cobranca.status
        );

      }
    );


    if (
      resumoFinanceiroDashboard
    ) {

      resumoFinanceiroDashboard.textContent =
        "Situação financeira em desenvolvimento.";

    }


  } catch (erro) {

    console.error(
      "Erro ao carregar mensalidades do Financeiro:",
      erro
    );


    limparMesesFinanceiroDashboard();


    if (
      resumoFinanceiroDashboard
    ) {

      resumoFinanceiroDashboard.textContent =
        "Não foi possível carregar sua situação financeira.";

    }

  }

}


/* ==========================================
   ACESSO AO FINANCEIRO
========================================== */

async function verificarAcessoFinanceiroDashboard() {

  if (
    !areaFinanceiroEmConstrucaoDashboard ||
    !areaFinanceiroDashboard
  ) {

    return;

  }


  areaFinanceiroEmConstrucaoDashboard.hidden =
    false;

  areaFinanceiroDashboard.hidden =
    true;


  if (
    !window.supabaseClient
  ) {

    return;

  }


  try {

    const resultado =
      await window.supabaseClient
        .rpc(
          "usuario_pode_acessar_financeiro"
        );


    if (
      resultado.error
    ) {

      throw resultado.error;

    }


    const possuiAcesso =
      resultado.data ===
      true;


    if (
      !possuiAcesso
    ) {

      return;

    }


    areaFinanceiroEmConstrucaoDashboard.hidden =
      true;

    areaFinanceiroDashboard.hidden =
      false;


    await carregarMensalidadesFinanceiroDashboard();


  } catch (erro) {

    console.error(
      "Erro ao verificar acesso ao Financeiro:",
      erro
    );


    areaFinanceiroEmConstrucaoDashboard.hidden =
      false;

    areaFinanceiroDashboard.hidden =
      true;

  }
}


/* ==========================================
   FORMATAÇÃO DAS FUNÇÕES
========================================== */

function obterNomeSecundariaDashboard(
  nomePai,
  nomeSecundaria
) {

  const nome =
    String(
      nomeSecundaria || ""
    ).trim();


  if (
    !nome
  ) {

    return "";

  }


  if (
    nomePai ===
    "Cambone"
  ) {

    return nome;

  }


  if (
    nomePai ===
    "Médium em Desenvolvimento"
  ) {

    if (
      nome ===
      "Banco do Desenvolvimento"
    ) {

      return "Banco";

    }


    if (
      nome ===
      "Corrente do Desenvolvimento"
    ) {

      return "Corrente";

    }

  }


  return nome.split(
    /\s+/
  )[0];
}


function criarNomesFuncoesExibicaoDashboard(
  funcoes
) {

  const funcoesPrincipais =
    funcoes.filter(
      (funcao) =>
        !funcao.funcao_pai_id
    );


  const funcoesSecundarias =
    funcoes.filter(
      (funcao) =>
        Boolean(
          funcao.funcao_pai_id
        )
    );


  const resultado =
    [];


  funcoesPrincipais.forEach(
    (funcaoPrincipal) => {

      const secundarias =
        funcoesSecundarias.filter(
          (secundaria) =>
            secundaria.funcao_pai_id ===
            funcaoPrincipal.id
        );


      if (
        secundarias.length ===
        0
      ) {

        resultado.push(
          funcaoPrincipal.nome
        );

        return;

      }


      const nomesSecundarios =
        secundarias
          .map(
            (secundaria) =>
              obterNomeSecundariaDashboard(
                funcaoPrincipal.nome,
                secundaria.nome
              )
          )
          .filter(Boolean);


      if (
        nomesSecundarios.length ===
        0
      ) {

        resultado.push(
          funcaoPrincipal.nome
        );

        return;

      }


      resultado.push(
        `${funcaoPrincipal.nome} - ${nomesSecundarios.join(
          " / "
        )}`
      );

    }
  );


  return resultado;
}/* ==========================================
   FUNÇÕES DO USUÁRIO
========================================== */

async function carregarFuncoesUsuario() {

  if (
    !window.supabaseClient ||
    !listaFuncoesDashboard
  ) {

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

      listaFuncoesDashboard.innerHTML =
        "<p>Nenhuma função atribuída.</p>";

      nomesFuncoesUsuarioDashboard =
        [];

      usuarioIdDashboard =
        null;

      funcoesUsuarioCarregadasDashboard =
        true;


      await atualizarBotoesProximaAtividadeDashboard();

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

      listaFuncoesDashboard.innerHTML =
        "<p>Nenhuma função atribuída.</p>";

      nomesFuncoesUsuarioDashboard =
        [];

      usuarioIdDashboard =
        null;

      funcoesUsuarioCarregadasDashboard =
        true;


      await atualizarBotoesProximaAtividadeDashboard();

      return;

    }


    const usuarioId =
      resultadoUsuario.data.id;


    usuarioIdDashboard =
      usuarioId;


    const resultadoFuncoes =
      await window.supabaseClient
        .from(
          "usuario_funcoes"
        )
        .select(`
          funcao_id,

          funcoes (
            id,
            nome,
            funcao_pai_id
          )
        `)
        .eq(
          "usuario_id",
          usuarioId
        );


    if (
      resultadoFuncoes.error
    ) {

      throw resultadoFuncoes.error;

    }


    const funcoes =
      (
        resultadoFuncoes.data ||
        []
      )
        .map(
          (item) =>
            item.funcoes
        )
        .filter(Boolean);


    listaFuncoesDashboard.innerHTML =
      "";


    const nomesFuncoes =
      funcoes
        .map(
          (funcao) =>
            funcao.nome
        )
        .filter(Boolean);


    if (
      funcoes.length === 0
    ) {

      listaFuncoesDashboard.innerHTML =
        "<p>Nenhuma função atribuída.</p>";

      nomesFuncoesUsuarioDashboard =
        [];

      funcoesUsuarioCarregadasDashboard =
        true;


      await atualizarBotoesProximaAtividadeDashboard();


      await verificarAcessoAdm(
        nomesFuncoes,
        usuarioId
      );


      return;

    }


    const funcoesExibicao =
      criarNomesFuncoesExibicaoDashboard(
        funcoes
      );


    funcoesExibicao.forEach(
      (nome) => {

        const elemento =
          document.createElement(
            "span"
          );


        elemento.className =
          "funcao-dashboard";


        elemento.textContent =
          nome;


        listaFuncoesDashboard.appendChild(
          elemento
        );

      }
    );


    nomesFuncoesUsuarioDashboard =
      [...nomesFuncoes];

    funcoesUsuarioCarregadasDashboard =
      true;


    await atualizarBotoesProximaAtividadeDashboard();


    await verificarAcessoAdm(
      nomesFuncoes,
      usuarioId
    );


  } catch (erro) {

    console.error(
      "Erro ao carregar funções:",
      erro
    );


    listaFuncoesDashboard.innerHTML =
      "<p>Não foi possível carregar suas funções.</p>";


    nomesFuncoesUsuarioDashboard =
      [];

    usuarioIdDashboard =
      null;

    funcoesUsuarioCarregadasDashboard =
      true;


    await atualizarBotoesProximaAtividadeDashboard();

  }
}


/* ==========================================
   ACESSO AO ADM
========================================== */

async function verificarAcessoAdm(
  funcoes,
  usuarioId
) {

  if (
    !itemMenuAdm
  ) {

    return;

  }


  itemMenuAdm.hidden =
    true;


  const funcoesDiretoria = [
    "Presidente",
    "Secretária",
    "Tesoureiro",
    "Pai/Mãe Pequeno (a)",
    "Sacerdote"
  ];


  const pertenceDiretoria =
    funcoes.some(
      (funcao) =>
        funcoesDiretoria.includes(
          funcao
        )
    );


  let ehResponsavelPresenca =
    false;


  try {

    const resultadoResponsavel =
      await window.supabaseClient
        .from(
          "responsaveis_lista_presenca"
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


    ehResponsavelPresenca =
      (
        resultadoResponsavel.data ||
        []
      ).length > 0;


  } catch (erro) {

    console.error(
      "Erro ao verificar responsável por presença:",
      erro
    );

  }


  const possuiAcessoAdm =
    pertenceDiretoria ||
    ehResponsavelPresenca;


  itemMenuAdm.hidden =
    !possuiAcessoAdm;
}


/* ==========================================
   FORMATAÇÃO DAS ATIVIDADES
========================================== */

function criarDataLocal(
  dataISO
) {

  const [
    ano,
    mes,
    dia
  ] =
    dataISO
      .split("-")
      .map(Number);


  return new Date(
    ano,
    mes - 1,
    dia
  );
}


function formatarMesCurto(
  data
) {

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      month:
        "short"
    }
  )
    .format(
      data
    )
    .replace(
      ".",
      ""
    )
    .toUpperCase();
}


function formatarDiaSemana(
  data
) {

  const texto =
    new Intl.DateTimeFormat(
      "pt-BR",
      {
        weekday:
          "long"
      }
    ).format(
      data
    );


  return (
    texto.charAt(
      0
    ).toUpperCase() +
    texto.slice(
      1
    )
  );
}


function removerSegundos(
  horario
) {

  if (
    !horario
  ) {

    return "";

  }


  return horario.slice(
    0,
    5
  );
}


function formatarTipoAtividade(
  atividade
) {

  if (
    atividade.tipo_atividade ===
    "outros"
  ) {

    return (
      atividade.tipo_outro ||
      "Outros"
    );

  }


  const tipos = {

    gira_principal:
      "Gira Principal",

    gira_desenvolvimento:
      "Gira de Desenvolvimento",

    aula:
      "Aula",

    trabalho_cura:
      "Trabalho de Cura",

    eventos:
      "Eventos",

    obrigacoes:
      "Obrigações"

  };


  return (
    tipos[
      atividade.tipo_atividade
    ] ||
    "Atividade"
  );
}


/* ==========================================
   CONFIRMAÇÃO PRÉVIA - REGRAS
========================================== */

function usuarioPodeConfirmarAtividadeDashboard(
  atividade
) {

  if (
    !atividade
  ) {

    return false;

  }


  if (
    atividade.tipo_atividade ===
    "gira_principal"
  ) {

    return nomesFuncoesUsuarioDashboard.some(
      (nome) =>
        nome ===
          "Médium Corrente Principal" ||
        nome ===
          "Médium Principal"
    );

  }


  if (
    atividade.tipo_atividade ===
    "gira_desenvolvimento"
  ) {

    return nomesFuncoesUsuarioDashboard.includes(
      "Médium em Desenvolvimento"
    );

  }


  return false;
}


/* ==========================================
   DIRETORIA
========================================== */

function usuarioEhDiretoriaDashboard() {

  const funcoesDiretoria = [
    "Presidente",
    "Secretária",
    "Tesoureiro",
    "Pai/Mãe Pequeno (a)",
    "Sacerdote"
  ];


  return nomesFuncoesUsuarioDashboard.some(
    (nome) =>
      funcoesDiretoria.includes(
        nome
      )
  );
}


function atividadePermiteAusenciasDashboard(
  atividade
) {

  if (
    !atividade
  ) {

    return false;

  }


  return (
    atividade.tipo_atividade ===
      "gira_principal" ||
    atividade.tipo_atividade ===
      "gira_desenvolvimento"
  );
}


/* ==========================================
   BUSCAR CONFIRMAÇÃO DO MÉDIUM
========================================== */

async function buscarConfirmacaoDashboard() {

  confirmacaoAtualDashboard =
    null;


  if (
    !usuarioIdDashboard ||
    !proximaAtividadeAtualDashboard
  ) {

    return;

  }


  const resultado =
    await window.supabaseClient
      .from(
        "confirmacoes_presenca"
      )
      .select(`
        resposta,
        justificativa,
        lido_diretoria
      `)
      .eq(
        "atividade_id",
        proximaAtividadeAtualDashboard.id
      )
      .eq(
        "usuario_id",
        usuarioIdDashboard
      )
      .limit(
        1
      );


  if (
    resultado.error
  ) {

    console.error(
      "Erro ao buscar confirmação no dashboard:",
      resultado.error
    );


    return;

  }


  const registros =
    resultado.data ||
    [];


  if (
    registros.length === 0
  ) {

    return;

  }


  confirmacaoAtualDashboard =
    registros[0];
}


/* ==========================================
   BOTÃO / STATUS DO MÉDIUM
========================================== */

function criarBotaoConfirmacaoMediumDashboard(
  area
) {

  const botao =
    document.createElement(
      "button"
    );


  botao.type =
    "button";

  botao.id =
    "botaoConfirmarPresencaDashboard";

  botao.className =
    "botao-confirmar-presenca-dashboard";


  if (
    !confirmacaoAtualDashboard
  ) {

    botao.textContent =
      "Confirmar presença";

  }


  if (
    confirmacaoAtualDashboard
      ?.resposta ===
    "presente"
  ) {

    botao.textContent =
      "Presença confirmada - Clique para alterar";


    botao.style.background =
      "#dff3e4";

    botao.style.borderColor =
      "#70ad7d";

    botao.style.color =
      "#246b35";

  }


  if (
    confirmacaoAtualDashboard
      ?.resposta ===
    "ausente"
  ) {

    botao.textContent =
      "Ausência confirmada - Clique para alterar";


    botao.style.background =
      "#f7dddd";

    botao.style.borderColor =
      "#c97575";

    botao.style.color =
      "#9a2929";

  }


  botao.addEventListener(
    "click",
    () => {

      window.location.href =
        "confirmar-presenca.html";

    }
  );


  area.appendChild(
    botao
  );


  if (
    confirmacaoAtualDashboard
      ?.resposta ===
      "ausente"
  ) {

    const possuiJustificativa =
      Boolean(
        String(
          confirmacaoAtualDashboard
            .justificativa ||
          ""
        ).trim()
      );


    if (
      !possuiJustificativa
    ) {

      const alerta =
        document.createElement(
          "div"
        );


      alerta.textContent =
        "⚠ Falta justificativa";


      alerta.style.marginTop =
        "6px";

      alerta.style.padding =
        "7px 10px";

      alerta.style.borderRadius =
        "9px";

      alerta.style.background =
        "#fff0c7";

      alerta.style.color =
        "#8a6500";

      alerta.style.fontSize =
        "12px";

      alerta.style.fontWeight =
        "700";


      area.appendChild(
        alerta
      );

    }


    if (
      confirmacaoAtualDashboard
        .lido_diretoria
    ) {

      const lido =
        document.createElement(
          "div"
        );


      lido.textContent =
        "✓ Lido pela diretoria espiritual";


      lido.style.marginTop =
        "6px";

      lido.style.padding =
        "7px 10px";

      lido.style.borderRadius =
        "9px";

      lido.style.background =
        "#e4f3e8";

      lido.style.color =
        "#267341";

      lido.style.fontSize =
        "12px";

      lido.style.fontWeight =
        "700";


      area.appendChild(
        lido
      );

    }

  }

}
