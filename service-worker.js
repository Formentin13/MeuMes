// Só é registrado quando o app está publicado em https (instalação pelo Chrome).
// Abrindo o index.html direto do arquivo, o app funciona sem service worker.
const CACHE = "meumes-v1.9.1";
const FILES = ["./", "./index.html", "./manifest.json",
  "./icon-192.png", "./icon-512.png", "./icon-512-maskable.png", "./apple-touch-icon.png", "./favicon-32.png", "./icon-16.png", "./MeuMes.ico"];
self.addEventListener("install", (e) => {
  // um arquivo ausente não pode impedir a instalação do service worker
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(FILES.map((f) => c.add(f).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {}); return res; })
      .catch(() => caches.match(e.request).then((r) => r || (e.request.mode === "navigate" ? caches.match("./index.html") : undefined)))
  );
});
