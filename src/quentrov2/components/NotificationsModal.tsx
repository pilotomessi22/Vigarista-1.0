import React from 'react';
import { X, Bell, Ticket, ShieldCheck, Sparkles } from 'lucide-react';

interface NotificationsModalProps {
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#18191d] border border-zinc-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6 shadow-2xl text-white">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Notificações</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 pt-4 text-xs">
          <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800 flex items-start gap-3">
            <Ticket className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block text-sm">Ingressos Prontos</span>
              <p className="text-zinc-400 mt-0.5 leading-relaxed">
                Seus ingressos para o <strong>BTS WORLD TOUR ARIRANG</strong> no MorumBis já estão disponíveis e salvos no aplicativo.
              </p>
              <span className="text-[10px] text-zinc-500 mt-1 block">Hoje às 14:20</span>
            </div>
          </div>

          <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block text-sm">Segurança Ativada</span>
              <p className="text-zinc-400 mt-0.5 leading-relaxed">
                A tecnologia de código QR dinâmico está operando com sucesso. Não compartilhe prints da tela.
              </p>
              <span className="text-[10px] text-zinc-500 mt-1 block">Ontem às 18:00</span>
            </div>
          </div>

          <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block text-sm">Informações do Estádio</span>
              <p className="text-zinc-400 mt-0.5 leading-relaxed">
                Abertura dos portões prevista para as 16:00hs. Chegue com antecedência para evitar filas no MorumBis.
              </p>
              <span className="text-[10px] text-zinc-500 mt-1 block">2 dias atrás</span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-full bg-white text-zinc-900 font-bold text-xs hover:bg-zinc-100 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
