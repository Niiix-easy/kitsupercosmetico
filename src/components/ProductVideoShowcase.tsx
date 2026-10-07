import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Maximize, 
  Loader2, 
  WifiOff, 
  RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '../utils/pixelTracking';
import { getVideoFromCache } from '../utils/videoCacheManager';
import { normalizeVideoAssetUrl } from '../utils/videoUrlResolver';
import { useVideoPreload } from '../hooks/useVideoPreload';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { prefetchVideoMetadata, prefetchImage } from '../utils/assetPrefetcher';

interface VideoItem {
  id: string;
  url: string;
  poster: string;
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
  activePlayingId: string | null;
  onCardPlay: (id: string) => void;
  index: number;
  preloadMode: 'none' | 'metadata' | 'auto';
  hasEnteredViewport: boolean;
  isOnline: boolean;
  onRetryConnection: () => void;
  isCheckingNetwork: boolean;
}> = ({ 
  video, 
  isGlobalMuted, 
  onMuteToggle,
  activePlayingId,
  onCardPlay,
  index,
  preloadMode,
  hasEnteredViewport,
  isOnline,
  onRetryConnection,
  isCheckingNetwork
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Normalize video and poster URLs across dev and production environments
  const normalizedVideoUrl = normalizeVideoAssetUrl(video.url, `${video.id}.mp4`);
  const normalizedPosterUrl = normalizeVideoAssetUrl(video.poster, `${video.id}_poster.webp`);
  
  const [currentSrc, setCurrentSrc] = useState<string>(normalizedVideoUrl);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Tracking states
  const [hasStarted, setHasStarted] = useState(false);
  const [hasReached50, setHasReached50] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);

  // Runtime verification: Check HTTP status (200/206 vs 404/500) and compare with public/ file
  useEffect(() => {
    let isCancelled = false;
    const targetPublicFile = `public/${video.id}.mp4`;

    console.log(`[VideoShowcase-Debug] Initializing asset resolution:`, {
      slot: video.id,
      rawUrl: video.url,
      normalizedUrl: normalizedVideoUrl,
      viteBaseUrl: import.meta.env.BASE_URL,
      expectedPublicFile: targetPublicFile
    });

    fetch(normalizedVideoUrl, { method: 'HEAD' })
      .then(res => {
        if (isCancelled) return;
        const contentType = res.headers.get('content-type') || 'unknown';
        const contentLength = res.headers.get('content-length') || 'unknown';

        if (res.status === 200 || res.status === 206) {
          console.log(`[VideoShowcase-Debug] ✅ Server verified asset for ${video.id}:`, {
            status: `${res.status} ${res.statusText}`,
            url: normalizedVideoUrl,
            contentType,
            contentLengthBytes: contentLength,
            localDiskOrigin: targetPublicFile
          });
        } else if (res.status === 404) {
          console.error(`[VideoShowcase-Error] ❌ Server returned 404 NOT FOUND for ${video.id}:`, {
            requestedUrl: normalizedVideoUrl,
            expectedFileLocation: targetPublicFile,
            note: 'File may be missing from public/ directory or dist/ directory during runtime.'
          });
          setLoadError(true);
        } else if (res.status >= 500) {
          console.error(`[VideoShowcase-Error] ❌ Server returned ${res.status} SERVER ERROR for ${video.id} (${normalizedVideoUrl}).`);
          setLoadError(true);
        }
      })
      .catch(err => {
        if (!isCancelled) {
          console.error(`[VideoShowcase-Error] Network reachability test failed for ${video.id}:`, {
            url: normalizedVideoUrl,
            error: err?.message || err
          });
        }
      });

    return () => { isCancelled = true; };
  }, [normalizedVideoUrl, video.id]);

  // Cache invalidation listener
  useEffect(() => {
    let isMounted = true;

    const handleCacheCleared = (e: Event) => {
      const customEv = e as CustomEvent;
      const target = customEv.detail?.target;
      if (target === 'all' || (typeof target === 'string' && target.includes(video.id))) {
        const freshUrl = `${normalizedVideoUrl.split('?')[0]}?bust=${Date.now()}`;
        console.log(`[VideoShowcase-Debug] Cache cleared event received, refreshing ${video.id}: ${freshUrl}`);
        setCurrentSrc(freshUrl);
        setLoadError(false);
      }
    };

    window.addEventListener('video-cache-cleared', handleCacheCleared);
    return () => {
      isMounted = false;
      window.removeEventListener('video-cache-cleared', handleCacheCleared);
    };
  }, [normalizedVideoUrl, video.id]);

  // When another video starts playing, pause this one cleanly
  useEffect(() => {
    if (activePlayingId && activePlayingId !== video.id && isPlaying) {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  }, [activePlayingId, video.id, isPlaying]);

  // Sync mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isGlobalMuted;
    }
  }, [isGlobalMuted]);

  // Analytics tracking
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
  }, [isPlaying, playedSeconds, duration, hasStarted, hasReached50, hasFinished, video.title]);

  // End-to-end user click execution ("Assistir")
  const handleTogglePlay = async () => {
    if (!isOnline) {
      onRetryConnection();
      return;
    }

    const el = videoRef.current;
    if (!el) return;

    console.log(`[VideoShowcase-Debug] User clicked Play/Assistir on ${video.id}:`, {
      paused: el.paused,
      readyState: el.readyState,
      muted: el.muted,
      currentSrc: el.currentSrc || currentSrc
    });

    if (el.paused) {
      // Announce to parent to coordinate single-video audio focus
      onCardPlay(video.id);

      // If the media element has not initialized its source yet or had a blob failure, assign normalized direct URL and load
      if (!el.src || el.src === '' || el.currentSrc === '' || el.currentSrc.startsWith('blob:')) {
        el.src = normalizedVideoUrl;
        el.load();
      }

      try {
        el.muted = isGlobalMuted;
        await el.play();
        setIsPlaying(true);
        setIsBuffering(false);
        setLoadError(false);
        console.log(`[VideoShowcase-Debug] ▶️ Video execution successful for ${video.id}`);
      } catch (err: any) {
        console.warn(`[VideoShowcase-Warn] Direct unmuted play failed for ${video.id}: ${err?.message}. Attempting muted fallback.`);
        // Fallback: If browser audio policy restricted unmuted playback, start muted
        try {
          el.muted = true;
          await el.play();
          setIsPlaying(true);
          setIsBuffering(false);
          setLoadError(false);
          console.log(`[VideoShowcase-Debug] ▶️ Video execution succeeded via muted fallback for ${video.id}`);
        } catch (fallbackErr: any) {
          console.error(`[VideoShowcase-Error] Final play execution failed for ${video.id}:`, fallbackErr);
          setLoadError(true);
        }
      }
    } else {
      el.pause();
      setIsPlaying(false);
      console.log(`[VideoShowcase-Debug] ⏸ Video paused for ${video.id}`);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const fraction = (e.clientX - rect.left) / rect.width;
      const targetTime = Math.max(0, Math.min(fraction * duration, duration));
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
          console.error(`Fullscreen Error: ${err.message}`);
        });
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
      {/* Video Container (Reels aspect 9:16) */}
      <div 
        className="relative aspect-[9/16] w-full bg-[#0a0a0c] overflow-hidden cursor-pointer group-hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]"
        onClick={handleTogglePlay}
      >
        {/* Video Element - Preload controlled by viewport entry */}
        <video
          ref={videoRef}
          src={currentSrc}
          poster={normalizedPosterUrl}
          width="480"
          height="854"
          playsInline
          muted={isGlobalMuted}
          loop
          preload={hasEnteredViewport ? 'metadata' : 'none'}
          onLoadedMetadata={(e) => {
            const metaDuration = e.currentTarget.duration;
            setDuration(metaDuration);
            setLoadError(false);
            console.log(`[VideoShowcase-Debug] 🎬 Metadata loaded for ${video.id}:`, {
              durationSecs: metaDuration.toFixed(1),
              resolution: `${e.currentTarget.videoWidth}x${e.currentTarget.videoHeight}`,
              src: e.currentTarget.currentSrc
            });
          }}
          onTimeUpdate={(e) => {
            setPlayedSeconds(e.currentTarget.currentTime);
            if (isBuffering) setIsBuffering(false);
          }}
          onWaiting={() => {
            if (isOnline) {
              console.log(`[VideoShowcase-Debug] ⏳ Video waiting/buffering for ${video.id} at time=${videoRef.current?.currentTime.toFixed(1)}s`);
              setIsBuffering(true);
            }
          }}
          onPlaying={() => {
            setIsBuffering(false);
            setIsPlaying(true);
            console.log(`[VideoShowcase-Debug] ▶️ Video active playing event for ${video.id}`);
          }}
          onCanPlay={() => {
            setIsBuffering(false);
          }}
          onCanPlayThrough={() => {
            setIsBuffering(false);
          }}
          onSeeked={() => {
            setIsBuffering(false);
          }}
          onPause={() => {
            setIsPlaying(false);
          }}
          onPlay={() => {
            setIsPlaying(true);
            setIsBuffering(false);
          }}
          onError={(e) => {
            const mediaErr = e.currentTarget.error;
            console.error(`[VideoShowcase-Error] 🚨 HTMLVideoElement error on ${video.id}:`, {
              code: mediaErr?.code,
              message: mediaErr?.message,
              currentSrc: e.currentTarget.currentSrc,
              readyState: e.currentTarget.readyState,
              networkState: e.currentTarget.networkState,
              publicFile: `public/${video.id}.mp4`
            });
            // If error was caused by a blob URL, immediately fall back to the direct faststart MP4 file!
            if (e.currentTarget.currentSrc?.startsWith('blob:') || currentSrc.startsWith('blob:')) {
              console.warn(`[VideoShowcase-Warn] Blob demuxer failed for ${video.id}. Falling back to direct static file: ${normalizedVideoUrl}`);
              setCurrentSrc(normalizedVideoUrl);
              if (videoRef.current) {
                videoRef.current.src = normalizedVideoUrl;
                videoRef.current.load();
              }
              return;
            }
            if (isOnline) {
              setLoadError(true);
            }
          }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        >
          {video.captions && (
            <track kind="captions" src={video.captions} srcLang="pt-BR" label="Português" default />
          )}
        </video>

        {/* Offline Overlay State */}
        {!isOnline && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-6 text-center">
            <img 
              src={normalizedPosterUrl} 
              alt={video.title} 
              className="absolute inset-0 w-full h-full object-cover opacity-25" 
            />
            <div className="relative z-10 flex flex-col items-center max-w-[200px]">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mb-3 text-rose-400">
                <WifiOff className="w-6 h-6" />
              </div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-1">
                Você Está Offline
              </h4>
              <p className="text-slate-400 text-[11px] leading-relaxed mb-4">
                Vídeo em pausa. Clique para reconectar.
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRetryConnection();
                }}
                disabled={isCheckingNetwork}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black text-[10px] font-black uppercase tracking-wider hover:brightness-110 transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
              >
                {isCheckingNetwork ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>Tentar Novamente</span>
              </button>
            </div>
          </div>
        )}

        {/* Custom Loading Spinner (Activated on 'waiting' event listener) */}
        <AnimatePresence>
          {isBuffering && isOnline && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[2px] pointer-events-none"
            >
              <div className="relative flex items-center justify-center mb-3">
                <div className="w-14 h-14 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
                <Sparkles className="w-5 h-5 text-amber-400 absolute animate-pulse" />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 border border-amber-500/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider shadow-lg">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>Carregando vídeo...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fallback Poster Preview if loading error occurs */}
        {loadError && isOnline && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0e0f14] p-4 text-center z-20">
            <img 
              src={normalizedPosterUrl} 
              alt={video.title} 
              className="w-full h-full object-cover absolute inset-0 opacity-40 blur-sm" 
            />
            <div className="relative z-10 p-4 rounded-xl bg-black/80 border border-amber-500/30 text-center max-w-[85%]">
              <Sparkles className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="text-white font-bold text-xs mb-1">Assistir Demonstração</p>
              <p className="text-slate-400 text-[11px]">Toque para recarregar o vídeo.</p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setLoadError(false);
                  setCurrentSrc(normalizedVideoUrl);
                  if (videoRef.current) {
                    videoRef.current.src = normalizedVideoUrl;
                    videoRef.current.load();
                    videoRef.current.play().then(() => {
                      setIsPlaying(true);
                      setIsBuffering(false);
                    }).catch(() => {});
                  }
                }}
                className="mt-3 px-3 py-1.5 rounded-lg bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider hover:bg-amber-400 transition-colors cursor-pointer"
              >
                Assistir Demonstração
              </button>
            </div>
          </div>
        )}

        {/* Gradient Overlay for Controls Visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />

        {/* Play Button Overlay (Centered, shown when paused and not buffering and online) */}
        {!isPlaying && !isBuffering && !loadError && isOnline && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/25 backdrop-blur-[1px] group-hover:bg-black/10 transition-colors z-20 pointer-events-none">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300 pointer-events-auto cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleTogglePlay();
              }}
              title="Assistir Vídeo"
            >
              <Play className="w-7 h-7 fill-black translate-x-0.5" />
            </motion.div>
          </div>
        )}

        {/* Top Tag Overlay */}
        <div className="absolute top-4 left-4 z-30 pointer-events-none">
          <span className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-amber-400/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider shadow-lg">
            {video.tag}
          </span>
        </div>

        {/* Custom Controls Bar */}
        <div 
          className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent z-30 space-y-3 opacity-90 group-hover:opacity-100 transition-opacity duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress Bar */}
          <div className="flex flex-col gap-1.5">
            <div 
              className="w-full h-1.5 bg-slate-700/60 rounded-full cursor-pointer relative overflow-hidden"
              onClick={handleSeek}
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
                onClick={handleTogglePlay}
                className="p-2 rounded-lg bg-white/10 hover:bg-amber-400 hover:text-black text-white transition-all cursor-pointer"
                title={isPlaying ? "Pausar" : "Assistir"}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              </button>

              <button
                onClick={onMuteToggle}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                title={isGlobalMuted ? "Ativar som" : "Silenciar"}
              >
                {isGlobalMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            <button
              onClick={handleFullscreen}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              title="Tela cheia"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content description */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-white font-bold text-lg font-serif-display">{video.title}</h3>
          <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">{video.subtitle}</p>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">
            {video.description}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1 rounded-md self-start">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Resultado Comprovado em Salão</span>
        </div>
      </div>
    </motion.div>
  );
};

export const ProductVideoShowcase: React.FC = () => {
  const showcaseRef = useRef<HTMLElement | null>(null);
  
  // Custom Hook: Defer metadata loading with Intersection Observer API
  const { hasEnteredViewport, preloadMode } = useVideoPreload(showcaseRef, {
    rootMargin: '450px',
    threshold: 0.05,
  });

  // Custom Hook: Network connection monitor
  const { isOnline, isChecking, checkConnection } = useNetworkStatus();

  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({
    video_1: '/video_1.mp4',
    video_2: '/video_2.mp4',
    video_3: '/video_3.mp4'
  });

  // Pre-warm showcase video metadata when user approaches section
  useEffect(() => {
    if (hasEnteredViewport) {
      prefetchVideoMetadata(videoUrls.video_1 || '/video_1.mp4');
      prefetchVideoMetadata(videoUrls.video_2 || '/video_2.mp4');
      prefetchVideoMetadata(videoUrls.video_3 || '/video_3.mp4');
    }
  }, [hasEnteredViewport, videoUrls]);

  // Proactively clear corrupted or deprecated video caches from old service workers or blobs
  useEffect(() => {
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.delete('dyusar-videos-cache-v1');
      caches.delete('dyusar-video-cache-v1');
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
          for (const reg of regs) {
            reg.update();
          }
        });
      }
    }
  }, []);

  useEffect(() => {
    fetch('/api/video-urls')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object') {
          console.log('[VideoShowcase-Debug] Fetched dynamic video URLs configuration:', data);
          setVideoUrls(prev => ({ ...prev, ...data }));
        }
      })
      .catch(err => console.error('[VideoShowcase-Error] Failed to load video URLs endpoint:', err));
  }, []);

  const handleCardPlay = useCallback((id: string) => {
    setActivePlayingId(id);
  }, []);

  const videos: VideoItem[] = [
    {
      id: 'video_1',
      url: videoUrls.video_1 || '/video_1.mp4',
      poster: '/video_1_poster.webp',
      title: 'Apresentação Dyusar',
      subtitle: 'Tratamento de Salão em Casa',
      description: 'Conheça o kit Super Reconstrução que está revolucionando o cuidado capilar com resultados profissionais imediatos.',
      tag: 'Especialista Indica'
    },
    {
      id: 'video_2',
      url: videoUrls.video_2 || '/video_2.mp4',
      poster: '/video_2_poster.webp',
      title: 'Passo a Passo Real',
      subtitle: 'Aplicação e Textura',
      description: 'Veja como aplicar corretamente para obter a máxima performance de reconstrução, maciez e brilho intenso.',
      tag: 'Tutorial Completo'
    },
    {
      id: 'video_3',
      url: videoUrls.video_3 || '/video_3.mp4',
      poster: '/video_3_poster.webp',
      title: 'Efeito Teia & Brilho',
      subtitle: 'Resultado de Transformação',
      description: 'Sinta a potência da máscara concentrada e o resultado de um fio 100% recuperado, alinhado e selado.',
      tag: 'Resultado Real'
    }
  ];

  return (
    <section 
      id="video-showcase"
      data-section="video-showcase"
      ref={showcaseRef} 
      className="py-16 lg:py-24 bg-[#0c0d10] relative overflow-hidden border-t border-amber-500/10"
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Offline Banner Notification */}
        <AnimatePresence>
          {!isOnline && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between flex-wrap gap-4 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400">
                  <WifiOff className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold flex items-center gap-2">
                    <span>Conexão Offline Detectada</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-mono uppercase">Sem internet</span>
                  </h4>
                  <p className="text-slate-300 text-xs mt-0.5">
                    Os vídeos pausaram para poupar seus dados. Eles serão restaurados automaticamente assim que o sinal voltar.
                  </p>
                </div>
              </div>

              <button
                onClick={checkConnection}
                disabled={isChecking}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-rose-500/20 cursor-pointer disabled:opacity-50"
              >
                {isChecking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>Verificar Conexão</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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
                activePlayingId={activePlayingId}
                onCardPlay={handleCardPlay}
                preloadMode={preloadMode}
                hasEnteredViewport={hasEnteredViewport}
                isOnline={isOnline}
                onRetryConnection={checkConnection}
                isCheckingNetwork={isChecking}
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
