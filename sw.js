// Service worker mínimo: cachea el shell para que el hub abra rápido
// y funcione (parcialmente) sin conexión. No cachea las herramientas
// completas para evitar mostrar datos de precios/créditos desactualizados.
const CACHE_NAME = 'byd-hub-shell-v1';
const SHELL_FILES = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Solo servimos desde caché el shell del hub (index/manifest/icons).
  // El resto (gestor_precios.html, calculadora_creditos.html, links externos)
  // siempre va a la red para asegurar datos actualizados.
  const isShellFile = SHELL_FILES.some((f) => url.pathname.endsWith(f.replace('./', '')));
  if (isShellFile) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
