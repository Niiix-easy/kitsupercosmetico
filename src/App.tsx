/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import * as Sentry from "@sentry/react";
import { initSentry } from './utils/sentry';

initSentry();

import { Navbar } from './components/Navbar';
import { StockUrgencyBanner } from './components/StockUrgencyBanner';
import { Hero } from './components/Hero';
import { TrustBadgesSection } from './components/TrustBadgesSection';

// Lazy load non-critical below-the-fold sections
const StepByStepSection = lazy(() => import('./components/StepByStepSection').then(m => ({ default: m.StepByStepSection })));
const FormulaSection = lazy(() => import('./components/FormulaSection').then(m => ({ default: m.FormulaSection })));
const SalonShowcaseSection = lazy(() => import('./components/SalonShowcaseSection').then(m => ({ default: m.SalonShowcaseSection })));
const BundleSelector = lazy(() => import('./components/BundleSelector').then(m => ({ default: m.BundleSelector })));
const ComparisonTable = lazy(() => import('./components/ComparisonTable').then(m => ({ default: m.ComparisonTable })));
const FAQSection = lazy(() => import('./components/FAQSection').then(m => ({ default: m.FAQSection })));
const Footer = lazy(() => import('./components/Footer').then(m => ({ default: m.Footer })));
const ProductVideoShowcase = lazy(() => import('./components/ProductVideoShowcase').then(m => ({ default: m.ProductVideoShowcase })));

// Lazy load interaction-heavy modals and overlays
const CartDrawer = lazy(() => import('./components/CartDrawer').then(m => ({ default: m.CartDrawer })));
const CheckoutModal = lazy(() => import('./components/CheckoutModal').then(m => ({ default: m.CheckoutModal })));
const HairDiagnosticModal = lazy(() => import('./components/HairDiagnosticModal').then(m => ({ default: m.HairDiagnosticModal })));
const OrderTrackingModal = lazy(() => import('./components/OrderTrackingModal').then(m => ({ default: m.OrderTrackingModal })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminLoginModal = lazy(() => import('./components/AdminLoginModal').then(m => ({ default: m.AdminLoginModal })));

import { PurchaseNotificationToast } from './components/PurchaseNotificationToast';
import { FloatingMobileCTA } from './components/FloatingMobileCTA';
import { AnimatedSection } from './components/AnimatedSection';
import { PushNotificationManager } from './components/PushNotificationManager';
import { WhatsAppButton } from './components/WhatsAppButton';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PRODUCT_BUNDLES } from './data/productData';
import { CartItem, ProductBundle } from './types';
import { trackEvent } from './utils/pixelTracking';
import { updateBundleMetaTags } from './utils/dynamicMetaTags';
import { sendOrderUpdateNotification } from './utils/pushNotifications';
import { initPerformanceMonitoring } from './utils/performanceMonitor';
import { initAssetPrefetchStrategy } from './utils/assetPrefetcher';
import { cleanupConsoleAfterCriticalLoad } from './utils/consoleCleaner';

// Reusable Loading Placeholder for Suspense
const SectionLoader = () => (
  <div className="w-full py-20 flex flex-col items-center justify-center bg-[#0c0d10]">
    <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
    <span className="mt-4 text-[10px] uppercase tracking-widest text-amber-500/60 font-bold">Dyusar Haute Performance</span>
  </div>
);

export default function App() {
  // Cart state initialized with default popular bundle ready for quick checkout if desired
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      bundle: PRODUCT_BUNDLES[1], // Kit 2 (Mais Vendido)
      quantity: 1
    }
  ]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState('');
  const [isAssetsLoading, setIsAssetsLoading] = useState(true);

  useEffect(() => {
    // 1. Initial SEO dynamic meta tags based on URL hash or popular kit
    const handleHashAndSEO = () => {
      const hash = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
      const matched = PRODUCT_BUNDLES.find((b) => b.id === hash);
      const activeBundle = matched || PRODUCT_BUNDLES[1]; // Kit Profissional 1 Litro (Mais Popular)
      updateBundleMetaTags(activeBundle);
    };

    handleHashAndSEO();
    window.addEventListener('hashchange', handleHashAndSEO);

    // Initialize LCP and Core Web Vitals performance monitoring
    initPerformanceMonitoring();

    // Initialize Tier 1 (Hero LCP) & Tier 2 (ProductVideoShowcase) Asset Prefetch Strategy
    initAssetPrefetchStrategy();

    // 2. Preload critical images to eliminate layout shift and show seamless luxury experience
    const criticalImages = [
      '/images/kit-profissional-completo.webp?v=luxury5',
      '/images/kit-profissional-1litro.webp?v=luxury5',
      '/images/kit-home-care-300ml.webp?v=luxury5',
      '/images/hair-salon-professional.webp'
    ];

    let loadedCount = 0;
    criticalImages.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loadedCount++;
        if (loadedCount >= criticalImages.length) {
          setIsAssetsLoading(false);
          cleanupConsoleAfterCriticalLoad(1500);
        }
      };
      img.src = src;
    });

    const timer = setTimeout(() => {
      setIsAssetsLoading(false);
      cleanupConsoleAfterCriticalLoad(1800);
    }, 1500);
    
    // Hidden admin access shortcut (Alt + A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'a') {
        setIsAdminLoginOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', handleHashAndSEO);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleAdminLoginSuccess = () => {
    setIsAdminLoginOpen(false);
    setIsAdminOpen(true);
  };


  // Handle adding or selecting a bundle
  const handleSelectBundle = useCallback((bundle: ProductBundle) => {
    // Dynamically update SEO meta tags and canonical for the selected bundle
    updateBundleMetaTags(bundle);

    trackEvent.addToCart({
      id: bundle.id,
      name: bundle.title,
      price: bundle.price,
      quantity: 1,
    });

    setCartItems((prev) => {
      const existing = prev.find((item) => item.bundle.id === bundle.id);
      if (existing) {
        return prev.map((item) =>
          item.bundle.id === bundle.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { bundle, quantity: 1 }];
    });
    setIsCartOpen(true);
  }, []);

  const handleSelectBundleById = useCallback((bundleId: string) => {
    const bundle = PRODUCT_BUNDLES.find((b) => b.id === bundleId) || PRODUCT_BUNDLES[1];
    handleSelectBundle(bundle);
  }, [handleSelectBundle]);

  const handleQuickBuy = useCallback((bundle: ProductBundle) => {
    // 1. Sync SEO
    updateBundleMetaTags(bundle);

    // 2. Track event
    trackEvent.addToCart({
      id: bundle.id,
      name: bundle.title,
      price: bundle.price,
      quantity: 1,
    });

    // 3. Update cart and IMMEDIATELY open checkout
    setCartItems((prev) => {
      const existing = prev.find((item) => item.bundle.id === bundle.id);
      if (existing) {
        return prev.map((item) =>
          item.bundle.id === bundle.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { bundle, quantity: 1 }];
    });

    // Directly open checkout bypasses cart drawer
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  }, []);

  const handleUpdateQuantity = useCallback((bundleId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(bundleId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.bundle.id === bundleId ? { ...item, quantity } : item
      )
    );
  }, []);

  const handleRemoveItem = useCallback((bundleId: string) => {
    setCartItems((prev) => prev.filter((item) => item.bundle.id !== bundleId));
  }, []);

  const handleToggleAddOn = useCallback((bundleId: string) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.bundle.id === bundleId) {
          if (item.addOn) {
            return { ...item, addOn: undefined };
          }
          return {
            ...item,
            addOn: {
              id: 'oleo-ojon-60ml',
              title: 'Óleo Sublime Reparador de Ojon 60ml',
              price: 29.90
            }
          };
        }
        return item;
      })
    );
  }, []);

  const handleOpenCheckout = useCallback((discount: number, coupon: string) => {
    setDiscountAmount(discount);
    setCouponApplied(coupon);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);

    const subtotal = cartItems.reduce((acc, item) => acc + (item.bundle.price * item.quantity), 0);
    const finalTotal = Math.max(0, subtotal - discount);
    trackEvent.initiateCheckout(
      finalTotal,
      cartItems.map((i) => ({
        id: i.bundle.id,
        name: i.bundle.title,
        price: i.bundle.price,
        quantity: i.quantity,
      }))
    );
  }, [cartItems]);

  const handleOrderSuccess = useCallback(() => {
    const subtotal = cartItems.reduce((acc, item) => acc + (item.bundle.price * item.quantity), 0);
    const finalTotal = Math.max(0, subtotal - discountAmount);
    const orderCode = `DY-${Math.floor(100000 + Math.random() * 900000)}`;
    
    trackEvent.purchase(
      orderCode,
      finalTotal,
      cartItems.map((i) => ({
        id: i.bundle.id,
        name: i.bundle.title,
        price: i.bundle.price,
        quantity: i.quantity,
      }))
    );

    // Send native push notification to browser if permitted
    sendOrderUpdateNotification(orderCode, 'Confirmado! Faturado e enviado para separação prioritária.');

    // Clear cart on successful order
    setCartItems([]);
  }, [cartItems, discountAmount]);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#0c0d10] text-[#f4f4f5] flex flex-col font-sans-body">
      {/* Global Top Loading Bar Indicator */}
      {isAssetsLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-slate-900 overflow-hidden pointer-events-none">
          <div className="h-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 animate-[shimmer_1.2s_infinite] w-full" />
        </div>
      )}

      {/* Permission-Based Push Notification Banner & Alerter */}
      <PushNotificationManager />

      {/* Top Navbar */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenQuiz={() => setIsQuizOpen(true)}
      />

      {/* Stock Urgency & Location Banner */}
      <StockUrgencyBanner />
      <WhatsAppButton />

      {/* Hero Section */}
      <main className="flex-1">
        {/* Hero Section - Above-the-fold instant rendering for LCP < 2.5s */}
        <section id="hero-section" className="relative">
          <Hero
            onOpenCartWithBundle={handleSelectBundleById}
            onOpenQuiz={() => setIsQuizOpen(true)}
          />
        </section>

        {/* High-Converting Trust Badges Section */}
        <AnimatedSection>
          <TrustBadgesSection />
        </AnimatedSection>

        <Suspense fallback={<SectionLoader />}>
          {/* 4-Step Treatment Protocol */}
          <AnimatedSection>
            <StepByStepSection />
          </AnimatedSection>

          {/* Scientific Active Ingredients */}
          <AnimatedSection>
            <FormulaSection />
          </AnimatedSection>

          {/* Professional Salon Showcase with Real Images */}
          <AnimatedSection>
            <SalonShowcaseSection onCtaClick={() => handleSelectBundleById('kit-profissional-1litro')} />
          </AnimatedSection>

          {/* Package Tiers & Bundles (Virtualized) */}
          <AnimatedSection>
            <BundleSelector 
              onSelectBundle={handleSelectBundle} 
              onQuickBuy={handleQuickBuy}
            />
          </AnimatedSection>

          {/* Benchmark Comparison Table */}
          <AnimatedSection>
            <ComparisonTable />
          </AnimatedSection>

          {/* Product in Action Videos Section (Influencer Reviews) */}
          <AnimatedSection>
            <ProductVideoShowcase />
          </AnimatedSection>

          {/* Frequently Asked Questions */}
          <AnimatedSection>
            <FAQSection />
          </AnimatedSection>
        </Suspense>
      </main>

      {/* Footer */}
      <Suspense fallback={<div className="h-40 bg-[#08090c]" />}>
        <Footer onOpenTracking={() => setIsTrackingOpen(true)} />
      </Suspense>

      {/* Interactive Cart Drawer */}
      <Suspense fallback={null}>
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onOpenCheckout={handleOpenCheckout}
          onToggleAddOn={handleToggleAddOn}
        />

        {/* Simulated Checkout Modal with PIX & Cards */}
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cartItems={cartItems}
          discountAmount={discountAmount}
          couponApplied={couponApplied}
          onOrderSuccess={handleOrderSuccess}
        />

        {/* Hair Diagnostic Quiz Modal */}
        <HairDiagnosticModal
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
          onSelectBundle={handleSelectBundleById}
        />

        {/* Order Tracking Modal */}
        <OrderTrackingModal
          isOpen={isTrackingOpen}
          onClose={() => setIsTrackingOpen(false)}
        />

        {/* Admin Panel Components */}
        {isAdminOpen && (
          <AdminDashboard onClose={() => setIsAdminOpen(false)} />
        )}

        <AdminLoginModal 
          isOpen={isAdminLoginOpen} 
          onClose={() => setIsAdminLoginOpen(false)}
          onLoginSuccess={handleAdminLoginSuccess}
        />
      </Suspense>
    </div>
    </ErrorBoundary>
  );
}
