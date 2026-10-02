import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0c0d10] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-[#14151b] border-2 border-amber-500/30 rounded-2xl p-8 shadow-2xl animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
              <AlertTriangle className="w-10 h-10 text-amber-400" />
            </div>
            
            <h1 className="text-2xl font-bold text-white font-serif-display mb-3">
              Ops! Algo não saiu como esperado.
            </h1>
            
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Tivemos um problema técnico ao carregar esta parte da página. Nossa equipe já foi notificada e estamos trabalhando para resolver.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-black font-bold uppercase tracking-wider text-xs hover:brightness-110 shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recarregar Página</span>
              </button>
              
              <a
                href="/"
                className="w-full py-3 text-slate-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Voltar ao Início</span>
              </a>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
              <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest">
                Dyusar Haute Performance • Error System
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
