import React, { useState, useEffect, useRef } from 'react';
import { X, Gift, Sparkles, Check, ArrowRight, Copy } from 'lucide-react';

interface NewsletterModalProps {
  onApplyCoupon: (couponCode: string) => void;
}

export const NewsletterModal: React.FC<NewsletterModalProps> = ({ onApplyCoupon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [contactInput, setContactInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    // Check if dismissed before
    const isDismissed = localStorage.getItem('dyusar_newsletter_dismissed');
    if (isDismissed) return;

    let lastActivity = Date.now();

    const resetInactivityTimer = () => {
      lastActivity = Date.now();
    };

    // User activity listeners
    window.addEventListener('mousemove', resetInactivityTimer, { passive: true });
    window.addEventListener('scroll', resetInactivityTimer, { passive: true });
    window.addEventListener('keydown', resetInactivityTimer, { passive: true });
    window.addEventListener('click', resetInactivityTimer, { passive: true });

    // Check every second if 15 seconds of inactivity passed
    timerRef.current = setInterval(() => {
      const now = Date.now();
      if (now - lastActivity >= 15000) {
        setIsOpen(true);
        clearInterval(timerRef.current);
      }
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('scroll', resetInactivityTimer);
      window.removeEventListener('keydown', resetInactivityTimer);
      window.removeEventListener('click', resetInactivityTimer);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('dyusar_newsletter_dismissed', 'true');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInput.trim()) return;
    setIsSubmitted(true);
    localStorage.setItem('dyusar_newsletter_dismissed', 'true');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('PRIMEIRA5');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleApplyAndShop = () => {
    onApplyCoupon('PRIMEIRA5');
    handleClose();
    // Scroll to bundles
    const el = document.getElementById('tratamento');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#1b1c26] to-[#121319] border-2 border-amber-500/50 rounded-2xl p-6 sm:p-7 shadow-2xl text-center overflow-hidden">
        
        {/* Glow ambient */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-amber-400/20 blur-2xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Fechar aviso"
          className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <div>
            {/* Gift Icon Badge */}
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-black flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4 animate-bounce">
              <Gift className="w-7 h-7" />
            </div>

            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full inline-block mb-2">
              Presente Exclusivo de Boas-Vindas
            </span>

            <h3 className="text-xl sm:text-2xl font-black text-white font-serif-display leading-tight">
              Ganhe 5% OFF Extra na sua 1ª Compra
            </h3>

            <p className="text-xs text-slate-300 mt-2 font-sans-body leading-relaxed">
              Não vá embora de mãos vazias! Cadastre seu WhatsApp ou e-mail abaixo e receba seu cupom de desconto imediato cumulativo com o frete grátis.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <input
                type="text"
                required
                placeholder="Seu WhatsApp ou E-mail preferido"
                value={contactInput}
                onChange={(e) => setContactInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400 transition-colors"
              />

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Quero Meu Desconto de 5%</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <button
              onClick={handleClose}
              className="mt-3 text-[11px] text-slate-500 hover:text-slate-400 underline underline-offset-2 transition-colors cursor-pointer"
            >
              Prefiro pagar o valor normal sem cupom
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-fadeIn">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white font-serif-display">
              Cupom Liberado com Sucesso!
            </h3>

            <p className="text-xs text-slate-300">
              Utilize o código abaixo no checkout para garantir 5% de desconto imediato:
            </p>

            <div className="p-3.5 rounded-xl bg-black/60 border-2 border-dashed border-amber-400 flex items-center justify-between gap-3">
              <span className="text-lg font-black text-amber-300 font-mono tracking-wider">
                PRIMEIRA5
              </span>

              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-400 hover:text-black text-amber-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            <button
              onClick={handleApplyAndShop}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Aplicar no Pedido e Escolher Kit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
