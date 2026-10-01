import React, { useEffect, useState } from 'react';
import { Download, Maximize, X, Smartphone, Sparkles, ShieldCheck } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallAppBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Check if already in standalone / installed mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if ((document.documentElement as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
          await (document.documentElement as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen request:', err);
    }
  };

  if (isInstalled || (dismissed && !showAndroidGuide)) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
        setShowAndroidGuide(true);
      }
    } else {
      setShowAndroidGuide(true);
    }
  };

  return (
    <>
      {/* Floating Top Action Banner */}
      {!dismissed && (
        <div className="fixed top-3 left-3 right-3 z-[99] md:max-w-md md:left-auto md:right-4 animate-fade-in">
          <div className="bg-[#121418]/95 backdrop-blur-xl border border-red-500/50 rounded-2xl p-3 shadow-2xl shadow-black/90 flex items-center justify-between gap-2.5 ring-1 ring-white/10">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-black p-0.5 shrink-0 shadow-lg shadow-red-900/40 overflow-hidden flex items-center justify-center">
                <img src="/pwa-192x192.png" alt="App" className="w-full h-full object-cover rounded-[10px]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-bold truncate flex items-center gap-1.5">
                  <span>VIGARISTA</span>
                  <span className="bg-red-500/20 text-red-400 text-[10px] px-1.5 py-0.5 rounded font-medium border border-red-500/30">APP</span>
                </div>
                <div className="text-gray-400 text-[11px] truncate">Modo App Nativo</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Native Fullscreen Trigger */}
              <button
                onClick={toggleFullscreen}
                className="bg-zinc-800 hover:bg-zinc-700 text-gray-200 text-xs font-semibold px-2.5 py-2 rounded-xl transition-all border border-white/10 active:scale-95 flex items-center gap-1 cursor-pointer"
                title="Tela Cheia"
              >
                <Maximize className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">Tela Cheia</span>
              </button>

              {/* Install / Options Button */}
              <button
                onClick={handleInstallClick}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-md shadow-red-950/50 active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar</span>
              </button>

              <button
                onClick={() => setDismissed(true)}
                className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Android Solutions Modal */}
      {showAndroidGuide && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161920] border border-red-500/30 rounded-3xl max-w-md w-full p-5 shadow-2xl relative animate-scale-in text-white max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAndroidGuide(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white shadow-lg shadow-red-900/40">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Soluções para Android</h3>
                <p className="text-gray-400 text-xs">Transforme em App Nativo sem barra do Google</p>
              </div>
            </div>

            <div className="space-y-3.5 text-sm text-gray-200 mb-5">
              {/* Option 1: 1-Tap Fullscreen Mode */}
              <div className="bg-gradient-to-r from-red-950/40 to-black p-3.5 rounded-2xl border border-red-500/30">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-black flex items-center justify-center">
                      1
                    </span>
                    <strong className="text-white text-sm">Modo Tela Cheia Imersiva (Instantâneo)</strong>
                  </div>
                  <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold border border-red-500/30">1 Clique</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed mb-3">
                  Faz o Chrome esconder 100% da barra de navegação e do topo, rodando em tela cheia como se fosse o app instalado.
                </p>
                <button
                  onClick={() => {
                    toggleFullscreen();
                    setShowAndroidGuide(false);
                  }}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-transform active:scale-98 shadow-md"
                >
                  <Maximize className="w-4 h-4" />
                  <span>{isFullscreen ? 'Sair da Tela Cheia' : 'Ativar Tela Cheia Agora'}</span>
                </button>
              </div>

              {/* Option 2: Samsung Internet / Brave / Edge */}
              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-6 h-6 rounded-full bg-zinc-700 text-gray-200 text-xs font-black flex items-center justify-center">
                    2
                  </span>
                  <strong className="text-white text-sm">Via Samsung Internet ou Edge</strong>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  O navegador nativo da Samsung (Samsung Internet) e o Edge criam apps reais no Android sem passar pelo bloqueio do servidor do Google:
                </p>
                <div className="mt-2 text-xs text-gray-400 bg-black/40 p-2.5 rounded-xl space-y-1">
                  <div>1. Abra o link no <strong>Samsung Internet</strong> ou <strong>Edge</strong>.</div>
                  <div>2. Toque no menu ➔ <strong>"Adicionar à tela de aplicativos"</strong>.</div>
                  <div>3. Ele cria o APK oficial no seu celular!</div>
                </div>
              </div>

              {/* Option 3: Hermit Lite Apps */}
              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-6 h-6 rounded-full bg-zinc-700 text-gray-200 text-xs font-black flex items-center justify-center">
                    3
                  </span>
                  <strong className="text-white text-sm">Criar APK Nativo via Hermit (Play Store)</strong>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  O aplicativo gratuito <strong>Hermit (Lite Apps Browser)</strong> na Google Play Store transforma qualquer URL em um app Android nativo com ícone independente, notificações e sem barras de navegador.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAndroidGuide(false)}
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
