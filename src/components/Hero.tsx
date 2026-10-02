import React from 'react';
import { Star, ShieldCheck, Zap, ArrowRight, Sparkles, CheckCircle, Truck, Award } from 'lucide-react';
import { ProductVisualizer } from './ProductVisualizer';
import { FeaturedVideoPlayer } from './FeaturedVideoPlayer';

interface HeroProps {
  onOpenCartWithBundle: (bundleId: string) => void;
  onOpenQuiz: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenCartWithBundle, onOpenQuiz }) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 bg-[#0c0d10]">
      {/* Background Subtle Gradient Spheres */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-10 right-0 w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Value Proposition & Conversion Hooks (7 cols) */}
          <div className="lg:col-span-7 flex flex-col text-left">
            
            {/* Trust Pill & Social Proof Rating */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Tratamento Reconstrutor SOS Salão</span>
              </div>
              
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="font-bold text-white">4.9/5</span>
                <span className="text-slate-400">(+34.200 fios recuperados)</span>
              </div>
            </div>

            {/* Main Conversion Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.15] tracking-tight font-serif-display text-balance">
              Pare o Efeito Chiclete e Recupere até <span className="gold-gradient-text">97% da Massa Capilar</span> na 1ª Aplicação.
            </h1>

            {/* Sub-headline */}
            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-sans-body">
              A fórmula de <strong>Alta Performance Profissional</strong> com Queratina Nano-Vetorizada, Complexo de 18 Aminoácidos e Óleos Nobres que reconstrói o córtex de cabelos elásticos, emborrachados ou com corte químico sem enrijecer o fio.
            </p>

            {/* Quick Benefits Bullet Points */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Interrompe a quebra e elasticidade imediatamente</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Compatível com qualquer química (Loiras e Afros)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Sela cutículas e proporciona brilho espelhado 3D</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Acompanha Leave-in Protetor Térmico até 230°C</span>
              </div>
            </div>

            {/* Price Anchor & Special Offer Block */}
            <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-[#171922] to-[#121319] border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 line-through">De R$ 389,90</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Economize R$ 142,90
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xs text-slate-300">Por apenas 12x de</span>
                  <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">R$ 24,70</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  ou <strong>R$ 247,00 à vista</strong> (com <strong className="text-emerald-400">10% OFF extra no PIX</strong>)
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:items-end gap-2 shrink-0">
                <button
                  onClick={() => onOpenCartWithBundle('kit-profissional-1litro')}
                  className="relative group overflow-hidden px-6 py-3 text-sm font-bold uppercase tracking-wider text-black rounded-xl bg-gradient-to-r from-[#ffe58f] via-[#d4af37] to-[#ba8c1a] shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-center"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <span>Quero Recuperar Meu Cabelo</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                  <div className="absolute inset-0 bg-white/25 translate-x-[-100%] animate-shimmer" />
                </button>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Frete Grátis + Despacho em 24h</span>
                </div>
              </div>
            </div>

            {/* Diagnostic Quiz Trigger Link & Guarantee */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <button
                onClick={onOpenQuiz}
                className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-medium underline underline-offset-4 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Não sabe se seu cabelo precisa de reconstrução? Faça o teste gratuito</span>
              </button>

              <div className="flex items-center gap-1 text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Garantia Blindada de 7 Dias</span>
              </div>
            </div>

          </div>

          {/* Right Column: Visualizer & 3D Interactive Stage + Featured Video (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <ProductVisualizer />
            <FeaturedVideoPlayer onBuyKit={() => onOpenCartWithBundle('kit-profissional-1litro')} />
          </div>

        </div>
      </div>
    </section>
  );
};
