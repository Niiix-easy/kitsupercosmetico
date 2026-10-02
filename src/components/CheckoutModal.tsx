import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, QrCode, CreditCard, FileText, Copy, ArrowRight, Truck, Sparkles, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  discountAmount: number;
  couponApplied: string;
  onOrderSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  discountAmount,
  couponApplied,
  onOrderSuccess
}) => {
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit' | 'boleto'>('pix');
  const [copiedPix, setCopiedPix] = useState(false);
  const [pixTimeLeft, setPixTimeLeft] = useState(900); // 15 minutes in seconds
  const [isProcessing, setIsProcessing] = useState(false);

  const [fullName, setFullName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [installments, setInstallments] = useState(12);

  if (!isOpen) return null;

  // Pricing calculations
  const rawSubtotal = cartItems.reduce((acc, item) => {
    const itemTotal = item.bundle.price * item.quantity;
    const addOnTotal = item.addOn ? item.addOn.price * item.quantity : 0;
    return acc + itemTotal + addOnTotal;
  }, 0);

  const finalSubtotal = Math.max(0, rawSubtotal - discountAmount);
  // Pix gets 10% extra discount
  const pixDiscount = paymentMethod === 'pix' ? finalSubtotal * 0.1 : 0;
  const totalToPay = finalSubtotal - pixDiscount;

  const pixPayload = `00020126580014br.gov.bcb.pix0136dyusar-pagamentos@dyusar.com.br5204000053039865405${totalToPay.toFixed(2)}5802BR5925DYUSAR COSMETICOS LTDA6009SAO PAULO62070503***6304${Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()}`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3500);
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone) return;
    setStep('payment');
  };

  const handleConfirmPayment = () => {
    if (isProcessing) return;
    
    setIsProcessing(true);

    // Simulate payment processing delay (2.5 seconds)
    setTimeout(() => {
      // Trigger confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setStep('success');
      setIsProcessing(false);
      onOrderSuccess();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#14151b] border-2 border-amber-500/40 rounded-2xl shadow-2xl p-5 sm:p-7 text-left my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Fechar checkout"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Stepper Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 pr-8">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#d4af37]">
              Checkout Seguro Dyusar
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white font-serif-display mt-0.5">
              {step === 'info' && '1. Seus Dados e Endereço de Entrega'}
              {step === 'payment' && '2. Escolha o Método de Pagamento'}
              {step === 'success' && '3. Pedido Confirmado com Sucesso!'}
            </h3>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>256-Bit SSL</span>
          </div>
        </div>

        {/* Step 1: Customer Data */}
        {step === 'info' && (
          <form onSubmit={handleInfoSubmit} className="mt-5 space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nome de quem vai receber"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">CPF (para nota fiscal) *</label>
                <input
                  type="text"
                  required
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">E-mail para rastreio *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">WhatsApp para avisos de entrega *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            {/* Address fields */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] font-bold text-amber-400 block mb-2">Endereço de Entrega:</span>
              
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div>
                  <label className="font-semibold text-slate-400 block mb-1">CEP *</label>
                  <input
                    type="text"
                    required
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    placeholder="00000-000"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-semibold text-slate-400 block mb-1">Rua / Avenida *</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ex: Rua das Flores"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-400 block mb-1">Número *</label>
                  <input
                    type="text"
                    required
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="123"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-400 block mb-1">Complemento</label>
                  <input
                    type="text"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    placeholder="Apto 42"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-400 block mb-1">Cidade / UF *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="São Paulo - SP"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Total summary before proceeding */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between mt-3">
              <span className="text-slate-300">Total do Pedido:</span>
              <span className="text-base font-bold text-amber-300 font-mono">
                R$ {finalSubtotal.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-black font-bold uppercase tracking-wider text-xs sm:text-sm hover:brightness-110 shadow-lg cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              <span>Continuar para Pagamento</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 2: Payment */}
        {step === 'payment' && (
          <div className="mt-5 space-y-4 text-xs">
            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === 'pix'
                    ? 'bg-emerald-950/30 border-emerald-400 text-emerald-300 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="w-5 h-5 text-emerald-400" />
                <span className="font-bold">PIX</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-semibold">
                  10% OFF EXTRA
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('credit')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === 'credit'
                    ? 'bg-amber-950/30 border-amber-400 text-amber-300 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-5 h-5 text-amber-400" />
                <span className="font-bold">Cartão</span>
                <span className="text-[10px] text-slate-400">Até 12x</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('boleto')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === 'boleto'
                    ? 'bg-slate-800 border-slate-600 text-white shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-5 h-5 text-slate-400" />
                <span className="font-bold">Boleto</span>
                <span className="text-[10px] text-slate-400">À vista</span>
              </button>
            </div>

            {/* PIX Method Details with Pix Copia e Cola & Visual Copy Alert */}
            {paymentMethod === 'pix' && (
              <div className="p-4 sm:p-5 rounded-xl bg-[#171922] border-2 border-emerald-500/50 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Aprovação Imediata • 10% OFF</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Expira em 14:59 min
                  </span>
                </div>

                {/* QR Code and Price Side-by-Side on Desktop */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-5 p-3 rounded-xl bg-black/40 border border-slate-800">
                  <div className="p-2.5 bg-white rounded-xl shadow-lg shrink-0">
                    <div className="w-32 h-32 bg-slate-950 rounded-lg flex flex-col items-center justify-center p-2 text-center text-white relative">
                      <QrCode className="w-20 h-20 text-emerald-400" />
                      <span className="text-[9px] text-slate-300 mt-1 font-mono font-bold tracking-wider">
                        PIX DYUSAR
                      </span>
                    </div>
                  </div>

                  <div className="text-center sm:text-left flex-1">
                    <span className="text-slate-400 text-xs">Total à vista com 10% OFF no PIX:</span>
                    <p className="text-3xl font-black text-emerald-400 font-mono mt-0.5">
                      R$ {totalToPay.toFixed(2).replace('.', ',')}
                    </p>
                    <p className="text-[11px] text-emerald-300/80 mt-1 flex items-center justify-center sm:justify-start gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Despacho em 24h com prioridade na fila</span>
                    </p>
                  </div>
                </div>

                {/* Pix Copia e Cola Box */}
                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-white flex items-center justify-between">
                    <span>Código Pix Copia e Cola:</span>
                    <span className="text-[10px] text-amber-400 font-normal">Clique para copiar</span>
                  </label>

                  <div className="relative">
                    <div 
                      onClick={handleCopyPix}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-700 text-[11px] font-mono text-slate-300 break-all select-all max-h-16 overflow-y-auto cursor-pointer hover:border-emerald-400 transition-colors"
                    >
                      {pixPayload}
                    </div>
                  </div>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className={`w-full py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                      copiedPix
                        ? 'bg-emerald-500 text-black shadow-emerald-500/30 scale-[1.01]'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black hover:brightness-110'
                    }`}
                  >
                    {copiedPix ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                        <span>Código Pix Copiado com Sucesso!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar Código Pix (Copia e Cola)</span>
                      </>
                    )}
                  </button>

                  {/* Floating Clipboard Notification Toast */}
                  {copiedPix && (
                    <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-400 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <strong>Código Pix Copiado para a Área de Transferência!</strong>
                        <p className="text-[11px] text-slate-300 mt-0.5">
                          Abra o aplicativo do seu banco, escolha <strong>Pix &gt; Pix Copia e Cola</strong> e cole o código para efetuar o pagamento.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Quick Payment Instructions */}
                  <div className="p-3 rounded-lg bg-black/40 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                    <p className="font-bold text-slate-300">Como pagar via Pix Copia e Cola:</p>
                    <ol className="list-decimal list-inside space-y-0.5 pl-1">
                      <li>Clique no botão acima para copiar o código Pix.</li>
                      <li>Abra o aplicativo do seu banco (Nubank, Itaú, BB, etc.).</li>
                      <li>Vá na opção <strong>Pix</strong> e selecione <strong>Pix Copia e Cola</strong>.</li>
                      <li>Cole o código copiado e confirme a transferência.</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* Credit Card Method Details */}
            {paymentMethod === 'credit' && (
              <div className="p-4 rounded-xl bg-[#171922] border border-slate-800 space-y-2.5">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Número do Cartão</label>
                  <input
                    type="text"
                    maxLength={19}
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Nome Impresso no Cartão</label>
                  <input
                    type="text"
                    placeholder="Como aparece no cartão"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white uppercase focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Validade</label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="MM/AA"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">CVV</label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="123"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Parcelamento</label>
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none font-mono"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                      <option key={num} value={num}>
                        {num}x de R$ {(totalToPay / num).toFixed(2).replace('.', ',')} sem juros
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Boleto Method Details */}
            {paymentMethod === 'boleto' && (
              <div className="p-4 rounded-xl bg-[#171922] border border-slate-800 text-center space-y-2">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-white font-bold">Boleto Bancário</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  O boleto será gerado para pagamento em qualquer banco ou lotérica com vencimento para 3 dias úteis. A compensação pode levar até 48 horas úteis.
                </p>
                <div className="pt-2">
                  <span className="text-amber-300 font-mono font-bold text-base">
                    Total: R$ {totalToPay.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            )}

            {/* Final Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className={`w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-black font-bold uppercase tracking-wider text-xs sm:text-sm hover:brightness-110 shadow-lg cursor-pointer flex items-center justify-center gap-2 transition-all ${
                  isProcessing ? 'opacity-80 cursor-wait scale-[0.98]' : ''
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processando Pagamento Seguro...</span>
                  </>
                ) : (
                  <>
                    <span>Finalizar Pedido com Segurança</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
              
              <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Seus dados estão protegidos por criptografia de ponta a ponta.</span>
              </div>
              
              <button
                type="button"
                onClick={() => setStep('info')}
                disabled={isProcessing}
                className={`w-full text-center text-xs text-slate-400 hover:text-white mt-2 cursor-pointer ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
              >
                ← Voltar e alterar dados de entrega
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success Confirmation */}
        {step === 'success' && (
          <div className="py-6 text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-400 shadow-xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
                Pagamento Aprovado com Sucesso!
              </span>
              <h4 className="text-2xl font-bold text-white font-serif-display mt-1">
                Obrigado por sua compra, {fullName || 'Cliente'}!
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                Número do seu pedido: <strong className="text-amber-300 font-mono">#DY-94821</strong>
              </p>
            </div>

            {/* Tracking Progress Simulation */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left space-y-3">
              <div className="flex items-center gap-3 text-xs">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-black font-bold flex items-center justify-center text-[10px]">1</span>
                <div>
                  <p className="font-bold text-white">Pagamento Confirmado</p>
                  <p className="text-[11px] text-slate-400">Enviamos a confirmação para {email || 'seu e-mail'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="w-6 h-6 rounded-full bg-amber-400 text-black font-bold flex items-center justify-center text-[10px]">2</span>
                <div>
                  <p className="font-bold text-white">Separação e Embalagem Prioritária</p>
                  <p className="text-[11px] text-slate-400">Seu kit está sendo preparado no Centro de Distribuição</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="w-6 h-6 rounded-full bg-slate-700 text-slate-400 font-bold flex items-center justify-center text-[10px]">3</span>
                <div>
                  <p className="font-bold text-slate-300">Despacho Expresso</p>
                  <p className="text-[11px] text-slate-500">Código de rastreio será enviado via WhatsApp</p>
                </div>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider"
              >
                Voltar à Página Inicial
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
