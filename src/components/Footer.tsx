import React, { useState } from 'react';
import { ShieldCheck, Truck, Lock, RotateCcw, Award, CheckCircle, Package, Crown, Sparkles, ArrowRight, Check, Mail, Coins, Gift } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { getWhatsAppUrl, WHATSAPP_FORMATTED, WHATSAPP_DISPLAY } from '../data/whatsapp';

interface FooterProps {
  onOpenTracking: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenTracking }) => {

  return (
    <footer className="bg-[#08090c] border-t border-slate-800 text-slate-400 font-sans-body">
      


      {/* Upper Footer: Main columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Philosophy */}
          <div>
            <div className="flex flex-col mb-3">
              <img
                src="/images/logo-dyusar-horizontal.webp"
                alt="Dyusar Cosméticos Profissionais"
                loading="lazy"
                width="160"
                height="32"
                className="h-8 w-auto object-contain filter brightness-110 mb-2 self-start"
              />
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#d4af37]">
                Haute Performance
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans-body">
              Cosméticos capilares profissionais desenvolvidos com tecnologia nano-biomimética para recuperação imediata de cabelos quimicamente tratados, descoloridos e danificados.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Homologado e Registrado na Anvisa</span>
            </div>
          </div>

          {/* Col 2: Navigation Links & Order Tracking */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-3">
              Navegação & Rastreio
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenTracking}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-400/40 text-amber-300 font-bold hover:bg-amber-400 hover:text-black transition-all flex items-center gap-2 cursor-pointer w-full text-left"
                >
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span>Rastrear Meu Pedido</span>
                </button>
              </li>
              <li>
                <a href="#tratamento" className="hover:text-amber-300 transition-colors">Como Funciona o Tratamento</a>
              </li>
              <li>
                <a href="#ativos" className="hover:text-amber-300 transition-colors">Composição e Ativos Científicos</a>
              </li>
              <li>
                <a href="#tratamento" className="hover:text-amber-300 transition-colors">Protocolo dos 4 Passos</a>
              </li>
              <li>
                <a href="#faq" className="hover:text-amber-300 transition-colors">Perguntas Frequentes (FAQ)</a>
              </li>
              <li>
                <a href="#faq-garantia" className="text-slate-400 hover:text-amber-300 transition-colors">Dúvidas sobre a Garantia de 7 Dias</a>
              </li>
              <li>
                <a href="#faq-quimica" className="text-slate-400 hover:text-amber-300 transition-colors">Compatibilidade com Química</a>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Warranty */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-3">
              Atendimento e Garantia
            </h4>
            <div className="space-y-2 text-xs">
              <p>
                <strong className="text-slate-300 block">Horário de Atendimento:</strong>
                Segunda a Sexta, das 09h às 18h
              </p>
              <p>
                <strong className="text-slate-300 block">E-mail de Suporte:</strong>
                contato@dyusar.com.br
              </p>
              <div>
                <strong className="text-slate-300 block mb-1">WhatsApp de Suporte:</strong>
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/20 transition-all font-semibold text-xs"
                >
                  <WhatsAppIcon className="w-4 h-4 text-[#25D366] shrink-0" />
                  <span>Atendimento via WhatsApp</span>
                </a>
              </div>
              <div className="pt-2">
                <span className="inline-block px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-semibold">
                  Garantia de 7 Dias Incondicional
                </span>
              </div>
            </div>
          </div>

          {/* Col 4: Payment & Security Seals */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-3">
              Pagamento & Segurança
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Parcele em até 12x no cartão de crédito ou garanta 10% de desconto adicional no PIX com aprovação imediata.
            </p>
            
            {/* Payment methods badges */}
            <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">PIX (10% OFF)</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">Mastercard</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">Visa</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">Elo</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">Boleto</span>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col gap-1.5 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Lock className="w-3.5 h-3.5" />
                <span>Criptografia SSL 256-bit Blindada</span>
              </div>
              <div className="flex items-center gap-1.5 text-sky-400">
                <Truck className="w-3.5 h-3.5" />
                <span>Envio Rastreado com Seguro de Carga</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Sub-footer */}
      <div className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-400 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Dyusar Cosméticos Profissionais. Todos os direitos reservados. CNPJ: 00.000.000/0001-00.</p>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <a href="#" className="hover:text-amber-300">Termos de Uso</a>
            <span>•</span>
            <a href="#" className="hover:text-amber-300">Política de Privacidade</a>
            <span>•</span>
            <a href="#" className="hover:text-amber-300">Trocas e Devoluções</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
