import React, { useState } from 'react';
import { X, Calendar, MapPin, Check, QrCode } from 'lucide-react';
import { EventItem, OrderItem } from '../types';

interface EventModalProps {
  event: EventItem | null;
  onClose: () => void;
  onCreateOrder: (newOrder: OrderItem) => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  event,
  onClose,
  onCreateOrder,
}) => {
  if (!event) return null;

  const [selectedSector, setSelectedSector] = useState<'Pista' | 'Arquibancada' | 'Cadeira Superior' | 'Cadeira Inferior'>('Pista');
  const [ticketType, setTicketType] = useState<'meia' | 'inteira'>('meia');
  const [attendeeName, setAttendeeName] = useState('Agatha Marins');
  const [attendeeCpf, setAttendeeCpf] = useState('156.822.087-14');
  const [studentCategory, setStudentCategory] = useState(
    'Estudantes de ensino fundamental, médio ou superior da rede pública ou particular'
  );
  const [step, setStep] = useState<'selection' | 'pix-confirm'>('selection');

  const sectorPriceMap = {
    Pista: { meia: 625, inteira: 1250 },
    Arquibancada: { meia: 340, inteira: 680 },
    'Cadeira Superior': { meia: 490, inteira: 980 },
    'Cadeira Inferior': { meia: 540, inteira: 1080 },
  };

  const ticketPrice = sectorPriceMap[selectedSector][ticketType];
  const serviceFee = ticketPrice * 0.2; // 20% standard service fee
  const totalPrice = ticketPrice + serviceFee;

  const handleFinishPurchase = () => {
    const generatedOrderNumber = Math.floor(70000000 + Math.random() * 9000000).toString();
    const generatedPaymentNumber = Math.floor(20000000 + Math.random() * 9000000).toString();

    const createdOrder: OrderItem = {
      orderNumber: generatedOrderNumber,
      paymentNumber: generatedPaymentNumber,
      eventName: event.title.toUpperCase(),
      location: event.city || event.location,
      sector: `${selectedSector} - ${ticketType === 'meia' ? 'Meia-Entrada' : 'Inteira'}`,
      ticketPrice: ticketPrice,
      serviceFee: serviceFee,
      totalPrice: totalPrice,
      attendeeName: attendeeName || 'Agatha Marins',
      attendeeCategory:
        ticketType === 'meia'
          ? studentCategory
          : 'Público Geral - Ingresso Inteira',
      attendeeCpf: attendeeCpf || '156.822.087-14',
      paymentMethod: 'pix',
      status: 'Aprovado',
      orderDate: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      quentroEmail: 'marjorie301204@gmail.com',
    };

    onCreateOrder(createdOrder);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="relative h-40 bg-gray-900">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          <button
            id="modal-close-btn"
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white hover:bg-black transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="absolute bottom-3 left-4 right-4 text-white">
            <span className="text-[10px] uppercase font-black tracking-wider bg-[#0052b4] px-2 py-0.5 rounded text-white inline-block mb-1">
              {event.categoryLabel || event.category}
            </span>
            <h2 className="text-lg sm:text-xl font-black leading-tight text-white truncate">
              {event.title}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {step === 'selection' ? (
            <>
              {/* Event location and dates */}
              <div className="flex flex-col gap-1 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 font-medium">
                  <MapPin className="h-4 w-4 text-[#0052b4] shrink-0" />
                  <span>{event.location} - {event.city}</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Calendar className="h-4 w-4 text-[#0052b4] shrink-0" />
                  <span>{event.date}</span>
                </div>
              </div>

              {/* Sector Selection */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1.5">
                  1. Selecione o Setor
                </label>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {(['Pista', 'Arquibancada', 'Cadeira Superior', 'Cadeira Inferior'] as const).map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setSelectedSector(sec)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedSector === sec
                          ? 'border-[#0052b4] bg-blue-50/70 text-[#0052b4] ring-1 ring-[#0052b4]'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span>{sec}</span>
                        {selectedSector === sec && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-[11px] font-normal text-gray-500 block mt-0.5">
                        A partir de R$ {sectorPriceMap[sec].meia.toFixed(2).replace('.', ',')}
                      </span>
                    </button>
                  ))}
                </div>

                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1.5">
                  2. Tipo de Ingresso ({selectedSector})
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTicketType('meia')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      ticketType === 'meia'
                        ? 'border-[#0052b4] bg-blue-50/50 ring-2 ring-[#0052b4]/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-gray-900">Meia-Entrada</span>
                      {ticketType === 'meia' && <Check className="h-4 w-4 text-[#0052b4]" />}
                    </div>
                    <p className="text-sm font-black text-gray-950 mt-1">
                      R$ {sectorPriceMap[selectedSector].meia.toFixed(2).replace('.', ',')}
                    </p>
                    <span className="text-[10px] text-gray-500">Estudante / Idoso / PCD</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTicketType('inteira')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      ticketType === 'inteira'
                        ? 'border-[#0052b4] bg-blue-50/50 ring-2 ring-[#0052b4]/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-gray-900">Inteira</span>
                      {ticketType === 'inteira' && <Check className="h-4 w-4 text-[#0052b4]" />}
                    </div>
                    <p className="text-sm font-black text-gray-950 mt-1">
                      R$ {sectorPriceMap[selectedSector].inteira.toFixed(2).replace('.', ',')}
                    </p>
                    <span className="text-[10px] text-gray-500">Público Geral</span>
                  </button>
                </div>
              </div>

              {/* Attendee Form */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block">
                  Identificação do Titular do Ingresso
                </label>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={attendeeName}
                    onChange={(e) => setAttendeeName(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0052b4]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                    CPF do Titular
                  </label>
                  <input
                    type="text"
                    value={attendeeCpf}
                    onChange={(e) => setAttendeeCpf(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0052b4]"
                  />
                </div>

                {ticketType === 'meia' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                      Categoria de Benefício
                    </label>
                    <select
                      value={studentCategory}
                      onChange={(e) => setStudentCategory(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0052b4]"
                    >
                      <option value="Estudantes de ensino fundamental, médio ou superior da rede pública ou particular">
                        Estudantes de ensino fundamental, médio ou superior
                      </option>
                      <option value="Jovem de Baixa Renda (ID Jovem)">
                        Jovem de Baixa Renda (ID Jovem)
                      </option>
                      <option value="Pessoas com Deficiência (PCD)">
                        Pessoas com Deficiência (PCD)
                      </option>
                      <option value="Idosos (60 anos ou mais)">
                        Idosos (60 anos ou mais)
                      </option>
                    </select>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-100 pt-3 space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Ingresso</span>
                  <span>R$ {ticketPrice.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de serviço (20%)</span>
                  <span>R$ {serviceFee.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-gray-950 pt-1 border-t border-gray-100">
                  <span>Total</span>
                  <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              {/* Next button */}
              <button
                type="button"
                onClick={() => setStep('pix-confirm')}
                className="w-full rounded-xl bg-[#0052b4] hover:bg-[#004294] text-white py-3 text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                Continuar para Pagamento PIX
              </button>
            </>
          ) : (
            /* Pix Checkout confirmation step */
            <div className="space-y-4 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <QrCode className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Pagamento Instantâneo via PIX
              </h3>
              <p className="text-xs text-gray-500">
                Ao confirmar, seu pedido será processado e o ingresso será emitido diretamente na sua conta Quentro.
              </p>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-left space-y-2 text-xs">
                <div className="flex justify-between font-bold text-sm text-gray-900">
                  <span>Valor Total a Pagar:</span>
                  <span className="text-[#0052b4]">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                </div>
                <p className="text-gray-500 text-[11px]">
                  Titular: {attendeeName} ({attendeeCpf})
                </p>
                <p className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded text-[11px] font-semibold">
                  ✓ Aprovação imediata com envio ao Quentro
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('selection')}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleFinishPurchase}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition-all"
                >
                  Confirmar e Gerar Pedido
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
