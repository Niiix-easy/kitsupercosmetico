/**
 * Browser Notification API helper for Dyusar order updates & flash sales
 */

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  try {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      sendLocalPushNotification(
        'Dyusar VIP: Notificações Ativadas! ✨',
        'Você receberá atualizações em tempo real do rastreamento do seu pedido e avisos de ofertas relâmpago de lote.'
      );
    }
    return perm;
  } catch (err) {
    console.warn('Erro ao solicitar permissão de notificação:', err);
    return 'denied';
  }
}

export function sendLocalPushNotification(title: string, body: string, icon: string = '/images/logo-dyusar-horizontal.png') {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const notification = new Notification(title, {
      body,
      icon,
      badge: icon,
      vibrate: [200, 100, 200]
    } as any);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return true;
  } catch (err) {
    console.warn('Falha ao disparar notificação local:', err);
    return false;
  }
}

export function sendOrderUpdateNotification(orderId: string, status: string) {
  sendLocalPushNotification(
    `📦 Atualização do Pedido #${orderId}`,
    `Status atual: ${status}. Seu código de rastreamento oficial dos Correios/Sedex foi atualizado.`
  );
}

export function sendFlashSaleNotification(bundleName: string, discount: string) {
  sendLocalPushNotification(
    `⚡ Oferta Relâmpago Dyusar: ${discount}!`,
    `Aproveite condição exclusiva no ${bundleName} com Frete Grátis enquanto durar o lote promocional.`
  );
}
