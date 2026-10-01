import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { TicketmasterLogo } from './TicketmasterLogo';
import { ActiveView } from '../types';

interface HeaderProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onOpenMobileMenu: () => void;
  onBack?: () => void;
  activeOrderCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  onOpenMobileMenu,
  onBack,
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (activeView === 'order-details') {
      setActiveView('home');
    } else if (activeView === 'home') {
      setActiveView('safari-home');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#1E4CD6] text-white select-none pt-[env(safe-area-inset-top,0px)] shadow-xs">
      {/* Exact Header matching IMG_8417.jpeg */}
      <div className="flex h-[52px] w-full items-center justify-between px-3">
        {/* Left: < (ChevronLeft) + ticketmaster® */}
        <div className="flex items-center gap-1.5">
          <button
            id="header-back-button"
            type="button"
            onClick={handleBack}
            className="p-1 -ml-1 text-white hover:opacity-80 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
            title="Voltar"
          >
            <ChevronLeft className="h-6 w-6 text-white stroke-[2.5]" />
          </button>

          <button
            id="header-home-logo-btn"
            type="button"
            onClick={() => setActiveView('home')}
            className="flex items-center focus:outline-none cursor-pointer hover:opacity-95"
            title="Ticketmaster - Início"
          >
            <TicketmasterLogo variant="white" size="md" />
          </button>
        </div>

        {/* Right: Hamburger Menu (≡) from IMG_8417.jpeg */}
        <button
          id="header-mobile-menu-btn"
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Abrir menu"
          className="p-1 -mr-1 text-white hover:opacity-80 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          title="Menu Ticketmaster"
        >
          <div className="flex flex-col justify-center items-end gap-[4.5px] w-[22px]">
            <span className="block h-[2.2px] w-full bg-white rounded-full" />
            <span className="block h-[2.2px] w-full bg-white rounded-full" />
            <span className="block h-[2.2px] w-full bg-white rounded-full" />
          </div>
        </button>
      </div>
    </header>
  );
};

