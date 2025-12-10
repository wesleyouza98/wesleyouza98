const CACHE_NAME = 'energiaq-cache-v1';
const OFFLINE_URL = '/';

const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // opcional: cachear novas requisições
        return caches.open(CACHE_NAME).then(cache => {
          // cache.put(event.request, response.clone());
          return response;
        });
      }).catch(() => {
        // fallback para offline
        return caches.match(OFFLINE_URL);
      });
    })
  );
});
