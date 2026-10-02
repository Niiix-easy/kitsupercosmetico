/**
 * Simple A/B Testing Utility
 */

export type HeroVariant = 'result' | 'technology';

const STORAGE_KEY = 'dyusar_hero_variant';

export const getHeroVariant = (): HeroVariant => {
  if (typeof window === 'undefined') return 'result';

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'result' || stored === 'technology') {
    return stored as HeroVariant;
  }

  // Randomly assign a variant if none exists
  const variant: HeroVariant = Math.random() > 0.5 ? 'result' : 'technology';
  localStorage.setItem(STORAGE_KEY, variant);
  return variant;
};

export const trackHeroClick = (variant: HeroVariant) => {
  console.log(`[A/B TEST] Click tracked for variant: ${variant}`);
  // In a real app, this would send an event to Google Analytics, Mixpanel, or a backend API
  if ((window as any).gtag) {
    (window as any).gtag('event', 'hero_purchase_click', {
      'event_category': 'ab_test',
      'event_label': variant,
      'value': 1
    });
  }
};
