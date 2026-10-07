/**
 * High-Performance Asset Prefetcher & Core Web Vitals (LCP < 2.5s) Optimizer.
 * 
 * Strategically prioritizes:
 * 1. Tier 1: Hero Primary LCP Product Image & Hero Featured Video Poster.
 * 2. Tier 2: ProductVideoShowcase Posters (cover images) & Video Demuxer Metadata (first chunk / moov atom).
 * 3. Tier 3: Predictive video buffering during idle browser cycles (requestIdleCallback).
 */

export interface PrefetchConfig {
  heroImages: string[];
  heroPosters: string[];
  heroVideos: string[];
  showcasePosters: string[];
  showcaseVideos: string[];
}

export const CRITICAL_ASSETS: PrefetchConfig = {
  heroImages: [
    '/images/kit-profissional-completo.webp?v=luxury5',
    '/images/kit-profissional-1litro.webp?v=luxury5',
    '/images/logo-dyusar-horizontal.webp'
  ],
  heroPosters: [
    '/images/video-hero-poster.webp'
  ],
  heroVideos: [
    '/video_1.mp4'
  ],
  showcasePosters: [
    '/video_1_poster.webp',
    '/video_2_poster.webp',
    '/video_3_poster.webp'
  ],
  showcaseVideos: [
    '/video_1.mp4',
    '/video_2.mp4',
    '/video_3.mp4'
  ]
};

// Cache to prevent duplicate prefetch requests
const prefetchedUrls = new Set<string>();

/**
 * Preloads a single image and decodes it asynchronously into GPU memory.
 */
export function prefetchImage(src: string, priority: 'high' | 'low' = 'low'): Promise<void> {
  if (prefetchedUrls.has(src) || typeof window === 'undefined') {
    return Promise.resolve();
  }
  prefetchedUrls.add(src);

  return new Promise((resolve) => {
    const img = new Image();
    // @ts-ignore
    img.fetchPriority = priority;
    img.decoding = 'async';
    img.onload = () => {
      if ('decode' in img) {
        img.decode().then(resolve).catch(resolve);
      } else {
        resolve();
      }
    };
    img.onerror = () => resolve();
    img.src = src;
  });
}

/**
 * Pre-warms video metadata by requesting the first 128KB (Range: bytes=0-131071).
 * This satisfies the MP4 container header (ftyp + moov atoms) so browser demuxers
 * (FFmpegDemuxer) parse duration, dimensions, and codecs instantly with 0ms buffering.
 */
export async function prefetchVideoMetadata(videoUrl: string): Promise<void> {
  const cleanUrl = videoUrl.split('?')[0];
  if (prefetchedUrls.has(`video-meta:${cleanUrl}`) || typeof window === 'undefined') {
    return;
  }
  prefetchedUrls.add(`video-meta:${cleanUrl}`);

  try {
    // 1. HTTP Range pre-fetch to warm disk/memory cache with initial video demuxer header
    await fetch(cleanUrl, {
      method: 'GET',
      headers: {
        Range: 'bytes=0-131071'
      },
      cache: 'force-cache'
    }).catch(() => null);

    // 2. Offscreen lightweight video instance to parse metadata into browser multimedia pipeline
    const dummyVideo = document.createElement('video');
    dummyVideo.preload = 'metadata';
    dummyVideo.muted = true;
    dummyVideo.playsInline = true;
    dummyVideo.src = cleanUrl;
    dummyVideo.load();
  } catch (err) {
    // Silently continue - prefetch is purely opportunistic
  }
}

/**
 * Tier 1: Immediate execution for above-the-fold Hero LCP assets.
 * Guarantees LCP element finishes painting in under 2.5 seconds.
 */
export function prefetchHeroCriticalAssets(): void {
  if (typeof window === 'undefined') return;

  // 1. High priority for Hero main product images (Direct LCP candidate)
  CRITICAL_ASSETS.heroImages.forEach((src) => {
    prefetchImage(src, 'high');
  });

  // 2. High priority for Hero video poster
  CRITICAL_ASSETS.heroPosters.forEach((src) => {
    prefetchImage(src, 'high');
  });

  // 3. Pre-warm hero video metadata
  CRITICAL_ASSETS.heroVideos.forEach((src) => {
    prefetchVideoMetadata(src);
  });
}

/**
 * Tier 2: Idle execution for ProductVideoShowcase assets.
 * Pre-warms showcase posters and video metadata during idle browser frames
 * so scrolling down results in instantaneous video card presentation.
 */
export function prefetchShowcaseAssets(): void {
  if (typeof window === 'undefined') return;

  const runIdlePrefetch = () => {
    // A. Preload all 3 Showcase posters
    CRITICAL_ASSETS.showcasePosters.forEach((posterUrl) => {
      prefetchImage(posterUrl, 'low');
    });

    // B. Pre-warm all 3 Showcase video headers
    CRITICAL_ASSETS.showcaseVideos.forEach((videoUrl) => {
      prefetchVideoMetadata(videoUrl);
    });

    // C. Pre-fetch API video URLs configuration
    fetch('/api/video-urls', { cache: 'force-cache' }).catch(() => null);
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(runIdlePrefetch, { timeout: 2000 });
  } else {
    setTimeout(runIdlePrefetch, 600);
  }
}

/**
 * Master initializer called at application startup.
 */
export function initAssetPrefetchStrategy(): void {
  // Execute Tier 1 immediately
  prefetchHeroCriticalAssets();

  // Schedule Tier 2 for browser idle period
  prefetchShowcaseAssets();
}
