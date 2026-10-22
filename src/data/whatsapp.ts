export const WHATSAPP_NUMBER = '5566996772704';
export const WHATSAPP_FORMATTED = '(66) 99677-2704';
export const WHATSAPP_DISPLAY = '+55 (66) 99677-2704';
export const WHATSAPP_LINK = 'https://wa.me/message/WWITYDG6INQRM1';

export const getWhatsAppUrl = (customMessage?: string): string => {
  // Se uma mensagem personalizada for fornecida, usamos o link do número para suportar o texto.
  if (customMessage) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(customMessage)}`;
  }
  // Caso contrário, usamos o link de Business direto solicitado pelo usuário.
  return WHATSAPP_LINK;
};
