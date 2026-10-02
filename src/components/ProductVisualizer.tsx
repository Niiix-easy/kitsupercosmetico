import React, { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Sparkles, ShieldCheck, CheckCircle2, Award, Eye, ZoomIn } from 'lucide-react';
import { useKitImages } from '../utils/kitImageStorage';

interface ProductVisualizerProps {
  className?: string;
  showTabs?: boolean;
}

export const ProductVisualizer: React.FC<ProductVisualizerProps> = ({
  className = '',
  showTabs = true
}) => {
  const [activeView, setActiveView] = useState<'kit' | 'passo1' | 'passo2' | 'passo3' | 'passo4'>('kit');
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const { images } = useKitImages();

  const handleViewChange = (view: 'kit' | 'passo1' | 'passo2' | 'passo3' | 'passo4') => {
    if (view !== activeView) {
      setIsImgLoaded(false);
      setActiveView(view);
    }
  };

  const productPhotos = {
    kit: {
      image: '/images/Kit Profissional Completo.webp?v=luxury4',
      alt: 'Kit Profissional Completo Dyusar Super Reconstruction',
      title: 'Kit Profissional Completo (1 Litro + Queratina)',
      badge: 'Protocolo Master 4 Passos de Alto Impacto',
      desc: 'Linha completa profissional com Shampoo 1L, Condicionador 1L, Máscara Efeito Teia 1kg e Queratina Líquida 500ml.'
    },
    passo1: {
      image: '/images/shampoo-reparador.webp?v=luxury4',
      alt: 'Shampoo Hidratante Reparador Dyusar',
      title: 'Passo 1: Shampoo Hidratante Reparador 300ml',
      badge: 'Limpeza Fisiológica',
      desc: 'Limpa suavemente sem dilatar excessivamente a cutícula, preservando a hidratação e preparando o fio para máxima absorção da queratina.'
    },
    passo2: {
      image: '/images/queratina-cauterizacao.webp?v=luxury4',
      alt: 'Queratina Líquida Córtex Repair Cauterização Dyusar',
      title: 'Passo 2: Cauterização Queratina Córtex Repair 300ml',
      badge: 'Estrela do Tratamento ⭐',
      desc: 'Concentrado com 18 aminoácidos puros que penetra no córtex e quebra o efeito elástico na primeira aplicação.'
    },
    passo3: {
      image: '/images/mascara-super-reconstrucao.webp?v=luxury4',
      alt: 'Máscara Super Reconstrução Intensiva Dyusar 300g',
      title: 'Passo 3: Máscara Super Reconstrução 300g',
      badge: 'Liponutrição com Ojon e Murumuru',
      desc: 'Envelopa o fio restaurando maleabilidade, sedosidade e selagem profunda das cutículas sem enrijecer o cabelo.'
    },
    passo4: {
      image: '/images/leave-in-selante.webp?v=luxury4',
      alt: 'Leave-in Selante Térmico Dyusar',
      title: 'Passo 4: Leave-in Selante Térmico & Defrizante 200ml',
      badge: 'Proteção Térmica 230°C',
      desc: 'Escudo anti-umidade que sela as pontas, previne o desbotamento da cor e protege termicamente contra chapinha e secador.'
    }
  };

  const current = productPhotos[activeView];

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* Background radial luxury lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.18)_0%,rgba(12,13,16,0)_70%)] pointer-events-none" />

      {/* Main Showcase Stage */}
      <div className="relative w-full max-w-[560px] aspect-[4/3] rounded-2xl bg-gradient-to-b from-[#181920] to-[#0f1015] border border-amber-500/30 p-4 sm:p-6 flex flex-col items-center justify-center shadow-2xl overflow-hidden group">
        
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-32 bg-[#d4af37]/15 blur-3xl rounded-full pointer-events-none" />
        
        {/* Pedestal floor reflection */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] h-12 bg-gradient-to-r from-transparent via-[#d4af37]/20 to-transparent blur-xl rounded-full pointer-events-none" />
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent pointer-events-none" />

        {/* Real Product Image with High-End Styling */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center overflow-hidden">
          {/* Progressive loading background placeholder */}
          {((activeView === 'kit' ? (images['kit-profissional-completo'] || current.image) : current.image)).includes('.webp') && (
            <div 
              className="absolute inset-0 bg-contain bg-center bg-no-repeat filter blur-lg opacity-25 scale-75"
              style={{ backgroundImage: `url('${(activeView === 'kit' ? (images['kit-profissional-completo'] || current.image) : current.image).replace('.webp', '-tiny.webp')}')` }}
            />
          )}

          {/* Main Product Image */}
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              key={activeView === 'kit' ? (images['kit-profissional-completo'] || current.image) : current.image}
              src={activeView === 'kit' ? (images['kit-profissional-completo'] || current.image) : current.image}
              alt={current.alt}
              // @ts-ignore - fetchPriority is the React-compatible property name for LCP optimization
              fetchPriority={activeView === 'kit' ? 'high' : 'auto'}
              loading={activeView === 'kit' ? 'eager' : 'lazy'}
              onLoad={() => setIsImgLoaded(true)}
              className={`max-h-[82%] max-w-[90%] object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] group-hover:scale-105 transition-all duration-500 rounded-lg ${
                isImgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              onError={(e: any) => {
                e.currentTarget.src = '/images/Kit Profissional 1 Litro.png';
                setIsImgLoaded(true);
              }}
            />
          </div>

          {/* Bottom subtitle / caption */}
          <div className="mt-2 text-center">
            <span className="text-xs font-bold text-white font-serif-display block">
              {current.title}
            </span>
            <span className="text-[10px] text-amber-300/80 font-mono">
              {current.badge}
            </span>
          </div>
        </div>

        {/* Floating Trust Pills */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 border border-emerald-500/40 text-emerald-400 text-[10px] font-medium backdrop-blur-md shadow-md">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Anvisa Grau 2 Oficial</span>
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/75 border border-amber-500/40 text-amber-300 text-[10px] font-medium backdrop-blur-md shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Nano-Cortex 97%</span>
        </div>
      </div>

      {/* Interactive Selector Tabs with Real Photo Thumbnails */}
      {showTabs && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-4 p-1.5 bg-[#14151b] border border-slate-800 rounded-xl max-w-full">
          <button
            onClick={() => handleViewChange('kit')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'kit'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>Kit Completo</span>
          </button>
          
          <button
            onClick={() => handleViewChange('passo1')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeView === 'passo1'
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1. Shampoo
          </button>

          <button
            onClick={() => handleViewChange('passo2')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeView === 'passo2'
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2. Cauterização ⭐
          </button>

          <button
            onClick={() => handleViewChange('passo3')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeView === 'passo3'
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3. Máscara
          </button>

          <button
            onClick={() => handleViewChange('passo4')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeView === 'passo4'
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            4. Leave-in
          </button>
        </div>
      )}
    </div>
  );
};
