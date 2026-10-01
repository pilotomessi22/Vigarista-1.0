import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  Menu,
  Printer,
  Check,
  RotateCcw,
  Save,
  X,
  Calculator,
  ChevronDown,
  ChevronUp,
  Zap,
  Plus,
  Minus,
  Ticket,
  Trash2,
} from 'lucide-react';
import { TicketmasterLogo } from './TicketmasterLogo';
import { OrderItem } from '../types';
import { INITIAL_ORDER, INITIAL_ORDER_1, INITIAL_ORDER_2, INITIAL_ORDER_3, INITIAL_ORDER_4 } from '../data/mockData';

interface OrderDetailsViewProps {
  order: OrderItem;
  onBack: () => void;
  onOpenQuentroTicket: (email: string) => void;
  onOpenQuentroEmail: () => void;
  onUpdateOrder: (updatedOrder: OrderItem) => void;
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

export const OrderDetailsView: React.FC<OrderDetailsViewProps> = ({
  order,
  onBack,
  onOpenQuentroEmail,
  onUpdateOrder,
  onResetOrder,
  onReplicateOrder,
  activeOrderSlot = '1',
  onSwitchOrderSlot,
}) => {
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

  // Sync state with order changes when not editing
  useEffect(() => {
    if (!isEditing) {
      setFormData({ ...order });
    }
  }, [order, isEditing]);

  // Save changes handler (with batch save support for selected posters)
  const handleSaveOrder = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onUpdateOrder(formData);

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
    onUpdateOrder(defaultData);
    if (onResetOrder) onResetOrder();
    setIsEditing(false);
    setSaveNotification('Dados originais restaurados com sucesso!');
    setTimeout(() => setSaveNotification(null), 3000);
  };

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

  // Individual ticket item handlers (for orders with multiple tickets)
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

  const handleItemPriceChange = (index: number, val: number) => {
    if (!formData.items || formData.items.length <= index) return;
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], ticketPrice: val };
    const itemsSum = updatedItems.reduce((acc, curr) => acc + (Number(curr.ticketPrice) || 0), 0);
    const calcFee = itemsSum * 0.20;
    const insurance = Number(formData.insuranceFee) || 0;
    const updated = {
      ...formData,
      items: updatedItems,
      serviceFee: calcFee,
      totalPrice: itemsSum + calcFee + insurance,
    };
    syncOrderChanges(updated);
  };

  // ADICIONAR MAIS 1 INGRESSO (+1) AO PEDIDO
  const handleAddTicket = () => {
    const baseItems = formData.items && formData.items.length > 0 
      ? [...formData.items] 
      : [{
          attendeeName: formData.attendeeName || 'Nome do Titular',
          attendeeCpf: formData.attendeeCpf || '',
          sector: formData.sector || 'Pista - Meia-Entrada',
          ticketPrice: Number(formData.ticketPrice) || 340,
          attendeeCategory: formData.attendeeCategory || 'Meia-Entrada',
        }];

    const nextIndex = baseItems.length + 1;
    const basePrice = Number(formData.ticketPrice) || (baseItems[0]?.ticketPrice ?? 340);
    const newItem = {
      attendeeName: formData.attendeeName ? `${formData.attendeeName} (${nextIndex})` : `Titular ${nextIndex}`,
      attendeeCpf: formData.attendeeCpf || '',
      sector: formData.sector || baseItems[0]?.sector || 'Pista - Meia-Entrada',
      ticketPrice: basePrice,
      attendeeCategory: formData.attendeeCategory || baseItems[0]?.attendeeCategory || 'Meia-Entrada',
    };

    const newItems = [...baseItems, newItem];
    const itemsSum = newItems.reduce((acc, curr) => acc + (Number(curr.ticketPrice) || 0), 0);
    const calcFee = itemsSum * 0.20;
    const insurance = Number(formData.insuranceFee) || 0;
    const newTotal = itemsSum + calcFee + insurance;

    const updated = {
      ...formData,
      quantity: newItems.length,
      items: newItems,
      serviceFee: calcFee,
      totalPrice: newTotal,
    };

    syncOrderChanges(updated);
    setSaveNotification(`⚡ +1 Ingresso adicionado! Total: ${newItems.length} ingressos no pedido.`);
    setTimeout(() => setSaveNotification(null), 3000);
  };

  // REMOVER 1 INGRESSO (-1) DO PEDIDO
  const handleRemoveTicket = (indexToRemove?: number) => {
    const baseItems = formData.items && formData.items.length > 0 
      ? [...formData.items] 
      : [{
          attendeeName: formData.attendeeName || 'Nome do Titular',
          attendeeCpf: formData.attendeeCpf || '',
          sector: formData.sector || 'Pista - Meia-Entrada',
          ticketPrice: Number(formData.ticketPrice) || 340,
          attendeeCategory: formData.attendeeCategory || 'Meia-Entrada',
        }];

    if (baseItems.length <= 1) {
      setSaveNotification('O pedido precisa conter no mínimo 1 ingresso.');
      setTimeout(() => setSaveNotification(null), 2500);
      return;
    }

    const targetIdx = typeof indexToRemove === 'number' ? indexToRemove : baseItems.length - 1;
    const newItems = baseItems.filter((_, idx) => idx !== targetIdx);

    const itemsSum = newItems.reduce((acc, curr) => acc + (Number(curr.ticketPrice) || 0), 0);
    const calcFee = itemsSum * 0.20;
    const insurance = Number(formData.insuranceFee) || 0;
    const newTotal = itemsSum + calcFee + insurance;

    const updated = {
      ...formData,
      quantity: newItems.length,
      items: newItems.length === 1 ? undefined : newItems,
      attendeeName: newItems[0]?.attendeeName || formData.attendeeName,
      attendeeCpf: newItems[0]?.attendeeCpf || formData.attendeeCpf,
      sector: newItems[0]?.sector || formData.sector,
      serviceFee: calcFee,
      totalPrice: newTotal,
    };

    syncOrderChanges(updated);
    setSaveNotification(`⚡ 1 Ingresso removido! Total agora: ${newItems.length} ingresso(s).`);
    setTimeout(() => setSaveNotification(null), 2500);
  };

  // Replicar dados rapidamente para 1 pôster individual
  const handleReplicateToSingleSlot = (targetSlot: '1' | '2' | '3' | '4') => {
    const fieldsToCopy = {
      attendeeName: formData.attendeeName,
      attendeeCpf: formData.attendeeCpf,
      sector: formData.sector,
      quentroEmail: formData.quentroEmail,
    };

    if (onReplicateOrder) {
      onReplicateOrder(fieldsToCopy, [targetSlot]);
    } else {
      const slotsMap: Record<'1' | '2' | '3' | '4', string> = {
        '1': 'tm_saved_order_details_1',
        '2': 'tm_saved_order_details_2',
        '3': 'tm_saved_order_details_3',
        '4': 'tm_saved_order_details_4',
      };
      try {
        const saved = localStorage.getItem(slotsMap[targetSlot]);
        if (saved) {
          const parsed = JSON.parse(saved);
          let updatedItems = parsed.items;
          if (updatedItems && updatedItems.length > 0) {
            updatedItems = updatedItems.map((it: any) => ({
              ...it,
              attendeeName: formData.attendeeName,
              attendeeCpf: formData.attendeeCpf,
              sector: formData.sector,
            }));
          }
          const updated = {
            ...parsed,
            ...fieldsToCopy,
            items: updatedItems,
          };
          localStorage.setItem(slotsMap[targetSlot], JSON.stringify(updated));
          if (targetSlot === '1') localStorage.setItem('tm_saved_order_details', JSON.stringify(updated));
        }
      } catch (e) {
        console.error(e);
      }
    }

    setSaveNotification(`⚡ Dados replicados com sucesso para o Pôster ${targetSlot}!`);
    setTimeout(() => setSaveNotification(null), 3500);
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
        onUpdateOrder(formData);
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
        onUpdateOrder(updatedForm);
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

    const updated = {
      ...formData,
      ticketPrice: val,
      serviceFee: calculatedFee,
      totalPrice: newTotal,
      items: updatedItems,
    };
    syncOrderChanges(updated);
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
    const updated = {
      ...formData,
      serviceFee: calculatedFee,
      totalPrice: itemsSum + calculatedFee + insurance,
    };
    syncOrderChanges(updated);
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
    const updated = {
      ...formData,
      serviceFee: calculatedFee,
      totalPrice: itemsSum + calculatedFee + insurance,
    };
    syncOrderChanges(updated);
  };

  // Helper to toggle sector string seamlessly through available sectors
  const toggleSectorStr = (str: string) => {
    if (!str) return 'Pista - Meia-Entrada';
    
    // Extract suffix if present (e.g., "- Meia-Entrada", "- Inteira", etc.)
    let suffix = '';
    const dashIdx = str.indexOf('-');
    if (dashIdx !== -1) {
      suffix = str.substring(dashIdx).trim(); // includes the leading '-'
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
    onUpdateOrder(updated);
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
    onUpdateOrder(updated);
    try {
      localStorage.setItem(`tm_saved_order_details_${activeOrderSlot}`, JSON.stringify(updated));
      if (activeOrderSlot === '1') localStorage.setItem('tm_saved_order_details', JSON.stringify(updated));
    } catch {}
    setSaveNotification(`⚡ Setor do Pôster ${activeOrderSlot} atualizado: ${nextSector}`);
    setTimeout(() => setSaveNotification(null), 3000);
  };

  return (
    <div className="w-full min-h-screen bg-white text-[#111827] flex flex-col relative pb-0">
      {/* iOS Overscroll Top Shield (Guarantees zero white gap when pulling down on iPhone) */}
      <div className="absolute -top-[500px] left-0 right-0 h-[500px] bg-[#1E4CD6] pointer-events-none z-50" />

      {/* ========================================================================= */}
      {/* 1. TOP HEADER - EXACT REPLICA OF IMG_8417.jpeg                            */}
      {/* Authentic Ticketmaster Blue #026cdf, < chevron + ticketmaster® + 3 Lines (≡) */}
      {/* ========================================================================= */}
        <header className="sticky top-0 z-40 w-full bg-[#1E4CD6] text-white select-none pt-[env(safe-area-inset-top,0px)] shadow-xs">
          <div className="flex h-[52px] w-full items-center justify-between px-3">
            {/* Left: < (ChevronLeft) + ticketmaster® logo */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onBack}
                className="p-1 -ml-1 text-white hover:opacity-80 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                title="Voltar"
              >
                <ChevronLeft className="h-6 w-6 text-white stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={onBack}
                className="focus:outline-none flex items-center cursor-pointer hover:opacity-95"
                title="Ticketmaster - Página Inicial"
              >
                <TicketmasterLogo variant="white" size="md" />
              </button>
            </div>

            {/* Right: 3 lines (Menu hamburger icon ≡ from IMG_8417.jpeg) */}
            <button
              id="order-details-menu-btn"
              type="button"
              onClick={onOpenQuentroEmail}
              className="p-1 -mr-1 text-white hover:opacity-80 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              title="Menu Ticketmaster (Abrir Quentro)"
            >
              <div className="flex flex-col justify-center items-end gap-[4.5px] w-[22px]">
                <span className="block h-[2.2px] w-full bg-white rounded-full" />
                <span className="block h-[2.2px] w-full bg-white rounded-full" />
                <span className="block h-[2.2px] w-full bg-white rounded-full" />
              </div>
            </button>
          </div>
        </header>

        {/* Top Notification Toast (Save success: 'seja feliz meu nobre') */}
        {saveNotification && (
          <div
            id="save-success-notification"
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-[#0f172a] text-white px-5 py-3.5 shadow-2xl border border-emerald-500/50 flex items-center gap-3 animate-in fade-in slide-in-from-top-3 max-w-[360px] w-[90%]"
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
        {/* 2. MAIN ORDER DETAILS CANVAS - EXACT MATCH TO IMG_8399.png & IMG_8400.png */}
        {/* ========================================================================= */}
        <main className="flex-1 w-full bg-white px-5 pt-6 pb-36">
          {/* EDIT MODE PANEL (Appears when clicking "Imprimir resumo da compra") */}
          {isEditing && (
            <div className="mb-6 rounded-2xl border-2 border-[#1E4CD6] bg-blue-50/80 p-4 shadow-md animate-in fade-in space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-blue-200 pb-3 gap-2">
                <div>
                  <h2 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                    <span>Modo de Edição do Comprovante</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                      Pôster {activeOrderSlot}
                    </span>
                  </h2>
                  <p className="text-[11px] text-gray-600">
                    Altere os dados, adicione ou remova ingressos e clique em Salvar.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
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
                    <span>Salvar Alterações</span>
                  </button>
                </div>
              </div>

              {/* SELETOR DE PÔSTER (ALTERNÂNCIA ENTRE PÔSTERES 1, 2, 3 E 4) */}
              {onSwitchOrderSlot && (
                <div className="rounded-xl bg-blue-100/70 border border-blue-300/80 p-2.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#1E4CD6] flex items-center gap-1.5">
                      <span>Alternar Pôster Ativo:</span>
                    </span>
                    <span className="text-[11px] font-semibold text-gray-600">
                      Pôster {activeOrderSlot} selecionado
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['1', '2', '3', '4'] as const).map((slotNum) => {
                      const isActive = activeOrderSlot === slotNum;
                      return (
                        <button
                          key={slotNum}
                          type="button"
                          onClick={() => onSwitchOrderSlot(slotNum)}
                          className={`py-2 px-1 rounded-xl text-center font-bold text-xs transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                            isActive
                              ? 'bg-[#1E4CD6] text-white shadow-sm ring-2 ring-blue-400/50'
                              : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                          }`}
                        >
                          <span>Pôster {slotNum}</span>
                          <span className={`text-[10px] ${isActive ? 'text-blue-200 font-normal' : 'text-gray-400'}`}>
                            {isActive ? 'Ativo' : 'Alternar'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MODO PREGUIÇA SUPER PRÁTICO E DIRETO */}
              <div className="rounded-xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/70 border-2 border-amber-300 p-3.5 space-y-2.5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-xs flex items-center justify-center font-black text-sm shrink-0">
                      ⚡
                    </span>
                    <div>
                      <div className="text-xs font-black text-amber-950 flex items-center gap-2 flex-wrap">
                        <span>Modo Preguiça (1 Clique)</span>
                        <label className="inline-flex items-center gap-1.5 cursor-pointer select-none text-[11px] bg-amber-200/90 hover:bg-amber-300 px-2.5 py-0.5 rounded-full font-bold text-amber-950 transition-colors">
                          <input
                            type="checkbox"
                            checked={autoLazyMode}
                            onChange={(e) => setAutoLazyMode(e.target.checked)}
                            className="rounded text-amber-600 focus:ring-amber-500 h-3.5 w-3.5 cursor-pointer"
                          />
                          <span>Auto-replicar Nome e CPF ao digitar</span>
                        </label>
                      </div>
                      <p className="text-[11px] text-amber-900 font-medium mt-0.5">
                        Replique Nome, CPF, Setor e E-mail para todos os 4 pôsteres instantaneamente.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleQuickReplicateAll}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer border border-amber-300/60"
                    title="Copiar Nome, CPF, Setor e Email para os 4 pôsteres de uma vez"
                  >
                    <Zap className="h-4 w-4 fill-amber-200" />
                    <span>⚡ Replicar para Todos os Pôsteres</span>
                  </button>
                </div>

                {/* Direct quick-copy to specific posters */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-amber-200/80 text-[11px]">
                  <span className="font-bold text-amber-950 mr-1">Replicar para um pôster específico:</span>
                  {(['1', '2', '3', '4'] as const).map((slotNum) => {
                    const isCurrent = activeOrderSlot === slotNum;
                    return (
                      <button
                        key={slotNum}
                        type="button"
                        onClick={() => handleReplicateToSingleSlot(slotNum)}
                        className={`px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer text-xs flex items-center gap-1 ${
                          isCurrent
                            ? 'bg-amber-200/60 text-amber-900 border-amber-300 hover:bg-amber-300'
                            : 'bg-white text-amber-950 border-amber-300 hover:bg-amber-50 hover:border-amber-400 shadow-2xs active:scale-95'
                        }`}
                        title={`Copiar dados para o Pôster ${slotNum}`}
                      >
                        <span>Pôster {slotNum}</span>
                        {isCurrent && <span className="text-[9px] opacity-75">(atual)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CONTROLE DE QUANTIDADE DE INGRESSOS (+1 / -1) */}
              <div className="rounded-xl bg-white border-2 border-blue-200 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                    <Ticket className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900 flex items-center gap-2">
                      <span>Quantidade de Ingressos no Pedido:</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1E4CD6] font-black text-xs">
                        {formData.items && formData.items.length > 0 ? formData.items.length : 1}{' '}
                        {(formData.items && formData.items.length > 0 ? formData.items.length : 1) === 1
                          ? 'ingresso'
                          : 'ingressos'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Adicione ou remova ingressos livremente. Os valores e taxas são atualizados na hora.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleRemoveTicket()}
                    disabled={!formData.items || formData.items.length <= 1}
                    className="px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95"
                    title="Remover 1 ingresso do pedido"
                  >
                    <Minus className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>Remover 1</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddTicket}
                    className="px-3.5 py-2 rounded-xl bg-[#1E4CD6] hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                    title="Adicionar mais 1 ingresso a este pedido"
                  >
                    <Plus className="h-4 w-4 stroke-[2.5]" />
                    <span>+ Adicionar 1 Ingresso</span>
                  </button>
                </div>
              </div>

              {/* Form Inputs: Lista de Ingressos */}
              <div className="space-y-3">
                {formData.items && formData.items.length > 1 ? (
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-[#1E4CD6] bg-blue-100/70 p-2.5 rounded-xl border border-blue-200 flex items-center justify-between">
                      <span className="font-black flex items-center gap-1.5">
                        <Ticket className="h-4 w-4" />
                        Edição Individual dos {formData.items.length} Ingressos:
                      </span>
                      <button
                        type="button"
                        onClick={handleAddTicket}
                        className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="h-3 w-3" /> Adicionar outro
                      </button>
                    </div>

                    {formData.items.map((item, idx) => (
                      <div key={idx} className="p-3 bg-white border border-gray-200 rounded-xl space-y-2.5 shadow-2xs">
                        <div className="font-extrabold text-[#1E4CD6] text-xs flex items-center justify-between border-b border-gray-100 pb-2">
                          <span className="flex items-center gap-1.5">
                            <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black flex items-center justify-center">
                              {idx + 1}
                            </span>
                            Ingresso #{idx + 1}
                          </span>
                          {formData.items && formData.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveTicket(idx)}
                              className="text-[11px] font-bold text-red-600 hover:text-red-800 flex items-center gap-1 px-2 py-0.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
                              title={`Remover o Ingresso #${idx + 1}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Remover este</span>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="space-y-1">
                            <label className="font-bold text-gray-700">Nome do Titular #{idx + 1}</label>
                            <input
                              type="text"
                              value={item.attendeeName}
                              onChange={(e) => handleItemAttendeeNameChange(idx, e.target.value)}
                              className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 font-bold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                              placeholder={`Nome Titular ${idx + 1}`}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-gray-700">CPF do Titular #{idx + 1}</label>
                            <input
                              type="text"
                              value={item.attendeeCpf}
                              onChange={(e) => handleItemAttendeeCpfChange(idx, e.target.value)}
                              className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 font-bold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                              placeholder={`CPF Titular ${idx + 1}`}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-gray-700">Setor do Ingresso #{idx + 1}</label>
                            <input
                              type="text"
                              value={item.sector}
                              onChange={(e) => handleItemSectorChange(idx, e.target.value)}
                              className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 font-bold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                              placeholder={`Setor Ingresso ${idx + 1}`}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-gray-700">Valor Unitário (R$)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={item.ticketPrice}
                              onChange={(e) => handleItemPriceChange(idx, parseFloat(e.target.value) || 0)}
                              className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 font-bold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Nome do Titular</label>
                      <input
                        type="text"
                        value={formData.attendeeName}
                        onChange={(e) => handleAttendeeNameChange(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 font-bold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder="Maria Eduarda Santos"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">CPF do Titular</label>
                      <input
                        type="text"
                        value={formData.attendeeCpf}
                        onChange={(e) => handleAttendeeCpfChange(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 font-bold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder="157.861.597-60"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-bold text-gray-700">Setor & Tipo do Ingresso</label>
                      <input
                        type="text"
                        value={formData.sector}
                        onChange={(e) => handleSectorChange(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 font-bold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder="Pista - Meia-Entrada - Pré-Venda Army Membership"
                      />
                    </div>
                  </div>
                )}

                {/* Show More / Show Less Toggle Button */}
                <div className="pt-2 pb-1 border-t border-blue-100 flex items-center justify-between">
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
                        + Mostrar mais opções (Data, Local, Pedido, Valores)
                      </>
                    )}
                  </button>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {showMoreFields ? 'Exibindo formulário completo' : 'Edição rápida'}
                  </span>
                </div>

                {/* Extended Fields (Visible when showMoreFields is true) */}
                {showMoreFields && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Número do Pedido</label>
                      <input
                        type="text"
                        value={formData.orderNumber}
                        onChange={(e) => syncOrderChanges({ ...formData, orderNumber: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 font-bold"
                        placeholder="72536526"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Subtítulo / Turnê</label>
                      <input
                        type="text"
                        value={formData.eventName}
                        onChange={(e) => syncOrderChanges({ ...formData, eventName: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 font-bold"
                        placeholder="BTS WORLD TOUR ARIRANG"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-bold text-gray-700">Evento e Data (Linha Principal)</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => syncOrderChanges({ ...formData, location: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 font-bold"
                        placeholder="BTS - São Paulo - 31/10/2026"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Valor Base do Ingresso (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.ticketPrice}
                        onChange={(e) => handleTicketPriceChange(parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Taxa de Serviço (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.serviceFee}
                        onChange={(e) =>
                          syncOrderChanges({ ...formData, serviceFee: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 font-bold"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-bold text-gray-700">Descrição da Categoria</label>
                      <textarea
                        rows={2}
                        value={formData.attendeeCategory}
                        onChange={(e) => syncOrderChanges({ ...formData, attendeeCategory: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-gray-700">Valor Total (R$)</label>
                        <button
                          type="button"
                          onClick={handleAutoCalculateTotal}
                          className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                        >
                          <Calculator className="h-3 w-3" />
                          Calcular Total
                        </button>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.totalPrice}
                        onChange={(e) =>
                          syncOrderChanges({ ...formData, totalPrice: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">ID do Pagamento</label>
                      <input
                        type="text"
                        value={formData.paymentNumber}
                        onChange={(e) => syncOrderChanges({ ...formData, paymentNumber: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 font-bold"
                        placeholder="37325851"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Meio de Pagamento</label>
                      <input
                        type="text"
                        value={formData.paymentMethod}
                        onChange={(e) => syncOrderChanges({ ...formData, paymentMethod: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 font-bold"
                        placeholder="pix"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Status</label>
                      <input
                        type="text"
                        value={formData.status}
                        onChange={(e) => syncOrderChanges({ ...formData, status: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 font-bold text-[#1E4CD6]"
                        placeholder="Aprovado"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Data e Hora</label>
                      <input
                        type="text"
                        value={formData.orderDate}
                        onChange={(e) => syncOrderChanges({ ...formData, orderDate: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 font-bold"
                        placeholder="08/04/2026 10:37"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-bold text-gray-700">E-mail do Quentro</label>
                      <input
                        type="email"
                        value={formData.quentroEmail || ''}
                        onChange={(e) => syncOrderChanges({ ...formData, quentroEmail: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 font-bold"
                        placeholder="marjorie301204@gmail.com"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Restaurar dados originais</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveOrder}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-black text-white shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ORDER DETAILS SCREEN - REPLICATED FROM 97A93487-B0BE-46C6-A0DB-89E8C13C47B5.png */}
          {/* ========================================================================= */}

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
                <button
                  type="button"
                  onClick={onOpenQuentroEmail}
                  className="text-[#1E4CD6] hover:underline font-normal cursor-pointer text-left"
                  title="Acessar Quentro"
                >
                  {order.status}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span>Data</span>
                <span>
                  {order.orderDate}
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
  );
};
