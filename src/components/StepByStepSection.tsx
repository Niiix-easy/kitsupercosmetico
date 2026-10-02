import React, { useState, useRef } from 'react';
import { TREATMENT_STEPS } from '../data/productData';
import { Clock, Sparkles, CheckCircle2, ChevronRight, Info, Camera, ZoomIn, X, AlertTriangle } from 'lucide-react';
import { saveStoredKitImage } from '../utils/kitImageStorage';
import { VisualStepByStep } from './VisualStepByStep';

const DEFAULT_STEP_PHOTOS: Record<string, string> = {
  '01': '/images/shampoo-reparador.webp?v=luxury4',
  '02': '/images/queratina-cauterizacao.webp?v=luxury4',
  '03': '/images/mascara-super-reconstrucao.webp?v=luxury4',
  '04': '/images/leave-in-selante.webp?v=luxury4'
};

export const StepByStepSection: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState(1); // default on step 2 (hero product)
  const [customPhotos, setCustomPhotos] = useState<Record<string, string>>(DEFAULT_STEP_PHOTOS);
  const [zoomImage, setZoomImage] = useState<{ url: string; title: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeStep = TREATMENT_STEPS[activeStepIndex];
  const currentPhoto = customPhotos[activeStep.number] || DEFAULT_STEP_PHOTOS[activeStep.number];

  const handleStepFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: 'Selecione um arquivo de imagem válido (PNG, JPG ou WEBP).' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'O arquivo excede o limite máximo permitido de 10MB.' });
      return;
    }

    setIsUploading(true);

    const objectUrl = URL.createObjectURL(file);
    const imgTest = new Image();
    imgTest.onload = () => {
      const w = imgTest.naturalWidth;
      const h = imgTest.naturalHeight;
      const ratio = w / h;
      URL.revokeObjectURL(objectUrl);

      if (ratio < 0.85 || ratio > 1.18) {
        setIsUploading(false);
        setFeedback({
          type: 'error',
          message: `Proporção detectada: ${ratio.toFixed(2)}:1 (${w}x${h}px). Para manter o card alinhado, envie uma imagem quadrada (1:1).`
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        if (typeof e.target?.result === 'string') {
          const stepKey = `passo${Number(activeStep.number)}`;
          const res = await saveStoredKitImage(stepKey, e.target.result);
          setIsUploading(false);

          if (!res.success) {
            setFeedback({ type: 'error', message: res.error || 'Erro ao atualizar foto do passo.' });
          } else {
            setCustomPhotos((prev) => ({
              ...prev,
              [activeStep.number]: res.url || e.target?.result as string
            }));
            setFeedback({ type: 'success', message: `Foto do Passo ${Number(activeStep.number)} atualizada com sucesso!` });
          }
        }
      };
      reader.readAsDataURL(file);
    };

    imgTest.onerror = () => {
      setIsUploading(false);
      URL.revokeObjectURL(objectUrl);
      setFeedback({ type: 'error', message: 'Não foi possível ler a imagem selecionada.' });
    };

    imgTest.src = objectUrl;
  };

  return (
    <section id="tratamento" className="py-16 lg:py-24 bg-[#0c0d10] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase font-bold tracking-widest text-[#d4af37]">
            Protocolo de Salão na Sua Casa
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2 font-serif-display">
            O Segredo dos 4 Passos da Super Reconstrução
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-3 font-sans-body">
            Desenvolvido por químicos e mestres cabeleireiros para reconstruir a fibra capilar de dentro para fora, desde a medula e o córtex até o alinhamento das cutículas.
          </p>
        </div>

        {/* Step Navigation Pills */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto mb-8">
          {TREATMENT_STEPS.map((step, idx) => {
            const isActive = activeStepIndex === idx;
            return (
              <button
                key={step.number}
                onClick={() => setActiveStepIndex(idx)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'bg-gradient-to-b from-[#242217] to-[#161510] border-amber-400 shadow-lg shadow-amber-500/10 -translate-y-1'
                    : 'bg-[#14151b] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xl font-black font-mono ${isActive ? 'text-amber-400' : 'text-slate-600'}`}>
                    {step.number}
                  </span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-black/40 text-amber-300/90 border border-amber-500/20">
                    {step.tag}
                  </span>
                </div>
                <div className="mt-3">
                  <p className={`text-xs sm:text-sm font-bold line-clamp-1 ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {step.name}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{step.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Step Detailed Card */}
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-[#171922] via-[#121319] to-[#171922] border-2 border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 blur-3xl pointer-events-none" />

          {/* Hidden File Input for Direct Upload */}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleStepFileSelect(file);
              e.target.value = '';
            }}
          />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left badge, photo & title */}
            <div className="md:col-span-5 flex flex-col sm:flex-row md:flex-col items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-slate-800 pb-6 md:pb-0 md:pr-6 gap-4">
              <div className="relative w-36 h-48 rounded-xl bg-gradient-to-b from-[#181922] to-black border border-amber-500/40 p-2.5 flex items-center justify-center shrink-0 shadow-xl group overflow-hidden">
                <img
                  key={currentPhoto}
                  src={currentPhoto}
                  alt={activeStep.name}
                  loading="lazy"
                  className="max-h-full max-w-full object-contain filter drop-shadow-2xl group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                  onClick={() => setZoomImage({ url: currentPhoto, title: activeStep.name })}
                />

                {/* Overlay Action Buttons */}
                <div className="absolute top-2 right-2 flex items-center gap-1 z-20">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    title="Substituir foto deste passo (fazer upload de PNG/JPG 1:1)"
                    className="p-1 rounded-md bg-black/80 hover:bg-amber-400 hover:text-black border border-white/20 text-slate-300 transition-colors shadow-md cursor-pointer flex items-center gap-1 text-[9px] font-bold"
                  >
                    <Camera className="w-3 h-3" />
                    <span className="hidden sm:inline">{isUploading ? '...' : 'Trocar'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setZoomImage({ url: currentPhoto, title: activeStep.name })}
                    title="Ampliar foto"
                    className="p-1 rounded-md bg-black/80 hover:bg-slate-800 border border-white/20 text-slate-300 transition-colors shadow-md cursor-pointer"
                  >
                    <ZoomIn className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div>
                <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono">
                  {activeStep.number}
                </span>
                <span className="text-xs font-bold text-amber-300/80 uppercase tracking-widest block">
                  Passo {Number(activeStep.number)} do Protocolo
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-1 font-serif-display">
                  {activeStep.name}
                </h3>
                <p className="text-xs text-amber-200/70 font-mono mt-0.5">
                  {activeStep.subtitle}
                </p>

                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{activeStep.tag}</span>
                </div>
              </div>
            </div>

            {/* Right: Action & Application Instructions */}
            <div className="md:col-span-7 flex flex-col gap-4 text-xs sm:text-sm">
              <VisualStepByStep activeStep={activeStepIndex} />
              
              <div className="p-4 rounded-xl bg-black/40 border border-slate-800">
                <h4 className="font-bold text-white flex items-center gap-2 text-sm text-amber-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  Mecanismo de Ação:
                </h4>
                <p className="text-slate-300 mt-1.5 leading-relaxed">
                  {activeStep.action}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <h4 className="font-bold text-white flex items-center gap-2 text-sm text-amber-300">
                  <Info className="w-4 h-4 text-amber-400" />
                  Modo de Uso Profissional:
                </h4>
                <p className="text-slate-300 mt-1.5 leading-relaxed">
                  {activeStep.howToUse}
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Upload Feedback Toast */}
      {feedback && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#181922] border border-slate-700 rounded-xl p-3.5 shadow-2xl flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2 text-xs">
            {feedback.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span className={feedback.type === 'error' ? 'text-rose-300' : 'text-emerald-300'}>
              {feedback.message}
            </span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Image Zoom Modal */}
      {zoomImage && (
        <div 
          onClick={() => setZoomImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn cursor-zoom-out"
        >
          <div className="relative max-w-lg w-full bg-[#14151b] border border-amber-500/40 rounded-2xl p-4 shadow-2xl flex flex-col items-center">
            <button
              onClick={() => setZoomImage(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h4 className="text-base font-bold text-white font-serif-display mb-3 text-center">
              {zoomImage.title}
            </h4>

            <div className="w-full flex items-center justify-center p-4 bg-black rounded-xl">
              <img
                src={zoomImage.url}
                alt={zoomImage.title}
                className="max-h-[60vh] max-w-full object-contain filter drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
