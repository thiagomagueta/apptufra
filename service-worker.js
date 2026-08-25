const CACHE_VERSION = "tufra-pwa-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Nesta primeira fase, o service worker não fará cache.
  // O APP continuará buscando normalmente os dados e arquivos online.
});
