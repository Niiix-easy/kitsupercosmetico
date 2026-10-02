import React from 'react';
import { ACTIVE_INGREDIENTS } from '../data/productData';
import { Atom, ShieldCheck, HeartHandshake, Leaf, Sparkles, Award } from 'lucide-react';

export const FormulaSection: React.FC = () => {
  return (
    <section id="ativos" className="py-16 lg:py-24 bg-[#0f1015] border-t border-amber-500/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
            <Atom className="w-3.5 h-3.5 text-amber-400" />
            <span>Tecnologia Nano-Cortex Repair</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-serif-display">
            A Ciência Por Trás do Fim do Efeito Chiclete
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-3 font-sans-body">
            Enquanto cosméticos comuns agem apenas na superfície do fio (efeito maquiagem), a Dyusar combina nanopartículas de queratina e aminoácidos biomiméticos que penetram nas camadas mais profundas do córtex capilar.
          </p>
        </div>

        {/* Ingredients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ACTIVE_INGREDIENTS.map((item, idx) => (
            <div
              key={item.name}
              className="p-6 rounded-2xl bg-[#14151b] border border-amber-500/20 hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between group shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold text-xs font-mono">
                    0{idx + 1}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-amber-300/80 px-2 py-0.5 rounded bg-black/40 border border-amber-500/20">
                    Ativo Nobre
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white font-serif-display group-hover:text-amber-300 transition-colors">
                  {item.name}
                </h3>
                
                <p className="text-xs font-semibold text-amber-400 mt-1">
                  {item.role}
                </p>

                <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] text-slate-400">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Alta pureza farmacêutica e absorção celular</span>
              </div>
            </div>
          ))}

          {/* Special Pillar 6: Anvisa Certificate Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1b1c25] to-[#121319] border-2 border-emerald-500/30 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <ShieldCheck className="w-6 h-6" />
                <span className="text-xs font-bold uppercase tracking-wider">Homologação Oficial</span>
              </div>
              <h3 className="text-lg font-bold text-white font-serif-display">
                Certificação Anvisa Grau 2
              </h3>
              <p className="text-xs text-emerald-300 mt-1 font-mono">
                Processo Notificado & Aprovado
              </p>
              <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                Produto submetido a rigorosos testes de eficácia dérmica e segurança capilar. 100% livre de formol, livre de petrolatos pesados e parabenos tóxicos.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                Cruelty Free
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Indústria Brasileira
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
