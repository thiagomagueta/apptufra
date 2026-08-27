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

const formularioComunicado =
  document.getElementById(
    "formularioComunicado"
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

const publicoTipo =
  document.getElementById(
    "publicoTipo"
  );

const areaFuncoes =
  document.getElementById(
    "areaFuncoes"
  );

const listaFuncoes =
  document.getElementById(
    "listaFuncoes"
  );

const areaEnquete =
  document.getElementById(
    "areaEnquete"
  );

const listaOpcoesEnquete =
  document.getElementById(
    "listaOpcoesEnquete"
  );

const botaoAdicionarOpcao =
  document.getElementById(
    "botaoAdicionarOpcao"
  );

const mensagemFormulario =
  document.getElementById(
    "mensagemFormulario"
  );

const botaoSalvarComunicado =
  document.getElementById(
    "botaoSalvarComunicado"
  );


/* ==========================================
   TIPO DO COMUNICADO
========================================== */

const parametros =
  new URLSearchParams(
    window.location.search
  );

let tipoComunicado =
  parametros.get(
    "tipo"
  );


if (
  tipoComunicado !== "enquete"
) {

  tipoComunicado =
    "recado";

}


/* ==========================================
   DADOS
========================================== */

let funcoesCarregadas =
  false;

let contadorOpcoes =
  0;


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
   DATA LOCAL
========================================== */

function formatarDataParaInput(
  data
) {

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
   DATAS INICIAIS
========================================== */

function preencherDatasIniciais() {

  if (
    dataInicio.value ||
    dataFim.value
  ) {

    return;

  }


  const agora =
    new Date();


  agora.setSeconds(
    0,
    0
  );


  const fim =
    new Date(
      agora
    );


  fim.setDate(
    fim.getDate() + 7
  );


  dataInicio.value =
    formatarDataParaInput(
      agora
    );


  dataFim.value =
    formatarDataParaInput(
      fim
    );

}


/* ==========================================
   CONFIGURAR TELA
========================================== */

function configurarTela() {

  if (
    tipoComunicado === "enquete"
  ) {

    tituloPagina.textContent =
      "Nova Enquete";


    subtituloPagina.textContent =
      "Cadastre uma votação para os usuários do APP.";


    botaoSalvarComunicado.textContent =
      "Publicar Enquete";


    areaEnquete.hidden =
      false;


    adicionarOpcaoEnquete(
      "Sim"
    );


    adicionarOpcaoEnquete(
      "Não"
    );


    return;

  }


  tituloPagina.textContent =
    "Novo Recado";


  subtituloPagina.textContent =
    "Cadastre uma mensagem para exibição no dashboard.";


  botaoSalvarComunicado.textContent =
    "Publicar Recado";


  areaEnquete.hidden =
    true;

}


/* ==========================================
   CARREGAR FUNÇÕES PRIMÁRIAS
   EXCETO FUNÇÕES ADMINISTRATIVAS
========================================== */

async function carregarFuncoes() {

  if (
    funcoesCarregadas
  ) {

    return;

  }


  listaFuncoes.innerHTML =
    "<p>Carregando funções...</p>";


  try {

    const resultado =
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
        .is(
          "funcao_pai_id",
          null
        )
        .not(
          "nome",
          "in",
          '("Tesoureiro","Presidente","Secretária")'
        )
        .order(
          "ordem",
          {
            ascending:
              true
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
      resultado.error
    ) {

      throw resultado.error;

    }


    const funcoes =
      resultado.data ||
      [];


    listaFuncoes.innerHTML =
      "";


    if (
      funcoes.length === 0
    ) {

      listaFuncoes.innerHTML =
        "<p>Nenhuma função disponível.</p>";

      return;

    }


    funcoes.forEach(
      (funcao) => {

        const label =
          document.createElement(
            "label"
          );


        label.className =
          "item-responsavel-presenca";


        const checkbox =
          document.createElement(
            "input"
          );


        checkbox.type =
          "checkbox";


        checkbox.value =
          funcao.id;


        checkbox.dataset.nome =
          funcao.nome;


        checkbox.className =
          "checkbox-publico-funcao";


        const nome =
          document.createElement(
            "span"
          );


        nome.textContent =
          funcao.nome;


        label.appendChild(
          checkbox
        );


        label.appendChild(
          nome
        );


        listaFuncoes.appendChild(
          label
        );

      }
    );


    funcoesCarregadas =
      true;


  } catch (erro) {

    console.error(
      "Erro ao carregar funções:",
      erro
    );


    listaFuncoes.innerHTML =
      "<p>Não foi possível carregar as funções.</p>";

  }

}


/* ==========================================
   ALTERAR PÚBLICO
========================================== */

async function alterarPublico() {

  const selecionarFuncoes =
    publicoTipo.value ===
    "funcoes";


  areaFuncoes.hidden =
    !selecionarFuncoes;


  if (
    selecionarFuncoes
  ) {

    await carregarFuncoes();

  }

}


/* ==========================================
   OPÇÕES DA ENQUETE
========================================== */

function adicionarOpcaoEnquete(
  valorInicial = ""
) {

  contadorOpcoes +=
    1;


  const bloco =
    document.createElement(
      "div"
    );


  bloco.className =
    "campo-formulario opcao-enquete-item";


  const label =
    document.createElement(
      "label"
    );


  label.textContent =
    `Opção ${contadorOpcoes}`;


  const input =
    document.createElement(
      "input"
    );


  input.type =
    "text";


  input.maxLength =
    120;


  input.placeholder =
    "Digite uma opção de resposta";


  input.value =
    valorInicial;


  input.className =
    "input-opcao-enquete";


  bloco.appendChild(
    label
  );


  bloco.appendChild(
    input
  );


  listaOpcoesEnquete.appendChild(
    bloco
  );

}


/* ==========================================
   OBTER FUNÇÕES SELECIONADAS
========================================== */

function obterFuncoesSelecionadas() {

  return Array.from(
    document.querySelectorAll(
      ".checkbox-publico-funcao:checked"
    )
  )
    .map(
      (checkbox) => ({
        id:
          checkbox.value,

        nome:
          checkbox.dataset.nome ||
          ""
      })
    );

}


/* ==========================================
   OBTER OPÇÕES DA ENQUETE
========================================== */

function obterOpcoesEnquete() {

  return Array.from(
    document.querySelectorAll(
      ".input-opcao-enquete"
    )
  )
    .map(
      (input) =>
        input.value.trim()
    )
    .filter(
      Boolean
    );

}


/* ==========================================
   USUÁRIO ATUAL
========================================== */

async function obterUsuarioAtual() {

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
   VALIDAR FORMULÁRIO
========================================== */

function validarFormulario() {

  const titulo =
    tituloComunicado.value.trim();


  const mensagem =
    mensagemComunicado.value.trim();


  if (
    !titulo
  ) {

    mostrarMensagem(
      "Informe o título."
    );

    tituloComunicado.focus();

    return false;

  }


  if (
    !mensagem
  ) {

    mostrarMensagem(
      tipoComunicado === "enquete"
        ? "Informe a pergunta ou descrição da enquete."
        : "Informe a mensagem do recado."
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
    Number.isNaN(
      inicio.getTime()
    ) ||
    Number.isNaN(
      fim.getTime()
    )
  ) {

    mostrarMensagem(
      "Informe datas válidas."
    );

    return false;

  }


  if (
    fim <= inicio
  ) {

    mostrarMensagem(
      "O fim da exibição precisa ser posterior ao início."
    );

    dataFim.focus();

    return false;

  }


  if (
    publicoTipo.value ===
      "funcoes"
  ) {

    const funcoes =
      obterFuncoesSelecionadas();


    if (
      funcoes.length === 0
    ) {

      mostrarMensagem(
        "Selecione pelo menos uma função."
      );

      return false;

    }

  }


  if (
    tipoComunicado ===
      "enquete"
  ) {

    const opcoes =
      obterOpcoesEnquete();


    if (
      opcoes.length < 2
    ) {

      mostrarMensagem(
        "A enquete precisa ter pelo menos duas opções de resposta."
      );

      return false;

    }

  }


  return true;

}


/* ==========================================
   SALVAR COMUNICADO
========================================== */

async function salvarComunicado(
  evento
) {

  evento.preventDefault();


  esconderMensagem();


  if (
    !validarFormulario()
  ) {

    return;

  }


  botaoSalvarComunicado.disabled =
    true;


  botaoSalvarComunicado.textContent =
    "PUBLICANDO...";


  try {

    const usuarioId =
      await obterUsuarioAtual();


    const funcoesSelecionadas =
      publicoTipo.value === "funcoes"
        ? obterFuncoesSelecionadas()
        : [];


    const dadosComunicado = {

      tipo:
        tipoComunicado,

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

      status:
        "ativo",

      publico_tipo:
        publicoTipo.value,

      publico_filtros:
        publicoTipo.value === "funcoes"
          ? {
              funcoes:
                funcoesSelecionadas
            }
          : null,

      criado_por:
        usuarioId

    };


    const resultadoComunicado =
      await window.supabaseClient
        .from(
          "comunicados"
        )
        .insert(
          dadosComunicado
        )
        .select(
          "id"
        )
        .single();


    if (
      resultadoComunicado.error
    ) {

      throw resultadoComunicado.error;

    }


    /* ======================================
       SE FOR ENQUETE, SALVAR OPÇÕES
    ====================================== */

    if (
      tipoComunicado ===
      "enquete"
    ) {

      const opcoes =
        obterOpcoesEnquete();


      const registrosOpcoes =
        opcoes.map(
          (
            texto,
            indice
          ) => ({

            comunicado_id:
              resultadoComunicado.data.id,

            texto:
              texto,

            ordem:
              indice + 1

          })
        );


      const resultadoOpcoes =
        await window.supabaseClient
          .from(
            "enquete_opcoes"
          )
          .insert(
            registrosOpcoes
          );


      if (
        resultadoOpcoes.error
      ) {

        throw resultadoOpcoes.error;

      }

    }


    mostrarMensagem(
      tipoComunicado === "enquete"
        ? "Enquete publicada com sucesso."
        : "Recado publicado com sucesso."
    );


    botaoSalvarComunicado.textContent =
      tipoComunicado === "enquete"
        ? "Enquete publicada"
        : "Recado publicado";


    setTimeout(
      () => {

        window.location.href =
          "adm-comunicados.html";

      },
      700
    );


  } catch (erro) {

    console.error(
      "Erro ao publicar comunicado:",
      erro
    );


    mostrarMensagem(
      "Não foi possível publicar. Tente novamente."
    );


    botaoSalvarComunicado.disabled =
      false;


    botaoSalvarComunicado.textContent =
      tipoComunicado === "enquete"
        ? "Publicar Enquete"
        : "Publicar Recado";

  }

}


/* ==========================================
   EVENTOS
========================================== */

publicoTipo.addEventListener(
  "change",
  alterarPublico
);


botaoAdicionarOpcao.addEventListener(
  "click",
  () => {

    adicionarOpcaoEnquete();

  }
);


formularioComunicado.addEventListener(
  "submit",
  salvarComunicado
);


/* ==========================================
   INICIALIZAÇÃO
========================================== */

function iniciarPagina() {

  if (
    !window.supabaseClient
  ) {

    mostrarMensagem(
      "Não foi possível conectar ao banco de dados."
    );

    botaoSalvarComunicado.disabled =
      true;

    return;

  }


  configurarTela();


  preencherDatasIniciais();

}


iniciarPagina();
