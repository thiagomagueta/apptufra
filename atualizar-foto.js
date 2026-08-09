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

const botaoSalvarFoto = document.getElementById(
  "botaoSalvarFoto"
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

async function salvarNovaFoto() {
  mostrarMensagem("");

  if (!fotoPreview.src) {
    mostrarMensagem(
      "Tire uma nova foto antes de salvar."
    );
    return;
  }

  if (!window.supabaseClient) {
    mostrarMensagem(
      "Não foi possível conectar ao sistema."
    );
    return;
  }

  botaoSalvarFoto.disabled = true;
  botaoNovaFoto.disabled = true;
  botaoSalvarFoto.textContent = "SALVANDO...";

  try {
    const resultadoSessao =
      await window.supabaseClient.auth.getSession();

    if (resultadoSessao.error) {
      throw resultadoSessao.error;
    }

    const sessao = resultadoSessao.data.session;

    if (!sessao) {
      window.location.href = "index.html";
      return;
    }

    const authId = sessao.user.id;

    const respostaFoto = await fetch(
      fotoPreview.src
    );

    if (!respostaFoto.ok) {
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

    const caminhoFoto =
      `${authId}/perfil.jpg`;

    mostrarMensagem(
      "Salvando nova foto..."
    );

    const resultadoUpload =
      await window.supabaseClient.storage
        .from("fotos-associados")
        .upload(
          caminhoFoto,
          fotoBlob,
          {
            contentType: "image/jpeg",
            upsert: true
          }
        );

    if (resultadoUpload.error) {
      throw resultadoUpload.error;
    }



    window.location.href =
      "minha-ficha.html?foto=atualizada";

  } catch (erro) {
    console.error(
      "Erro ao atualizar foto:",
      erro
    );

    mostrarMensagem(
      "Não foi possível atualizar sua foto. Tente novamente."
    );

    botaoSalvarFoto.disabled = false;
    botaoNovaFoto.disabled = false;
    botaoSalvarFoto.textContent =
      "Salvar nova foto";
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

botaoSalvarFoto.addEventListener(
  "click",
  salvarNovaFoto
);

window.addEventListener(
  "pagehide",
  pararCamera
);

mostrarEstadoInicial();
