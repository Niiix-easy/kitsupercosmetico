import React, { useState, useEffect } from 'react';
import { PURCHASE_NOTIFICATIONS } from '../data/productData';
import { CheckCircle, X, ShoppingBag } from 'lucide-react';
import { PurchaseNotification } from '../types';

export const PurchaseNotificationToast: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    // Show initial notification after 4 seconds
    const initialTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 4000);

    // Loop interval
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % PURCHASE_NOTIFICATIONS.length);
        setIsVisible(true);
      }, 1000);
    }, 14000); // changes every 14 seconds

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isDismissed]);

  const currentNotification: PurchaseNotification = PURCHASE_NOTIFICATIONS[currentIndex];

  if (isDismissed || !isVisible) return null;

  return (
    <aside 
      aria-label="Notificações de compras recentes"
      className="fixed bottom-20 sm:bottom-6 left-4 z-40 max-w-xs sm:max-w-sm bg-[#161720]/95 border border-amber-500/30 rounded-xl p-3 shadow-2xl backdrop-blur-md transition-all duration-500 transform translate-y-0"
    >
      <button
        onClick={() => setIsDismissed(true)}
        aria-label="Dispensar aviso"
        className="absolute top-2 right-2 p-1 text-slate-500 hover:text-white transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="flex items-center gap-3 pr-4">
        {/* Avatar circle */}
        <div className="relative shrink-0">
          <div className="w-11 h-11 rounded-full overflow-hidden border border-amber-400/50 shadow-md bg-slate-800">
            <img
              src={
                currentIndex % 3 === 0 ? '/images/avatar-blonde.jpg' :
                currentIndex % 3 === 1 ? '/images/avatar-brunette.jpg' :
                '/images/avatar-salon.jpg'
              }
              alt={currentNotification.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border border-black flex items-center justify-center">
            <CheckCircle className="w-3 h-3 text-black" />
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white leading-tight">
              {currentNotification.name}
            </span>
            <span className="text-[10px] text-slate-400">
              de {currentNotification.city} - {currentNotification.state}
            </span>
          </div>

          <p className="text-[11px] text-amber-300 font-semibold line-clamp-1 mt-0.5">
            Comprou {currentNotification.bundleTitle}
          </p>

          <span className="text-[9px] text-emerald-400 flex items-center gap-1 mt-0.5">
            <span>● Pedido aprovado {currentNotification.timeAgo}</span>
          </span>
        </div>
      </div>
    </aside>
  );
};
