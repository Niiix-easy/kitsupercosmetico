import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { PRODUCT_BUNDLES } from '../data/productData';
import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';

interface HairDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBundle: (bundleId: string) => void;
}

export const HairDiagnosticModal: React.FC<HairDiagnosticModalProps> = ({
  isOpen,
  onClose,
  onSelectBundle
}) => {
  const [step, setStep] = useState(1);
  const [damageType, setDamageType] = useState('');
  const [chemicalType, setChemicalType] = useState('');
  const [hairThickness, setHairThickness] = useState('');
  const [attemptId, setAttemptId] = useState<string | null>(null);

  // Track quiz start
  useEffect(() => {
    if (isOpen && step === 1 && !attemptId) {
      const startTracking = async () => {
        try {
          const docRef = await addDoc(collection(db, 'quiz_attempts'), {
            createdAt: new Date().toISOString(),
            completed: false,
            purchasedAfter: false
          });
          setAttemptId(docRef.id);
        } catch (error) {
          console.error('Tracking error:', error);
        }
      };
      startTracking();
    }
  }, [isOpen]);

  const handleRestart = () => {
    setStep(1);
    setDamageType('');
    setChemicalType('');
    setHairThickness('');
  };

  const handleFinish = async (bundleId: string) => {
    if (attemptId) {
      try {
        await updateDoc(doc(db, 'quiz_attempts', attemptId), {
          completed: true,
          purchasedAfter: true, // Marking as high intent for conversion tracking
          recommendedBundle: bundleId,
          updatedAt: new Date().toISOString()
        });
      } catch (e) {
        console.error('Update tracking error:', e);
      }
    }
    onSelectBundle(bundleId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#14151b] border-2 border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Fechar quiz"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Diagnóstico Capilar Inteligente Dyusar</span>
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-white mt-2 font-serif-display">
            Descubra Seu Protocolo Personalizado
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Passo {step} de 3 — Responda com sinceridade para o cálculo de dosagem ideal
          </p>
        </div>

        {/* Step 1: Damage State */}
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-white">
              1. Qual é o sintoma mais crítico do seu cabelo hoje?
            </p>
            <div className="grid grid-cols-1 gap-2.5">
              {[
                { id: 'chiclete', label: 'Efeito chiclete / emborrachado quando molhado', desc: 'Risco iminente de perda de massa' },
                { id: 'quebra', label: 'Quebrando facilmente ao pentear ou passar a mão', desc: 'Fios elásticos com rompimento' },
                { id: 'pontas-ralas', label: 'Pontas ralas, espigadas, duplas e sem peso', desc: 'Perda de nutrientes e ressecamento' },
                { id: 'poroso', label: 'Extremamente poroso e sem brilho após químicas', desc: 'Cutículas abertas e frizz descontrolado' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setDamageType(opt.id);
                    setStep(2);
                  }}
                  className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-amber-400/60 hover:bg-slate-800 text-left transition-all cursor-pointer flex flex-col group"
                >
                  <span className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300">
                    {opt.label}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Chemical History */}
        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-white">
              2. Qual química você aplicou nos últimos 12 meses?
            </p>
            <div className="grid grid-cols-1 gap-2.5">
              {[
                { id: 'descoloracao', label: 'Luzes, Mechas, Balayage ou Descoloração Global' },
                { id: 'alisamento', label: 'Progressiva, Botox, Selagem ou Alisamento Ácido' },
                { id: 'tintura', label: 'Coloração permanente ou tonalizantes frequentes' },
                { id: 'calor', label: 'Sem química pesada, mas uso secador e chapinha todo dia' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setChemicalType(opt.id);
                    setStep(3);
                  }}
                  className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-amber-400/60 hover:bg-slate-800 text-left transition-all cursor-pointer flex items-center justify-between group"
                >
                  <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-amber-300">
                    {opt.label}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Hair Thickness & Texture */}
        {step === 3 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-white">
              3. Como você classifica a textura e espessura do seu fio?
            </p>
            <div className="grid grid-cols-1 gap-2.5">
              {[
                { id: 'fino', label: 'Cabelo fino e delicado (perde volume rápido)' },
                { id: 'medio', label: 'Espessura média normal' },
                { id: 'grosso', label: 'Cabelo grosso e volumoso' },
                { id: 'cacheado-crespo', label: 'Ondulado, Cacheado ou Crespo (curvaturas 3A a 4C)' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setHairThickness(opt.id);
                    setStep(4);
                  }}
                  className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-amber-400/60 hover:bg-slate-800 text-left transition-all cursor-pointer flex items-center justify-between group"
                >
                  <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-amber-300">
                    {opt.label}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Diagnostic Result Recommendation */}
        {step === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-left">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Diagnóstico Concluído com Sucesso</span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white font-serif-display mt-1">
                Protocolo SOS Reconstrução com Selagem Térmica
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Seu fio está com as pontes de enxofre desestabilizadas e perda de massa na medula. A cauterização com o <strong>Passo 2 (Queratina Córtex)</strong> é mandatória para estabilizar a elasticidade.
              </p>
              
              <div className="mt-3 p-2.5 rounded bg-black/50 border border-emerald-500/20 text-xs">
                <span className="text-amber-300 font-bold block">Seu Cronograma Personalizado:</span>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  • <strong>Semana 1 e 2:</strong> Usar o Kit 2x por semana (enluvando mecha a mecha).<br />
                  • <strong>A partir da Semana 3:</strong> Manutenção a cada 10 dias.<br />
                  • <strong>Finalização:</strong> Sempre usar o Leave-in Térmico antes de fontes de calor.
                </p>
              </div>
            </div>

            {/* Recommended Kit Highlight */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#211f18] to-[#161512] border-2 border-amber-400 text-left flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-400 text-black">
                  Kit Mais Indicado para Você
                </span>
                <p className="text-sm font-bold text-white mt-1">Kit Profissional 1 Litro (Mais Vendido)</p>
                <p className="text-xs text-amber-300 font-mono font-bold mt-0.5">12x de R$ 24,70 (Frete Grátis)</p>
                <p className="text-[10px] text-slate-400">+ Brinde Escova Polvo + Válvulas Pump</p>
              </div>

              <button
                onClick={() => handleFinish('kit-profissional-1litro')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-300 to-amber-500 text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer whitespace-nowrap text-center shadow-lg"
              >
                Garantir Meu Kit Indicado
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={handleRestart}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refazer teste com outras respostas</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
