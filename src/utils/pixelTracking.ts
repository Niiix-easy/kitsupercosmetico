/**
 * Dyusar E-Commerce Tracking Pixels Integration (Meta, Google, TikTok)
 * 
 * Provides unified event tracking for:
 * - PageView
 * - ViewContent
 * - AddToCart
 * - InitiateCheckout
 * - Purchase
 */

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    gtag?: (...args: any[]) => void;
    ttq?: {
      track: (eventName: string, params?: any) => void;
      page: () => void;
    };
    dataLayer?: any[];
  }
}

export interface PixelItem {
  id: string;
  name: string;
  price: number;
  quantity?: number;
}

export const trackEvent = {
  // Pageview
  pageView: (pageName: string = 'Home') => {
    // 1. Meta Pixel
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
    // 2. Google Analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', { page_title: pageName });
    }
    // 3. TikTok Pixel
    if (window.ttq && typeof window.ttq.page === 'function') {
      window.ttq.page();
    }
  },

  // View Content / Product
  viewContent: (item: PixelItem) => {
    // Meta
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'ViewContent', {
        content_name: item.name,
        content_ids: [item.id],
        content_type: 'product',
        value: item.price,
        currency: 'BRL',
      });
    }
    // Google
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'view_item', {
        currency: 'BRL',
        value: item.price,
        items: [{ item_id: item.id, item_name: item.name, price: item.price }],
      });
    }
    // TikTok
    if (window.ttq && typeof window.ttq.track === 'function') {
      window.ttq.track('ViewContent', {
        content_id: item.id,
        content_name: item.name,
        currency: 'BRL',
        value: item.price,
      });
    }
  },

  // Add To Cart
  addToCart: (item: PixelItem) => {
    // Meta
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'AddToCart', {
        content_name: item.name,
        content_ids: [item.id],
        content_type: 'product',
        value: item.price,
        currency: 'BRL',
      });
    }
    // Google
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'add_to_cart', {
        currency: 'BRL',
        value: item.price,
        items: [{ item_id: item.id, item_name: item.name, price: item.price, quantity: item.quantity || 1 }],
      });
    }
    // TikTok
    if (window.ttq && typeof window.ttq.track === 'function') {
      window.ttq.track('AddToCart', {
        content_id: item.id,
        content_name: item.name,
        currency: 'BRL',
        value: item.price,
      });
    }
  },

  // Initiate Checkout
  initiateCheckout: (value: number, items: PixelItem[]) => {
    // Meta
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'InitiateCheckout', {
        value,
        currency: 'BRL',
        num_items: items.length,
      });
    }
    // Google
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'begin_checkout', {
        currency: 'BRL',
        value,
        items: items.map(i => ({ item_id: i.id, item_name: i.name, price: i.price })),
      });
    }
    // TikTok
    if (window.ttq && typeof window.ttq.track === 'function') {
      window.ttq.track('InitiateCheckout', {
        currency: 'BRL',
        value,
      });
    }
  },

  // Purchase Completed
  purchase: (orderId: string, value: number, items: PixelItem[]) => {
    // Meta
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Purchase', {
        value,
        currency: 'BRL',
        order_id: orderId,
        content_type: 'product',
      });
    }
    // Google
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'purchase', {
        transaction_id: orderId,
        currency: 'BRL',
        value,
        items: items.map(i => ({ item_id: i.id, item_name: i.name, price: i.price })),
      });
    }
    // TikTok
    if (window.ttq && typeof window.ttq.track === 'function') {
      window.ttq.track('CompletePayment', {
        currency: 'BRL',
        value,
        order_id: orderId,
      });
    }
  },

  // Video Engagement
  trackVideo: (eventName: string, videoTitle: string) => {
    // Google Analytics (Custom Event)
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        video_title: videoTitle,
      });
    }
    // TikTok (Custom Event)
    if (window.ttq && typeof window.ttq.track === 'function') {
      window.ttq.track(eventName, {
        video_title: videoTitle,
      });
    }
    // Send to our Firestore logs
    fetch('/api/video-engage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventName, videoTitle })
    }).catch(err => console.error('Failed to log engagement:', err));
  },
};
