import React, { useState } from 'react';
import { ShieldCheck, Award, Truck, Lock, RotateCcw, CheckCircle, Info, X } from 'lucide-react';

export const TrustBadgesSection: React.FC = () => {
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);

  const badges = [
    {
      icon: RotateCcw,
      title: 'Garantia de 7 Dias',
      subtitle: 'Risco zero incondicional',
      description: 'Teste por 7 dias. Se não notar recuperação da maciez e elasticidade, devolvemos 100% do seu dinheiro.',
      highlight: 'Satisfação Blindada',
      policyTitle: 'Política de Garantia Blindada Dyusar 7 Dias',
      policyDetail: 'A Dyusar assegura o compromisso de satisfação incondicional: aplique o protocolo completo de 4 passos. Se em até 7 dias após o recebimento você considerar que o resultado não atendeu às suas expectativas, basta enviar uma mensagem para nosso suporte oficial no WhatsApp (66) 99677-2704 ou e-mail com o número do seu pedido. Devolvemos 100% do valor pago, sem burocracia, sem perguntas desconfortáveis e sem taxas ocultas.'
    },
    {
      icon: Award,
      title: 'Selo de Autenticidade',
      subtitle: 'Homologado Anvisa Grau 2',
      description: 'Fórmula 100% original direto da fábrica Dyusar. Produto dermatologicamente testado e seguro para todas as químicas.',
      highlight: 'Original de Fábrica',
      policyTitle: 'Certificação de Autenticidade & Grau 2 ANVISA',
      policyDetail: 'Todos os produtos da linha Dyusar Super Reconstrução são registrados e homologados na ANVISA sob a classificação de Grau 2 (Cosméticos com eficácia terapêutica comprovada por laudos laboratoriais). Lote rastreável com lacre inviolável original de fábrica, livre de formol, petrolatos pesados ou parabenos prejudiciais. 100% compatível com loiras platinadas, progressivas e cabelos quimicamente transformados.'
    },
    {
      icon: Truck,
      title: 'Entrega Rápida com Seguro',
      subtitle: 'Despacho Expresso em 24h',
      description: 'Envio prioritário rastreado via Correios e Jadlog com seguro de carga e código de acompanhamento no WhatsApp.',
      highlight: 'Frete Grátis Hoje',
      policyTitle: 'Política de Despacho & Seguro Total de Carga',
      policyDetail: 'Seu pedido é embalado em caixas reforçadas com proteção antivazamento e despachado em até 24 horas úteis após a confirmação do pagamento. Trabalhamos com frete prioritário expresso via Correios (Sedex/PAC) e Jadlog com seguro total: em caso de extravio, dano no transporte ou atraso injustificado, reexpedimos outro kit imediatamente sem nenhum custo adicional para você.'
    },
    {
      icon: Lock,
      title: 'Compra 100% Protegida',
      subtitle: 'Criptografia SSL 256-bit',
      description: 'Seus dados pessoais e financeiros protegidos com os mais altos padrões de segurança bancária internacional.',
      highlight: 'Ambiente Blindado',
      policyTitle: 'Segurança de Dados & Criptografia Bancária',
      policyDetail: 'Ambiente de checkout certificado com selo de criptografia SSL de 256 bits e conformidade rigorosa com o padrão PCI-DSS Grau 1 (o mesmo utilizado pelas principais instituições bancárias). Não armazenamos nem temos acesso aos dados de cartão de crédito. Seus dados cadastrais e de contato são mantidos sob estrito sigilo de acordo com a Lei Geral de Proteção de Dados (LGPD).'
    }
  ];

  return (
    <section className="bg-[#121319] border-b border-amber-500/20 py-8 sm:py-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Responsive Grid: 1 col on mobile, 2 on tablet, 4 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {badges.map((badge, idx) => {
            const Icon = badge.icon;
            const isSelected = activeTooltip === idx;

            return (
              <div
                key={idx}
                onClick={() => setActiveTooltip(isSelected ? null : idx)}
                className={`relative p-4 sm:p-5 rounded-xl bg-[#161722] border transition-all duration-300 flex flex-col justify-between shadow-lg cursor-pointer group hover:-translate-y-1 ${
                  isSelected
                    ? 'border-amber-400 bg-[#1c1d2b] shadow-amber-500/10 ring-1 ring-amber-400/50'
                    : 'border-amber-500/25 hover:border-amber-400/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    
                    {/* Continuous Smooth Pulse Icon Container */}
                    <div className="relative">
                      {/* Smooth golden pulse halo */}
                      <div className="absolute -inset-1 rounded-xl bg-amber-400/25 blur-sm animate-pulse" />
                      
                      <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-[#2a2415] via-[#1a1813] to-[#121318] border border-amber-400/60 flex items-center justify-center text-amber-400 shadow-md group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5 text-amber-300 drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        {badge.highlight}
                      </span>
                      <span title="Clique para ver termos" className="text-slate-500 group-hover:text-amber-400 transition-colors p-1">
                        <Info className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white font-serif-display group-hover:text-amber-300 transition-colors">
                    {badge.title}
                  </h3>
                  
                  <p className="text-[11px] font-semibold text-amber-400/90 mt-0.5">
                    {badge.subtitle}
                  </p>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed font-sans-body">
                    {badge.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Verificado e Garantido</span>
                  </span>

                  <span className="text-[10px] text-amber-300/80 group-hover:text-amber-300 underline font-medium">
                    {isSelected ? 'Ocultar detalhes' : 'Ver termos'}
                  </span>
                </div>

                {/* Informative Tooltip Popover on Click/Hover */}
                {isSelected && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="absolute -top-3 left-0 right-0 sm:left-[-10px] sm:right-[-10px] -translate-y-full z-40 bg-[#161724] border-2 border-amber-400 rounded-xl p-4 shadow-2xl backdrop-blur-md animate-fadeIn text-left text-xs"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
                      <h4 className="font-bold text-amber-300 font-serif-display text-xs sm:text-sm">
                        {badge.policyTitle}
                      </h4>
                      <button
                        onClick={() => setActiveTooltip(null)}
                        className="text-slate-400 hover:text-white p-0.5"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-slate-200 text-[11px] sm:text-xs leading-relaxed">
                      {badge.policyDetail}
                    </p>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-amber-400 font-mono">
                      <span>✓ Dyusar Cosméticos Profissionais</span>
                      <span className="text-emerald-400 font-bold">100% Válido</span>
                    </div>

                    {/* Bottom arrow anchor */}
                    <div className="absolute -bottom-2 left-8 w-4 h-4 bg-[#161724] border-r-2 border-b-2 border-amber-400 transform rotate-45" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Media Authority / "As Seen In" Section */}
        <div className="mt-12 pt-8 border-t border-slate-800/80">
          <p className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-500 mb-6 text-center">
            Mencionado nos Maiores Veículos de Beleza & Estilo
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            {['GLAMOUR', 'VOGUE', 'ELLE', 'MARIE CLAIRE', 'ESTADÃO'].map((media) => (
              <span 
                key={media} 
                className="text-lg sm:text-xl font-black tracking-tighter text-slate-300 font-serif-display select-none hover:text-amber-400 transition-colors"
              >
                {media}
              </span>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-center gap-1.5 text-[9px] text-slate-500 uppercase font-bold tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
            <span>Resultados Cientificamente Comprovados</span>
          </div>
        </div>

      </div>
    </section>
  );
};
