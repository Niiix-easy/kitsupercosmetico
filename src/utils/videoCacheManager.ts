/**
 * Video Cache Manager using the browser's native CacheStorage API.
 * Provides programmatic video asset caching, blob URL streaming, and cache invalidation.
 */

export const VIDEO_CACHE_NAME = 'dyusar-video-cache-v1';

export interface CachedVideoInfo {
  url: string;
  size: number;
  cachedAt: string;
}

/**
 * Checks if CacheStorage API is available in the current browser environment.
 */
export const isCacheStorageSupported = (): boolean => {
  return typeof window !== 'undefined' && 'caches' in window;
};

/**
 * Retrieves a video from CacheStorage. If present, returns a Blob URL for instant playback.
 */
export const getVideoFromCache = async (url: string): Promise<string | null> => {
  if (!isCacheStorageSupported()) return null;

  try {
    const cache = await caches.open(VIDEO_CACHE_NAME);
    // Try clean URL first (without query strings)
    const cleanUrl = url.split('?')[0];
    const match = await cache.match(cleanUrl) || await cache.match(url);

    if (match) {
      const blob = await match.blob();
      if (blob.size > 0) {
        return URL.createObjectURL(blob);
      }
    }
  } catch (error) {
    console.warn('[CacheStorage] Error matching video in cache:', error);
  }

  return null;
};

/**
 * Fetches a video, stores it in CacheStorage, and returns a local Blob URL.
 */
export const cacheVideo = async (url: string): Promise<string> => {
  const cleanUrl = url.split('?')[0];

  if (!isCacheStorageSupported()) {
    return cleanUrl;
  }

  try {
    const cache = await caches.open(VIDEO_CACHE_NAME);
    
    // Check if already in cache
    const existing = await cache.match(cleanUrl);
    if (existing) {
      const blob = await existing.blob();
      return URL.createObjectURL(blob);
    }

    // Fetch fresh copy
    const response = await fetch(url, {
      headers: {
        'Accept': 'video/mp4,video/*;q=0.9,*/*;q=0.8'
      }
    });

    if (response.ok) {
      // Store clone in CacheStorage with the clean URL
      await cache.put(cleanUrl, response.clone());
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }
  } catch (error) {
    console.warn('[CacheStorage] Error caching video asset:', error);
  }

  return cleanUrl;
};

/**
 * Clears a specific video from CacheStorage.
 */
export const clearSpecificVideoCache = async (urlOrFilename: string): Promise<boolean> => {
  if (!isCacheStorageSupported()) return false;

  try {
    const cache = await caches.open(VIDEO_CACHE_NAME);
    const requests = await cache.keys();
    let deleted = false;

    for (const request of requests) {
      const reqUrl = request.url;
      if (reqUrl.includes(urlOrFilename)) {
        await cache.delete(request);
        deleted = true;
      }
    }

    // Broadcast cache invalidation event across the client
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('video-cache-cleared', { 
        detail: { target: urlOrFilename, timestamp: Date.now() } 
      }));
    }

    return deleted;
  } catch (error) {
    console.error('[CacheStorage] Error clearing specific video cache:', error);
    return false;
  }
};

/**
 * Clears ALL video caches in CacheStorage.
 */
export const clearAllVideoCaches = async (): Promise<boolean> => {
  if (!isCacheStorageSupported()) return false;

  try {
    const success = await caches.delete(VIDEO_CACHE_NAME);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('video-cache-cleared', { 
        detail: { target: 'all', timestamp: Date.now() } 
      }));
    }

    return success;
  } catch (error) {
    console.error('[CacheStorage] Error purging all video caches:', error);
    return false;
  }
};

/**
 * Lists all currently cached videos and their metadata.
 */
export const listCachedVideos = async (): Promise<CachedVideoInfo[]> => {
  if (!isCacheStorageSupported()) return [];

  try {
    const cache = await caches.open(VIDEO_CACHE_NAME);
    const requests = await cache.keys();
    const list: CachedVideoInfo[] = [];

    for (const req of requests) {
      const res = await cache.match(req);
      if (res) {
        const blob = await res.blob();
        list.push({
          url: req.url,
          size: blob.size,
          cachedAt: res.headers.get('date') || new Date().toISOString()
        });
      }
    }

    return list;
  } catch (error) {
    console.warn('[CacheStorage] Error listing cached videos:', error);
    return [];
  }
};
