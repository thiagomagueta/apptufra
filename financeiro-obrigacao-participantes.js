"use strict";


/* ==========================================
   ELEMENTOS
========================================== */

const conteudoParticipantesObrigacao =
  document.getElementById(
    "conteudoParticipantesObrigacao"
  );

const resumoParticipantesObrigacao =
  document.getElementById(
    "resumoParticipantesObrigacao"
  );

const cardParticipantesIncluidos =
  document.getElementById(
    "cardParticipantesIncluidos"
  );

const cardAdicionarParticipantes =
  document.getElementById(
    "cardAdicionarParticipantes"
  );

const cardGerarCobrancasObrigacao =
  document.getElementById(
    "cardGerarCobrancasObrigacao"
  );

const botaoGerarCobrancasObrigacao =
  document.getElementById(
    "botaoGerarCobrancasObrigacao"
  );


const tituloObrigacaoParticipantes =
  document.getElementById(
    "tituloObrigacaoParticipantes"
  );

const dataObrigacaoParticipantes =
  document.getElementById(
    "dataObrigacaoParticipantes"
  );

const valorObrigacaoParticipantes =
  document.getElementById(
    "valorObrigacaoParticipantes"
  );

const textoResumoParticipantesObrigacao =
  document.getElementById(
    "textoResumoParticipantesObrigacao"
  );


const mensagemParticipantesIncluidos =
  document.getElementById(
    "mensagemParticipantesIncluidos"
  );

const listaParticipantesIncluidos =
  document.getElementById(
    "listaParticipantesIncluidos"
  );


const mensagemParticipantesDisponiveis =
  document.getElementById(
    "mensagemParticipantesDisponiveis"
  );

const listaParticipantesDisponiveis =
  document.getElementById(
    "listaParticipantesDisponiveis"
  );


const botaoSelecionarTodosParticipantes =
  document.getElementById(
    "botaoSelecionarTodosParticipantes"
  );

const botaoTirarSelecaoTodosParticipantes =
  document.getElementById(
    "botaoTirarSelecaoTodosParticipantes"
  );

const botaoSalvarParticipantesManuais =
  document.getElementById(
    "botaoSalvarParticipantesManuais"
  );

const mensagemSalvarParticipantesManuais =
  document.getElementById(
    "mensagemSalvarParticipantesManuais"
  );


/* ==========================================
   VARIÁVEIS
========================================== */

let obrigacaoIdAtual =
  null;

let usuarioLogadoId =
  null;

let participantesIncluidosAtuais =
  [];

let usuariosDisponiveisAtuais =
  [];


/* ==========================================
   UTILIDADES
========================================== */

function formatarDataBrasil(
  data
) {

  if (
    !data
  ) {

    return "";

  }


  const partes =
    data.split("-");


  if (
    partes.length !== 3
  ) {

    return data;

  }


  return (
    partes[2] +
    "/" +
    partes[1] +
    "/" +
    partes[0]
  );

}


function formatarValorBrasil(
  valor
) {

  const numero =
    Number(valor || 0);


  return numero.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  );

}


function traduzirSituacao(
  situacao
) {

  if (
    situacao ===
    "obrigatorio"
  ) {

    return "Obrigatório";

  }


  if (
    situacao ===
    "isento"
  ) {

    return "Isento";

  }


  if (
    situacao ===
    "opcional_confirmado"
  ) {

    return "Opcional confirmado";

  }


  return situacao || "";

}


function traduzirOrigem(
  origem
) {

  if (
    origem ===
    "funcao"
  ) {

    return "Função";

  }


  if (
    origem ===
    "adesao"
  ) {

    return "Adesão";

  }


  if (
    origem ===
    "manual"
  ) {

    return "Manual";

  }


  return origem || "";

}


/* ==========================================
   ID DA OBRIGAÇÃO
========================================== */

function carregarObrigacaoIdUrl() {

  const parametros =
    new URLSearchParams(
      window.location.search
    );


  const id =
    parametros.get(
      "id"
    );


  if (
    !id
  ) {

    return null;

  }


  const numero =
    Number(id);


  if (
    !Number.isInteger(numero) ||
    numero <= 0
  ) {

    return null;

  }


  return numero;

}


/* ==========================================
   CARREGAR DADOS DA OBRIGAÇÃO
========================================== */

async function carregarDadosObrigacao() {

  const resultado =
    await window.supabaseClient
      .from(
        "financeiro_obrigacoes"
      )
      .select(`
        id,
        atividade_id,
        valor,
        ativo
      `)
      .eq(
        "id",
        obrigacaoIdAtual
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

    throw new Error(
      "Obrigação não encontrada."
    );

  }


  const obrigacao =
    resultado.data;


  const resultadoAtividade =
    await window.supabaseClient
      .from(
        "atividades"
      )
      .select(`
        id,
        titulo,
        data
      `)
      .eq(
        "id",
        obrigacao.atividade_id
      )
      .maybeSingle();


  if (
    resultadoAtividade.error
  ) {

    throw resultadoAtividade.error;

  }


  const atividade =
    resultadoAtividade.data;


  tituloObrigacaoParticipantes.textContent =
    atividade?.titulo ||
    "Obrigação";


  dataObrigacaoParticipantes.textContent =
    atividade?.data
      ? "Data: " +
        formatarDataBrasil(
          atividade.data
        )
      : "";


  valorObrigacaoParticipantes.textContent =
    "Valor: " +
    formatarValorBrasil(
      obrigacao.valor
    );

}


/* ==========================================
   REMOVER PARTICIPANTE
========================================== */

async function removerParticipanteObrigacao(
  participante
) {

  const mensagemConfirmacao =
    participante.cobranca_id
      ? "Deseja realmente remover esta pessoa desta obrigação?\n\nComo já existe uma cobrança vinculada, ela também será removida se estiver aberta e sem nenhum pagamento aplicado.\n\nSe existir pagamento, a remoção será bloqueada."
      : "Deseja realmente remover esta pessoa desta obrigação?";


  const confirmar =
    window.confirm(
      mensagemConfirmacao
    );


  if (
    !confirmar
  ) {

    return;

  }


  try {

    const resultado =
      await window.supabaseClient
        .rpc(
          "financeiro_remover_participante_obrigacao",
          {
            p_participante_id:
              participante.id
          }
        );


    if (
      resultado.error
    ) {

      throw resultado.error;

    }


    await carregarParticipantesIncluidos();

    atualizarResumoParticipantes();

    await carregarUsuariosDisponiveis();


  } catch (erro) {

    console.error(
      "Erro ao remover participante:",
      erro
    );


    const mensagemErro =
      erro?.message ||
      "";


    if (
      mensagemErro.includes(
        "já possui pagamento aplicado"
      )
    ) {

      alert(
        "Não é possível remover esta pessoa porque a cobrança já possui pagamento aplicado."
      );

      return;

    }


    if (
      mensagemErro.includes(
        "não está aberta"
      )
    ) {

      alert(
        "Não é possível remover esta pessoa porque a cobrança vinculada não está aberta."
      );

      return;

    }


    alert(
      "Não foi possível remover esta pessoa da obrigação."
    );

  }

}


/* ==========================================
   CARREGAR PARTICIPANTES JÁ INCLUÍDOS
========================================== */

async function carregarParticipantesIncluidos() {

  const resultado =
    await window.supabaseClient
      .from(
        "financeiro_obrigacao_participantes"
      )
      .select(`
        id,
        obrigacao_id,
        usuario_id,
        situacao,
        origem,
        cobranca_id,
        criado_em,
        ajustado_por,
        ajustado_em
      `)
      .eq(
        "obrigacao_id",
        obrigacaoIdAtual
      )
      .order(
        "situacao",
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


  participantesIncluidosAtuais =
    resultado.data ||
    [];


  const idsUsuarios =
    participantesIncluidosAtuais
      .map(
        (participante) =>
          participante.usuario_id
      );


  let usuariosPorId =
    {};


  if (
    idsUsuarios.length > 0
  ) {

    const resultadoUsuarios =
      await window.supabaseClient
        .from(
          "usuarios"
        )
        .select(`
          id,
          nome_completo
        `)
        .in(
          "id",
          idsUsuarios
        );


    if (
      resultadoUsuarios.error
    ) {

      throw resultadoUsuarios.error;

    }


    const usuarios =
      resultadoUsuarios.data ||
      [];


    usuariosPorId =
      Object.fromEntries(
        usuarios.map(
          (usuario) => [
            usuario.id,
            usuario
          ]
        )
      );

  }


  listaParticipantesIncluidos.innerHTML =
    "";


  if (
    participantesIncluidosAtuais.length === 0
  ) {

    mensagemParticipantesIncluidos.hidden =
      false;

    mensagemParticipantesIncluidos.textContent =
      "Nenhum participante incluído nesta obrigação.";

    return;

  }


  mensagemParticipantesIncluidos.hidden =
    true;


  const participantesOrdenados =
    participantesIncluidosAtuais
      .map(
        (participante) => ({
          ...participante,

          nome:
            usuariosPorId[
              participante.usuario_id
            ]?.nome_completo ||
            "Usuário"
        })
      )
      .sort(
        (a, b) =>
          a.nome.localeCompare(
            b.nome,
            "pt-BR"
          )
      );


  participantesOrdenados.forEach(
    (participante) => {

      const bloco =
        document.createElement(
          "div"
        );


      bloco.style.padding =
        "12px 0";

      bloco.style.borderBottom =
        "1px solid #e5dddd";


      const nome =
        document.createElement(
          "div"
        );


      nome.style.fontWeight =
        "700";

      nome.textContent =
        participante.nome;


      const detalhes =
        document.createElement(
          "div"
        );


      detalhes.style.marginTop =
        "4px";

      detalhes.style.fontSize =
        "14px";

      detalhes.textContent =
        traduzirSituacao(
          participante.situacao
        ) +
        " • " +
        traduzirOrigem(
          participante.origem
        );


      const botaoRemover =
        document.createElement(
          "button"
        );


      botaoRemover.type =
        "button";

      botaoRemover.textContent =
        "×";

      botaoRemover.title =
        "Remover desta obrigação";

      botaoRemover.setAttribute(
        "aria-label",
        "Remover " +
        participante.nome +
        " desta obrigação"
      );

      botaoRemover.style.float =
        "right";

      botaoRemover.style.marginTop =
        "-34px";

      botaoRemover.style.width =
        "30px";

      botaoRemover.style.height =
        "30px";

      botaoRemover.style.padding =
        "0";

      botaoRemover.style.border =
        "none";

      botaoRemover.style.borderRadius =
        "50%";

      botaoRemover.style.background =
        "transparent";

      botaoRemover.style.color =
        "#9a2929";

      botaoRemover.style.fontSize =
        "25px";

      botaoRemover.style.fontWeight =
        "700";

      botaoRemover.style.lineHeight =
        "30px";

      botaoRemover.style.textAlign =
        "center";

      botaoRemover.style.cursor =
        "pointer";


      botaoRemover.addEventListener(
        "click",
        async () => {

          await removerParticipanteObrigacao(
            participante
          );

        }
      );


      bloco.appendChild(
        nome
      );

      bloco.appendChild(
        detalhes
      );

      bloco.appendChild(
        botaoRemover
      );


      listaParticipantesIncluidos.appendChild(
        bloco
      );

    }
  );

}


/* ==========================================
   CARREGAR USUÁRIOS DISPONÍVEIS
========================================== */

async function carregarUsuariosDisponiveis() {

  const idsIncluidos =
    participantesIncluidosAtuais
      .map(
        (participante) =>
          participante.usuario_id
      );


  const resultado =
    await window.supabaseClient
      .from(
        "usuarios"
      )
      .select(`
        id,
        nome_completo,
        status
      `)
      .eq(
        "status",
        "ativo"
      )
      .order(
        "nome_completo",
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


  const usuarios =
    resultado.data ||
    [];


  usuariosDisponiveisAtuais =
    usuarios.filter(
      (usuario) =>
        !idsIncluidos.includes(
          usuario.id
        )
    );


  listaParticipantesDisponiveis.innerHTML =
    "";


  if (
    usuariosDisponiveisAtuais.length === 0
  ) {

    mensagemParticipantesDisponiveis.hidden =
      false;

    mensagemParticipantesDisponiveis.textContent =
      "Todos os associados ativos já estão incluídos nesta obrigação.";

    botaoSelecionarTodosParticipantes.disabled =
      true;

    botaoTirarSelecaoTodosParticipantes.disabled =
      true;

    botaoSalvarParticipantesManuais.disabled =
      true;

    return;

  }


  mensagemParticipantesDisponiveis.hidden =
    true;


  botaoSelecionarTodosParticipantes.disabled =
    false;

  botaoTirarSelecaoTodosParticipantes.disabled =
    false;

  botaoSalvarParticipantesManuais.disabled =
    false;


  usuariosDisponiveisAtuais.forEach(
    (usuario) => {

      const linha =
        document.createElement(
          "label"
        );


      linha.style.display =
        "flex";

      linha.style.alignItems =
        "center";

      linha.style.gap =
        "10px";

      linha.style.padding =
        "11px 0";

      linha.style.borderBottom =
        "1px solid #e5dddd";

      linha.style.cursor =
        "pointer";


      const checkbox =
        document.createElement(
          "input"
        );


      checkbox.type =
        "checkbox";

      checkbox.className =
        "checkbox-participante-manual";

      checkbox.value =
        usuario.id;


      const nome =
        document.createElement(
          "span"
        );


      nome.textContent =
        usuario.nome_completo;


      linha.appendChild(
        checkbox
      );

      linha.appendChild(
        nome
      );


      listaParticipantesDisponiveis.appendChild(
        linha
      );

    }
  );

}


/* ==========================================
   ATUALIZAR RESUMO
========================================== */

function atualizarResumoParticipantes() {

  const totalObrigatorios =
    participantesIncluidosAtuais
      .filter(
        (participante) =>
          participante.situacao ===
          "obrigatorio"
      )
      .length;


  const totalIsentos =
    participantesIncluidosAtuais
      .filter(
        (participante) =>
          participante.situacao ===
          "isento"
      )
      .length;


  const totalOpcionais =
    participantesIncluidosAtuais
      .filter(
        (participante) =>
          participante.situacao ===
          "opcional_confirmado"
      )
      .length;


  const totalManuais =
    participantesIncluidosAtuais
      .filter(
        (participante) =>
          participante.origem ===
          "manual"
      )
      .length;


  textoResumoParticipantesObrigacao.textContent =
    totalObrigatorios +
    " obrigatório(s) • " +
    totalIsentos +
    " isento(s) • " +
    totalOpcionais +
    " opcional(is) confirmado(s) • " +
    totalManuais +
    " inclusão(ões) manual(is).";

}


/* ==========================================
   SELECIONAR TODOS
========================================== */

function selecionarTodosParticipantes() {

  document
    .querySelectorAll(
      ".checkbox-participante-manual"
    )
    .forEach(
      (checkbox) => {

        checkbox.checked =
          true;

      }
    );

}


/* ==========================================
   TIRAR SELEÇÃO DE TODOS
========================================== */

function tirarSelecaoTodosParticipantes() {

  document
    .querySelectorAll(
      ".checkbox-participante-manual"
    )
    .forEach(
      (checkbox) => {

        checkbox.checked =
          false;

      }
    );

}


/* ==========================================
   SALVAR PARTICIPANTES MANUAIS
========================================== */

async function salvarParticipantesManuais() {

  const selecionados =
    Array.from(
      document.querySelectorAll(
        ".checkbox-participante-manual:checked"
      )
    )
      .map(
        (checkbox) =>
          checkbox.value
      );


  if (
    selecionados.length === 0
  ) {

    mensagemSalvarParticipantesManuais.textContent =
      "Selecione pelo menos uma pessoa.";

    mensagemSalvarParticipantesManuais.style.color =
      "#9a2929";

    return;

  }


  botaoSalvarParticipantesManuais.disabled =
    true;


  mensagemSalvarParticipantesManuais.textContent =
    "Salvando...";

  mensagemSalvarParticipantesManuais.style.color =
    "#6b5d5d";


  try {

    const agora =
      new Date()
        .toISOString();


    const registros =
      selecionados.map(
        (usuarioId) => ({
          obrigacao_id:
            obrigacaoIdAtual,

          usuario_id:
            usuarioId,

          situacao:
            "opcional_confirmado",

          origem:
            "manual",

          ajustado_por:
            usuarioLogadoId,

          ajustado_em:
            agora,

          atualizado_em:
            agora
        })
      );


    const resultado =
      await window.supabaseClient
        .from(
          "financeiro_obrigacao_participantes"
        )
        .insert(
          registros
        );


    if (
      resultado.error
    ) {

      throw resultado.error;

    }


    mensagemSalvarParticipantesManuais.textContent =
      "Participantes adicionados com sucesso.";

    mensagemSalvarParticipantesManuais.style.color =
      "#267341";


    await carregarParticipantesIncluidos();

    atualizarResumoParticipantes();

    await carregarUsuariosDisponiveis();


  } catch (erro) {

    console.error(
      "Erro ao salvar participantes manuais:",
      erro
    );


    mensagemSalvarParticipantesManuais.textContent =
      "Não foi possível salvar os participantes.";

    mensagemSalvarParticipantesManuais.style.color =
      "#9a2929";


  } finally {

    botaoSalvarParticipantesManuais.disabled =
      false;

  }

}


/* ==========================================
   GERAR COBRANÇAS DA OBRIGAÇÃO
========================================== */

async function gerarCobrancasObrigacao() {

  const confirmar =
    window.confirm(
      "Gerar cobranças para todos os participantes desta obrigação que ainda não possuem cobrança?\n\nOs participantes isentos não receberão cobrança."
    );


  if (
    !confirmar
  ) {

    return;

  }


  botaoGerarCobrancasObrigacao.disabled =
    true;


  const textoOriginal =
    botaoGerarCobrancasObrigacao.textContent;


  botaoGerarCobrancasObrigacao.textContent =
    "Gerando cobranças...";


  try {

    const resultado =
      await window.supabaseClient
        .rpc(
          "financeiro_gerar_cobrancas_obrigacao",
          {
            p_obrigacao_id:
              obrigacaoIdAtual
          }
        );


    if (
      resultado.error
    ) {

      throw resultado.error;

    }


    const quantidade =
      Number(
        resultado.data || 0
      );


    if (
      quantidade === 0
    ) {

      alert(
        "Nenhuma nova cobrança foi gerada.\n\nTodos os participantes que precisam pagar já possuem cobrança."
      );

    } else if (
      quantidade === 1
    ) {

      alert(
        "1 cobrança foi gerada com sucesso."
      );

    } else {

      alert(
        quantidade +
        " cobranças foram geradas com sucesso."
      );

    }


    await carregarParticipantesIncluidos();

    atualizarResumoParticipantes();

    await carregarUsuariosDisponiveis();


  } catch (erro) {

    console.error(
      "Erro ao gerar cobranças da obrigação:",
      erro
    );


    alert(
      "Não foi possível gerar as cobranças desta obrigação."
    );


  } finally {

    botaoGerarCobrancasObrigacao.disabled =
      false;

    botaoGerarCobrancasObrigacao.textContent =
      textoOriginal;

  }

}


/* ==========================================
   CARREGAR TELA
========================================== */

async function carregarTelaParticipantesObrigacao() {

  try {

    await carregarDadosObrigacao();

    await carregarParticipantesIncluidos();

    atualizarResumoParticipantes();

    await carregarUsuariosDisponiveis();


    conteudoParticipantesObrigacao.hidden =
      false;

    resumoParticipantesObrigacao.hidden =
      false;

    cardParticipantesIncluidos.hidden =
      false;

    cardAdicionarParticipantes.hidden =
      false;

    cardGerarCobrancasObrigacao.hidden =
      false;


    if (
      botaoGerarCobrancasObrigacao
    ) {

      botaoGerarCobrancasObrigacao.disabled =
        false;

    }


  } catch (erro) {

    console.error(
      "Erro ao carregar participantes da obrigação:",
      erro
    );


    alert(
      "Não foi possível carregar os participantes da obrigação."
    );

  }

}


/* ==========================================
   VALIDAR ACESSO
========================================== */

async function validarAcessoParticipantesObrigacao() {

  if (
    !window.supabaseClient
  ) {

    window.location.href =
      "adm-financeiro.html";

    return;

  }


  obrigacaoIdAtual =
    carregarObrigacaoIdUrl();


  if (
    !obrigacaoIdAtual
  ) {

    window.location.href =
      "financeiro-obrigacoes.html";

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


    usuarioLogadoId =
      resultadoUsuario.data.id;


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
        "adm-financeiro.html";

      return;

    }


    await carregarTelaParticipantesObrigacao();


  } catch (erro) {

    console.error(
      "Erro ao validar acesso:",
      erro
    );


    window.location.href =
      "adm-financeiro.html";

  }

}


/* ==========================================
   EVENTOS
========================================== */

if (
  botaoSelecionarTodosParticipantes
) {

  botaoSelecionarTodosParticipantes
    .addEventListener(
      "click",
      selecionarTodosParticipantes
    );

}


if (
  botaoTirarSelecaoTodosParticipantes
) {

  botaoTirarSelecaoTodosParticipantes
    .addEventListener(
      "click",
      tirarSelecaoTodosParticipantes
    );

}


if (
  botaoSalvarParticipantesManuais
) {

  botaoSalvarParticipantesManuais
    .addEventListener(
      "click",
      salvarParticipantesManuais
    );

}


if (
  botaoGerarCobrancasObrigacao
) {

  botaoGerarCobrancasObrigacao
    .addEventListener(
      "click",
      gerarCobrancasObrigacao
    );

}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

validarAcessoParticipantesObrigacao();
