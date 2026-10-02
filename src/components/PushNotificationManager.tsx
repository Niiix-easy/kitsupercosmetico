import React, { useState, useEffect } from 'react';
import { Bell, BellRing, X, Sparkles, CheckCircle2, Zap } from 'lucide-react';
import { 
  isNotificationSupported, 
  getNotificationPermission, 
  requestNotificationPermission, 
  sendFlashSaleNotification 
} from '../utils/pushNotifications';

export const PushNotificationManager: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [hasPromptedFlashSale, setHasPromptedFlashSale] = useState(false);

  useEffect(() => {
    if (!isNotificationSupported()) return;

    const currentPerm = getNotificationPermission();
    setPermission(currentPerm);

    // If permission is still default and user hasn't dismissed the prompt this session
    const isDismissed = sessionStorage.getItem('dyusar_push_dismissed');
    if (currentPerm === 'default' && !isDismissed) {
      const timer = setTimeout(() => {
        setIsBannerVisible(true);
      }, 4000); // polite delay after page load
      return () => clearTimeout(timer);
    }
  }, []);

  // Flash sale simulation trigger after permission is granted
  useEffect(() => {
    if (permission === 'granted' && !hasPromptedFlashSale) {
      const flashTimer = setTimeout(() => {
        sendFlashSaleNotification(
          'Kit Profissional 1 Litro',
          'R$ 247,00 (Economize R$ 257,00 hoje)'
        );
        setHasPromptedFlashSale(true);
      }, 20000); // 20s later trigger flash sale notification
      return () => clearTimeout(flashTimer);
    }
  }, [permission, hasPromptedFlashSale]);

  const handleEnableNotifications = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    setIsBannerVisible(false);
  };

  const handleDismiss = () => {
    setIsBannerVisible(false);
    sessionStorage.setItem('dyusar_push_dismissed', 'true');
  };

  if (!isNotificationSupported() || !isBannerVisible || permission !== 'default') {
    return null;
  }

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[94%] bg-gradient-to-r from-[#1b1c28] via-[#151620] to-[#1b1c28] border-2 border-amber-500/50 rounded-2xl p-4 shadow-2xl animate-fadeIn backdrop-blur-md">
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 shrink-0">
          <BellRing className="w-5 h-5 animate-bounce" />
        </div>

        <div className="flex-1 text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-black tracking-widest text-amber-400">
              Notificações Oficiais Dyusar
            </span>
            <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 text-[9px] font-mono">
              VIP
            </span>
          </div>

          <h4 className="text-xs sm:text-sm font-bold text-white mt-0.5">
            Deseja receber avisos de rastreamento do pedido e alertas de ofertas relâmpago?
          </h4>

          <p className="text-[11px] text-slate-300 mt-1 leading-snug">
            Fique por dentro do despacho imediato da sua carga e saiba quando lotes promocionais com até 51% OFF forem liberados.
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleEnableNotifications}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-black text-xs font-bold hover:brightness-110 flex items-center gap-1.5 shadow-md cursor-pointer transition-transform hover:scale-105"
            >
              <Bell className="w-3.5 h-3.5 fill-current" />
              <span>Ativar Notificações</span>
            </button>

            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Agora Não
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-white p-1"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
