/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StockUrgencyBanner } from './components/StockUrgencyBanner';
import { Hero } from './components/Hero';
import { TrustBadgesSection } from './components/TrustBadgesSection';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { StepByStepSection } from './components/StepByStepSection';
import { FormulaSection } from './components/FormulaSection';
import { SalonShowcaseSection } from './components/SalonShowcaseSection';
import { BundleSelector } from './components/BundleSelector';
import { ComparisonTable } from './components/ComparisonTable';
import { ReviewsSection } from './components/ReviewsSection';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { HairDiagnosticModal } from './components/HairDiagnosticModal';
import { PurchaseNotificationToast } from './components/PurchaseNotificationToast';
import { FloatingMobileCTA } from './components/FloatingMobileCTA';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { NewsletterModal } from './components/NewsletterModal';
import { RecurringNewsletterToast } from './components/RecurringNewsletterToast';
import { AnimatedSection } from './components/AnimatedSection';
import { VideoTestimonials } from './components/VideoTestimonials';
import { PushNotificationManager } from './components/PushNotificationManager';
import { WhatsAppButton } from './components/WhatsAppButton';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PRODUCT_BUNDLES } from './data/productData';
import { CartItem, ProductBundle } from './types';
import { trackEvent } from './utils/pixelTracking';
import { updateBundleMetaTags } from './utils/dynamicMetaTags';
import { sendOrderUpdateNotification } from './utils/pushNotifications';
import { initPerformanceMonitoring } from './utils/performanceMonitor';

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

    // 2. Preload critical images to eliminate layout shift and show seamless luxury experience
    const criticalImages = [
      '/images/Kit Profissional Completo.webp?v=luxury2',
      '/images/Kit Profissional 1 Litro.webp?v=luxury2',
      '/images/Kit Home Care Reconstruçao.webp?v=luxury2',
      '/images/hair-salon-professional.webp'
    ];

    let loadedCount = 0;
    criticalImages.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loadedCount++;
        if (loadedCount >= criticalImages.length) {
          setIsAssetsLoading(false);
        }
      };
      img.src = src;
    });

    const timer = setTimeout(() => setIsAssetsLoading(false), 1500);
    
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

  const handleApplyNewsletterCoupon = (code: string) => {
    setCouponApplied(code);
    const subtotal = cartItems.reduce((acc, item) => acc + (item.bundle.price * item.quantity), 0);
    const discountRate = code === 'PRIMEIRA10' ? 0.10 : 0.05;
    setDiscountAmount(subtotal * discountRate);
    setIsCartOpen(true);
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

      {/* Hero Section */}
      <main className="flex-1">
        <AnimatedSection delay={0}>
          <Hero
            onOpenCartWithBundle={handleSelectBundleById}
            onOpenQuiz={() => setIsQuizOpen(true)}
          />
        </AnimatedSection>

        {/* High-Converting Trust Badges Section */}
        <AnimatedSection>
          <TrustBadgesSection />
        </AnimatedSection>

        {/* Before & After Interactive Comparison */}
        <AnimatedSection>
          <BeforeAfterSlider />
        </AnimatedSection>

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

        {/* Verified Customer Reviews */}
        <AnimatedSection>
          <ReviewsSection />
        </AnimatedSection>

        {/* Video Testimonials Section using React-Player */}
        <AnimatedSection>
          <VideoTestimonials onSelectKit={() => handleSelectBundleById('kit-profissional-1litro')} />
        </AnimatedSection>

        {/* Frequently Asked Questions */}
        <AnimatedSection>
          <FAQSection />
        </AnimatedSection>
      </main>

      {/* Footer */}
      <Footer onOpenTracking={() => setIsTrackingOpen(true)} />

      {/* Interactive Cart Drawer */}
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

      {/* Subtle Inactivity 15-second Newsletter Modal */}
      <NewsletterModal onApplyCoupon={handleApplyNewsletterCoupon} />

      {/* Recurring 10% Newsletter Toast Pop-up */}
      <RecurringNewsletterToast 
        onApplyCoupon={handleApplyNewsletterCoupon}
        isModalOpen={isCartOpen || isCheckoutOpen || isQuizOpen || isTrackingOpen || isAdminOpen || isAdminLoginOpen}
      />

      {/* Real-time Purchase Social Proof Popups */}
      <PurchaseNotificationToast />

      {/* Mobile Bottom Floating CTA (<768px) */}
      <FloatingMobileCTA onBuyClick={() => handleSelectBundleById('kit-profissional-1litro')} />

      {/* Floating WhatsApp for Direct Support */}
      <WhatsAppButton />

      {/* Admin Panel Components */}
      {isAdminOpen && (
        <AdminDashboard onClose={() => setIsAdminOpen(false)} />
      )}

      <AdminLoginModal 
        isOpen={isAdminLoginOpen} 
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />
    </div>
    </ErrorBoundary>
  );
}
