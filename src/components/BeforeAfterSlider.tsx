import React, { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { BEFORE_AFTER_CASES } from '../data/productData';
import { Check, Sparkles, AlertTriangle, ArrowLeftRight } from 'lucide-react';

export const BeforeAfterSlider: React.FC = () => {
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 to 100

  const activeCase = BEFORE_AFTER_CASES[selectedCaseIndex];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  return (
    <section id="antes-depois" className="py-16 lg:py-24 bg-[#0f1015] border-t border-amber-500/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
            Eficácia Comprovada em Lavatório
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2 font-serif-display">
            Resultados Reais: Antes e Depois da Super Reconstrução
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-3 font-sans-body">
            Arraste a barra para comparar o estado do fio fragilizado antes do tratamento e a restauração da fibra capilar após a aplicação do protocolo Dyusar.
          </p>

          {/* Case Filter Selector */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {BEFORE_AFTER_CASES.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setSelectedCaseIndex(idx)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedCaseIndex === idx
                    ? 'bg-amber-400 text-black shadow-md shadow-amber-500/20'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Comparison Component */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Visual Slider Box (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl select-none bg-black">
              
              {/* After Layer (Full underneath with shiny healthy hair photo) */}
              <div className="absolute inset-0 w-full h-full bg-black">
                <LazyLoadImage
                  src={selectedCaseIndex === 0 ? '/images/hair-before-after-case1.jpg' : '/images/hair-before-after-case2.jpg'}
                  alt="Cabelo recuperado e reconstruído com Dyusar"
                  effect="blur"
                  wrapperClassName="w-full h-full"
                  className="w-full h-full object-cover filter brightness-105 contrast-105"
                />
                
                {/* Subtle shine overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                  <span className="text-[11px] font-bold text-amber-300 bg-black/60 px-2 py-0.5 rounded border border-amber-400/30">
                    ✓ Córtex Selado & Brilho Espelhado
                  </span>
                </div>

                {/* Badge After */}
                <div className="absolute top-4 right-4 bg-emerald-500/95 text-black text-xs font-black px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider backdrop-blur-sm">
                  DEPOIS (Dyusar)
                </div>
              </div>

              {/* Before Layer (Clipped by sliderPosition with damaged, desaturated, frizzy look) */}
              <div 
                className="absolute inset-0 h-full overflow-hidden border-r-2 border-white transition-none bg-black"
                style={{ width: `${sliderPosition}%` }}
              >
                <div className="w-[600px] sm:w-[700px] h-full relative max-w-none">
                  <LazyLoadImage
                    src={selectedCaseIndex === 0 ? '/images/hair-before-after-case1.jpg' : '/images/hair-before-after-case2.jpg'}
                    alt="Cabelo danificado antes do tratamento"
                    effect="blur"
                    wrapperClassName="w-full h-full"
                    className="w-full h-full object-cover filter grayscale-[80%] contrast-[130%] brightness-[70%] sepia-[30%]"
                  />
                  {/* Damaged texture tint */}
                  <div className="absolute inset-0 bg-red-950/25 mix-blend-multiply" />
                  
                  <div className="absolute bottom-4 left-4">
                    <span className="text-[11px] font-bold text-red-300 bg-black/70 px-2 py-0.5 rounded border border-red-500/40">
                      ✗ Cabelo Quebradiço & Sem Vida
                    </span>
                  </div>
                </div>

                {/* Badge Before */}
                <div className="absolute top-4 left-4 bg-red-500/95 text-white text-xs font-black px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider backdrop-blur-sm">
                  ANTES
                </div>
              </div>

              {/* Dividing Line & Draggable Handle */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-2xl border-2 border-white">
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
              </div>

              {/* Native range input overlay for seamless drag on all devices */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={handleSliderChange}
                aria-label="Controle deslizante de antes e depois"
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
              />
            </div>

            <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
              <span>💡 Arraste para a esquerda ou direita para comparar</span>
            </p>
          </div>

          {/* Diagnostic & Clinical Data Card (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-center bg-[#151720] border border-amber-500/30 rounded-2xl p-6 sm:p-7 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                Caso Clínico #{selectedCaseIndex + 1}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {activeCase.badge}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white mt-2 font-serif-display">
              {activeCase.title}
            </h3>

            <div className="mt-4 space-y-3 text-xs sm:text-sm">
              <div className="p-3 rounded-lg bg-black/40 border border-slate-800">
                <span className="text-slate-400 font-semibold block text-xs">Perfil e Histórico:</span>
                <p className="text-slate-200 mt-0.5">{activeCase.hairProfile}</p>
                <span className="text-amber-300 text-[11px] font-mono mt-1 block">Tempo: {activeCase.sessionCount}</span>
              </div>

              <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/30">
                <span className="text-red-400 font-semibold flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Diagnóstico Inicial:
                </span>
                <p className="text-slate-300 mt-0.5">{activeCase.diagnostic}</p>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30">
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5 text-xs">
                  <Check className="w-3.5 h-3.5" />
                  Resultado com Dyusar:
                </span>
                <p className="text-slate-200 mt-0.5">{activeCase.result}</p>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-800 text-center">
              <div>
                <span className="text-xl font-black text-amber-300 font-mono">97%</span>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Menos Quebra</p>
              </div>
              <div>
                <span className="text-xl font-black text-emerald-400 font-mono">1ª Apl.</span>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Fim do Elástico</p>
              </div>
              <div>
                <span className="text-xl font-black text-amber-300 font-mono">3x</span>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Mais Brilho</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
