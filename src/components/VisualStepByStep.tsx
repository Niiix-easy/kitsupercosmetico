import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, Waves, SprayCan as Spray, Droplets, Wind } from 'lucide-react';

interface VisualStepByStepProps {
  activeStep: number;
}

export const VisualStepByStep: React.FC<VisualStepByStepProps> = ({ activeStep }) => {
  // Animation variants for the visual elements
  const variants = {
    enter: { opacity: 0, scale: 0.8, y: 20 },
    center: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.8, y: -20 }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#0a0b0e] rounded-xl border border-amber-500/20 overflow-hidden min-h-[200px]">
      <AnimatePresence mode="wait">
        {activeStep === 0 && (
          <motion.div
            key="step1"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex flex-col items-center gap-4 p-6"
          >
            <div className="relative">
              <Waves className="w-16 h-16 text-sky-400" />
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-4 left-1/2 -translate-x-1/2"
              >
                <Droplets className="w-8 h-8 text-sky-300" />
              </motion.div>
            </div>
            <p className="text-sm font-bold text-sky-300 uppercase tracking-widest">Lavagem Fisiológica</p>
            <div className="text-[10px] text-slate-400 text-center max-w-[200px]">
              Shampoo abre suavemente as cutículas sem agredir.
            </div>
          </motion.div>
        )}

        {activeStep === 1 && (
          <motion.div
            key="step2"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex flex-col items-center gap-4 p-6"
          >
            <div className="relative">
              <Spray className="w-16 h-16 text-amber-400" />
              <motion.div
                animate={{ 
                  x: [20, 40, 20],
                  opacity: [0, 1, 0]
                }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute top-2 left-12"
              >
                <div className="w-12 h-8 bg-amber-400/20 blur-md rounded-full" />
              </motion.div>
            </div>
            <p className="text-sm font-bold text-amber-300 uppercase tracking-widest">Cauterização 60s</p>
            <div className="text-[10px] text-slate-400 text-center max-w-[200px]">
              Queratina nano-vetorizada penetra no córtex instantaneamente.
            </div>
          </motion.div>
        )}

        {activeStep === 2 && (
          <motion.div
            key="step3"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex flex-col items-center gap-4 p-6"
          >
            <div className="relative">
              <Droplets className="w-16 h-16 text-emerald-400" />
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full"
              />
            </div>
            <p className="text-sm font-bold text-emerald-300 uppercase tracking-widest">Blindagem Lipídica</p>
            <div className="text-[10px] text-slate-400 text-center max-w-[200px]">
              Ojon e Murumuru selam a queratina e devolvem a maciez.
            </div>
          </motion.div>
        )}

        {activeStep === 3 && (
          <motion.div
            key="step4"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex flex-col items-center gap-4 p-6"
          >
            <div className="relative">
              <Wind className="w-16 h-16 text-rose-400" />
              <motion.div
                animate={{ 
                  rotate: [0, 360]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 border border-rose-400/20 border-dashed rounded-full"
              />
            </div>
            <p className="text-sm font-bold text-rose-300 uppercase tracking-widest">Proteção Térmica</p>
            <div className="text-[10px] text-slate-400 text-center max-w-[200px]">
              Escudo contra calor de até 230°C e brilho espelhado 3D.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -100],
              opacity: [0, 0.5, 0],
              x: Math.sin(i) * 20
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            className="absolute bottom-0 text-amber-500/20"
            style={{ left: `${15 + i * 15}%` }}
          >
            <Sparkles className="w-2 h-2" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
