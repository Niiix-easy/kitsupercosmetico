import React, { useState } from 'react';
import { Search, X, Package, Truck, CheckCircle2, Clock, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ isOpen, onClose }) => {
  const [trackingId, setTrackingId] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setHasSearched(true);
    }, 600);
  };

  const handleUseExample = (code: string) => {
    setTrackingId(code);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setHasSearched(true);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#14151b] border-2 border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1c1d27] to-[#14151b] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-serif-display">
                Rastreamento de Pedido Dyusar
              </h3>
              <p className="text-[11px] text-slate-400">
                Acompanhe o status de entrega do seu Kit Super Reconstrução
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Digite o número do seu pedido ou código de rastreio:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Ex: DY-8942 ou BR94821034"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              <button
                type="submit"
                disabled={isLoading || !trackingId.trim()}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 disabled:opacity-50 cursor-pointer transition-all"
              >
                {isLoading ? 'Buscando...' : 'Rastrear'}
              </button>
            </div>

            {/* Quick Example Trigger */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
              <span>Testar com pedido simulado:</span>
              <button
                type="button"
                onClick={() => handleUseExample('DY-8942-BR')}
                className="text-amber-400 hover:underline font-mono font-medium"
              >
                DY-8942-BR (Em Trânsito)
              </button>
            </div>
          </form>

          {/* Results Area */}
          {hasSearched && (
            <div className="space-y-4 pt-2 border-t border-slate-800 animate-fadeIn">
              {/* Order Summary Card */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block">CÓDIGO DE RASTREIO</span>
                  <span className="text-sm font-bold text-amber-300 font-mono">
                    {trackingId.toUpperCase()}
                  </span>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Transportadora: <strong>Jadlog Express / Correios Sedex</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Em Trânsito Prioritário
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">Previsão: <strong>2 dias úteis</strong></p>
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="p-4 rounded-xl bg-[#171922] border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Histórico de Movimentação</span>
                </h4>

                <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
                  {/* Step 4 */}
                  <div className="flex items-start gap-3 relative">
                    <div className="w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center shrink-0 z-10 shadow-md">
                      <Truck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">
                        Objeto em rota de entrega ao destinatário
                      </p>
                      <p className="text-[11px] text-amber-300/90 mt-0.5">Centro de Distribuição Regional</p>
                      <span className="text-[10px] text-slate-500 font-mono">Hoje às 08:35</span>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3 relative">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center shrink-0 z-10">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-200 leading-tight">
                        Transferência interestadual concluída
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Em trânsito com seguro de carga ativo</p>
                      <span className="text-[10px] text-slate-500 font-mono">Ontem às 19:20</span>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3 relative">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center shrink-0 z-10">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-200 leading-tight">
                        Objeto postado pela fábrica Dyusar
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Nota Fiscal Eletrônica e Lote homologado</p>
                      <span className="text-[10px] text-slate-500 font-mono">Há 2 dias às 14:10</span>
                    </div>
                  </div>

                  {/* Step 1 */}
                  <div className="flex items-start gap-3 relative">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center shrink-0 z-10">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-200 leading-tight">
                        Pagamento Aprovado & Pedido Confirmado
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono">Há 2 dias às 11:05</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Package Content Mini Card */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-black border border-amber-500/30 p-1 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    Kit Completo Super Reconstrução (4 Passos + Escova Polvo)
                  </p>
                  <p className="text-[10px] text-emerald-400">✓ Embalagem Antivazamento Reforçada</p>
                </div>
              </div>
            </div>
          )}

          {/* WhatsApp Support Box */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-white leading-tight">Precisa de ajuda com a sua entrega?</p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Nossa equipe de suporte está online no WhatsApp.
              </p>
            </div>
            <a
              href="https://wa.me/5511999999999?text=Ola,%20gostaria%20de%20ajuda%20com%20o%20rastreio%20do%20meu%20pedido%20Dyusar"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};
