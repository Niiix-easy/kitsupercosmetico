import React from 'react';
import { motion } from 'framer-motion';
import { WhatsAppIcon } from './WhatsAppIcon';

export const WhatsAppButton: React.FC = () => {
  const phoneNumber = '5511999999999'; // Simulated commercial number
  const message = 'Olá! Gostaria de tirar algumas dúvidas sobre o Kit Super Reconstrução da Dyusar.';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <motion.div 
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 2, type: 'spring', stiffness: 260, damping: 20 }}
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2"
    >
      {/* Floating Label - More prominent on desktop, hidden on very small mobile to save space */}
      <div className="hidden sm:block px-3 py-1.5 bg-[#121319] border border-slate-800 text-white text-[11px] font-black uppercase tracking-widest rounded-lg shadow-2xl animate-bounce">
        Suporte Especialista ✨
      </div>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-[#25D366] text-white rounded-full shadow-[0_10px_40px_-10px_rgba(37,211,102,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 group overflow-hidden"
        aria-label="Fale conosco pelo WhatsApp"
      >
        <WhatsAppIcon className="w-8 h-8 sm:w-9 sm:h-9" />
        
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        
        {/* Mobile Notification Dot */}
        <span className="absolute -top-1 -right-1 flex h-5 w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
            1
          </span>
        </span>
      </a>
    </motion.div>
  );
};

