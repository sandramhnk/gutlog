// Service Worker: hält GutLog offline verfügbar.
// Strategie „zuerst Netz“: Ist Internet da, kommt immer die neueste Version und wird
// gleichzeitig gespeichert. Ohne Internet liefert er die zuletzt gespeicherte Version.
// Live und Test haben getrennte Speicher, damit sie sich nicht vermischen.
const STAGE = self.location.pathname.includes('/test/') ? 'test' : 'live';
const CACHE = `gutlog-${STAGE}-v3`;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    // Alte Speicherstände derselben Stufe aufräumen (z. B. gutlog-test-v0)
    const names = await caches.keys();
    await Promise.all(names
      .filter(n => n.startsWith(`gutlog-${STAGE}-`) && n !== CACHE)
      .map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isOwn = url.origin === self.location.origin;
  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!isOwn && !isFont) return;
  // Der Live-Bereich (/gutlog/) umfasst auch /gutlog/test/. Die Testversion hat ihren eigenen
  // Service Worker, darum kümmert sich der Live-Worker nicht um sie.
  if (STAGE === 'live' && isOwn && url.pathname.includes('/test/')) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const res = await fetch(req);
      if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
      return res;
    } catch {
      const hit = await cache.match(req);
      return hit || Response.error();
    }
  })());
});

// Tipp auf die Abend-Erinnerung: GutLog öffnen (oder nach vorne holen) und zum Tagesabschluss gehen.
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || self.registration.scope;
  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    // Nur Fenster der eigenen Stufe (Live öffnet nie das Testfenster und umgekehrt)
    const own = wins.find(w => w.url.startsWith(self.registration.scope) &&
      (STAGE === 'test' || !new URL(w.url).pathname.includes('/test/')));
    if (own) {
      await own.focus();
      try { return await own.navigate(url); } catch { return self.clients.openWindow(url); }
    }
    return self.clients.openWindow(url);
  })());
});
