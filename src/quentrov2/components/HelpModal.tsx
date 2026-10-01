import React from 'react';
import { X, HelpCircle, MessageSquare, Shield, Smartphone, RefreshCw } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#18191d] border border-zinc-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-semibold text-white">Central de Ajuda</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FAQs */}
        <div className="space-y-3.5 pt-4 text-xs">
          <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-2 text-white font-medium mb-1">
              <RefreshCw className="w-4 h-4 text-sky-400" />
              <span>Como funciona o QR Code dinâmico?</span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              O código no seu ingresso se atualiza de forma criptografada a cada poucos segundos. Isso previne falsificações e capturas de tela. Basta abrir o app na hora de entrar no estádio.
            </p>
          </div>

          <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-2 text-white font-medium mb-1">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Preciso de internet para acessar meu ingresso?</span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Não! Os ingressos carregados no seu aparelho continuam funcionando mesmo sem sinal ou conexão de dados no local do show.
            </p>
          </div>

          <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-2 text-white font-medium mb-1">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>Como transferir um ingresso com segurança?</span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Você pode enviar por E-mail ou pelo Quentro ID da pessoa. O destinatário recebe o ingresso na conta dele e o código original do seu aparelho é invalidado automaticamente.
            </p>
          </div>

          <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-2 text-white font-medium mb-1">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>Fale com o Suporte Oficial</span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Nosso atendimento funciona 24 horas por dia para eventos em andamento.
            </p>
            <button
              onClick={() => {
                alert('Atendimento ao cliente aberto! Nossa equipe responderá em minutos.');
                onClose();
              }}
              className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-medium hover:bg-emerald-500/30 transition-colors"
            >
              Iniciar Chat de Suporte
            </button>
          </div>
        </div>

        <div className="mt-5 pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-full bg-white text-zinc-900 font-medium text-xs hover:bg-zinc-100 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
