import React from 'react';
import { X, Ticket, Music, Sparkles, Trophy, Home, HelpCircle, Shield, ChevronRight, User, QrCode } from 'lucide-react';
import { ActiveView } from '../types';
import { TicketmasterLogo } from './TicketmasterLogo';
import { getAuthenticatedUser } from '../utils/security';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveView: (view: ActiveView) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  setActiveView,
}) => {
  if (!isOpen) return null;

  const currentUser = getAuthenticatedUser();
  const initials = currentUser
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'CF';

  const navigateTo = (view: ActiveView) => {
    setActiveView(view);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        id="menu-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Drawer */}
      <div
        id="mobile-drawer-panel"
        className="relative z-10 flex h-full w-full max-w-xs flex-col bg-white text-gray-900 shadow-2xl animate-in slide-in-from-right duration-200"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between bg-[#1E4CD6] px-4 py-4 text-white">
          <TicketmasterLogo variant="white" size="sm" />
          <button
            id="close-mobile-menu-btn"
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-white/10 cursor-pointer"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* User Card */}
        <div className="bg-[#f0f4f9] px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E4CD6] text-white font-bold text-sm">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-900 leading-tight">{currentUser}</p>
              <p className="text-xs text-gray-500 truncate">painelv1.eqpripa@acesso.com</p>
              <span className="inline-block mt-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                Sessão Ativa (5 min)
              </span>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          <div className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Minha Conta
          </div>

          <button
            id="menu-item-orders"
            onClick={() => navigateTo('order-details')}
            className="flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-800 hover:bg-blue-50 hover:text-[#1E4CD6] transition-colors text-left"
          >
            <span className="flex items-center gap-3">
              <Ticket className="h-4 w-4 text-[#1E4CD6]" />
              Meus Pedidos & Detalhes
            </span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </button>

          <button
            id="menu-item-quentro-v2"
            onClick={() => navigateTo('quentrov2')}
            className="flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-left"
          >
            <span className="flex items-center gap-3">
              <QrCode className="h-4 w-4 text-emerald-600" />
              Quentro (Ingressos Dinâmicos)
            </span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </button>

          <div className="pt-3 pb-1 px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Categorias
          </div>

          <button
            id="menu-item-home"
            onClick={() => navigateTo('home')}
            className="flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 text-left"
          >
            <span className="flex items-center gap-3">
              <Music className="h-4 w-4 text-gray-500" />
              Shows e Festivais
            </span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </button>

          <button
            id="menu-item-exp"
            onClick={() => navigateTo('home')}
            className="flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 text-left"
          >
            <span className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-gray-500" />
              Experiências & Exposições
            </span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </button>

          <button
            id="menu-item-sports"
            onClick={() => navigateTo('home')}
            className="flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 text-left"
          >
            <span className="flex items-center gap-3">
              <Trophy className="h-4 w-4 text-gray-500" />
              Esportes
            </span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </button>

          <button
            id="menu-item-venues"
            onClick={() => navigateTo('home')}
            className="flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 text-left"
          >
            <span className="flex items-center gap-3">
              <Home className="h-4 w-4 text-gray-500" />
              Casas de Show e Espaços
            </span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </button>

          <div className="pt-3 pb-1 px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Ajuda & Políticas
          </div>

          <a
            href="#suporte"
            onClick={onClose}
            className="flex w-full items-center justify-between px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <span className="flex items-center gap-3">
              <HelpCircle className="h-4 w-4 text-gray-400" />
              Suporte ao Fã
            </span>
          </a>

          <a
            href="#politicas"
            onClick={onClose}
            className="flex w-full items-center justify-between px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <span className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-gray-400" />
              Políticas de Compra & Termos
            </span>
          </a>
        </div>

        {/* Footer info in drawer */}
        <div className="border-t border-gray-200 bg-gray-50 p-4 text-[11px] text-gray-500">
          <p className="font-semibold text-gray-700">Ticketmaster Brasil</p>
          <p>CNPJ: 42.789.521/0001-10</p>
          <p className="mt-1">Versão 2026.4.1</p>
        </div>
      </div>
    </div>
  );
};
