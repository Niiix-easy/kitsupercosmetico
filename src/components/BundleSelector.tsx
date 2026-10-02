import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { PRODUCT_BUNDLES } from '../data/productData';
import { Check, Sparkles, Gift, Truck, ArrowRight, ShieldCheck, ZoomIn, X, Upload, Camera, RotateCcw, AlertTriangle, CheckCircle2, Search, Mic, MicOff, Zap } from 'lucide-react';
import { ProductBundle } from '../types';
import { useKitImages } from '../utils/kitImageStorage';

interface BundleSelectorProps {
  onSelectBundle: (bundle: ProductBundle) => void;
  onQuickBuy: (bundle: ProductBundle) => void;
}

export const BundleSelector: React.FC<BundleSelectorProps> = ({ onSelectBundle, onQuickBuy }) => {
  const [zoomImage, setZoomImage] = useState<{ url: string; title: string } | null>(null);
  const [dragOverBundleId, setDragOverBundleId] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [uploadFeedback, setUploadFeedback] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [stockUnits, setStockUnits] = useState<Record<string, number>>({
    'kit-profissional-1litro': 12,
    'kit-profissional-completo': 7
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStockUnits(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          if (Math.random() > 0.8 && next[id] > 3) {
            next[id] -= 1;
          }
        });
        return next;
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const { images, updateKitImage, resetImages } = useKitImages();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const parallaxY = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const smoothParallaxY = useSpring(parallaxY, { stiffness: 100, damping: 30 });

  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  const filteredBundles = useMemo(() => {
    return PRODUCT_BUNDLES.filter((bundle) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase().trim();
      return (
        bundle.title.toLowerCase().includes(query) ||
        bundle.tagline.toLowerCase().includes(query) ||
        bundle.itemsIncluded.some((item) => item.toLowerCase().includes(query))
      );
    });
  }, [searchQuery]);

  const startVoiceSearch = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setUploadFeedback({
        type: 'error',
        title: 'Recurso não suportado',
        message: 'A busca por voz não é suportada neste navegador. Recomendamos o Chrome ou Edge.'
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, []);

  const getKitBadges = useCallback((bundleId: string) => {
    switch (bundleId) {
      case 'kit-home-care':
        return {
          leftBadge: 'PARA USO DIÁRIO',
          discount: '-38%',
          popularBanner: null,
        };
      case 'kit-profissional-1litro':
        return {
          leftBadge: 'MELHOR CUSTO-BENEFÍCIO',
          discount: '-51%',
          popularBanner: '🏆 MAIS POPULAR',
        };
      case 'kit-profissional-completo':
        return {
          leftBadge: 'KIT COMPLETO',
          discount: '-47%',
          popularBanner: null,
        };
      default:
        return {
          leftBadge: 'KIT DYUSAR',
          discount: '-40%',
          popularBanner: null,
        };
    }
  }, []);

  const handleFileSelect = useCallback((bundleId: string, file: File) => {
    // 1. Basic format validation
    if (!file.type.startsWith('image/')) {
      setUploadFeedback({
        type: 'error',
        title: 'Formato de Arquivo Inválido',
        message: 'Por favor, selecione um arquivo de imagem válido (PNG, JPG ou WEBP).'
      });
      return;
    }

    // 2. Maximum file size check (10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setUploadFeedback({
        type: 'error',
        title: 'Arquivo Acima do Limite',
        message: `A imagem selecionada possui ${sizeMB}MB. O tamanho máximo permitido para manter o carregamento ultrarrápido é de 10MB.`
      });
      return;
    }

    setIsProcessingUpload(bundleId);

    // 3. Proportion (1:1 aspect ratio) validation via client Image constructor
    const objectUrl = URL.createObjectURL(file);
    const imgTest = new Image();
    imgTest.onload = async () => {
      const w = imgTest.naturalWidth;
      const h = imgTest.naturalHeight;
      const ratio = w / h;
      URL.revokeObjectURL(objectUrl);

      // Require approximately square 1:1 ratio (tolerance 0.85 to 1.18)
      if (ratio < 0.85 || ratio > 1.18) {
        setIsProcessingUpload(null);
        setUploadFeedback({
          type: 'error',
          title: 'Critério Técnico de Alinhamento (Proporção 1:1)',
          message: `A imagem enviada possui ${w}x${h}px (proporção ${ratio.toFixed(2)}:1). Para garantir que todos os kits fiquem perfeitamente alinhados no layout sem cortar os frascos, envie uma imagem quadrada (1:1, tolerância de 0.85 a 1.18).`
        });
        return;
      }

      // Read as base64 and save
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (typeof e.target?.result === 'string') {
          const res = await updateKitImage(bundleId, e.target.result);
          setIsProcessingUpload(null);

          if (!res.success) {
            setUploadFeedback({
              type: 'error',
              title: 'Não foi possível atualizar a imagem',
              message: res.error || 'Erro inesperado ao salvar imagem.'
            });
          } else {
            setUploadFeedback({
              type: 'success',
              title: 'Foto Atualizada com Sucesso!',
              message: `A nova imagem (${w}x${h}px) foi validada e aplicada ao kit. O layout permanece 100% alinhado.`
            });
          }
        }
      };
      reader.readAsDataURL(file);
    };

    imgTest.onerror = () => {
      setIsProcessingUpload(null);
      URL.revokeObjectURL(objectUrl);
      setUploadFeedback({
        type: 'error',
        title: 'Arquivo Corrompido',
        message: 'Não foi possível carregar as propriedades da imagem. Tente outro arquivo.'
      });
    };

    imgTest.src = objectUrl;
  }, [updateKitImage]);

  return (
    <section id="ofertas" ref={sectionRef} className="py-16 lg:py-24 bg-[#0c0d10] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Condição Exclusiva de Lote Oficial Dyusar</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-serif-display">
            Escolha o Seu Kit Super Reconstrução
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-3 font-sans-body">
            Garantia incondicional de 7 dias com devolução integral e Frete Grátis com envio prioritário para todo o Brasil.
          </p>

          {/* Quick Photo Upload Hint & Specifications Bar */}
          <div className="mt-4 p-3.5 rounded-xl bg-[#14151f] border border-amber-500/30 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <Camera className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Quer usar fotos personalizadas?</strong> Clique em <em>"Trocar Foto"</em> ou arraste o PNG. Padrão técnico aceito: <strong>proporção 1:1 (quadrada)</strong> e até <strong>10MB</strong>.
              </span>
            </div>
            <button
              onClick={() => {
                resetImages();
                setUploadFeedback({
                  type: 'success',
                  title: 'Fotos Originais Restauradas',
                  message: 'As imagens padrão em alta definição foram redefinidas com sucesso.'
                });
              }}
              title="Restaurar fotos originais de estúdio"
              className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 hover:text-white flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Restaurar Padrão</span>
            </button>
          </div>
        </motion.div>

        {/* Real-time Kit Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-md mx-auto mb-10 mt-6 flex gap-2"
        >
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-amber-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar kit por título (ex: 1 Litro...)"
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#14151f] border border-amber-500/30 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all shadow-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-white cursor-pointer"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          
          <button
            onClick={startVoiceSearch}
            disabled={isListening}
            title="Buscar por Voz"
            className={`flex items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
              isListening 
                ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' 
                : 'bg-[#14151f] border-amber-500/30 text-amber-400 hover:border-amber-400'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        </motion.div>

        {/* Empty state if search returns no results */}
        {filteredBundles.length === 0 && (
          <div className="p-8 max-w-md mx-auto rounded-2xl bg-[#14151f] border border-slate-800 text-center">
            <p className="text-sm text-slate-300 mb-3">
              Nenhum kit encontrado para a busca <strong>"{searchQuery}"</strong>.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 rounded-xl bg-amber-400 text-black text-xs font-bold hover:brightness-110 cursor-pointer"
            >
              Ver Todos os Kits
            </button>
          </div>
        )}

        {/* 3-Column Bundle Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {filteredBundles.map((bundle, index) => {
            const isPopular = bundle.popular;
            const currentImg = images[bundle.id] || bundle.image;
            const { leftBadge, discount, popularBanner } = getKitBadges(bundle.id);
            const isDraggingOver = dragOverBundleId === bundle.id;
            const isImageLoaded = loadedImages[bundle.id];
            const isUploadingThis = isProcessingUpload === bundle.id;
            const unitsLeft = stockUnits[bundle.id];

            return (
              <motion.div
                key={bundle.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-2xl flex flex-col justify-between p-6 sm:p-7 transition-all duration-300 ${
                  isPopular
                    ? 'bg-gradient-to-b from-[#211f18] via-[#171615] to-[#0f1015] border-2 border-amber-400 shadow-2xl shadow-amber-500/20 md:-translate-y-3'
                    : 'bg-[#14151c] border border-slate-800 hover:border-amber-500/40 shadow-xl'
                }`}
              >
                {/* Popular Highlight Top Ribbon */}
                {popularBanner && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                    <span className="px-4 py-1 text-xs font-black uppercase tracking-wider rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-black shadow-md whitespace-nowrap">
                      {popularBanner}
                    </span>
                  </div>
                )}

                {/* Limited Stock Badge */}
                {unitsLeft && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-12 -right-2 z-30"
                  >
                    <div className="bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded-l-lg shadow-xl flex items-center gap-1 border-y border-l border-red-400/50 animate-pulse">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span>ÚLTIMAS {unitsLeft} UNIDADES</span>
                    </div>
                  </motion.div>
                )}

                <div>
                  {/* Top Badges Bar: Category Pill & Discount Pill */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-300 border border-rose-500/25">
                      {leftBadge}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-sm">
                      {discount}
                    </span>
                  </div>

                  {/* Hidden File Input for Direct Upload */}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    ref={(el) => {
                      fileInputRefs.current[bundle.id] = el;
                    }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileSelect(bundle.id, file);
                      }
                      // Reset value so re-selecting the exact same file fires onChange again!
                      e.target.value = '';
                    }}
                  />

                  {/* Product Image Showcase with Skeleton Shimmer & Dark Luxury Frame */}
                  <motion.div 
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      rotateX,
                      rotateY,
                      transformStyle: "preserve-3d",
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverBundleId(bundle.id);
                    }}
                    onDragLeave={() => setDragOverBundleId(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOverBundleId(null);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFileSelect(bundle.id, file);
                    }}
                    className={`relative w-full h-56 sm:h-60 rounded-xl bg-gradient-to-b from-[#1b1c26] via-[#121319] to-[#0b0c10] border p-3 mb-4 flex items-center justify-center overflow-hidden group shadow-inner transition-all ${
                      isDraggingOver
                        ? 'border-2 border-emerald-400 bg-emerald-950/30 scale-[1.02]'
                        : 'border-slate-800/90'
                    }`}
                  >
                    {/* Placeholder for high-res images */}
                    {currentImg.includes('.webp') && (
                      <div 
                        className="absolute inset-0 bg-contain bg-center bg-no-repeat filter blur-md opacity-30 scale-95"
                        style={{ backgroundImage: `url('${currentImg.replace('.webp', '-tiny.jpg')}')` }}
                      />
                    )}

                    {/* Skeleton loader state */}
                    {!isImageLoaded && (
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-[#1e202d] to-slate-900 animate-pulse flex flex-col items-center justify-center gap-2">
                        <div className="w-16 h-16 rounded-full bg-slate-800/80 animate-spin border-2 border-amber-400/20 border-t-amber-400" />
                        <span className="text-[10px] text-amber-300 font-mono">Carregando imagem do kit...</span>
                      </div>
                    )}

                    <motion.div 
                      style={{ 
                        y: smoothParallaxY,
                        translateZ: 50
                      }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <LazyLoadImage
                        src={currentImg}
                        alt={bundle.title}
                        effect="blur"
                        wrapperClassName="w-full h-full flex items-center justify-center"
                        afterLoad={() => setLoadedImages((prev) => ({ ...prev, [bundle.id]: true }))}
                        onError={(e: any) => {
                          e.currentTarget.src = '/images/Kit Profissional 1 Litro.png';
                          setLoadedImages((prev) => ({ ...prev, [bundle.id]: true }));
                        }}
                        className={`max-h-full max-w-full object-contain filter drop-shadow-2xl group-hover:scale-105 transition-transform duration-500 rounded-lg cursor-pointer ${
                          isImageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        onClick={() => setZoomImage({ url: currentImg, title: bundle.title })}
                      />
                    </motion.div>

                    {/* Top Action Buttons: Upload & Zoom */}
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 z-20" style={{ transform: "translateZ(60px)" }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRefs.current[bundle.id]?.click();
                        }}
                        disabled={isUploadingThis}
                        title="Substituir foto do kit (fazer upload do PNG 1:1)"
                        className="p-1.5 rounded-lg bg-black/75 hover:bg-amber-400 hover:text-black border border-white/20 text-slate-300 transition-colors cursor-pointer shadow-md flex items-center gap-1 text-[10px] font-bold disabled:opacity-50"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>{isUploadingThis ? 'Validando...' : 'Trocar Foto'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setZoomImage({ url: currentImg, title: bundle.title })}
                        title="Ampliar visualização"
                        className="p-1.5 rounded-lg bg-black/75 hover:bg-slate-800 border border-white/20 text-slate-300 transition-colors cursor-pointer shadow-md"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Drag & Drop Overlay Indicator */}
                    {isDraggingOver && (
                      <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-emerald-300 z-30 animate-fadeIn">
                        <Upload className="w-8 h-8 animate-bounce text-emerald-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-center px-4">
                          Solte a imagem quadrada (1:1) aqui para atualizar
                        </span>
                      </div>
                    )}

                    {/* Floating Item Count Tag */}
                    <span 
                      className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/85 border border-slate-700 text-[10px] text-slate-300 font-mono"
                      style={{ transform: "translateZ(40px)" }}
                    >
                      {bundle.stepsCount} {bundle.stepsCount === 4 ? 'Produtos (Kit Completo)' : 'Produtos'}
                    </span>
                  </motion.div>

                  {/* Title & Tagline */}
                  <div className="text-left pt-1 pb-3 border-b border-slate-800">
                    <h3 className="text-lg sm:text-xl font-extrabold text-white font-serif-display">
                      {bundle.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 min-h-[32px] leading-snug">
                      {bundle.tagline}
                    </p>
                  </div>

                  {/* Items Included List */}
                  <div className="py-4 space-y-2.5 text-xs text-slate-200 border-b border-slate-800/80">
                    <p className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                      Itens Inclusos no Pacote:
                    </p>
                    {bundle.itemsIncluded.map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 stroke-[2.5]" />
                        <span className="leading-tight font-medium text-slate-200">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Free Gifts Callout if any */}
                  {bundle.gifts && bundle.gifts.length > 0 && (
                    <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs">
                      <p className="font-bold text-emerald-400 flex items-center gap-1.5 text-[11px]">
                        <Gift className="w-3.5 h-3.5" />
                        Brindes Exclusivos Inclusos:
                      </p>
                      <ul className="mt-1 space-y-0.5 text-[11px] text-slate-300 list-disc list-inside">
                        {bundle.gifts.map((g, idx) => (
                          <li key={idx} className="line-clamp-1">{g}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Pricing Box */}
                  <div className="py-4 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 line-through">
                        De R$ {bundle.originalPrice.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                        Economize R$ {bundle.savings.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1 mt-1.5">
                      <span className="text-xs text-slate-300 font-medium">12x de</span>
                      <span className="text-3xl sm:text-4xl font-black text-amber-300 font-mono">
                        R$ {bundle.installmentValue.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-1">
                      ou <strong>R$ {bundle.price.toFixed(2).replace('.', ',')} à vista</strong>
                    </p>
                    <p className="text-[11px] font-bold text-emerald-400 mt-0.5">
                      (R$ {(bundle.price * 0.9).toFixed(2).replace('.', ',')} com 10% OFF no PIX)
                    </p>
                  </div>
                </div>

                {/* Buy Button & Free Shipping */}
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onSelectBundle({ ...bundle, image: currentImg })}
                      className="py-3 px-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-amber-400/50 transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ver Carrinho</span>
                    </button>

                    <button
                      onClick={() => onQuickBuy({ ...bundle, image: currentImg })}
                      className="py-3 px-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white transition-all cursor-pointer shadow-lg hover:scale-[1.05] active:scale-95 flex items-center justify-center gap-1.5 group"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Compra Rápida</span>
                    </button>
                  </div>

                  <button
                    onClick={() => onQuickBuy({ ...bundle, image: currentImg })}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg relative overflow-hidden group ${
                      isPopular
                        ? 'bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-black hover:scale-[1.02] shadow-amber-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-amber-400/50'
                    }`}
                  >
                    <span className="relative z-10 flex items-center gap-1.5">
                      <span>Comprar Este Kit</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                    {isPopular && (
                      <div className="absolute inset-0 bg-white/25 translate-x-[-100%] animate-shimmer" />
                    )}
                  </button>

                  <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                    <Truck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Frete Grátis com Rastreamento em 24h</span>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>

        {/* Security & Warranty Trust Footer */}
        <div className="mt-12 max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400 pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Compra 100% Segura e Criptografada SSL</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>7 Dias de Garantia Incondicional</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-sky-400" />
            <span>Entrega Garantida com Seguro de Carga</span>
          </div>
        </div>

      </div>

      {/* Upload Feedback Toast / Modal */}
      {uploadFeedback && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-[#181922] border-2 border-slate-700 rounded-xl p-4 shadow-2xl animate-fadeIn">
          <div className="flex items-start gap-3">
            {uploadFeedback.type === 'error' ? (
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            )}
            <div className="flex-1 text-left">
              <h5 className={`text-sm font-bold ${uploadFeedback.type === 'error' ? 'text-rose-300' : 'text-emerald-300'}`}>
                {uploadFeedback.title}
              </h5>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {uploadFeedback.message}
              </p>
            </div>
            <button
              onClick={() => setUploadFeedback(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {zoomImage && (
        <div 
          onClick={() => setZoomImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn cursor-zoom-out"
        >
          <div className="relative max-w-2xl w-full bg-[#14151b] border-2 border-amber-500/40 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
            <button
              onClick={() => setZoomImage(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h4 className="text-base font-bold text-white font-serif-display mb-3 text-center">
              {zoomImage.title}
            </h4>

            <div className="w-full max-h-[70vh] flex items-center justify-center p-4 bg-gradient-to-b from-[#181922] to-black rounded-xl overflow-hidden">
              <img
                src={zoomImage.url}
                alt={zoomImage.title}
                referrerPolicy="no-referrer"
                className="max-h-[65vh] max-w-full object-contain filter drop-shadow-2xl"
              />
            </div>

            <p className="text-xs text-amber-300/80 mt-3 font-mono">
              Visualização de alta resolução dos frascos originais Dyusar Haute Performance
            </p>
          </div>
        </div>
      )}

    </section>
  );
};
