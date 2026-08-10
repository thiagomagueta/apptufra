"use strict";

/* ==========================================
   ELEMENTOS DO DASHBOARD
========================================== */

const saudacaoDashboard = document.getElementById(
  "saudacaoDashboard"
);

const fotoUsuarioDashboard = document.getElementById(
  "fotoUsuarioDashboard"
);

const fotoUsuarioPadrao = document.getElementById(
  "fotoUsuarioPadrao"
);

const listaFuncoesDashboard = document.getElementById(
  "listaFuncoesDashboard"
);

const areaAdministrativo = document.getElementById(
  "areaAdministrativo"
);
const proximaAtividadeDashboard =
  document.getElementById(
    "proximaAtividadeDashboard"
  );

/* ==========================================
   USUÁRIO LOGADO
========================================== */

function carregarUsuarioLogado() {
  try {
    const dados = sessionStorage.getItem(
      "tufra_usuario_logado"
    );

    return dados
      ? JSON.parse(dados)
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

function obterPrimeiroNome(nomeCompleto) {
  const nome =
    String(nomeCompleto || "").trim();

  if (!nome) {
    return "";
  }

  return nome.split(/\s+/)[0];
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

  if (!saudacaoDashboard) {
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
        .from("usuarios")
        .select("foto_path")
        .eq(
          "auth_id",
          usuario.authId
        )
        .maybeSingle();

    if (resultadoUsuario.error) {
      throw resultadoUsuario.error;
    }

    const fotoPath =
      resultadoUsuario.data?.foto_path;

    if (!fotoPath) {
      return;
    }

    const resultadoFoto =
      await window.supabaseClient.storage
        .from("fotos-associados")
        .createSignedUrl(
          fotoPath,
          60 * 60
        );

    if (resultadoFoto.error) {
      throw resultadoFoto.error;
    }

    const urlFoto =
      resultadoFoto.data?.signedUrl;

    if (!urlFoto) {
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

    if (resultadoSessao.error) {
      throw resultadoSessao.error;
    }

    const sessao =
      resultadoSessao.data.session;

    if (!sessao) {
      listaFuncoesDashboard.innerHTML =
        "<p>Nenhuma função atribuída.</p>";

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
      listaFuncoesDashboard.innerHTML =
        "<p>Nenhuma função atribuída.</p>";

      return;
    }

    const usuarioId =
      resultadoUsuario.data.id;

    const resultadoFuncoes =
      await window.supabaseClient
        .from("usuario_funcoes")
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

    if (resultadoFuncoes.error) {
      throw resultadoFuncoes.error;
    }

    const funcoes =
      resultadoFuncoes.data || [];

    listaFuncoesDashboard.innerHTML =
      "";

    if (funcoes.length === 0) {
      listaFuncoesDashboard.innerHTML =
        "<p>Nenhuma função atribuída.</p>";

      return;
    }

    const nomesFuncoes = [];

    funcoes.forEach((item) => {
      const nome =
        item.funcoes?.nome;

      if (!nome) {
        return;
      }

      nomesFuncoes.push(nome);

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
    });

    verificarAdministrativo(
      nomesFuncoes
    );

  } catch (erro) {
    console.error(
      "Erro ao carregar funções:",
      erro
    );

    listaFuncoesDashboard.innerHTML =
      "<p>Não foi possível carregar suas funções.</p>";
  }
}


/* ==========================================
   ACESSO ADMINISTRATIVO
========================================== */

function verificarAdministrativo(funcoes) {
  if (!areaAdministrativo) {
    return;
  }

  const funcoesAdministrativas = [
    "Presidente",
    "Secretária",
    "Tesoureiro",
    "Pai/Mãe Pequeno (a)",
    "Sacerdote",
    "Líder dos Ogans",
    "Líder dos Cambones",
    "Líder da Cantina"
  ];

  const possuiAcesso =
    funcoes.some((funcao) =>
      funcoesAdministrativas.includes(funcao)
    );

  areaAdministrativo.hidden =
    !possuiAcesso;

  if (!possuiAcesso) {
    return;
  }

areaAdministrativo.href =
  "administrativo.html";
}
function criarDataLocal(dataISO) {
  const [ano, mes, dia] =
    dataISO.split("-").map(Number);

  return new Date(
    ano,
    mes - 1,
    dia
  );
}

function formatarMesCurto(data) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      month: "short"
    }
  )
    .format(data)
    .replace(".", "")
    .toUpperCase();
}

function formatarDiaSemana(data) {
  const texto =
    new Intl.DateTimeFormat(
      "pt-BR",
      {
        weekday: "long"
      }
    ).format(data);

  return (
    texto.charAt(0).toUpperCase() +
    texto.slice(1)
  );
}

function removerSegundos(horario) {
  if (!horario) {
    return "";
  }

  return horario.slice(0, 5);
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
    ] || "Atividade"
  );
}

async function carregarProximaAtividade() {
  if (
    !window.supabaseClient ||
    !proximaAtividadeDashboard
  ) {
    return;
  }

  try {
    const agora =
      new Date();

    const ano =
      agora.getFullYear();

    const mes =
      String(
        agora.getMonth() + 1
      ).padStart(2, "0");

    const dia =
      String(
        agora.getDate()
      ).padStart(2, "0");

    const hojeISO =
      `${ano}-${mes}-${dia}`;

    const resultado =
      await window.supabaseClient
        .from("atividades")
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
            ascending: true
          }
        )
        .order(
          "hora_inicio",
          {
            ascending: true
          }
        );

    if (resultado.error) {
      throw resultado.error;
    }

    const atividades =
      resultado.data || [];

    const agoraMinutos =
      agora.getHours() * 60 +
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

          if (!horario) {
            return true;
          }

          const [
            hora,
            minuto
          ] =
            horario
              .split(":")
              .map(Number);

          const atividadeMinutos =
            hora * 60 + minuto;

          return (
            atividadeMinutos >=
            agoraMinutos
          );
        }
      );

    if (!proxima) {
      proximaAtividadeDashboard.innerHTML =
        `
          <div class="dados-atividade">
            <span>
              Nenhuma próxima atividade cadastrada.
            </span>
          </div>
        `;

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
          ${formatarMesCurto(data)}
        </div>

        <div class="dados-atividade">

          <strong>
            ${tipo}
          </strong>

          <strong>
            ${proxima.titulo}
          </strong>

          <span>
            ${formatarDiaSemana(data)}
            ${horario
              ? ` • ${horario}`
              : ""}
          </span>

        </div>
      `;

  } catch (erro) {
    console.error(
      "Erro ao carregar próxima atividade:",
      erro
    );

    proximaAtividadeDashboard.innerHTML =
      `
        <div class="dados-atividade">
          <span>
            Não foi possível carregar a próxima atividade.
          </span>
        </div>
      `;
  }
}

/* ==========================================
   INICIALIZAÇÃO DO DASHBOARD
========================================== */

atualizarSaudacao();
carregarFotoUsuario();
carregarFuncoesUsuario();
carregarProximaAtividade();
