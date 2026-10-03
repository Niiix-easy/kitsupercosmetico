import React, { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Award, Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface SalonShowcaseSectionProps {
  onCtaClick: () => void;
}

export const SalonShowcaseSection: React.FC<SalonShowcaseSectionProps> = ({ onCtaClick }) => {
  const [isImgLoaded, setIsImgLoaded] = useState(false);

  return (
    <section className="py-16 lg:py-20 bg-[#121318] border-t border-amber-500/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Visual Salon Scene with Real Image */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/30 shadow-2xl group bg-[#0e0f14]">
              {/* Progressive loading background placeholder */}
              <div 
                className="absolute inset-0 bg-cover bg-center filter blur-xl scale-105 opacity-50"
                style={{ backgroundImage: "url('/images/hair-salon-professional-tiny.webp')" }}
              />

              <img
                src="/images/hair-salon-professional.webp"
                alt="Profissional aplicando o tratamento Dyusar em salão de beleza"
                loading="lazy"
                decoding="async"
                width="600"
                height="400"
                onLoad={() => setIsImgLoaded(true)}
                className={`w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-all duration-500 filter brightness-95 ${
                  isImgLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6">
                <span className="text-[10px] uppercase font-bold text-amber-300 tracking-widest bg-amber-500/20 border border-amber-400/40 px-2.5 py-1 rounded-full self-start mb-1 backdrop-blur-sm">
                  Padrão Salão de Alto Luxo
                </span>
                <p className="text-white text-base sm:text-lg font-bold font-serif-display">
                  Tecnologia Desenvolvida para Lavatórios e Terapeutas Capilares
                </p>
                <p className="text-slate-300 text-xs mt-1">
                  Agora disponível para manutenção intensiva em casa com os mesmos ativos originais de salão.
                </p>
              </div>
            </div>

            {/* Overlapping Badge */}
            <div className="absolute -bottom-4 -right-2 sm:right-4 bg-[#1b1c24] border border-amber-400/50 p-3.5 rounded-xl shadow-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold font-mono">
                97%
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">Recuperação Cortical</p>
                <p className="text-[10px] text-amber-300">Comprovada em 1ª aplicação</p>
              </div>
            </div>
          </div>

          {/* Right Column: Why Professionals Choose Dyusar */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left">
            <span className="text-xs uppercase font-bold tracking-widest text-[#d4af37]">
              Confiança de Especialistas
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2 font-serif-display">
              Mais de 4.800 Salões no Brasil Confiam na Dyusar
            </h2>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed font-sans-body">
              Quando um procedimento químico sai do controle e o cabelo emborracha, cabeleireiros profissionais não arriscam com cosméticos comuns: eles utilizam o <strong>Passo 2 Cauterização Queratina Córtex</strong> para salvar o fio imediatamente na bancada.
            </p>

            <div className="mt-6 space-y-3.5 text-xs sm:text-sm">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-sans">Sem Efeito Rebote de Rigidez:</strong>
                  <span className="text-slate-400">A sinergia entre queratina pura e lipídios nobres (Ojon e Murumuru) garante força estrutural com toque maleável e sedoso.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-sans">Estabilidade para Loiros e Mechas:</strong>
                  <span className="text-slate-400">Não desbota, não oxida e não amarela a tonalidade dos fios descoloridos platinados.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-sans">Rentabilidade Máxima:</strong>
                  <span className="text-slate-400">Rendimento de até 20 aplicações completas por kit, tornando o custo por uso extremamente acessível.</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={onCtaClick}
                className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider text-black bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:brightness-110 shadow-lg cursor-pointer inline-flex items-center gap-2"
              >
                <span>Garantir Meu Kit com Desconto de Lote</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
