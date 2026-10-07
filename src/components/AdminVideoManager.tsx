import React, { useState, useEffect, useRef } from 'react';
import { Video, Upload, Trash2, Loader2, Play, Pause, Sparkles, Check, Link, Globe, RefreshCw, Database, HardDriveDownload } from 'lucide-react';
import { clearSpecificVideoCache, clearAllVideoCaches, listCachedVideos, CachedVideoInfo } from '../utils/videoCacheManager';

interface VideoSlot {
  id: string;
  filename: string;
  title: string;
  subtitle: string;
  tag: string;
}

export const AdminVideoManager: React.FC = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [successStates, setSuccessStates] = useState<Record<string, boolean>>({});
  const [videoExists, setVideoExists] = useState<Record<string, boolean>>({});
  const [posterExists, setPosterExists] = useState<Record<string, boolean>>({});
  const [activePreviewVideoId, setActivePreviewVideoId] = useState<string | null>(null);
  const [cachedVideos, setCachedVideos] = useState<CachedVideoInfo[]>([]);
  const [cacheClearing, setCacheClearing] = useState<Record<string, boolean>>({});
  const [allCacheClearing, setAllCacheClearing] = useState(false);
  const [cacheFeedback, setCacheFeedback] = useState<string | null>(null);

  const [youtubeUrls, setYoutubeUrls] = useState<Record<string, string>>({
    video_1: 'https://youtube.com/shorts/64WID8ScO8s',
    video_2: 'https://youtube.com/shorts/8QcoMz2qwzk',
    video_3: 'https://youtube.com/shorts/tTM-mH4tqps'
  });
  const [activeImportSlot, setActiveImportSlot] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<Record<string, number>>({
    video_1: Date.now(),
    video_2: Date.now(),
    video_3: Date.now(),
  });
  const fileInputRefs = {
    video_1: useRef<HTMLInputElement>(null),
    video_2: useRef<HTMLInputElement>(null),
    video_3: useRef<HTMLInputElement>(null),
  };

  const slots: VideoSlot[] = [
    {
      id: 'video_1',
      filename: 'video_1.mp4',
      title: 'Apresentação Dyusar',
      subtitle: 'Tratamento de Salão em Casa',
      tag: 'Especialista Indica'
    },
    {
      id: 'video_2',
      filename: 'video_2.mp4',
      title: 'Passo a Passo Real',
      subtitle: 'Aplicação e Textura',
      tag: 'Tutorial Completo'
    },
    {
      id: 'video_3',
      filename: 'video_3.mp4',
      title: 'Efeito Teia & Brilho',
      subtitle: 'Resultado de Transformação',
      tag: 'Resultado Real'
    }
  ];

  const updateCacheList = async () => {
    try {
      const list = await listCachedVideos();
      setCachedVideos(list);
    } catch (e) {
      console.warn('Error reading cache list:', e);
    }
  };

  useEffect(() => {
    // Check which videos and posters exist on mount
    slots.forEach(async (slot) => {
      try {
        const res = await fetch(`/${slot.filename}?t=${Date.now()}`, { method: 'HEAD' });
        setVideoExists(prev => ({ ...prev, [slot.id]: res.ok }));

        const posterRes = await fetch(`/${slot.id}_poster.webp?t=${Date.now()}`, { method: 'HEAD' });
        setPosterExists(prev => ({ ...prev, [slot.id]: posterRes.ok }));
      } catch {
        setVideoExists(prev => ({ ...prev, [slot.id]: false }));
        setPosterExists(prev => ({ ...prev, [slot.id]: false }));
      }
    });

    updateCacheList();
  }, []);

  const handleUpload = async (slotId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      alert("O arquivo excede o limite de 100MB.");
      return;
    }

    setLoadingStates(prev => ({ ...prev, [slotId]: true }));
    setUploadProgress(prev => ({ ...prev, [slotId]: 0 }));

    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks (extremely safe for Nginx limits)
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

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
        setUploadProgress(prev => ({ ...prev, [slotId]: percent }));

        if (data.completed) {
          // Clear CacheStorage for this video so users see the fresh version immediately
          await clearSpecificVideoCache(slotId);
          await updateCacheList();

          setRefreshKey(prev => ({ ...prev, [slotId]: Date.now() }));
          setVideoExists(prev => ({ ...prev, [slotId]: true }));
          setPosterExists(prev => ({ ...prev, [slotId]: true }));
          setSuccessStates(prev => ({ ...prev, [slotId]: true }));
          setTimeout(() => {
            setSuccessStates(prev => ({ ...prev, [slotId]: false }));
          }, 3000);
        }
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      alert(`Falha no upload: ${err.message || 'Conexão recusada.'}`);
    } finally {
      setLoadingStates(prev => ({ ...prev, [slotId]: false }));
    }
  };

  const handleImportYouTube = async (slotId: string) => {
    const url = youtubeUrls[slotId];
    if (!url || !url.trim()) {
      alert("Por favor, insira um link válido do YouTube Shorts.");
      return;
    }

    setLoadingStates(prev => ({ ...prev, [slotId]: true }));
    try {
      const response = await fetch('/api/import-youtube-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: slotId, youtubeUrl: url.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro ao importar vídeo' }));
        throw new Error(errorData.error || 'Erro no processamento do vídeo.');
      }

      // Clear CacheStorage for this video so users see the fresh version immediately
      await clearSpecificVideoCache(slotId);
      await updateCacheList();

      setRefreshKey(prev => ({ ...prev, [slotId]: Date.now() }));
      setVideoExists(prev => ({ ...prev, [slotId]: true }));
      setPosterExists(prev => ({ ...prev, [slotId]: true }));
      setSuccessStates(prev => ({ ...prev, [slotId]: true }));
      setActiveImportSlot(null);
      setTimeout(() => {
        setSuccessStates(prev => ({ ...prev, [slotId]: false }));
      }, 3000);
    } catch (err: any) {
      console.error("YouTube import error:", err);
      alert(`Falha ao importar do YouTube: ${err.message || 'Erro de conexão.'}`);
    } finally {
      setLoadingStates(prev => ({ ...prev, [slotId]: false }));
    }
  };

  const handleClearSpecificCache = async (slotId: string) => {
    setCacheClearing(prev => ({ ...prev, [slotId]: true }));
    try {
      const cleared = await clearSpecificVideoCache(slotId);
      await updateCacheList();
      setRefreshKey(prev => ({ ...prev, [slotId]: Date.now() }));
      setCacheFeedback(`Cache do ${slotId} limpo com sucesso!`);
      setTimeout(() => setCacheFeedback(null), 3000);
    } catch (err) {
      console.error('Error clearing cache:', err);
    } finally {
      setCacheClearing(prev => ({ ...prev, [slotId]: false }));
    }
  };

  const handleClearAllCaches = async () => {
    if (!confirm('Deseja limpar todos os vídeos em cache do navegador? O aplicativo fará o download novamente no próximo acesso.')) {
      return;
    }

    setAllCacheClearing(true);
    try {
      await clearAllVideoCaches();
      await updateCacheList();
      setRefreshKey({
        video_1: Date.now(),
        video_2: Date.now(),
        video_3: Date.now(),
      });
      setCacheFeedback('Todo o CacheStorage de vídeos foi limpo!');
      setTimeout(() => setCacheFeedback(null), 3500);
    } catch (err) {
      console.error('Error clearing all cache:', err);
    } finally {
      setAllCacheClearing(false);
    }
  };

  const handleDelete = async (slotId: string) => {
    if (!confirm("Tem certeza que deseja excluir este vídeo? A seção exibirá o estado padrão de vídeo não encontrado.")) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, [slotId]: true }));
    try {
      const response = await fetch('/api/delete-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: slotId })
      });

      if (response.ok) {
        await clearSpecificVideoCache(slotId);
        await updateCacheList();
        setVideoExists(prev => ({ ...prev, [slotId]: false }));
        setPosterExists(prev => ({ ...prev, [slotId]: false }));
        setRefreshKey(prev => ({ ...prev, [slotId]: Date.now() }));
      } else {
        alert("Erro ao excluir vídeo.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Falha de conexão.");
    } finally {
      setLoadingStates(prev => ({ ...prev, [slotId]: false }));
    }
  };

  const isSlotCached = (slotId: string) => {
    return cachedVideos.some(v => v.url.includes(slotId));
  };

  return (
    <div className="p-6 rounded-2xl bg-[#14151b] border border-slate-800 shadow-2xl mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Video className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-lg text-white">Gerenciador de Vídeos & CacheStorage</h3>
          </div>
          <p className="text-xs text-slate-400">
            Gerencie os vídeos verticais da seção "O Produto em Ação" e controle programaticamente o CacheStorage dos clientes.
          </p>
        </div>

        {/* Global Cache Control Bar */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleClearAllCaches}
            disabled={allCacheClearing}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg disabled:opacity-50"
            title="Limpar todos os vídeos salvos no CacheStorage local"
          >
            {allCacheClearing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Limpar Todo o Cache</span>
          </button>
        </div>
      </div>

      {/* Cache Feedback Toast */}
      {cacheFeedback && (
        <div className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4" />
          <span>{cacheFeedback}</span>
        </div>
      )}

      {/* Cache Status Overview */}
      <div className="mb-6 p-4 rounded-xl bg-[#0e0f14] border border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <HardDriveDownload className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-white">Status do CacheStorage:</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[11px] font-mono text-amber-300">
            {cachedVideos.length} vídeo(s) em cache local
          </span>
        </div>
        <p className="text-[11px] text-slate-400">
          A API de CacheStorage garante carregamento instantâneo sem travamentos para os visitantes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {slots.map((slot) => {
          const isUploading = loadingStates[slot.id];
          const isSuccess = successStates[slot.id];
          const exists = videoExists[slot.id];
          const hasPoster = posterExists[slot.id];
          const isClearingCache = cacheClearing[slot.id];
          const cached = isSlotCached(slot.id);
          const videoUrl = `/${slot.filename}?t=${refreshKey[slot.id]}`;
          const posterUrl = `/${slot.id}_poster.webp?t=${refreshKey[slot.id]}`;

          return (
            <div key={slot.id} className="p-4 rounded-xl bg-[#1a1c25] border border-slate-800/80 hover:border-amber-500/20 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-400/10 text-amber-400 uppercase">
                    {slot.tag}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {cached ? (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400 uppercase">
                        <Database className="w-2.5 h-2.5" />
                        Cached
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] font-mono text-slate-400 uppercase">
                        Direto
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-slate-500">
                      {slot.filename}
                    </span>
                  </div>
                </div>

                <h4 className="font-bold text-sm text-white mb-1">{slot.title}</h4>
                <p className="text-xs text-slate-400 mb-4">{slot.subtitle}</p>

                {/* Video Preview Aspect 9/16 */}
                <div className="relative aspect-[9/16] w-full max-w-[180px] mx-auto bg-black rounded-lg overflow-hidden border border-slate-800 mb-4 group/preview">
                  {exists ? (
                    activePreviewVideoId === slot.id ? (
                      <video
                        key={videoUrl}
                        src={videoUrl}
                        className="w-full h-full object-cover"
                        controls
                        autoPlay
                        muted
                        preload="metadata"
                      />
                    ) : hasPoster ? (
                      <div className="relative w-full h-full cursor-pointer" onClick={() => setActivePreviewVideoId(slot.id)}>
                        <img
                          src={posterUrl}
                          alt={`Thumbnail ${slot.title}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {/* Play button overlay */}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover/preview:bg-black/55 transition-colors">
                          <div className="w-12 h-12 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-lg group-hover/preview:scale-110 transition-transform duration-300">
                            <Play className="w-5 h-5 fill-black translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <video
                        key={videoUrl}
                        src={videoUrl}
                        className="w-full h-full object-cover"
                        controls
                        muted
                        preload="metadata"
                      />
                    )
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-lg">
                      <Video className="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Sem vídeo</span>
                    </div>
                  )}

                  {isUploading && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-3">
                      <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-2" />
                      <span className="text-[10px] font-bold text-amber-300 uppercase animate-pulse">
                        Enviando ({uploadProgress[slot.id] || 0}%)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 mt-4">
                <input
                  type="file"
                  accept="video/*"
                  ref={fileInputRefs[slot.id as keyof typeof fileInputRefs]}
                  className="hidden"
                  onChange={(e) => handleUpload(slot.id, e)}
                />

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => fileInputRefs[slot.id as keyof typeof fileInputRefs].current?.click()}
                    disabled={isUploading}
                    className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      isSuccess
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 col-span-2'
                        : 'bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/20'
                    }`}
                  >
                    {isSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Atualizado!</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>{exists ? 'Do PC' : 'Enviar PC'}</span>
                      </>
                    )}
                  </button>

                  {!isSuccess && (
                    <button
                      onClick={() => setActiveImportSlot(activeImportSlot === slot.id ? null : slot.id)}
                      disabled={isUploading}
                      className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        activeImportSlot === slot.id
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>YouTube</span>
                    </button>
                  )}
                </div>

                {/* Specific Cache Clear Button */}
                <button
                  onClick={() => handleClearSpecificCache(slot.id)}
                  disabled={isClearingCache || isUploading}
                  className="w-full py-1.5 px-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Remove este arquivo específico do CacheStorage dos clientes"
                >
                  {isClearingCache ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                  <span>Limpar Cache do Vídeo</span>
                </button>

                {/* YouTube Link Input Accordion */}
                {activeImportSlot === slot.id && (
                  <div className="p-3 bg-black/60 rounded-xl border border-red-500/30 space-y-2 mt-2 animate-in fade-in zoom-in-95 duration-200">
                    <label className="text-[10px] font-bold text-red-400 uppercase flex items-center gap-1">
                      <Link className="w-3 h-3" />
                      Link do YouTube Shorts
                    </label>
                    <input
                      type="text"
                      placeholder="https://youtube.com/shorts/..."
                      value={youtubeUrls[slot.id] || ''}
                      onChange={(e) => setYoutubeUrls(prev => ({ ...prev, [slot.id]: e.target.value }))}
                      className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                    />
                    <button
                      onClick={() => handleImportYouTube(slot.id)}
                      disabled={isUploading}
                      className="w-full py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-red-600/20 disabled:opacity-50"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Baixando e Convertendo...</span>
                        </>
                      ) : (
                        <span>Baixar & Aplicar Vídeo</span>
                      )}
                    </button>
                  </div>
                )}

                {exists && (
                  <button
                    onClick={() => handleDelete(slot.id)}
                    disabled={isUploading}
                    className="w-full py-2 px-3 rounded-lg bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/10 hover:border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir Vídeo</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
