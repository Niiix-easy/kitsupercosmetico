import React, { useState } from 'react';
import { FAQ_DATA } from '../data/productData';
import { ChevronDown } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // first item open by default

  const toggleItem = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  // Generate Schema.org JSON-LD FAQPage structured data for search engine optimization
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

  return (
    <section id="faq" className="py-16 lg:py-24 bg-[#0f1015] border-t border-amber-500/20 relative">
      {/* Schema.org FAQPage Structured Data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-xs uppercase font-bold tracking-widest text-[#d4af37]">
            Tire Suas Dúvidas
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2 font-serif-display">
            Perguntas Frequentes
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-2 font-sans-body">
            Reunimos as respostas para as dúvidas mais comuns sobre o uso, compatibilidade e resultados do Kit Super Reconstrução Dyusar.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {FAQ_DATA.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-[#14151b] overflow-hidden transition-colors hover:border-slate-700 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(idx)}
                  className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className={`text-xs sm:text-sm font-bold transition-colors ${isOpen ? 'text-amber-300' : 'text-white'}`}>
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 font-sans-body bg-black/20 animate-fadeIn">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* WhatsApp Support Callout */}
        <div className="mt-10 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/20 via-slate-900 to-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <WhatsAppIcon className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Ainda tem dúvidas sobre o seu cabelo?</p>
              <p className="text-xs text-slate-400">Nossa equipe de especialistas capilares atende você ao vivo no WhatsApp.</p>
            </div>
          </div>

          <a
            href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20tenho%20d%C3%BAvidas%20sobre%20o%20Kit%20Super%20Reconstru%C3%A7%C3%A3o%20Dyusar"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider transition-colors shrink-0"
          >
            Falar no WhatsApp
          </a>
        </div>

      </div>
    </section>
  );
};
