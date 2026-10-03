import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { motion, useScroll, useTransform, useSpring, useMotionValue, MotionValue } from 'framer-motion';
import { PRODUCT_BUNDLES } from '../data/productData';
import { Check, Sparkles, Gift, Truck, ArrowRight, ShieldCheck, ZoomIn, X, Upload, Camera, RotateCcw, AlertTriangle, CheckCircle2, Zap, Scale, Crown, Award as AwardIcon } from 'lucide-react';
import { ProductBundle } from '../types';
import { useKitImages } from '../utils/kitImageStorage';

const BUNDLE_SPECS: Record<string, any> = {
  'kit-home-care': {
    yield: 'Até 22 aplicações',
    size: '300ml / 300g',
    focus: 'Manutenção SOS e Brilho',
    tech: 'Nano Queratina + Ojon',
    profile: 'Uso residencial diário'
  },
  'kit-profissional-1litro': {
    yield: 'Até 65 aplicações',
    size: '1000ml / 1kg',
    focus: 'Alta Performance e Rendimento',
    tech: 'Queratina Biomimética + Murumuru',
    profile: 'Salões de alto fluxo'
  },
  'kit-profissional-completo': {
    yield: 'Até 65 aplicações + 100 cauterizações',
    size: '1000ml / 1kg + 500ml (Queratina)',
    focus: 'Recuperação de Corte Químico',
    tech: 'Protocolo de 4 Passos Full',
    profile: 'Especialistas em Terapia Capilar'
  }
};

interface BundleCardProps {
  bundle: ProductBundle;
  index: number;
  currentImg: string;
  leftBadge: string;
  discount: string;
  popularBanner: string | null;
  isPopular: boolean;
  unitsLeft?: number;
  isProfessional: boolean;
  smoothParallaxY: MotionValue<number>;
  triggerHaptic: () => void;
  onSelect: (bundle: ProductBundle) => void;
  onQuickBuy: (bundle: ProductBundle) => void;
  onZoom: (url: string, title: string) => void;
  onCompare: (id: string) => void;
  handleFileSelect: (bundleId: string, file: File) => void;
  isUploading: boolean;
  dragOverId: string | null;
  setDragOverId: (id: string | null) => void;
  isImageLoaded: boolean;
  onImageLoad: (id: string) => void;
}

const BundleCard = memo(({ 
  bundle, 
  index, 
  currentImg, 
  leftBadge, 
  discount, 
  popularBanner, 
  isPopular, 
  unitsLeft, 
  isProfessional,
  smoothParallaxY,
  triggerHaptic,
  onSelect,
  onQuickBuy,
  onZoom,
  onCompare,
  handleFileSelect,
  isUploading,
  dragOverId,
  setDragOverId,
  isImageLoaded,
  onImageLoad
}: BundleCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDraggingOver = dragOverId === bundle.id;

  // Per-card 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
      className={`relative h-full rounded-2xl flex flex-col justify-between p-6 sm:p-7 transition-all duration-300 ${
        isPopular
          ? 'bg-gradient-to-b from-[#211f18] via-[#171615] to-[#0f1015] border-2 border-amber-400 shadow-2xl shadow-amber-500/20'
          : 'bg-[#14151c] border border-slate-800 hover:border-amber-500/40 shadow-xl'
      }`}
    >
      {/* Exclusive Member Badge for Professional Kits */}
      {isProfessional && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute -top-3 -left-2 z-30"
        >
          <div className="bg-gradient-to-r from-amber-600 to-amber-400 text-black text-[9px] font-black px-3 py-1 rounded-lg shadow-lg flex items-center gap-1 border border-white/20">
            <title>Membro Exclusivo Dyusar</title>
            <Crown className="w-3 h-3" />
            <span>MEMBRO EXCLUSIVO</span>
          </div>
        </motion.div>
      )}

      {/* Popular Highlight Top Ribbon */}
      {popularBanner && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
          <span className="px-4 py-1 text-xs font-black uppercase tracking-wider rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-black shadow-md whitespace-nowrap">
            {popularBanner}
          </span>
        </div>
      )}

      {/* Limited Stock Badge */}
      {unitsLeft !== undefined && (
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
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(bundle.id, file);
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
            setDragOverId(bundle.id);
          }}
          onDragLeave={() => setDragOverId(null)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOverId(null);
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
              style={{ backgroundImage: `url('${currentImg.replace('.webp', '-tiny.webp')}')` }}
            />
          )}

          <motion.div 
            style={{ 
              y: smoothParallaxY,
              translateZ: 50
            }}
            className="w-full h-full flex items-center justify-center"
          >
            <img
              src={currentImg}
              alt={bundle.title}
              loading="lazy"
              width="320"
              height="320"
              onLoad={() => onImageLoad(bundle.id)}
              onError={(e: any) => {
                e.currentTarget.src = '/images/Kit Profissional 1 Litro.png';
                onImageLoad(bundle.id);
              }}
              className={`max-h-full max-w-full object-contain filter drop-shadow-2xl group-hover:scale-105 transition-all duration-500 rounded-lg cursor-pointer ${
                isImageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onClick={() => onZoom(currentImg, bundle.title)}
            />
          </motion.div>

          {/* Top Action Buttons: Zoom & Compare */}
          <div className="absolute top-2 right-2 flex flex-col items-end gap-1.5 z-20" style={{ transform: "translateZ(60px)" }}>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onZoom(currentImg, bundle.title)}
                title="Ampliar visualização"
                className="p-1.5 rounded-lg bg-black/75 hover:bg-slate-800 border border-white/20 text-slate-300 transition-colors cursor-pointer shadow-md"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                onCompare(bundle.id);
              }}
              className="px-2 py-1 rounded-lg bg-slate-900/90 hover:bg-amber-400 hover:text-black border border-amber-500/30 text-amber-400 text-[10px] font-bold transition-all flex items-center gap-1 shadow-lg"
            >
              <Scale className="w-3 h-3" />
              <span>Comparar Rendimento</span>
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
            onClick={() => onSelect({ ...bundle, image: currentImg })}
            className="py-3 px-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-amber-400/50 transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ver Carrinho</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic();
              onQuickBuy({ ...bundle, image: currentImg });
            }}
            className="py-3 px-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white transition-all cursor-pointer shadow-lg hover:scale-[1.05] active:scale-95 flex items-center justify-center gap-1.5 group"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Compra Rápida</span>
          </button>
        </div>

        <button
          onClick={() => {
            triggerHaptic();
            onQuickBuy({ ...bundle, image: currentImg });
          }}
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
});

interface BundleSelectorProps {
  onSelectBundle: (bundle: ProductBundle) => void;
  onQuickBuy: (bundle: ProductBundle) => void;
}

const BUNDLE_BADGES: Record<string, { leftBadge: string; discount: string; popularBanner: string | null }> = {
  'kit-home-care': {
    leftBadge: 'PARA USO DIÁRIO',
    discount: '-38%',
    popularBanner: null,
  },
  'kit-profissional-1litro': {
    leftBadge: 'MELHOR CUSTO-BENEFÍCIO',
    discount: '-51%',
    popularBanner: '🏆 MAIS POPULAR',
  },
  'kit-profissional-completo': {
    leftBadge: 'KIT COMPLETO',
    discount: '-47%',
    popularBanner: null,
  }
};

export const BundleSelector: React.FC<BundleSelectorProps> = ({ onSelectBundle, onQuickBuy }) => {
  const [zoomImage, setZoomImage] = useState<{ url: string; title: string } | null>(null);
  const [comparingBundleId, setComparingBundleId] = useState<string | null>(null);
  const [dragOverBundleId, setDragOverBundleId] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [uploadFeedback, setUploadFeedback] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState<string | null>(null);
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
  const sectionRef = useRef<HTMLElement>(null);

  const triggerHaptic = useCallback(() => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(15);
    }
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const parallaxY = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const smoothParallaxY = useSpring(parallaxY, { stiffness: 100, damping: 30 });

  const enrichedBundles = useMemo(() => {
    return PRODUCT_BUNDLES
      .map((bundle) => ({
        ...bundle,
        ...(BUNDLE_BADGES[bundle.id] || {
          leftBadge: 'KIT DYUSAR',
          discount: '-40%',
          popularBanner: null,
        }),
        isProfessional: bundle.id.includes('profissional')
      }));
  }, []);

  const handleFileSelect = useCallback((bundleId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadFeedback({
        type: 'error',
        title: 'Formato de Arquivo Inválido',
        message: 'Por favor, selecione um arquivo de imagem válido (PNG, JPG ou WEBP).'
      });
      return;
    }

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

    const objectUrl = URL.createObjectURL(file);
    const imgTest = new Image();
    imgTest.onload = async () => {
      const w = imgTest.naturalWidth;
      const h = imgTest.naturalHeight;
      const ratio = w / h;
      URL.revokeObjectURL(objectUrl);

      if (ratio < 0.85 || ratio > 1.18) {
        setIsProcessingUpload(null);
        setUploadFeedback({
          type: 'error',
          title: 'Critério Técnico de Alinhamento (Proporção 1:1)',
          message: `A imagem enviada possui ${w}x${h}px (proporção ${ratio.toFixed(2)}:1). Para garantir que todos os kits fiquem perfeitamente alinhados no layout sem cortar os frascos, envie uma imagem quadrada (1:1, tolerância de 0.85 a 1.18).`
        });
        return;
      }

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

  const onImageLoad = useCallback((id: string) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }));
  }, []);

  const handleZoom = useCallback((url: string, title: string) => {
    setZoomImage({ url, title });
  }, []);

  const handleCompare = useCallback((id: string) => {
    setComparingBundleId(id);
  }, []);

  const listData = useMemo(() => ({
    items: enrichedBundles,
    images,
    stockUnits,
    loadedImages,
    isProcessingUpload,
    dragOverBundleId,
    smoothParallaxY,
    triggerHaptic,
    onSelectBundle,
    onQuickBuy,
    handleZoom,
    handleCompare,
    handleFileSelect,
    setDragOverBundleId,
    onImageLoad,
  }), [enrichedBundles, images, stockUnits, loadedImages, isProcessingUpload, dragOverBundleId, smoothParallaxY, triggerHaptic, onSelectBundle, onQuickBuy, handleZoom, handleCompare, handleFileSelect, setDragOverBundleId, onImageLoad]);

  return (
    <section id="ofertas" ref={sectionRef} className="py-12 lg:py-16 bg-[#0c0d10] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Responsive Bundle Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {enrichedBundles.map((bundle, index) => {
            const currentImg = images[bundle.id] || bundle.image;
            const unitsLeft = stockUnits[bundle.id];
            const isUploading = isProcessingUpload === bundle.id;
            const isImageLoaded = !!loadedImages[bundle.id];

            return (
              <BundleCard
                key={bundle.id}
                bundle={bundle}
                index={index}
                currentImg={currentImg}
                leftBadge={bundle.leftBadge}
                discount={bundle.discount}
                popularBanner={bundle.popularBanner}
                isPopular={!!bundle.popular}
                unitsLeft={unitsLeft}
                isProfessional={bundle.isProfessional}
                smoothParallaxY={smoothParallaxY}
                triggerHaptic={triggerHaptic}
                onSelect={onSelectBundle}
                onQuickBuy={onQuickBuy}
                onZoom={handleZoom}
                onCompare={handleCompare}
                handleFileSelect={handleFileSelect}
                isUploading={isUploading}
                dragOverId={dragOverBundleId}
                setDragOverId={setDragOverBundleId}
                isImageLoaded={isImageLoaded}
                onImageLoad={onImageLoad}
              />
            );
          })}
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

      {/* Comparison Modal */}
      {comparingBundleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fadeIn">
          <div className="relative max-w-4xl w-full bg-[#0f1015] border-2 border-amber-500/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-800 bg-[#14151c] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/30">
                  <Scale className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white font-serif-display">Comparativo Técnico de Rendimento</h4>
                  <p className="text-xs text-slate-400">Encontre o melhor custo-benefício para sua necessidade</p>
                </div>
              </div>
              <button
                onClick={() => setComparingBundleId(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Comparison Table Grid */}
            <div className="p-6 overflow-x-auto">
              <div className="min-w-[600px]">
                <div className="grid grid-cols-4 gap-4 mb-4 pb-2 border-b border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <div className="col-span-1">ESPECIFICAÇÕES</div>
                  {PRODUCT_BUNDLES.map(b => (
                    <div key={b.id} className={`text-center ${b.id === comparingBundleId ? 'text-amber-400' : ''}`}>
                      {b.title.replace('Kit ', '')}
                    </div>
                  ))}
                </div>

                {[
                  { label: 'Rendimento Médio', key: 'yield', icon: Zap },
                  { label: 'Volume Total', key: 'size', icon: CheckCircle2 },
                  { label: 'Foco do Tratamento', key: 'focus', icon: Sparkles },
                  { label: 'Principais Ativos', key: 'tech', icon: AwardIcon },
                  { label: 'Perfil Indicado', key: 'profile', icon: ShieldCheck },
                ].map((row, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-4 py-4 border-b border-slate-800/50 items-center hover:bg-slate-800/20 transition-colors group">
                    <div className="col-span-1 flex items-center gap-2 text-xs font-bold text-slate-300">
                      <row.icon className="w-4 h-4 text-amber-500/60" />
                      {row.label}
                    </div>
                    {PRODUCT_BUNDLES.map(b => (
                      <div key={b.id} className={`text-center text-xs ${b.id === comparingBundleId ? 'text-white font-bold' : 'text-slate-400'}`}>
                        {BUNDLE_SPECS[b.id][row.key]}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer CTA */}
            <div className="p-6 bg-[#14151c] border-t border-slate-800 flex items-center justify-between">
              <p className="text-[11px] text-slate-400 max-w-sm">
                * Estimativas baseadas em cabelos de comprimento médio (altura do ombro) e densidade normal.
              </p>
              <button
                onClick={() => setComparingBundleId(null)}
                className="px-6 py-2.5 rounded-xl bg-amber-400 text-black text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-lg cursor-pointer"
              >
                Voltar às Ofertas
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

