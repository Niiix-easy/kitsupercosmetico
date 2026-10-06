import React, { useState, useRef, useEffect } from 'react';
import { BEFORE_AFTER_CASES } from '../data/productData';
import { Check, AlertTriangle, Camera, Upload, RotateCcw, ImageIcon, Loader2 } from 'lucide-react';
import {
  compressImage,
  saveCustomCaseImage,
  loadCustomCaseImages,
  removeCustomCaseImage
} from '../utils/imageStorage';

export const BeforeAfterSlider: React.FC = () => {
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const [customImages, setCustomImages] = useState<Record<number, string>>({});
  const [showGallery, setShowGallery] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load custom saved images safely from IndexedDB / Storage on mount
  useEffect(() => {
    loadCustomCaseImages().then((loaded) => {
      if (loaded) {
        setCustomImages(loaded);
      }
    }).catch(err => console.error('Error loading custom images', err));
  }, []);

  const activeCase = BEFORE_AFTER_CASES[selectedCaseIndex];
  
  // Active image source (custom uploaded image takes precedence)
  const currentDisplayImage = customImages[selectedCaseIndex] || activeCase.afterImage;

  // Handle direct file upload from user's device with automatic canvas compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        // Compress image to avoid QuotaExceededError (typically reduces size by 95%)
        const compressedDataUrl = await compressImage(file, 1200, 0.82);
        const updated = { ...customImages, [selectedCaseIndex]: compressedDataUrl };
        setCustomImages(updated);
        await saveCustomCaseImage(selectedCaseIndex, compressedDataUrl);
      } catch (err) {
        console.error('Error processing uploaded image:', err);
      } finally {
        setIsCompressing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  // Preset gallery choices
  const PRESET_GALLERY = [
    { title: 'Cabelo Loiro Antes & Depois (0123)', url: '/images/blonde-hair-case.png?v=img0123_v1' },
    { title: 'Cabelo Iluminado + Círculos Duplos', url: '/images/brunette-hair-case.png?v=img0123_v1' },
    { title: 'Atendimento Profissional em Lavatório', url: '/images/hair-salon-professional.webp' },
    { title: 'Kit Super Reconstrução Destaque', url: '/images/kit-super-reconstrucao-hero.jpg' }
  ];

  const handleSelectPreset = async (url: string) => {
    const updated = { ...customImages, [selectedCaseIndex]: url };
    setCustomImages(updated);
    await saveCustomCaseImage(selectedCaseIndex, url);
    setShowGallery(false);
  };

  const handleResetImage = async () => {
    const updated = { ...customImages };
    delete updated[selectedCaseIndex];
    setCustomImages(updated);
    await removeCustomCaseImage(selectedCaseIndex);
  };

  return (
    <section id="antes-depois" className="py-16 lg:py-24 bg-[#0f1015] border-t border-amber-500/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
            Eficácia Comprovada em Lavatório
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2 font-serif-display">
            Resultados Reais: Análise de Casos Clínicos
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-3 font-sans-body">
            Confira a análise fotográfica em diagnóstico microscópico da fibra capilar após o tratamento com o protocolo Dyusar.
          </p>

          {/* Case Filter Selector */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            {BEFORE_AFTER_CASES.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedCaseIndex(idx);
                  setShowGallery(false);
                }}
                className={`px-5 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                  selectedCaseIndex === idx
                    ? 'bg-amber-400 text-black shadow-lg shadow-amber-500/25 ring-2 ring-amber-300 scale-105'
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Showcase & Diagnostics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Visual Showcase Box (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            
            {/* Image Container */}
            <div
              className="relative w-full aspect-square sm:aspect-[4/3] max-w-[580px] rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-2xl bg-black"
            >
              <img
                key={`case-img-${selectedCaseIndex}-${currentDisplayImage}`}
                src={currentDisplayImage}
                alt={activeCase.title}
                loading="lazy"
                decoding="async"
                width="600"
                height="450"
                className="w-full h-full object-cover object-center transition-transform duration-300"
              />
              
              {/* Badge Overlay */}
              <div className="absolute top-4 left-4 bg-amber-400 text-black text-xs font-black px-3 py-1 rounded-md shadow-lg uppercase tracking-wider backdrop-blur-sm">
                Diagnóstico nº {selectedCaseIndex + 1}
              </div>

              <div className="absolute bottom-4 right-4 bg-black/85 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-amber-400/40 shadow-md backdrop-blur-md">
                ✓ Análise Microscópica 3D
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-2.5 flex items-center gap-1.5 font-mono">
              <Check className="w-3.5 h-3.5 text-amber-400" />
              <span>Resultados reais de salão homologados após o tratamento Dyusar</span>
            </p>
          </div>


          {/* Diagnostic & Clinical Data Card (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-center bg-[#151720] border border-amber-500/30 rounded-2xl p-6 sm:p-7 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                Caso Clínico #{selectedCaseIndex + 1}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {activeCase.badge}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white mt-2 font-serif-display">
              {activeCase.title}
            </h3>

            <div className="mt-4 space-y-3 text-xs sm:text-sm">
              <div className="p-3 rounded-lg bg-black/40 border border-slate-800">
                <span className="text-slate-400 font-semibold block text-xs">Perfil e Histórico:</span>
                <p className="text-slate-200 mt-0.5">{activeCase.hairProfile}</p>
                <span className="text-amber-300 text-[11px] font-mono mt-1 block">Tempo: {activeCase.sessionCount}</span>
              </div>

              <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/30">
                <span className="text-red-400 font-semibold flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Diagnóstico Inicial:
                </span>
                <p className="text-slate-300 mt-0.5">{activeCase.diagnostic}</p>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30">
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5 text-xs">
                  <Check className="w-3.5 h-3.5" />
                  Resultado com Dyusar:
                </span>
                <p className="text-slate-200 mt-0.5">{activeCase.result}</p>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-800 text-center">
              <div>
                <span className="text-xl font-black text-amber-300 font-mono">97%</span>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Menos Quebra</p>
              </div>
              <div>
                <span className="text-xl font-black text-emerald-400 font-mono">1ª Apl.</span>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Fim do Elástico</p>
              </div>
              <div>
                <span className="text-xl font-black text-amber-300 font-mono">3x</span>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Mais Brilho</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
