import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WhatsAppIcon } from './WhatsAppIcon';
import { getWhatsAppUrl, WHATSAPP_FORMATTED } from '../data/whatsapp';
import { trackEvent } from '../utils/pixelTracking';

const INACTIVITY_THRESHOLD_MS = 30000; // 30 segundos
const WOBBLE_BASE_INTERVAL_MS = 45000; // Média de 45 segundos

// Mapeamento preciso do nome da seção/produto para a mensagem automática do WhatsApp
const SECTIONS_PRODUCT_MAP: Record<string, string> = {
  'hero-section': 'Kit Super Reconstrução',
  'trust-badges': 'Selo de Autenticidade e Garantia',
  'tratamento': 'Protocolo de 4 Passos',
  'antes-depois': 'Antes e Depois',
  'ativos': 'Ativos da Fórmula',
  'salao': 'Kit Profissional para Salão',
  'bundle-selector': 'Kit de Reconstrução',
  'ofertas': 'Kit de Reconstrução',
  'comparison-table': 'Comparativo de Eficiência',
  'comparativo': 'Comparativo de Eficiência',
  'depoimentos': 'Depoimentos dos Clientes',
  'video-testimonials': 'Vídeo Depoimentos',
  'video-showcase': 'Vídeos de Demonstração',
  'faq': 'FAQ de Dúvidas Frequentes',
  'footer': 'Suporte e Garantia'
};

// Mapeamento amigável para rótulos analíticos (Google Analytics)
const SECTIONS_ANALYTICS_MAP: Record<string, string> = {
  'hero-section': 'Hero (Apresentação / Topo)',
  'trust-badges': 'Garantia e Selos de Confiança',
  'tratamento': 'Protocolo de 4 Passos (Tratamento)',
  'antes-depois': 'Antes e Depois Interativo',
  'ativos': 'Fórmula & Ativos Científicos',
  'salao': 'Salão Profissional (Uso de Bancada)',
  'bundle-selector': 'BundleSelector (Seletor de Kits & Ofertas)',
  'ofertas': 'BundleSelector (Seletor de Kits & Ofertas)',
  'comparison-table': 'ComparisonTable (Tabela Comparativa de Mercado)',
  'comparativo': 'ComparisonTable (Tabela Comparativa de Mercado)',
  'depoimentos': 'Depoimentos & Avaliações Reais',
  'video-testimonials': 'Depoimentos em Vídeo',
  'video-showcase': 'Showcase de Vídeos do Produto',
  'faq': 'Perguntas Frequentes (FAQ)',
  'footer': 'Rodapé Oficial (Garantia & Políticas)'
};

export interface SectionDetectionResult {
  id: string;
  name: string;
  productContext: string;
}

/**
 * Função utilitária que calcula com precisão qual seção do site o usuário está visualizando
 * com base no ponto focal vertical da viewport (altura do scroll + 40% da tela).
 */
export function detectCurrentPageSection(): SectionDetectionResult {
  if (typeof window === 'undefined') {
    return {
      id: 'hero-section',
      name: 'Hero (Apresentação / Topo)',
      productContext: 'Kit Super Reconstrução'
    };
  }

  // Ponto focal vertical onde o olhar do usuário se concentra (fração superior da tela)
  const focalY = window.scrollY + window.innerHeight * 0.42;

  const candidateElements = Array.from(
    document.querySelectorAll<HTMLElement>('section[id], section[data-section], footer, header')
  );

  let detectedId = 'hero-section';
  let minDistance = Infinity;

  for (const el of candidateElements) {
    const id = el.id || el.getAttribute('data-section') || '';
    if (!id) continue;

    const top = el.offsetTop;
    const height = el.offsetHeight;
    const bottom = top + height;

    // Se o ponto focal estiver exatamente contido dentro desta seção
    if (focalY >= top && focalY <= bottom) {
      detectedId = id;
      break;
    }

    // Fallback: seção geometricamente mais próxima do ponto focal
    const midPoint = top + height / 2;
    const distance = Math.abs(focalY - midPoint);
    if (distance < minDistance) {
      minDistance = distance;
      detectedId = id;
    }
  }

  const name = SECTIONS_ANALYTICS_MAP[detectedId] || `Seção (#${detectedId})`;
  const productContext = SECTIONS_PRODUCT_MAP[detectedId] || 'Kit Super Reconstrução';

  return { id: detectedId, name, productContext };
}

/**
 * Gera a mensagem contextual do WhatsApp seguindo a diretriz:
 * 'Olá, tenho interesse no [NOME_DA_SECAO_ATUAL] da Dyusar'
 */
export function buildWhatsAppContextualMessage(sectionName: string): string {
  return `Olá, tenho interesse no ${sectionName} da Dyusar`;
}

/**
 * Botão flutuante de WhatsApp inteligente:
 * 1. Captura dinamicamente a seção atual na viewport do usuário e ajusta a mensagem automática
 *    para: 'Olá, tenho interesse no [NOME_DA_SECAO_ATUAL] da Dyusar', garantindo que o suporte
 *    receba um contexto preciso de qual produto ou dúvida o cliente possui ao iniciar o chat.
 * 2. Abre sempre em nova aba com target="_blank" e rel="noopener noreferrer".
 * 3. Registra evento no Google Analytics (via gtag) com a etiqueta da seção onde o usuário estava.
 * 4. Ativa uma animação de pulsação discreta quando o usuário fica inativo por mais de 30 segundos.
 * 5. Executa animação CSS de 'wobble' sutil aleatoriamente a cada ~45 segundos para atrair atenção em mobile.
 */
export const WhatsAppButton: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<SectionDetectionResult>({
    id: 'hero-section',
    name: 'Hero (Apresentação / Topo)',
    productContext: 'Kit Super Reconstrução'
  });

  const [isInactive, setIsInactive] = useState(false);
  const [isWobbling, setIsWobbling] = useState(false);
  
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wobbleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Monitorar continuamente qual seção está na viewport do usuário
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let lastScrollCheck = 0;
    const handleScrollSync = () => {
      const now = Date.now();
      // Throttle a cada 200ms para alta performance com 60 FPS
      if (now - lastScrollCheck > 200) {
        lastScrollCheck = now;
        const detected = detectCurrentPageSection();
        setCurrentSection((prev) => {
          if (prev.id !== detected.id) {
            return detected;
          }
          return prev;
        });
      }
    };

    // Sincronização inicial
    handleScrollSync();

    window.addEventListener('scroll', handleScrollSync, { passive: true });
    window.addEventListener('resize', handleScrollSync, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScrollSync);
      window.removeEventListener('resize', handleScrollSync);
    };
  }, []);

  // 2. Animação CSS 'wobble' sutil disparada aleatoriamente a cada ~45 segundos (ideal para mobile)
  useEffect(() => {
    let isMounted = true;

    const triggerWobble = () => {
      if (!isMounted) return;

      setIsWobbling(true);

      setTimeout(() => {
        if (isMounted) {
          setIsWobbling(false);
          scheduleNextWobble();
        }
      }, 1200);
    };

    const scheduleNextWobble = () => {
      // Varia aleatoriamente entre 40s e 50s (média de 45 segundos)
      const randomJitter = (Math.random() - 0.5) * 10000;
      const delay = Math.max(35000, WOBBLE_BASE_INTERVAL_MS + randomJitter);

      wobbleTimerRef.current = setTimeout(triggerWobble, delay);
    };

    // Primeiro wobble suave após 20 segundos
    const initialDelay = setTimeout(triggerWobble, 20000);

    return () => {
      isMounted = false;
      clearTimeout(initialDelay);
      if (wobbleTimerRef.current) {
        clearTimeout(wobbleTimerRef.current);
      }
    };
  }, []);

  // 3. Monitorar inatividade do usuário (> 30 segundos)
  const resetInactivityTimer = useCallback(() => {
    setIsInactive(false);

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setTimeout(() => {
      setIsInactive(true);
    }, INACTIVITY_THRESHOLD_MS);
  }, []);

  useEffect(() => {
    resetInactivityTimer();

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    
    let lastActivityCall = Date.now();
    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastActivityCall > 400) {
        lastActivityCall = now;
        resetInactivityTimer();
      }
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [resetInactivityTimer]);

  // Mensagem automática do link configurada para a seção atual:
  // 'Olá, tenho interesse no [NOME_DA_SECAO_ATUAL] da Dyusar'
  const activeMessage = buildWhatsAppContextualMessage(currentSection.productContext);
  const whatsappUrl = getWhatsAppUrl(activeMessage);

  // 4. Clique do Usuário: Nova Aba com target=_blank e rel=noopener noreferrer + Google Analytics (gtag)
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    resetInactivityTimer();
    setIsWobbling(false);

    // Captura com máxima precisão a seção ativa no exato instante do clique
    const activeSectionAtClick = detectCurrentPageSection();
    const messageToSend = buildWhatsAppContextualMessage(activeSectionAtClick.productContext);
    const clickUrl = getWhatsAppUrl(messageToSend);

    const totalHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const scrollDepthPercent = Math.round((window.scrollY / totalHeight) * 100);
    const deviceType = window.innerWidth < 768 ? 'Mobile 📱' : window.innerWidth < 1024 ? 'Tablet 💻' : 'Desktop 🖥️';

    // Registro no Google Analytics (via gtag) com a etiqueta da seção onde o usuário estava
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'whatsapp_click', {
        event_category: 'engagement',
        event_label: activeSectionAtClick.name,
        section_id: activeSectionAtClick.id,
        section_name: activeSectionAtClick.name,
        section_product: activeSectionAtClick.productContext,
        scroll_depth: scrollDepthPercent,
        device: deviceType,
        custom_message: messageToSend
      });
      console.log(`%c📊 [gtag] Evento registrado no Google Analytics: 'whatsapp_click' | Etiqueta da Seção: '${activeSectionAtClick.name}'`, 'color: #38bdf8; font-weight: bold;');
    } else {
      console.log(`%c📊 [gtag-info] window.gtag chamado (simulado no ambiente local): 'whatsapp_click' | Etiqueta: '${activeSectionAtClick.name}'`, 'color: #94a3b8;');
    }

    // Log de depuração rico e estruturado no Console
    console.group(
      '%c💬 [WhatsApp-Debug] Suporte Solicitado via Botão Flutuante',
      'background: #25D366; color: #000; font-weight: bold; padding: 4px 10px; border-radius: 6px; font-size: 12px;'
    );
    console.log('%c📍 Seção Atual Detectada:', 'font-weight: bold; color: #34d399;', activeSectionAtClick.name);
    console.log('%c🏷️ Produto/Contexto:', 'color: #fbbf24; font-weight: bold;', activeSectionAtClick.productContext);
    console.log('%c🆔 ID da Seção no DOM:', 'color: #94a3b8;', `#${activeSectionAtClick.id}`);
    console.log('%c📜 Profundidade do Scroll:', 'color: #fbbf24;', `${scrollDepthPercent}%`);
    console.log('%c💬 Mensagem Enviada ao Chat:', 'color: #60a5fa; font-weight: bold;', `"${messageToSend}"`);
    console.log('%c📱 Dispositivo:', 'color: #cbd5e1;', `${deviceType} (${window.innerWidth}px x ${window.innerHeight}px)`);
    console.log('%c⏱️ Tempo no Site:', 'color: #94a3b8;', `${Math.round(performance.now() / 1000)}s`);
    console.log('%c📅 Data/Hora:', 'color: #94a3b8;', new Date().toLocaleString('pt-BR'));
    console.groupEnd();

    // Rastreia evento unificado nos pixels adicionais (Meta, TikTok)
    trackEvent.custom('WhatsApp_Click', {
      section: activeSectionAtClick.name,
      sectionId: activeSectionAtClick.id,
      productContext: activeSectionAtClick.productContext,
      scrollDepth: scrollDepthPercent,
      device: deviceType,
      message: messageToSend
    });

    // Garante abertura imediata em nova aba com target="_blank" e rel="noopener noreferrer"
    if (typeof window !== 'undefined') {
      window.open(clickUrl, '_blank', 'noopener,noreferrer');
    }
    e.preventDefault();
  };

  const isTargetHighIntent =
    currentSection.id === 'bundle-selector' ||
    currentSection.id === 'ofertas' ||
    currentSection.id === 'comparison-table' ||
    currentSection.id === 'comparativo';

  return (
    <motion.div 
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.5, type: 'spring', stiffness: 260, damping: 20 }}
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2 pointer-events-auto select-none"
    >
      {/* Floating Contextual Notification Badge */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentSection.id}-${isInactive}`}
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#121319]/95 backdrop-blur-md border border-emerald-500/40 text-white text-[11px] font-bold rounded-xl shadow-2xl"
        >
          {isTargetHighIntent ? (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span className="text-amber-300 font-sans-body">
                Interesse no {currentSection.productContext}? <strong>Fale conosco</strong>
              </span>
            </>
          ) : isInactive ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-emerald-300 font-sans-body">
                Podemos te ajudar com seu cabelo? ✨
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>
                Interesse no <strong>{currentSection.productContext}</strong>? Fale no WhatsApp
              </span>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Main WhatsApp Action Button with Inactivity Pulse + Subtle CSS Wobble */}
      <motion.div
        animate={
          isInactive
            ? {
                scale: [1, 1.07, 1, 1.07, 1],
                transition: {
                  duration: 2.4,
                  repeat: Infinity,
                  repeatDelay: 1.2,
                  ease: 'easeInOut'
                }
              }
            : isTargetHighIntent
            ? {
                scale: [1, 1.04, 1],
                transition: {
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }
              }
            : { scale: 1 }
        }
        className={`relative ${isWobbling ? 'animate-wobble-subtle' : ''}`}
      >
        {/* Discreet Inactivity Ripple Aura */}
        {isInactive && (
          <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-35 animate-ping pointer-events-none" />
        )}

        {/* High Intent Section Highlight Ring */}
        {isTargetHighIntent && (
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-400/40 to-emerald-400/40 blur-xs animate-pulse pointer-events-none" />
        )}

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className={`relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-[0_10px_40px_-10px_rgba(37,211,102,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 group overflow-hidden ${
            isTargetHighIntent
              ? 'bg-gradient-to-tr from-[#1ebd59] to-[#25D366] ring-2 ring-amber-400/80 shadow-[0_0_25px_rgba(37,211,102,0.7)]'
              : 'bg-[#25D366]'
          } text-white`}
          aria-label={`Tirar dúvidas sobre o ${currentSection.productContext} no WhatsApp ${WHATSAPP_FORMATTED}`}
          title={`Interesse no ${currentSection.productContext}? Fale no WhatsApp`}
        >
          <WhatsAppIcon className="w-8 h-8 sm:w-9 sm:h-9" />
          
          {/* Shimmer Light Reflection Effect */}
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          
          {/* Active Online Notification Badge */}
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
              1
            </span>
          </span>
        </a>
      </motion.div>
    </motion.div>
  );
};
