import React, { useState, useEffect } from 'react';
import { Flame, Clock, Truck, ShieldCheck } from 'lucide-react';

export const StockUrgencyBanner: React.FC = () => {
  const [stockLeft, setStockLeft] = useState(14);
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 47,
    seconds: 18
  });

  useEffect(() => {
    // Subtle stock decrease timer for urgency
    const stockInterval = setInterval(() => {
      setStockLeft((prev) => (prev > 4 ? prev - 1 : 4));
    }, 45000);

    // Countdown timer
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 2, minutes: 30, seconds: 0 };
      });
    }, 1000);

    return () => {
      clearInterval(stockInterval);
      clearInterval(timerInterval);
    };
  }, []);

  const formatDigits = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="w-full bg-[#121318] border-y border-amber-500/20 py-3 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Left: Dynamic Stock Counter with Progress Bar */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
          <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 text-red-400 animate-bounce" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">Estoque Promocional:</span>
              <span className="text-amber-300 font-bold font-mono">Restam apenas {stockLeft} kits</span>
            </div>
            {/* Visual Stock Bar */}
            <div className="w-48 sm:w-56 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden border border-slate-700">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.max(15, (stockLeft / 30) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center: Shipping Commitment */}
        <div className="flex items-center gap-2 text-slate-300 text-center">
          <Truck className="w-4 h-4 text-[#d4af37] shrink-0" />
          <span>
            Pedidos com pagamento aprovado hoje são <strong className="text-white">despachados com prioridade</strong>
          </span>
        </div>

        {/* Right: Countdown Timer */}
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-amber-500/30 shrink-0">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400 font-medium">Oferta expira em:</span>
          <div className="flex items-center gap-1 font-mono font-bold text-amber-300">
            <span className="bg-slate-900 px-1 py-0.5 rounded">{formatDigits(timeLeft.hours)}</span>
            <span>:</span>
            <span className="bg-slate-900 px-1 py-0.5 rounded">{formatDigits(timeLeft.minutes)}</span>
            <span>:</span>
            <span className="bg-slate-900 px-1 py-0.5 rounded">{formatDigits(timeLeft.seconds)}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
