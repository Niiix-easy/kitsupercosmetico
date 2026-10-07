export const WHATSAPP_NUMBER = '5566996772704';
export const WHATSAPP_FORMATTED = '(66) 99677-2704';
export const WHATSAPP_DISPLAY = '+55 (66) 99677-2704';

export const getWhatsAppUrl = (customMessage?: string): string => {
  const defaultMsg = 'Olá! Gostaria de falar com o suporte Dyusar Cosméticos.';
  const msg = customMessage || defaultMsg;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
};
