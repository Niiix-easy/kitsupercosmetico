import React, { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck, Tag, Sparkles } from 'lucide-react';
import { CartItem, ProductBundle } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (bundleId: string, quantity: number) => void;
  onRemoveItem: (bundleId: string) => void;
  onOpenCheckout: (discountAmount: number, couponApplied: string) => void;
  onToggleAddOn: (bundleId: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onOpenCheckout,
  onToggleAddOn
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const [cep, setCep] = useState('');
  const [cepResult, setCepResult] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate totals
  const subtotal = cartItems.reduce((acc, item) => {
    const itemTotal = item.bundle.price * item.quantity;
    const addOnTotal = item.addOn ? item.addOn.price * item.quantity : 0;
    return acc + itemTotal + addOnTotal;
  }, 0);

  const discountRate = appliedCoupon === 'RECONSTRUCAO10' ? 0.1 : 0;
  const discountAmount = subtotal * discountRate;
  const total = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const clean = couponCode.trim().toUpperCase();
    if (clean === 'RECONSTRUCAO10' || clean === 'DYUSAR10') {
      setAppliedCoupon('RECONSTRUCAO10');
      setCouponCode('');
    } else {
      setCouponError('Cupom inválido. Tente: RECONSTRUCAO10');
    }
  };

  const handleCalculateCep = (e: React.FormEvent) => {
    e.preventDefault();
    if (cep.length >= 8) {
      setCepResult('Frete Expresso: 2 a 5 dias úteis (GRÁTIS hoje)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md h-full bg-[#121319] border-l border-amber-500/30 flex flex-col justify-between shadow-2xl z-10 overflow-hidden">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#151720] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white font-serif-display">Seu Carrinho de Compras</h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-300">
              {cartItems.reduce((acc, item) => acc + item.quantity, 0)} itens
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar carrinho"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress bar */}
        <div className="bg-[#191b24] px-4 py-2.5 border-b border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" />
              Parabéns! Você ganhou Frete Grátis para todo o Brasil
            </span>
            <span className="text-emerald-400 font-mono font-bold">100%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full w-full" />
          </div>
        </div>

        {/* Items List Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <ShoppingBag className="w-12 h-12 text-slate-600 mb-3 stroke-[1.5]" />
              <p className="text-sm font-semibold text-white">Seu carrinho está vazio</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Selecione o kit ideal para o seu cabelo e recupere até 97% da massa capilar.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 text-xs font-bold uppercase rounded-lg bg-amber-400 text-black hover:brightness-110"
              >
                Ver Kits Promocionais
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.bundle.id}
                className="p-3.5 rounded-xl bg-[#171922] border border-slate-800 flex flex-col gap-3 shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-14 h-16 rounded-lg bg-black/60 border border-amber-500/30 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                    <LazyLoadImage
                      src={item.bundle.image || '/images/kit-profissional-1litro.png'}
                      alt={item.bundle.title}
                      effect="opacity"
                      wrapperClassName="w-full h-full flex items-center justify-center"
                      onError={(e: any) => {
                        e.currentTarget.src = '/images/kit-profissional-1litro.png';
                      }}
                      className="max-h-full max-w-full object-contain filter drop-shadow-sm"
                    />
                  </div>

                  <div className="flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                      {item.bundle.title}
                    </h4>
                    <p className="text-[11px] text-amber-300 font-mono mt-0.5">
                      R$ {item.bundle.price.toFixed(2).replace('.', ',')}
                    </p>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">
                      12x de R$ {item.bundle.installmentValue.toFixed(2).replace('.', ',')} sem juros
                    </span>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.bundle.id)}
                    aria-label="Remover item"
                    className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Quantity Stepper & Subtotal */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg p-0.5">
                    <button
                      onClick={() => onUpdateQuantity(item.bundle.id, item.quantity - 1)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-mono font-bold text-white px-2">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.bundle.id, item.quantity + 1)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-xs font-bold text-white font-mono">
                    Total: R$ {(item.bundle.price * item.quantity).toFixed(2).replace('.', ',')}
                  </span>
                </div>

                {/* Exclusive Add-on Offer */}
                <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-tight block">
                      OFERTA EXCLUSIVA DO CARRINHO:
                    </span>
                    <p className="text-[11px] text-slate-300 leading-tight">
                      Óleo Sublime de Ojon 60ml (+ R$ 29,90)
                    </p>
                  </div>
                  <button
                    onClick={() => onToggleAddOn(item.bundle.id)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded transition-colors ${
                      item.addOn
                        ? 'bg-emerald-500 text-black'
                        : 'bg-amber-400/20 text-amber-300 border border-amber-400/40 hover:bg-amber-400/30'
                    }`}
                  >
                    {item.addOn ? 'Adicionado ✓' : '+ Adicionar'}
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Coupon input */}
          {cartItems.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#14151b] border border-slate-800">
              <label className="text-[11px] font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>Possui cupom de desconto?</span>
              </label>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Ex: RECONSTRUCAO10"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white uppercase focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700"
                >
                  Aplicar
                </button>
              </form>
              {appliedCoupon && (
                <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1 font-semibold">
                  <span>✓ Cupom {appliedCoupon} aplicado: 10% de desconto!</span>
                </p>
              )}
              {couponError && (
                <p className="text-[11px] text-red-400 mt-1">{couponError}</p>
              )}
            </div>
          )}

          {/* CEP Simulator */}
          {cartItems.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#14151b] border border-slate-800 text-xs">
              <label className="font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>Simular prazo de entrega com Frete Grátis:</span>
              </label>
              <form onSubmit={handleCalculateCep} className="flex gap-2">
                <input
                  type="text"
                  maxLength={9}
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  placeholder="00000-000"
                  className="w-32 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                >
                  Calcular
                </button>
              </form>
              {cepResult && (
                <p className="text-[11px] text-emerald-400 mt-1.5 font-semibold">
                  ✓ {cepResult}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Bottom Checkout Actions */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#151720] space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Desconto cupom</span>
                  <span className="font-mono">- R$ {discountAmount.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Frete Expresso Nacional</span>
                <span className="text-emerald-400 font-bold uppercase text-[10px]">Grátis</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                <span>Total a Pagar</span>
                <span className="text-amber-300 font-mono text-lg">
                  R$ {total.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 text-right">
                ou 12x de <strong className="text-white">R$ {(total / 12).toFixed(2).replace('.', ',')}</strong> sem juros
              </p>
            </div>

            <button
              onClick={() => onOpenCheckout(discountAmount, appliedCoupon)}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-bold uppercase tracking-wider text-black bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>Avançar para o Pagamento</span>
                <ArrowRight className="w-4 h-4" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] animate-shimmer" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ambiente Seguro com Criptografia SSL 256-bit</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
