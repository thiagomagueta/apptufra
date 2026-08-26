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

const cartaoResultadosEnquete =
  document.getElementById(
    "cartaoResultadosEnquete"
  );

const resumoResultadosEnquete =
  document.getElementById(
    "resumoResultadosEnquete"
  );

const listaResultadosEnquete =
  document.getElementById(
    "listaResultadosEnquete"
  );

const botaoBaixarResultadosEnquete =
  document.getElementById(
    "botaoBaixarResultadosEnquete"
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

let opcoesEnqueteAtual =
  [];

let respostasEnqueteAtual =
  [];


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
   FORMATAR NOME
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


    if (
      comunicadoAtual.tipo === "enquete"
    ) {

      await carregarResultadosEnquete();

    }


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
   CARREGAR RESULTADOS DA ENQUETE
========================================== */

async function carregarResultadosEnquete() {

  if (
    !comunicadoAtual ||
    comunicadoAtual.tipo !== "enquete"
  ) {

    cartaoResultadosEnquete.hidden =
      true;

    return;

  }


  cartaoResultadosEnquete.hidden =
    false;


  resumoResultadosEnquete.textContent =
    "Carregando resultados...";


  listaResultadosEnquete.innerHTML =
    "";


  botaoBaixarResultadosEnquete.disabled =
    true;


  try {

    /* --------------------------------------
       OPÇÕES
    -------------------------------------- */

    const resultadoOpcoes =
      await window.supabaseClient
        .from(
          "enquete_opcoes"
        )
        .select(`
          id,
          comunicado_id,
          texto,
          ordem
        `)
        .eq(
          "comunicado_id",
          comunicadoAtual.id
        )
        .order(
          "ordem",
          {
            ascending:
              true
          }
        );


    if (
      resultadoOpcoes.error
    ) {

      throw resultadoOpcoes.error;

    }


    opcoesEnqueteAtual =
      resultadoOpcoes.data ||
      [];


    /* --------------------------------------
       RESPOSTAS + USUÁRIOS
    -------------------------------------- */

    const resultadoRespostas =
      await window.supabaseClient
        .from(
          "enquete_respostas"
        )
        .select(`
          id,
          comunicado_id,
          opcao_id,
          usuario_id,
          respondido_em,
          atualizado_em,
          usuario:usuarios!enquete_respostas_usuario_id_fkey (
            nome_completo
          )
        `)
        .eq(
          "comunicado_id",
          comunicadoAtual.id
        )
        .order(
          "respondido_em",
          {
            ascending:
              true
          }
        );


    if (
      resultadoRespostas.error
    ) {

      throw resultadoRespostas.error;

    }


    respostasEnqueteAtual =
      resultadoRespostas.data ||
      [];


    renderizarResultadosEnquete();


  } catch (erro) {

    console.error(
      "Erro ao carregar resultados da enquete:",
      erro
    );


    resumoResultadosEnquete.textContent =
      "Não foi possível carregar os resultados.";


    listaResultadosEnquete.innerHTML =
      "";

  }

}


/* ==========================================
   RENDERIZAR RESULTADOS
========================================== */

function renderizarResultadosEnquete() {

  listaResultadosEnquete.innerHTML =
    "";


  const totalRespostas =
    respostasEnqueteAtual.length;


  resumoResultadosEnquete.textContent =
    totalRespostas === 1
      ? "1 resposta registrada."
      : `${totalRespostas} respostas registradas.`;


  if (
    opcoesEnqueteAtual.length === 0
  ) {

    listaResultadosEnquete.innerHTML =
      "<p>Nenhuma opção cadastrada para esta enquete.</p>";

    return;

  }


  opcoesEnqueteAtual.forEach(
    (opcao) => {

      const respostasOpcao =
        respostasEnqueteAtual.filter(
          (resposta) =>
            resposta.opcao_id ===
            opcao.id
        );


      const bloco =
        document.createElement(
          "div"
        );


      bloco.style.padding =
        "14px 0";


      bloco.style.borderBottom =
        "1px solid rgba(0, 0, 0, 0.10)";


      const titulo =
        document.createElement(
          "strong"
        );


      const quantidade =
        respostasOpcao.length;


      titulo.textContent =
        quantidade === 1
          ? `${opcao.texto} — 1 voto`
          : `${opcao.texto} — ${quantidade} votos`;


      bloco.appendChild(
        titulo
      );


      const listaNomes =
        document.createElement(
          "div"
        );


      listaNomes.style.marginTop =
        "8px";


      if (
        respostasOpcao.length === 0
      ) {

        const vazio =
          document.createElement(
            "p"
          );


        vazio.textContent =
          "Nenhuma resposta.";


        vazio.style.margin =
          "0";


        vazio.style.opacity =
          "0.7";


        listaNomes.appendChild(
          vazio
        );

      } else {

        respostasOpcao
          .map(
            (resposta) =>
              formatarNome(
                resposta.usuario?.nome_completo
              )
          )
          .sort(
            (a, b) =>
              a.localeCompare(
                b,
                "pt-BR",
                {
                  sensitivity:
                    "base"
                }
              )
          )
          .forEach(
            (nome) => {

              const item =
                document.createElement(
                  "p"
                );


              item.textContent =
                `• ${nome || "Usuário"}`;


              item.style.margin =
                "4px 0";


              listaNomes.appendChild(
                item
              );

            }
          );

      }


      bloco.appendChild(
        listaNomes
      );


      listaResultadosEnquete.appendChild(
        bloco
      );

    }
  );


  botaoBaixarResultadosEnquete.disabled =
    totalRespostas === 0;

}


/* ==========================================
   CSV
========================================== */

function escaparCampoCsv(
  valor
) {

  const texto =
    String(
      valor ?? ""
    );


  return `"${texto.replace(
    /"/g,
    '""'
  )}"`;

}


/* ==========================================
   BAIXAR RESULTADOS
========================================== */

function baixarResultadosEnquete() {

  if (
    respostasEnqueteAtual.length === 0
  ) {

    return;

  }


  const linhas =
    [
      [
        "Nome",
        "Resposta"
      ]
    ];


  respostasEnqueteAtual
    .map(
      (resposta) => {

        const opcao =
          opcoesEnqueteAtual.find(
            (item) =>
              item.id ===
              resposta.opcao_id
          );


        return {

          nome:
            formatarNome(
              resposta.usuario?.nome_completo
            ),

          resposta:
            opcao?.texto ||
            ""

        };

      }
    )
    .sort(
      (a, b) =>
        a.nome.localeCompare(
          b.nome,
          "pt-BR",
          {
            sensitivity:
              "base"
          }
        )
    )
    .forEach(
      (item) => {

        linhas.push(
          [
            item.nome,
            item.resposta
          ]
        );

      }
    );


  const conteudoCsv =
    "\uFEFF" +
    linhas
      .map(
        (linha) =>
          linha
            .map(
              escaparCampoCsv
            )
            .join(
              ";"
            )
      )
      .join(
        "\r\n"
      );


  const blob =
    new Blob(
      [
        conteudoCsv
      ],
      {
        type:
          "text/csv;charset=utf-8;"
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const link =
    document.createElement(
      "a"
    );


  const nomeArquivo =
    String(
      comunicadoAtual?.titulo ||
      "enquete"
    )
      .trim()
      .toLowerCase()
      .normalize(
        "NFD"
      )
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      ) ||
      "enquete";


  link.href =
    url;


  link.download =
    `${nomeArquivo}-respostas.csv`;


  document.body.appendChild(
    link
  );


  link.click();


  link.remove();


  URL.revokeObjectURL(
    url
  );

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
      comunicadoAtual.tipo === "enquete"
        ? "Enquete encerrada com sucesso."
        : "Comunicado encerrado com sucesso."
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


botaoBaixarResultadosEnquete.addEventListener(
  "click",
  baixarResultadosEnquete
);


/* ==========================================
   INICIAR
========================================== */

carregarComunicado();
