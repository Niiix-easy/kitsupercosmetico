import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Check, ThumbsUp, Sparkles } from 'lucide-react';

export interface ExpandableFAQItemProps {
  id?: string;
  question: string;
  answer: string;
  category?: string;
  defaultOpen?: boolean;
  forceOpen?: boolean;
  isHighlighted?: boolean;
  index?: number;
  onToggle?: (isOpen: boolean) => void;
}

/**
 * Componente expansível individual para cada pergunta do FAQ.
 * 
 * Recursos:
 * - Estado local (`isOpen`) com sincronização opcional quando ativado via links internos ou âncoras.
 * - Animação de deslize (slide-down) suave ao expandir (height + opacity + translateY).
 * - Layout responsivo com break-words e padding proporcional que impede corte de texto em telas menores.
 * - Efeito de destaque visual (highlight glow) quando acessado via link âncora interno.
 */
export const ExpandableFAQItem: React.FC<ExpandableFAQItemProps> = ({
  id,
  question,
  answer,
  category,
  defaultOpen = false,
  forceOpen,
  isHighlighted = false,
  index,
  onToggle
}) => {
  // Estado local gerenciando a visibilidade
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const [feedbackGiven, setFeedbackGiven] = useState<'yes' | 'no' | null>(null);

  // Se forceOpen for fornecido pelo componente pai (ex: clique em link interno), atualiza o estado local
  useEffect(() => {
    if (typeof forceOpen === 'boolean') {
      setIsOpen(forceOpen);
    }
  }, [forceOpen]);

  const toggleVisibility = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (onToggle) onToggle(next);
      return next;
    });
  };

  const elementId = id || `faq-item-${index ?? question.slice(0, 15).replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div
      id={elementId}
      className={`rounded-2xl border transition-all duration-500 overflow-hidden shadow-sm scroll-mt-24 sm:scroll-mt-28 ${
        isHighlighted
          ? 'border-amber-400 bg-gradient-to-b from-[#1e1e2d] to-[#141520] shadow-[0_0_35px_rgba(245,158,11,0.25)] ring-2 ring-amber-400/80'
          : isOpen
          ? 'border-amber-400/50 bg-gradient-to-b from-[#181924] to-[#12131a] shadow-amber-500/5 ring-1 ring-amber-400/20'
          : 'border-slate-800/90 bg-[#13141b] hover:border-slate-700 hover:bg-[#161722]'
      }`}
    >
      <button
        type="button"
        onClick={toggleVisibility}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${elementId}`}
        className="w-full py-4 sm:py-5 px-4 sm:px-6 text-left flex items-center justify-between gap-3 sm:gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 rounded-2xl group"
      >
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <span
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold font-mono transition-all duration-300 ${
              isHighlighted
                ? 'bg-amber-400 text-black border border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.5)] scale-110'
                : isOpen
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                : 'bg-slate-800/80 text-slate-400 border border-slate-700 group-hover:border-slate-600'
            }`}
          >
            {isHighlighted ? (
              <Sparkles className="w-4 h-4 text-black fill-current animate-spin" style={{ animationDuration: '4s' }} />
            ) : index !== undefined ? (
              `${index + 1}`
            ) : (
              <HelpCircle className="w-4 h-4" />
            )}
          </span>

          <div className="flex-1 min-w-0 pr-1">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              {category && (
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400/90 inline-block">
                  {category}
                </span>
              )}
              {isHighlighted && (
                <span className="text-[9px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/50 inline-flex items-center gap-1 animate-pulse">
                  <span>Tópico Selecionado</span>
                </span>
              )}
            </div>
            <h3
              className={`text-xs sm:text-base font-bold transition-colors leading-snug break-words ${
                isHighlighted
                  ? 'text-amber-300 font-extrabold'
                  : isOpen
                  ? 'text-amber-300 font-semibold'
                  : 'text-white group-hover:text-amber-200/90'
              }`}
            >
              {question}
            </h3>
          </div>
        </div>

        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
            isOpen
              ? 'bg-amber-400/20 text-amber-300 rotate-180'
              : 'bg-slate-800/80 text-slate-400 group-hover:text-white'
          }`}
        >
          <ChevronDown className="w-4 h-4 transition-transform duration-300" />
        </div>
      </button>

      {/* Conteúdo Expansível com Animação de Deslize (Slide-Down) Suave */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`faq-answer-${elementId}`}
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -8 }}
            transition={{
              height: { duration: 0.35, ease: [0.04, 0.62, 0.23, 0.98] },
              opacity: { duration: 0.28, ease: 'easeOut' },
              y: { duration: 0.3, ease: 'easeOut' }
            }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-6 pb-5 pt-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans-body border-t border-slate-800/80 bg-black/25 w-full">
              {/* Texto garantido sem corte horizontal com break-words e flexibilidade em telas estreitas */}
              <p className="text-slate-300 leading-relaxed text-xs sm:text-sm break-words whitespace-normal">
                {answer}
              </p>

              {/* Feedback de utilidade discreto */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                <span className="text-[11px] sm:text-xs text-slate-400">Esta resposta esclareceu sua dúvida?</span>
                {feedbackGiven ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1 text-[11px]">
                    <Check className="w-3.5 h-3.5" />
                    Obrigado pelo seu feedback!
                  </span>
                ) : (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setFeedbackGiven('yes')}
                      className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                      aria-label="Avaliar resposta como útil"
                    >
                      <ThumbsUp className="w-3 h-3 text-emerald-400" />
                      <span>Sim</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedbackGiven('no')}
                      className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-[11px]"
                      aria-label="Avaliar resposta como não útil"
                    >
                      Não
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
