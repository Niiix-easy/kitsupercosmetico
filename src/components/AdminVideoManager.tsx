import React, { useState, useEffect, useRef } from 'react';
import { Video, Upload, Trash2, Loader2, Play, Pause, Sparkles, Check } from 'lucide-react';

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

  return (
    <div className="p-6 rounded-2xl bg-[#14151b] border border-slate-800 shadow-2xl mt-8">
      <div className="flex items-center gap-2 mb-6">
        <Video className="w-5 h-5 text-amber-400" />
        <h3 className="font-bold text-lg">Gerenciador de Vídeos (Showcase)</h3>
      </div>
      <p className="text-xs text-slate-400 mb-6">
        Gerencie os 3 slots de vídeo em formato vertical Reels (9:16) exibidos na seção de demonstração do produto.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {slots.map((slot) => {
          const isUploading = loadingStates[slot.id];
          const isSuccess = successStates[slot.id];
          const exists = videoExists[slot.id];
          const hasPoster = posterExists[slot.id];
          const videoUrl = `/${slot.filename}?t=${refreshKey[slot.id]}`;
          const posterUrl = `/${slot.id}_poster.webp?t=${refreshKey[slot.id]}`;

          return (
            <div key={slot.id} className="p-4 rounded-xl bg-[#1a1c25] border border-slate-800/80 hover:border-amber-500/20 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-400/10 text-amber-400 uppercase">
                    {slot.tag}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {slot.filename}
                  </span>
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

                <button
                  onClick={() => fileInputRefs[slot.id as keyof typeof fileInputRefs].current?.click()}
                  disabled={isUploading}
                  className={`w-full py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isSuccess
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/20'
                  }`}
                >
                  {isSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Atualizado!</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>{exists ? 'Substituir' : 'Enviar Vídeo'}</span>
                    </>
                  )}
                </button>

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
