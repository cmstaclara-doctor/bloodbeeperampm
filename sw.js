const CACHE_NAME = 'bloodbeeper-v2';
const ASSETS = [
  '/bloodbeeperampm/',
  '/bloodbeeperampm/index.html',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(e => {
        console.log('Cache add error (some assets may be external):', e);
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names => {
      return Promise.all(names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name)));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(response => {
      if(response) return response;

      return fetch(event.request).then(response => {
        if(!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(e => {
        console.log('Fetch failed, returning offline:', e);
        return caches.match(event.request) || new Response('Offline', {status: 503});
      });
    })
  );
});
