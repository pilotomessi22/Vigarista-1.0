import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Clock,
  Sparkles,
  QrCode,
  Smartphone,
  Lock,
  ChevronLeft,
  Search,
  ShoppingCart,
  Star,
  Flame,
  ChevronRight,
  RefreshCw,
  HelpCircle,
  KeyRound,
  Layers,
  Filter,
  Eye,
  Share2,
  SlidersHorizontal,
  X,
  BadgePercent,
  CheckCheck,
  Mic,
  MicOff,
  Volume2,
  Mail,
  Send,
} from 'lucide-react';
import { AnonymousMaskIllustration } from './AnonymousMaskIllustration';
import { OrganicFireCard } from './OrganicFireCard';
import { createNewLicenseKey } from '../utils/licenseManager';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { sendLicenseByEmail } from '../utils/emailDelivery';

interface ProductItem {
  id: string;
  name: string;
  category: 'chaves' | 'passes' | 'vip' | 'slots';
  days: number;
  regularPrice: string;
  regularRawPrice: number;
  promoPrice: string;
  promoRawPrice: number;
  discountBadge: string;
  rating: number;
  reviewsCount: number;
  soldCount: number;
  totalStock: number;
  isHotDeal?: boolean;
  isBestSeller?: boolean;
  tag: string;
  description: string;
  features: string[];
}

interface ActiveCheckoutItem {
  id: string;
  name: string;
  days: number;
  price: string;
  rawPrice: number;
}

const PRODUCTS_CATALOG: ProductItem[] = [
  {
    id: 'prod_1d',
    name: 'Passe VIGARISTA 24 Horas',
    category: 'passes',
    days: 1,
    regularPrice: 'R$ 19,90',
    regularRawPrice: 19.9,
    promoPrice: 'R$ 9,90',
    promoRawPrice: 9.9,
    discountBadge: '-50%',
    rating: 4.9,
    reviewsCount: 189,
    soldCount: 17,
    totalStock: 20,
    isHotDeal: true,
    tag: '⚡ EXPRESS',
    description: 'Ideal para eventos rápidos. Acesso liberado instantaneamente por 24 horas.',
    features: [
      '24 horas de acesso total',
      'Todos os slots desbloqueados',
      'Comprovante Ticketmaster completo',
      'Ativação em 1 clique',
    ],
  },
  {
    id: 'prod_7d',
    name: 'Chave Semanal Pro (7 Dias)',
    category: 'chaves',
    days: 7,
    regularPrice: 'R$ 49,90',
    regularRawPrice: 49.9,
    promoPrice: 'R$ 29,90',
    promoRawPrice: 29.9,
    discountBadge: '-40%',
    rating: 4.9,
    reviewsCount: 145,
    soldCount: 21,
    totalStock: 25,
    isHotDeal: true,
    tag: '🔥 POPULAR',
    description: 'Perfeito para semana de evento. Validade contínua com atualização de dados.',
    features: [
      '7 dias de acesso completo',
      'Edição ilimitada de compradores',
      'Sincronização entre abas',
      'Chave criptografada SHA-256',
    ],
  },
  {
    id: 'prod_30d',
    name: 'Chave VIGARISTA 30 Dias (Mensal)',
    category: 'chaves',
    days: 30,
    regularPrice: 'R$ 120,00',
    regularRawPrice: 120.0,
    promoPrice: 'R$ 69,90',
    promoRawPrice: 69.9,
    discountBadge: '-42%',
    rating: 5.0,
    reviewsCount: 342,
    soldCount: 28,
    totalStock: 30,
    isHotDeal: true,
    isBestSeller: true,
    tag: '👑 MAIS VENDIDO',
    description: 'Acesso total por 30 dias com 4 slots BTS, Quentro Live QR e Camuflagem Safari.',
    features: [
      '30 dias de acesso ininterrupto',
      '4 Slots oficiais (BTS Pista, VIP, Meia)',
      'Quentro Live QR animado 15s',
      'Camuflagem 100% indetectável Safari',
      'Entrega imediata no Pix',
    ],
  },
  {
    id: 'prod_365d',
    name: 'Acesso VIP Anual (365 Dias)',
    category: 'vip',
    days: 365,
    regularPrice: 'R$ 360,00',
    regularRawPrice: 360.0,
    promoPrice: 'R$ 199,90',
    promoRawPrice: 199.9,
    discountBadge: '-45%',
    rating: 5.0,
    reviewsCount: 88,
    soldCount: 8,
    totalStock: 10,
    isHotDeal: true,
    isBestSeller: true,
    tag: '💎 VIP ILIMITADO',
    description: 'Acesso anual definitivo para revendedores e uso constante sem bloqueios.',
    features: [
      '12 meses de acesso irrestrito',
      'Todas as atualizações incluídas',
      'Suporte prioritário VIGARISTA',
      'Slots ilimitados e customizações',
    ],
  },
];

const CATEGORIES = [
  { id: 'all', name: 'Todos', count: '4' },
  { id: 'chaves', name: 'Chaves Pix', count: '2' },
  { id: 'passes', name: 'Passes 24h', count: '1' },
  { id: 'vip', name: 'Acesso VIP', count: '1' },
];

interface CheckoutLojaViewProps {
  onReturnToApp?: () => void;
  onOpenWithKey?: (key: string) => void;
}

export const CheckoutLojaView: React.FC<CheckoutLojaViewProps> = ({
  onReturnToApp,
  onOpenWithKey,
}) => {
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'hot'>('all');
  
  // Voice Search Web Speech API Integration
  const {
    isListening,
    isSupported: isVoiceSupported,
    toggleListening,
    error: voiceError,
  } = useVoiceSearch((transcriptText) => {
    setSearchFilter(transcriptText);
  });

  // Checkout Modal State
  const [checkoutProduct, setCheckoutProduct] = useState<ActiveCheckoutItem | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [emailStatusMessage, setEmailStatusMessage] = useState<string | null>(null);
  const [pixTimeRemaining, setPixTimeRemaining] = useState(600);
  const [isVerifying, setIsVerifying] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Hot Deals Countdown (Hours:Mins:Secs)
  const [countdown, setCountdown] = useState({ hours: 14, mins: 38, secs: 45 });
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        return { hours: 23, mins: 59, secs: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Pix payment timer
  useEffect(() => {
    if (!checkoutProduct || generatedKey) return;
    const timer = setInterval(() => {
      setPixTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [checkoutProduct, generatedKey]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Pix code calculation
  const pixCode = checkoutProduct
    ? `00020126580014br.gov.bcb.pix0136vigarista-${checkoutProduct.id}-auto520400005303986540${checkoutProduct.rawPrice.toFixed(2)}5802BR5920VIGARISTA OFFICIAL6009SAO PAULO62070503***6304${Math.floor(1000 + Math.random() * 9000)}`
    : '';

  const handleStartCheckout = (prod: ProductItem, isPromo: boolean = false) => {
    setCheckoutProduct({
      id: prod.id,
      name: prod.name,
      days: prod.days,
      price: isPromo ? prod.promoPrice : prod.regularPrice,
      rawPrice: isPromo ? prod.promoRawPrice : prod.regularRawPrice,
    });
    setGeneratedKey(null);
    setEmailStatusMessage(null);
    setPixTimeRemaining(600);
    setCopiedCode(false);
    setCopiedKey(false);
  };

  const handleSimulatePayment = async () => {
    if (!checkoutProduct) return;
    setIsVerifying(true);
    
    // 1. Generate real cryptographic key for the chosen plan
    const keyObj = createNewLicenseKey(checkoutProduct.days);
    setGeneratedKey(keyObj.key);

    // 2. If customer entered an email, dispatch automatically via Resend
    if (customerEmail && customerEmail.includes('@')) {
      try {
        const res = await sendLicenseByEmail({
          toEmail: customerEmail.trim(),
          licenseKey: keyObj.key,
          planName: checkoutProduct.name,
          daysValid: checkoutProduct.days,
        });
        if (res.success) {
          setEmailStatusMessage(`Chave enviada para ${customerEmail}!`);
        } else {
          setEmailStatusMessage(`Chave gerada, mas e-mail não enviado: ${res.message}`);
        }
      } catch {
        setEmailStatusMessage(null);
      }
    }

    setIsVerifying(false);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2200);
  };

  const handleCopyKey = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2200);
  };

  // Filter products
  const filteredProducts = PRODUCTS_CATALOG.filter((p) => {
    const matchSearch =
      searchFilter === '' ||
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.tag.toLowerCase().includes(searchFilter.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="min-h-screen w-full bg-[#0a0d14] text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-black relative overflow-x-hidden">
      {/* Background Subtle Pattern */}
      <div className="fixed inset-0 pointer-events-none select-none z-0 flex flex-col justify-around items-center overflow-hidden opacity-[0.025] text-white font-black text-7xl sm:text-8xl tracking-[0.25em] uppercase rotate-[-15deg]">
        <div>PAINEL VIGARISTA</div>
        <div>PAINEL VIGARISTA</div>
        <div>PAINEL VIGARISTA</div>
      </div>

      {/* 1. TOP PROMO BAR */}
      <div className="w-full bg-[#07090f] border-b border-white/10 py-1.5 px-3 sm:px-6 text-[11px] font-mono text-gray-300 flex items-center justify-between z-30">
        <div className="flex items-center gap-2 truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="font-bold text-white tracking-wide truncate">
            💎 PAINEL VIGARISTA • QUALIDADE ABSURDA • O MAIS AVANÇADO E COMPLETO JÁ CRIADO
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-gray-400 text-xs shrink-0">
          <span className="text-cyan-400 font-mono">⚡ 60FPS Ultra Fluido</span>
          <span>|</span>
          <span className="text-emerald-400 font-bold">SHA-256 Criptografado</span>
        </div>
      </div>

      {/* 2. MAIN E-COMMERCE NAVBAR */}
      <header className="sticky top-0 z-40 w-full bg-[#0e131f]/95 backdrop-blur-md border-b border-white/10 shadow-lg px-3 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Brand & Mask Avatar */}
          <div className="flex items-center gap-2.5 shrink-0 cursor-pointer">
            <div className="relative">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#141b2d] border border-cyan-500/40 p-0.5 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                <AnonymousMaskIllustration className="w-7 h-7 sm:w-8 sm:h-8" glowColor="#00ff66" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0e131f] rounded-full" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-lg tracking-wider text-white uppercase font-mono">
                  PAINEL VIGARISTA
                </span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-mono font-bold border border-cyan-400/30">
                  PRO
                </span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">
                Loja Oficial de Licenças
              </span>
            </div>
          </div>

          {/* Search Input Bar with Web Speech API Voice Command (Center) */}
          <div className="flex-1 max-w-md mx-2 relative">
            <div className={`relative flex items-center rounded-xl transition-all ${
              isListening ? 'ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)]' : ''
            }`}>
              <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={
                  isListening
                    ? '🎙️ Ouvindo sua voz... (Fale o plano desejado)'
                    : 'Buscar por voz ou texto (ex: 30 dias, VIP, 24h)...'
                }
                className={`w-full bg-[#151c2e] border ${
                  isListening ? 'border-emerald-400 bg-emerald-950/20 text-emerald-300' : 'border-white/15 focus:border-cyan-400'
                } rounded-xl pl-9 pr-16 py-2 text-xs text-white placeholder-gray-400 focus:outline-none transition-all`}
              />

              <div className="absolute right-2 flex items-center gap-1">
                {/* Clear button */}
                {searchFilter && (
                  <button
                    type="button"
                    onClick={() => setSearchFilter('')}
                    className="p-1 text-gray-400 hover:text-white cursor-pointer transition-colors"
                    title="Limpar busca"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Web Speech API Voice Search Button */}
                {isVoiceSupported ? (
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                      isListening
                        ? 'bg-emerald-500 text-gray-950 shadow-[0_0_12px_rgba(52,211,153,0.7)] animate-pulse'
                        : 'text-gray-400 hover:text-cyan-400 hover:bg-white/10'
                    }`}
                    title={isListening ? 'Parar escuta de voz' : 'Buscar por comando de voz'}
                  >
                    {isListening ? (
                      <div className="flex items-center gap-0.5">
                        <span className="w-1 h-3 bg-gray-950 rounded-full animate-[bounce_0.6s_infinite]" />
                        <span className="w-1 h-4 bg-gray-950 rounded-full animate-[bounce_0.6s_infinite_0.2s]" />
                        <span className="w-1 h-2 bg-gray-950 rounded-full animate-[bounce_0.6s_infinite_0.4s]" />
                      </div>
                    ) : (
                      <Mic className="w-3.5 h-3.5" />
                    )}
                  </button>
                ) : null}
              </div>
            </div>

            {/* Listening Feedback / Error Badge */}
            {isListening && (
              <div className="absolute top-full left-0 right-0 mt-1.5 p-2 bg-emerald-950/90 border border-emerald-500/40 rounded-xl backdrop-blur-md z-50 text-[11px] font-mono text-emerald-300 flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold">Escutando comando de voz:</span>
                  <span className="text-white italic truncate max-w-[200px]">
                    {searchFilter ? `"${searchFilter}"` : 'Fale agora...'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleListening}
                  className="px-2 py-0.5 bg-emerald-500 text-gray-950 text-[10px] font-bold rounded cursor-pointer"
                >
                  OK
                </button>
              </div>
            )}

            {voiceError && !isListening && (
              <div className="absolute top-full left-0 right-0 mt-1 p-1.5 bg-red-950/90 border border-red-500/30 rounded-lg text-[10px] font-mono text-red-300 z-50 animate-in fade-in">
                ⚠️ {voiceError}
              </div>
            )}
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Return / Open App Button */}
            {onReturnToApp && (
              <button
                type="button"
                onClick={onReturnToApp}
                className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-black text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Abrir Painel</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 3. STORE CONTENT AREA */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 z-10">
        
        {/* HERO BANNER: UMINEX / SHOPEE E-COMMERCE STYLE */}
        <section className="w-full rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#e11d48] via-[#be123c] to-[#1e1b4b] p-4 sm:p-7 relative overflow-hidden shadow-xl border border-red-500/30">
          {/* Cyber lines & background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-left max-w-lg">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 border border-white/20 text-white text-[11px] font-mono uppercase font-bold tracking-wider">
                <Sparkles className="w-3 h-3 text-yellow-300 animate-spin" style={{ animationDuration: '4s' }} />
                <span>⭐ QUALIDADE ABSURDA • O MELHOR PAINEL JÁ CRIADO</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Painel Vigarista Oficial <br className="hidden sm:inline" />
                <span className="text-yellow-300 drop-shadow-md">60 FPS & Perfeição Visual</span>
              </h1>

              <p className="text-xs sm:text-sm text-red-100 font-normal leading-relaxed">
                Desenvolvido com o mais alto padrão de engenharia: animações ultra-fluidas em 60fps, 4 slots de dados instantâneos, QR Code animado em tempo real, busca por voz e estabilidade absoluta. A experiência mais refinada do mercado.
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const prod30 = PRODUCTS_CATALOG.find((p) => p.id === 'prod_30d') || PRODUCTS_CATALOG[0];
                    handleStartCheckout(prod30, true);
                  }}
                  className="px-5 py-3 rounded-xl bg-white text-gray-950 font-black text-xs font-mono uppercase tracking-wider hover:bg-yellow-300 hover:text-black transition-all shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Zap className="w-4 h-4 text-red-600 fill-current" />
                  <span>Garantir Acesso VIP no Pix</span>
                </button>
              </div>
            </div>

            {/* Hero Mask Graphic Showcase */}
            <div className="relative flex flex-col items-center justify-center shrink-0">
              <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-black/60 border-2 border-yellow-400/40 p-3 flex items-center justify-center shadow-[0_0_40px_rgba(234,179,8,0.3)] relative">
                <AnonymousMaskIllustration className="w-28 h-28 sm:w-36 sm:h-36" glowColor="#00ff66" />
                <div className="absolute -bottom-2 px-3 py-1 rounded-full bg-yellow-400 text-gray-950 font-mono font-black text-[10px] uppercase shadow-md">
                  PAINEL VIGARISTA™
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. UNIFIED PRODUCTS & PROMOTIONS CATALOG WITH RELÂMPAGO TAB */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0f1422] p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider font-mono">
                  {activeTab === 'hot' ? '🔥 Ofertas Relâmpago com Desconto' : 'Catálogo de Licenças Oficiais'}
                </h2>
              </div>
              <p className="text-xs text-gray-400">
                {activeTab === 'hot'
                  ? 'Aproveite os descontos especiais por tempo limitado com entrega instantânea via Pix.'
                  : 'Valores padrão de tabela com ativação imediata e garantia oficial Painel Vigarista.'}
              </p>
            </div>

            {/* Filter Tabs & Countdown */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Hot Deals Countdown (When applicable) */}
              <div className="flex items-center gap-1 text-[11px] font-mono text-gray-300 bg-red-950/50 border border-red-500/30 px-2.5 py-1.5 rounded-xl">
                <Flame className="w-3.5 h-3.5 text-orange-400 animate-bounce" />
                <span className="text-gray-400 hidden sm:inline">Tempo Ofertas:</span>
                <span className="font-bold text-red-400">
                  {countdown.hours.toString().padStart(2, '0')}:{countdown.mins.toString().padStart(2, '0')}:{countdown.secs.toString().padStart(2, '0')}
                </span>
              </div>

              {/* Tabs: Todos, Relâmpago */}
              <div className="flex items-center gap-1 bg-[#151c2e] p-1 rounded-xl border border-white/10 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                    activeTab === 'all' ? 'bg-cyan-500 text-gray-950 shadow' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('hot')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                    activeTab === 'hot'
                      ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                      : 'text-orange-400 hover:text-orange-300'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-yellow-300 fill-current animate-pulse" />
                  <span>Relâmpago</span>
                </button>
              </div>
            </div>
          </div>

          {/* Unified Catalog Grid with 60FPS Fire Effects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredProducts.map((prod) => {
              const isPromo = activeTab === 'hot';
              const hasFire = isPromo;
              const displayPrice = isPromo ? prod.promoPrice : prod.regularPrice;

              const CardInner = (
                <div className={`p-4 sm:p-5 rounded-2xl bg-[#101625] border transition-all flex flex-col sm:flex-row gap-4 relative overflow-hidden group shadow-xl ${
                  hasFire ? 'border-orange-500/40' : 'border-white/10 hover:border-cyan-400/50'
                }`}>
                  {/* Left Art Avatar */}
                  <div className="w-full sm:w-36 h-36 bg-[#0b0f19] rounded-xl flex items-center justify-center shrink-0 border border-white/5 relative overflow-hidden">
                    {/* Badge */}
                    {isPromo ? (
                      <div className="absolute top-2 left-2 z-20 px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white font-mono font-black text-[10px] shadow-[0_0_15px_rgba(239,68,68,0.7)] border border-yellow-300/40 flex items-center gap-1 fire-sparkle-badge">
                        <Flame className="w-3.5 h-3.5 text-yellow-200 fill-current" />
                        <span>{prod.discountBadge} OFF</span>
                      </div>
                    ) : (
                      <span className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[9px] font-bold border border-cyan-400/30">
                        {prod.tag}
                      </span>
                    )}

                    {/* Mask Artwork Display */}
                    <div className="w-20 h-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <AnonymousMaskIllustration className="w-full h-full" glowColor={hasFire ? "#ff4500" : "#00ff66"} />
                    </div>

                    {/* Duration pill */}
                    <span className="absolute bottom-2 right-2 z-20 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[10px] font-mono text-cyan-300 border border-white/10">
                      {prod.days}D Válidos
                    </span>
                  </div>

                  {/* Right Product Details */}
                  <div className="flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] text-yellow-400 mb-0.5">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="font-bold">{prod.rating.toFixed(1)}</span>
                        <span className="text-gray-400">({prod.reviewsCount} avaliações)</span>
                        {isPromo ? (
                          <span className="ml-auto px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 font-mono text-[9px] font-bold border border-red-500/30 flex items-center gap-0.5">
                            <Flame className="w-2.5 h-2.5 fill-current" />
                            OFERTA
                          </span>
                        ) : prod.isBestSeller ? (
                          <span className="ml-auto px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[9px] font-bold border border-cyan-400/30">
                            OFICIAL
                          </span>
                        ) : null}
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-white">{prod.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed line-clamp-2">
                        {prod.description}
                      </p>

                      {/* Features list */}
                      <ul className="mt-2 space-y-1 text-[11px] text-gray-300">
                        {prod.features.slice(0, 2).map((f, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span className="truncate">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Stock Bar & Buy Trigger */}
                    <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          {isPromo && (
                            <span className="text-[11px] text-gray-500 line-through font-mono">
                              {prod.regularPrice}
                            </span>
                          )}
                          <span className={`text-lg font-black font-mono ${isPromo ? 'text-orange-400' : 'text-cyan-300'}`}>
                            {displayPrice}
                          </span>
                        </div>
                        <div className="text-[9px] text-emerald-400 font-mono">
                          {isPromo ? '🔥 Queima de estoque Pix' : '⚡ Entrega imediata no Pix'}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStartCheckout(prod, isPromo)}
                        className={`px-4 py-2.5 rounded-xl font-black font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md ${
                          hasFire
                            ? 'bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white shadow-orange-500/30'
                            : 'bg-cyan-500 hover:bg-cyan-400 text-gray-950 shadow-cyan-500/20'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>Comprar no Pix</span>
                      </button>
                    </div>
                  </div>
                </div>
              );

              if (hasFire) {
                return (
                  <OrganicFireCard key={prod.id}>
                    {CardInner}
                  </OrganicFireCard>
                );
              }

              return <div key={prod.id}>{CardInner}</div>;
            })}
          </div>
        </section>

        {/* 5. RECURSOS DO PRODUTO & GARANTIAS DO PAINEL */}
        <section className="rounded-2xl sm:rounded-3xl bg-[#090d18] border border-cyan-500/20 p-5 sm:p-8 space-y-4 shadow-2xl">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase font-bold tracking-widest">
            <Sparkles className="w-4 h-4" />
            <span>Infraestrutura & Qualidade Imbatível PAINEL VIGARISTA</span>
          </div>

          <h2 className="text-lg sm:text-2xl font-black text-white">
            Por que o Painel VIGARISTA é o melhor e mais avançado já criado?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2 text-xs text-gray-300">
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2 hover:border-cyan-500/40 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold font-mono">
                60F
              </div>
              <span className="font-bold text-white block text-sm">Fluidez 60 FPS & Animações Orgânicas</span>
              <p className="text-gray-400 leading-relaxed text-[11px]">
                Renderização ultra-otimizada com partículas e labaredas fluidas sem perda de quadros ou lentidão.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2 hover:border-cyan-500/40 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold font-mono">
                4S
              </div>
              <span className="font-bold text-white block text-sm">4 Slots Prontos & 100% Editáveis</span>
              <p className="text-gray-400 leading-relaxed text-[11px]">
                Slots com Pista Meia, VIP, Inteira e Arquibancada com recálculo automático em tempo real.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2 hover:border-cyan-500/40 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 font-bold font-mono">
                QR
              </div>
              <span className="font-bold text-white block text-sm">Quentro Live QR Code Anti-Print</span>
              <p className="text-gray-400 leading-relaxed text-[11px]">
                Código dinâmico animado com contagem de 15 segundos e transferência de ingressos instantânea.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2 hover:border-cyan-500/40 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold font-mono">
                SAF
              </div>
              <span className="font-bold text-white block text-sm">Camuflagem Safari & Atalho Secreto</span>
              <p className="text-gray-400 leading-relaxed text-[11px]">
                Acesso discreto protegido por palavras-chave com transição animada de matriz e bloqueio por código.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2 hover:border-cyan-500/40 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 font-bold font-mono">
                MIC
              </div>
              <span className="font-bold text-white block text-sm">Busca Nativa por Comando de Voz</span>
              <p className="text-gray-400 leading-relaxed text-[11px]">
                Web Speech API integrada na barra de pesquisa sem requisições de permissão indesejadas.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2 hover:border-cyan-500/40 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold font-mono">
                PIX
              </div>
              <span className="font-bold text-white block text-sm">Entrega Imediata & Chave Segura</span>
              <p className="text-gray-400 leading-relaxed text-[11px]">
                Sistema automatizado com chave Pix oficial e validação imediata de licença criptografada SHA-256.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* 6. FOOTER */}
      <footer className="w-full border-t border-white/10 bg-[#06080e] py-8 px-4 sm:px-6 mt-12 text-center text-xs text-gray-400 font-mono space-y-3">
        <div className="flex items-center justify-center gap-2">
          <AnonymousMaskIllustration className="w-6 h-6" />
          <span className="text-sm font-black text-white tracking-[0.2em] uppercase">PAINEL VIGARISTA™ OFFICIAL</span>
        </div>
        <p className="text-[11px] text-gray-500 max-w-md mx-auto">
          Sistema Oficial Painel Vigarista com emissão e validação de chaves criptográficas SHA-256.
        </p>
        <div className="text-[10px] text-gray-600">
          © 2026 PAINEL VIGARISTA • TODOS OS DIREITOS RESERVADOS
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* CHECKOUT PIX MODAL */}
      {/* ========================================================================= */}
      {checkoutProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-[#0e1424] border border-cyan-500/40 rounded-3xl p-5 sm:p-7 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setCheckoutProduct(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* STAGE 1: PIX PAYMENT */}
            {!generatedKey ? (
              <>
                {/* Header */}
                <div className="space-y-1 text-center pr-6">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-mono text-[10px] uppercase font-bold border border-cyan-500/30">
                    <Sparkles className="w-3 h-3" />
                    <span>PAGAMENTO AUTOMÁTICO PIX</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{checkoutProduct.name}</h3>
                  <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
                    {checkoutProduct.price}
                  </div>
                </div>

                {/* Expiration Timer */}
                <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-cyan-300 bg-cyan-500/10 py-1.5 px-3 rounded-xl border border-cyan-500/20">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Código Pix expira em: <strong>{formatTime(pixTimeRemaining)}</strong></span>
                </div>

                {/* QR Code Container with Laser Scanning Bar */}
                <div className="p-4 bg-white rounded-2xl flex flex-col items-center justify-center relative overflow-hidden shadow-lg">
                  {/* Cyber Laser Scan Bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-500 shadow-[0_0_12px_#06b6d4] animate-[bounce_2s_infinite]" />

                  <div className="w-44 h-44 bg-white flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <rect width="100" height="100" fill="white" />
                      <rect x="5" y="5" width="25" height="25" fill="black" />
                      <rect x="8" y="8" width="19" height="19" fill="white" />
                      <rect x="11" y="11" width="13" height="13" fill="black" />

                      <rect x="70" y="5" width="25" height="25" fill="black" />
                      <rect x="73" y="8" width="19" height="19" fill="white" />
                      <rect x="76" y="11" width="13" height="13" fill="black" />

                      <rect x="5" y="70" width="25" height="25" fill="black" />
                      <rect x="8" y="73" width="19" height="19" fill="white" />
                      <rect x="11" y="76" width="13" height="13" fill="black" />

                      <rect x="35" y="10" width="6" height="6" fill="black" />
                      <rect x="45" y="10" width="6" height="6" fill="black" />
                      <rect x="55" y="15" width="6" height="6" fill="black" />
                      <rect x="35" y="25" width="6" height="6" fill="black" />
                      <rect x="45" y="20" width="6" height="6" fill="black" />
                      <rect x="55" y="30" width="6" height="6" fill="black" />
                      <rect x="10" y="40" width="6" height="6" fill="black" />
                      <rect x="20" y="45" width="6" height="6" fill="black" />
                      <rect x="35" y="45" width="8" height="8" fill="black" />
                      <rect x="50" y="45" width="6" height="6" fill="black" />
                      <rect x="65" y="40" width="6" height="6" fill="black" />
                      <rect x="80" y="45" width="6" height="6" fill="black" />
                      <rect x="35" y="60" width="6" height="6" fill="black" />
                      <rect x="45" y="70" width="8" height="8" fill="black" />
                      <rect x="60" y="65" width="6" height="6" fill="black" />
                      <rect x="70" y="70" width="6" height="6" fill="black" />
                      <rect x="85" y="75" width="6" height="6" fill="black" />
                      <rect x="40" y="85" width="6" height="6" fill="black" />
                      <rect x="60" y="85" width="6" height="6" fill="black" />
                      <rect x="75" y="85" width="6" height="6" fill="black" />
                    </svg>
                  </div>

                  <span className="text-[10px] font-mono font-bold text-gray-800 mt-1">
                    Escaneie no app do seu banco
                  </span>
                </div>

                {/* Customer Email Input for Auto Delivery */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-mono text-gray-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Mail className="w-3.5 h-3.5 text-cyan-400" />
                      <span>E-mail para Receber a Key:</span>
                    </span>
                    <span className="text-[10px] text-cyan-300 font-mono">⚡ Envio Imediato</span>
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="digite seu e-mail (ex: seuemail@gmail.com)"
                    className="w-full bg-black/60 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Pix Copia e Cola */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-mono text-gray-300 flex items-center justify-between">
                    <span>Pix Copia e Cola:</span>
                    {copiedCode && <span className="text-emerald-400 font-bold">✓ Copiado!</span>}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={pixCode}
                      className="flex-1 bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-gray-300 select-all truncate"
                    />
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-black font-mono text-xs rounded-xl flex items-center gap-1 transition-all cursor-pointer active:scale-95 shrink-0"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copiar</span>
                    </button>
                  </div>
                </div>

                {/* Live Payment Status & Instructions */}
                <div className="pt-2 border-t border-white/10 space-y-2.5">
                  <div className="p-3 bg-black/60 rounded-xl border border-white/10 flex items-center justify-between">
                    <span className="text-xs font-mono text-gray-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      Status Pix:
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                      Aguardando Pagamento...
                    </span>
                  </div>

                  {/* Instant Release Action */}
                  <button
                    type="button"
                    onClick={handleSimulatePayment}
                    disabled={isVerifying}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-gray-950 font-mono font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-98 disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 fill-current" />
                    )}
                    <span>Já Realizei o Pagamento &bull; Liberar Key</span>
                  </button>

                  <span className="text-[10px] text-gray-400 font-mono text-center block">
                    Ao confirmar o Pix, a key é gerada na tela e disparada via Resend para seu e-mail.
                  </span>
                </div>
              </>
            ) : (
              /* STAGE 2: KEY DELIVERED */
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
                  <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
                </div>

                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold uppercase border border-emerald-500/30">
                    PAGAMENTO CONFIRMADO
                  </span>
                  <h3 className="text-xl font-black text-white">Chave Gerada com Sucesso!</h3>
                  <p className="text-xs text-gray-400 font-mono">
                    Licença válida por <strong>{checkoutProduct.days} dias</strong>.
                  </p>
                </div>

                {/* Email Delivery Confirmation Card */}
                {customerEmail && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-left flex items-start gap-2.5 text-xs text-emerald-200">
                    <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-emerald-300 font-mono text-[11px]">
                        {emailStatusMessage || `Cópia enviada para seu e-mail!`}
                      </div>
                      <div className="text-[10px] text-emerald-400/80 font-mono truncate">
                        {customerEmail}
                      </div>
                    </div>
                  </div>
                )}

                {/* Key Box */}
                <div className="p-4 bg-black/80 border border-emerald-500/40 rounded-2xl space-y-2 text-left">
                  <div className="text-[11px] font-mono text-gray-400 flex items-center justify-between">
                    <span>Chave SHA-256 Oficial:</span>
                    <span className="text-emerald-400 font-bold">{checkoutProduct.days} Dias</span>
                  </div>

                  <div className="p-3 bg-[#080d19] rounded-xl border border-cyan-500/30 text-center font-mono text-base font-black text-cyan-300 tracking-wider select-all break-all shadow-inner">
                    {generatedKey}
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKey ? 'Chave Copiada!' : 'Copiar Chave'}</span>
                  </button>
                </div>

                {/* Action to launch app */}
                <div className="space-y-2 pt-1">
                  {onOpenWithKey && generatedKey && (
                    <button
                      type="button"
                      onClick={() => onOpenWithKey(generatedKey)}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-500 text-gray-950 font-black font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      <span>Ativar e Abrir Painel Vigarista Agora</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setCheckoutProduct(null)}
                    className="text-xs font-mono text-gray-400 hover:text-white underline cursor-pointer"
                  >
                    Fechar Loja
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
