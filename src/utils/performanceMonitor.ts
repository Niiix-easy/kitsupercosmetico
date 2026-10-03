/**
 * Performance Monitoring Utility for Core Web Vitals (LCP, FID/INP, CLS, TTFB)
 * Logs metrics and highlights slow-loading assets in Hero or SalonShowcase.
 */

export interface PerformanceMetric {
  name: 'LCP' | 'FID' | 'INP' | 'CLS' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  element?: string;
  url?: string;
}

// Rating thresholds based on Web Vitals guidelines
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  if (name === 'LCP') {
    return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
  }
  if (name === 'CLS') {
    return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
  }
  if (name === 'FID' || name === 'INP') {
    return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
  }
  return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
}

/**
 * Initializes Core Web Vitals & LCP asset monitoring.
 */
export function initPerformanceMonitoring(onMetric?: (metric: PerformanceMetric) => void): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }

  // 1. Observe Largest Contentful Paint (LCP)
  try {
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      
      if (lastEntry) {
        const value = Math.round(lastEntry.startTime);
        const element = lastEntry.element
          ? `${lastEntry.element.tagName.toLowerCase()}${
              lastEntry.element.id ? '#' + lastEntry.element.id : ''
            }${lastEntry.element.className ? '.' + lastEntry.element.className.split(' ').slice(0, 2).join('.') : ''}`
          : 'unknown';
        const url = lastEntry.url || undefined;
        const rating = getRating('LCP', value);

        const metric: PerformanceMetric = {
          name: 'LCP',
          value,
          rating,
          element,
          url
        };

        // Console log formatting
        const badgeColor = rating === 'good' ? '#10B981' : rating === 'needs-improvement' ? '#F59E0B' : '#EF4444';
        console.groupCollapsed(
          `%c⚡ [PerfMonitor] LCP: ${value}ms (${rating.toUpperCase()})`,
          `color: #000; background: ${badgeColor}; font-weight: bold; padding: 2px 6px; border-radius: 4px;`
        );
        console.log('Target Element:', element);
        if (url) console.log('Asset URL:', url);
        if (url && (url.includes('hair-salon') || url.includes('Hero') || url.includes('Kit'))) {
          console.log('📌 LCP candidate belongs to Hero or SalonShowcase section!');
        }
        console.groupEnd();

        if (onMetric) onMetric(metric);
      }
    });

    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {
    // Unsupported browser entry
  }

  // 2. Monitor Slow Image Resource Load Durations (> 800ms)
  try {
    const resourceObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        if (entry.initiatorType === 'img' || entry.initiatorType === 'css') {
          const duration = Math.round(entry.duration);
          const name = entry.name;

          // Check if image belongs to Hero or SalonShowcase
          const isHeroOrSalon = name.includes('hair-salon') || name.includes('Hero') || name.includes('Kit') || name.includes('dyusar');
          
          if (duration > 800 && isHeroOrSalon) {
            console.warn(
              `⚠️ [PerfMonitor] Slow Asset Detected in Hero/SalonShowcase: ${name.split('/').pop()} took ${duration}ms to load.`
            );
          }
        }
      });
    });

    resourceObserver.observe({ type: 'resource', buffered: true });
  } catch (e) {
    // Unsupported browser entry
  }
}
