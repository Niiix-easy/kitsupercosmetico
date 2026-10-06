const CACHE_NAME = 'dyusar-cache-v1';
const VIDEO_CACHE_NAME = 'dyusar-videos-cache-v1';
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
  event.waitUntil(self.clients.claim());
});

// Helper function to serve range requests from cached ArrayBuffer
async function returnRangeResponse(request, cachedResponse) {
  const arrayBuffer = await cachedResponse.arrayBuffer();
  const rangeHeader = request.headers.get('range');
  
  if (!rangeHeader) {
    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': arrayBuffer.byteLength,
        'Accept-Ranges': 'bytes'
      }
    });
  }

  const match = rangeHeader.match(/^bytes=(\d+)-(\d+)?$/);
  if (!match) {
    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': arrayBuffer.byteLength,
        'Accept-Ranges': 'bytes'
      }
    });
  }

  const start = parseInt(match[1], 10);
  const end = match[2] ? parseInt(match[2], 10) : arrayBuffer.byteLength - 1;

  // Ensure bounds are safe
  const safeEnd = Math.min(end, arrayBuffer.byteLength - 1);
  const safeStart = Math.min(start, safeEnd);

  const slicedBuffer = arrayBuffer.slice(safeStart, safeEnd + 1);
  return new Response(slicedBuffer, {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Range': `bytes ${safeStart}-${safeEnd}/${arrayBuffer.byteLength}`,
      'Content-Length': slicedBuffer.byteLength,
      'Accept-Ranges': 'bytes'
    }
  });
}

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Intercept and cache static .mp4 video files
  if (url.pathname.endsWith('.mp4') && event.request.method === 'GET') {
    const timestamp = url.searchParams.get('t');
    const isCacheBuster = timestamp && timestamp !== '0';
    const cleanUrl = url.origin + url.pathname;

    event.respondWith(
      caches.open(VIDEO_CACHE_NAME).then(async (cache) => {
        // If it's a real timestamp (upload update), we must invalidate the cache first
        if (isCacheBuster) {
          console.log('[SW] Cache buster detected. Clearing old video cache for:', cleanUrl);
          await cache.delete(cleanUrl);
          await cache.delete(cleanUrl + '?t=0');
          
          try {
            const networkResponse = await fetch(event.request);
            if (networkResponse.status === 200 || networkResponse.status === 206) {
              // Cache under both the timestamp URL and the default (t=0) URL
              await cache.put(cleanUrl + '?t=0', networkResponse.clone());
              await cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          } catch (err) {
            console.warn('[SW] Fetch failed during cache bust:', err);
          }
        }

        // Try to match the exact request
        let cachedResponse = await cache.match(event.request);
        
        // If not found, try to match the default (t=0) URL
        if (!cachedResponse) {
          cachedResponse = await cache.match(cleanUrl + '?t=0');
        }

        if (cachedResponse) {
          console.log('[SW] Serving video range-request from cache:', url.pathname);
          return returnRangeResponse(event.request, cachedResponse);
        }

        // If neither was cached, fetch from network
        console.log('[SW] Cache miss. Fetching video from network:', url.pathname);
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse.status === 200 || networkResponse.status === 206) {
            await cache.put(cleanUrl + '?t=0', networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          console.warn('[SW] Video fetch failed, offline:', err);
        }
      })
    );
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
