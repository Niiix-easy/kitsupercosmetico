import { useState, useEffect, RefObject } from 'react';

interface UseVideoPreloadOptions {
  rootMargin?: string;
  threshold?: number | number[];
}

export interface UseVideoPreloadReturn {
  isInViewport: boolean;
  hasEnteredViewport: boolean;
  preloadMode: 'none' | 'metadata' | 'auto';
}

/**
 * Custom hook to defer video asset loading and metadata requests
 * until the component enters the user's viewport using IntersectionObserver.
 * Prevents unnecessary bandwidth consumption on slow networks or mobile devices.
 */
export function useVideoPreload(
  targetRef: RefObject<HTMLElement | null>,
  options: UseVideoPreloadOptions = {}
): UseVideoPreloadReturn {
  const { rootMargin = '150px', threshold = 0.1 } = options;

  const [isInViewport, setIsInViewport] = useState<boolean>(false);
  const [hasEnteredViewport, setHasEnteredViewport] = useState<boolean>(false);
  const [preloadMode, setPreloadMode] = useState<'none' | 'metadata' | 'auto'>('none');

  useEffect(() => {
    // If IntersectionObserver is not supported (older environments), fallback to loading metadata
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsInViewport(true);
      setHasEnteredViewport(true);
      setPreloadMode('metadata');
      return;
    }

    const element = targetRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInViewport(true);
          setHasEnteredViewport(true);
          // When entering viewport, transition to 'metadata' to load duration and first frame
          setPreloadMode('metadata');
        } else {
          setIsInViewport(false);
        }
      },
      {
        root: null,
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [targetRef, rootMargin, threshold]);

  return {
    isInViewport,
    hasEnteredViewport,
    preloadMode,
  };
}
