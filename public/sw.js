const CACHE = "jk-shell-v3";
const ASSETS = ["/", "/css/styles.css", "/js/main.js", "/manifest.webmanifest"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

function putInCache(request, res) {
  if (res.ok && request.url.startsWith(self.location.origin)) {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(request, copy));
  }
  return res;
}

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  // Pages, data and scripts/styles change on every deploy (e.g. a new journal day each evening):
  // network-first so visitors see fresh content, with the cache as an offline fallback.
  const fresh =
    request.mode === "navigate" ||
    (request.headers.get("accept") || "").includes("text/html") ||
    /\.(html|json|js|css|xml)$/.test(url.pathname);
  if (fresh) {
    e.respondWith(
      fetch(request)
        .then((res) => putInCache(request, res))
        .catch(() => caches.match(request))
    );
    return;
  }
  // Images, fonts, etc.: cache-first (journal photos have content-hashed names).
  e.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((res) => putInCache(request, res)).catch(() => cached))
  );
});
