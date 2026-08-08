"use strict";

const video = document.getElementById("camera");
const canvas = document.getElementById("fotoCapturada");
const fotoPreview = document.getElementById("fotoPreview");

const estadoInicialCamera = document.getElementById(
  "estadoInicialCamera"
);

const mensagemCamera = document.getElementById(
  "mensagemCamera"
);

const acoesCameraInicial = document.getElementById(
  "acoesCameraInicial"
);

const acoesCameraAberta = document.getElementById(
  "acoesCameraAberta"
);

const acoesFotoCapturada = document.getElementById(
  "acoesFotoCapturada"
);

const botaoAbrirCamera = document.getElementById(
  "botaoAbrirCamera"
);

const botaoCapturar = document.getElementById(
  "botaoCapturar"
);

const botaoNovaFoto = document.getElementById(
  "botaoNovaFoto"
);

const botaoEnviarCadastro = document.getElementById(
  "botaoEnviarCadastro"
);

let streamCamera = null;

function esconder(elemento) {
  if (elemento) {
    elemento.hidden = true;
  }
}

function mostrar(elemento) {
  if (elemento) {
    elemento.hidden = false;
  }
}

function mostrarMensagem(texto) {
  if (mensagemCamera) {
    mensagemCamera.textContent = texto;
  }
}

function pararCamera() {
  if (!streamCamera) {
    return;
  }

  streamCamera
    .getTracks()
    .forEach((track) => track.stop());

  streamCamera = null;
  video.srcObject = null;
}

function mostrarEstadoInicial() {
  pararCamera();

mostrar(estadoInicialCamera);

  esconder(video);
  esconder(fotoPreview);

  mostrar(acoesCameraInicial);
  esconder(acoesCameraAberta);
  esconder(acoesFotoCapturada);

  mostrarMensagem("");
}

async function abrirCamera() {
  mostrarMensagem("Abrindo câmera...");

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {
    mostrarMensagem(
      "Este aparelho ou navegador não permite abrir a câmera."
    );
    return;
  }

  try {
    streamCamera =
      await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user"
        },
        audio: false
      });

    video.srcObject = streamCamera;

    await video.play();

    esconder(estadoInicialCamera);
    esconder(fotoPreview);

    mostrar(video);

    esconder(acoesCameraInicial);
    mostrar(acoesCameraAberta);
    esconder(acoesFotoCapturada);

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
  if (!video.videoWidth || !video.videoHeight) {
    mostrarMensagem(
      "A câmera ainda está carregando. Aguarde um instante."
    );
    return;
  }

  const contexto = canvas.getContext("2d");

  const tamanho = Math.min(
    video.videoWidth,
    video.videoHeight
  );

  const origemX =
    (video.videoWidth - tamanho) / 2;

  const origemY =
    (video.videoHeight - tamanho) / 2;

  canvas.width = 800;
  canvas.height = 800;

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

  esconder(estadoInicialCamera);
  esconder(video);

  mostrar(fotoPreview);

  esconder(acoesCameraInicial);
  esconder(acoesCameraAberta);
mostrar(acoesFotoCapturada);

  mostrarMensagem("");
}

function tirarNovamente() {
  fotoPreview.src = "";
  abrirCamera();
}

async function solicitarCadastro() {
  mostrarMensagem("");

  const dadosSalvos = sessionStorage.getItem(
    "tufra_cadastro_pendente"
  );

  if (!dadosSalvos) {
    mostrarMensagem(
      "Os dados do cadastro não foram encontrados. Volte e preencha novamente."
    );
    return;
  }

  if (!fotoPreview.src) {
    mostrarMensagem(
      "Tire uma foto antes de solicitar o cadastro."
    );
    return;
  }

  if (!window.supabaseClient) {
    mostrarMensagem(
      "Não foi possível conectar ao sistema."
    );
    return;
  }

  const dados = JSON.parse(dadosSalvos);

  botaoEnviarCadastro.disabled = true;
  botaoNovaFoto.disabled = true;

  botaoEnviarCadastro.textContent =
    "ENVIANDO...";

  try {
    let authId = dados.authId || "";

    /*
      Cria o usuário somente se ele ainda
      não tiver sido criado.
    */
    if (!authId) {
      const resultadoCadastro =
        await window.supabaseClient.auth.signUp({
          email: dados.email
            .trim()
            .toLowerCase(),

          password: dados.senha,

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

      if (resultadoCadastro.error) {
        throw resultadoCadastro.error;
      }

      const usuarioAuth =
        resultadoCadastro.data.user;

      if (!usuarioAuth) {
        throw new Error(
          "O usuário não foi criado."
        );
      }

      authId = usuarioAuth.id;

      /*
        Guarda o ID imediatamente.
        Se o upload da foto falhar,
        poderemos tentar novamente sem
        criar outro usuário.
      */
      dados.authId = authId;

      sessionStorage.setItem(
        "tufra_cadastro_pendente",
        JSON.stringify(dados)
      );
    }

    /*
      Transforma a foto capturada
      em um arquivo JPEG.
    */
    const fotoBlob =
      await new Promise(
        (resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(
                  new Error(
                    "Não foi possível preparar a foto."
                  )
                );
              }
            },
            "image/jpeg",
            0.85
          );
        }
      );

    /*
      Prepara os dados que serão enviados
      para a Edge Function.
    */
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

    /*
      Envia a foto para a Edge Function
      que criamos no Supabase.
    */
    const resultadoFoto =
      await window.supabaseClient.functions.invoke(
        "salvar-foto-cadastro",
        {
          body: formularioFoto
        }
      );

    if (resultadoFoto.error) {
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

    /*
      Guarda apenas dados seguros.
      A senha não permanece salva.
    */
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
          resultadoFoto.data.foto_path,

        status:
          "Aguardando aprovação",

        dataSolicitacao:
          new Date().toISOString()
      })
    );

    sessionStorage.removeItem(
      "tufra_cadastro_pendente"
    );

    sessionStorage.removeItem(
      "tufra_dados_pessoais"
    );

    window.location.href =
      "cadastro-sucesso.html";

  } catch (erro) {
    console.error(
      "Erro ao concluir cadastro:",
      erro,
      erro?context
    );

    mostrarMensagem(
      "Não foi possível concluir o cadastro. Tente novamente."
    );

    botaoEnviarCadastro.disabled = false;
    botaoNovaFoto.disabled = false;

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
