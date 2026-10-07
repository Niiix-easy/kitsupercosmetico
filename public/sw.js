const CACHE_NAME = 'dyusar-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/images/logo-dyusar-horizontal.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          // Purge deprecated video caches and v1 caches
          if (key.includes('video') || key === 'dyusar-cache-v1') {
            console.log('[SW] Purging deprecated cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // CRITICAL: NEVER hijack .mp4 video requests or Range requests in the Service Worker.
  // Native browser Range streaming (HTTP 206 Partial Content) with hardware demuxer must stream directly from the network/server.
  if (url.pathname.endsWith('.mp4') || event.request.headers.get('range')) {
    return;
  }

  // Cache-first for images and page assets, fallback to network
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      
      return fetch(event.request).then(networkResponse => {
        // Cache static webp, png, css, and js dynamically
        if (
          event.request.method === 'GET' && 
          !url.pathname.includes('/api/') && 
          (url.pathname.endsWith('.webp') || url.pathname.endsWith('.png') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css'))
        ) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      });
    })
  );
});
