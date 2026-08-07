"use strict";

const video = document.getElementById("camera");
const canvas = document.getElementById("fotoCapturada");

const botaoAbrirCamera =
  document.getElementById("botaoAbrirCamera");

const botaoCapturar =
  document.getElementById("botaoCapturar");

const botaoNovaFoto =
  document.getElementById("botaoNovaFoto");

const areaEnviar =
  document.getElementById("areaEnviar");

let streamCamera = null;

async function abrirCamera() {

  try {

    streamCamera =
      await navigator.mediaDevices.getUserMedia({

        video: {
          facingMode: "user"
        },

        audio: false

      });

    video.srcObject = streamCamera;

    botaoCapturar.disabled = false;

  } catch (erro) {

    alert(
      "Não foi possível acessar a câmera."
    );

    console.error(erro);

  }

}

function capturarFoto() {

  const contexto = canvas.getContext("2d");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  contexto.drawImage(
    video,
    0,
    0,
    canvas.width,
    canvas.height
  );

  video.style.display = "none";

  canvas.hidden = false;

  botaoAbrirCamera.hidden = true;
  botaoCapturar.hidden = true;

  areaEnviar.hidden = false;

  if (streamCamera) {

    streamCamera
      .getTracks()
      .forEach((track) => track.stop());

  }

}

function tirarNovamente() {

  canvas.hidden = true;

  video.style.display = "block";

  areaEnviar.hidden = true;

  botaoAbrirCamera.hidden = false;
  botaoCapturar.hidden = false;

  abrirCamera();

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
