import React from 'react';
import { X, MapPin, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { ConcertEvent } from '../types';

interface InfoModalProps {
  event: ConcertEvent;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ event, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#18191d] border border-zinc-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h3 className="text-base font-semibold text-white">Informações do Evento</h3>
            <p className="text-xs text-zinc-400">{event.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 pt-4 text-xs text-zinc-300">
          {/* Official Tour Poster */}
          <div className="w-full rounded-2xl overflow-hidden border border-zinc-800 bg-[#121214] shadow-lg flex items-center justify-center">
            <img
              src={event.coverImage || '/bts-poster-full.webp'}
              alt={event.title}
              className="w-full h-auto max-h-[460px] object-contain rounded-2xl select-none"
              referrerPolicy="no-referrer"
              loading="eager"
              decoding="async"
            />
          </div>

          {/* Location */}
          <div className="flex items-start gap-3 bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
            <MapPin className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-white block text-sm">{event.venue}</span>
              <p className="text-zinc-400 mt-0.5">Praça Roberto Gomes Pedrosa, 1 - Morumbi</p>
              <p className="text-zinc-500">{event.city}</p>
            </div>
          </div>

          {/* Times */}
          <div className="flex items-start gap-3 bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
            <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-white block text-sm">Horários</span>
              <p className="text-zinc-400 mt-0.5">Abertura dos portões: <strong className="text-zinc-200 font-medium">16:00hs</strong></p>
              <p className="text-zinc-400">Início previsto do show: <strong className="text-zinc-200 font-medium">20:00hs</strong></p>
            </div>
          </div>

          {/* Access Rules */}
          <div className="flex items-start gap-3 bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-white block text-sm">Entrada e Validação</span>
              <p className="text-zinc-400 mt-0.5 leading-relaxed">
                Apresente seu ingresso diretamente pelo aplicativo. O código QR dinâmico se atualiza automaticamente e dispensa impressão em papel.
              </p>
              <p className="text-zinc-400 mt-1">
                Screenshots ou capturas de tela <strong>não</strong> são aceitas nas catracas.
              </p>
            </div>
          </div>

          {/* Important Notice */}
          <div className="flex items-start gap-3 bg-red-950/30 border border-red-900/50 p-3.5 rounded-xl text-red-200">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-red-300 block">Classificação Indicativa</span>
              <p className="text-zinc-300 mt-0.5 leading-relaxed">
                14 anos. Menores de 14 anos apenas acompanhados de pais ou responsáveis legais. Estudantes devem apresentar carteirinha oficial no acesso.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-full bg-white text-zinc-900 font-medium text-xs hover:bg-zinc-100 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
