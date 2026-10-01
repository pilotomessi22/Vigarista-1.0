import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Copy,
  Check,
  Sparkles,
  MessageCircle,
  Send,
  Instagram,
  ShieldCheck,
  KeyRound,
  Zap,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { getPricingConfig, PlanOption } from '../utils/pricingConfig';
import { renewUserWithKey, LicensedUser } from '../utils/licenseManager';

interface RenewalPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUsername?: string;
  onRenewalSuccess?: (user: LicensedUser) => void;
}

export const RenewalPricingModal: React.FC<RenewalPricingModalProps> = ({
  isOpen,
  onClose,
  defaultUsername = '',
  onRenewalSuccess,
}) => {
  const config = getPricingConfig();
  const [copiedPix, setCopiedPix] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanOption>(config.plans[2] || config.plans[0]);
  
  // Direct renewal form state
  const [renewUsername, setRenewUsername] = useState(defaultUsername);
  const [renewKeyInput, setRenewKeyInput] = useState('');
  const [renewError, setRenewError] = useState('');
  const [renewSuccess, setRenewSuccess] = useState('');
  const [isActivating, setIsActivating] = useState(false);

  if (!isOpen) return null;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(config.pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(
      `Olá! Gostaria de renovar minha licença do Painel Vigarista no plano ${selectedPlan.name} (${selectedPlan.price}). Chave PIX paga!`
    );
    window.open(`https://wa.me/${config.whatsappNumber}?text=${text}`, '_blank');
  };

  const handleOpenTelegram = () => {
    window.open(`https://t.me/${config.telegramUser}`, '_blank');
  };

  const handleActivateNewKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setRenewError('');
    setRenewSuccess('');
    setIsActivating(true);

    const res = await renewUserWithKey(renewUsername, renewKeyInput);
    setIsActivating(false);
    if (res.success && res.user) {
      setRenewSuccess(res.message);
      if (onRenewalSuccess) {
        setTimeout(() => {
          onRenewalSuccess(res.user!);
          onClose();
        }, 1200);
      }
    } else {
      setRenewError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-4 select-none animate-in fade-in duration-150 overflow-y-auto font-sans">
      <div className="w-full max-w-2xl bg-[#0d131c] border border-cyan-500/40 rounded-3xl shadow-[0_0_60px_rgba(0,229,187,0.2)] overflow-hidden flex flex-col text-white my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#141f2d] px-6 py-4 border-b border-white/10 flex items-center justify-between relative shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Zap className="w-5 h-5 text-gray-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Renovação de Licença Vigarista
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                  PIX EXCLUSIVO
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Escolha seu plano, realize o PIX e envie o comprovante para ativação imediata
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* 1. Plans Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>1. Escolha o Plano Desejado</span>
              </h3>
              <span className="text-[11px] text-gray-400">Todos os planos incluem suporte VIP</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {config.plans.map((plan) => {
                const isSelected = selectedPlan.id === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan)}
                    className={`relative p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-b from-cyan-950/60 to-[#0e1824] border-cyan-400 shadow-[0_0_20px_rgba(0,229,187,0.15)] ring-1 ring-cyan-400/50'
                        : 'bg-[#121a24] border-white/10 hover:border-white/20'
                    }`}
                  >
                    {plan.isPopular && (
                      <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-gray-950 font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                        Mais Vendido
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white">{plan.name}</span>
                      </div>
                      <div className="flex items-baseline gap-1.5 mb-2">
                        <span className="text-lg font-extrabold text-cyan-300 font-mono tracking-tight">
                          {plan.price}
                        </span>
                        {plan.originalPrice && (
                          <span className="text-[11px] text-gray-500 line-through">
                            {plan.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    <ul className="space-y-1 text-[11px] text-gray-400 border-t border-white/5 pt-2">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-1">
                          <span className="text-emerald-400 text-[10px]">✓</span> {feat}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. PIX Payment Details Box */}
          <div className="bg-[#111923] border border-cyan-500/30 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    2. Pagamento via PIX (Apenas PIX)
                  </h4>
                  <p className="text-[11px] text-gray-400">
                    Plano selecionado: <strong className="text-cyan-300">{selectedPlan.name}</strong> • Valor:{' '}
                    <strong className="text-emerald-400">{selectedPlan.price}</strong>
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full font-bold border border-emerald-500/30">
                Aprovação Rápida
              </span>
            </div>

            {/* PIX Key Box */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider block">
                Chave PIX Oficial ({config.pixKeyType.toUpperCase()})
              </label>
              <div className="flex items-center gap-2 bg-black/60 border border-cyan-500/40 rounded-xl p-2.5">
                <span className="font-mono text-xs sm:text-sm font-bold text-cyan-300 truncate flex-1 select-all">
                  {config.pixKey}
                </span>
                <button
                  type="button"
                  onClick={handleCopyPix}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold text-xs transition-colors cursor-pointer shrink-0"
                >
                  {copiedPix ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar PIX</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-400 px-1 pt-0.5 gap-2">
                <span>Beneficiário: <strong className="text-white">{config.pixReceiverName}</strong></span>
                <span>Cidade: <strong className="text-white">{config.pixCity}</strong></span>
              </div>
            </div>

            {/* 3. Contact Channels */}
            <div className="border-t border-white/10 pt-3.5 space-y-2.5">
              <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider block">
                3. Enviar Comprovante para Receber sua Key:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-950/50 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Enviar Comprovante (WhatsApp)</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenTelegram}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all shadow-md shadow-sky-950/50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar no Telegram (@{config.telegramUser})</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4. Already have the key? Direct Activation */}
          <div className="bg-[#0b1017] border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              <span>Já recebeu sua nova Key de ativação? Ative aqui:</span>
            </div>

            {renewError && (
              <div className="p-2.5 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{renewError}</span>
              </div>
            )}

            {renewSuccess && (
              <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{renewSuccess}</span>
              </div>
            )}

            <div
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleActivateNewKey(e as any);
                }
              }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-2"
            >
              <input
                id="renew-user-input-box"
                name="vgar_rnw_usr"
                type="text"
                value={renewUsername}
                onChange={(e) => setRenewUsername(e.target.value)}
                placeholder="Seu usuário"
                required
                autoComplete="one-time-code"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                data-lpignore="true"
                data-1p-ignore="true"
                data-form-type="other"
                className="h-10 px-3 bg-[#131c27] border border-white/10 rounded-xl text-xs text-white font-medium focus:outline-none focus:border-cyan-400"
              />
              <input
                id="renew-key-input-box"
                name="vgar_rnw_tok"
                type="text"
                value={renewKeyInput}
                onChange={(e) => setRenewKeyInput(e.target.value)}
                placeholder="Cole a nova Key aqui"
                required
                autoComplete="one-time-code"
                autoCorrect="off"
                autoCapitalize="characters"
                spellCheck={false}
                data-lpignore="true"
                data-1p-ignore="true"
                data-form-type="other"
                className="h-10 px-3 bg-[#131c27] border border-cyan-500/40 rounded-xl text-xs text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-400 uppercase"
              />
              <button
                type="button"
                onClick={(e) => handleActivateNewKey(e as any)}
                disabled={isActivating || !renewUsername.trim() || !renewKeyInput.trim()}
                className="h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-90 text-gray-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
              >
                {isActivating ? (
                  <span>Ativando...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>ATIVAR ACESSO</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-[#0b1017] px-6 py-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400 shrink-0">
          <span>Suporte Oficial: <strong>{config.instagramUser}</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white font-medium cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
