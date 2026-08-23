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
   CONFIRMAÇÃO PRÉVIA DA PRÓXIMA ATIVIDADE
========================================== */

let proximaAtividadeAtualDashboard =
  null;

let nomesFuncoesUsuarioDashboard =
  [];

let proximaAtividadeCarregadaDashboard =
  false;

let funcoesUsuarioCarregadasDashboard =
  false;


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

      funcoesUsuarioCarregadasDashboard =
        true;

      atualizarBotoesProximaAtividadeDashboard();


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

      funcoesUsuarioCarregadasDashboard =
        true;

      atualizarBotoesProximaAtividadeDashboard();


      return;

    }


    const usuarioId =
      resultadoUsuario.data.id;


    const resultadoFuncoes =
      await window.supabaseClient
        .from(
          "usuario_funcoes"
        )
        .select(`
          funcao_id,

          funcoes (
            id,
            nome
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
      resultadoFuncoes.data ||
      [];


    listaFuncoesDashboard.innerHTML =
      "";


    const nomesFuncoes =
      [];


    if (
      funcoes.length === 0
    ) {

      listaFuncoesDashboard.innerHTML =
        "<p>Nenhuma função atribuída.</p>";


      nomesFuncoesUsuarioDashboard =
        [];

      funcoesUsuarioCarregadasDashboard =
        true;

      atualizarBotoesProximaAtividadeDashboard();


      await verificarAcessoAdm(
        nomesFuncoes,
        usuarioId
      );


      return;

    }


    funcoes.forEach(
      (item) => {

        const nome =
          item.funcoes?.nome;


        if (
          !nome
        ) {

          return;

        }


        nomesFuncoes.push(
          nome
        );


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

    atualizarBotoesProximaAtividadeDashboard();


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

    funcoesUsuarioCarregadasDashboard =
      true;

    atualizarBotoesProximaAtividadeDashboard();

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
   DIRETORIA - REGRAS
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
   BOTÕES DA PRÓXIMA ATIVIDADE
========================================== */

function atualizarBotoesProximaAtividadeDashboard() {

  if (
    !proximaAtividadeCarregadaDashboard ||
    !funcoesUsuarioCarregadasDashboard
  ) {

    return;

  }


  const area =
    document.getElementById(
      "areaConfirmacaoProximaAtividadeDashboard"
    );


  if (
    !area
  ) {

    return;

  }


  const podeConfirmar =
    usuarioPodeConfirmarAtividadeDashboard(
      proximaAtividadeAtualDashboard
    );


  const podeVerAusencias =
    usuarioEhDiretoriaDashboard() &&
    atividadePermiteAusenciasDashboard(
      proximaAtividadeAtualDashboard
    );


  area.innerHTML =
    "";


  if (
    !podeConfirmar &&
    !podeVerAusencias
  ) {

    area.hidden =
      true;

    return;

  }


  area.hidden =
    false;


  /* ======================================
     BOTÃO DO MÉDIUM
  ====================================== */

  if (
    podeConfirmar
  ) {

    const botaoConfirmar =
      document.createElement(
        "button"
      );


    botaoConfirmar.type =
      "button";

    botaoConfirmar.id =
      "botaoConfirmarPresencaDashboard";

    botaoConfirmar.className =
      "botao-confirmar-presenca-dashboard";

    botaoConfirmar.textContent =
      "Confirmar presença";


    botaoConfirmar.addEventListener(
      "click",
      () => {

        window.location.href =
          "confirmar-presenca.html";

      }
    );


    area.appendChild(
      botaoConfirmar
    );

  }


  /* ======================================
     BOTÃO DA DIRETORIA
  ====================================== */

  if (
    podeVerAusencias
  ) {

    const botaoAusencias =
      document.createElement(
        "button"
      );


    botaoAusencias.type =
      "button";

    botaoAusencias.id =
      "botaoVerAusenciasDashboard";

    botaoAusencias.className =
      "botao-ver-ausencias-dashboard";

    botaoAusencias.textContent =
      "Ver ausências";


    botaoAusencias.addEventListener(
      "click",
      () => {

        window.location.href =
          "ausencias-atividade.html";

      }
    );


    area.appendChild(
      botaoAusencias
    );

  }

}


/* ==========================================
   PRÓXIMA ATIVIDADE
========================================== */

async function carregarProximaAtividade() {

  if (
    !window.supabaseClient ||
    !proximaAtividadeDashboard
  ) {

    return;

  }


  try {

    proximaAtividadeAtualDashboard =
      null;

    proximaAtividadeCarregadaDashboard =
      false;


    const agora =
      new Date();


    const ano =
      agora.getFullYear();


    const mes =
      String(
        agora.getMonth() + 1
      ).padStart(
        2,
        "0"
      );


    const dia =
      String(
        agora.getDate()
      ).padStart(
        2,
        "0"
      );


    const hojeISO =
      `${ano}-${mes}-${dia}`;


    const resultado =
      await window.supabaseClient
        .from(
          "atividades"
        )
        .select(`
          id,
          titulo,
          data,
          hora_inicio,
          tipo_atividade,
          tipo_outro
        `)
        .gte(
          "data",
          hojeISO
        )
        .order(
          "data",
          {
            ascending:
              true
          }
        )
        .order(
          "hora_inicio",
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


    const agoraMinutos =
      agora.getHours() *
        60 +
      agora.getMinutes();


    const proxima =
      atividades.find(
        (atividade) => {

          if (
            atividade.data !==
            hojeISO
          ) {

            return true;

          }


          const horario =
            removerSegundos(
              atividade.hora_inicio
            );


          if (
            !horario
          ) {

            return true;

          }


          const [
            hora,
            minuto
          ] =
            horario
              .split(
                ":"
              )
              .map(
                Number
              );


          const atividadeMinutos =
            hora * 60 +
            minuto;


          return (
            atividadeMinutos >=
            agoraMinutos
          );

        }
      );


    if (
      !proxima
    ) {

      proximaAtividadeAtualDashboard =
        null;

      proximaAtividadeCarregadaDashboard =
        true;


      proximaAtividadeDashboard.innerHTML =
        `
          <div class="dados-atividade">
            <span>
              Nenhuma próxima atividade cadastrada.
            </span>
          </div>
        `;


      atualizarBotoesProximaAtividadeDashboard();


      return;

    }


    const data =
      criarDataLocal(
        proxima.data
      );


    const horario =
      removerSegundos(
        proxima.hora_inicio
      );


    const tipo =
      formatarTipoAtividade(
        proxima
      );


    proximaAtividadeAtualDashboard =
      proxima;

    proximaAtividadeCarregadaDashboard =
      true;


    proximaAtividadeDashboard.innerHTML =
      `
        <div class="data-atividade">

          ${String(
            data.getDate()
          ).padStart(
            2,
            "0"
          )}

          <br>

          ${formatarMesCurto(
            data
          )}

        </div>


        <div class="dados-atividade">

          <strong>
            ${tipo}
          </strong>

          <strong>
            ${proxima.titulo}
          </strong>

          <span>

            ${formatarDiaSemana(
              data
            )}

            ${
              horario
                ? ` • ${horario}`
                : ""
            }

          </span>

        </div>


        <div
          id="areaConfirmacaoProximaAtividadeDashboard"
          class="area-confirmacao-proxima-atividade"
          hidden
        >
        </div>
      `;


    atualizarBotoesProximaAtividadeDashboard();


  } catch (erro) {

    console.error(
      "Erro ao carregar próxima atividade:",
      erro
    );


    proximaAtividadeAtualDashboard =
      null;

    proximaAtividadeCarregadaDashboard =
      true;


    proximaAtividadeDashboard.innerHTML =
      `
        <div class="dados-atividade">

          <span>
            Não foi possível carregar a próxima atividade.
          </span>

        </div>
      `;


    atualizarBotoesProximaAtividadeDashboard();

  }
}


/* ==========================================
   DATA ATUAL PARA PRESENÇA
========================================== */

function obterDataAtualISOPresencaDashboard() {

  const hoje =
    new Date();


  const ano =
    hoje.getFullYear();


  const mes =
    String(
      hoje.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const dia =
    String(
      hoje.getDate()
    ).padStart(
      2,
      "0"
    );


  return `${ano}-${mes}-${dia}`;
}


/* ==========================================
   DATA CURTA
========================================== */

function formatarDataCurtaPresencaDashboard(
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


  return `${partes[2]}/${partes[1]}`;
}


/* ==========================================
   FUNÇÃO PRINCIPAL
========================================== */

function possuiFuncaoPrincipalDashboard(
  nome
) {

  return funcoesPresencaDashboard.some(
    (funcao) =>
      funcao.nome ===
        nome &&
      !funcao.funcao_pai_id
  );
}


/* ==========================================
   LISTAS ATUAIS
========================================== */

function obterListasAtuaisDashboard() {

  const listas =
    [];


  if (
    possuiFuncaoPrincipalDashboard(
      "Médium Corrente Principal"
    ) ||
    possuiFuncaoPrincipalDashboard(
      "Médium Principal"
    )
  ) {

    listas.push(
      "Corrente Principal"
    );

  }


  if (
    possuiFuncaoPrincipalDashboard(
      "Médium em Desenvolvimento"
    )
  ) {

    listas.push(
      "Desenvolvimento"
    );

  }


  if (
    possuiFuncaoPrincipalDashboard(
      "Ogam"
    )
  ) {

    listas.push(
      "Ogans"
    );

  }


  if (
    possuiFuncaoPrincipalDashboard(
      "Cambone"
    )
  ) {

    listas.push(
      "Cambones"
    );

  }


  if (
    possuiFuncaoPrincipalDashboard(
      "Cantina"
    )
  ) {

    listas.push(
      "Cantina"
    );

  }


  return listas;
}


/* ==========================================
   DATA DE ENTRADA NA LISTA
========================================== */

function obterDataEntradaListaDashboard(
  nomeLista
) {

  if (
    !usuarioPresencaDashboard
  ) {

    return null;

  }


  if (
    nomeLista ===
    "Corrente Principal"
  ) {

    return (
      usuarioPresencaDashboard
        .data_corrente_principal ||
      usuarioPresencaDashboard
        .data_entrada_tufra ||
      null
    );

  }


  if (
    nomeLista ===
    "Desenvolvimento"
  ) {

    return (
      usuarioPresencaDashboard
        .data_corrente_desenvolvimento ||
      usuarioPresencaDashboard
        .data_entrada_tufra ||
      null
    );

  }


  let nomeHistorico =
    null;


  if (
    nomeLista ===
    "Ogans"
  ) {

    nomeHistorico =
      "Ogam";

  }


  if (
    nomeLista ===
    "Cambones"
  ) {

    nomeHistorico =
      "Cambone";

  }


  if (
    nomeLista ===
    "Cantina"
  ) {

    nomeHistorico =
      "Cantina";

  }


  if (
    nomeHistorico
  ) {

    const periodosAtuais =
      historicoPresencaDashboard
        .filter(
          (registro) =>
            registro.funcao_nome ===
              nomeHistorico &&
            !registro.data_fim
        )
        .sort(
          (a, b) =>
            String(
              b.data_inicio || ""
            ).localeCompare(
              String(
                a.data_inicio || ""
              )
            )
        );


    if (
      periodosAtuais[0]
        ?.data_inicio
    ) {

      return periodosAtuais[0]
        .data_inicio;

    }

  }


  return (
    usuarioPresencaDashboard
      .data_entrada_tufra ||
    null
  );
}


/* ==========================================
   BUSCAR TIPO DA LISTA
========================================== */

async function buscarTipoListaDashboard(
  nomeLista
) {

  const resultado =
    await window.supabaseClient
      .from(
        "tipos_lista_presenca"
      )
      .select(`
        id,
        nome,
        tipo_atividade,
        ativo,
        ordem
      `)
      .eq(
        "nome",
        nomeLista
      )
      .eq(
        "ativo",
        true
      )
      .maybeSingle();


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  return resultado.data ||
    null;
}


/* ==========================================
   ÚLTIMAS 10 ATIVIDADES
========================================== */

async function buscarUltimasAtividadesDashboard(
  tipoAtividade
) {

  const hojeISO =
    obterDataAtualISOPresencaDashboard();


  const resultado =
    await window.supabaseClient
      .from(
        "atividades"
      )
      .select(`
        id,
        titulo,
        data,
        hora_inicio,
        tipo_atividade
      `)
      .eq(
        "tipo_atividade",
        tipoAtividade
      )
      .lte(
        "data",
        hojeISO
      )
      .order(
        "data",
        {
          ascending:
            false
        }
      )
      .order(
        "hora_inicio",
        {
          ascending:
            false
        }
      )
      .limit(
        10
      );


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  return (
    resultado.data ||
    []
  ).reverse();
}


/* ==========================================
   BUSCAR PRESENÇAS
========================================== */

async function buscarPresencasDashboard(
  tipoListaId,
  atividades
) {

  if (
    !usuarioPresencaDashboard ||
    atividades.length === 0
  ) {

    return [];

  }


  const idsAtividades =
    atividades.map(
      (atividade) =>
        atividade.id
    );


  const resultado =
    await window.supabaseClient
      .from(
        "presencas"
      )
      .select(`
        atividade_id,
        usuario_id,
        status
      `)
      .eq(
        "tipo_lista_id",
        tipoListaId
      )
      .eq(
        "usuario_id",
        usuarioPresencaDashboard.id
      )
      .in(
        "atividade_id",
        idsAtividades
      );


  if (
    resultado.error
  ) {

    throw resultado.error;

  }


  return resultado.data ||
    [];
}


/* ==========================================
   SITUAÇÃO
========================================== */

function obterSituacaoPresencaDashboard(
  atividade,
  presencas,
  dataEntradaLista
) {

  if (
    dataEntradaLista &&
    atividade.data <
      dataEntradaLista
  ) {

    return {

      texto:
        "x",

      tipo:
        "nao_participava",

      classe:
        "status-relatorio-nao-participava"

    };

  }


  const registro =
    presencas.find(
      (item) =>
        item.atividade_id ===
        atividade.id
    );


  if (
    registro?.status ===
    "presente"
  ) {

    return {

      texto:
        "P",

      tipo:
        "presente",

      classe:
        "status-relatorio-presente"

    };

  }


  if (
    registro?.status ===
    "falta"
  ) {

    return {

      texto:
        "F",

      tipo:
        "falta",

      classe:
        "status-relatorio-falta"

    };

  }


  if (
    registro?.status ===
    "justificada"
  ) {

    return {

      texto:
        "J",

      tipo:
        "justificada",

      classe:
        "status-relatorio-justificado"

    };

  }


  return {

    texto:
      "—",

    tipo:
      "pendente",

    classe:
      "status-relatorio-pendente"

  };
}


/* ==========================================
   CALCULAR RESUMO
========================================== */

function calcularResumoPresencaDashboard(
  atividades,
  presencas,
  dataEntradaLista
) {

  let presentes =
    0;

  let faltas =
    0;

  let justificadas =
    0;


  atividades.forEach(
    (atividade) => {

      const situacao =
        obterSituacaoPresencaDashboard(
          atividade,
          presencas,
          dataEntradaLista
        );


      if (
        situacao.tipo ===
        "presente"
      ) {

        presentes++;

      }


      if (
        situacao.tipo ===
        "falta"
      ) {

        faltas++;

      }


      if (
        situacao.tipo ===
        "justificada"
      ) {

        justificadas++;

      }

    }
  );


  const totalValidos =
    presentes +
    faltas +
    justificadas;


  let frequencia =
    null;


  if (
    totalValidos > 0
  ) {

    frequencia =
      (
        presentes /
        totalValidos
      ) * 100;

  }


  return {

    presentes,
    faltas,
    justificadas,
    frequencia

  };
}


/* ==========================================
   CRIAR BLOCO DA LISTA
========================================== */

function criarBlocoPresencaDashboard(
  tipoLista,
  atividades,
  presencas
) {

  const bloco =
    document.createElement(
      "div"
    );


  bloco.className =
    "bloco-resumo-presenca-associado";


  const titulo =
    document.createElement(
      "h3"
    );


  titulo.className =
    "titulo-resumo-presenca-associado";


  titulo.textContent =
    tipoLista.nome;


  bloco.appendChild(
    titulo
  );


  if (
    atividades.length === 0
  ) {

    const mensagem =
      document.createElement(
        "p"
      );


    mensagem.className =
      "mensagem-sem-atividades";


    mensagem.textContent =
      "Nenhuma atividade realizada.";


    bloco.appendChild(
      mensagem
    );


    return bloco;

  }


  const dataEntradaLista =
    obterDataEntradaListaDashboard(
      tipoLista.nome
    );


  const resumo =
    calcularResumoPresencaDashboard(
      atividades,
      presencas,
      dataEntradaLista
    );


  const container =
    document.createElement(
      "div"
    );


  container.className =
    "container-tabela-relatorio-presenca";


  const tabela =
    document.createElement(
      "table"
    );


  tabela.className =
    "tabela-relatorio-presenca tabela-resumo-presenca-associado";


  const thead =
    document.createElement(
      "thead"
    );


  const linhaCabecalho =
    document.createElement(
      "tr"
    );


  atividades.forEach(
    (atividade) => {

      const th =
        document.createElement(
          "th"
        );


      th.className =
        "coluna-data-relatorio";


      th.textContent =
        formatarDataCurtaPresencaDashboard(
          atividade.data
        );


      th.title =
        atividade.titulo;


      linhaCabecalho.appendChild(
        th
      );

    }
  );


  [
    "P",
    "F",
    "J",
    "Freq."
  ].forEach(
    (texto) => {

      const th =
        document.createElement(
          "th"
        );


      th.className =
        "coluna-resumo-presenca-final";


      if (
        texto ===
        "Freq."
      ) {

        th.classList.add(
          "coluna-resumo-presenca-frequencia"
        );

      }


      th.textContent =
        texto;


      linhaCabecalho.appendChild(
        th
      );

    }
  );


  thead.appendChild(
    linhaCabecalho
  );


  tabela.appendChild(
    thead
  );


  const tbody =
    document.createElement(
      "tbody"
    );


  const linha =
    document.createElement(
      "tr"
    );


  atividades.forEach(
    (atividade) => {

      const td =
        document.createElement(
          "td"
        );


      td.className =
        "celula-status-relatorio";


      const situacao =
        obterSituacaoPresencaDashboard(
          atividade,
          presencas,
          dataEntradaLista
        );


      td.textContent =
        situacao.texto;


      if (
        situacao.classe
      ) {

        td.classList.add(
          situacao.classe
        );

      }


      linha.appendChild(
        td
      );

    }
  );


  const tdP =
    document.createElement(
      "td"
    );


  tdP.className =
    "valor-atividade-presente coluna-resumo-presenca-final";


  tdP.textContent =
    String(
      resumo.presentes
    );


  linha.appendChild(
    tdP
  );


  const tdF =
    document.createElement(
      "td"
    );


  tdF.className =
    "valor-atividade-falta coluna-resumo-presenca-final";


  tdF.textContent =
    String(
      resumo.faltas
    );


  linha.appendChild(
    tdF
  );


  const tdJ =
    document.createElement(
      "td"
    );


  tdJ.className =
    "valor-atividade-justificada coluna-resumo-presenca-final";


  tdJ.textContent =
    String(
      resumo.justificadas
    );


  linha.appendChild(
    tdJ
  );


  const tdFreq =
    document.createElement(
      "td"
    );


  tdFreq.className =
    "valor-frequencia-atividade coluna-resumo-presenca-frequencia";


  if (
    resumo.frequencia ===
    null
  ) {

    tdFreq.textContent =
      "—";

  } else {

    tdFreq.textContent =
      `${resumo.frequencia
        .toFixed(
          1
        )
        .replace(
          ".",
          ","
        )}%`;

  }


  linha.appendChild(
    tdFreq
  );


  tbody.appendChild(
    linha
  );


  tabela.appendChild(
    tbody
  );


  container.appendChild(
    tabela
  );


  bloco.appendChild(
    container
  );


  return bloco;
}


/* ==========================================
   CARREGAR DADOS DO USUÁRIO PARA PRESENÇA
========================================== */

async function carregarDadosPresencaDashboard() {

  if (
    !window.supabaseClient ||
    !areaPresencaDashboard
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

      return;

    }


    const resultadoUsuario =
      await window.supabaseClient
        .from(
          "usuarios"
        )
        .select(`
          id,
          data_entrada_tufra,
          data_corrente_desenvolvimento,
          data_corrente_principal,

          usuario_funcoes!usuario_funcoes_usuario_id_fkey (

            funcoes (
              id,
              nome,
              funcao_pai_id
            )

          )
        `)
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


    usuarioPresencaDashboard =
      resultadoUsuario.data;


    funcoesPresencaDashboard =
      (
        resultadoUsuario.data
          .usuario_funcoes ||
        []
      )
        .map(
          (item) =>
            item.funcoes
        )
        .filter(
          Boolean
        );


    const resultadoHistorico =
      await window.supabaseClient
        .from(
          "historico_funcoes_associado"
        )
        .select(`
          id,
          funcao_nome,
          data_inicio,
          data_fim
        `)
        .eq(
          "usuario_id",
          usuarioPresencaDashboard.id
        );


    if (
      resultadoHistorico.error
    ) {

      throw resultadoHistorico.error;

    }


    historicoPresencaDashboard =
      resultadoHistorico.data ||
      [];


    await carregarResumoPresencaDashboard();


  } catch (erro) {

    console.error(
      "Erro ao carregar presença do dashboard:",
      erro
    );


    areaPresencaDashboard.hidden =
      false;


    listasPresencaDashboard.innerHTML =
      "<p>Não foi possível carregar suas presenças.</p>";

  }
}


/* ==========================================
   CARREGAR RESUMO DE PRESENÇA
========================================== */

async function carregarResumoPresencaDashboard() {

  listasPresencaDashboard.innerHTML =
    "";


  const nomesListas =
    obterListasAtuaisDashboard();


  if (
    nomesListas.length === 0
  ) {

    areaPresencaDashboard.hidden =
      true;


    return;

  }


  areaPresencaDashboard.hidden =
    false;


  mensagemSemPresencaDashboard.hidden =
    true;


  for (
    const nomeLista of nomesListas
  ) {

    const tipoLista =
      await buscarTipoListaDashboard(
        nomeLista
      );


    if (
      !tipoLista
    ) {

      continue;

    }


    const atividades =
      await buscarUltimasAtividadesDashboard(
        tipoLista.tipo_atividade
      );


    const presencas =
      await buscarPresencasDashboard(
        tipoLista.id,
        atividades
      );


    const bloco =
      criarBlocoPresencaDashboard(
        tipoLista,
        atividades,
        presencas
      );


    listasPresencaDashboard.appendChild(
      bloco
    );

  }


  if (
    listasPresencaDashboard.children.length ===
    0
  ) {

    mensagemSemPresencaDashboard.hidden =
      false;

  }
}


/* ==========================================
   INICIALIZAÇÃO DO DASHBOARD
========================================== */

atualizarSaudacao();

carregarFotoUsuario();

carregarFuncoesUsuario();

carregarProximaAtividade();

carregarDadosPresencaDashboard();
