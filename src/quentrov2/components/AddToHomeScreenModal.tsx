import React, { useState, useEffect } from 'react';
import { X, Share, PlusSquare, MoreVertical, Smartphone, Check, Download } from 'lucide-react';

interface AddToHomeScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddToHomeScreenModal: React.FC<AddToHomeScreenModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('ios');
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Detect platform
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isAndroid = /android/i.test(ua);

    if (isIOS) {
      setPlatform('ios');
    } else if (isAndroid) {
      setPlatform('android');
    } else {
      setPlatform('other');
    }

    // Check if already in standalone mode (PWA installed)
    const isInStandalone =
      (window.navigator as any).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(isInStandalone);

    // Listen for beforeinstallprompt on Chromium/Android
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#182022] border-t sm:border border-white/10 rounded-t-[28px] sm:rounded-[24px] p-6 w-full max-w-md text-white shadow-2xl animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#121819] flex items-center justify-center p-1.5 border border-white/10">
              <img
                src="/apple-touch-icon.png"
                alt="Quentro"
                className="w-full h-full object-cover rounded-[8px]"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Adicionar à Tela de Início
              </h3>
              <p className="text-[12px] text-[#8EA0A0]">
                Usar o Quentro em tela cheia como app nativo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status if already standalone */}
        {isStandalone ? (
          <div className="my-5 p-4 rounded-[16px] bg-[#00D2B4]/10 border border-[#00D2B4]/20 flex items-center gap-3">
            <Check className="w-5 h-5 text-[#00D2B4] shrink-0" />
            <p className="text-sm text-[#00D2B4] font-medium">
              Você já está usando o Quentro instalado na tela de início!
            </p>
          </div>
        ) : (
          <div className="my-5 space-y-4">
            {/* Direct Android / Chrome install button if prompt available */}
            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="w-full py-3.5 px-4 rounded-[16px] bg-[#00D2B4] active:bg-[#00bda2] text-[#0A1A18] font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00D2B4]/20 transition-transform active:scale-[0.98]"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                Instalar Aplicativo Agora
              </button>
            )}

            {/* Platform Selector Tabs */}
            <div className="bg-[#0C1213] p-1 rounded-[14px] flex items-center">
              <button
                onClick={() => setPlatform('ios')}
                className={`flex-1 py-2 text-xs font-semibold rounded-[10px] transition-all ${
                  platform === 'ios'
                    ? 'bg-white text-black shadow-xs'
                    : 'text-[#8EA0A0] hover:text-white'
                }`}
              >
                iPhone (iOS / Safari)
              </button>
              <button
                onClick={() => setPlatform('android')}
                className={`flex-1 py-2 text-xs font-semibold rounded-[10px] transition-all ${
                  platform === 'android'
                    ? 'bg-white text-black shadow-xs'
                    : 'text-[#8EA0A0] hover:text-white'
                }`}
              >
                Android (Chrome)
              </button>
            </div>

            {/* Step-by-Step Instructions for iOS */}
            {platform === 'ios' && (
              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-3 p-3 rounded-[14px] bg-[#121819] border border-white/[0.04]">
                  <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0 text-xs font-bold text-[#00D2B4]">
                    1
                  </div>
                  <div className="text-xs text-zinc-300">
                    No Safari, toque no botão de <span className="font-semibold text-white">Compartilhar</span> na barra inferior do navegador.
                    <div className="inline-flex items-center gap-1 ml-1 text-white bg-white/[0.08] px-1.5 py-0.5 rounded">
                      <Share className="w-3.5 h-3.5 text-[#00D2B4]" />
                      <span>Compartilhar</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-[14px] bg-[#121819] border border-white/[0.04]">
                  <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0 text-xs font-bold text-[#00D2B4]">
                    2
                  </div>
                  <div className="text-xs text-zinc-300">
                    Role a lista para baixo e toque em <span className="font-semibold text-white">"Adicionar à Tela de Início"</span>.
                    <div className="inline-flex items-center gap-1 ml-1 text-white bg-white/[0.08] px-1.5 py-0.5 rounded">
                      <PlusSquare className="w-3.5 h-3.5 text-[#00D2B4]" />
                      <span>Adicionar à Tela de Início</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-[14px] bg-[#121819] border border-white/[0.04]">
                  <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0 text-xs font-bold text-[#00D2B4]">
                    3
                  </div>
                  <div className="text-xs text-zinc-300">
                    Confirme tocando em <span className="font-semibold text-white">"Adicionar"</span> no canto superior direito.
                  </div>
                </div>
              </div>
            )}

            {/* Step-by-Step Instructions for Android */}
            {platform === 'android' && (
              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-3 p-3 rounded-[14px] bg-[#121819] border border-white/[0.04]">
                  <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0 text-xs font-bold text-[#00D2B4]">
                    1
                  </div>
                  <div className="text-xs text-zinc-300">
                    No Chrome, toque no <span className="font-semibold text-white">menu de 3 pontos</span> no canto superior direito.
                    <div className="inline-flex items-center gap-1 ml-1 text-white bg-white/[0.08] px-1.5 py-0.5 rounded">
                      <MoreVertical className="w-3.5 h-3.5 text-[#00D2B4]" />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-[14px] bg-[#121819] border border-white/[0.04]">
                  <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0 text-xs font-bold text-[#00D2B4]">
                    2
                  </div>
                  <div className="text-xs text-zinc-300">
                    Toque em <span className="font-semibold text-white">"Instalar aplicativo"</span> ou <span className="font-semibold text-white">"Adicionar à tela inicial"</span>.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-[14px] bg-[#121819] border border-white/[0.04]">
                  <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0 text-xs font-bold text-[#00D2B4]">
                    3
                  </div>
                  <div className="text-xs text-zinc-300">
                    Toque em <span className="font-semibold text-white">"Instalar"</span> para confirmar. O ícone oficial do Quentro aparecerá na tela de início.
                  </div>
                </div>
              </div>
            )}

            <div className="p-3 rounded-[14px] bg-[#00D2B4]/5 border border-[#00D2B4]/15">
              <p className="text-[11px] text-[#A1B8B8] leading-relaxed">
                ✨ <strong className="text-white">Vantagem:</strong> Ao abrir pelo ícone na tela de início, o Quentro oculta a barra de endereços do navegador e opera exatamente como o aplicativo original instalado pela App Store.
              </p>
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-[14px] bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 text-xs font-semibold transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
