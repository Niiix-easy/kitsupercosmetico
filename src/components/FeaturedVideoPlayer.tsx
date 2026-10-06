import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, X, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface FeaturedVideoPlayerProps {
  onBuyKit: () => void;
}

export const FeaturedVideoPlayer: React.FC<FeaturedVideoPlayerProps> = ({ onBuyKit }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(74); // default ~1m14s
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Reliable, high-performance hair salon demonstration video
  const VIDEO_URL = '/video_1.mp4';

  const safePlay = async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.play();
        setIsPlaying(true);
      } catch (err: any) {
        // Prevent unhandled rejection errors when play() is interrupted by pause() or blocked by browser policy
        if (err.name !== 'AbortError') {
          console.warn('Playback interrupted:', err);
        }
      }
    }
  };

  const safePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        safePlay();
      } else {
        safePause();
      }
    }
  };

  const handleOpenAndPlay = () => {
    setIsVideoModalOpen(true);
    setHasEnded(false);
    setTimeout(() => {
      safePlay();
    }, 150);
  };

  const handleCloseModal = () => {
    safePause();
    setIsVideoModalOpen(false);
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
    setPlayedSeconds(0);
    setHasEnded(false);
    safePlay();
  };

  const handleSeek = (fraction: number) => {
    if (videoRef.current && duration > 0) {
      const targetTime = fraction * duration;
      videoRef.current.currentTime = targetTime;
      setPlayedSeconds(targetTime);
      if (fraction < 0.99) {
        setHasEnded(false);
        safePlay();
      }
    }
  };

  const formatTime = (secs: number) => {
    const validSecs = isNaN(secs) || secs < 0 ? 0 : secs;
    const m = Math.floor(validSecs / 60);
    const s = Math.floor(validSecs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (playedSeconds / duration) * 100 : 0;

  return (
    <div className="w-full mt-6">
      {/* Featured Video Teaser Card */}
      <div 
        onClick={handleOpenAndPlay}
        className="relative w-full rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-gradient-to-b from-[#181920] to-[#0f1015] shadow-2xl cursor-pointer group hover:border-amber-400 transition-all duration-300"
      >
        <div className="relative aspect-video w-full overflow-hidden bg-black">
          <div 
            className="absolute inset-0 bg-cover bg-center filter blur-xl scale-105 opacity-40"
            style={{ backgroundImage: "url('/images/video-hero-poster-tiny.webp')" }}
          />
          <img
            src="/images/video-hero-poster.webp"
            alt="Vídeo de demonstração do Kit Dyusar no lavatório"
            // @ts-ignore
            fetchPriority="high"
            loading="eager"
            width="640"
            height="360"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-90 relative z-10"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 z-10" />

          {/* Central Pulsing Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-amber-400/25 animate-ping" />
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-300 text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-black translate-x-0.5" />
              </div>
            </div>
          </div>

          {/* Top Overlays */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-red-600/90 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              DEMONSTRAÇÃO REAL
            </span>
            <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono">
              {formatTime(duration)} min
            </span>
          </div>

          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-amber-400/40 text-amber-300 text-[10px] font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Salão Profissional</span>
            </span>
          </div>

          {/* Bottom Information */}
          <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 text-left bg-gradient-to-t from-black via-black/80 to-transparent">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                  Veja a transformação de ponta a ponta:
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white font-serif-display mt-0.5 leading-snug">
                  Corte Químico Recuperado em 60 Segundos no Lavatório
                </h3>
                <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">
                  Vídeo completo mostrando aplicação no lavatório, neutralização do emborrachamento e teste de elasticidade.
                </p>
              </div>

              <span className="shrink-0 text-xs font-bold text-amber-300 bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-400/30 flex items-center gap-1 group-hover:bg-amber-400 group-hover:text-black transition-colors">
                <span>Assistir Vídeo Real</span>
                <Play className="w-3.5 h-3.5 fill-current" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Real Full Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-lg animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-[#111218] border-2 border-amber-500/50 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Header */}
            <div className="p-3 sm:p-4 bg-[#181922] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h4 className="text-xs sm:text-sm font-bold text-white font-serif-display">
                  Vídeo Real: Aplicação Completa no Lavatório de Salão (De Ponta a Ponta)
                </h4>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Viewport Stage powered by Native HTML5 Video */}
            <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                src={VIDEO_URL}
                playsInline
                muted={isMuted}
                preload="metadata"
                onLoadedMetadata={(e) => {
                  if (e.currentTarget.duration) {
                    setDuration(e.currentTarget.duration);
                  }
                }}
                onTimeUpdate={(e) => setPlayedSeconds(e.currentTarget.currentTime)}
                onEnded={() => {
                  setIsPlaying(false);
                  setHasEnded(true);
                }}
                onClick={togglePlayPause}
                className="w-full h-full object-contain bg-black cursor-pointer"
              />

              {/* End of Video Completion Screen */}
              {hasEnded && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 text-black flex items-center justify-center shadow-2xl mb-3">
                    <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
                  </div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400">
                    TRANSFORMAÇÃO CONCLUÍDA COM SUCESSO
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-serif-display mt-1">
                    Corte Químico 100% Interrompido
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-md">
                    Fio restaurado com resistência à tração, cutículas alinhadas e proteção térmica duradoura.
                  </p>

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={handleRestart}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Assistir Novamente</span>
                    </button>

                    <button
                      onClick={() => {
                        handleCloseModal();
                        onBuyKit();
                      }}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-black text-xs font-extrabold uppercase tracking-wider hover:brightness-110 flex items-center gap-2 shadow-lg cursor-pointer"
                    >
                      <span>Quero Este Mesmo Resultado</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Pause Click Overlay */}
              {!isPlaying && !hasEnded && (
                <button
                  onClick={togglePlayPause}
                  className="absolute z-20 w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-300 text-black flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer"
                >
                  <Play className="w-8 h-8 fill-black translate-x-0.5" />
                </button>
              )}

              {/* Bottom Scrubber & Controls Bar */}
              <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-black via-black/85 to-transparent z-20 space-y-2 pointer-events-auto">
                <div className="w-full flex items-center gap-2.5">
                  <span className="text-[10px] text-amber-300 font-mono font-bold">
                    {formatTime(playedSeconds)}
                  </span>

                  <div 
                    className="flex-1 h-2 bg-slate-700/80 rounded-full overflow-hidden cursor-pointer relative"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const fraction = (e.clientX - rect.left) / rect.width;
                      handleSeek(fraction);
                    }}
                  >
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 relative transition-all"
                      style={{ width: `${progressPercent}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md" />
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={togglePlayPause}
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-amber-400 hover:text-black text-white transition-colors cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>

                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white transition-colors cursor-pointer"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      handleCloseModal();
                      onBuyKit();
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-black text-xs font-bold hover:brightness-110 flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <span>Garantir Meu Kit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
