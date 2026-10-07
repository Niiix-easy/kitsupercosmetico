import React, { useState } from 'react';
import { ShieldCheck, Truck, Lock, RotateCcw, Award, CheckCircle, Package, Crown, Sparkles, ArrowRight, Check, Mail, Coins, Gift } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { getWhatsAppUrl, WHATSAPP_FORMATTED, WHATSAPP_DISPLAY } from '../data/whatsapp';

interface FooterProps {
  onOpenTracking: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenTracking }) => {
  const [vipEmail, setVipEmail] = useState('');
  const [isProfessional, setIsProfessional] = useState(false);
  const [vipSubmitted, setVipSubmitted] = useState(false);

  const handleVipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vipEmail.trim()) return;
    setVipSubmitted(true);
  };

  return (
    <footer className="bg-[#08090c] border-t border-slate-800 text-slate-400 font-sans-body">
      
      {/* Dyusar Points Loyalty Rewards Display */}
      <div className="border-b border-slate-800 bg-[#0c0d13] py-7 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto rounded-2xl bg-gradient-to-r from-[#1b170c] via-[#14141d] to-[#1b170c] border border-amber-500/40 p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-black flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <Sparkles className="w-6 h-6 fill-black" />
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="text-sm sm:text-base font-extrabold text-white font-serif-display">
                  Programa de Fidelidade Dyusar Points
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-black px-2 py-0.5 rounded-full">
                  Pontos em Dobro Hoje
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                A cada <strong>R$ 1,00 gasto</strong> você acumula <strong>1 Dyusar Point</strong> automaticamente. Troque seus pontos acumulados por descontos de até 30% ou produtos full-size nos próximos pedidos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 bg-black/60 border border-amber-500/30 px-5 py-3 rounded-xl shadow-inner">
            <div className="text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-mono">SEU PEDIDO RENDE</span>
              <span className="text-lg sm:text-xl font-black text-amber-300 font-mono">Até 348 Pontos</span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-left text-[11px] text-emerald-400 font-medium leading-tight">
              ✓ 100 pts = R$ 10 OFF<br />
              ✓ Pontos sem expiração
            </div>
          </div>
        </div>
      </div>

      {/* VIP Early Access Section */}
      <div className="border-b border-slate-800/80 bg-gradient-to-r from-[#12131c] via-[#1a1b26] to-[#12131c] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Acesso Antecipado VIP Dyusar</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white font-serif-display">
              Receba Lançamentos Exclusivos e Convites para Eventos
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Cadastre seu e-mail para ter acesso prioritário a novos produtos, vagas em masterclasses técnicas com terapeutas capilares e condições de lote fechado.
            </p>
          </div>

          <div className="w-full md:w-auto shrink-0 max-w-md">
            {!vipSubmitted ? (
              <form onSubmit={handleVipSubmit} className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      required
                      placeholder="Seu melhor e-mail VIP"
                      value={vipEmail}
                      onChange={(e) => setVipEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 active:scale-98 transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Entrar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <label className="flex items-center gap-2 text-[11px] text-slate-400 cursor-pointer pt-0.5">
                  <input
                    type="checkbox"
                    checked={isProfessional}
                    onChange={(e) => setIsProfessional(e.target.checked)}
                    className="rounded border-slate-700 text-amber-400 focus:ring-0 bg-slate-900"
                  />
                  <span>Sou cabeleireiro(a) / profissional da beleza</span>
                </label>
              </form>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 flex items-center gap-2.5 text-xs animate-fadeIn">
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-black flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <strong className="block text-white text-xs">Inscrição VIP Confirmada!</strong>
                  <span className="text-[11px] text-emerald-300/90">
                    Você receberá nossos próximos lançamentos e masterclasses em primeira mão.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
                <a href="#antes-depois" className="hover:text-amber-300 transition-colors">Casos Clínicos de Antes e Depois</a>
              </li>
              <li>
                <a href="#ativos" className="hover:text-amber-300 transition-colors">Composição e Ativos Científicos</a>
              </li>
              <li>
                <a href="#tratamento" className="hover:text-amber-300 transition-colors">Protocolo dos 4 Passos</a>
              </li>
              <li>
                <a href="#depoimentos" className="hover:text-amber-300 transition-colors">Depoimentos Reais de Clientes</a>
              </li>
              <li>
                <a href="#faq" className="hover:text-amber-300 transition-colors">Perguntas Frequentes</a>
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
                  href={getWhatsAppUrl('Olá, gostaria de suporte sobre o Kit Dyusar.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/20 transition-all font-semibold text-xs"
                >
                  <WhatsAppIcon className="w-4 h-4 text-[#25D366] shrink-0" />
                  <span>{WHATSAPP_FORMATTED}</span>
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
