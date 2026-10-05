import React, { useState } from 'react';
import { Star, Sparkles, CheckCircle2, ArrowRight, ZoomIn, X, Award, ShieldCheck, HeartHandshake } from 'lucide-react';

interface VideoTestimonialsProps {
  onSelectKit: () => void;
}

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  city: string;
  salon: string;
  quote: string;
  image: string;
  imageAlt: string;
  highlightTag: string;
  rating: number;
  caseBadge: string;
}

export const VideoTestimonials: React.FC<VideoTestimonialsProps> = ({ onSelectKit }) => {
  const [activeModalImage, setActiveModalImage] = useState<{ url: string; title: string; desc: string } | null>(null);

  const testimonials: TestimonialItem[] = [
    {
      id: 'case-1',
      name: 'Juliana Mendes',
      role: 'Terapeuta Capilar & Tricologista',
      city: 'São Paulo - SP',
      salon: 'Mendes Hair Therapy',
      quote: 'Recebo clientes com corte químico severo após descolorações agressivas. O Passo 2 Córtex Repair da Dyusar interrompeu o emborrachamento em 60 segundos no lavatório sem enrijecer o fio.',
      image: '/images/hair-salon-professional.webp',
      imageAlt: 'Juliana Mendes aplicando protocolo Dyusar no lavatório do salão',
      highlightTag: 'Homologado em Lavatório',
      rating: 5,
      caseBadge: 'Recuperação Cortical em 60s'
    },
    {
      id: 'case-2',
      name: 'Lucas Ferraz',
      role: 'Master Colorista & Especialista em Loiras',
      city: 'Curitiba - PR',
      salon: 'Ferraz Hair Concept',
      quote: 'O teste de elasticidade que fiz após platinar um cabelo fragilizado impressionou todos no salão. A reposição com Ojon e Murumuru entrega maleabilidade e brilho espelhado 3D impecável.',
      image: '/images/hair-before-after-case2.webp',
      imageAlt: 'Resultado de reconstrução pós-descoloração platinado por Lucas Ferraz',
      highlightTag: 'Teste de Elasticidade',
      rating: 5,
      caseBadge: 'Brilho Espelhado 3D'
    },
    {
      id: 'case-3',
      name: 'Carla Albuquerque',
      role: 'Educadora Técnica Capilar',
      city: 'Rio de Janeiro - RJ',
      salon: 'Espaço Beauty Albuquerque',
      quote: 'Rendimento excelente de até 60 aplicações no kit de 1 litro. Minha agenda de reconstrução pós-química aumentou consideravelmente pela fidelização total das clientes.',
      image: '/images/hair-before-after-case1.webp',
      imageAlt: 'Transformação de cabelo descolorido por Carla Albuquerque',
      highlightTag: 'Resultado Pós-Descoloração',
      rating: 5,
      caseBadge: 'Rendimento de 60+ Usos'
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-[#0e0f14] border-t border-slate-800/80 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-r from-amber-500/5 via-rose-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Casos Reais & Depoimentos de Profissionais</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-serif-display text-balance">
            Aprovado pelos Maiores Terapeutas Capilares do País
          </h2>

          <p className="text-sm sm:text-base text-slate-300 mt-3 font-sans-body">
            Veja relatórios fotográficos e relatos autênticos de especialistas que utilizam o protocolo Dyusar Haute Performance diariamente em seus salões.
          </p>
        </div>

        {/* 3-Column Professional Case Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="bg-[#14151c] border border-slate-800 hover:border-amber-500/40 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all duration-300 group"
            >
              <div>
                {/* Image Viewport Container with Hover Zoom & Modal Trigger */}
                <div 
                  onClick={() => setActiveModalImage({ url: item.image, title: `${item.name} (${item.salon})`, desc: item.quote })}
                  className="relative aspect-[4/3] w-full bg-black overflow-hidden cursor-pointer group/img"
                  title="Clique para ampliar a imagem em alta resolução"
                >
                  <img
                    src={item.image}
                    alt={item.imageAlt}
                    loading="lazy"
                    decoding="async"
                    width="600"
                    height="450"
                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500 filter brightness-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover/img:opacity-60 transition-opacity" />

                  {/* Top Overlay Tag */}
                  <div className="absolute top-3 left-3 z-20 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/80 text-amber-300 border border-amber-400/40 backdrop-blur-sm shadow-md">
                      {item.highlightTag}
                    </span>
                  </div>

                  {/* Bottom Right Zoom Icon Indicator */}
                  <div className="absolute bottom-3 right-3 z-20 bg-black/80 text-amber-300 p-2 rounded-xl border border-amber-400/30 backdrop-blur-md opacity-90 group-hover/img:scale-110 transition-all flex items-center gap-1.5 shadow-lg">
                    <ZoomIn className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] font-bold">Ampliar Foto</span>
                  </div>

                  {/* Result Pill Badge */}
                  <div className="absolute bottom-3 left-3 z-20">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-sm">
                      ✓ {item.caseBadge}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 text-left">
                  {/* Rating & Verified Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-amber-400 gap-0.5">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Profissional Verificado</span>
                    </div>
                  </div>

                  {/* Testimonial Quote */}
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                    "{item.quote}"
                  </p>
                </div>
              </div>

              {/* Card Footer Profile Info */}
              <div className="px-5 pb-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white font-serif-display">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-amber-400 font-medium">
                    {item.role}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {item.salon} • {item.city}
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* CTA Banner Below Testimonials */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#181922] via-[#1a1b24] to-[#121319] border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-widest block">
              Garantia de Satisfação Profissional
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-white font-serif-display mt-0.5">
              Experimente a Reconstrução Escolhida por Milhares de Salões
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Entrega rápida para todo o Brasil, suporte especializado e garantia blindada de 7 dias ou seu dinheiro de volta.
            </p>
          </div>

          <button
            onClick={onSelectKit}
            className="shrink-0 px-6 py-3 rounded-xl bg-gradient-to-r from-[#ffe58f] via-[#d4af37] to-[#ba8c1a] text-black text-xs font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <span>Escolher Meu Kit com Desconto</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Lightbox High-Res Image Modal */}
      {activeModalImage && (
        <div 
          onClick={() => setActiveModalImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 flex items-center justify-center animate-fadeIn cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full bg-[#121318] border-2 border-amber-500/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col cursor-default"
          >
            <div className="p-3.5 bg-[#181922] border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-serif-display">
                <Award className="w-4 h-4 text-amber-400" />
                {activeModalImage.title}
              </span>
              <button
                onClick={() => setActiveModalImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video sm:aspect-[4/3] w-full bg-black">
              <img
                src={activeModalImage.url}
                alt={activeModalImage.title}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-4 bg-[#14151c] border-t border-slate-800 text-left">
              <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed">
                "{activeModalImage.desc}"
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
