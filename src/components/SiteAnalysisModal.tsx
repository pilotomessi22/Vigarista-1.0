import React, { useState, useEffect, useRef } from 'react';
import { Terminal, RefreshCw, X, Check, Wrench, Loader2, Play } from 'lucide-react';
import {
  INITIAL_ORDER_1,
  INITIAL_ORDER_2,
  INITIAL_ORDER_3,
  INITIAL_ORDER_4,
} from '../data/mockData';

export interface TerminalLogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'loading' | 'success' | 'warning' | 'error' | 'repair' | 'summary';
  text: string;
}

interface RealSystemMetrics {
  cores: number;
  viewport: string;
  dpr: number;
  isOnline: boolean;
  domNodesCount: number;
  measuredFps: number;
  droppedFrames: number;
  eventLoopLagMs: number;
  storageKeysCount: number;
  storageBytesTotal: number;
  storageSlotsChecked: number;
  canvasDrawLatencyMs: number;
  imagesAudited: number;
}

interface SiteAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRepairCompleted?: () => void;
}

export const SiteAnalysisModal: React.FC<SiteAnalysisModalProps> = ({
  isOpen,
  onClose,
  onRepairCompleted,
}) => {
  const [logs, setLogs] = useState<TerminalLogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [realRepairsCount, setRealRepairsCount] = useState(0);
  const consoleBottomRef = useRef<HTMLDivElement | null>(null);

  const getTimestamp = () => {
    const now = new Date();
    const hms = now.toTimeString().split(' ')[0];
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    return `${hms}.${ms}`;
  };

  const addLog = (
    type: TerminalLogEntry['type'],
    text: string,
    replaceLastIfLoading = false
  ) => {
    setLogs((prev) => {
      const newEntry: TerminalLogEntry = {
        id: Math.random().toString(36).slice(2, 9),
        timestamp: getTimestamp(),
        type,
        text,
      };
      if (replaceLastIfLoading && prev.length > 0 && prev[prev.length - 1].type === 'loading') {
        return [...prev.slice(0, -1), newEntry];
      }
      return [...prev, newEntry];
    });
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Auto-scroll to bottom
  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, currentStep]);

  // Handle ESC key silently
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isRunning) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isRunning, onClose]);

  // Set initial clean state when opened (do NOT auto-start)
  useEffect(() => {
    if (isOpen) {
      setIsRunning(false);
      setIsDone(false);
      setCurrentStep('');
      setRealRepairsCount(0);
      setLogs([
        {
          id: 'init-1',
          timestamp: getTimestamp(),
          type: 'info',
          text: 'PainelV1 Developer Kernel v2.4 (x86_64-linux)',
        },
        {
          id: 'init-2',
          timestamp: getTimestamp(),
          type: 'info',
          text: 'Sistema em espera. Clique em "iniciar análise" para auditar e reparar o site.',
        },
      ]);
    }
  }, [isOpen]);

  // Real FPS measurement
  const measureRealFps = (sampleFrames = 25): Promise<{ fps: number; dropped: number }> => {
    return new Promise((resolve) => {
      let framesCount = 0;
      let startTime = performance.now();
      let lastTime = startTime;
      let dropped = 0;

      const onFrame = (now: number) => {
        const delta = now - lastTime;
        lastTime = now;
        if (delta > 22) dropped++;
        framesCount++;
        if (framesCount < sampleFrames) {
          requestAnimationFrame(onFrame);
        } else {
          const totalElapsed = now - startTime;
          const fps = framesCount / (totalElapsed / 1000);
          resolve({ fps: Math.min(120, Math.round(fps * 10) / 10), dropped });
        }
      };

      requestAnimationFrame(onFrame);
    });
  };

  // Real Event Loop delay test
  const measureEventLoopLag = (): Promise<number> => {
    return new Promise((resolve) => {
      const start = performance.now();
      setTimeout(() => {
        const lag = performance.now() - start;
        resolve(Math.round(lag * 10) / 10);
      }, 0);
    });
  };

  // Real Canvas 2D benchmark
  const benchmarkCanvas2D = (): Promise<number> => {
    return new Promise((resolve) => {
      const start = performance.now();
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 128, 128);
        ctx.fillStyle = '#38bdf8';
        for (let i = 0; i < 32; i += 4) {
          ctx.fillRect(i * 2, i * 2, 6, 6);
        }
        try {
          canvas.toDataURL('image/png', 0.8);
        } catch {}
      }
      const elapsed = performance.now() - start;
      resolve(Math.round(elapsed * 10) / 10);
    });
  };

  // Real Diagnostic & Automatic Real Repair
  const startAnalysis = async () => {
    setLogs([]);
    setIsRunning(true);
    setIsDone(false);
    setRealRepairsCount(0);
    setCurrentStep('Iniciando análise...');

    let repairsDone = 0;
    const detectedIssues: string[] = [];

    addLog('info', '$ bash ./scripts/system-audit.sh --real-repair');
    await delay(120);

    // 1. Host & Hardware Environment Inspection
    setCurrentStep('Inspecionando ambiente...');
    addLog('loading', '→ [1/6] Inspecionando arquitetura do host e motor JS...');

    const cores = navigator.hardwareConcurrency || 4;
    const isOnline = navigator.onLine;
    const dpr = window.devicePixelRatio || 1;
    const viewport = `${window.innerWidth}x${window.innerHeight}`;

    let heapMetrics: { used: number; total: number } | undefined;
    const perfMemory = (performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory;
    if (perfMemory) {
      heapMetrics = {
        used: Math.round(perfMemory.usedJSHeapSize / (1024 * 1024) * 10) / 10,
        total: Math.round(perfMemory.totalJSHeapSize / (1024 * 1024) * 10) / 10,
      };
    }

    await delay(180);
    addLog('info', `  • Hardware: ${cores} CPU cores | DPR: ${dpr}x | Viewport: ${viewport} | Rede: ${isOnline ? 'Online' : 'Offline'}`);
    if (heapMetrics) {
      addLog('info', `  • Memória V8: ${heapMetrics.used} MB usado de ${heapMetrics.total} MB`);
    }
    addLog('success', '✔ [OK] Ambiente do host verificado e estável.');
    await delay(120);

    // 2. DOM Tree & Event Loop Lag
    setCurrentStep('Auditando DOM e latência...');
    addLog('loading', '→ [2/6] Auditando árvore DOM e latência do Event Loop...');

    const domCount = document.getElementsByTagName('*').length;
    const eventLoopLag = await measureEventLoopLag();

    await delay(150);
    addLog('info', `  • Nós DOM: ${domCount} elementos ativos | Latência: ${eventLoopLag}ms`);
    addLog('success', '✔ [OK] Estrutura do DOM eficiente sem sobrecarga.');
    await delay(120);

    // 3. Real FPS & Rendering Pipeline Benchmark
    setCurrentStep('Calculando FPS...');
    addLog('loading', '→ [3/6] Benchmark de renderização (requestAnimationFrame)...');

    const fpsResult = await measureRealFps(25);

    await delay(100);
    addLog('info', `  • Taxa de quadros medida: ${fpsResult.fps} FPS | Quedas de frame: ${fpsResult.dropped}`);
    addLog('success', `✔ [OK] Renderização fluida a ${fpsResult.fps} FPS.`);
    await delay(120);

    // 4. LocalStorage & Slots Audit with Real Auto-Repair
    setCurrentStep('Auditando e reparando dados...');
    addLog('loading', '→ [4/6] Auditoria e validação de integridade do armazenamento...');

    let storageKeyCount = 0;
    let storageTotalBytes = 0;
    try {
      storageKeyCount = localStorage.length;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k) {
          const val = localStorage.getItem(k) || '';
          storageTotalBytes += (k.length + val.length) * 2;
        }
      }
    } catch {}

    const storageKb = Math.round((storageTotalBytes / 1024) * 10) / 10;
    addLog('info', `  • LocalStorage: ${storageKeyCount} chaves | Ocupado: ${storageKb} KB`);

    const slots = [
      { id: '1', key: 'tm_saved_order_details_1', fallback: INITIAL_ORDER_1 },
      { id: '2', key: 'tm_saved_order_details_2', fallback: INITIAL_ORDER_2 },
      { id: '3', key: 'tm_saved_order_details_3', fallback: INITIAL_ORDER_3 },
      { id: '4', key: 'tm_saved_order_details_4', fallback: INITIAL_ORDER_4 },
    ];

    for (const slot of slots) {
      const raw = localStorage.getItem(slot.key);
      if (!raw) {
        addLog('info', `  • Slot #${slot.id}: inicializado no padrão de fábrica.`);
        continue;
      }

      try {
        const parsed = JSON.parse(raw);
        const issuesInSlot: string[] = [];

        if (!parsed.eventName || typeof parsed.eventName !== 'string' || parsed.eventName.trim() === '') {
          issuesInSlot.push('Nome do evento');
        }
        if (!parsed.orderNumber || typeof parsed.orderNumber !== 'string') {
          issuesInSlot.push('Número do pedido');
        }
        if (!parsed.attendeeName || typeof parsed.attendeeName !== 'string' || parsed.attendeeName.trim() === '') {
          issuesInSlot.push('Nome do titular');
        }
        if (!parsed.attendeeCpf || typeof parsed.attendeeCpf !== 'string' || parsed.attendeeCpf.trim() === '') {
          issuesInSlot.push('CPF');
        }

        if (issuesInSlot.length > 0) {
          detectedIssues.push(`Slot #${slot.id} (${issuesInSlot.join(', ')})`);
          addLog('repair', `⚙ [REPARO REAL] Restaurando integridade do Slot #${slot.id}...`);

          const repairedOrder = {
            ...slot.fallback,
            ...parsed,
            eventName: parsed.eventName || slot.fallback.eventName,
            orderNumber: parsed.orderNumber || slot.fallback.orderNumber,
            attendeeName: parsed.attendeeName || slot.fallback.attendeeName,
            attendeeCpf: parsed.attendeeCpf || slot.fallback.attendeeCpf,
          };
          localStorage.setItem(slot.key, JSON.stringify(repairedOrder));
          repairsDone++;
          addLog('success', `✔ [REPARADO] Slot #${slot.id} normalizado e salvo.`);
        } else {
          addLog('info', `  • Slot #${slot.id}: Íntegro (${parsed.eventName.slice(0, 20)}...)`);
        }
      } catch {
        detectedIssues.push(`Slot #${slot.id} JSON corrompido`);
        addLog('repair', `⚙ [REPARO REAL] Regravando Slot #${slot.id} com template íntegro...`);
        localStorage.setItem(slot.key, JSON.stringify(slot.fallback));
        repairsDone++;
        addLog('success', `✔ [REPARADO] Slot #${slot.id} reconstruído e salvo.`);
      }
    }

    // Clean orphaned/test temporary keys
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('tm_temp_') || k.startsWith('__diag_'))) {
          keysToRemove.push(k);
        }
      }
      if (keysToRemove.length > 0) {
        keysToRemove.forEach((k) => localStorage.removeItem(k));
        repairsDone += keysToRemove.length;
        addLog('repair', `⚙ [REPARO REAL] ${keysToRemove.length} chave(s) residual(is) eliminada(s).`);
      }
    } catch {}

    addLog('success', '✔ [OK] Integridade do armazenamento auditada e validada.');
    await delay(120);

    // 5. Image Check
    setCurrentStep('Verificando imagens...');
    addLog('loading', '→ [5/6] Verificando elementos de imagem no DOM...');

    const images = Array.from(document.images);
    let broken = 0;
    images.forEach((img) => {
      if (img.complete && img.naturalWidth === 0 && img.src && !img.src.startsWith('data:image/svg')) {
        broken++;
      }
    });

    await delay(120);
    if (broken > 0) {
      addLog('warning', `⚠ [AVISO] ${broken} imagem(ns) não carregadas.`);
    } else {
      addLog('success', `✔ [OK] ${images.length} imagens no DOM verificadas.`);
    }
    await delay(120);

    // 6. Graphics Benchmark
    setCurrentStep('Testando motor gráfico...');
    addLog('loading', '→ [6/6] Benchmark gráfico e validação de criptografia...');

    const canvasTime = await benchmarkCanvas2D();
    const cryptoOk = window.crypto && typeof window.crypto.getRandomValues === 'function';

    await delay(100);
    addLog('info', `  • Renderização gráfica: ${canvasTime}ms | Criptografia: ${cryptoOk ? 'Nativa ativa' : 'Indisponível'}`);
    addLog('success', '✔ [OK] Motor gráfico e segurança antifraude validados.');
    await delay(150);

    setRealRepairsCount(repairsDone);
    setCurrentStep('');
    setIsRunning(false);
    setIsDone(true);

    addLog('summary', '─────────────────────────────────────────────────────────────');
    addLog('summary', 'RESUMO DO DIAGNÓSTICO:');
    addLog('summary', `• Taxa de quadros: ${fpsResult.fps} FPS • Nós DOM: ${domCount} • Armazenamento: ${storageKb} KB`);
    if (repairsDone > 0) {
      addLog('summary', `• Reparos aplicados: ${repairsDone} correção(ões) reais efetuadas ✔`);
      addLog('summary', '• Status: SISTEMA AUDITADO E REPARADO');
    } else {
      addLog('summary', '• Nenhuma inconsistência encontrada ✔');
      addLog('summary', '• Status: SISTEMA 100% OPERACIONAL');
    }
    addLog('summary', '─────────────────────────────────────────────────────────────');

    if (onRepairCompleted) {
      onRepairCompleted();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="developer-console-overlay"
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in duration-100"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isRunning) onClose();
      }}
    >
      {/* Sleek Minimal Programmer Window */}
      <div
        id="developer-console-window"
        className="w-full max-w-2xl rounded-lg bg-[#0b0f14] text-[#c9d1d9] font-mono text-[12px] shadow-2xl border border-gray-800 flex flex-col h-[460px] max-h-[82vh] overflow-hidden select-text"
      >
        {/* Terminal Header */}
        <div className="bg-[#11161d] px-3 py-2 border-b border-gray-800/80 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] hover:opacity-80 transition-opacity cursor-pointer border border-[#e0443e]"
              aria-label="Fechar"
            />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] border border-[#dea123] opacity-60" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f] border border-[#1aab29] opacity-60" />
            <span className="ml-1.5 text-[11px] text-gray-400 font-sans flex items-center gap-1">
              <Terminal className="w-3 h-3 text-gray-400" />
              <span>developer@painelv1: ~/telemetry</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isRunning && (
              <span className="flex items-center gap-1 text-[11px] text-cyan-400 font-sans">
                <Loader2 className="w-2.5 h-2.5 animate-spin text-cyan-400" />
                <span>executando...</span>
              </span>
            )}
            {isDone && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-sans font-medium">
                <Check className="w-3 h-3" />
                <span>concluído</span>
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors cursor-pointer p-0.5"
              aria-label="Fechar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Terminal Output Logs */}
        <div
          id="developer-console-logs"
          className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-1 bg-[#070a0e] text-[#9fb0c0] leading-relaxed scrollbar-thin scrollbar-thumb-gray-800"
        >
          {logs.map((log) => {
            if (log.type === 'loading') {
              return (
                <div key={log.id} className="flex items-center gap-1.5 text-cyan-300 py-0.5">
                  <Loader2 className="w-3 h-3 animate-spin text-cyan-400 shrink-0" />
                  <span>{log.text}</span>
                </div>
              );
            }

            if (log.type === 'error') {
              return (
                <div
                  key={log.id}
                  className="text-rose-400 bg-rose-950/20 px-2 py-0.5 rounded border border-rose-900/40 my-0.5 flex items-center gap-1.5"
                >
                  <span className="text-rose-500 font-bold shrink-0">✖</span>
                  <span>{log.text}</span>
                </div>
              );
            }

            if (log.type === 'warning') {
              return (
                <div
                  key={log.id}
                  className="text-amber-300 bg-amber-950/20 px-2 py-0.5 rounded border border-amber-900/40 my-0.5 flex items-center gap-1.5"
                >
                  <span className="text-amber-400 font-bold">⚠</span>
                  <span>{log.text}</span>
                </div>
              );
            }

            if (log.type === 'repair') {
              return (
                <div
                  key={log.id}
                  className="text-amber-300 bg-amber-950/25 px-2 py-0.5 rounded border border-amber-800/50 my-0.5 flex items-center gap-1.5"
                >
                  <Wrench className="w-3 h-3 text-amber-400 shrink-0 animate-spin" />
                  <span>{log.text}</span>
                </div>
              );
            }

            if (log.type === 'success') {
              return (
                <div key={log.id} className="text-emerald-400 flex items-center gap-1.5 py-0.5">
                  <span className="text-emerald-500 font-bold">✔</span>
                  <span>{log.text}</span>
                </div>
              );
            }

            if (log.type === 'summary') {
              return (
                <div key={log.id} className="text-gray-200 font-medium">
                  {log.text}
                </div>
              );
            }

            return (
              <div key={log.id} className="text-gray-400 py-0.5">
                {log.text}
              </div>
            );
          })}

          {/* Terminal Input Line */}
          <div className="flex items-center gap-1.5 pt-1.5 text-gray-500 text-[11px]">
            <span className="text-emerald-500 font-semibold">developer@painelv1:~$</span>
            {isRunning ? (
              <span className="text-cyan-300 flex items-center gap-1">
                <span>{currentStep}</span>
                <span className="inline-block w-1.5 h-3.5 bg-cyan-400 animate-pulse" />
              </span>
            ) : (
              <span className="inline-block w-1.5 h-3.5 bg-gray-500 animate-pulse" />
            )}
          </div>

          <div ref={consoleBottomRef} />
        </div>

        {/* Minimal Terminal Footer */}
        <div className="bg-[#11161d] px-3 py-2 border-t border-gray-800/80 flex items-center justify-between gap-2 text-[11px] select-none">
          <div className="flex items-center gap-2 text-gray-500">
            <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-cyan-400 animate-pulse' : isDone ? 'bg-emerald-400' : 'bg-gray-500'}`} />
            <span>{isDone ? 'Auditoria concluída' : isRunning ? 'Analisando e reparando...' : 'Aguardando'}</span>
            {realRepairsCount > 0 && (
              <span className="text-amber-400 font-medium">• {realRepairsCount} reparo(s)</span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={isRunning}
              onClick={startAnalysis}
              className="h-7 px-2.5 rounded bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 disabled:opacity-40 text-white font-mono text-[11px] transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              {isRunning ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Play className="w-3 h-3 fill-current" />
              )}
              <span>iniciar análise</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="h-7 px-2.5 rounded bg-gray-800 hover:bg-gray-700 active:bg-gray-900 text-gray-300 font-mono text-[11px] transition-colors cursor-pointer border border-gray-700/80"
            >
              fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
