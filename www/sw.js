// Offline cache for web/PWA deploys. Capacitor builds don't register this
// (files are bundled locally). Bump VERSION on every release.
const VERSION = 'echolume-v1.0.0';
const ASSETS = [
  '.',
  'index.html',
  'manifest.webmanifest',
  'css/ui.css',
  'js/main.js', 'js/config.js', 'js/util.js', 'js/input.js', 'js/renderer.js',
  'js/particles.js', 'js/level.js', 'js/levels.js', 'js/entities.js',
  'js/game.js', 'js/draw.js', 'js/audio.js', 'js/haptics.js', 'js/save.js',
  'js/ui.js', 'js/debug.js', 'js/gameservices.js', 'js/ads.js', 'js/teach.js',
  'icons/favicon.svg', 'icons/icon-180.png', 'icons/icon-192.png',
  'icons/icon-512.png', 'icons/icon-512-maskable.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request))
  );
});
