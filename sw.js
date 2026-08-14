// Service worker: la app funciona sin cobertura (red primero, caché de respaldo)
const C = 'plan-hipertrofia-v1';
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(C).then(c =>
      c.addAll(['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png']).catch(() => {})
    )
  );
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // JSONBin va directo a red
  e.respondWith(
    fetch(e.request).then(r => {
      const cl = r.clone();
      caches.open(C).then(c => c.put(e.request, cl));
      return r;
    }).catch(() =>
      caches.match(e.request).then(r => r || caches.match('./index.html'))
    )
  );
});
