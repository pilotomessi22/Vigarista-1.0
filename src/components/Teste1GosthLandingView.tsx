import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Shield,
  Zap,
  Users,
  Lock,
  Layers,
  Sparkles,
  Check,
  ChevronDown,
  MessageSquare,
  MessageCircle,
  Phone,
  LogIn,
  ExternalLink,
  Copy,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Play,
  HelpCircle,
  Flame,
  Ticket,
  Smartphone,
  Star,
  RefreshCw,
  BadgePercent,
  CheckCheck,
  Edit3,
  Calendar,
  Compass,
  Sliders,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { GosthLogo } from './GosthLogo';
import { createNewLicenseKey } from '../utils/licenseManager';

const ADMIN_WHATSAPP_NUMBER = '+5531972039040';
const ADMIN_WHATSAPP_DISPLAY = '+55 (31) 97203-9040';
const ADMIN_WHATSAPP_RAW = '5531972039040';
const ADMIN_WHATSAPP_MESSAGE = 'Quero garantir meu acesso exclusivo do painel vigarista';
const ADMIN_WHATSAPP_LINK = `https://api.whatsapp.com/send?phone=${ADMIN_WHATSAPP_RAW}&text=${encodeURIComponent(ADMIN_WHATSAPP_MESSAGE)}`;

interface Teste1GosthLandingViewProps {
  onNavigateToLogin?: () => void;
  isStandalone?: boolean;
}

interface PlanItem {
  id: string;
  name: string;
  days: number;
  periodText: string;
  regularPrice: string;
  promoPrice: string;
  rawPrice: number;
  discountBadge: string;
  billingText: string;
  isPopular?: boolean;
  tag?: string;
  features: string[];
}

const VIGARISTA_PLANS: PlanItem[] = [
  {
    id: 'chave_30d',
    name: 'Acesso Mensal VIP',
    days: 30,
    periodText: 'Tem direito de acesso por 30 dias ao painel',
    regularPrice: 'R$ 899,90',
    promoPrice: 'R$ 649,99',
    rawPrice: 649.99,
    discountBadge: '-28% OFF',
    billingText: '/ pagamento mensal',
    isPopular: true,
    tag: '👑 MAIS VENDIDO',
    features: [
      'Acesso irrestrito por 30 dias completos',
      'Todos os comprovantes 100% editáveis em tempo real',
      'Alternância instantânea ao clicar no setor e dia',
      'Barra de navegação idêntica à original do Safari',
      '4 Slots oficiais (Pista Premium, VIP, Meia, Inteira)',
      'Camuflagem Safari & Bypass 100% indetectável',
      'Comprovante Ticketmaster fiscal completo',
      'Suporte VIP 24/7 direto com administrador',
    ],
  },
  {
    id: 'chave_vitalicio',
    name: 'Acesso Vitalício',
    days: 36500,
    periodText: 'Acesso Vitalício Permanente (Sem Mensalidades)',
    regularPrice: 'R$ 2.999,90',
    promoPrice: 'R$ 1.999,99',
    rawPrice: 1999.99,
    discountBadge: '-33% OFF',
    billingText: '/ pagamento único',
    tag: '💎 VITALÍCIO SUPREMO',
    features: [
      'Acesso Vitalício definitivo sem mensalidades',
      'Todas as atualizações futuras inclusas gratuitamente',
      'Alternância de todos os setores, lotes e dias',
      'Barra Safari e camuflagem completa indetectável',
      'Slots e edições ilimitadas sem restrições',
      'Suporte VIP prioritário e canal exclusivo',
      'Chave permanente registrada na nuvem',
    ],
  },
];

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'Como funciona a edição dos comprovantes?',
    answer:
      'Todos os comprovantes são 100% editáveis em tempo real! Você pode alterar nome do titular, CPF, tipo de ingresso (Meia-Entrada, Inteira, VIP), valores de taxas, código do pedido e data da compra diretamente na tela.',
  },
  {
    question: 'O que é a alternância ao clicar no setor e no dia do ingresso?',
    answer:
      'Com apenas um toque sobre o setor (Pista Premium, Cadeira Superior, Cadeira Inferior, Camarote VIP) ou sobre o dia/data do show, o painel alterna instantaneamente as informações sem precisar recarregar a página, proporcionando máxima agilidade e naturalidade.',
  },
  {
    question: 'A barra de navegação é realmente idêntica à do Safari?',
    answer:
      'Sim! Desenvolvemos uma barra de navegação inferior flutuante com a mesma altura, espaçamento, ícones nativos, menu de controle de tamanho de texto (aA) e transições idênticas ao Safari original do iPhone/iOS.',
  },
  {
    question: 'Como recebo minha chave após o pagamento no Pix?',
    answer:
      'Nosso sistema é 100% automatizado! Assim que o pagamento via Pix for confirmado, sua chave de licença VIP (ex: VIGARISTA-XXXX-XXXX) é liberada imediatamente na tela do checkout e pode ser ativada com apenas um clique.',
  },
  {
    question: 'Como funciona a camuflagem Safari Anti-Detecção?',
    answer:
      'O painel conta com uma camada de segurança inteligente que simula com perfeição a página inicial do Safari do iOS (com favoritos, abas e barra de pesquisa). Apenas usuários autorizados com chave válida conseguem acessar o painel de ingressos, garantindo sigilo absoluto.',
  },
];

export const Teste1GosthLandingView: React.FC<Teste1GosthLandingViewProps> = ({
  onNavigateToLogin,
  isStandalone = true,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // Flash Sale Countdown Timer (ex: 14m 38s)
  const [flashSaleSeconds, setFlashSaleSeconds] = useState(892);

  // Pix checkout state
  const [pixTimeRemaining, setPixTimeRemaining] = useState(600);
  const [isVerifying, setIsVerifying] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Flash sale countdown interval
  useEffect(() => {
    const timer = setInterval(() => {
      setFlashSaleSeconds((prev) => (prev > 0 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatFlashTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}h : ${minutes
      .toString()
      .padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`;
  };

  // Timer for Pix payment modal
  useEffect(() => {
    if (!selectedPlan || generatedKey) return;
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
  }, [selectedPlan, generatedKey]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOpenCheckout = (plan: PlanItem) => {
    setSelectedPlan(plan);
    setGeneratedKey(null);
    setPixTimeRemaining(600);
    setCopiedPix(false);
    setCopiedKey(false);
    setIsMobileMenuOpen(false);
  };

  const handleSimulatePayment = () => {
    if (!selectedPlan) return;
    setIsVerifying(true);
    setTimeout(() => {
      const keyObj = createNewLicenseKey(selectedPlan.days);
      setGeneratedKey(keyObj.key);
      setIsVerifying(false);
    }, 900);
  };

  const pixCode = selectedPlan
    ? `00020126580014br.gov.bcb.pix0136vigarista-${selectedPlan.id}-auto520400005303986540${selectedPlan.rawPrice.toFixed(2)}5802BR5918VIGARISTA INGRESSOS6009SAO PAULO62070503***6304${Math.floor(1000 + Math.random() * 9000)}`
    : '';

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleCopyKey = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleApplyKeyAndLogin = () => {
    if (generatedKey) {
      try {
        localStorage.setItem('tm_prefill_license_key', generatedKey);
      } catch {}
    }
    setSelectedPlan(null);
    onNavigateToLogin();
  };

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#060709] text-white font-sans selection:bg-red-600 selection:text-white relative overflow-x-hidden">
      {/* Top Background Gradient Aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-red-600/12 blur-[140px] rounded-full pointer-events-none -z-10" />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 bg-[#060709]/95 backdrop-blur-md border-b border-zinc-900 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => scrollToSection('inicio')}>
          <GosthLogo className="w-8 h-8 sm:w-9 sm:h-9" />
          <div className="flex flex-col">
            <span className="font-black tracking-wider text-base sm:text-lg leading-tight uppercase flex items-center gap-1.5">
              <span>VIGARISTA</span>
              <span className="text-red-500 font-extrabold text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/30">
                VIP
              </span>
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-zinc-300">
          <button
            type="button"
            onClick={() => scrollToSection('inicio')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Início
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('promocao')}
            className="text-red-400 hover:text-red-300 transition-colors cursor-pointer flex items-center gap-1"
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>Promoção</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('como-usar')}
            className="text-red-400 hover:text-white transition-colors cursor-pointer font-semibold flex items-center gap-1"
          >
            <Play className="w-3 h-3 fill-current text-red-500" />
            <span>Como Usar</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('funcionalidades')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Recursos
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('precos')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Planos
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('faq')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            FAQ
          </button>
          <button
            type="button"
            onClick={() => setIsTermsModalOpen(true)}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Termos
          </button>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href={ADMIN_WHATSAPP_LINK}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl border border-emerald-500/60 hover:border-emerald-400 bg-emerald-950/30 text-emerald-300 hover:text-white text-xs font-bold flex items-center gap-2 hover:bg-emerald-600/20 transition-all cursor-pointer shadow-sm"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp VIP</span>
          </a>
          {!isStandalone && onNavigateToLogin && (
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="px-3.5 py-2 rounded-xl border border-red-600/70 hover:border-red-500 text-white text-xs font-bold flex items-center gap-2 hover:bg-red-600/10 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-red-500" />
              <span>Entrar no Painel</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => scrollToSection('precos')}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-lg shadow-red-600/30 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Comprar Acesso (PIX)</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-zinc-300 hover:text-white focus:outline-none cursor-pointer"
          aria-label="Abrir menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6 text-red-500" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[57px] z-50 bg-[#060709] px-6 py-6 flex flex-col justify-between animate-fadeIn md:hidden overflow-y-auto">
          <div className="flex flex-col space-y-4">
            <button
              type="button"
              onClick={() => scrollToSection('inicio')}
              className="text-left text-lg font-bold text-zinc-200 hover:text-white py-1.5 border-b border-zinc-900"
            >
              Início
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('promocao')}
              className="text-left text-lg font-bold text-red-400 hover:text-red-300 py-1.5 border-b border-zinc-900 flex items-center justify-between"
            >
              <span>Promoção Relâmpago</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-mono">
                50% OFF
              </span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('como-usar')}
              className="text-left text-lg font-bold text-red-400 hover:text-red-300 py-1.5 border-b border-zinc-900 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current text-red-500" />
              <span>Como USAR o Vigarista?</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('funcionalidades')}
              className="text-left text-lg font-bold text-zinc-200 hover:text-white py-1.5 border-b border-zinc-900"
            >
              Recursos do Painel
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('precos')}
              className="text-left text-lg font-bold text-zinc-200 hover:text-white py-1.5 border-b border-zinc-900"
            >
              Planos & Comprovantes
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('faq')}
              className="text-left text-lg font-bold text-zinc-200 hover:text-white py-1.5 border-b border-zinc-900"
            >
              Perguntas Frequentes
            </button>
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsTermsModalOpen(true);
              }}
              className="text-left text-lg font-bold text-zinc-200 hover:text-white py-1.5 border-b border-zinc-900"
            >
              Termos de Uso
            </button>

            {/* Mobile Action Buttons */}
            <div className="pt-3 flex flex-col gap-3">
              <a
                href={ADMIN_WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 rounded-xl border border-emerald-500/60 bg-emerald-950/30 text-emerald-300 hover:text-white font-bold text-sm flex items-center justify-center gap-2.5 active:bg-emerald-600/20 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Oficial</span>
              </a>
              {!isStandalone && onNavigateToLogin && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigateToLogin();
                  }}
                  className="w-full py-3.5 rounded-xl border border-red-600 text-white font-bold text-sm flex items-center justify-center gap-2.5 active:bg-red-600/10 cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-red-500" />
                  <span>Entrar no Painel</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => scrollToSection('precos')}
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Ticket className="w-4 h-4" />
                <span>Comprar Acesso Agora</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-zinc-500 font-medium py-3 border-t border-zinc-900/80 mt-6">
            © 2026 VIGARISTA VIP • Gestão e Emissão de Ingressos.
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* HERO SECTION */}
        <section
          id="inicio"
          className="relative pt-10 pb-12 sm:pt-20 sm:pb-20 flex flex-col items-start sm:items-center text-left sm:text-center overflow-hidden"
        >
          {/* Giant Emblem Silhouette */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-15 pointer-events-none -z-10 w-[300px] sm:w-[480px] h-[300px] sm:h-[480px]">
            <GosthLogo className="w-full h-full" withGlow={false} />
          </div>

          {/* Eyebrow Status Badge */}
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/10 border border-red-500/30 text-red-400 text-xs font-bold tracking-wide shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>PAINEL VIP VIGARISTA • COMPROVANTES 100% EDITÁVEIS • BYPASS ATIVO</span>
          </div>

          {/* Vigarista Symbol Display */}
          <div className="mb-6 sm:mb-8">
            <GosthLogo className="w-20 h-20 sm:w-28 sm:h-28" />
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.15] text-white max-w-3xl">
            Eleve sua gestão de ingressos ao próximo{' '}
            <span className="text-red-500 inline-block drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]">
              nível
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-zinc-300 max-w-2xl font-normal leading-relaxed">
            Painel VIP completo com <strong className="text-white">todos os comprovantes 100% editáveis</strong>, alternância dinâmica de setor e dia ao clicar, barra de navegação idêntica à original do Safari e camuflagem indetectável.
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => scrollToSection('precos')}
              className="px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm tracking-wide shadow-lg shadow-red-600/30 transition-all active:scale-95 cursor-pointer text-center flex items-center justify-center gap-2"
            >
              <Ticket className="w-4 h-4" />
              <span>Comprar Acesso Agora</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('como-usar')}
              className="px-8 py-3.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-500/50 text-red-300 hover:text-white font-bold text-sm transition-all active:scale-95 cursor-pointer text-center flex items-center justify-center gap-2 shadow-md shadow-red-950/40"
            >
              <Play className="w-4 h-4 fill-current text-red-500" />
              <span>Como USAR o Vigarista?</span>
            </button>
            <button
              type="button"
              onClick={() => setIsDemoModalOpen(true)}
              className="px-8 py-3.5 rounded-xl bg-transparent hover:bg-zinc-900 border border-zinc-800 text-white font-bold text-sm transition-all active:scale-95 cursor-pointer text-center flex items-center justify-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4 text-red-500" />
              <span>Ver Recursos do Painel</span>
            </button>
          </div>
        </section>

        {/* SEÇÃO DESTAQUE: COMO USAR O VIGARISTA? */}
        <section
          id="como-usar"
          className="pt-4 pb-12 sm:pt-6 sm:pb-16 flex flex-col items-center text-center relative scroll-mt-20"
        >
          {/* Subtle Ambient Red Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] bg-red-600/15 rounded-full blur-[100px] pointer-events-none -z-10" />

          {/* Top Tag Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/15 border border-red-500/40 text-red-400 text-xs font-black tracking-wide mb-4 shadow-[0_0_20px_rgba(239,68,68,0.25)] uppercase">
            <Play className="w-3.5 h-3.5 fill-current text-red-500 animate-pulse" />
            <span>Demonstração Oficial em Vídeo</span>
          </div>

          {/* Red Title requested by user */}
          <h2 className="text-3xl sm:text-5xl font-black text-red-500 tracking-tight text-center drop-shadow-[0_0_25px_rgba(239,68,68,0.55)]">
            Como USAR o Vigarista?
          </h2>

          <p className="mt-3 text-sm sm:text-base text-zinc-300 max-w-xl font-normal leading-relaxed mb-7 px-4">
            Assista ao vídeo demonstrativo abaixo e veja na prática como funciona o painel, a alternância rápida e os comprovantes 100% editáveis no seu celular.
          </p>

          {/* Smartphone Frame Container for YouTube Shorts (9:16 vertical) */}
          <div className="relative w-full max-w-[320px] sm:max-w-[350px] mx-auto group">
            {/* Red Border Neon Aura */}
            <div className="absolute -inset-1 bg-gradient-to-b from-red-600 via-red-700 to-red-950 rounded-[40px] blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Phone Body Container */}
            <div className="relative rounded-[38px] bg-[#090a0f] border-2 border-red-500/80 p-3 sm:p-3.5 shadow-2xl shadow-black">
              {/* Phone Top Notch Bar */}
              <div className="w-28 h-4.5 bg-black rounded-full mx-auto mb-3 flex items-center justify-center gap-2 border border-zinc-800/80">
                <div className="w-2 h-2 rounded-full bg-red-600/70" />
                <div className="w-12 h-1.5 rounded-full bg-zinc-800" />
              </div>

              {/* YouTube Shorts Embed (9:16 Aspect Ratio) */}
              <div className="relative w-full aspect-[9/16] rounded-[24px] overflow-hidden bg-black border border-white/10 shadow-2xl">
                <iframe
                  src="https://www.youtube.com/embed/oH_5uGPzxCM?rel=0&modestbranding=1&playsinline=1"
                  title="Como USAR o Vigarista?"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              {/* Bottom iOS Indicator Bar */}
              <div className="w-32 h-1 bg-white/20 rounded-full mx-auto mt-3" />
            </div>
          </div>

          {/* Quick Action below video */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => scrollToSection('precos')}
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-red-600/30 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Ticket className="w-4 h-4" />
              <span>Garantir Meu Acesso Agora</span>
            </button>
          </div>
        </section>

        {/* PROMOÇÃO RELÂMPAGO BANNER */}
        <section id="promocao" className="py-8 sm:py-10">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-red-950/60 via-[#12080a] to-[#0d0a0f] border-2 border-red-600/60 p-6 sm:p-8 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Left Column: Info & Timer */}
              <div className="space-y-3 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-600 text-white font-black text-xs uppercase tracking-wider shadow-md">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>PROMOÇÃO RELÂMPAGO</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Descontos de até 50% OFF por Tempo Limitado!
                </h3>
                <p className="text-sm text-zinc-300 max-w-xl">
                  Garanta sua chave de acesso agora com ativação instantânea no Pix e liberação total de todos os 4 slots com comprovantes 100% editáveis.
                </p>

                {/* Stock Progress */}
                <div className="pt-2 max-w-md">
                  <div className="flex items-center justify-between text-xs text-zinc-300 font-bold mb-1.5">
                    <span>Estoque Promocional:</span>
                    <span className="text-red-400 font-mono">28 / 30 chaves vendidas</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-zinc-850 overflow-hidden p-0.5 border border-zinc-750">
                    <div className="h-full rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-red-600 w-[93%] animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic Live Countdown Box */}
              <div className="flex flex-col items-center gap-3 bg-[#060709]/80 border border-red-500/30 rounded-2xl p-5 sm:p-6 text-center shrink-0 w-full sm:w-auto min-w-[260px]">
                <span className="text-xs text-zinc-400 uppercase font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-red-500" />
                  A oferta expira em:
                </span>
                <div className="font-mono text-xl sm:text-2xl font-black text-red-400 tracking-wider bg-red-950/40 border border-red-800/40 px-4 py-2 rounded-xl">
                  {formatFlashTimer(flashSaleSeconds)}
                </div>
                <button
                  type="button"
                  onClick={() => scrollToSection('precos')}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-red-600/30 transition-all active:scale-95 cursor-pointer"
                >
                  Resgatar Desconto
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* RECURSOS PODEROSOS DO PAINEL (6 Cards no layout dark Gosth) */}
        <section id="funcionalidades" className="py-12 sm:py-20 border-t border-zinc-900">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Recursos de Alto Nível
            </h2>
            <p className="mt-3 text-sm sm:text-base text-zinc-400">
              Funções exclusivas que fazem toda a diferença na praticidade e fidelidade visual
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* 1. Comprovantes 100% Editáveis */}
            <div className="bg-[#0b0c10] border border-zinc-850 hover:border-red-500/40 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-500 group-hover:scale-105 transition-transform">
                  <Edit3 className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Comprovantes 100% Editáveis</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Personalize qualquer informação do pedido em tempo real: nome do titular, CPF, valores de taxas, data da compra e número de confirmação.
                </p>
              </div>
            </div>

            {/* 2. Alternância ao Clicar no Setor e Dia */}
            <div className="bg-[#0b0c10] border border-zinc-850 hover:border-red-500/40 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-500 group-hover:scale-105 transition-transform">
                  <Calendar className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Alternância de Setor e Dia com 1 Toque</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Alterne instantaneamente entre Pista Premium, Cadeira Superior/Inferior, Camarote VIP e os dias do show com um clique direto na tela.
                </p>
              </div>
            </div>

            {/* 3. Barra de Navegação Idêntica ao Safari */}
            <div className="bg-[#0b0c10] border border-zinc-850 hover:border-red-500/40 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-500 group-hover:scale-105 transition-transform">
                  <Compass className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Barra Safari Idêntica à Original</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Barra de navegação inferior flutuante idêntica ao Safari do iOS, incluindo menu funcional de tamanho de texto (aA) e favoritos nativos.
                </p>
              </div>
            </div>

            {/* 4. 4 Slots Independentes */}
            <div className="bg-[#0b0c10] border border-zinc-850 hover:border-red-500/40 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-500 group-hover:scale-105 transition-transform">
                  <Layers className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">4 Slots Customizáveis</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Gerencie múltiplos ingressos e compradores simultaneamente sem perder nenhuma alteração, com sincronização local inteligente.
                </p>
              </div>
            </div>

            {/* 5. Camuflagem Safari & Bypass */}
            <div className="bg-[#0b0c10] border border-zinc-850 hover:border-red-500/40 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-500 group-hover:scale-105 transition-transform">
                  <Shield className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Camuflagem & Bypass Anti-Detecção</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Tela inicial disfarçada de navegador Safari que protege seus acessos contra inspeções e mantém o sigilo total do painel.
                </p>
              </div>
            </div>

            {/* 6. Liberação Automática no Pix */}
            <div className="bg-[#0b0c10] border border-zinc-850 hover:border-red-500/40 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-500 group-hover:scale-105 transition-transform">
                  <Zap className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Liberação Instantânea no PIX</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Sistema de checkout inteligente: pagou no Pix, sua chave de licença é gerada e ativada imediatamente sem fila ou espera.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PLANOS E PREÇOS (Informações Vigarista + Layout Gosth) */}
        <section id="precos" className="py-12 sm:py-20 border-t border-zinc-900">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Planos & Licenças de Acesso
            </h2>
            <p className="mt-3 text-sm sm:text-base text-zinc-400">
              Escolha o tempo de acesso ideal para o seu volume de ingressos e eventos
            </p>
          </div>

          {/* Pricing Grid - 2 Planos Centralizados e Destacados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
            {VIGARISTA_PLANS.map((plan) => {
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                    plan.isPopular
                      ? 'bg-[#0f1016] border-2 border-red-600 shadow-2xl shadow-red-600/20 scale-100 md:scale-[1.02] z-10'
                      : 'bg-[#0b0c10] border border-zinc-800 hover:border-zinc-700 shadow-xl'
                  }`}
                >
                  {/* Top Badge */}
                  {plan.isPopular ? (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-red-600 text-white font-black text-xs uppercase tracking-wider py-1 px-4 rounded-full shadow-lg shadow-red-600/40">
                      Mais Popular 🔥
                    </div>
                  ) : plan.tag ? (
                    <div className="absolute -top-3 left-6 bg-zinc-900 border border-zinc-750 text-zinc-300 font-bold text-xs uppercase tracking-wider py-0.5 px-3 rounded-full">
                      {plan.tag}
                    </div>
                  ) : null}

                  <div>
                    {/* Plan Header */}
                    <div className="mb-5 pt-2">
                      <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                      <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 font-normal leading-relaxed">
                        {plan.periodText}
                      </p>
                    </div>

                    {/* Price Tag with Promo Badge */}
                    <div className="my-5 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-zinc-500 line-through font-mono">
                          {plan.regularPrice}
                        </span>
                        <span className="text-[10px] font-black text-red-400 bg-red-500/15 border border-red-500/30 px-2 py-0.5 rounded">
                          {plan.discountBadge}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
                          {plan.promoPrice}
                        </span>
                        <span className="text-xs text-zinc-400 font-medium">{plan.billingText}</span>
                      </div>
                    </div>

                    {/* Features Checklist */}
                    <div className="space-y-3 pt-2 mb-8 border-t border-zinc-900">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                          <Check className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Plan CTA Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenCheckout(plan)}
                    className={`w-full py-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all active:scale-95 cursor-pointer text-center flex items-center justify-center gap-2 ${
                      plan.isPopular
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30'
                        : 'bg-[#14151b] hover:bg-red-600 border border-zinc-800 hover:border-red-600 text-white'
                    }`}
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Comprar Agora</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* PERGUNTAS FREQUENTES (FAQ) */}
        <section id="faq" className="py-12 sm:py-20 border-t border-zinc-900">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Perguntas Frequentes
            </h2>
            <p className="mt-3 text-sm sm:text-base text-zinc-400">
              Tire todas as suas dúvidas sobre o Painel Vigarista e emissão de comprovantes
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-[#0b0c10] border border-zinc-850 hover:border-zinc-750 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  >
                    <span className="font-bold text-sm sm:text-base text-white">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-zinc-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-red-500' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-900/60 animate-fadeIn">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA BOTTOM BANNER */}
        <section className="py-12 sm:py-16">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-red-950/40 via-[#0e0a0d] to-[#080709] border border-red-900/40 p-8 sm:p-14 text-center max-w-4xl mx-auto shadow-2xl">
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-4">
                Pronto para transformar sua gestão de ingressos?
              </h2>
              <p className="text-sm sm:text-base text-zinc-300 mb-8 leading-relaxed">
                Junte-se à maior comunidade VIP com o painel de comprovantes mais completo e indetectável do mercado.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <button
                  type="button"
                  onClick={() => scrollToSection('precos')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/40 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Adquirir Licença VIP</span>
                </button>
                <a
                  href={ADMIN_WHATSAPP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 border border-emerald-400/50 text-white font-black text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                  <span>Falar com Administrador</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 bg-[#040507] py-12 px-6 sm:px-12 text-zinc-400">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <GosthLogo className="w-8 h-8" />
              <span className="font-black text-white text-lg tracking-wider">VIGARISTA.VIP</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Painel VIP de comprovantes 100% editáveis, alternância de setor e dia com 1 clique e camuflagem Safari.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={ADMIN_WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-emerald-600 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="WhatsApp Administrador"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-red-600 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Entrar no Painel"
              >
                <LogIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Col 2: Links Rápidos */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Links Rápidos</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('inicio')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Início
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('promocao')}
                  className="hover:text-white transition-colors cursor-pointer text-red-400"
                >
                  Promoção Relâmpago
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('funcionalidades')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Recursos do Painel
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('precos')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Planos & Licenças
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('faq')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Perguntas Frequentes
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Suporte */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Suporte & Acesso</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a
                  href={ADMIN_WHATSAPP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-emerald-400 font-semibold"
                >
                  <span>WhatsApp Administrador</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Área de Login Safari
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsDemoModalOpen(true)}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Recursos & Demonstração
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Termos & Garantia</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => setIsTermsModalOpen(true)}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Termos de Uso
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsTermsModalOpen(true)}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Política de Privacidade
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsTermsModalOpen(true)}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Garantia de Reembolso
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="max-w-6xl mx-auto pt-6 border-t border-zinc-900/80 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-3">
          <p>© 2026 VIGARISTA VIP • Gestão de Ingressos. Todos os direitos reservados.</p>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span className="text-zinc-400">Servidores & Comprovantes 100% Online</span>
          </div>
        </div>
      </footer>

      {/* MODAL: ENTRE EM CONTATO COM UM ADMINISTRADOR */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b0c10] border border-zinc-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 relative shadow-2xl overflow-hidden">
            {/* Ambient glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedPlan(null)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mb-3 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Entre em Contato com um Administrador
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-sm mx-auto leading-relaxed">
                Para garantir sua chave VIP exclusiva e ativação imediata, fale diretamente com o suporte oficial no WhatsApp.
              </p>
            </div>

            {/* Selected Plan Details Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 mb-5 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-400 bg-red-600/15 border border-red-500/30 px-2 py-0.5 rounded">
                    Plano Selecionado
                  </span>
                  <h4 className="text-lg font-black text-white mt-1">{selectedPlan.name}</h4>
                  <p className="text-xs text-zinc-400">{selectedPlan.periodText}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-zinc-500 line-through block">{selectedPlan.regularPrice}</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono block">{selectedPlan.promoPrice}</span>
                </div>
              </div>
            </div>

            {/* Pre-written message box */}
            <div className="mb-6 space-y-2">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Mensagem que será enviada automaticamente:
              </label>
              <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800/80 text-zinc-200 text-xs sm:text-sm italic font-medium flex items-center justify-between gap-2 select-all">
                <span>"{ADMIN_WHATSAPP_MESSAGE}"</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(ADMIN_WHATSAPP_MESSAGE);
                    setCopiedPix(true);
                    setTimeout(() => setCopiedPix(false), 2000);
                  }}
                  className="px-2.5 py-1 text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg shrink-0 transition-colors cursor-pointer"
                >
                  {copiedPix ? 'Copiada!' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* WhatsApp Big Action Button */}
            <div className="space-y-3">
              <a
                href={ADMIN_WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-[0_0_35px_rgba(16,185,129,0.35)] active:scale-95 transition-all cursor-pointer text-center"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Chamar no WhatsApp (+55 31 97203-9040)</span>
              </a>

              <div className="flex items-center justify-between px-3 text-[11px] text-zinc-500">
                <span>Número: {ADMIN_WHATSAPP_DISPLAY}</span>
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Atendimento Online
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DEMO / PREVIEW MODAL */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b0c10] border border-zinc-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 relative shadow-2xl">
            <button
              type="button"
              onClick={() => setIsDemoModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-lg bg-zinc-900 border border-zinc-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-2xl bg-red-600/10 border border-red-600/30 text-red-500 mb-3">
                <Ticket className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white">Recursos do Painel VIGARISTA</h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Conheça os diferenciais técnicos e visuais do nosso ecossistema VIP.
              </p>
            </div>

            <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-6 space-y-4 mb-6 text-sm text-zinc-300">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="font-bold text-white">Comprovantes 100% Editáveis:</span>
                <span className="text-zinc-400">Edição livre de nomes, CPFs, valores de taxas e número do pedido</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-bold text-white">Alternância de Setor e Dia com 1 Toque:</span>
                <span className="text-zinc-400">Troca instantânea ao tocar no setor (Pista, Cadeira, VIP) e na data</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="font-bold text-white">Barra de Navegação Safari Original:</span>
                <span className="text-zinc-400">Barra flutuante iOS com controle de zoom (aA) e favoritos nativos</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span className="font-bold text-white">Camuflagem Safari & Bypass:</span>
                <span className="text-zinc-400">Bypass seguro e proteção máxima contra inspeções</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDemoModalOpen(false);
                  scrollToSection('precos');
                }}
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-600/30"
              >
                <Ticket className="w-4 h-4" />
                <span>Ver Tabela de Preços & Planos</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TERMOS MODAL */}
      {isTermsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b0c10] border border-zinc-800 rounded-3xl w-full max-w-lg p-6 sm:p-7 relative shadow-2xl">
            <button
              type="button"
              onClick={() => setIsTermsModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-lg bg-zinc-900 border border-zinc-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-white mb-4">Termos de Uso & Garantia</h3>
            <div className="text-xs text-zinc-300 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              <p>
                <strong>1. Licenciamento VIP:</strong> Cada chave de acesso emitida dá direito ao uso ilimitado de todas as funções do painel durante o período contratado.
              </p>
              <p>
                <strong>2. Suporte Contínuo:</strong> Oferecemos assistência técnica dedicada através do nosso WhatsApp Oficial do Administrador para configuração e uso das ferramentas.
              </p>
              <p>
                <strong>3. Garantia e Liberação:</strong> A liberação da chave é feita instantaneamente após o pagamento Pix.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsTermsModalOpen(false)}
              className="mt-6 w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold text-xs cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const SalesLandingView = Teste1GosthLandingView;
