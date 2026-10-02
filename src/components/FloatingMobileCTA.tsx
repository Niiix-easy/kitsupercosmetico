import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface FloatingMobileCTAProps {
  onBuyClick: () => void;
}

export const FloatingMobileCTA: React.FC<FloatingMobileCTAProps> = ({ onBuyClick }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled down past 450px
      if (window.scrollY > 450) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121319]/95 border-t border-amber-500/30 px-3 py-2 backdrop-blur-lg shadow-2xl flex items-center justify-between gap-2 max-h-[60px]">
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5 truncate">
          <span className="text-[10px] text-slate-400 line-through">R$ 389</span>
          <span className="text-xs font-black text-amber-300 font-mono">12x R$ 24,70</span>
        </div>
        <span className="text-[9px] text-emerald-400 font-semibold truncate">
          ✓ Frete Grátis + Brinde Inclusos
        </span>
      </div>

      <button
        onClick={onBuyClick}
        className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-black font-extrabold text-[11px] uppercase tracking-wider shrink-0 flex items-center gap-1 shadow-md hover:brightness-110 active:scale-95 transition-all"
      >
        <span>Garantir</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
