"use strict";

const CHAVE_DADOS_PESSOAIS =
  "tufra_dados_pessoais";

const CHAVE_CADASTRO_PENDENTE =
  "tufra_cadastro_pendente";

const video =
  document.getElementById(
    "camera"
  );

const canvas =
  document.getElementById(
    "fotoCapturada"
  );

const fotoPreview =
  document.getElementById(
    "fotoPreview"
  );

const estadoInicialCamera =
  document.getElementById(
    "estadoInicialCamera"
  );

const mensagemCamera =
  document.getElementById(
    "mensagemCamera"
  );

const acoesCameraInicial =
  document.getElementById(
    "acoesCameraInicial"
  );

const acoesCameraAberta =
  document.getElementById(
    "acoesCameraAberta"
  );

const acoesFotoCapturada =
  document.getElementById(
    "acoesFotoCapturada"
  );

const botaoAbrirCamera =
  document.getElementById(
    "botaoAbrirCamera"
  );

const botaoCapturar =
  document.getElementById(
    "botaoCapturar"
  );

const botaoNovaFoto =
  document.getElementById(
    "botaoNovaFoto"
  );

const botaoEnviarCadastro =
  document.getElementById(
    "botaoEnviarCadastro"
  );

let streamCamera =
  null;


function esconder(elemento) {
  if (elemento) {
    elemento.hidden =
      true;
  }
}


function mostrar(elemento) {
  if (elemento) {
    elemento.hidden =
      false;
  }
}


function mostrarMensagem(texto) {
  if (
    mensagemCamera
  ) {
    mensagemCamera.textContent =
      texto;
  }
}


function pararCamera() {
  if (
    !streamCamera
  ) {
    return;
  }

  streamCamera
    .getTracks()
    .forEach(
      (track) =>
        track.stop()
    );

  streamCamera =
    null;

  video.srcObject =
    null;
}


function mostrarEstadoInicial() {
  pararCamera();

  mostrar(
    estadoInicialCamera
  );

  esconder(
    video
  );

  esconder(
    fotoPreview
  );

  mostrar(
    acoesCameraInicial
  );

  esconder(
    acoesCameraAberta
  );

  esconder(
    acoesFotoCapturada
  );

  mostrarMensagem("");
}


async function abrirCamera() {
  mostrarMensagem(
    "Abrindo câmera..."
  );

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices
      .getUserMedia
  ) {
    mostrarMensagem(
      "Este aparelho ou navegador não permite abrir a câmera."
    );

    return;
  }

  try {
    streamCamera =
      await navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode:
              "user"
          },

          audio:
            false
        });

    video.srcObject =
      streamCamera;

    await video.play();

    esconder(
      estadoInicialCamera
    );

    esconder(
      fotoPreview
    );

    mostrar(
      video
    );

    esconder(
      acoesCameraInicial
    );

    mostrar(
      acoesCameraAberta
    );

    esconder(
      acoesFotoCapturada
    );

    mostrarMensagem("");

  } catch (erro) {
    console.error(
      "Erro ao abrir a câmera:",
      erro
    );

    mostrarMensagem(
      "Não foi possível acessar a câmera. Verifique a permissão do navegador."
    );
  }
}


function capturarFoto() {
  if (
    !video.videoWidth ||
    !video.videoHeight
  ) {
    mostrarMensagem(
      "A câmera ainda está carregando. Aguarde um instante."
    );

    return;
  }

  const contexto =
    canvas.getContext(
      "2d"
    );

  const tamanho =
    Math.min(
      video.videoWidth,
      video.videoHeight
    );

  const origemX =
    (
      video.videoWidth -
      tamanho
    ) / 2;

  const origemY =
    (
      video.videoHeight -
      tamanho
    ) / 2;

  canvas.width =
    800;

  canvas.height =
    800;

  contexto.drawImage(
    video,
    origemX,
    origemY,
    tamanho,
    tamanho,
    0,
    0,
    800,
    800
  );

  fotoPreview.src =
    canvas.toDataURL(
      "image/jpeg",
      0.85
    );

  pararCamera();

  esconder(
    estadoInicialCamera
  );

  esconder(
    video
  );

  mostrar(
    fotoPreview
  );

  esconder(
    acoesCameraInicial
  );

  esconder(
    acoesCameraAberta
  );

  mostrar(
    acoesFotoCapturada
  );

  mostrarMensagem("");
}


function tirarNovamente() {
  fotoPreview.src =
    "";

  abrirCamera();
}


function obterTextoErro(
  erro
) {
  const partesErro = [
    erro?.message,
    erro?.details,
    erro?.hint,
    erro?.code,
    erro?.name,
    erro?.context?.message,
    erro?.context?.error,
    erro?.context?.body,
    erro?.context
  ];

  return partesErro
    .map(
      (parte) => {
        if (!parte) {
          return "";
        }

        if (
          typeof parte ===
          "string"
        ) {
          return parte;
        }

        try {
          return JSON.stringify(
            parte
          );

        } catch {
          return String(
            parte
          );
        }
      }
    )
    .join(" ")
    .toLowerCase();
}


function erroEhCpfDuplicado(
  erro
) {
  const textoErro =
    obterTextoErro(
      erro
    );

  return textoErro.includes(
    "cpf_ja_cadastrado"
  );
}


function obterMensagemAmigavelErro(
  erro
) {
  const textoErro =
    obterTextoErro(
      erro
    );

  console.error(
    "Detalhes completos do erro:",
    textoErro
  );


  if (
    textoErro.includes(
      "cpf_ja_cadastrado"
    )
  ) {
    return "Este CPF já possui um cadastro no TUFRA. Se você acredita que isso seja um erro, procure a administração.";
  }


  if (
    textoErro.includes(
      "user already registered"
    ) ||
    textoErro.includes(
      "already been registered"
    ) ||
    textoErro.includes(
      "already registered"
    ) ||
    textoErro.includes(
      "email already"
    )
  ) {
    return "Este e-mail já possui um cadastro. Se você já realizou seu cadastro anteriormente, utilize a opção 'Esqueci minha senha' na tela de login.";
  }


  if (
    textoErro.includes(
      "invalid email"
    ) ||
    textoErro.includes(
      "email address is invalid"
    ) ||
    textoErro.includes(
      "unable to validate email address"
    )
  ) {
    return "O e-mail informado não é válido. Volte à etapa anterior e confira o endereço de e-mail.";
  }


  if (
    textoErro.includes(
      "password should be"
    ) ||
    textoErro.includes(
      "password must"
    ) ||
    textoErro.includes(
      "weak password"
    )
  ) {
    return "A senha informada não atende aos requisitos de segurança. Volte à etapa anterior e escolha outra senha.";
  }


  if (
    textoErro.includes(
      "rate limit"
    ) ||
    textoErro.includes(
      "rate_limit"
    ) ||
    textoErro.includes(
      "too many requests"
    ) ||
    textoErro.includes(
      "over_email_send_rate_limit"
    ) ||
    textoErro.includes(
      "email rate limit"
    )
  ) {
    return "Foram realizadas muitas solicitações de cadastro em pouco tempo. Aguarde alguns minutos e tente novamente.";
  }


  if (
    textoErro.includes(
      "email not confirmed"
    )
  ) {
    return "O e-mail ainda não foi confirmado. Verifique sua caixa de entrada e conclua a confirmação do cadastro.";
  }


  if (
    textoErro.includes(
      "failed to fetch"
    ) ||
    textoErro.includes(
      "networkerror"
    ) ||
    textoErro.includes(
      "network request failed"
    ) ||
    textoErro.includes(
      "load failed"
    )
  ) {
    return "Não foi possível comunicar com o sistema. Verifique sua conexão com a internet e tente novamente.";
  }


  if (
    textoErro.includes(
      "foto deste cadastro já foi enviada"
    )
  ) {
    return "A foto deste cadastro já foi enviada. Aguarde a conclusão do cadastro ou procure a administração.";
  }


  if (
    textoErro.includes(
      "autorização da foto inválida"
    )
  ) {
    return "A autorização para envio da foto expirou. Volte ao início do cadastro e tente novamente.";
  }


  if (
    textoErro.includes(
      "foto não recebida"
    ) ||
    textoErro.includes(
      "foto capturada está vazia"
    ) ||
    textoErro.includes(
      "preparar a foto"
    )
  ) {
    return "Não foi possível processar a foto. Tire a foto novamente e tente enviar o cadastro.";
  }


  return "Não foi possível concluir o cadastro. Tente novamente. Se o problema continuar, procure a administração do TUFRA.";
}


function obterCadastroPendente() {
  try {
    const dadosSalvos =
      sessionStorage.getItem(
        CHAVE_CADASTRO_PENDENTE
      );

    return dadosSalvos
      ? JSON.parse(
          dadosSalvos
        )
      : null;

  } catch (erro) {
    console.error(
      "Erro ao recuperar cadastro pendente:",
      erro
    );

    return null;
  }
}


function existePrimeiraEtapaSalva() {
  try {
    const dadosSalvos =
      localStorage.getItem(
        CHAVE_DADOS_PESSOAIS
      );

    if (
      !dadosSalvos
    ) {
      return false;
    }

    const dados =
      JSON.parse(
        dadosSalvos
      );

    return Boolean(
      dados?.nomeCompleto &&
      dados?.email &&
      dados?.cpf
    );

  } catch {
    return false;
  }
}


async function solicitarCadastro() {
  mostrarMensagem("");

  const dados =
    obterCadastroPendente();

  if (
    !dados
  ) {
    if (
      existePrimeiraEtapaSalva()
    ) {
      mostrarMensagem(
        "Os dados de acesso desta etapa foram perdidos pelo navegador. Volte à etapa anterior e informe novamente seu usuário e senha."
      );

    } else {
      mostrarMensagem(
        "Os dados do cadastro não foram encontrados. Volte e preencha novamente."
      );
    }

    return;
  }

  if (
    !fotoPreview.src
  ) {
    mostrarMensagem(
      "Tire uma foto antes de solicitar o cadastro."
    );

    return;
  }

  if (
    !window.supabaseClient
  ) {
    mostrarMensagem(
      "Não foi possível conectar ao sistema."
    );

    return;
  }

  botaoEnviarCadastro.disabled =
    true;

  botaoNovaFoto.disabled =
    true;

  botaoEnviarCadastro.textContent =
    "ENVIANDO...";

  try {
    let authId =
      dados.authId || "";

    if (
      !authId
    ) {
      const resultadoCadastro =
        await window.supabaseClient.auth
          .signUp({
            email:
              dados.email
                .trim()
                .toLowerCase(),

            password:
              dados.senha,

            options: {
              data: {
                nome_completo:
                  dados.nomeCompleto,

                cpf:
                  dados.cpf,

                telefone:
                  dados.telefone || "",

                data_nascimento:
                  dados.dataNascimento || "",

                nome_usuario:
                  dados.nomeUsuario,

                foto_token:
                  dados.fotoToken
              }
            }
          });

      if (
        resultadoCadastro.error
      ) {
        throw resultadoCadastro.error;
      }

      const usuarioAuth =
        resultadoCadastro.data.user;

      if (
        !usuarioAuth
      ) {
        throw new Error(
          "O usuário não foi criado."
        );
      }

      authId =
        usuarioAuth.id;

      dados.authId =
        authId;

      sessionStorage.setItem(
        CHAVE_CADASTRO_PENDENTE,
        JSON.stringify(
          dados
        )
      );
    }

    const respostaFoto =
      await fetch(
        fotoPreview.src
      );

    if (
      !respostaFoto.ok
    ) {
      throw new Error(
        "Não foi possível preparar a foto."
      );
    }

    const fotoBlob =
      await respostaFoto.blob();

    if (
      !fotoBlob ||
      fotoBlob.size === 0
    ) {
      throw new Error(
        "A foto capturada está vazia."
      );
    }

    const formularioFoto =
      new FormData();

    formularioFoto.append(
      "auth_id",
      authId
    );

    formularioFoto.append(
      "foto_token",
      dados.fotoToken
    );

    formularioFoto.append(
      "foto",
      fotoBlob,
      "perfil.jpg"
    );

    mostrarMensagem(
      "Salvando sua foto..."
    );

    const resultadoFoto =
      await window.supabaseClient.functions
        .invoke(
          "salvar-foto-cadastro",
          {
            body:
              formularioFoto
          }
        );

    if (
      resultadoFoto.error
    ) {
      throw resultadoFoto.error;
    }

    if (
      !resultadoFoto.data ||
      !resultadoFoto.data.sucesso
    ) {
      throw new Error(
        resultadoFoto.data?.erro ||
        "Não foi possível salvar a foto."
      );
    }

    sessionStorage.setItem(
      "tufra_cadastro_completo",
      JSON.stringify({
        nomeCompleto:
          dados.nomeCompleto,

        cpf:
          dados.cpf,

        dataNascimento:
          dados.dataNascimento,

        telefone:
          dados.telefone,

        email:
          dados.email,

        nomeUsuario:
          dados.nomeUsuario,

        authId,

        fotoPath:
          resultadoFoto.data
            .foto_path,

        status:
          "Aguardando aprovação",

        dataSolicitacao:
          new Date().toISOString()
      })
    );

    sessionStorage.removeItem(
      CHAVE_CADASTRO_PENDENTE
    );

    localStorage.removeItem(
      CHAVE_DADOS_PESSOAIS
    );

    window.location.href =
      "cadastro-sucesso.html";

  } catch (erro) {
    console.error(
      "Erro ao concluir cadastro:",
      erro,
      erro?.context
    );

    mostrarMensagem(
      obterMensagemAmigavelErro(
        erro
      )
    );

    botaoEnviarCadastro.disabled =
      false;

    botaoNovaFoto.disabled =
      false;

    botaoEnviarCadastro.textContent =
      "Solicitar cadastro";
  }
}


botaoAbrirCamera.addEventListener(
  "click",
  abrirCamera
);

botaoCapturar.addEventListener(
  "click",
  capturarFoto
);

botaoNovaFoto.addEventListener(
  "click",
  tirarNovamente
);

botaoEnviarCadastro.addEventListener(
  "click",
  solicitarCadastro
);

window.addEventListener(
  "pagehide",
  pararCamera
);

mostrarEstadoInicial();
