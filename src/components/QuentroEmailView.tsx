import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Printer,
  Check,
  RotateCcw,
  Save,
  Calculator,
  ChevronDown,
  ChevronUp,
  Zap,
  Loader2,
  Bell,
  User,
  RefreshCw,
} from 'lucide-react';
import { OrderItem } from '../types';
import { TicketmasterLogo } from './TicketmasterLogo';
import { QuentroLogo } from './QuentroLogo';
import { INITIAL_ORDER_1, INITIAL_ORDER_2, INITIAL_ORDER_3, INITIAL_ORDER_4 } from '../data/mockData';

interface QuentroEmailViewProps {
  order: OrderItem;
  initialEmail: string;
  onSubmitEmail: (email: string) => void;
  onOpenTicket?: () => void;
  onBack: () => void;
  onOpenMenu?: () => void;
  onUpdateOrder?: (updatedOrder: OrderItem) => void;
  onResetOrder?: () => void;
  onReplicateOrder?: (
    fieldsToCopy: {
      attendeeName?: string;
      attendeeCpf?: string;
      sector?: string;
      quentroEmail?: string;
      eventName?: string;
      location?: string;
      orderDate?: string;
      ticketPrice?: number;
      serviceFee?: number;
      totalPrice?: number;
      paymentMethod?: string;
      cloneAll?: OrderItem;
    },
    targetSlots: Array<'1' | '2' | '3' | '4'>
  ) => void;
  activeOrderSlot?: '1' | '2' | '3' | '4';
  onSwitchOrderSlot?: (slot: '1' | '2' | '3' | '4') => void;
}

export const QuentroEmailView: React.FC<QuentroEmailViewProps> = ({
  order,
  initialEmail: _initialEmail,
  onSubmitEmail,
  onOpenTicket,
  onBack,
  onOpenMenu,
  onUpdateOrder,
  onResetOrder,
  onReplicateOrder,
  activeOrderSlot = '1',
  onSwitchOrderSlot,
}) => {
  // Email input and view states
  const [email, setEmail] = useState(_initialEmail || order.quentroEmail || '');
  const [isFocused, setIsFocused] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Cooldown & Confirmation state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCooldownLoading, setIsCooldownLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState(_initialEmail || order.quentroEmail || '');

  // Keep email in sync with order prop or active slot
  useEffect(() => {
    const current = order.quentroEmail ?? _initialEmail ?? '';
    setEmail(current);
    setSubmittedEmail(current);
    if (!current) {
      setIsSubmitted(false);
    }
  }, [order.quentroEmail, _initialEmail, activeOrderSlot]);

  // Edit mode & details state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<OrderItem>({ ...order });
  const [showMoreInfo, setShowMoreInfo] = useState(true);
  const [showMoreFields, setShowMoreFields] = useState(false);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  // Modo Preguiça - Seleção Múltipla de Pôsteres via Checkboxes (padrão apenas o slot ativo para independência total)
  const [batchTargetSlots, setBatchTargetSlots] = useState<Array<'1' | '2' | '3' | '4'>>([activeOrderSlot]);
  const [showLazyModeModal, setShowLazyModeModal] = useState(false);
  const [autoLazyMode, setAutoLazyMode] = useState(false);
  const [lazyCopyName, setLazyCopyName] = useState(true);
  const [lazyCopyCpf, setLazyCopyCpf] = useState(true);
  const [lazyCopySector, setLazyCopySector] = useState(false);
  const [lazyCopyQuentroEmail, setLazyCopyQuentroEmail] = useState(true);
  const [lazyCopyEventDetails, setLazyCopyEventDetails] = useState(false);
  const [lazyCopyPrice, setLazyCopyPrice] = useState(false);
  const [lazyCopyAll, setLazyCopyAll] = useState(false);
  const [selectedLazySlots, setSelectedLazySlots] = useState<Array<'1' | '2' | '3' | '4'>>([activeOrderSlot]);

  // Atualiza slots padrão ao alternar de pôster
  useEffect(() => {
    setBatchTargetSlots([activeOrderSlot]);
    setSelectedLazySlots([activeOrderSlot]);
  }, [activeOrderSlot]);

  // Sync state with order changes when not editing
  useEffect(() => {
    if (!isEditing) {
      setFormData({ ...order });
    }
  }, [order, isEditing]);

  const handleEmailChange = (newVal: string) => {
    setEmail(newVal);
    setFormData((prev) => ({ ...prev, quentroEmail: newVal }));
    if (onUpdateOrder) {
      onUpdateOrder({ ...order, quentroEmail: newVal });
    }
    if (validationError) setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalEmail = email.trim();
    if (!finalEmail) {
      setValidationError('Por favor, informe seu e-mail para continuar.');
      return;
    }
    setValidationError(null);

    // Save to order state immediately
    if (onUpdateOrder) {
      onUpdateOrder({ ...order, quentroEmail: finalEmail });
    }
    onSubmitEmail(finalEmail);

    // Realistic Cooldown to prevent artificial/instant transition
    setIsCooldownLoading(true);

    setTimeout(() => {
      setIsCooldownLoading(false);
      setSubmittedEmail(finalEmail);
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2000);
  };

  const handleEditEmail = () => {
    setIsSubmitted(false);
    setEmail(submittedEmail || email);
  };

  const clearInput = () => {
    setEmail('');
    setSubmittedEmail('');
    setIsSubmitted(false);
    setFormData((prev) => ({ ...prev, quentroEmail: '' }));
    if (onUpdateOrder) {
      onUpdateOrder({ ...order, quentroEmail: '' });
    }
    onSubmitEmail('');
  };

  const [moreInfoMap, setMoreInfoMap] = useState<Record<number, boolean>>({});

  const toggleMoreInfo = (idx: number) => {
    setMoreInfoMap((prev) => ({
      ...prev,
      [idx]: !(prev[idx] ?? showMoreInfo),
    }));
  };

  const ticketItems = useMemo(() => {
    if (order.items && order.items.length > 0) {
      return order.items;
    }
    return [
      {
        sector: order.sector,
        ticketPrice: order.ticketPrice,
        attendeeName: order.attendeeName,
        attendeeCategory: order.attendeeCategory,
        attendeeCpf: order.attendeeCpf,
      },
    ];
  }, [order]);

  // Quick 1-click Modo Preguiça (Versão Anterior Rápida)
  const handleQuickReplicateAll = () => {
    const currentAttendeeName = formData.attendeeName;
    const currentAttendeeCpf = formData.attendeeCpf;
    const currentSector = formData.sector;
    const currentEmail = formData.quentroEmail;

    const fieldsToCopy = {
      attendeeName: currentAttendeeName,
      attendeeCpf: currentAttendeeCpf,
      sector: currentSector,
      quentroEmail: currentEmail,
    };

    const targetSlots: Array<'1' | '2' | '3' | '4'> = ['1', '2', '3', '4'];

    if (onReplicateOrder) {
      onReplicateOrder(fieldsToCopy, targetSlots);
    } else {
      const slotsMap: Record<'1' | '2' | '3' | '4', string> = {
        '1': 'tm_saved_order_details_1',
        '2': 'tm_saved_order_details_2',
        '3': 'tm_saved_order_details_3',
        '4': 'tm_saved_order_details_4',
      };

      targetSlots.forEach((slot) => {
        try {
          const saved = localStorage.getItem(slotsMap[slot]);
          if (saved) {
            const parsed = JSON.parse(saved);
            let updatedItems = parsed.items;
            if (updatedItems && updatedItems.length > 0) {
              updatedItems = updatedItems.map((it: any) => ({
                ...it,
                attendeeName: currentAttendeeName,
                attendeeCpf: currentAttendeeCpf,
                sector: currentSector,
              }));
            }
            const updated = {
              ...parsed,
              ...fieldsToCopy,
              items: updatedItems,
            };
            localStorage.setItem(slotsMap[slot], JSON.stringify(updated));
            if (slot === '1') localStorage.setItem('tm_saved_order_details', JSON.stringify(updated));
          }
        } catch (e) {
          console.error(e);
        }
      });
    }

    setSaveNotification('⚡ Modo Preguiça Rápido: Nome, CPF e Dados replicados instantaneamente para todos os 4 Pôsteres!');
    setTimeout(() => setSaveNotification(null), 4500);
  };

  // Helper to sync changes immediately to parent and local storage
  const syncOrderChanges = (updated: OrderItem) => {
    setFormData(updated);
    if (onUpdateOrder) {
      onUpdateOrder(updated);
    }
  };

  // Synchronized field handlers (Instantly updates parent and storage)
  const handleAttendeeNameChange = (val: string) => {
    let updatedItems = formData.items;
    if (formData.items && formData.items.length > 0) {
      updatedItems = formData.items.map((it) => ({
        ...it,
        attendeeName: val,
      }));
    }
    const updated = {
      ...formData,
      attendeeName: val,
      items: updatedItems,
    };
    syncOrderChanges(updated);

    if (autoLazyMode && onReplicateOrder) {
      onReplicateOrder({ attendeeName: val }, ['1', '2', '3', '4']);
    }
  };

  const handleAttendeeCpfChange = (val: string) => {
    let updatedItems = formData.items;
    if (formData.items && formData.items.length > 0) {
      updatedItems = formData.items.map((it) => ({
        ...it,
        attendeeCpf: val,
      }));
    }
    const updated = {
      ...formData,
      attendeeCpf: val,
      items: updatedItems,
    };
    syncOrderChanges(updated);

    if (autoLazyMode && onReplicateOrder) {
      onReplicateOrder({ attendeeCpf: val }, ['1', '2', '3', '4']);
    }
  };

  const handleSectorChange = (val: string) => {
    let updatedItems = formData.items;
    if (formData.items && formData.items.length > 0) {
      updatedItems = formData.items.map((it) => ({
        ...it,
        sector: val,
      }));
    }
    const updated = {
      ...formData,
      sector: val,
      items: updatedItems,
    };
    syncOrderChanges(updated);
  };

  // Individual ticket item handlers (for orders with multiple tickets like Poster 3)
  const handleItemAttendeeNameChange = (index: number, val: string) => {
    if (!formData.items || formData.items.length <= index) return;
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], attendeeName: val };
    const updated = {
      ...formData,
      attendeeName: index === 0 ? val : formData.attendeeName,
      items: updatedItems,
    };
    syncOrderChanges(updated);
  };

  const handleItemAttendeeCpfChange = (index: number, val: string) => {
    if (!formData.items || formData.items.length <= index) return;
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], attendeeCpf: val };
    const updated = {
      ...formData,
      attendeeCpf: index === 0 ? val : formData.attendeeCpf,
      items: updatedItems,
    };
    syncOrderChanges(updated);
  };

  const handleItemSectorChange = (index: number, val: string) => {
    if (!formData.items || formData.items.length <= index) return;
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], sector: val };
    const updated = {
      ...formData,
      sector: index === 0 ? val : formData.sector,
      items: updatedItems,
    };
    syncOrderChanges(updated);
  };

  // Modo Preguiça execution handler
  const handleApplyLazyMode = () => {
    if (selectedLazySlots.length === 0) return;

    const currentAttendeeName = formData.attendeeName;
    const currentAttendeeCpf = formData.attendeeCpf;
    const currentSector = formData.sector;

    const fieldsToCopy: any = {};
    if (lazyCopyAll) {
      fieldsToCopy.cloneAll = formData;
    } else {
      if (lazyCopyName) fieldsToCopy.attendeeName = currentAttendeeName;
      if (lazyCopyCpf) fieldsToCopy.attendeeCpf = currentAttendeeCpf;
      if (lazyCopySector) fieldsToCopy.sector = currentSector;
      if (lazyCopyQuentroEmail && formData.quentroEmail) fieldsToCopy.quentroEmail = formData.quentroEmail;
      if (lazyCopyEventDetails) {
        fieldsToCopy.eventName = formData.eventName;
        fieldsToCopy.location = formData.location;
        fieldsToCopy.orderDate = formData.orderDate;
      }
      if (lazyCopyPrice) {
        fieldsToCopy.ticketPrice = formData.ticketPrice;
        fieldsToCopy.serviceFee = formData.serviceFee;
        fieldsToCopy.totalPrice = formData.totalPrice;
        fieldsToCopy.paymentMethod = formData.paymentMethod;
      }
    }

    if (onReplicateOrder) {
      onReplicateOrder(fieldsToCopy, selectedLazySlots);
    } else {
      const slotsMap: Record<'1' | '2' | '3' | '4', string> = {
        '1': 'tm_saved_order_details_1',
        '2': 'tm_saved_order_details_2',
        '3': 'tm_saved_order_details_3',
        '4': 'tm_saved_order_details_4',
      };

      selectedLazySlots.forEach((slot) => {
        try {
          const saved = localStorage.getItem(slotsMap[slot]);
          if (saved) {
            const parsed = JSON.parse(saved);
            let updated: any;
            if (lazyCopyAll) {
              updated = { ...formData };
            } else {
              let updatedItems = parsed.items;
              if (updatedItems && updatedItems.length > 0) {
                updatedItems = updatedItems.map((it: any) => ({
                  ...it,
                  ...(lazyCopyName ? { attendeeName: currentAttendeeName } : {}),
                  ...(lazyCopyCpf ? { attendeeCpf: currentAttendeeCpf } : {}),
                  ...(lazyCopySector ? { sector: currentSector } : {}),
                  ...(lazyCopyPrice ? { ticketPrice: formData.ticketPrice } : {}),
                }));
              }
              updated = {
                ...parsed,
                ...fieldsToCopy,
                items: updatedItems,
              };
            }
            localStorage.setItem(slotsMap[slot], JSON.stringify(updated));
            if (slot === '1') localStorage.setItem('tm_saved_order_details', JSON.stringify(updated));
          }
        } catch (e) {
          console.error(e);
        }
      });
    }

    if (selectedLazySlots.includes(activeOrderSlot)) {
      if (lazyCopyAll) {
        setFormData({ ...formData });
        if (onUpdateOrder) onUpdateOrder(formData);
      } else {
        let updatedItems = formData.items;
        if (updatedItems && updatedItems.length > 0) {
          updatedItems = updatedItems.map((it) => ({
            ...it,
            ...(lazyCopyName ? { attendeeName: currentAttendeeName } : {}),
            ...(lazyCopyCpf ? { attendeeCpf: currentAttendeeCpf } : {}),
            ...(lazyCopySector ? { sector: currentSector } : {}),
            ...(lazyCopyPrice ? { ticketPrice: formData.ticketPrice } : {}),
          }));
        }
        const updatedForm = {
          ...formData,
          ...fieldsToCopy,
          items: updatedItems,
        };
        setFormData(updatedForm);
        if (onUpdateOrder) onUpdateOrder(updatedForm);
      }
    }

    setShowLazyModeModal(false);
    setSaveNotification(`⚡ Modo Preguiça em Lote: Informações replicadas para ${selectedLazySlots.length} pôster(es)!`);
    setTimeout(() => setSaveNotification(null), 4500);
  };

  // Auto calculate total and 20% service fee
  const handleTicketPriceChange = (val: number) => {
    let itemsSum = val;
    let updatedItems = formData.items;
    if (formData.items && formData.items.length > 0) {
      updatedItems = formData.items.map((it) => ({
        ...it,
        ticketPrice: val,
      }));
      itemsSum = val * formData.items.length;
    }
    const calculatedFee = itemsSum * 0.20;
    const insurance = Number(formData.insuranceFee) || 0;
    const newTotal = itemsSum + calculatedFee + insurance;

    setFormData({
      ...formData,
      ticketPrice: val,
      serviceFee: calculatedFee,
      totalPrice: newTotal,
      items: updatedItems,
    });
  };

  const handleCalc20Fee = () => {
    let itemsSum = 0;
    if (formData.items && formData.items.length > 0) {
      itemsSum = formData.items.reduce((sum, it) => sum + (Number(it.ticketPrice) || 0), 0);
    } else {
      itemsSum = Number(formData.ticketPrice) || 0;
    }
    const calculatedFee = itemsSum * 0.20;
    const insurance = Number(formData.insuranceFee) || 0;
    setFormData({
      ...formData,
      serviceFee: calculatedFee,
      totalPrice: itemsSum + calculatedFee + insurance,
    });
  };

  const handleAutoCalculateTotal = () => {
    let itemsSum = 0;
    if (formData.items && formData.items.length > 0) {
      itemsSum = formData.items.reduce((sum, it) => sum + (Number(it.ticketPrice) || 0), 0);
    } else {
      itemsSum = Number(formData.ticketPrice) || 0;
    }
    const calculatedFee = itemsSum * 0.20;
    const insurance = Number(formData.insuranceFee) || 0;
    setFormData({
      ...formData,
      serviceFee: calculatedFee,
      totalPrice: itemsSum + calculatedFee + insurance,
    });
  };

  // Save changes handler (with batch save support for selected posters)
  const handleSaveOrder = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (onUpdateOrder) onUpdateOrder(formData);

    try {
      localStorage.setItem(`tm_saved_order_details_${activeOrderSlot}`, JSON.stringify(formData));
      if (activeOrderSlot === '1') localStorage.setItem('tm_saved_order_details', JSON.stringify(formData));
    } catch (err) {
      console.error(err);
    }

    if (batchTargetSlots.length > 1) {
      if (onReplicateOrder) {
        onReplicateOrder({ cloneAll: formData }, batchTargetSlots);
      } else {
        const slotsMap: Record<'1' | '2' | '3' | '4', string> = {
          '1': 'tm_saved_order_details_1',
          '2': 'tm_saved_order_details_2',
          '3': 'tm_saved_order_details_3',
          '4': 'tm_saved_order_details_4',
        };
        batchTargetSlots.forEach((slot) => {
          try {
            localStorage.setItem(slotsMap[slot], JSON.stringify(formData));
            if (slot === '1') localStorage.setItem('tm_saved_order_details', JSON.stringify(formData));
          } catch (err) {
            console.error(err);
          }
        });
      }
      setSaveNotification(`⚡ Modo Preguiça em Lote: Dados salvos simultaneamente em ${batchTargetSlots.length} pôsteres!`);
    } else {
      setSaveNotification(`✅ Alterações salvas com sucesso no Pôster ${activeOrderSlot}!`);
    }

    setIsEditing(false);
    setTimeout(() => setSaveNotification(null), 3500);
  };

  // Helper to toggle sector string seamlessly through available sectors
  const toggleSectorStr = (str: string) => {
    if (!str) return 'Pista - Meia-Entrada';

    let suffix = '';
    const dashIdx = str.indexOf('-');
    if (dashIdx !== -1) {
      suffix = str.substring(dashIdx).trim();
    } else if (/meia/i.test(str)) {
      suffix = '- Meia-Entrada';
    } else if (/inteira/i.test(str)) {
      suffix = '- Inteira';
    }

    if (/pista\s*premium/i.test(str)) {
      return `Pista ${suffix}`.trim();
    } else if (/pista/i.test(str)) {
      return `Arquibancada ${suffix}`.trim();
    } else if (/arquibancada/i.test(str)) {
      return `Cadeira Inferior ${suffix}`.trim();
    } else if (/cadeira\s*inferior/i.test(str)) {
      return `Cadeira Superior ${suffix}`.trim();
    } else if (/cadeira/i.test(str)) {
      return `Pista Premium ${suffix}`.trim();
    }
    return `Pista ${suffix}`.trim();
  };

  // Hidden quick toggles for date and sector
  const handleToggleDate = () => {
    let current = order.location || '';
    let next = current;
    if (current.includes('30/10/2026')) {
      next = current.replace('30/10/2026', '31/10/2026');
    } else if (current.includes('31/10/2026')) {
      next = current.replace('31/10/2026', '01/11/2026');
    } else if (current.includes('01/11/2026')) {
      next = current.replace('01/11/2026', '30/10/2026');
    } else if (current.includes('30/10')) {
      next = current.replace('30/10', '31/10');
    } else if (current.includes('31/10')) {
      next = current.replace('31/10', '01/11');
    } else if (current.includes('01/11')) {
      next = current.replace('01/11', '30/10');
    } else {
      const dateMatch = current.match(/\d{2}\/\d{2}\/\d{4}/);
      if (dateMatch) {
        next = current.replace(dateMatch[0], '31/10/2026');
      } else {
        next = `${current} - 31/10/2026`;
      }
    }
    const updated = { ...order, location: next };
    setFormData(updated);
    if (onUpdateOrder) onUpdateOrder(updated);
    try {
      localStorage.setItem(`tm_saved_order_details_${activeOrderSlot}`, JSON.stringify(updated));
      if (activeOrderSlot === '1') localStorage.setItem('tm_saved_order_details', JSON.stringify(updated));
    } catch {}
    setSaveNotification(`⚡ Data do Pôster ${activeOrderSlot} atualizada: ${next}`);
    setTimeout(() => setSaveNotification(null), 3000);
  };

  const handleToggleSector = () => {
    const nextSector = toggleSectorStr(order.sector);
    const isArquibancada = /arquibancada/i.test(nextSector);
    const isCadeira = /cadeira/i.test(nextSector);
    const isPremium = /premium/i.test(nextSector);
    const nextTicketPrice = isPremium ? 850 : isCadeira ? 580 : isArquibancada ? 340 : 625;

    let updatedItems = order.items;
    let nextServiceFee = 0;
    let nextTotalPrice = 0;

    if (order.items && order.items.length > 0) {
      updatedItems = order.items.map((it) => {
        const itemNextSector = toggleSectorStr(it.sector);
        const itArquibancada = /arquibancada/i.test(itemNextSector);
        const itCadeira = /cadeira/i.test(itemNextSector);
        const itPremium = /premium/i.test(itemNextSector);
        const itemNextPrice = itPremium ? 850 : itCadeira ? 580 : itArquibancada ? 340 : 625;
        return {
          ...it,
          sector: itemNextSector,
          ticketPrice: itemNextPrice,
        };
      });
      const itemsSum = updatedItems.reduce((sum, it) => sum + (Number(it.ticketPrice) || 0), 0);
      nextServiceFee = itemsSum * 0.20;
      const insurance = Number(order.insuranceFee) || 0;
      nextTotalPrice = itemsSum + nextServiceFee + insurance;
    } else {
      nextServiceFee = nextTicketPrice * 0.20;
      const insurance = Number(order.insuranceFee) || 0;
      nextTotalPrice = nextTicketPrice + nextServiceFee + insurance;
    }

    const updated: OrderItem = {
      ...order,
      sector: nextSector,
      ticketPrice: nextTicketPrice,
      serviceFee: nextServiceFee,
      totalPrice: nextTotalPrice,
      items: updatedItems,
    };
    setFormData(updated);
    if (onUpdateOrder) onUpdateOrder(updated);
    try {
      localStorage.setItem(`tm_saved_order_details_${activeOrderSlot}`, JSON.stringify(updated));
      if (activeOrderSlot === '1') localStorage.setItem('tm_saved_order_details', JSON.stringify(updated));
    } catch {}
    setSaveNotification(`⚡ Setor do Pôster ${activeOrderSlot} atualizado: ${nextSector}`);
    setTimeout(() => setSaveNotification(null), 3000);
  };

  // Cancel edit handler
  const handleCancelEdit = () => {
    setFormData({ ...order });
    setIsEditing(false);
  };

  // Reset to original data
  const handleResetToDefault = () => {
    let defaultData = INITIAL_ORDER_1;
    if (activeOrderSlot === '2') defaultData = INITIAL_ORDER_2;
    else if (activeOrderSlot === '3') defaultData = INITIAL_ORDER_3;
    else if (activeOrderSlot === '4') defaultData = INITIAL_ORDER_4;

    setFormData({ ...defaultData });
    if (onUpdateOrder) onUpdateOrder(defaultData);
    if (onResetOrder) onResetOrder();
    setIsEditing(false);
    setSaveNotification('Dados originais restaurados com sucesso!');
    setTimeout(() => setSaveNotification(null), 3000);
  };

  const eventTitle = (order.eventName || 'BTS WORLD TOUR ARIRANG').toUpperCase();

  return (
    <div
      id="quentro-email-screen"
      className="min-h-screen bg-white text-[#111827] flex flex-col pb-28 selection:bg-[#00e5bb] selection:text-black relative"
    >
      {/* iOS Overscroll Top Shield (Guarantees zero white gap when pulling down on iPhone) */}
      <div className="absolute -top-[500px] left-0 right-0 h-[500px] bg-[#1E4CD6] pointer-events-none z-50" />

      {/* ========================================================================= */}
      {/* 1. TICKETMASTER BLUE HEADER - EXACT REPLICA OF SCREENSHOT                 */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 w-full bg-[#1E4CD6] text-white select-none pt-[env(safe-area-inset-top,0px)] shadow-xs">
        <div className="w-full px-4 h-[50px] flex items-center justify-between">
          {/* Left: ticketmaster logo */}
          <button
            type="button"
            onClick={isSubmitted ? handleEditEmail : onBack}
            className="focus:outline-none flex items-center cursor-pointer hover:opacity-95"
            title="Ticketmaster"
          >
            <TicketmasterLogo variant="white" size="md" />
          </button>

          {/* Right: Hamburger menu icon (3 white lines) */}
          <button
            id="quentro-menu-btn"
            type="button"
            onClick={onOpenMenu || onBack}
            className="p-1 -mr-1 text-white hover:opacity-80 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
            title="Menu"
          >
            <div className="flex flex-col justify-center items-end gap-[4.5px] w-[22px]">
              <span className="block h-[2.2px] w-full bg-white rounded-full" />
              <span className="block h-[2.2px] w-full bg-white rounded-full" />
              <span className="block h-[2.2px] w-full bg-white rounded-full" />
            </div>
          </button>
        </div>

        {/* Second row: Meus pedidos (centered) */}
        <div className="w-full pb-3.5 pt-0.5 flex items-center justify-center">
          <span className="text-[15px] font-medium tracking-normal text-white">
            Meus pedidos
          </span>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. SUB HEADER: < Voltar | BTS WORLD TOUR ARIRANG                          */}
      {/* ========================================================================= */}
      <div className="w-full bg-white border-b border-gray-200/80 shadow-xs select-none">
        <div className="flex h-[52px] w-full items-center px-4 max-w-lg mx-auto">
          {/* Left: < Voltar */}
          <button
            type="button"
            id="quentro-email-back-btn"
            onClick={isSubmitted ? handleEditEmail : onBack}
            className="flex items-center gap-2 text-black hover:opacity-80 active:scale-98 transition-all cursor-pointer py-2 pl-0.5 pr-2 shrink-0"
          >
            <ChevronLeft className="h-[20px] w-[20px] text-black stroke-[2.4]" />
            <span className="text-[15px] font-normal tracking-normal text-black font-sans">Voltar</span>
          </button>

          {/* Vertical Divider */}
          <div className="h-6 w-[1px] bg-[#e2e8f0] mx-3 shrink-0" />

          {/* Right/Title: BTS WORLD TOUR ARIRANG */}
          <div className="flex-1 min-w-0 pr-1">
            <h1
              className="text-[14px] sm:text-[15px] font-medium tracking-[0.03em] text-black truncate uppercase font-sans leading-none"
              title={eventTitle}
            >
              {eventTitle}
            </h1>
          </div>
        </div>
      </div>

      {/* Top Notification Toast (Save success: 'seja feliz meu nobre') */}
      {saveNotification && (
        <div
          id="save-success-notification-quentro"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-[#0f172a] text-white px-5 py-3.5 shadow-2xl border border-emerald-500/50 flex items-center gap-3 animate-in fade-in slide-in-from-top-3 max-w-[360px] w-[90%]"
        >
          <div className="rounded-full bg-emerald-500/20 p-2 text-emerald-400 shrink-0">
            <Check className="h-5 w-5 stroke-[3]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-300">As alterações foram feitas e salvas com sucesso!</p>
            <p className="text-sm font-black text-emerald-400 tracking-wide">seja feliz meu nobre</p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. APPROVAL STATUS BAR: Aprovado (Soft Mint / Emerald Gradient)            */}
      {/* ========================================================================= */}
      <div className="w-full bg-gradient-to-r from-[#7ad8b4] via-[#68cfb0] to-[#5ec6a7] text-[#0d3427] h-[72px] flex items-center justify-center shrink-0 shadow-inner">
        <span className="text-[21px] font-bold tracking-tight text-[#0d3427]">
          Aprovado
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN QUENTRO EMAIL CARD SECTION                                        */}
      {/* ========================================================================= */}
      <section className="w-full bg-[#0b131b] px-3.5 pt-4 pb-28 sm:pb-36 min-h-[calc(100vh-140px)] flex flex-col justify-start relative">
        {/* Floating Dark Slate Card */}
        <div className="w-full max-w-[420px] mx-auto rounded-3xl bg-[#14202b] border border-[#1e2d3b]/90 pt-5 px-5 sm:px-6 pb-8 shadow-2xl relative">
          
          {/* Top Row: Quentro Logo (left) | Como funciona o Quentro? (right) */}
          <div className="flex items-center justify-between pb-4 border-b border-[#223344]/60">
            <div className="flex items-center cursor-default select-none">
              <QuentroLogo size="md" />
            </div>

            <button
              id="quentro-help-link"
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="text-[13px] font-normal text-[#9ca3af] hover:text-white transition-colors cursor-pointer"
            >
              Como funciona o Quentro?
            </button>
          </div>

          {!isSubmitted ? (
            /* EMAIL INPUT VIEW */
            <div>
              {/* Big Headline */}
              <div className="space-y-2 pt-6 pb-6">
                <h2 className="text-[23px] sm:text-[25px] font-bold text-white tracking-tight leading-[1.2]">
                  Digite seu e-mail de usuário<br />Quentro.
                </h2>
                <p className="text-[14px] sm:text-[14.5px] text-[#9ca3af] font-normal leading-relaxed pt-1">
                  Se você não possui um nome de usuário<br className="hidden sm:inline" /> Quentro, insira seu e-mail pessoal.
                </p>
              </div>

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <div
                    className={`w-full rounded-xl bg-[#091017] px-4 py-4 flex items-center justify-between transition-all border ${
                      email.toLowerCase().includes('.com')
                        ? 'border-[#00e5bb] shadow-[0_0_10px_rgba(0,229,187,0.25)]'
                        : isFocused
                        ? 'border-gray-500'
                        : 'border-transparent'
                    }`}
                  >
                    <input
                      id="quentro-email-input"
                      type="email"
                      value={email}
                      disabled={isCooldownLoading}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      onFocus={() => {
                        setIsFocused(true);
                        window.dispatchEvent(new CustomEvent('hide-bottom-nav'));
                      }}
                      onBlur={() => {
                        setIsFocused(false);
                        window.dispatchEvent(new CustomEvent('show-bottom-nav'));
                      }}
                      placeholder="Endereço de e-mail"
                      autoCapitalize="none"
                      autoCorrect="off"
                      required
                      className="w-full bg-transparent text-[15px] font-normal text-white placeholder-[#64748b] focus:outline-none tracking-normal disabled:opacity-50"
                    />

                    {/* Verification icon or Clear button */}
                    {email.toLowerCase().includes('.com') ? (
                      <button
                        id="quentro-email-verified-icon"
                        type="button"
                        onClick={() => {
                          if (!isCooldownLoading) {
                            clearInput();
                            if (validationError) setValidationError(null);
                          }
                        }}
                        className="ml-2 text-[#00e5bb] hover:text-[#00e5bb]/80 p-1 flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer"
                        title="E-mail verificado (clique para limpar)"
                      >
                        <CheckCircle2 className="h-4 w-4 text-[#00e5bb]" />
                      </button>
                    ) : email.length > 0 ? (
                      <button
                        id="quentro-clear-input-btn"
                        type="button"
                        onClick={() => {
                          if (!isCooldownLoading) {
                            clearInput();
                            if (validationError) setValidationError(null);
                          }
                        }}
                        className="ml-2 text-gray-500 hover:text-gray-300 p-1 cursor-pointer shrink-0 transition-colors"
                        title="Limpar campo"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>

                  {validationError && (
                    <p className="text-xs text-rose-400 font-medium pl-1">
                      {validationError}
                    </p>
                  )}
                </div>

                {/* Action Button: Continuar > with Cooldown Loader */}
                <button
                  id="quentro-submit-continue-btn"
                  type="submit"
                  disabled={isCooldownLoading}
                  className={`w-full flex items-center justify-between rounded-xl bg-white hover:bg-gray-100 text-black px-4 py-3.5 font-medium text-[15.5px] transition-all shadow-sm ${
                    isCooldownLoading
                      ? 'cursor-wait opacity-90'
                      : 'cursor-pointer active:scale-[0.99] group'
                  }`}
                >
                  {isCooldownLoading ? (
                    <div className="flex items-center gap-2.5">
                      <Loader2 className="h-4 w-4 text-black animate-spin" />
                      <span className="font-bold text-black text-[15px]">Verificando no Quentro...</span>
                    </div>
                  ) : (
                    <span className="font-bold text-black text-[15.5px]">Continuar</span>
                  )}
                  <div className="w-7 h-7 rounded-full bg-[#e2e8f0] flex items-center justify-center shrink-0">
                    <ChevronRight className="h-4 w-4 text-gray-800 stroke-[2.5]" />
                  </div>
                </button>
              </form>
            </div>
          ) : (
            /* CONFIRMED SCREEN (EXACT MATCH TO IMG_8531.png) */
            <div className="pt-4 pb-2 animate-in fade-in duration-500">
              {/* Headline */}
              <h2 className="text-[20px] sm:text-[22px] font-extrabold text-white text-center leading-snug">
                Seus ingressos já estão no Quentro.
              </h2>

              {/* Subtitle with entered email */}
              <div className="text-[13.5px] sm:text-[14px] text-[#9ca3af] text-center leading-relaxed mt-2.5 mb-6">
                <p>Baixe Quentro no seu celular e faça login</p>
                <p className="mt-0.5">
                  com{' '}
                  <button
                    type="button"
                    onClick={handleEditEmail}
                    className="text-[#00e5bb] hover:underline font-semibold cursor-pointer inline-flex items-center gap-1"
                    title="Clique para alterar e-mail"
                  >
                    <span>{submittedEmail}</span>
                  </button>
                </p>
              </div>

              {/* Smartphone Mockup (Centerpiece from IMG_8531.png) */}
              <div className="w-full flex justify-center items-center py-1">
                <div
                  onClick={() => (onOpenTicket ? onOpenTicket() : setShowProblemModal(true))}
                  className="w-[240px] sm:w-[250px] bg-[#101720] rounded-[28px] p-2.5 shadow-[0_16px_36px_rgba(0,0,0,0.65)] border-2 border-[#2b394a]/90 relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02]"
                  title="Clique para visualizar o ingresso digital"
                >
                  {/* Top Speaker and Camera Bezel */}
                  <div className="w-full flex items-center justify-center gap-1.5 pb-2 pt-0.5">
                    <div className="w-10 h-1 bg-[#233142] rounded-full" />
                    <div className="w-1.5 h-1.5 bg-[#1a2533] rounded-full" />
                  </div>

                  {/* Inner Phone Screen */}
                  <div className="w-full bg-[#0d141c] rounded-[20px] p-3 text-white border border-white/5">
                    {/* Header Bar */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <span className="text-[12px] font-bold text-white tracking-tight">Ingressos</span>
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Bell className="w-3 h-3" />
                        <User className="w-3 h-3" />
                      </div>
                    </div>

                    {/* Tabs: Próximos (Active) / Anteriores */}
                    <div className="flex bg-[#16212d] rounded-lg p-0.5 mt-2 mb-2.5">
                      <div className="flex-1 bg-white text-gray-950 font-bold text-[9.5px] py-1 text-center rounded-md shadow-xs">
                        Próximos
                      </div>
                      <div className="flex-1 text-gray-400 font-medium text-[9.5px] py-1 text-center">
                        Anteriores
                      </div>
                    </div>

                    {/* Section: Setembro */}
                    <div className="text-[8.5px] uppercase tracking-wider text-gray-400 font-bold mb-1.5 pl-0.5 text-left">
                      Setembro
                    </div>

                    {/* Ticket 1: Coral / Orange (02) */}
                    <div className="bg-[#172330] rounded-xl p-2 border border-white/5 flex items-center gap-2 mb-1.5 text-left">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#ff5722] to-[#f4511e] flex flex-col items-center justify-center text-white shrink-0 shadow-xs">
                        <span className="text-[11px] font-black leading-none">02</span>
                        <span className="text-[6.5px] font-bold tracking-tight opacity-90 uppercase">SET</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9.5px] font-bold text-white truncate leading-tight">
                          {order.eventName || 'BTS WORLD TOUR ARIRANG'}
                        </p>
                        <p className="text-[8px] text-gray-400 truncate leading-tight mt-0.5">
                          {order.sector || order.location || 'Allianz Parque'}
                        </p>
                        <span className="text-[7.5px] text-[#00e5bb] font-semibold mt-0.5 inline-block">
                          1 Ingresso
                        </span>
                      </div>
                    </div>

                    {/* Ticket 2: Purple (03) */}
                    <div className="bg-[#172330] rounded-xl p-2 border border-white/5 flex items-center gap-2 text-left opacity-90">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex flex-col items-center justify-center text-white shrink-0 shadow-xs">
                        <span className="text-[11px] font-black leading-none">03</span>
                        <span className="text-[6.5px] font-bold tracking-tight opacity-90 uppercase">SET</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9.5px] font-bold text-white truncate leading-tight">
                          {order.eventName || 'BTS WORLD TOUR ARIRANG'}
                        </p>
                        <p className="text-[8px] text-gray-400 truncate leading-tight mt-0.5">
                          {order.location || 'São Paulo, SP'}
                        </p>
                        <span className="text-[7.5px] text-[#00e5bb] font-semibold mt-0.5 inline-block">
                          1 Ingresso
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Link (Exact from IMG_8531.png) */}
              <div className="mt-5 text-center">
                <button
                  id="quentro-problem-link"
                  type="button"
                  onClick={() => setShowProblemModal(true)}
                  className="text-[#00e5bb] hover:text-[#00e5bb]/80 text-[13px] sm:text-[14px] font-medium transition-colors cursor-pointer"
                >
                  Ocorreu algum problema com seus ingressos?
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Problem Assistance Modal */}
      {showProblemModal && (
        <div
          id="quentro-problem-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-[#1a232e] border border-[#2b394a] rounded-2xl w-full max-w-sm p-5 text-white shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base text-white">Ajuda com Ingressos</h3>
              <button
                type="button"
                onClick={() => setShowProblemModal(false)}
                className="text-gray-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Seus ingressos estão vinculados ao e-mail{' '}
              <strong className="text-[#00e5bb] break-all">{submittedEmail}</strong>.
            </p>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowProblemModal(false);
                  handleEditEmail();
                }}
                className="w-full flex items-center justify-between bg-[#111822] hover:bg-[#16212e] p-3 rounded-xl border border-white/10 text-left text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                <span>Alterar endereço de e-mail</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              {onOpenTicket && (
                <button
                  type="button"
                  onClick={() => {
                    setShowProblemModal(false);
                    onOpenTicket();
                  }}
                  className="w-full flex items-center justify-between bg-[#00e5bb]/15 hover:bg-[#00e5bb]/25 p-3 rounded-xl border border-[#00e5bb]/30 text-left text-xs font-semibold text-[#00e5bb] transition-colors cursor-pointer"
                >
                  <span>Ver ingresso digital no navegador (QR Code)</span>
                  <ChevronRight className="w-4 h-4 text-[#00e5bb]" />
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowProblemModal(false);
                  setSaveNotification(`E-mail reenviado com sucesso para ${submittedEmail}!`);
                  setTimeout(() => setSaveNotification(null), 3000);
                }}
                className="w-full flex items-center justify-between bg-[#111822] hover:bg-[#16212e] p-3 rounded-xl border border-white/10 text-left text-xs font-semibold text-gray-300 transition-colors cursor-pointer"
              >
                <span>Reenviar e-mail de acesso</span>
                <RefreshCw className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowProblemModal(false)}
              className="w-full py-2.5 text-center text-xs font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. EMBEDDED COMPLETE ORDER DETAILS SECTION (PURE WHITE BACKGROUND)        */}
      {/* ========================================================================= */}
      <section className="w-full bg-white text-[#111827] px-5 pt-10 pb-16 border-t border-gray-100 shadow-xs">
        {/* EDIT MODE PANEL (Appears when clicking "Imprimir resumo da compra") */}
        {isEditing && (
          <div className="mb-6 rounded-2xl border-2 border-[#1E4CD6] bg-blue-50/80 p-4 shadow-md animate-in fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-blue-200 pb-3">
              <div>
                <h2 className="text-sm font-black text-gray-900">
                  Modo de Edição do Comprovante
                </h2>
                <p className="text-[11px] text-gray-600">
                  Altere os dados desejados e clique em Salvar.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleQuickReplicateAll}
                  className="rounded-lg bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 px-3 py-1.5 text-xs font-black text-white shadow-md transition-all active:scale-95 flex items-center space-x-1.5 cursor-pointer border border-amber-300/40"
                  title="Replicar imediatamente Nome, CPF e Dados para todos os 4 pôsteres com 1 clique"
                >
                  <Zap className="h-3.5 w-3.5 fill-amber-200" />
                  <span>⚡ Replicar em 1 Clique (Todos os Pôsteres)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowLazyModeModal(!showLazyModeModal)}
                  className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-amber-900 border border-amber-300 hover:bg-amber-50 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                  title="Personalizar campos e pôsteres de destino"
                >
                  <Zap className="h-3 w-3 fill-amber-500 text-amber-600" />
                  <span>Opções de Lote</span>
                </button>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-gray-700 border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5 inline mr-1" />
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleSaveOrder}
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-1.5 text-xs font-black text-white shadow transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5 inline mr-0.5" />
                  <span>{batchTargetSlots.length > 1 ? `Salvar em Lote (${batchTargetSlots.length} Pôsteres)` : 'Salvar'}</span>
                </button>
              </div>
            </div>

            {/* Order Slot Switcher & Batch Selection via Checkboxes */}
            {onSwitchOrderSlot && (
              <div className="rounded-xl bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-amber-50/60 border border-blue-200/80 p-3 space-y-2.5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider shadow-2xs">
                        <Zap className="h-3 w-3 fill-white" />
                        Modo Preguiça em Lote
                      </span>
                      <span className="text-[12px] font-bold text-[#1E4CD6]">
                        Configuração de Ingressos Multi-Pôster
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-600 block mt-0.5">
                      {batchTargetSlots.length > 1
                        ? `⚡ Modo Lote ativo: Alterações serão salvas simultaneamente nos ${batchTargetSlots.length} pôsteres marcados!`
                        : 'Marque múltiplos pôsteres via checkboxes para configurar ingressos em lote rapidamente.'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (batchTargetSlots.length === 4) {
                          setBatchTargetSlots([activeOrderSlot]);
                        } else {
                          setBatchTargetSlots(['1', '2', '3', '4']);
                        }
                      }}
                      className="px-2.5 py-1 rounded-md bg-white hover:bg-amber-50 border border-amber-300 text-[11px] font-bold text-amber-900 cursor-pointer shadow-2xs transition-colors"
                    >
                      {batchTargetSlots.length === 4 ? 'Apenas Atual' : 'Marcar Todos (4 pôsteres)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLazyModeModal(true)}
                      className="px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-black cursor-pointer shadow-2xs transition-colors flex items-center gap-1"
                    >
                      <Zap className="h-3 w-3 fill-amber-200" />
                      <span>Replicar Campos</span>
                    </button>
                  </div>
                </div>

                {/* Checkbox cards for each poster */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { slot: '1', name: 'Pôster 1', detail: 'BTS Pista Meia', tag: 'Pista' },
                    { slot: '2', name: 'Pôster 2', detail: 'BTS Arq. Meia', tag: 'Arquibancada' },
                    { slot: '3', name: 'Pôster 3', detail: 'BTS Pista (2 ing)', tag: '2 Ingressos' },
                    { slot: '4', name: 'Pôster 4', detail: 'BTS Arq. Inteira', tag: 'Inteira' },
                  ].map(({ slot, name, detail, tag }) => {
                    const isChecked = batchTargetSlots.includes(slot as any);
                    const isActive = activeOrderSlot === slot;
                    return (
                      <div
                        key={slot}
                        className={`rounded-xl p-2.5 border-2 transition-all flex flex-col justify-between gap-1.5 ${
                          isChecked
                            ? 'bg-amber-50/90 border-amber-500 text-amber-950 shadow-xs'
                            : 'bg-white/90 border-gray-200 text-gray-700 hover:border-amber-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setBatchTargetSlots([...batchTargetSlots, slot as any]);
                                } else {
                                  const next = batchTargetSlots.filter((s) => s !== slot);
                                  setBatchTargetSlots(next.length > 0 ? next : [slot as any]);
                                }
                              }}
                              className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4 cursor-pointer"
                            />
                            <div>
                              <div className="text-xs font-black text-gray-900 flex items-center gap-1">
                                <span>{name}</span>
                                {isActive && (
                                  <span className="text-[9px] px-1 py-0.2 bg-[#1E4CD6] text-white rounded font-bold">
                                    Visualizando
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-gray-500 font-medium truncate">{detail}</div>
                            </div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-[10px]">
                          <span className="text-[9px] font-bold text-gray-400">{tag}</span>
                          {!isActive && (
                            <button
                              type="button"
                              onClick={() => onSwitchOrderSlot(slot as any)}
                              className="text-[10px] font-bold text-[#1E4CD6] hover:underline cursor-pointer"
                            >
                              Visualizar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Modo Preguiça Panel */}
            {showLazyModeModal && (
              <div className="rounded-xl bg-gradient-to-br from-amber-50 via-orange-50/70 to-yellow-50 p-4 border-2 border-amber-400 shadow-lg space-y-3.5 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-xs font-black text-sm flex items-center justify-center">
                      ⚡
                    </span>
                    <div>
                      <h4 className="font-black text-amber-950 text-xs sm:text-sm uppercase tracking-wide flex items-center gap-1.5">
                        Modo Preguiça: Configuração de Ingressos em Lote
                      </h4>
                      <p className="text-[11px] text-amber-800 font-medium">
                        Selecione múltiplos pôsteres via checkboxes para replicar informações de forma instantânea!
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLazyModeModal(false)}
                    className="text-amber-800 hover:text-amber-950 p-1.5 rounded-lg hover:bg-amber-100/80 transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Section 1: Select target posters via checkboxes */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <label className="text-[11px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <span>1. Selecione os pôsteres de destino (Checkboxes múltiplos):</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900 font-bold">
                        {selectedLazySlots.length} de 4 selecionados
                      </span>
                    </label>
                    <div className="flex items-center gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedLazySlots.length === 4) {
                            setSelectedLazySlots([]);
                          } else {
                            setSelectedLazySlots(['1', '2', '3', '4']);
                          }
                        }}
                        className="font-bold text-amber-900 hover:text-amber-950 underline cursor-pointer"
                      >
                        {selectedLazySlots.length === 4 ? 'Desmarcar Todos' : 'Marcar Todos'}
                      </button>
                      <span className="text-amber-300">•</span>
                      <button
                        type="button"
                        onClick={() => {
                          const others: Array<'1' | '2' | '3' | '4'> = (['1', '2', '3', '4'] as const).filter(
                            (s) => s !== activeOrderSlot
                          );
                          setSelectedLazySlots(others);
                        }}
                        className="font-bold text-amber-900 hover:text-amber-950 underline cursor-pointer"
                      >
                        Apenas os Outros (3)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {[
                      { slot: '1', name: 'Pôster 1', detail: 'Pista Meia' },
                      { slot: '2', name: 'Pôster 2', detail: 'Arq. Meia' },
                      { slot: '3', name: 'Pôster 3', detail: 'Pista Inteira (2 ing)' },
                      { slot: '4', name: 'Pôster 4', detail: 'Arq. Inteira' },
                    ].map(({ slot, name, detail }) => {
                      const isChecked = selectedLazySlots.includes(slot as any);
                      const isCurrent = activeOrderSlot === slot;
                      return (
                        <label
                          key={slot}
                          className={`p-2.5 rounded-xl border-2 flex items-start gap-2.5 cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white border-amber-600 font-black shadow-sm'
                              : 'bg-white text-gray-700 border-amber-200/90 font-bold hover:bg-amber-100/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLazySlots([...selectedLazySlots, slot as any]);
                              } else {
                                setSelectedLazySlots(selectedLazySlots.filter((s) => s !== slot));
                              }
                            }}
                            className="rounded text-amber-800 focus:ring-amber-500 h-4 w-4 mt-0.5 cursor-pointer shrink-0"
                          />
                          <div className="truncate flex-1">
                            <div className="text-xs font-black flex items-center gap-1">
                              <span>{name}</span>
                              {isCurrent && (
                                <span className={`text-[9px] px-1 rounded ${isChecked ? 'bg-amber-900/60 text-amber-100' : 'bg-blue-600 text-white'}`}>
                                  Origem
                                </span>
                              )}
                            </div>
                            <div className={`text-[10px] truncate ${isChecked ? 'text-amber-100' : 'text-gray-500'}`}>
                              {detail}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2: Select fields to replicate */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black uppercase tracking-wider text-amber-900 block">
                      2. Quais dados copiar do Pôster {activeOrderSlot} para os selecionados?
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const nextVal = !lazyCopyAll;
                        setLazyCopyAll(nextVal);
                        if (nextVal) {
                          setLazyCopyName(true);
                          setLazyCopyCpf(true);
                          setLazyCopySector(true);
                          setLazyCopyQuentroEmail(true);
                          setLazyCopyEventDetails(true);
                          setLazyCopyPrice(true);
                        }
                      }}
                      className="text-[11px] font-black text-amber-900 underline hover:text-amber-950 cursor-pointer"
                    >
                      {lazyCopyAll ? 'Desmarcar Clonagem Completa' : '⚡ Marcar Tudo (Clone Completo)'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                    <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-amber-200 font-bold text-gray-800 cursor-pointer shadow-2xs hover:border-amber-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={lazyCopyName}
                        onChange={(e) => {
                          setLazyCopyName(e.target.checked);
                          if (!e.target.checked) setLazyCopyAll(false);
                        }}
                        className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4 cursor-pointer"
                      />
                      <div className="truncate">
                        <span className="text-gray-600 font-semibold block text-[10px]">Nome do Titular:</span>
                        <strong className="text-blue-700 text-xs truncate block">{formData.attendeeName || '(vazio)'}</strong>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-amber-200 font-bold text-gray-800 cursor-pointer shadow-2xs hover:border-amber-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={lazyCopyCpf}
                        onChange={(e) => {
                          setLazyCopyCpf(e.target.checked);
                          if (!e.target.checked) setLazyCopyAll(false);
                        }}
                        className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4 cursor-pointer"
                      />
                      <div className="truncate">
                        <span className="text-gray-600 font-semibold block text-[10px]">CPF do Titular:</span>
                        <strong className="text-blue-700 text-xs truncate block">{formData.attendeeCpf || '(vazio)'}</strong>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-amber-200 font-bold text-gray-800 cursor-pointer shadow-2xs hover:border-amber-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={lazyCopySector}
                        onChange={(e) => {
                          setLazyCopySector(e.target.checked);
                          if (!e.target.checked) setLazyCopyAll(false);
                        }}
                        className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4 cursor-pointer"
                      />
                      <div className="truncate">
                        <span className="text-gray-600 font-semibold block text-[10px]">Setor do Ingresso:</span>
                        <strong className="text-gray-800 text-xs truncate block">{formData.sector || '(vazio)'}</strong>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-amber-200 font-bold text-gray-800 cursor-pointer shadow-2xs hover:border-amber-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={lazyCopyQuentroEmail}
                        onChange={(e) => {
                          setLazyCopyQuentroEmail(e.target.checked);
                          if (!e.target.checked) setLazyCopyAll(false);
                        }}
                        className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4 cursor-pointer"
                      />
                      <div className="truncate">
                        <span className="text-gray-600 font-semibold block text-[10px]">Email Quentro:</span>
                        <strong className="text-purple-700 text-xs truncate block">{formData.quentroEmail || '(não configurado)'}</strong>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-amber-200 font-bold text-gray-800 cursor-pointer shadow-2xs hover:border-amber-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={lazyCopyEventDetails}
                        onChange={(e) => {
                          setLazyCopyEventDetails(e.target.checked);
                          if (!e.target.checked) setLazyCopyAll(false);
                        }}
                        className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4 cursor-pointer"
                      />
                      <div className="truncate">
                        <span className="text-gray-600 font-semibold block text-[10px]">Data e Local:</span>
                        <strong className="text-gray-800 text-xs truncate block">{formData.location || formData.orderDate}</strong>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-amber-200 font-bold text-gray-800 cursor-pointer shadow-2xs hover:border-amber-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={lazyCopyPrice}
                        onChange={(e) => {
                          setLazyCopyPrice(e.target.checked);
                          if (!e.target.checked) setLazyCopyAll(false);
                        }}
                        className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4 cursor-pointer"
                      />
                      <div className="truncate">
                        <span className="text-gray-600 font-semibold block text-[10px]">Valores / Preço:</span>
                        <strong className="text-emerald-700 text-xs truncate block">R$ {formData.ticketPrice.toFixed(2)} + R$ {formData.serviceFee.toFixed(2)}</strong>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Section 3: Execute Action */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-amber-200/80">
                  <span className="text-[11px] text-amber-800 font-medium">
                    {selectedLazySlots.length === 0
                      ? 'Nenhum pôster selecionado.'
                      : `Pronto para replicar dados em ${selectedLazySlots.length} pôster(es) marcados.`}
                  </span>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setShowLazyModeModal(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-amber-900 hover:bg-amber-200/60 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyLazyMode}
                      disabled={
                        selectedLazySlots.length === 0 ||
                        (!lazyCopyName &&
                          !lazyCopyCpf &&
                          !lazyCopySector &&
                          !lazyCopyQuentroEmail &&
                          !lazyCopyEventDetails &&
                          !lazyCopyPrice &&
                          !lazyCopyAll)
                      }
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white font-black text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer border border-amber-300/40"
                    >
                      <Zap className="h-4 w-4 fill-amber-200 animate-bounce" />
                      <span>APLICAR CONFIGURAÇÃO EM LOTE ({selectedLazySlots.length})</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Form Inputs: Basic + Advanced toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Basic Fields (Always Visible) */}
              {formData.items && formData.items.length > 1 ? (
                <div className="sm:col-span-2 space-y-3">
                  <div className="text-xs font-bold text-[#1E4CD6] bg-blue-50/90 p-2.5 rounded-lg border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-black">Edição individual dos {formData.items.length} ingressos (Pôster 3):</span>
                    <span className="text-[10px] text-gray-600 font-normal">Edite o nome, CPF e setor de cada ingresso separadamente</span>
                  </div>
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-gray-50/80 border border-gray-200 rounded-lg space-y-2">
                      <div className="font-extrabold text-[#1E4CD6] text-xs flex items-center justify-between border-b border-gray-200/80 pb-1.5">
                        <span>Ingresso #{idx + 1}</span>
                        <span className="text-[11px] text-gray-500 font-medium">Titular {idx + 1}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-bold text-gray-700">Nome do Titular #{idx + 1}</label>
                          <input
                            type="text"
                            value={item.attendeeName}
                            onChange={(e) => handleItemAttendeeNameChange(idx, e.target.value)}
                            className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 font-bold"
                            placeholder={`Nome Titular ${idx + 1}`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-gray-700">CPF do Titular #{idx + 1}</label>
                          <input
                            type="text"
                            value={item.attendeeCpf}
                            onChange={(e) => handleItemAttendeeCpfChange(idx, e.target.value)}
                            className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 font-bold"
                            placeholder={`CPF Titular ${idx + 1}`}
                          />
                        </div>
                        <div className="sm:col-span-2 space-y-1">
                          <label className="font-bold text-gray-700">Setor & Tipo do Ingresso #{idx + 1}</label>
                          <input
                            type="text"
                            value={item.sector}
                            onChange={(e) => handleItemSectorChange(idx, e.target.value)}
                            className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 font-bold"
                            placeholder={`Setor Ingresso ${idx + 1}`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Modo Preguiça - Banner Rápido de 1 Clique */}
                  <div className="sm:col-span-2 p-3 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/60 border-2 border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg shadow-xs flex items-center justify-center font-black text-xs">
                        ⚡
                      </span>
                      <div>
                        <div className="text-xs font-black text-amber-950 flex items-center gap-2">
                          <span>Modo Preguiça (Preenchimento Rápido)</span>
                          <label className="inline-flex items-center gap-1 cursor-pointer select-none text-[10px] bg-amber-200/80 px-2 py-0.5 rounded-full font-bold text-amber-900 hover:bg-amber-300">
                            <input
                              type="checkbox"
                              checked={autoLazyMode}
                              onChange={(e) => setAutoLazyMode(e.target.checked)}
                              className="rounded text-amber-600 focus:ring-amber-500 h-3 w-3 cursor-pointer"
                            />
                            <span>Auto-replicar ao digitar</span>
                          </label>
                        </div>
                        <span className="text-[11px] text-amber-900 font-medium block">
                          Replique o Nome e CPF digitados diretamente para todos os 4 pôsteres com apenas 1 clique!
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleQuickReplicateAll}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer border border-amber-300/50"
                    >
                      <Zap className="h-3.5 w-3.5 fill-amber-200" />
                      <span>Replicar em 1 Clique (Todos os Pôsteres)</span>
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Nome do Titular</label>
                    <input
                      type="text"
                      value={formData.attendeeName}
                      onChange={(e) => handleAttendeeNameChange(e.target.value)}
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 font-bold"
                      placeholder="Maria Eduarda Santos"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">CPF do Titular</label>
                    <input
                      type="text"
                      value={formData.attendeeCpf}
                      onChange={(e) => handleAttendeeCpfChange(e.target.value)}
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 font-bold"
                      placeholder="157.861.597-60"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-gray-700">Setor & Tipo do Ingresso</label>
                    <input
                      type="text"
                      value={formData.sector}
                      onChange={(e) => handleSectorChange(e.target.value)}
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 font-bold"
                      placeholder="Pista - Meia-Entrada - Pré-Venda Army Membership"
                    />
                  </div>
                </>
              )}

              {/* Show More / Show Less Toggle Button */}
              <div className="sm:col-span-2 pt-1 pb-1 border-t border-blue-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowMoreFields(!showMoreFields)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E4CD6] hover:text-blue-800 transition-colors py-1 cursor-pointer"
                >
                  {showMoreFields ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Mostrar menos opções de edição
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      + Mostrar mais opções de edição
                    </>
                  )}
                </button>
                <span className="text-[10px] text-gray-400 font-medium">
                  {showMoreFields ? 'Exibindo formulário completo' : 'Edição rápida'}
                </span>
              </div>

              {/* Extended Fields (Visible when showMoreFields is true) */}
              {showMoreFields && (
                <>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Número do Pedido</label>
                    <input
                      type="text"
                      value={formData.orderNumber}
                      onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 font-bold"
                      placeholder="72536526"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Subtítulo / Turnê</label>
                    <input
                      type="text"
                      value={formData.eventName}
                      onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 font-bold"
                      placeholder="BTS WORLD TOUR ARIRANG"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-gray-700">Evento e Data (Linha Principal)</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 font-bold"
                      placeholder="BTS - São Paulo - 31/10/2026"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Valor do Ingresso (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.ticketPrice}
                      onChange={(e) => handleTicketPriceChange(parseFloat(e.target.value) || 0)}
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Taxa de Serviço (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.serviceFee}
                      onChange={(e) =>
                        setFormData({ ...formData, serviceFee: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-gray-700">Descrição da Categoria</label>
                    <textarea
                      rows={2}
                      value={formData.attendeeCategory}
                      onChange={(e) => setFormData({ ...formData, attendeeCategory: e.target.value })}
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1.5"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-gray-700">Valor Total (R$)</label>
                      <button
                        type="button"
                        onClick={handleAutoCalculateTotal}
                        className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5"
                      >
                        <Calculator className="h-3 w-3" />
                        Somar
                      </button>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.totalPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, totalPrice: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">ID do Pagamento</label>
                    <input
                      type="text"
                      value={formData.paymentNumber}
                      onChange={(e) => setFormData({ ...formData, paymentNumber: e.target.value })}
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 font-bold"
                      placeholder="37325851"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Meio de Pagamento</label>
                    <input
                      type="text"
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 font-bold"
                      placeholder="pix"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Status</label>
                    <input
                      type="text"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 font-bold text-[#1E4CD6]"
                      placeholder="Aprovado"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Data e Hora</label>
                    <input
                      type="text"
                      value={formData.orderDate}
                      onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 font-bold"
                      placeholder="08/04/2026 10:37"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-blue-200">
              <button
                type="button"
                onClick={handleResetToDefault}
                className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-red-600 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Restaurar dados originais</span>
              </button>

              <button
                type="button"
                onClick={handleSaveOrder}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-black text-white shadow-md transition-all active:scale-95"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        )}

        {/* Section 1: Order Number & Tour Title */}
        <div>
          <h1 className="text-[17px] font-semibold text-gray-950 tracking-tight leading-snug">
            Detalhes do pedido: #{order.orderNumber}
          </h1>
          <p className="mt-1 text-[13px] font-normal uppercase tracking-wide text-[#8c94a0]">
            {order.eventName}
          </p>
        </div>

        {/* Section 2: Event Name & Date Line */}
        <div className="mt-6">
          <h2
            onClick={handleToggleDate}
            className="text-[15px] font-semibold text-gray-950 tracking-tight cursor-pointer select-none active:opacity-70 transition-opacity"
            title="Clique para alternar a data do show"
          >
            {order.location}
          </h2>
        </div>

        {/* Section 3 & 4: Sector, Price & Attendee Box for each ticket */}
        {ticketItems.map((item, idx) => {
          const isInfoOpen = moreInfoMap[idx] ?? showMoreInfo;
          return (
            <React.Fragment key={idx}>
              <div className="mt-3.5 flex items-start justify-between text-[14.5px] text-gray-900 leading-snug font-normal">
                <div className="pr-3 max-w-[70%]">
                  <span
                    onClick={handleToggleSector}
                    className="cursor-pointer select-none active:opacity-70 transition-opacity inline-block"
                    title="Clique para alternar o setor (Pista <-> Arquibancada)"
                  >
                    {item.sector}
                  </span>
                </div>
                <div className="text-right shrink-0 font-normal leading-tight">
                  <div>R$</div>
                  <div>{item.ticketPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
              </div>

              <div className="mt-4 rounded-[4px] bg-[#f0f3f7] p-3.5 px-4">
                <div className="flex items-center justify-between text-[14.5px]">
                  <span className="text-gray-900 font-normal">
                    {item.attendeeName}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleMoreInfo(idx)}
                    className="text-[13.5px] font-normal text-[#1E4CD6] hover:underline cursor-pointer"
                  >
                    + Informação
                  </button>
                </div>

                {isInfoOpen && (
                  <div className="mt-3 space-y-2.5">
                    <p className="text-[13.5px] font-semibold text-gray-950 leading-snug">
                      {item.attendeeCategory}
                    </p>

                    <p className="text-[13.5px] text-gray-900 font-normal">
                      CPF: {item.attendeeCpf}
                    </p>
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}

        {/* Section 5: Serviços (Clean whitespace spacing, no dividers) */}
        <div className="mt-7">
          <h3 className="text-[15px] font-semibold text-gray-950">
            Serviços
          </h3>
          {order.insuranceFee ? (
            <div className="mt-3 flex items-center justify-between text-[14.5px] text-gray-900 font-normal">
              <span>Ingresso Seguro</span>
              <span>
                R$ {order.insuranceFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ) : null}
          <div className="mt-3 flex items-center justify-between text-[14.5px] text-gray-900 font-normal">
            <span>Taxa de serviço</span>
            <span>
              R$ {order.serviceFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Section 6: Total */}
        <div className="mt-5 flex items-center justify-between text-[15px]">
          <span className="text-gray-900 font-normal">
            Total
          </span>
          <span className="font-semibold text-gray-950 text-[16.5px]">
            R$ {order.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Section 7: Imprimir resumo da compra (Opens edit mode on click) */}
        <div className="mt-7">
          <button
            id="order-print-receipt-btn"
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 text-[14px] font-normal text-[#1E4CD6] hover:underline cursor-pointer"
            title="Imprimir resumo da compra (Clique para editar o comprovante)"
          >
            <Printer className="h-[15px] w-[15px] text-[#1E4CD6] stroke-[2]" />
            <span>Imprimir resumo da compra</span>
          </button>
        </div>

        {/* Section 8: Detalhes do pagamento */}
        <div className="mt-9">
          <h3 className="text-[15px] font-semibold text-gray-950">
            Detalhes do pagamento #{order.paymentNumber}
          </h3>
          <p className="mt-1 text-[14px] text-[#8c94a0] font-normal">
            Meio de pagamento: {order.paymentMethod}
          </p>

          <div className="mt-5 space-y-3.5 text-[15px] text-gray-900 font-normal">
            <div className="flex items-center justify-between">
              <span>Valor</span>
              <span>
                R$ {order.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>Status</span>
              <span className="text-[#1E4CD6] font-normal">
                {order.status}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>Data</span>
              <span>
                {order.orderDate}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MODAL: Como funciona o Quentro?                                           */}
      {/* ========================================================================= */}
      {showHelpModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={() => setShowHelpModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-[#22262d] border border-gray-700 p-6 text-white shadow-2xl space-y-4 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black text-white">Quentro</span>
                <span className="text-[11px] bg-[#00e5bb]/20 text-[#00e5bb] font-bold px-2 py-0.5 rounded-full">
                  Oficial
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-[13.5px] text-gray-300 leading-relaxed">
              <p>
                <strong className="text-white">O que é o Quentro?</strong>
                <br />
                É a carteira digital oficial e segura adotada pela Ticketmaster para emitir e armazenar ingressos 100% digitais.
              </p>
              <p>
                <strong className="text-white">Como eu recebo meu ingresso?</strong>
                <br />
                Basta inserir o e-mail cadastrado na sua conta Quentro (ou seu e-mail pessoal). Seu ingresso fica vinculado automaticamente.
              </p>
              <p>
                <strong className="text-white">QR Code Antifraude:</strong>
                <br />
                O código na tela é dinâmico e renovado a cada 15 segundos, impedindo capturas de tela fraudulentas e garantindo entrada segura e offline no estádio.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full rounded-2xl bg-[#00e5bb] py-3 text-center text-sm font-bold text-black hover:bg-[#00c9a4] transition-colors cursor-pointer"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
