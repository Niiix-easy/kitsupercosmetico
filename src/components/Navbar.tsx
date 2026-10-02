import React, { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { ShoppingBag, Sparkles, Menu, X, ArrowRight, Coins } from 'lucide-react';
import { useLoyaltyPoints } from '../hooks/useLoyaltyPoints';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenQuiz: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ cartCount, onOpenCart, onOpenQuiz }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const loyaltyPoints = useLoyaltyPoints();

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0c0d10]/95 backdrop-blur-md border-b border-amber-500/20">
      {/* Slim Top Announcement Bar (<=40px) */}
      <div className="bg-gradient-to-r from-[#91711e] via-[#d4af37] to-[#805e13] px-3 py-1.5 text-center text-[11px] sm:text-xs font-semibold text-black tracking-wide flex items-center justify-center gap-2 overflow-hidden">
        <span className="animate-pulse">🚨</span>
        <span className="truncate">
          <strong>LOTE EXCLUSIVO:</strong> Até 40% OFF + Frete Grátis para todo o Brasil | Despacho em 24h
        </span>
      </div>

      {/* Top Bar Contract (3 Zones) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Zone 1: Single text element wordmark / Official logo */}
        <a href="#" className="flex items-center gap-2 group shrink-0">
          <LazyLoadImage
            src="/images/logo-dyusar-horizontal.png"
            alt="Dyusar Cosméticos Profissionais"
            effect="opacity"
            wrapperClassName="h-7 sm:h-9"
            className="h-7 sm:h-9 w-auto object-contain filter brightness-110 drop-shadow-md"
            onError={(e: any) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const fallback = parent.querySelector('.logo-fallback');
                if (fallback) (fallback as HTMLElement).style.display = 'flex';
              }
            }}
          />
          <div className="logo-fallback hidden flex-col">
            <span className="text-xl sm:text-2xl font-extrabold tracking-widest font-serif-display text-white">
              DYUSAR
            </span>
            <span className="text-[8px] uppercase tracking-[0.25em] text-[#d4af37] -mt-1 font-sans">
              Haute Performance
            </span>
          </div>
        </a>

        {/* Zone 2: Clean 4-6 text navigation links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6 text-xs xl:text-sm font-medium text-slate-300">
          <a href="#tratamento" className="hover:text-amber-300 transition-colors whitespace-nowrap">
            O Tratamento
          </a>
          <a href="#antes-depois" className="hover:text-amber-300 transition-colors whitespace-nowrap">
            Antes & Depois
          </a>
          <button 
            onClick={onOpenQuiz} 
            className="hover:text-amber-300 transition-colors flex items-center gap-1 text-amber-400 font-semibold cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Diagnóstico Capilar</span>
          </button>
          <a href="#ativos" className="hover:text-amber-300 transition-colors whitespace-nowrap">
            Ativos Científicos
          </a>
          <a href="#ofertas" className="hover:text-amber-300 transition-colors whitespace-nowrap">
            Kits & Ofertas
          </a>
          <a href="#depoimentos" className="hover:text-amber-300 transition-colors whitespace-nowrap">
            Resultados Reais
          </a>
          <a href="#faq" className="hover:text-amber-300 transition-colors whitespace-nowrap">
            Dúvidas
          </a>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Loyalty Points Counter */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/10 text-amber-300/90 shadow-inner group transition-all hover:bg-amber-500/10">
            <div className="relative">
              <Coins className="w-4 h-4 text-amber-400 animate-pulse group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-amber-400 blur-md opacity-20" />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-[10px] font-black font-mono">{loyaltyPoints}</span>
              <span className="text-[7px] uppercase font-bold tracking-tighter opacity-70">Pontos VIP</span>
            </div>
          </div>

          {/* Diagnostic Quiz Button for tablet */}
          <button
            onClick={onOpenQuiz}
            className="hidden sm:flex lg:hidden items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 border border-amber-400/40 text-amber-300 hover:bg-amber-500/20 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Quiz Capilar</span>
          </button>

          {/* Cart Trigger with badge */}
          <button
            onClick={onOpenCart}
            aria-label="Abrir carrinho de compras"
            className="relative flex items-center justify-center p-2 rounded-lg bg-slate-900 border border-amber-500/30 text-white hover:border-amber-400 transition-colors cursor-pointer group"
          >
            <ShoppingBag className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-[10px] flex items-center justify-center shadow-lg animate-pulse font-mono">
                {cartCount}
              </span>
            )}
          </button>

          {/* Primary CTA button */}
          <a
            href="#ofertas"
            className="relative overflow-hidden px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-black rounded-lg bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 shadow-md hover:brightness-110 transition-all whitespace-nowrap"
          >
            <span className="relative z-10">Comprar Agora</span>
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] animate-shimmer" />
          </a>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#121319] border-b border-amber-500/30 px-4 py-5 animate-fadeIn space-y-3">
          <nav className="flex flex-col space-y-2.5 text-sm font-medium text-slate-200">
            <a 
              href="#tratamento" 
              onClick={closeMobileMenu}
              className="py-1.5 px-2 rounded-lg hover:bg-slate-800 hover:text-amber-300 transition-colors"
            >
              O Tratamento dos 4 Passos
            </a>
            <a 
              href="#antes-depois" 
              onClick={closeMobileMenu}
              className="py-1.5 px-2 rounded-lg hover:bg-slate-800 hover:text-amber-300 transition-colors"
            >
              Antes e Depois Interativo
            </a>
            <button 
              onClick={() => {
                closeMobileMenu();
                onOpenQuiz();
              }}
              className="py-1.5 px-2 rounded-lg text-left text-amber-400 font-semibold hover:bg-slate-800 transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Fazer Diagnóstico Capilar Gratuito</span>
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a 
              href="#ativos" 
              onClick={closeMobileMenu}
              className="py-1.5 px-2 rounded-lg hover:bg-slate-800 hover:text-amber-300 transition-colors"
            >
              Ativos Científicos & Fórmula
            </a>
            <a 
              href="#ofertas" 
              onClick={closeMobileMenu}
              className="py-1.5 px-2 rounded-lg text-amber-300 font-bold hover:bg-slate-800 transition-colors"
            >
              Kits Promocionais com Desconto
            </a>
            <a 
              href="#depoimentos" 
              onClick={closeMobileMenu}
              className="py-1.5 px-2 rounded-lg hover:bg-slate-800 hover:text-amber-300 transition-colors"
            >
              Depoimentos e Avaliações Reais
            </a>
            <a 
              href="#faq" 
              onClick={closeMobileMenu}
              className="py-1.5 px-2 rounded-lg hover:bg-slate-800 hover:text-amber-300 transition-colors"
            >
              Perguntas Frequentes (FAQ)
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};
