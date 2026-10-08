// Permite abrir la app sin conexión. Los datos NO pasan por acá: viven en el navegador y en la hoja de Google.
const CACHE = "gastos-v3";
const BASE = ["./", "index.html", "logo.svg", "manifest.json", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "icon-180.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return; // Google Sheets y fuentes van directo a la red
  e.respondWith(
    fetch(r).then(res => {
      const copia = res.clone();
      caches.open(CACHE).then(c => c.put(r, copia));
      return res;
    }).catch(() => caches.match(r).then(h => h || caches.match("index.html")))
  );
});
