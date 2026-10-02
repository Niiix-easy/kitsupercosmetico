import React from 'react';
import { Check, X, Sparkles, HelpCircle } from 'lucide-react';

export const ComparisonTable: React.FC = () => {
  const comparisonRows = [
    {
      feature: 'Penetração real no Córtex e Medula (Nano-Vetorizada)',
      dyusar: true,
      pharmacy: false,
      salon: true
    },
    {
      feature: 'Interrupção imediata do efeito chiclete na 1ª lavagem',
      dyusar: true,
      pharmacy: false,
      salon: true
    },
    {
      feature: 'Passo exclusivo de Cauterização de 18 Aminoácidos Puros',
      dyusar: true,
      pharmacy: false,
      salon: 'Varia (Cobrado à parte)'
    },
    {
      feature: 'Fórmula que reconstrói SEM enrijecer ou quebrar o fio',
      dyusar: true,
      pharmacy: false,
      salon: true
    },
    {
      feature: 'Custo estimado por aplicação de tratamento completo',
      dyusarText: 'R$ 12,35 por aplicação (Rende até 20 sessões)',
      pharmacyText: 'R$ 35,00 (Efeito maquiagem superficial)',
      salonText: 'R$ 350,00 a R$ 500,00 por sessão'
    },
    {
      feature: 'Garantia Incondicional de 7 Dias ou Dinheiro de Volta',
      dyusar: true,
      pharmacy: false,
      salon: false
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-[#0f1015] border-t border-amber-500/20 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
            Comparativo de Eficiência e Economia
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2 font-serif-display">
            Por Que a Dyusar Supera Máscaras de Farmácia e Salões Caros?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-3 font-sans-body">
            Veja a comparação entre a tecnologia profissional de Alta Performance Dyusar, produtos convencionais e idas repetidas ao salão de beleza.
          </p>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-2xl border-2 border-amber-500/30 shadow-2xl bg-[#14151b]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#171922]">
                <th className="py-4 px-4 sm:px-6 text-xs sm:text-sm font-bold text-slate-300 w-2/5">
                  Benefícios & Ciência
                </th>
                <th className="py-4 px-3 sm:px-4 text-xs sm:text-sm font-black text-amber-300 bg-amber-500/10 border-x border-amber-500/30 text-center w-1/4">
                  <div className="flex items-center justify-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Kit Dyusar</span>
                  </div>
                </th>
                <th className="py-4 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-slate-400 text-center w-1/6">
                  Máscaras Comuns
                </th>
                <th className="py-4 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-slate-400 text-center w-1/6">
                  Sessões em Salão
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs sm:text-sm">
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-4 sm:px-6 font-medium text-slate-200">
                    {row.feature}
                  </td>
                  
                  {/* Dyusar column */}
                  <td className="py-4 px-3 sm:px-4 text-center bg-amber-500/5 border-x border-amber-500/20 font-bold text-amber-300">
                    {row.dyusarText ? (
                      <span className="text-xs sm:text-sm font-mono text-emerald-400 font-bold">{row.dyusarText}</span>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </td>

                  {/* Pharmacy column */}
                  <td className="py-4 px-3 sm:px-4 text-center text-slate-400">
                    {row.pharmacyText ? (
                      <span className="text-xs text-slate-400 font-mono">{row.pharmacyText}</span>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-red-500/10 text-red-400 mx-auto flex items-center justify-center">
                        <X className="w-4 h-4" />
                      </div>
                    )}
                  </td>

                  {/* Salon column */}
                  <td className="py-4 px-3 sm:px-4 text-center text-slate-400">
                    {row.salonText ? (
                      <span className="text-xs text-slate-400 font-mono">{row.salonText}</span>
                    ) : typeof row.salon === 'string' ? (
                      <span className="text-[11px] text-amber-200/80">{row.salon}</span>
                    ) : row.salon ? (
                      <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 mx-auto flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-red-500/10 text-red-400 mx-auto flex items-center justify-center">
                        <X className="w-4 h-4" />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Conclusion Callout */}
        <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
          <p className="text-slate-200 text-center sm:text-left">
            💡 <strong>Conclusão Econômica:</strong> Um único kit Dyusar equivale a mais de <strong className="text-amber-300">R$ 5.000,00 em tratamentos profissionais</strong> de salão, com a comodidade de aplicar no seu próprio chuveiro.
          </p>
          <a
            href="#ofertas"
            className="px-4 py-2 rounded-lg bg-amber-400 text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shrink-0 whitespace-nowrap"
          >
            Aproveitar Lote Promocional
          </a>
        </div>

      </div>
    </section>
  );
};
