/**
 * Utilitário para Sanitização do Console e Preservação de Rastreabilidade via Sentry.
 * 
 * Funcionalidades:
 * 1. Mantém um buffer em memória das mensagens de depuração (debug/log/info) geradas na inicialização.
 * 2. Após o carregamento bem-sucedido dos componentes críticos da página, limpa automaticamente
 *    o console do navegador (console.clear), mantendo o ambiente limpo e profissional para o usuário final.
 * 3. Preserva 100% da rastreabilidade: se ocorrer qualquer erro crítico (capturado por window.onerror,
 *    unhandledrejection ou Sentry), o histórico completo de logs em buffer é anexado aos breadcrumbs
 *    e enviado ao Sentry para diagnóstico detalhado da equipe técnica.
 */

import * as Sentry from '@sentry/react';
import { captureError } from './sentry';

interface BufferedLog {
  level: 'log' | 'info' | 'warn' | 'error' | 'debug';
  timestamp: string;
  args: any[];
}

// Buffer circular mantendo os últimos 50 logs de inicialização
const MAX_BUFFERED_LOGS = 50;
const logBuffer: BufferedLog[] = [];

// Referências originais dos métodos nativos do console
const originalConsole = {
  log: console.log.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  debug: console.debug ? console.debug.bind(console) : console.log.bind(console),
  clear: console.clear.bind(console)
};

let isCleaned = false;
let isInitialized = false;

/**
 * Adiciona um registro ao buffer e ao Sentry breadcrumbs
 */
function recordLog(level: BufferedLog['level'], args: any[]) {
  const timestamp = new Date().toISOString();
  
  // Limita tamanho do buffer
  if (logBuffer.length >= MAX_BUFFERED_LOGS) {
    logBuffer.shift();
  }
  
  logBuffer.push({ level, timestamp, args });

  // Adiciona como breadcrumb do Sentry para auditoria futura em caso de falha crítica
  try {
    const message = args
      .map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
      .join(' ')
      .slice(0, 250);

    Sentry.addBreadcrumb({
      category: 'console',
      message: `[${level}] ${message}`,
      level: level === 'error' ? 'error' : level === 'warn' ? 'warning' : 'debug',
      timestamp: Date.now() / 1000
    });
  } catch {
    // Silencioso se Sentry não estiver inicializado
  }
}

/**
 * Inicializa a interceptação de logs para bufferização
 */
export function initConsoleTracker(): void {
  if (typeof window === 'undefined' || isInitialized) return;
  isInitialized = true;

  // Intercepta chamadas de console.log, info e debug para bufferizá-las
  console.log = (...args: any[]) => {
    recordLog('log', args);
    if (!isCleaned) {
      originalConsole.log(...args);
    }
  };

  console.info = (...args: any[]) => {
    recordLog('info', args);
    if (!isCleaned) {
      originalConsole.info(...args);
    }
  };

  console.debug = (...args: any[]) => {
    recordLog('debug', args);
    if (!isCleaned) {
      originalConsole.debug(...args);
    }
  };

  // Erros e avisos críticos sempre são gravados e enviados ao Sentry
  console.warn = (...args: any[]) => {
    recordLog('warn', args);
    originalConsole.warn(...args);
  };

  console.error = (...args: any[]) => {
    recordLog('error', args);
    originalConsole.error(...args);

    // Envia automaticamente para o Sentry com o contexto dos logs recentes
    try {
      captureError(args[0] instanceof Error ? args[0] : new Error(String(args[0])), {
        console_args: args,
        recent_logs: logBuffer.slice(-10)
      });
    } catch {
      // Ignora falhas de reporte
    }
  };

  // Captura erros globais não tratados na janela
  window.addEventListener('error', (event) => {
    recordLog('error', [event.message, event.filename, event.lineno]);
    try {
      captureError(event.error || new Error(event.message), {
        source: 'window.onerror',
        filename: event.filename,
        lineno: event.lineno,
        recent_logs: logBuffer.slice(-15)
      });
    } catch {}
  });

  window.addEventListener('unhandledrejection', (event) => {
    recordLog('error', ['Unhandled Promise Rejection:', event.reason]);
    try {
      captureError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)), {
        source: 'unhandledrejection',
        recent_logs: logBuffer.slice(-15)
      });
    } catch {}
  });
}

/**
 * Remove automaticamente os logs de depuração do console após o carregamento bem-sucedido
 * dos componentes críticos da aplicação, deixando o console limpo e focado no usuário final.
 */
export function cleanupConsoleAfterCriticalLoad(delayMs: number = 1800): void {
  if (typeof window === 'undefined') return;

  setTimeout(() => {
    try {
      isCleaned = true;
      originalConsole.clear();

      // Deixa apenas uma discreta e elegante identificação da aplicação
      originalConsole.log(
        '%c✨ Dyusar Cosméticos – Haute Performance %c| Console otimizado para o usuário',
        'color: #d4af37; font-weight: bold; font-family: serif; font-size: 12px;',
        'color: #64748b; font-size: 11px;'
      );
    } catch {
      // Falha graciosa se console.clear() for desabilitado pelo navegador
    }
  }, delayMs);
}

/**
 * Retorna os logs armazenados em memória (útil para diagnósticos manuais ou relatórios de bug)
 */
export function getBufferedLogs(): BufferedLog[] {
  return [...logBuffer];
}
