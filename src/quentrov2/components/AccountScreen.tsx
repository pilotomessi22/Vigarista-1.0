import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  X,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { UserProfile } from '../types';

interface AccountScreenProps {
  userProfile: UserProfile;
  onBack: () => void;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onOpenHelp: () => void;
  appScale?: number;
  onChangeAppScale?: (scale: number) => void;
  onOpenAddToHome?: () => void;
  showScaleAdjuster?: boolean;
  onToggleScaleAdjuster?: () => void;
}

export const AccountScreen: React.FC<AccountScreenProps> = ({
  userProfile,
  onBack,
  onUpdateProfile,
  onOpenHelp,
}) => {
  const [activeTab, setActiveTab] = useState<'quentroId' | 'configuracoes'>('configuracoes');
  
  // State for editing modal
  const [editModalField, setEditModalField] = useState<'email' | 'name' | 'country' | 'birthDate' | null>(null);
  const [editValue, setEditValue] = useState('');
  
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState(userProfile.pinCode || '1234');
  const [progressPercent, setProgressPercent] = useState(62);

  // Sync temp values whenever userProfile changes or modal opens
  useEffect(() => {
    if (editModalField === 'email') setEditValue(userProfile.email || 'tremgabi021@gmail.com');
    if (editModalField === 'name') setEditValue(userProfile.name || 'Marcelle Rodrigues');
    if (editModalField === 'country') setEditValue(userProfile.country || 'Brasil');
    if (editModalField === 'birthDate') setEditValue(userProfile.birthDate || '12/03/2002');
  }, [editModalField, userProfile]);

  // Animate dynamic QR refresh bar smoothly
  useEffect(() => {
    const interval = setInterval(() => {
      setProgressPercent((prev) => (prev >= 100 ? 5 : prev + 1));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Always scroll to top upon opening
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const handleOpenEdit = (field: 'email' | 'name' | 'country' | 'birthDate') => {
    setEditModalField(field);
    if (field === 'email') setEditValue(userProfile.email || 'tremgabi021@gmail.com');
    if (field === 'name') setEditValue(userProfile.name || 'Marcelle Rodrigues');
    if (field === 'country') setEditValue(userProfile.country || 'Brasil');
    if (field === 'birthDate') setEditValue(userProfile.birthDate || '12/03/2002');
  };

  const handleSaveModal = () => {
    if (!editModalField) return;
    const trimmed = editValue.trim();
    if (!trimmed) return;

    if (editModalField === 'email') {
      onUpdateProfile({ email: trimmed });
    } else if (editModalField === 'name') {
      onUpdateProfile({ name: trimmed });
    } else if (editModalField === 'country') {
      const cleanCountry = trimmed.replace(/^[^\w\sÀ-ÿ]+/, '').trim();
      onUpdateProfile({ country: cleanCountry || trimmed });
    } else if (editModalField === 'birthDate') {
      onUpdateProfile({ birthDate: trimmed });
    }
    setEditModalField(null);
  };

  const handleTogglePin = () => {
    if (!userProfile.pinEnabled) {
      setShowPinModal(true);
    } else {
      onUpdateProfile({ pinEnabled: false });
    }
  };

  const handleSavePin = () => {
    if (newPin.length === 4) {
      onUpdateProfile({ pinEnabled: true, pinCode: newPin });
      setShowPinModal(false);
    }
  };

  const getFieldTitle = () => {
    switch (editModalField) {
      case 'email':
        return 'Editar E-mail';
      case 'name':
        return 'Editar Nome';
      case 'country':
        return 'Editar País';
      case 'birthDate':
        return 'Editar Data de Nascimento';
      default:
        return 'Editar';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#121719] text-white w-full select-none font-sans">
      {/* Top Header - Exact replica of IMG_8637 */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-3.5 pb-2.5 w-full bg-[#121719]"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
        }}
      >
        <div className="flex items-center">
          <button
            id="btn-account-back"
            onClick={onBack}
            className="p-1 -ml-1 text-white hover:text-zinc-300 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
            aria-label="Voltar"
          >
            <ChevronLeft className="w-5 h-5 stroke-[1.8]" />
          </button>
          <h1 className="text-[17px] font-normal text-white tracking-tight ml-2">
            Conta
          </h1>
        </div>

        {/* Top-Right Logout Icon - Exact proportion and stroke from IMG_8637 */}
        <button
          id="btn-account-logout"
          onClick={onBack}
          className="p-1 text-[#647582] hover:text-white active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          title="Sair"
          aria-label="Sair"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </header>

      {/* Tabs Header - 50% split with full-width indicator matching IMG_8637 */}
      <div className="w-full flex items-center border-b border-[#1E272D] bg-[#121719]">
        <button
          type="button"
          id="tab-account-quentroid"
          onClick={() => setActiveTab('quentroId')}
          className={`flex-1 py-3 text-center text-[15px] transition-all relative cursor-pointer ${
            activeTab === 'quentroId'
              ? 'text-white font-normal'
              : 'text-[#687784] hover:text-[#8E9CA8] font-normal'
          }`}
        >
          Quentro ID
          {activeTab === 'quentroId' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00D2B4]" />
          )}
        </button>

        <button
          type="button"
          id="tab-account-configuracoes"
          onClick={() => setActiveTab('configuracoes')}
          className={`flex-1 py-3 text-center text-[15px] transition-all relative cursor-pointer ${
            activeTab === 'configuracoes'
              ? 'text-white font-normal'
              : 'text-[#687784] hover:text-[#8E9CA8] font-normal'
          }`}
        >
          Configurações
          {activeTab === 'configuracoes' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00D2B4]" />
          )}
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 px-4 pt-4 pb-6 max-w-md mx-auto w-full flex flex-col">
        {activeTab === 'quentroId' ? (
          /* Quentro ID Tab */
          <div className="flex flex-col items-center justify-center w-full my-auto py-6">
            <div className="w-full bg-[#182024] rounded-[24px] p-6 flex flex-col items-center shadow-lg border border-[#232D33]">
              <div className="w-full max-w-[280px] aspect-square bg-white rounded-[20px] p-5 flex flex-col items-center justify-between shadow-md select-none">
                <div className="flex-1 flex items-center justify-center w-full">
                  <QRCodeSVG
                    value={userProfile.quentroId || 'QTR-984210'}
                    size={195}
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                    level="M"
                    includeMargin={false}
                    className="w-full h-auto max-w-[200px] max-h-[200px]"
                  />
                </div>

                <div className="w-full bg-[#EBF1F5] h-[3.5px] rounded-full overflow-hidden mt-3 relative">
                  <div
                    className="h-full bg-[#00D2B4] rounded-full transition-all duration-150 ease-linear"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <h2 className="text-[16px] font-medium text-[#00D2B4] text-center mt-5 mb-1.5 tracking-tight">
                Quentro ID
              </h2>
              <p className="text-[13.5px] text-[#8E9CA8] font-normal text-center leading-relaxed max-w-[270px] mx-auto">
                Mostre este código QR para transferir ingressos para sua conta apenas escaneando-o.
              </p>
            </div>
          </div>
        ) : (
          /* Configurações Tab - 100% exact replica of IMG_8637 */
          <div className="w-full flex-1 flex flex-col">
            {/* Meus Dados Section */}
            <div className="mt-2">
              <h2 className="text-[14px] font-normal text-white mb-2 px-1">
                Meus Dados
              </h2>
              <div className="bg-[#182024] border border-[#232D33] rounded-[14px] overflow-hidden divide-y divide-[#232D33]">
                {/* Email Row - No pencil icon matching IMG_8637 */}
                <div
                  onClick={() => handleOpenEdit('email')}
                  className="px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.04] transition-colors"
                >
                  <span className="text-[14.5px] font-normal text-white truncate">
                    {userProfile.email || 'tremgabi021@gmail.com'}
                  </span>
                </div>

                {/* Name Row */}
                <div
                  onClick={() => handleOpenEdit('name')}
                  className="px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.04] transition-colors"
                >
                  <span className="text-[14.5px] font-normal text-white truncate pr-2">
                    {userProfile.name || 'Marcelle Rodrigues'}
                  </span>
                  {/* Quentro Outline Edit Pencil Icon */}
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#5A6C79"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>

                {/* Country Row */}
                <div
                  onClick={() => handleOpenEdit('country')}
                  className="px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.04] transition-colors"
                >
                  <span className="text-[14.5px] font-normal text-white truncate pr-2 flex items-center gap-2">
                    <span className="text-[14px]">🇧🇷</span>
                    <span>{userProfile.country || 'Brasil'}</span>
                  </span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#5A6C79"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>

                {/* Birth Date Row */}
                <div
                  onClick={() => handleOpenEdit('birthDate')}
                  className="px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.04] transition-colors"
                >
                  <span className="text-[14.5px] font-normal text-white truncate pr-2">
                    {userProfile.birthDate || '12/03/2002'}
                  </span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#5A6C79"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Segurança Section matching IMG_8637 */}
            <div className="mt-6">
              <h2 className="text-[14px] font-normal text-white mb-2 px-1">
                Segurança
              </h2>
              <div className="bg-[#182024] border border-[#232D33] rounded-[14px] overflow-hidden">
                {/* Upper Switch Row */}
                <div className="px-4 py-3.5 flex items-center justify-between">
                  <span className="text-[14.5px] font-normal text-white">
                    PIN de segurança
                  </span>
                  {/* Native iOS toggle switch matching IMG_8637 */}
                  <button
                    id="toggle-pin-security"
                    type="button"
                    onClick={handleTogglePin}
                    className={`w-[50px] h-[30px] flex items-center rounded-full p-[3px] transition-colors duration-200 ease-in-out cursor-pointer ${
                      userProfile.pinEnabled ? 'bg-[#00D2B4]' : 'bg-[#283339]'
                    }`}
                  >
                    <div
                      className={`bg-white w-[24px] h-[24px] rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                        userProfile.pinEnabled ? 'translate-x-[20px]' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Divider & Description */}
                <div className="border-t border-[#232D33] px-4 py-3.5">
                  <p className="text-[13px] text-[#7D8D9A] leading-[1.45] font-normal">
                    Proteja seus ingressos com um PIN. Solicitaremos ao transferir ingressos, garantindo segurança em caso de perda ou roubo do dispositivo.
                  </p>
                </div>
              </div>
            </div>

            {/* "Precisa de Ajuda?" Button - Matches background & border of cards */}
            <div className="mt-6">
              <button
                id="btn-account-help"
                onClick={onOpenHelp}
                className="w-full py-4 px-4 rounded-[14px] bg-[#182024] border border-[#232D33] text-[#00D2B4] font-normal text-[14px] text-center hover:bg-[#1D272C] transition-all cursor-pointer active:scale-[0.99] select-none shadow-sm"
              >
                Precisa de Ajuda?
              </button>
            </div>

            {/* Version Text at the bottom */}
            <div className="mt-6 mb-4 flex justify-center">
              <span className="text-[11.5px] text-[#384650] text-center select-none font-sans">
                4.5.2#128p
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Edit Field Modal for Fast, Persistent Updating */}
      {editModalField && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#182024] border border-[#232D33] rounded-2xl p-5 w-full max-w-xs text-left shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-normal text-white">{getFieldTitle()}</h3>
              <button
                onClick={() => setEditModalField(null)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <input
                type={editModalField === 'email' ? 'email' : 'text'}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={getFieldTitle()}
                className="w-full bg-[#242D32] text-white px-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#00D2B4] text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveModal();
                }}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setEditModalField(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-normal text-zinc-400 hover:text-white bg-[#242D32] hover:bg-[#2A353C] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveModal}
                className="flex-1 py-2.5 rounded-xl text-xs font-medium text-[#0A1A18] bg-[#00D2B4] hover:bg-[#00BF9F] cursor-pointer shadow"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Set PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#182024] border border-[#232D33] rounded-2xl p-6 w-full max-w-xs text-center shadow-2xl">
            <h3 className="text-base font-normal text-white mb-2">Definir PIN de 4 dígitos</h3>
            <p className="text-xs text-[#8E9CA8] mb-4">
              Digite um código numérico de 4 dígitos que será exigido em transferências.
            </p>

            <input
              type="password"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              placeholder="1234"
              className="w-32 mx-auto text-center text-2xl font-mono tracking-widest bg-[#242D32] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-[#00D2B4] mb-5 block"
              autoFocus
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowPinModal(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-normal text-zinc-400 hover:text-white bg-[#242D32] hover:bg-[#2A353C] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePin}
                disabled={newPin.length !== 4}
                className="flex-1 py-2.5 rounded-xl text-xs font-medium text-[#0A1A18] bg-[#00D2B4] hover:bg-[#00BF9F] disabled:opacity-50 cursor-pointer shadow"
              >
                Ativar PIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
