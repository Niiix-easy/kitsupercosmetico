import React, { useState, useEffect } from 'react';
import { Gift, X, Sparkles, Check, ArrowRight } from 'lucide-react';

interface RecurringNewsletterToastProps {
  onApplyCoupon: (couponCode: string) => void;
  isModalOpen?: boolean; // prop to ensure no interference if another modal is active
}

export const RecurringNewsletterToast: React.FC<RecurringNewsletterToastProps> = ({
  onApplyCoupon,
  isModalOpen = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [contactInput, setContactInput] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Check if user already subscribed permanently
    const alreadySubscribed = localStorage.getItem('dyusar_newsletter_10off_subscribed');
    if (alreadySubscribed) {
      setIsSubscribed(true);
      return;
    }

    // Initial show after 8 seconds
    const initialTimer = setTimeout(() => {
      const modalActive = document.querySelector('[role="dialog"]') !== null;
      if (!isModalOpen && !modalActive) {
        setIsVisible(true);
      }
    }, 8000);

    // Recurring interval every 45 seconds to re-prompt if dismissed
    const recurringInterval = setInterval(() => {
      const modalActive = document.querySelector('[role="dialog"]') !== null;
      const subscribed = localStorage.getItem('dyusar_newsletter_10off_subscribed');
      if (!subscribed && !isModalOpen && !modalActive) {
        setIsVisible(true);
      }
    }, 45000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(recurringInterval);
    };
  }, [isModalOpen]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInput.trim()) return;

    setIsSuccess(true);
    localStorage.setItem('dyusar_newsletter_10off_subscribed', 'true');
    setIsSubscribed(true);

    onApplyCoupon('PRIMEIRA10');

    setTimeout(() => {
      setIsVisible(false);
    }, 3000);
  };

  if (!isVisible || isSubscribed || isModalOpen) return null;

  return (
    <div className="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-40 max-w-sm w-[calc(100vw-2rem)] bg-gradient-to-br from-[#1a1c26] via-[#14151e] to-[#0f1017] border-2 border-amber-400/60 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-bounceIn transition-all">
      {/* Ambient Top Glow */}
      <div className="absolute -top-6 left-8 w-24 h-12 bg-amber-400/20 blur-xl rounded-full pointer-events-none" />

      {/* Close Button */}
      <button
        onClick={handleClose}
        aria-label="Fechar mensagem"
        className="absolute top-2.5 right-2.5 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>

      {!isSuccess ? (
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-black shadow-md shadow-amber-500/20 shrink-0">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md inline-block">
                Oportunidade Especial
              </span>
              <h4 className="text-sm font-black text-white font-serif-display leading-tight mt-0.5">
                Ganhe 10% OFF na 1ª Compra!
              </h4>
            </div>
          </div>

          <p className="text-xs text-slate-300 font-sans-body mb-3 leading-snug">
            Assine a newsletter Dyusar e receba um cupom exclusivo de 10% de desconto imediato no seu pedido!
          </p>

          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              type="text"
              required
              placeholder="WhatsApp: (66) 99677-2704 ou e-mail"
              value={contactInput}
              onChange={(e) => setContactInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400 transition-colors"
            />

            <button
              type="submit"
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-black font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Resgatar 10% OFF Agora</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      ) : (
        <div className="py-2 text-center space-y-2 animate-fadeIn">
          <div className="mx-auto w-9 h-9 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Check className="w-5 h-5 stroke-[3]" />
          </div>
          <h4 className="text-sm font-bold text-white font-serif-display">
            Desconto de 10% Aplicado!
          </h4>
          <p className="text-xs text-slate-300">
            O cupom <span className="font-mono text-amber-300 font-bold">PRIMEIRA10</span> foi ativado com sucesso para sua compra.
          </p>
        </div>
      )}
    </div>
  );
};
