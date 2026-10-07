import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { FAQ_DATA } from '../data/productData';
import { Search, X, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { getWhatsAppUrl, WHATSAPP_FORMATTED } from '../data/whatsapp';
import { ExpandableFAQItem } from './ExpandableFAQItem';

export const FAQSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [highlightedTopicId, setHighlightedTopicId] = useState<string | null>(null);
  const [manuallyOpenedIds, setManuallyOpenedIds] = useState<Record<string, boolean>>({});

  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Categorias disponíveis para navegação rápida
  const categories = useMemo(() => {
    const cats = Array.from(new Set(FAQ_DATA.map(item => item.category).filter(Boolean))) as string[];
    return ['all', ...cats];
  }, []);

  // Filtragem combinada por busca e categoria
  const filteredFaq = useMemo(() => {
    return FAQ_DATA.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        !searchTerm.trim() ||
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  // Função central para destacar e expandir uma pergunta específica
  const highlightAndExpandQuestion = useCallback((targetId: string, shouldScroll: boolean = false) => {
    const matchedItem = FAQ_DATA.find((item) => item.id === targetId || item.id === `faq-${targetId}`);
    if (!matchedItem || !matchedItem.id) return;

    // Garante que o filtro de categoria não esconda o item procurado
    if (matchedItem.category && selectedCategory !== 'all' && selectedCategory !== matchedItem.category) {
      setSelectedCategory('all');
    }
    // Limpa termo de busca se estiver ocultando o item
    if (searchTerm) {
      setSearchTerm('');
    }

    // Força abertura do item
    setManuallyOpenedIds((prev) => ({ ...prev, [matchedItem.id!]: true }));
    setHighlightedTopicId(matchedItem.id);

    // Scroll suave para o elemento caso solicitado
    if (shouldScroll) {
      setTimeout(() => {
        const el = document.getElementById(matchedItem.id!);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 80);
    }

    // Mantém o efeito de destaque ativo por 4.5 segundos
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedTopicId(null);
    }, 4500);
  }, [selectedCategory, searchTerm]);

  // 1. Listener de Hash e Cliques em Links Internos apontando para tópicos do FAQ
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Checagem de hash inicial ao carregar a página
    const currentHash = window.location.hash.replace('#', '');
    if (currentHash && currentHash.startsWith('faq-')) {
      highlightAndExpandQuestion(currentHash, true);
    }

    // Listener para eventos de hashchange
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash.startsWith('faq-')) {
        highlightAndExpandQuestion(hash, true);
      }
    };
    window.addEventListener('hashchange', handleHashChange);

    // Interceptador de cliques em links internos que referenciem âncoras de tópicos FAQ
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a[href^="#faq-"]');
      if (target) {
        const href = target.getAttribute('href') || '';
        const topicId = href.replace('#', '');
        if (topicId) {
          e.preventDefault();
          highlightAndExpandQuestion(topicId, true);
          // Atualiza a URL sem recarregar
          window.history.replaceState(null, '', href);
        }
      }
    };
    document.addEventListener('click', handleDocumentClick);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      document.removeEventListener('click', handleDocumentClick);
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, [highlightAndExpandQuestion]);

  // 2. Listener de 'scroll' que detecta quando o usuário rola diretamente para tópicos do FAQ
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isThrottled = false;
    const handleScrollTopicObserver = () => {
      if (isThrottled) return;
      isThrottled = true;

      setTimeout(() => {
        isThrottled = false;
        // Ponto focal central da viewport (45% da altura)
        const focalY = window.scrollY + window.innerHeight * 0.45;
        const faqSection = document.getElementById('faq');
        if (!faqSection) return;

        const faqTop = faqSection.offsetTop;
        const faqBottom = faqTop + faqSection.offsetHeight;

        // Executa a detecção apenas quando a seção FAQ estiver na tela
        if (focalY >= faqTop && focalY <= faqBottom) {
          const faqItems = Array.from(document.querySelectorAll<HTMLElement>('[id^="faq-"]'));
          for (const itemEl of faqItems) {
            const top = itemEl.offsetTop;
            const bottom = top + itemEl.offsetHeight;

            // Se o item estiver exatamente no ponto focal
            if (focalY >= top && focalY <= bottom) {
              const itemId = itemEl.id;
              // Se houver hash na URL condizente com este item, reforça abertura
              if (window.location.hash === `#${itemId}`) {
                setManuallyOpenedIds((prev) => (prev[itemId] ? prev : { ...prev, [itemId]: true }));
              }
              break;
            }
          }
        }
      }, 150);
    };

    window.addEventListener('scroll', handleScrollTopicObserver, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScrollTopicObserver);
    };
  }, []);

  // Schema.org JSON-LD FAQPage para SEO
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': FAQ_DATA.map((item) => ({
      '@type': 'Question',
      'name': item.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.answer
      }
    }))
  };

  // Tópicos populares para navegação rápida de links internos
  const quickTopicLinks = [
    { label: 'Compatibilidade Química', id: 'faq-quimica' },
    { label: 'Frequência de Uso', id: 'faq-frequencia' },
    { label: 'Garantia de 7 Dias', id: 'faq-garantia' },
    { label: 'Rendimento dos Kits', id: 'faq-rendimento' },
    { label: 'Uso de Secador/Prancha', id: 'faq-secador' },
    { label: 'Envio & Rastreamento', id: 'faq-envio' }
  ];

  return (
    <section id="faq" data-section="faq" className="py-16 lg:py-24 bg-[#0f1015] border-t border-amber-500/20 relative">
      {/* Schema.org FAQPage Structured Data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-[#d4af37] border border-amber-500/30 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Tire Suas Dúvidas</span>
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1 font-serif-display">
            Perguntas Frequentes
          </h2>
          <p className="text-xs sm:text-base text-slate-300 mt-2 font-sans-body max-w-2xl mx-auto leading-relaxed">
            Respostas completas sobre modo de uso, segurança química, rendimento e entrega do Kit Super Reconstrução Dyusar.
          </p>
        </div>

        {/* Links Internos Rápidos para Tópicos Específicos */}
        <div className="mb-6 p-3 sm:p-4 rounded-xl bg-[#14151e] border border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Ir direto para a sua dúvida:
          </span>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {quickTopicLinks.map((topic) => (
              <a
                key={topic.id}
                href={`#${topic.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  highlightAndExpandQuestion(topic.id, true);
                  window.history.replaceState(null, '', `#${topic.id}`);
                }}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer inline-flex items-center gap-1 ${
                  highlightedTopicId === topic.id
                    ? 'bg-amber-400 text-black font-bold border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                    : 'bg-slate-900/80 text-slate-300 border-slate-700/60 hover:border-amber-400/50 hover:text-white'
                }`}
              >
                <span>{topic.label}</span>
                <ArrowRight className="w-3 h-3 opacity-60" />
              </a>
            ))}
          </div>
        </div>

        {/* Search & Navigation Bar para Facilitar Navegação do Usuário */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar dúvida (ex: química, loiras, garantia, como usar)..."
              className="w-full pl-11 pr-10 py-3 rounded-xl bg-[#14151e] border border-slate-700/80 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-amber-400 transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                aria-label="Limpar pesquisa"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filtros por Categoria */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            {categories.map((cat) => {
              const label = cat === 'all' ? 'Todas as Perguntas' : cat;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lista de FAQ Expansível com Slide-Down e Suporte a Destaque por Links Internos */}
        <div className="space-y-3.5">
          {filteredFaq.length > 0 ? (
            filteredFaq.map((item, idx) => {
              const isHighlighted = highlightedTopicId === item.id;
              const isForceOpen = Boolean(manuallyOpenedIds[item.id!]) || isHighlighted;

              return (
                <ExpandableFAQItem
                  key={item.id || item.question}
                  id={item.id}
                  question={item.question}
                  answer={item.answer}
                  category={item.category}
                  defaultOpen={idx === 0 && !searchTerm} // Primeiro item aberto por padrão na carga inicial
                  forceOpen={isForceOpen ? true : undefined}
                  isHighlighted={isHighlighted}
                  index={idx}
                  onToggle={(openState) => {
                    if (item.id) {
                      setManuallyOpenedIds((prev) => ({ ...prev, [item.id!]: openState }));
                    }
                  }}
                />
              );
            })
          ) : (
            <div className="text-center py-10 px-4 rounded-2xl bg-[#14151b] border border-slate-800 space-y-3">
              <HelpCircle className="w-10 h-10 text-slate-500 mx-auto stroke-[1.5]" />
              <p className="text-sm font-semibold text-white">Nenhuma resposta encontrada para "{searchTerm}"</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Não encontrou o que procurava? Chame nossa equipe diretamente pelo WhatsApp e responderemos imediatamente.
              </p>
              <a
                href={getWhatsAppUrl(`Olá! Gostaria de tirar uma dúvida sobre o Kit Dyusar: "${searchTerm}"`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4 text-white" />
                <span>Perguntar no WhatsApp: {WHATSAPP_FORMATTED}</span>
              </a>
            </div>
          )}
        </div>

        {/* WhatsApp Support Callout */}
        <div className="mt-12 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-950/25 via-slate-900 to-emerald-950/25 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-emerald-500/20 text-[#25D366] flex items-center justify-center shrink-0">
              <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold text-white">Ainda tem dúvidas sobre o seu cabelo?</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Nossa equipe de especialistas atende você ao vivo no WhatsApp: <strong className="text-emerald-400 font-mono">{WHATSAPP_FORMATTED}</strong>
              </p>
            </div>
          </div>

          <a
            href={getWhatsAppUrl('Olá, tenho dúvidas sobre o Kit Super Reconstrução Dyusar!')}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider transition-colors shrink-0 flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <WhatsAppIcon className="w-4 h-4 text-black" />
            <span>Falar no WhatsApp</span>
          </a>
        </div>

      </div>
    </section>
  );
};
