"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const tituloPagina =
  document.getElementById(
    "tituloPagina"
  );

const subtituloPagina =
  document.getElementById(
    "subtituloPagina"
  );

const cartaoDetalhesComunicado =
  document.getElementById(
    "cartaoDetalhesComunicado"
  );

const cartaoErroComunicado =
  document.getElementById(
    "cartaoErroComunicado"
  );

const tipoComunicado =
  document.getElementById(
    "tipoComunicado"
  );

const tituloComunicado =
  document.getElementById(
    "tituloComunicado"
  );

const mensagemComunicado =
  document.getElementById(
    "mensagemComunicado"
  );

const dataInicio =
  document.getElementById(
    "dataInicio"
  );

const dataFim =
  document.getElementById(
    "dataFim"
  );

const publicoComunicado =
  document.getElementById(
    "publicoComunicado"
  );

const publicadoPorComunicado =
  document.getElementById(
    "publicadoPorComunicado"
  );

const statusComunicado =
  document.getElementById(
    "statusComunicado"
  );

const mensagemFormulario =
  document.getElementById(
    "mensagemFormulario"
  );

const botaoSalvarAlteracoes =
  document.getElementById(
    "botaoSalvarAlteracoes"
  );

const botaoEncerrarComunicado =
  document.getElementById(
    "botaoEncerrarComunicado"
  );


/* ==========================================
   ID DO COMUNICADO
========================================== */

const parametros =
  new URLSearchParams(
    window.location.search
  );

const comunicadoId =
  parametros.get(
    "id"
  );


/* ==========================================
   DADOS
========================================== */

let comunicadoAtual =
  null;


/* ==========================================
   MENSAGENS
========================================== */

function mostrarMensagem(
  texto
) {

  mensagemFormulario.textContent =
    texto;

  mensagemFormulario.hidden =
    false;

}


function esconderMensagem() {

  mensagemFormulario.textContent =
    "";

  mensagemFormulario.hidden =
    true;

}


/* ==========================================
   FORMATAR DATA PARA INPUT
========================================== */

function formatarDataParaInput(
  dataIso
) {

  if (
    !dataIso
  ) {

    return "";

  }


  const data =
    new Date(
      dataIso
    );


  const ano =
    data.getFullYear();

  const mes =
    String(
      data.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const dia =
    String(
      data.getDate()
    ).padStart(
      2,
      "0"
    );

  const hora =
    String(
      data.getHours()
    ).padStart(
      2,
      "0"
    );

  const minuto =
    String(
      data.getMinutes()
    ).padStart(
      2,
      "0"
    );


  return `${ano}-${mes}-${dia}T${hora}:${minuto}`;

}


/* ==========================================
   FORMATAR TIPO
========================================== */

function formatarTipo(
  tipo
) {

  return tipo === "enquete"
    ? "Enquete"
    : "Recado";

}


/* ==========================================
   FORMATAR STATUS
========================================== */

function obterStatusVisual(
  comunicado
) {

  if (
    comunicado.status === "encerrado"
  ) {

    return "Encerrado";

  }


  const agora =
    new Date();

  const inicio =
    new Date(
      comunicado.data_inicio
    );

  const fim =
    new Date(
      comunicado.data_fim
    );


  if (
    agora < inicio
  ) {

    return "Programado";

  }


  if (
    agora >= fim
  ) {

    return "Encerrado pelo período";

  }


  return "Ativo";

}


/* ==========================================
   FORMATAR PÚBLICO
========================================== */

function formatarPublico(
  comunicado
) {

  if (
    comunicado.publico_tipo === "todos"
  ) {

    return "Todos os usuários";

  }


  if (
    comunicado.publico_tipo === "funcoes"
  ) {

    const funcoes =
      comunicado.publico_filtros?.funcoes;


    if (
      Array.isArray(
        funcoes
      ) &&
      funcoes.length > 0
    ) {

      return funcoes
        .map(
          (funcao) =>
            funcao.nome
        )
        .filter(
          Boolean
        )
        .join(
          ", "
        );

    }


    return "Funções específicas";

  }


  return "Público específico";

}


/* ==========================================
   CARREGAR COMUNICADO
========================================== */

async function carregarComunicado() {

  if (
    !comunicadoId ||
    !window.supabaseClient
  ) {

    cartaoErroComunicado.hidden =
      false;

    return;

  }


  try {

    const resultado =
      await window.supabaseClient
        .from(
          "comunicados"
        )
        .select(`
          id,
          tipo,
          titulo,
          mensagem,
          data_inicio,
          data_fim,
          status,
          publico_tipo,
          publico_filtros,
          criado_em,
          criado_por,
          encerrado_em,
          criador:usuarios!comunicados_criado_por_fkey (
            nome_completo
          )
        `)
        .eq(
          "id",
          comunicadoId
        )
        .maybeSingle();


    if (
      resultado.error
    ) {

      throw resultado.error;

    }


    if (
      !resultado.data
    ) {

      cartaoErroComunicado.hidden =
        false;

      return;

    }


    comunicadoAtual =
      resultado.data;


    preencherTela();


  } catch (erro) {

    console.error(
      "Erro ao carregar comunicado:",
      erro
    );


    cartaoErroComunicado.hidden =
      false;

  }

}


/* ==========================================
   PREENCHER TELA
========================================== */

function preencherTela() {

  if (
    !comunicadoAtual
  ) {

    return;

  }


  tituloPagina.textContent =
    comunicadoAtual.tipo === "enquete"
      ? "Detalhes da Enquete"
      : "Detalhes do Recado";


  subtituloPagina.textContent =
    comunicadoAtual.titulo ||
    "Comunicado";


  tipoComunicado.value =
    formatarTipo(
      comunicadoAtual.tipo
    );


  tituloComunicado.value =
    comunicadoAtual.titulo ||
    "";


  mensagemComunicado.value =
    comunicadoAtual.mensagem ||
    "";


  dataInicio.value =
    formatarDataParaInput(
      comunicadoAtual.data_inicio
    );


  dataFim.value =
    formatarDataParaInput(
      comunicadoAtual.data_fim
    );


  publicoComunicado.textContent =
    formatarPublico(
      comunicadoAtual
    );


  publicadoPorComunicado.textContent =
    comunicadoAtual.criador?.nome_completo ||
    "TUFRA";


  const status =
    obterStatusVisual(
      comunicadoAtual
    );


  statusComunicado.textContent =
    status;


  const encerrado =
    status.startsWith(
      "Encerrado"
    );


  tituloComunicado.disabled =
    encerrado;


  mensagemComunicado.disabled =
    encerrado;


  dataInicio.disabled =
    encerrado;


  dataFim.disabled =
    encerrado;


  botaoSalvarAlteracoes.hidden =
    encerrado;


  botaoEncerrarComunicado.hidden =
    encerrado;


  cartaoDetalhesComunicado.hidden =
    false;

}


/* ==========================================
   VALIDAR
========================================== */

function validarAlteracoes() {

  if (
    !tituloComunicado.value.trim()
  ) {

    mostrarMensagem(
      "Informe o título."
    );

    tituloComunicado.focus();

    return false;

  }


  if (
    !mensagemComunicado.value.trim()
  ) {

    mostrarMensagem(
      "Informe a mensagem."
    );

    mensagemComunicado.focus();

    return false;

  }


  if (
    !dataInicio.value ||
    !dataFim.value
  ) {

    mostrarMensagem(
      "Informe o período de exibição."
    );

    return false;

  }


  const inicio =
    new Date(
      dataInicio.value
    );


  const fim =
    new Date(
      dataFim.value
    );


  if (
    fim <= inicio
  ) {

    mostrarMensagem(
      "O fim da exibição precisa ser posterior ao início."
    );

    return false;

  }


  return true;

}


/* ==========================================
   SALVAR ALTERAÇÕES
========================================== */

async function salvarAlteracoes() {

  esconderMensagem();


  if (
    !comunicadoAtual ||
    !validarAlteracoes()
  ) {

    return;

  }


  botaoSalvarAlteracoes.disabled =
    true;


  botaoSalvarAlteracoes.textContent =
    "SALVANDO...";


  try {

    const resultado =
      await window.supabaseClient
        .from(
          "comunicados"
        )
        .update({

          titulo:
            tituloComunicado.value.trim(),

          mensagem:
            mensagemComunicado.value.trim(),

          data_inicio:
            new Date(
              dataInicio.value
            ).toISOString(),

          data_fim:
            new Date(
              dataFim.value
            ).toISOString(),

          atualizado_em:
            new Date().toISOString()

        })
        .eq(
          "id",
          comunicadoAtual.id
        );


    if (
      resultado.error
    ) {

      throw resultado.error;

    }


    comunicadoAtual.titulo =
      tituloComunicado.value.trim();


    comunicadoAtual.mensagem =
      mensagemComunicado.value.trim();


    comunicadoAtual.data_inicio =
      new Date(
        dataInicio.value
      ).toISOString();


    comunicadoAtual.data_fim =
      new Date(
        dataFim.value
      ).toISOString();


    mostrarMensagem(
      "Alterações salvas com sucesso."
    );


    botaoSalvarAlteracoes.textContent =
      "Alterações salvas";


    setTimeout(
      () => {

        botaoSalvarAlteracoes.disabled =
          false;


        botaoSalvarAlteracoes.textContent =
          "Salvar alterações";

      },
      1000
    );


  } catch (erro) {

    console.error(
      "Erro ao salvar comunicado:",
      erro
    );


    mostrarMensagem(
      "Não foi possível salvar as alterações."
    );


    botaoSalvarAlteracoes.disabled =
      false;


    botaoSalvarAlteracoes.textContent =
      "Salvar alterações";

  }

}


/* ==========================================
   OBTER USUÁRIO ATUAL
========================================== */

async function obterUsuarioAtualId() {

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
      "Usuário não encontrado."
    );

  }


  return resultadoUsuario.data.id;

}


/* ==========================================
   ENCERRAR
========================================== */

async function encerrarComunicado() {

  if (
    !comunicadoAtual
  ) {

    return;

  }


  const confirmar =
    window.confirm(
      "Deseja realmente encerrar este comunicado agora?"
    );


  if (
    !confirmar
  ) {

    return;

  }


  esconderMensagem();


  botaoEncerrarComunicado.disabled =
    true;


  botaoEncerrarComunicado.textContent =
    "ENCERRANDO...";


  try {

    const usuarioId =
      await obterUsuarioAtualId();


    const agora =
      new Date().toISOString();


    const resultado =
      await window.supabaseClient
        .from(
          "comunicados"
        )
        .update({

          status:
            "encerrado",

          encerrado_em:
            agora,

          encerrado_por:
            usuarioId,

          atualizado_em:
            agora

        })
        .eq(
          "id",
          comunicadoAtual.id
        );


    if (
      resultado.error
    ) {

      throw resultado.error;

    }


    comunicadoAtual.status =
      "encerrado";


    comunicadoAtual.encerrado_em =
      agora;


    mostrarMensagem(
      "Comunicado encerrado com sucesso."
    );


    statusComunicado.textContent =
      "Encerrado";


    tituloComunicado.disabled =
      true;


    mensagemComunicado.disabled =
      true;


    dataInicio.disabled =
      true;


    dataFim.disabled =
      true;


    botaoSalvarAlteracoes.hidden =
      true;


    botaoEncerrarComunicado.hidden =
      true;


    setTimeout(
      () => {

        window.location.href =
          "adm-comunicados.html";

      },
      900
    );


  } catch (erro) {

    console.error(
      "Erro ao encerrar comunicado:",
      erro
    );


    mostrarMensagem(
      "Não foi possível encerrar o comunicado."
    );


    botaoEncerrarComunicado.disabled =
      false;


    botaoEncerrarComunicado.textContent =
      "Encerrar agora";

  }

}


/* ==========================================
   EVENTOS
========================================== */

botaoSalvarAlteracoes.addEventListener(
  "click",
  salvarAlteracoes
);


botaoEncerrarComunicado.addEventListener(
  "click",
  encerrarComunicado
);


/* ==========================================
   INICIAR
========================================== */

carregarComunicado();
