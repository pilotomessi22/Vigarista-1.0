import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  ShieldCheck,
  Plus,
  Copy,
  Check,
  Trash2,
  Calendar,
  Users,
  Clock,
  Sparkles,
  AlertCircle,
  X,
  RefreshCw,
  LogOut,
  Eye,
  EyeOff,
  Edit3,
  Lock,
  CheckCircle2,
  Ban,
  RotateCcw,
  Zap,
  Terminal,
  ExternalLink,
  Activity,
  ShieldAlert,
  Mail,
  Send,
  SendHorizontal,
  MailCheck,
  Inbox,
} from 'lucide-react';
import {
  LicenseKey,
  LicensedUser,
  createNewLicenseKey,
  createDemoTestKey,
  getStoredKeys,
  getStoredUsers,
  deleteLicenseKey,
  getRemainingDays,
  decodePassword,
  updateUserPassword,
  deleteUser,
  expireUserNow,
  reactivateUser,
  expireKeyNow,
  resetUserDeviceBinding,
  resetLicenseKey,
  reactivateLicenseKey,
} from '../utils/licenseManager';
import { maskIp } from '../utils/deviceSecurity';
import { subscribeToCloudSync, forceSyncFromCloud } from '../utils/firebaseSync';
import {
  LoginAttemptLog,
  subscribeToLoginLogs,
  getLocalCachedLogs,
} from '../utils/securityLogs';
import {
  sendLicenseByEmail,
  fetchEmailLogs,
  fetchEmailConfig,
  saveEmailConfig,
  EmailLog,
} from '../utils/emailDelivery';

interface MasterAdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterAppAsMaster?: () => void;
}

export const MasterAdminPanel: React.FC<MasterAdminPanelProps> = ({
  isOpen,
  onClose,
  onEnterAppAsMaster,
}) => {
  const [activeTab, setActiveTab] = useState<'email' | 'generate' | 'keys' | 'users' | 'logs'>('email');
  const [daysToValidate, setDaysToValidate] = useState<number>(30);
  const [keysList, setKeysList] = useState<LicenseKey[]>([]);
  const [usersList, setUsersList] = useState<LicensedUser[]>([]);
  const [logsList, setLogsList] = useState<LoginAttemptLog[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<LicenseKey | null>(null);

  // Email Delivery System State
  const [emailDest, setEmailDest] = useState<string>('');
  const [emailClientName, setEmailClientName] = useState<string>('');
  const [emailPlanDays, setEmailPlanDays] = useState<number>(30);
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [emailLogsList, setEmailLogsList] = useState<EmailLog[]>([]);
  const [resendConfig, setResendConfig] = useState<{ configured: boolean; maskedKey: string; sender: string }>({
    configured: true,
    maskedKey: 're_HrJ...Y9G',
    sender: 'VIGARISTA VIP <onboarding@resend.dev>',
  });
  const [quickSendKeyModal, setQuickSendKeyModal] = useState<LicenseKey | null>(null);
  const [quickSendEmail, setQuickSendEmail] = useState<string>('');

  // User password management state
  const [visiblePasswords, setVisiblePasswords] = useState<{ [username: string]: boolean }>({});
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [adminFeedback, setAdminFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);

  const refreshData = () => {
    setKeysList(getStoredKeys());
    setUsersList(getStoredUsers());
    setLogsList(getLocalCachedLogs());
    fetchEmailLogs().then((logs) => setEmailLogsList(logs));
    fetchEmailConfig().then((cfg) => setResendConfig(cfg));
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
      setNewlyCreatedKey(null);
      setEditingUser(null);
      setNewPasswordInput('');
      setAdminFeedback(null);

      // Subscribe to real-time cloud updates (Firebase Firestore)
      const unsubCloud = subscribeToCloudSync(() => {
        refreshData();
      });

      // Periodic auto-refresh every 3 seconds while panel is open
      const pollInterval = setInterval(() => {
        refreshData();
      }, 3000);

      // Subscribe to real-time login attempt logs (Firebase Firestore)
      const unsubLogs = subscribeToLoginLogs((logs) => {
        setLogsList(logs);
      });

      return () => {
        unsubCloud();
        unsubLogs();
        clearInterval(pollInterval);
      };
    }
  }, [isOpen]);

  const handleSendEmailLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailDest || !emailDest.includes('@')) {
      setAdminFeedback({ type: 'error', text: 'Por favor, insira um endereço de e-mail válido.' });
      return;
    }

    setIsSendingEmail(true);
    setAdminFeedback(null);

    try {
      // 1. Generate key for the selected duration
      const keyObj = createNewLicenseKey(emailPlanDays);
      setNewlyCreatedKey(keyObj);

      // 2. Identify Plan Name
      let planName = 'Plano Mensal (30 Dias)';
      if (emailPlanDays === 1) planName = 'Passe Diário (24 Horas)';
      else if (emailPlanDays === 7) planName = 'Plano Semanal (7 Dias)';
      else if (emailPlanDays === 90) planName = 'Plano Trimestral (90 Dias)';
      else if (emailPlanDays === 365) planName = 'Plano Anual (365 Dias)';
      else if (emailPlanDays >= 3650) planName = 'Plano Vitalício (Acesso Permanente)';

      // 3. Dispatch via Resend API
      const res = await sendLicenseByEmail({
        toEmail: emailDest.trim(),
        clientName: emailClientName.trim() || undefined,
        licenseKey: keyObj.key,
        planName,
        daysValid: emailPlanDays,
      });

      if (res.success) {
        setAdminFeedback({
          type: 'success',
          text: `👑 Chave ${keyObj.key} gerada e ENVIADA com sucesso para ${emailDest}!`,
        });
        setEmailDest('');
        setEmailClientName('');
        refreshData();
      } else {
        setAdminFeedback({
          type: 'error',
          text: `Chave gerada (${keyObj.key}), mas falha no envio do e-mail: ${res.message}`,
        });
        refreshData();
      }
    } catch (err: any) {
      setAdminFeedback({ type: 'error', text: 'Erro ao processar envio: ' + (err?.message || 'Erro interno') });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleResendExistingKey = async (log: EmailLog) => {
    setIsSendingEmail(true);
    try {
      const res = await sendLicenseByEmail({
        toEmail: log.toEmail,
        clientName: log.clientName,
        licenseKey: log.licenseKey,
        planName: log.planName,
        daysValid: log.daysValid,
      });
      if (res.success) {
        setAdminFeedback({ type: 'success', text: `E-mail reenviado com sucesso para ${log.toEmail}!` });
      } else {
        setAdminFeedback({ type: 'error', text: `Falha ao reenviar: ${res.message}` });
      }
      refreshData();
    } catch (err: any) {
      setAdminFeedback({ type: 'error', text: 'Erro ao reenviar: ' + err.message });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleQuickSendAnyKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSendKeyModal || !quickSendEmail || !quickSendEmail.includes('@')) {
      setAdminFeedback({ type: 'error', text: 'Informe um e-mail válido para envio.' });
      return;
    }

    setIsSendingEmail(true);
    try {
      const res = await sendLicenseByEmail({
        toEmail: quickSendEmail.trim(),
        licenseKey: quickSendKeyModal.key,
        planName: quickSendKeyModal.daysValid >= 3650 ? 'Plano Vitalício' : `${quickSendKeyModal.daysValid} Dias`,
        daysValid: quickSendKeyModal.daysValid,
      });

      if (res.success) {
        setAdminFeedback({ type: 'success', text: `Chave ${quickSendKeyModal.key} enviada para ${quickSendEmail}!` });
        setQuickSendKeyModal(null);
        setQuickSendEmail('');
      } else {
        setAdminFeedback({ type: 'error', text: `Falha no envio: ${res.message}` });
      }
      refreshData();
    } catch (err: any) {
      setAdminFeedback({ type: 'error', text: 'Erro no envio: ' + err.message });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleForceCloudSync = async () => {
    setIsCloudSyncing(true);
    const result = await forceSyncFromCloud();
    refreshData();
    setIsCloudSyncing(false);
    setAdminFeedback({
      type: 'success',
      text: `Sincronização em Nuvem atualizada com sucesso! (${result.keysCount} keys, ${result.usersCount} clientes)`,
    });
  };

  if (!isOpen) return null;

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (daysToValidate < 1) return;

    const created = createNewLicenseKey(daysToValidate);
    setNewlyCreatedKey(created);
    refreshData();
  };

  const handleGenerateDemoKey = () => {
    const created = createDemoTestKey();
    setNewlyCreatedKey(created);
    setAdminFeedback({ type: 'success', text: '⚡ Key de Demonstração (20 Minutos) gerada com sucesso!' });
    refreshData();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDeleteKey = (keyStr: string) => {
    deleteLicenseKey(keyStr);
    setAdminFeedback({ type: 'success', text: `Key ${keyStr} removida com sucesso.` });
    refreshData();
  };

  const handleExpireKey = async (keyStr: string) => {
    const res = await expireKeyNow(keyStr);
    setAdminFeedback({ type: 'success', text: res.message });
    refreshData();
  };

  const togglePasswordVisibility = (username: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [username]: !prev[username],
    }));
  };

  const handleStartEditPassword = (username: string, currentHash: string) => {
    setEditingUser(username);
    setNewPasswordInput(decodePassword(currentHash));
    setAdminFeedback(null);
  };

  const handleSavePassword = (username: string) => {
    const res = updateUserPassword(username, newPasswordInput);
    if (res.success) {
      setAdminFeedback({ type: 'success', text: res.message });
      setEditingUser(null);
      setNewPasswordInput('');
      refreshData();
    } else {
      setAdminFeedback({ type: 'error', text: res.message });
    }
  };

  const handleExpireUser = async (username: string) => {
    const res = await expireUserNow(username);
    setAdminFeedback({ type: 'success', text: res.message });
    refreshData();
  };

  const handleReactivateUser = async (username: string) => {
    const res = await reactivateUser(username, 30);
    setAdminFeedback({ type: 'success', text: res.message });
    refreshData();
  };

  const handleResetDevice = async (username: string) => {
    const res = await resetUserDeviceBinding(username);
    setAdminFeedback({ type: 'success', text: res.message });
    refreshData();
  };

  const handleResetKey = async (keyStr: string) => {
    const res = await resetLicenseKey(keyStr);
    setAdminFeedback({ type: 'success', text: res.message });
    refreshData();
  };

  const handleReactivateKey = async (keyStr: string) => {
    const res = await reactivateLicenseKey(keyStr, 30);
    setAdminFeedback({ type: 'success', text: res.message });
    refreshData();
  };

  const handleDeleteUserAccount = (username: string) => {
    deleteUser(username);
    setAdminFeedback({ type: 'success', text: `Usuário "${username}" removido com sucesso.` });
    refreshData();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 select-none animate-in fade-in duration-150 overflow-y-auto font-sans">
      <div className="w-full max-w-2xl bg-[#0e141c] border border-cyan-500/30 rounded-3xl shadow-[0_0_50px_rgba(0,229,187,0.15)] overflow-hidden flex flex-col text-white my-auto">
        {/* Top Header */}
        <div className="bg-[#141e2a] px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <KeyRound className="w-5 h-5 text-gray-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Painel Mestre de Licenças</h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-bold border border-cyan-500/30">
                  ADM
                </span>
              </div>
              <p className="text-xs text-gray-400">Gerador de Keys, controle de senhas e expiração de clientes</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const url = window.location.origin + window.location.pathname + '#vendas';
                handleCopy(url);
                setAdminFeedback({
                  type: 'success',
                  text: 'Link da Página de Vendas Independente copiado com sucesso!',
                });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 text-xs font-semibold cursor-pointer transition-colors"
              title="Copiar Link da Página de Vendas Separada e Independente"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              <span>Copiar Link de Vendas</span>
            </button>
            {onEnterAppAsMaster && (
              <button
                type="button"
                onClick={onEnterAppAsMaster}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-semibold cursor-pointer transition-colors"
                title="Acessar o app direto sem gastar key"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Abrir App (Mestre)</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Admin Feedback Alert */}
        {adminFeedback && (
          <div
            className={`px-6 py-2.5 flex items-center gap-2 text-xs font-medium border-b ${
              adminFeedback.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-950/80 text-rose-300 border-rose-500/30'
            }`}
          >
            {adminFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="flex-1">{adminFeedback.text}</span>
            <button
              type="button"
              onClick={() => setAdminFeedback(null)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Prominent Sales Page Link Banner */}
        <div className="bg-[#12080a] border-b border-red-900/40 px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
              <ExternalLink className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white tracking-wide uppercase">
                  Página de Vendas Independente
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                  PÚBLICA
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Acesse ou compartilhe para compras diretas: <span className="font-mono text-red-300">#vendas</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                const url = window.location.origin + window.location.pathname + '#vendas';
                handleCopy(url);
                setAdminFeedback({
                  type: 'success',
                  text: 'Link da Página de Vendas copiado: ' + url,
                });
              }}
              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-red-600/20"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar Link</span>
            </button>
            <a
              href="#vendas"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir</span>
            </a>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-white/10 bg-[#0f1722] px-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`py-3 px-4 font-semibold text-xs border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'email'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Mail className="w-4 h-4 text-emerald-400" />
            <span className="font-bold">⚡ Envio por E-mail</span>
            {emailLogsList.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                {emailLogsList.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('generate')}
            className={`py-3 px-4 font-semibold text-xs border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'generate'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Gerar Nova Key</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('keys')}
            className={`py-3 px-4 font-semibold text-xs border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'keys'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Keys Criadas ({keysList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`py-3 px-4 font-semibold text-xs border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Clientes & Senhas ({usersList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`py-3 px-4 font-semibold text-xs border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'logs'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Logs ({logsList.length})</span>
          </button>

          {/* Real-time Cloud Sync Status Badge */}
          <div className="ml-auto hidden sm:flex items-center gap-2 py-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Nuvem Firestore em Tempo Real</span>
            </div>
            <button
              type="button"
              onClick={handleForceCloudSync}
              disabled={isCloudSyncing}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-cyan-300 transition-colors cursor-pointer disabled:opacity-50"
              title="Forçar sincronização com a nuvem"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isCloudSyncing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {/* 0. EMAIL DELIVERY SYSTEM (NEW TAB) */}
          {activeTab === 'email' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Resend Status Banner */}
              <div className="p-3.5 bg-[#0b131e] rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <MailCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white uppercase tracking-wider">
                        Serviço Resend Ativo
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        🟢 OPERANTE
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-mono">
                      API Key: <strong className="text-emerald-300">{resendConfig.maskedKey}</strong> • 3.000 envios/mês inclusos
                    </p>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-gray-400 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 self-stretch sm:self-auto text-center">
                  Remetente: <span className="text-gray-200">{resendConfig.sender}</span>
                </div>
              </div>

              {/* Form: Generate & Send Key by Email */}
              <form onSubmit={handleSendEmailLicense} className="bg-[#121b26] p-5 sm:p-6 rounded-2xl border border-cyan-500/30 space-y-4 shadow-lg">
                <div className="flex items-center gap-2 pb-1 border-b border-white/10">
                  <Send className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wide">
                    Gerar e Enviar Chave VIP para o Cliente
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Customer Email */}
                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                      <span>E-mail do Cliente:</span>
                      <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={emailDest}
                      onChange={(e) => setEmailDest(e.target.value)}
                      placeholder="ex: cliente@gmail.com"
                      className="w-full h-10 px-3.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>

                  {/* Customer Name */}
                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="text-xs font-bold text-gray-300">
                      Nome do Cliente (Opcional):
                    </label>
                    <input
                      type="text"
                      value={emailClientName}
                      onChange={(e) => setEmailClientName(e.target.value)}
                      placeholder="ex: Lucas Silva"
                      className="w-full h-10 px-3.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Plan / Duration Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300">
                    Selecione o Plano / Validade:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                    {[
                      { days: 1, label: '1 Dia (24h)', icon: '⚡' },
                      { days: 7, label: '7 Dias', icon: '📅' },
                      { days: 30, label: '30 Dias (Mensal)', icon: '⭐' },
                      { days: 90, label: '90 Dias (Trimestral)', icon: '🔥' },
                      { days: 365, label: '365 Dias (Anual)', icon: '💎' },
                      { days: 3650, label: 'Vitalício', icon: '👑' },
                    ].map((p) => (
                      <button
                        key={p.days}
                        type="button"
                        onClick={() => setEmailPlanDays(p.days)}
                        className={`p-2.5 rounded-xl border text-xs font-bold font-mono transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                          emailPlanDays === p.days
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/10'
                            : 'bg-black/40 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <span className="text-sm">{p.icon}</span>
                        <span className="text-[11px] leading-tight text-center">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSendingEmail}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 font-black text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.99] disabled:opacity-50"
                  >
                    {isSendingEmail ? (
                      <>
                        <RotateCcw className="w-4 h-4 animate-spin text-gray-950" />
                        <span>Gerando Chave & Disparando E-mail via Resend...</span>
                      </>
                    ) : (
                      <>
                        <SendHorizontal className="w-4 h-4 fill-current" />
                        <span>🚀 Gerar Chave & Enviar por E-mail Agora</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Email Delivery History */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-gray-400 px-1">
                  <div className="flex items-center gap-1.5 font-bold text-gray-300">
                    <Inbox className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Histórico de E-mails Disparados ({emailLogsList.length})</span>
                  </div>
                  <button
                    type="button"
                    onClick={refreshData}
                    className="flex items-center gap-1 text-cyan-400 hover:underline cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Atualizar
                  </button>
                </div>

                {emailLogsList.length === 0 ? (
                  <div className="bg-[#121b26]/60 border border-white/5 rounded-xl p-8 text-center text-xs text-gray-500 font-mono">
                    Nenhum e-mail enviado recentemente. Preencha o formulário acima para disparar sua primeira chave VIP!
                  </div>
                ) : (
                  <div className="max-h-[260px] overflow-y-auto space-y-2 pr-1">
                    {emailLogsList.map((log) => (
                      <div
                        key={log.id}
                        className="bg-[#121b26] p-3 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-sm"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white font-mono">{log.toEmail}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                log.status === 'delivered'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {log.status === 'delivered' ? '✓ Enviado' : 'Falha'}
                            </span>
                            <span className="text-cyan-300 font-mono font-bold text-[11px] bg-cyan-500/10 px-1.5 py-0.5 rounded">
                              {log.licenseKey}
                            </span>
                          </div>
                          <p className="text-gray-400 text-[11px] font-mono">
                            Plano: <strong className="text-gray-200">{log.planName}</strong> • {new Date(log.sentAt).toLocaleString('pt-BR')}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopy(log.licenseKey)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                            title="Copiar chave"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResendExistingKey(log)}
                            disabled={isSendingEmail}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-mono text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                            title="Reenviar este e-mail para o cliente"
                          >
                            <Send className="w-3 h-3" />
                            <span>Reenviar</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* 1. Generate Key Tab (Bloqueado: Gere no Console) */}
          {activeTab === 'generate' && (
            <div className="space-y-4 py-1">
              <div className="p-6 sm:p-8 rounded-2xl bg-[#121b26] border border-cyan-500/20 flex flex-col items-center text-center space-y-4 shadow-inner animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
                  <Terminal className="w-8 h-8 stroke-[2]" />
                </div>

                <div className="space-y-2 max-w-md">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Geração Bloqueada no Painel</span>
                  </div>
                  
                  <h3 className="text-2xl font-mono font-black text-white tracking-wide uppercase pt-1">
                    gere no console
                  </h3>
                  
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Para garantir total segurança e impedir vazamentos de chaves na interface, a geração manual foi migrada para comandos criptográficos no console / chat.
                  </p>
                </div>

                {/* Terminal / Chat Command Box */}
                <div className="w-full max-w-md bg-black/60 border border-white/10 rounded-2xl p-4 font-mono text-left space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-gray-400 border-b border-white/10 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Comando de Geração:
                    </span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px]">
                      DISPONÍVEL
                    </span>
                  </div>

                  <div className="bg-[#090d14] px-4 py-3 rounded-xl border border-cyan-500/30 flex items-center justify-between">
                    <span className="text-cyan-300 font-bold text-sm sm:text-base font-mono">
                      /gerarkey teste
                    </span>
                    <span className="text-xs text-amber-400 font-sans font-bold">
                      20 Minutos (Demonstração)
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-400 pt-1 leading-relaxed">
                    Envie <strong>/gerarkey teste</strong> no chat para gerar uma key de teste de <strong>20 minutos</strong> com marca d'água <em>"anti roubo painelzin dos cria 22"</em> e edição desativada.
                  </p>
                </div>

                {/* Demo Key Instant Generator Button */}
                <button
                  type="button"
                  onClick={handleGenerateDemoKey}
                  className="w-full max-w-md py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 cursor-pointer transition-all active:scale-98"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Gerar Key de Teste (20 Minutos) Agora</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. Keys List Tab */}
          {activeTab === 'keys' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-400 pb-1">
                <span>Total de chaves no sistema: {keysList.length}</span>
                <button
                  type="button"
                  onClick={refreshData}
                  className="flex items-center gap-1 text-cyan-400 hover:underline cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Atualizar
                </button>
              </div>

              {keysList.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-sm">
                  Nenhuma chave gerada ainda. Clique em "Gerar Nova Key".
                </div>
              ) : (
                <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1">
                  {keysList.map((k) => {
                    const isKeyExpired = k.status === 'expired';
                    return (
                      <div
                        key={k.key}
                        className="bg-[#121b26] p-3.5 rounded-xl border border-white/5 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-cyan-300">{k.key}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isKeyExpired
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : k.isRedeemed
                                  ? 'bg-gray-700/50 text-gray-300'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {isKeyExpired ? 'Expirada' : k.isRedeemed ? 'Resgatada' : 'Disponível'}
                            </span>
                            <span className="text-gray-400 text-[11px] font-medium">
                              {k.daysValid >= 3650
                                ? 'Vitalícia'
                                : k.daysValid < 1
                                ? `${Math.max(1, Math.round(k.daysValid * 24))}h`
                                : `${k.daysValid} dias`}
                            </span>
                          </div>
                          {k.isRedeemed && (
                            <p className="text-gray-400 text-[11px]">
                              Cliente: <strong className="text-white">{k.redeemedBy}</strong> | Resgatada em:{' '}
                              {k.redeemedAt ? new Date(k.redeemedAt).toLocaleDateString('pt-BR') : '-'}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Reactivate or Reset Key Controls */}
                          {isKeyExpired ? (
                            <button
                              type="button"
                              onClick={() => handleReactivateKey(k.key)}
                              className="px-2 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer text-[11px] font-medium flex items-center gap-1"
                              title="Reativar esta key por mais 30 dias"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reativar (+30d)</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleExpireKey(k.key)}
                              className="px-2 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer text-[11px] font-medium flex items-center gap-1"
                              title="Expirar esta key agora"
                            >
                              <Ban className="w-3 h-3" />
                              <span>Expirar</span>
                            </button>
                          )}

                          {k.isRedeemed && (
                            <button
                              type="button"
                              onClick={() => handleResetKey(k.key)}
                              className="px-2 py-1 rounded bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition-colors cursor-pointer text-[11px] font-bold flex items-center gap-1"
                              title="Resetar vínculo desta chave para permitir cadastro em novo dispositivo/IP"
                            >
                              <RotateCcw className="w-3 h-3 text-cyan-400" />
                              <span>Resetar Key</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setQuickSendKeyModal(k);
                              setQuickSendEmail('');
                            }}
                            className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors cursor-pointer"
                            title="Enviar esta chave por E-mail via Resend"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(k.key)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                            title="Copiar Key"
                          >
                            {copiedKey === k.key ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteKey(k.key)}
                            className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 3. Clients & Passwords Management Tab */}
          {activeTab === 'users' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-400 pb-1">
                <span>Gerencie usuários, expire acessos ou visualize senhas</span>
                <button
                  type="button"
                  onClick={refreshData}
                  className="flex items-center gap-1 text-cyan-400 hover:underline cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Atualizar
                </button>
              </div>

              {usersList.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-sm">
                  Nenhum cliente cadastrado ainda.
                </div>
              ) : (
                <div className="max-h-[360px] overflow-y-auto space-y-2.5 pr-1">
                  {usersList.map((u) => {
                    const remaining = getRemainingDays(u.expiresAt, u.status);
                    const isExpired = remaining <= 0 || u.status === 'expired' || u.status === 'suspended';
                    const clearPassword = decodePassword(u.passwordHash);
                    const isPasswordVisible = !!visiblePasswords[u.username];
                    const isBeingEdited = editingUser === u.username;

                    return (
                      <div
                        key={u.username}
                        className="bg-[#121b26] p-3.5 rounded-xl border border-white/10 flex flex-col gap-2.5 text-xs shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white font-mono">{u.username}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isExpired
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {isExpired ? 'Expirado' : `${remaining} dias restantes`}
                            </span>
                          </div>

                          {/* Quick Action: Expire or Reactivate */}
                          <div className="flex items-center gap-1.5">
                            {isExpired ? (
                              <button
                                type="button"
                                onClick={() => handleReactivateUser(u.username)}
                                className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-medium cursor-pointer transition-colors flex items-center gap-1"
                                title="Reativar acesso do cliente por 30 dias"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Reativar (+30d)</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleExpireUser(u.username)}
                                className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-medium cursor-pointer transition-colors flex items-center gap-1"
                                title="Expirar acesso deste usuário imediatamente"
                              >
                                <Ban className="w-3 h-3" />
                                <span>Expirar Acesso</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Password Display & Edit Row */}
                        <div className="bg-black/40 rounded-lg p-2.5 border border-white/5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Lock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span className="text-gray-400 text-[11px] shrink-0">Senha:</span>
                            {isBeingEdited ? (
                              <div className="flex items-center gap-1.5 flex-1">
                                <input
                                  type="text"
                                  value={newPasswordInput}
                                  onChange={(e) => setNewPasswordInput(e.target.value)}
                                  placeholder="Nova senha"
                                  className="w-full h-7 px-2 rounded bg-[#090d14] border border-cyan-500/50 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSavePassword(u.username)}
                                  className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[11px] cursor-pointer"
                                >
                                  Salvar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingUser(null)}
                                  className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-gray-300 text-[11px] cursor-pointer"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 truncate">
                                <span className="font-mono text-emerald-300 font-bold tracking-wider">
                                  {isPasswordVisible ? clearPassword : '••••••••'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => togglePasswordVisibility(u.username)}
                                  className="text-gray-400 hover:text-white p-0.5 cursor-pointer"
                                  title={isPasswordVisible ? 'Ocultar senha' : 'Ver senha'}
                                >
                                  {isPasswordVisible ? (
                                    <EyeOff className="w-3.5 h-3.5" />
                                  ) : (
                                    <Eye className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(clearPassword)}
                                  className="text-gray-400 hover:text-white p-0.5 cursor-pointer"
                                  title="Copiar senha"
                                >
                                  {copiedKey === clearPassword ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>

                          {!isBeingEdited && (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStartEditPassword(u.username, u.passwordHash)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-medium cursor-pointer transition-colors"
                                title="Alterar Senha do Usuário"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Alterar Senha</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteUserAccount(u.username)}
                                className="p-1 rounded text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                                title="Excluir Usuário"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Device / IP Binding Security Info */}
                        <div className="bg-[#090d14] rounded-lg p-2.5 border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                          <div className="flex items-center gap-1.5 text-gray-300">
                            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>
                              Aparelho: <strong className="text-white">{u.deviceModel || 'Aparelho atual'}</strong> • IP:{' '}
                              <strong className="text-cyan-300 font-mono">
                                {u.registeredIp ? maskIp(u.registeredIp) : 'Automático no login'}
                              </strong>
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleResetDevice(u.username)}
                            className="px-2 py-0.5 rounded bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold flex items-center gap-1 shrink-0 self-start sm:self-auto cursor-pointer transition-colors"
                            title="Desvincular para permitir login em outro celular/computador"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            <span>Resetar IP / Aparelho</span>
                          </button>
                        </div>

                        {/* License key info */}
                        <div className="text-[11px] text-gray-400 flex items-center justify-between">
                          <span>
                            Key vinculada: <strong className="font-mono text-cyan-300">{u.licenseKey}</strong>
                          </span>
                          <span>
                            Expira:{' '}
                            {new Date(u.expiresAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 4. Security Audit Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#121b26] border border-cyan-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Monitoramento de Tentativas de Login</span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                        Firestore Live
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">
                      Logs de auditoria em tempo real. Apenas status de sucesso/falha são registrados, sem expor senhas ou chaves.
                    </p>
                  </div>
                </div>

                {/* Counters */}
                <div className="flex items-center gap-2 text-xs font-mono">
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Sucessos: {logsList.filter((l) => l.status === 'success').length}</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span>Falhas: {logsList.filter((l) => l.status === 'failure').length}</span>
                  </div>
                </div>
              </div>

              {logsList.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-[#121b26] border border-white/5 space-y-2">
                  <ShieldCheck className="w-10 h-10 text-gray-500 mx-auto" />
                  <h4 className="text-sm font-semibold text-gray-300">Nenhum log registrado ainda</h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Tentativas de login, ativação de chaves e verificações no portão serão transmitidas e sincronizadas em tempo real nesta tela.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                  {logsList.map((log, idx) => {
                    const isSuccess = log.status === 'success';
                    const authTypeLabels: Record<string, string> = {
                      client_login: 'Login de Cliente',
                      client_register: 'Ativação de Conta',
                      security_gate: 'Portão de PIN',
                      master_access: 'Acesso Mestre',
                    };

                    const label = authTypeLabels[log.authType] || log.authType;
                    const dateFormatted = new Date(log.timestamp).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    });

                    return (
                      <div
                        key={log.id || `${log.timestamp}-${idx}`}
                        className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all ${
                          isSuccess
                            ? 'bg-[#0f1d1b]/70 border-emerald-500/30 hover:border-emerald-500/50'
                            : 'bg-[#1e1115]/70 border-rose-500/30 hover:border-rose-500/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isSuccess
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {isSuccess ? (
                              <Check className="w-4 h-4 stroke-[2.5]" />
                            ) : (
                              <AlertCircle className="w-4 h-4 stroke-[2.5]" />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${
                                  isSuccess
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                }`}
                              >
                                {isSuccess ? 'Sucesso' : 'Falha'}
                              </span>
                              <span className="font-semibold text-white">{label}</span>
                              <span className="text-gray-400 font-mono text-[11px]">
                                [Alvo: <strong className="text-cyan-300">{log.maskedTarget}</strong>]
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-gray-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-gray-500" />
                                {dateFormatted}
                              </span>
                              <span>•</span>
                              <span>
                                Disp:{' '}
                                <strong className="text-gray-300 font-sans">
                                  {log.clientDevice || 'Navegador Web'}
                                </strong>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border ${
                              isSuccess
                                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/20'
                                : 'bg-rose-950/40 text-rose-300 border-rose-500/20'
                            }`}
                          >
                            {log.reason}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-[#0b1017] px-6 py-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
          <span>Comando rápido: <strong>admin</strong> ou Senha Mestre: <strong>26733089</strong></span>
          {onEnterAppAsMaster && (
            <button
              type="button"
              onClick={onEnterAppAsMaster}
              className="text-cyan-400 hover:underline font-semibold cursor-pointer"
            >
              Ir para o Painel Ticketmaster &rarr;
            </button>
          )}
        </div>
      </div>

      {/* Quick Send Key by Email Popup Modal */}
      {quickSendKeyModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#111927] border border-cyan-500/40 rounded-2xl p-5 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setQuickSendKeyModal(null)}
              className="absolute top-3.5 right-3.5 p-1 rounded-full bg-white/10 hover:bg-white/20 text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Disparar Chave por E-mail</h3>
                <p className="text-xs text-gray-400">Entrega imediata via Resend</p>
              </div>
            </div>

            <div className="p-3 bg-black/60 rounded-xl border border-white/10 space-y-1 text-xs">
              <div className="text-gray-400">Chave a ser enviada:</div>
              <div className="font-mono text-cyan-300 font-bold text-sm select-all">{quickSendKeyModal.key}</div>
              <div className="text-gray-500 text-[11px]">
                Validade: {quickSendKeyModal.daysValid >= 3650 ? 'Vitalícia' : `${quickSendKeyModal.daysValid} Dias`}
              </div>
            </div>

            <form onSubmit={handleQuickSendAnyKey} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">Digite o E-mail do Cliente:</label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={quickSendEmail}
                  onChange={(e) => setQuickSendEmail(e.target.value)}
                  placeholder="ex: cliente@gmail.com"
                  className="w-full h-10 px-3 rounded-xl bg-black/80 border border-white/20 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setQuickSendKeyModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold font-mono uppercase flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isSendingEmail ? (
                    <RotateCcw className="w-3.5 h-3.5 animate-spin text-black" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Enviar Agora</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
