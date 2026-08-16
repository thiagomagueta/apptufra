"use strict";


/* ==========================================
   ELEMENTOS DA TELA
========================================== */

const tituloPermissaoUsuario =
  document.getElementById(
    "tituloPermissaoUsuario"
  );

const subtituloPermissaoUsuario =
  document.getElementById(
    "subtituloPermissaoUsuario"
  );

const nomeUsuarioPermissao =
  document.getElementById(
    "nomeUsuarioPermissao"
  );

const emailUsuarioPermissao =
  document.getElementById(
    "emailUsuarioPermissao"
  );

const statusUsuarioPermissao =
  document.getElementById(
    "statusUsuarioPermissao"
  );

const fotoUsuarioPermissao =
  document.getElementById(
    "fotoUsuarioPermissao"
  );

const fotoUsuarioPermissaoPadrao =
  document.getElementById(
    "fotoUsuarioPermissaoPadrao"
  );

const listaFuncoesPermissao =
  document.getElementById(
    "listaFuncoesPermissao"
  );

const areaAprovacaoCadastro =
  document.getElementById(
    "areaAprovacaoCadastro"
  );

const botaoAprovarCadastro =
  document.getElementById(
    "botaoAprovarCadastro"
  );

const areaSalvarFuncoes =
  document.getElementById(
    "areaSalvarFuncoes"
  );

const botaoSalvarFuncoes =
  document.getElementById(
    "botaoSalvarFuncoes"
  );

const mensagemSalvarFuncoes =
  document.getElementById(
    "mensagemSalvarFuncoes"
  );

const modalFotoUsuario =
  document.getElementById(
    "modalFotoUsuario"
  );

const fecharModalFoto =
  document.getElementById(
    "fecharModalFoto"
  );

const fotoUsuarioAmpliada =
  document.getElementById(
    "fotoUsuarioAmpliada"
  );

const areaZoomFoto =
  document.getElementById(
    "areaZoomFoto"
  );

const aumentarZoomFoto =
  document.getElementById(
    "aumentarZoomFoto"
  );

const diminuirZoomFoto =
  document.getElementById(
    "diminuirZoomFoto"
  );

const resetarZoomFoto =
  document.getElementById(
    "resetarZoomFoto"
  );


let zoomFoto = 1;

let distanciaToqueInicial =
  null;


/* ==========================================
   PARÂMETROS DA PÁGINA
========================================== */

function obterParametros() {

  const parametros =
    new URLSearchParams(
      window.location.search
    );


  return {

    usuarioId:
      parametros.get(
        "id"
      ),

    tipo:
      parametros.get(
        "tipo"
      )

  };
}


/* ==========================================
   FORMATAÇÃO
========================================== */

function formatarNome(
  nomeCompleto
) {

  return String(
    nomeCompleto || ""
  )
    .trim()
    .toLowerCase()
    .replace(
      /\b\p{L}/gu,
      (letra) =>
        letra.toUpperCase()
    );
}


/* ==========================================
   DATA LOCAL
========================================== */

function obterDataHojeISO() {

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


  return `${ano}-${mes}-${dia}`;
}


/* ==========================================
   FOTO
========================================== */

async function carregarFoto(
  fotoPath
) {

  if (!fotoPath) {
    return;
  }


  try {

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
      resultadoFoto.error ||
      !resultadoFoto.data?.signedUrl
    ) {

      return;

    }


    fotoUsuarioPermissao.src =
      resultadoFoto.data.signedUrl;


    fotoUsuarioPermissao.hidden =
      false;


    fotoUsuarioPermissaoPadrao.hidden =
      true;


  } catch (erro) {

    console.error(
      "Erro ao carregar foto:",
      erro
    );

  }
}


/* ==========================================
   CHECKBOX DAS FUNÇÕES
========================================== */

function criarCheckboxFuncao(
  funcao,
  funcoesUsuario
) {

  const linha =
    document.createElement(
      "label"
    );


  linha.className =
    funcao.funcao_pai_id
      ? "linha-funcao linha-subfuncao"
      : "linha-funcao";


  const checkbox =
    document.createElement(
      "input"
    );


  checkbox.type =
    "checkbox";


  checkbox.value =
    funcao.id;


  checkbox.dataset.funcaoId =
    funcao.id;


  checkbox.dataset.funcaoNome =
    funcao.nome;


  checkbox.checked =
    funcoesUsuario.includes(
      funcao.id
    );


  const texto =
    document.createElement(
      "span"
    );


  texto.textContent =
    funcao.nome;


  linha.appendChild(
    checkbox
  );


  linha.appendChild(
    texto
  );


  return linha;
}


/* ==========================================
   MONTA A ÁRVORE DE FUNÇÕES
========================================== */

function montarListaFuncoes(
  funcoes,
  funcoesUsuario
) {

  listaFuncoesPermissao.innerHTML =
    "";


  const principais =
    funcoes
      .filter(
        (funcao) =>
          !funcao.funcao_pai_id
      )
      .sort(
        (a, b) =>
          a.ordem -
          b.ordem
      );


  principais.forEach(
    (funcaoPrincipal) => {

      const bloco =
        document.createElement(
          "div"
        );


      bloco.className =
        "bloco-funcao-permissao";


      bloco.appendChild(
        criarCheckboxFuncao(
          funcaoPrincipal,
          funcoesUsuario
        )
      );


      const filhas =
        funcoes
          .filter(
            (funcao) =>
              funcao.funcao_pai_id ===
              funcaoPrincipal.id
          )
          .sort(
            (a, b) =>
              a.ordem -
              b.ordem
          );


      filhas.forEach(
        (funcaoFilha) => {

          bloco.appendChild(
            criarCheckboxFuncao(
              funcaoFilha,
              funcoesUsuario
            )
          );

        }
      );


      listaFuncoesPermissao.appendChild(
        bloco
      );

    }
  );
}


/* ==========================================
   CARREGA AS FUNÇÕES
========================================== */

async function carregarFuncoes(
  usuarioId
) {

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
      );


  if (
    resultadoFuncoes.error
  ) {

    throw resultadoFuncoes.error;

  }


  const resultadoFuncoesUsuario =
    await window.supabaseClient
      .from(
        "usuario_funcoes"
      )
      .select(
        "funcao_id"
      )
      .eq(
        "usuario_id",
        usuarioId
      );


  if (
    resultadoFuncoesUsuario.error
  ) {

    throw resultadoFuncoesUsuario.error;

  }


  const funcoesUsuario =
    (
      resultadoFuncoesUsuario.data ||
      []
    )
      .map(
        (item) =>
          item.funcao_id
      );


  montarListaFuncoes(
    resultadoFuncoes.data ||
      [],
    funcoesUsuario
  );
}


/* ==========================================
   FUNÇÕES MARCADAS
========================================== */

function obterFuncoesMarcadas() {

  return Array.from(
    listaFuncoesPermissao
      .querySelectorAll(
        'input[type="checkbox"]:checked'
      )
  )
    .map(
      (checkbox) =>
        checkbox.dataset.funcaoId
    );
}


/* ==========================================
   NOMES DAS FUNÇÕES MARCADAS
========================================== */

function obterNomesFuncoesMarcadas() {

  return Array.from(
    listaFuncoesPermissao
      .querySelectorAll(
        'input[type="checkbox"]:checked'
      )
  )
    .map(
      (checkbox) =>
        checkbox.dataset.funcaoNome
    )
    .filter(Boolean);
}


/* ==========================================
   DESCOBRE QUEM ESTÁ ADMINISTRANDO
========================================== */

async function obterUsuarioAdministrador() {

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


  if (!sessao) {

    window.location.href =
      "index.html";


    throw new Error(
      "Sessão não encontrada."
    );

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

    throw new Error(
      "Usuário administrador não encontrado."
    );

  }


  return resultadoUsuario.data.id;
}


/* ==========================================
   ATUALIZAR HISTÓRICO
   OGAM / CAMBONE / CANTINA
========================================== */

async function atualizarHistoricoFuncoes(
  usuarioId,
  nomesAtuais,
  nomesMarcados
) {

  const funcoesComHistorico = [
    "Ogam",
    "Cambone",
    "Cantina"
  ];


  const hoje =
    obterDataHojeISO();


  for (
    const funcaoNome of
    funcoesComHistorico
  ) {

    const tinhaAntes =
      nomesAtuais.includes(
        funcaoNome
      );


    const temAgora =
      nomesMarcados.includes(
        funcaoNome
      );


    /* --------------------------------------
       ENTROU NA FUNÇÃO
    -------------------------------------- */

    if (
      !tinhaAntes &&
      temAgora
    ) {

      const resultadoPeriodoAberto =
        await window.supabaseClient
          .from(
            "historico_funcoes_associado"
          )
          .select("id")
          .eq(
            "usuario_id",
            usuarioId
          )
          .eq(
            "funcao_nome",
            funcaoNome
          )
          .is(
            "data_fim",
            null
          )
          .limit(1);


      if (
        resultadoPeriodoAberto.error
      ) {

        throw resultadoPeriodoAberto.error;

      }


      const possuiPeriodoAberto =
        (
          resultadoPeriodoAberto.data ||
          []
        ).length > 0;


      if (
        !possuiPeriodoAberto
      ) {

        const resultadoInsercao =
          await window.supabaseClient
            .from(
              "historico_funcoes_associado"
            )
            .insert({

              usuario_id:
                usuarioId,

              funcao_nome:
                funcaoNome,

              data_inicio:
                hoje

            });


        if (
          resultadoInsercao.error
        ) {

          throw resultadoInsercao.error;

        }

      }

    }


    /* --------------------------------------
       SAIU DA FUNÇÃO
    -------------------------------------- */

    if (
      tinhaAntes &&
      !temAgora
    ) {

      const resultadoFechamento =
        await window.supabaseClient
          .from(
            "historico_funcoes_associado"
          )
          .update({

            data_fim:
              hoje,

            atualizado_em:
              new Date().toISOString()

          })
          .eq(
            "usuario_id",
            usuarioId
          )
          .eq(
            "funcao_nome",
            funcaoNome
          )
          .is(
            "data_fim",
            null
          );


      if (
        resultadoFechamento.error
      ) {

        throw resultadoFechamento.error;

      }

    }

  }

}


/* ==========================================
   SINCRONIZA FUNÇÕES DO USUÁRIO
========================================== */

async function sincronizarFuncoesUsuario(
  usuarioId,
  atribuidoPor
) {

  const resultadoAtuais =
    await window.supabaseClient
      .from(
        "usuario_funcoes"
      )
      .select(`
        id,
        funcao_id,
        funcoes (
          nome
        )
      `)
      .eq(
        "usuario_id",
        usuarioId
      );


  if (
    resultadoAtuais.error
  ) {

    throw resultadoAtuais.error;

  }


  const atuais =
    resultadoAtuais.data ||
    [];


  const nomesAtuais =
    atuais
      .map(
        (item) =>
          item.funcoes?.nome
      )
      .filter(Boolean);


  const marcadas =
    obterFuncoesMarcadas();


  const nomesMarcados =
    obterNomesFuncoesMarcadas();


  /*
    Antes de alterar usuario_funcoes,
    registramos as mudanças históricas
    de Ogam, Cambone e Cantina.
  */

  await atualizarHistoricoFuncoes(
    usuarioId,
    nomesAtuais,
    nomesMarcados
  );


  const adicionar =
    marcadas.filter(
      (funcaoId) =>
        !atuais.some(
          (item) =>
            item.funcao_id ===
            funcaoId
        )
    );


  const remover =
    atuais.filter(
      (item) =>
        !marcadas.includes(
          item.funcao_id
        )
    );


  for (
    const item of remover
  ) {

    const resultadoRemocao =
      await window.supabaseClient
        .from(
          "usuario_funcoes"
        )
        .delete()
        .eq(
          "id",
          item.id
        );


    if (
      resultadoRemocao.error
    ) {

      throw resultadoRemocao.error;

    }

  }


  if (
    adicionar.length >
    0
  ) {

    const novosRegistros =
      adicionar.map(
        (funcaoId) => ({

          usuario_id:
            usuarioId,

          funcao_id:
            funcaoId,

          atribuido_por:
            atribuidoPor

        })
      );


    const resultadoInsercao =
      await window.supabaseClient
        .from(
          "usuario_funcoes"
        )
        .insert(
          novosRegistros
        );


    if (
      resultadoInsercao.error
    ) {

      throw resultadoInsercao.error;

    }

  }
}


/* ==========================================
   ATUALIZAR DATAS AUTOMÁTICAS
========================================== */

async function atualizarDatasAutomaticas(
  usuarioId,
  preencherEntradaTufra
) {

  const resultadoUsuario =
    await window.supabaseClient
      .from(
        "usuarios"
      )
      .select(`
        id,
        data_entrada_tufra,
        data_corrente_desenvolvimento,
        data_corrente_principal
      `)
      .eq(
        "id",
        usuarioId
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

    throw new Error(
      "Usuário não encontrado para atualizar as datas."
    );

  }


  const usuario =
    resultadoUsuario.data;


  const nomesFuncoes =
    obterNomesFuncoesMarcadas();


  const dataHoje =
    obterDataHojeISO();


  const atualizacoes =
    {};


  /* --------------------------------------
     ENTRADA NA TUFRA
  -------------------------------------- */

  if (
    preencherEntradaTufra &&
    !usuario.data_entrada_tufra
  ) {

    atualizacoes.data_entrada_tufra =
      dataHoje;

  }


  /* --------------------------------------
     CORRENTE DO DESENVOLVIMENTO
  -------------------------------------- */

  const entrouCorrenteDesenvolvimento =
    nomesFuncoes.includes(
      "Corrente do Desenvolvimento"
    );


  if (
    entrouCorrenteDesenvolvimento &&
    !usuario.data_corrente_desenvolvimento
  ) {

    atualizacoes.data_corrente_desenvolvimento =
      dataHoje;

  }


  /* --------------------------------------
     CORRENTE PRINCIPAL
  -------------------------------------- */

  const entrouCorrentePrincipal =
    nomesFuncoes.includes(
      "Médium Corrente Principal"
    ) ||
    nomesFuncoes.includes(
      "Médium Principal"
    );


  if (
    entrouCorrentePrincipal &&
    !usuario.data_corrente_principal
  ) {

    atualizacoes.data_corrente_principal =
      dataHoje;

  }


  if (
    Object.keys(
      atualizacoes
    ).length ===
    0
  ) {

    return;

  }


  const resultadoAtualizacao =
    await window.supabaseClient
      .from(
        "usuarios"
      )
      .update(
        atualizacoes
      )
      .eq(
        "id",
        usuarioId
      );


  if (
    resultadoAtualizacao.error
  ) {

    throw resultadoAtualizacao.error;

  }

}


/* ==========================================
   SALVAR FUNÇÕES DE USUÁRIO ATIVO
========================================== */

async function salvarFuncoesUsuario() {

  const {
    usuarioId,
    tipo
  } =
    obterParametros();


  if (
    !usuarioId ||
    tipo !== "ativo"
  ) {

    return;

  }


  mensagemSalvarFuncoes.textContent =
    "";


  botaoSalvarFuncoes.disabled =
    true;


  botaoSalvarFuncoes.textContent =
    "SALVANDO...";


  try {

    const atribuidoPor =
      await obterUsuarioAdministrador();


    await sincronizarFuncoesUsuario(
      usuarioId,
      atribuidoPor
    );


    await atualizarDatasAutomaticas(
      usuarioId,
      false
    );


    mensagemSalvarFuncoes.textContent =
      "Funções atualizadas com sucesso.";


    botaoSalvarFuncoes.textContent =
      "Salvo";


    setTimeout(
      () => {

        window.location.href =
          "permissoes.html";

      },
      900
    );


  } catch (erro) {

    console.error(
      "Erro ao salvar funções:",
      erro
    );


    mensagemSalvarFuncoes.textContent =
      "Não foi possível salvar as funções.";


    botaoSalvarFuncoes.disabled =
      false;


    botaoSalvarFuncoes.textContent =
      "Salvar funções";

  }
}


/* ==========================================
   APROVAR NOVO CADASTRO
========================================== */

async function aprovarCadastro() {

  const {
    usuarioId,
    tipo
  } =
    obterParametros();


  if (
    !usuarioId ||
    tipo !== "pendente"
  ) {

    return;

  }


  const funcoesMarcadas =
    obterFuncoesMarcadas();


  if (
    funcoesMarcadas.length ===
    0
  ) {

    alert(
      "Selecione pelo menos uma função antes de aprovar o cadastro."
    );


    return;

  }


  botaoAprovarCadastro.disabled =
    true;


  botaoAprovarCadastro.textContent =
    "APROVANDO...";


  try {

    const aprovadoPor =
      await obterUsuarioAdministrador();


    await sincronizarFuncoesUsuario(
      usuarioId,
      aprovadoPor
    );


    await atualizarDatasAutomaticas(
      usuarioId,
      true
    );


    const agora =
      new Date();


    const resultadoAprovacao =
      await window.supabaseClient
        .from(
          "usuarios"
        )
        .update({

          status:
            "ativo",

          data_aprovacao:
            agora.toISOString(),

          aprovado_por:
            aprovadoPor

        })
        .eq(
          "id",
          usuarioId
        );


    if (
      resultadoAprovacao.error
    ) {

      throw resultadoAprovacao.error;

    }


    botaoAprovarCadastro.textContent =
      "Cadastro aprovado";


    setTimeout(
      () => {

        window.location.href =
          "permissoes.html";

      },
      900
    );


  } catch (erro) {

    console.error(
      "Erro ao aprovar cadastro:",
      erro
    );


    alert(
      "Não foi possível aprovar o cadastro. Tente novamente."
    );


    botaoAprovarCadastro.disabled =
      false;


    botaoAprovarCadastro.textContent =
      "Aprovar cadastro";

  }
}


/* ==========================================
   CARREGA O USUÁRIO
========================================== */

async function carregarUsuario() {

  if (
    !window.supabaseClient
  ) {

    return;

  }


  const {
    usuarioId,
    tipo
  } =
    obterParametros();


  if (
    !usuarioId
  ) {

    window.location.href =
      "permissoes.html";


    return;

  }


  try {

    const resultadoUsuario =
      await window.supabaseClient
        .from(
          "usuarios"
        )
        .select(`
          id,
          nome_completo,
          email,
          status,
          foto_path
        `)
        .eq(
          "id",
          usuarioId
        )
        .maybeSingle();


    if (
      resultadoUsuario.error
    ) {

      throw resultadoUsuario.error;

    }


    const usuario =
      resultadoUsuario.data;


    if (
      !usuario
    ) {

      throw new Error(
        "Usuário não encontrado."
      );

    }


    const nomeFormatado =
      formatarNome(
        usuario.nome_completo
      );


    tituloPermissaoUsuario.textContent =
      nomeFormatado;


    subtituloPermissaoUsuario.textContent =
      tipo === "pendente"
        ? "Cadastro aguardando aprovação"
        : "Gerencie as funções deste usuário.";


    nomeUsuarioPermissao.textContent =
      nomeFormatado;


    emailUsuarioPermissao.textContent =
      usuario.email ||
      "";


    statusUsuarioPermissao.textContent =
      usuario.status ||
      "";


    await carregarFoto(
      usuario.foto_path
    );


    await carregarFuncoes(
      usuario.id
    );


    areaAprovacaoCadastro.hidden =
      tipo !== "pendente";


    areaSalvarFuncoes.hidden =
      tipo !== "ativo";


  } catch (erro) {

    console.error(
      "Erro ao carregar usuário:",
      erro
    );


    subtituloPermissaoUsuario.textContent =
      "Não foi possível carregar os dados deste usuário.";


    listaFuncoesPermissao.innerHTML =
      "<p>Não foi possível carregar as funções.</p>";

  }
}


/* ==========================================
   ZOOM DA FOTO
========================================== */

function aplicarZoomFoto() {

  fotoUsuarioAmpliada.style.transform =
    `scale(${zoomFoto})`;


  resetarZoomFoto.textContent =
    `${Math.round(
      zoomFoto * 100
    )}%`;
}


function abrirFotoAmpliada() {

  if (
    !fotoUsuarioPermissao.src
  ) {

    return;

  }


  fotoUsuarioAmpliada.src =
    fotoUsuarioPermissao.src;


  zoomFoto =
    1;


  aplicarZoomFoto();


  modalFotoUsuario.hidden =
    false;


  document.body.style.overflow =
    "hidden";
}


function fecharFotoAmpliada() {

  modalFotoUsuario.hidden =
    true;


  document.body.style.overflow =
    "";


  zoomFoto =
    1;
}


function aumentarZoom() {

  zoomFoto =
    Math.min(
      zoomFoto + 0.25,
      4
    );


  aplicarZoomFoto();
}


function diminuirZoom() {

  zoomFoto =
    Math.max(
      zoomFoto - 0.25,
      1
    );


  aplicarZoomFoto();
}


function resetarZoom() {

  zoomFoto =
    1;


  aplicarZoomFoto();
}


function calcularDistanciaToques(
  evento
) {

  if (
    evento.touches.length <
    2
  ) {

    return null;

  }


  const toque1 =
    evento.touches[0];


  const toque2 =
    evento.touches[1];


  const distanciaX =
    toque2.clientX -
    toque1.clientX;


  const distanciaY =
    toque2.clientY -
    toque1.clientY;


  return Math.hypot(
    distanciaX,
    distanciaY
  );
}


/* ==========================================
   EVENTOS
========================================== */

if (
  botaoSalvarFuncoes
) {

  botaoSalvarFuncoes.addEventListener(
    "click",
    salvarFuncoesUsuario
  );

}


if (
  botaoAprovarCadastro
) {

  botaoAprovarCadastro.addEventListener(
    "click",
    aprovarCadastro
  );

}


if (
  fotoUsuarioPermissao
) {

  fotoUsuarioPermissao.addEventListener(
    "click",
    abrirFotoAmpliada
  );

}


if (
  fecharModalFoto
) {

  fecharModalFoto.addEventListener(
    "click",
    fecharFotoAmpliada
  );

}


if (
  aumentarZoomFoto
) {

  aumentarZoomFoto.addEventListener(
    "click",
    aumentarZoom
  );

}


if (
  diminuirZoomFoto
) {

  diminuirZoomFoto.addEventListener(
    "click",
    diminuirZoom
  );

}


if (
  resetarZoomFoto
) {

  resetarZoomFoto.addEventListener(
    "click",
    resetarZoom
  );

}


if (
  areaZoomFoto
) {

  areaZoomFoto.addEventListener(
    "wheel",
    (evento) => {

      evento.preventDefault();


      if (
        evento.deltaY <
        0
      ) {

        aumentarZoom();

      } else {

        diminuirZoom();

      }

    },
    {
      passive: false
    }
  );


  areaZoomFoto.addEventListener(
    "touchstart",
    (evento) => {

      if (
        evento.touches.length ===
        2
      ) {

        distanciaToqueInicial =
          calcularDistanciaToques(
            evento
          );

      }

    },
    {
      passive: false
    }
  );


  areaZoomFoto.addEventListener(
    "touchmove",
    (evento) => {

      if (
        evento.touches.length !==
          2 ||
        !distanciaToqueInicial
      ) {

        return;

      }


      evento.preventDefault();


      const distanciaAtual =
        calcularDistanciaToques(
          evento
        );


      if (
        !distanciaAtual
      ) {

        return;

      }


      const diferenca =
        distanciaAtual -
        distanciaToqueInicial;


      if (
        Math.abs(
          diferenca
        ) <
        8
      ) {

        return;

      }


      if (
        diferenca >
        0
      ) {

        zoomFoto =
          Math.min(
            zoomFoto + 0.05,
            4
          );

      } else {

        zoomFoto =
          Math.max(
            zoomFoto - 0.05,
            1
          );

      }


      distanciaToqueInicial =
        distanciaAtual;


      aplicarZoomFoto();

    },
    {
      passive: false
    }
  );


  areaZoomFoto.addEventListener(
    "touchend",
    () => {

      distanciaToqueInicial =
        null;

    }
  );

}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

carregarUsuario();
