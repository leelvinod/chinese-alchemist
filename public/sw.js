/* Mandarin Mitra — service worker.
   Two jobs: keep the tap-only drills working offline (§15), and turn a tap on a
   reminder into the quick-answer overlay rather than the home screen (§13). */

const CACHE = 'mm-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  // The shell is cached lazily on first fetch; nothing is precached here so a
  // new build never serves a stale hashed bundle.
  event.waitUntil(caches.open(CACHE));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

/* Network first, falling back to the cache. A learner on a patchy commute gets
   the last good copy rather than a browser error page. */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      })
      .catch(() =>
        caches.match(req).then((hit) => hit || caches.match('./index.html').then((idx) => idx || Response.error())),
      ),
  );
});

/* A tap on the reminder opens the quick-answer overlay directly. */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const drillId = event.notification.data && event.notification.data.drillId;
  const target = event.action === 'later' ? null : `./?quick=1${drillId ? `&drill=${encodeURIComponent(drillId)}` : ''}`;
  if (!target) return;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) {
          client.postMessage({ type: 'quick-answer', drillId });
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    }),
  );
});
