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

  const dadosSalvos =
    sessionStorage.getItem(
      "tufra_cadastro_pendente"
    );

  if (!dadosSalvos) {
    mostrarMensagem(
      "Os dados do cadastro não foram encontrados."
    );
    return;
  }

  const dados =
    JSON.parse(dadosSalvos);

  botaoEnviarCadastro.disabled = true;
  botaoNovaFoto.disabled = true;

  botaoEnviarCadastro.textContent =
    "Enviando...";

  try {

    const resultado =
      await window.supabaseClient.auth.signUp({

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

    if (resultado.error) {
      throw resultado.error;
    }

    if (!resultado.data.user) {
      throw new Error(
        "Usuário não criado."
      );
    }

    sessionStorage.setItem(

      "tufra_cadastro_completo",

      JSON.stringify({

        ...dados,

        authId:
          resultado.data.user.id,

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

  }

  catch (erro) {

    console.error(erro);

    mostrarMensagem(
      erro.message ||
      "Não foi possível concluir o cadastro."
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
