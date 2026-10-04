import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

interface AntiScreenshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMoreInfo?: () => void;
}

export const AntiScreenshotModal: React.FC<AntiScreenshotModalProps> = ({
  isOpen,
  onClose,
  onOpenMoreInfo,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-[#101518]/95 backdrop-blur-md flex flex-col justify-between px-6 select-none font-sans overflow-y-auto"
          style={{
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)',
          }}
        >
          {/* Top Warning Banner matching 68342559-182f-47e3-b75a-617766e4be17.jpeg */}
          <div className="pt-8 sm:pt-12 w-full flex items-center gap-3.5">
            {/* Orange Circle with Exclamation (!) */}
            <div className="w-8 h-8 rounded-full border-[2.2px] border-[#F97316] text-[#F97316] flex items-center justify-center shrink-0 font-bold text-[17px] leading-none">
              !
            </div>
            <h2 className="text-[17px] sm:text-[18px] font-bold text-white tracking-tight leading-snug">
              Você não pode tirar uma captura de tela.
            </h2>
          </div>

          {/* Center Graphic: 3D Floating Ticket with Quentro Header & Obscured QR */}
          <div className="my-auto py-8 flex flex-col items-center justify-center">
            <div className="relative group perspective-1000">
              {/* Soft radial glow background */}
              <div className="absolute -inset-4 bg-gradient-to-b from-white/[0.04] to-transparent rounded-[28px] blur-xl pointer-events-none" />

              {/* Floating Mini Ticket */}
              <div className="relative w-[180px] sm:w-[195px] flex flex-col rounded-[16px] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.8)] border border-white/10">
                {/* Top Card: Dark charcoal with Quentro > logo */}
                <div className="bg-[#2C363F] h-[95px] w-full flex items-center justify-center">
                  <div className="flex items-center gap-1 text-[#E2E8F0] font-bold text-[15px] tracking-tight">
                    <span>Quentro</span>
                    <svg
                      className="w-3.5 h-3.5 fill-[#E2E8F0] ml-0.5"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                    </svg>
                  </div>
                </div>

                {/* Quentro Mint Green Security Line */}
                <div className="w-full h-[2.5px] bg-[#00D2B4] shadow-[0_0_8px_#00D2B4]" />

                {/* Bottom Card: Pure White with Obscured / Reflected QR Code */}
                <div className="bg-white h-[85px] w-full flex items-center justify-center relative overflow-hidden">
                  <div className="opacity-75 blur-[0.6px]">
                    <QRCodeSVG
                      value="https://app.quentro.com/protected-qr-token"
                      size={60}
                      level="M"
                      includeMargin={false}
                      fgColor="#000000"
                      bgColor="#FFFFFF"
                    />
                  </div>

                  {/* Soft angled light reflection overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Explanation Text & Actions matching 68342559-182f-47e3-b75a-617766e4be17.jpeg */}
          <div className="w-full max-w-md mx-auto flex flex-col items-start pb-4">
            <p className="text-[15px] sm:text-[15.5px] text-[#E2E8F0] font-normal leading-[1.45] mb-8 text-left">
              O código QR é atualizado várias vezes por minuto, tornando-o inútil em uma captura de tela ou impressão para evitar duplicações ou falsificações.
            </p>

            <button
              id="btn-anti-screenshot-more-info"
              onClick={onOpenMoreInfo}
              className="text-left text-[14px] text-[#A0AEC0] hover:text-white underline underline-offset-4 cursor-pointer transition-colors mb-5"
            >
              Mais informações
            </button>

            {/* Solid White "Entendi" Button */}
            <button
              id="btn-anti-screenshot-confirm"
              onClick={onClose}
              className="w-full py-3.5 px-4 rounded-[14px] bg-white text-zinc-950 font-semibold text-[16px] hover:bg-zinc-100 active:scale-[0.99] transition-all text-center cursor-pointer shadow-2xl"
            >
              Entendi
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
