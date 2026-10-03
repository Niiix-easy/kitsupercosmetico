import React, { useState, useRef } from 'react';
import { Star, Sparkles, Play, Volume2, VolumeX, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';

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
  videoUrl: string;
  poster: string;
  highlightTag: string;
  rating: number;
}

export const VideoTestimonials: React.FC<VideoTestimonialsProps> = ({ onSelectKit }) => {
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [playerErrors, setPlayerErrors] = useState<Record<string, boolean>>({});

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const testimonials: TestimonialItem[] = [
    {
      id: 'video-1',
      name: 'Juliana Mendes',
      role: 'Terapeuta Capilar & Tricologista',
      city: 'São Paulo - SP',
      salon: 'Mendes Hair Therapy',
      quote: 'Recebo clientes com corte químico severo após descolorações agressivas. O Passo 2 Córtex Repair da Dyusar interrompeu o emborrachamento em 60 segundos no lavatório sem enrijecer.',
      videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
      poster: '/images/avatar-salon.webp',
      highlightTag: 'Recuperação de Corte Químico',
      rating: 5
    },
    {
      id: 'video-2',
      name: 'Lucas Ferraz',
      role: 'Master Colorista & Especialista em Loiras',
      city: 'Curitiba - PR',
      salon: 'Ferraz Hair Concept',
      quote: 'O teste de elasticidade que fiz após platinar um cabelo fragilizado impressionou todos no salão. A reposição com Ojon e Murumuru entrega maleabilidade e brilho espelhado 3D.',
      videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
      poster: '/images/hair-before-after-case2.webp?v=creative3_final',
      highlightTag: 'Teste de Elasticidade Imediato',
      rating: 5
    },
    {
      id: 'video-3',
      name: 'Carla Albuquerque',
      role: 'Educadora Técnica Capilar',
      city: 'Rio de Janeiro - RJ',
      salon: 'Espaço Beauty Albuquerque',
      quote: 'Rendimento excelente de até 60 aplicações no kit de 1 litro. Minha agenda de reconstrução pós-química aumentou consideravelmente pela fidelização das clientes.',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      poster: '/images/hair-salon-professional.webp',
      highlightTag: 'Padrão Salão de Alto Luxo',
      rating: 5
    }
  ];

  const handleTogglePlay = async (id: string) => {
    // Pause any other active video
    Object.keys(videoRefs.current).forEach((key) => {
      if (key !== id && videoRefs.current[key]) {
        videoRefs.current[key]?.pause();
      }
    });

    const targetVideo = videoRefs.current[id];
    if (targetVideo) {
      if (activePlayerId === id && !targetVideo.paused) {
        targetVideo.pause();
        setActivePlayerId(null);
      } else {
        try {
          await targetVideo.play();
          setActivePlayerId(id);
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            console.warn('Playback interrupted:', err);
          }
        }
      }
    }
  };

  const handlePlayerError = (id: string) => {
    console.error(`Error loading video testimonial: ${id}`);
    setPlayerErrors(prev => ({ ...prev, [id]: true }));
  };

  return (
    <section className="py-16 lg:py-24 bg-[#0e0f14] border-t border-slate-800/80 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-r from-amber-500/5 via-rose-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Depoimentos em Vídeo de Profissionais</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-serif-display text-balance">
            Aprovado pelos Maiores Terapeutas Capilares do País
          </h2>

          <p className="text-sm sm:text-base text-slate-300 mt-3 font-sans-body">
            Veja relatos autênticos de especialistas que utilizam o protocolo Dyusar Haute Performance diariamente na bancada de seus salões.
          </p>
        </div>

        {/* 3-Column Video Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item) => {
            const isThisPlaying = activePlayerId === item.id;
            const hasError = playerErrors[item.id];

            return (
              <div
                key={item.id}
                className="bg-[#14151c] border border-slate-800 hover:border-amber-500/40 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all duration-300 group"
              >
                <div>
                  {/* Video Viewport Container powered by Native Video */}
                  <div className="relative aspect-video w-full bg-black overflow-hidden">
                    {!hasError ? (
                      <video
                        ref={(el) => {
                          videoRefs.current[item.id] = el;
                        }}
                        src={item.videoUrl}
                        poster={item.poster}
                        playsInline
                        loop
                        muted={isMuted}
                        preload="metadata"
                        onError={() => handlePlayerError(item.id)}
                        onClick={() => handleTogglePlay(item.id)}
                        className="w-full h-full object-cover cursor-pointer"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 p-4 text-center">
                        <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Vídeo Temporariamente Indisponível</span>
                      </div>
                    )}

                    {/* Dark gradient overlay when paused */}
                    {!isThisPlaying && !hasError && (
                      <div 
                        onClick={() => handleTogglePlay(item.id)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center cursor-pointer group-hover:bg-black/40 transition-colors z-20"
                      >
                        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-amber-300 text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 fill-black translate-x-0.5" />
                        </div>
                      </div>
                    )}

                    {/* Overlay Tag */}
                    <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/80 text-amber-300 border border-amber-400/40 backdrop-blur-sm shadow-md">
                        {item.highlightTag}
                      </span>
                    </div>

                    {/* Sound Control Toggle */}
                    {isThisPlaying && !hasError && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMuted(!isMuted);
                        }}
                        className="absolute bottom-2.5 right-2.5 z-30 p-1.5 rounded-lg bg-black/80 text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        title={isMuted ? 'Ativar Áudio' : 'Desativar Áudio'}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                      </button>
                    )}
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
                    <h4 className="text-xs font-bold text-white font-serif-display">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-amber-400 font-medium">
                      {item.role}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {item.salon} • {item.city}
                    </p>
                  </div>
                </div>

              </div>
            );
          })}
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
    </section>
  );
};
