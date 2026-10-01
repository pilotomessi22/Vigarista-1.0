import React, { useState } from 'react';
import { X, Check, Ticket, ShieldCheck, QrCode, ArrowRight } from 'lucide-react';
import { EventItem, OrderItem } from '../types';

interface BuyTicketModalProps {
  event: EventItem | null;
  onClose: () => void;
  onCompletePurchase: (newOrder: OrderItem) => void;
}

export const BuyTicketModal: React.FC<BuyTicketModalProps> = ({
  event,
  onClose,
  onCompletePurchase,
}) => {
  if (!event) return null;

  const [ticketType, setTicketType] = useState<'meia' | 'inteira' | 'vip'>('meia');
  const [buyerName, setBuyerName] = useState('Agatha Marins');
  const [buyerCpf, setBuyerCpf] = useState('156.822.087-14');
  const [buyerEmail, setBuyerEmail] = useState('marjorie301204@gmail.com');
  const [step, setStep] = useState<'selection' | 'pix-payment'>('selection');

  const basePrice = event.priceStart;
  const multiplier = ticketType === 'meia' ? 1 : ticketType === 'inteira' ? 2 : 3;
  const ticketPrice = basePrice * multiplier;
  const serviceFee = ticketPrice * 0.2; // 20% standard service fee
  const totalPrice = ticketPrice + serviceFee;

  const handleCreatePix = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('pix-payment');
  };

  const handleConfirmPixPayment = () => {
    const randomOrderNumber = Math.floor(70000000 + Math.random() * 9000000).toString();
    const randomPaymentNumber = Math.floor(20000000 + Math.random() * 9000000).toString();

    const sectorLabel =
      ticketType === 'meia'
        ? 'Pista - Meia-Entrada'
        : ticketType === 'inteira'
        ? 'Pista - Inteira'
        : 'Camarote VIP Premium';

    const order: OrderItem = {
      orderNumber: randomOrderNumber,
      paymentNumber: randomPaymentNumber,
      eventName: event.title.toUpperCase(),
      location: event.city,
      sector: sectorLabel,
      ticketPrice: ticketPrice,
      serviceFee: serviceFee,
      totalPrice: totalPrice,
      attendeeName: buyerName,
      attendeeCategory:
        ticketType === 'meia'
          ? 'Estudantes de ensino fundamental, médio ou superior da rede pública ou particular'
          : 'Público Geral',
      attendeeCpf: buyerCpf,
      paymentMethod: 'pix',
      status: 'Aprovado',
      orderDate: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      quentroEmail: buyerEmail,
    };

    onCompletePurchase(order);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white text-gray-900 shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between bg-[#0052b4] px-5 py-4 text-white">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
              Compra Oficial Ticketmaster
            </span>
            <h3 className="text-base font-black truncate max-w-sm">{event.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {step === 'selection' ? (
            <form onSubmit={handleCreatePix} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Selecione a Modalidade
                </label>
                <div className="space-y-2">
                  <label
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      ticketType === 'meia'
                        ? 'border-[#0052b4] bg-blue-50/50 ring-1 ring-[#0052b4]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="ticketType"
                        checked={ticketType === 'meia'}
                        onChange={() => setTicketType('meia')}
                        className="text-[#0052b4]"
                      />
                      <div>
                        <p className="text-sm font-bold text-gray-900">Pista - Meia-Entrada</p>
                        <p className="text-xs text-gray-500">Estudante / ID Jovem / Idoso</p>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-gray-900">
                      R$ {basePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </label>

                  <label
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      ticketType === 'inteira'
                        ? 'border-[#0052b4] bg-blue-50/50 ring-1 ring-[#0052b4]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="ticketType"
                        checked={ticketType === 'inteira'}
                        onChange={() => setTicketType('inteira')}
                        className="text-[#0052b4]"
                      />
                      <div>
                        <p className="text-sm font-bold text-gray-900">Pista - Inteira</p>
                        <p className="text-xs text-gray-500">Acesso Geral ao Evento</p>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-gray-900">
                      R$ {(basePrice * 2).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </label>
                </div>
              </div>

              {/* Beneficiary Data */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Dados do Titular do Ingresso
                </label>

                <div>
                  <label className="text-xs text-gray-600 block mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#0052b4] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600 block mb-1">CPF (comprovante meia)</label>
                  <input
                    type="text"
                    required
                    value={buyerCpf}
                    onChange={(e) => setBuyerCpf(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#0052b4] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600 block mb-1">E-mail para envio Quentro</label>
                  <input
                    type="email"
                    required
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#0052b4] outline-none"
                  />
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-gray-50 p-3.5 rounded-xl text-xs space-y-1.5 border border-gray-100">
                <div className="flex justify-between text-gray-600">
                  <span>Ingresso</span>
                  <span>R$ {ticketPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Taxa de serviço (20%)</span>
                  <span>R$ {serviceFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="border-t border-gray-200 pt-1.5 flex justify-between text-sm font-extrabold text-gray-900">
                  <span>Total</span>
                  <span className="text-[#0052b4]">
                    R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-black py-3 text-sm font-bold text-white hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
              >
                <span>Pagar com Pix Instantâneo</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            /* Pix QR code payment view */
            <div className="text-center space-y-4 py-2">
              <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                <Check className="h-3.5 w-3.5" />
                <span>Código Pix Gerado com Sucesso</span>
              </div>

              <p className="text-xs text-gray-600">
                Escaneie o QR Code abaixo no aplicativo do seu banco ou clique no botão de aprovação imediata:
              </p>

              {/* Fake QR Code */}
              <div className="mx-auto w-44 h-44 bg-gray-100 border border-gray-300 rounded-xl p-3 flex items-center justify-center">
                <QrCode className="w-full h-full text-gray-900" />
              </div>

              <div className="text-xs font-mono bg-gray-100 p-2 rounded text-gray-600 truncate">
                00020126580014br.gov.bcb.pix0136ticketmaster-pix-{buyerCpf.replace(/\D/g, '')}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleConfirmPixPayment}
                  className="w-full rounded-xl bg-[#0052b4] py-3 text-sm font-extrabold text-white hover:bg-blue-700 transition-all shadow-md"
                >
                  Simular Aprovação do Pagamento Pix
                </button>
                <button
                  type="button"
                  onClick={() => setStep('selection')}
                  className="text-xs text-gray-500 hover:text-black py-1"
                >
                  Voltar à seleção
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
