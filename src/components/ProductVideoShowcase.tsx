import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Sparkles, CheckCircle2, ArrowRight, Maximize, Upload, Loader2, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '../utils/pixelTracking';

interface VideoItem {
  id: string;
  url: string;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  captions?: string;
}

const formatTime = (secs: number) => {
  const validSecs = isNaN(secs) || secs < 0 ? 0 : secs;
  const m = Math.floor(validSecs / 60);
  const s = Math.floor(validSecs % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const VideoCard: React.FC<{ 
  video: VideoItem; 
  isGlobalMuted: boolean; 
  onMuteToggle: () => void; 
  onGlobalPlay: (id: string) => void; 
  isActive: boolean;
  index: number;
  onRefresh: () => void;
}> = ({ 
  video, 
  isGlobalMuted, 
  onMuteToggle,
  onGlobalPlay,
  isActive,
  index,
  onRefresh
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  
  // Tracking states
  const [hasStarted, setHasStarted] = useState(false);
  const [hasReached50, setHasReached50] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);

  useEffect(() => {
    if (!isActive && isPlaying) {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  useEffect(() => {
    if (isPlaying && !hasStarted) {
      trackEvent.trackVideo('video_start', video.title);
      setHasStarted(true);
    }
    
    if (isPlaying && duration > 0) {
      const progress = (playedSeconds / duration) * 100;
      if (progress >= 50 && !hasReached50) {
        trackEvent.trackVideo('video_completed_50%', video.title);
        setHasReached50(true);
      }
      if (progress >= 95 && !hasFinished) {
        trackEvent.trackVideo('video_finished', video.title);
        setHasFinished(true);
      }
    }
  }, [isPlaying, playedSeconds, duration]);

  const handleTogglePlay = async () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        onGlobalPlay(video.id);
        try {
          await videoRef.current.play();
          setIsPlaying(true);
        } catch (err: any) {
          if (err.name !== 'AbortError') console.warn('Playback interrupted:', err);
        }
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const fraction = (e.clientX - rect.left) / rect.width;
      const targetTime = fraction * duration;
      videoRef.current.currentTime = targetTime;
      setPlayedSeconds(targetTime);
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen().catch(err => {
          console.error(`Error: ${err.message}`);
        });
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        alert("O vídeo excede o limite de 100MB.");
        return;
      }

      setIsUploading(true);
      setUploadPercent(0);

      const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks (extremely safe for Nginx limits)
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const slotId = `video_${index + 1}`;

      try {
        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
          const start = chunkIndex * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, file.size);
          const chunk = file.slice(start, end);

          // Convert chunk to base64
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target?.result as string);
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(chunk);
          });

          const response = await fetch('/api/upload-video-chunk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoId: slotId, chunkIndex, totalChunks, dataUrl })
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
            throw new Error(errorData.error || 'Erro no envio do pedaço.');
          }

          const data = await response.json();
          const percent = Math.round(((chunkIndex + 1) / totalChunks) * 100);
          setUploadPercent(percent);

          if (data.completed) {
            onRefresh();
            setError(false);
          }
        }
      } catch (err: any) {
        console.error("Upload error:", err);
        alert(`Falha no upload: ${err.message || 'Conexão recusada.'}`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const progressPercent = duration > 0 ? (playedSeconds / duration) * 100 : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
      ref={containerRef}
      className="group bg-[#14151c] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-amber-500/40 flex flex-col h-full relative"
    >
      {/* Hidden File Input */}
      <input 
        type="file" 
        accept="video/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
      />

      {/* Admin Upload UI */}
      <div className="absolute top-4 right-4 z-40 flex gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-black transition-all backdrop-blur-md shadow-lg disabled:opacity-50 text-[10px] font-bold uppercase tracking-wider group/btn"
          title="Fazer upload de vídeo do seu PC (MP4)"
        >
          {isUploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
          )}
          <span>{isUploading ? 'Enviando...' : 'Trocar Vídeo'}</span>
        </button>
      </div>

      {/* Video Container */}
      <div className="relative aspect-[9/16] w-full bg-[#0a0a0c] overflow-hidden cursor-pointer group-hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]">
        {!isUploading && (
          <video
            key={video.url}
            ref={videoRef}
            src={video.url}
            playsInline
            autoPlay
            muted={isGlobalMuted}
            loop
            preload="metadata"
            onLoadedMetadata={(e) => {
              setDuration(e.currentTarget.duration);
              setError(false);
            }}
            onTimeUpdate={(e) => setPlayedSeconds(e.currentTarget.currentTime)}
            onError={() => {
              // Only set error if we actually have a URL but it fails
              if (video.url.split('?')[0] !== '/') {
                setError(true);
              }
            }}
            onClick={handleTogglePlay}
            className={`w-full h-full object-cover transition-all duration-700 ${isPlaying ? 'scale-100' : 'scale-105 blur-[2px] opacity-60'}`}
          >
            {video.captions && (
              <track kind="captions" src={video.captions} srcLang="pt-BR" label="Português" default />
            )}
          </video>
        )}
        
        {/* Error or Missing Video Fallback */}
        {(error || isUploading) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0c0d10] p-6 text-center border-2 border-dashed border-slate-800 m-2 rounded-xl">
            {isUploading ? (
              <>
                <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
                <p className="text-white font-bold">Processando vídeo... ({uploadPercent}%)</p>
                <p className="text-slate-500 text-xs mt-2">Isso pode levar alguns segundos dependendo do tamanho.</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-700">
                  <Camera className="w-8 h-8 text-slate-500" />
                </div>
                <h4 className="text-white font-bold mb-2">Vídeo não encontrado</h4>
                <p className="text-slate-400 text-xs mb-6 px-4">
                  Esta seção aguarda um vídeo real do produto para converter seus clientes.
                </p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-amber-500 text-black font-black text-[11px] uppercase tracking-widest rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <Upload className="w-4 h-4" />
                  Selecionar do meu PC
                </button>
              </>
            )}
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 pointer-events-none" />

        {/* Play Button Overlay (Centered) */}
        {!isPlaying && !error && !isUploading && (
          <div 
            onClick={handleTogglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px] group-hover:bg-black/10 transition-colors z-20"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 rounded-full bg-amber-400/90 text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300"
            >
              <Play className="w-7 h-7 fill-black translate-x-0.5" />
            </motion.div>
          </div>
        )}

        {/* Top Tag Overlay */}
        <div className="absolute top-4 left-4 z-30">
          <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-amber-400/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
            {video.tag}
          </span>
        </div>

        {/* Custom Controls Bar */}
        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/95 to-transparent z-30 space-y-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          
          {/* Progress Bar */}
          <div className="flex flex-col gap-1.5">
            <div 
              className="w-full h-1.5 bg-slate-700/60 rounded-full cursor-pointer relative overflow-hidden"
              onClick={(e) => {
                e.stopPropagation();
                handleSeek(e);
              }}
            >
              <motion.div 
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 absolute left-0 top-0"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-300">
              <span>{formatTime(playedSeconds)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Buttons Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTogglePlay();
                }}
                className="p-2 rounded-lg bg-white/10 hover:bg-amber-400 hover:text-black text-white transition-all cursor-pointer"
                title={isPlaying ? "Pausar" : "Reproduzir"}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMuteToggle();
                }}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                title={isGlobalMuted ? "Ativar som" : "Silenciar"}
              >
                {isGlobalMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFullscreen();
              }}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              title="Tela cheia"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-white font-bold text-lg font-serif-display">{video.title}</h3>
          <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">{video.subtitle}</p>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">
            {video.description}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold bg-emerald-500/5 border border-emerald-500/10 px-2 py-1 rounded-md self-start">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Resultado Comprovado</span>
        </div>
      </div>
    </motion.div>
  );
};

export const ProductVideoShowcase: React.FC = () => {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({
    video_1: '/video_1.mp4',
    video_2: '/video_2.mp4',
    video_3: '/video_3.mp4'
  });

  useEffect(() => {
    fetch('/api/video-urls')
      .then(res => res.json())
      .then(data => setVideoUrls(data))
      .catch(err => console.error('Failed to load dynamic video CDN URLs:', err));
  }, [refreshKey]);
  
  // Using absolute paths with timestamp for cache busting
  const videos: VideoItem[] = [
    {
      id: 'v1',
      url: videoUrls.video_1.includes('?') ? `${videoUrls.video_1}&t=${refreshKey}` : `${videoUrls.video_1}?t=${refreshKey}`,
      title: 'Apresentação Dyusar',
      subtitle: 'Tratamento de Salão em Casa',
      description: 'Conheça o kit Super Reconstrução que está revolucionando o cuidado capilar com resultados profissionais.',
      tag: 'Especialista Indica'
    },
    {
      id: 'v2',
      url: videoUrls.video_2.includes('?') ? `${videoUrls.video_2}&t=${refreshKey}` : `${videoUrls.video_2}?t=${refreshKey}`,
      title: 'Passo a Passo Real',
      subtitle: 'Aplicação e Textura',
      description: 'Veja como aplicar corretamente para obter a máxima performance de reconstrução e brilho.',
      tag: 'Tutorial Completo'
    },
    {
      id: 'v3',
      url: videoUrls.video_3.includes('?') ? `${videoUrls.video_3}&t=${refreshKey}` : `${videoUrls.video_3}?t=${refreshKey}`,
      title: 'Efeito Teia & Brilho',
      subtitle: 'Resultado de Transformação',
      description: 'Sinta a potência da máscara concentrada e o resultado de um fio 100% recuperado e selado.',
      tag: 'Resultado Real'
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-[#0c0d10] relative overflow-hidden border-t border-amber-500/10">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>O Produto em Ação</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-serif-display mb-4">
            Veja os Resultados com Seus Próprios Olhos
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Assista como o protocolo Dyusar Super Reconstrução transforma a fibra capilar, devolvendo vida, massa e brilho espelhado instantaneamente.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {videos.map((video, idx) => (
              <VideoCard 
                key={video.id} 
                video={video} 
                index={idx}
                isGlobalMuted={isMuted} 
                onMuteToggle={() => setIsMuted(!isMuted)}
                onGlobalPlay={(id) => setActiveVideoId(id)}
                isActive={activeVideoId === video.id}
                onRefresh={() => setRefreshKey(Date.now())}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom Call to Action */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <button
            onClick={() => {
              const element = document.getElementById('bundles');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black text-sm uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-amber-500/20 flex items-center gap-3 mx-auto cursor-pointer"
          >
            <span>Quero Estes Mesmos Resultados</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};



