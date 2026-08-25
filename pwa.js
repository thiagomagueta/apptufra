// ========================================
// APP TUFRA - PWA
// ========================================

// Registra o Service Worker
if ("serviceWorker" in navigator) {

  window.addEventListener("load", async () => {

    try {

      const registro = await navigator.serviceWorker.register(
        "./service-worker.js"
      );

      console.log(
        "TUFRA PWA - Service Worker registrado:",
        registro.scope
      );

    } catch (erro) {

      console.error(
        "TUFRA PWA - Erro ao registrar Service Worker:",
        erro
      );

    }

  });

}
