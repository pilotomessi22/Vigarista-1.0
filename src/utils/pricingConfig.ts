// Pricing & Renewal Configuration with PIX Payment and Support Channels
// Editable default values that can be customized in localStorage

export interface PlanOption {
  id: string;
  name: string;
  durationDays: number;
  durationLabel: string;
  price: string;
  originalPrice?: string;
  isPopular?: boolean;
  features: string[];
}

export interface PricingSettings {
  pixKey: string;
  pixKeyType: 'email' | 'cpf' | 'telefone' | 'aleatoria';
  pixReceiverName: string;
  pixCity: string;
  whatsappNumber: string;
  whatsappMessage: string;
  telegramUser: string;
  instagramUser: string;
  plans: PlanOption[];
}

const PRICING_STORAGE_KEY = 'vigarista_pricing_config_v1';

export const DEFAULT_PRICING_CONFIG: PricingSettings = {
  pixKey: 'pix.vigarista7@pagamentos.com.br',
  pixKeyType: 'email',
  pixReceiverName: 'VIGARISTA LIDERANÇA 7️⃣',
  pixCity: 'São Paulo - SP',
  whatsappNumber: '5531972039040',
  whatsappMessage: 'Quero garantir meu acesso exclusivo do painel vigarista',
  telegramUser: 'vigarista_suporte',
  instagramUser: '@vigarista.lideranca',
  plans: [
    {
      id: 'monthly',
      name: 'Acesso Mensal VIP (30 Dias)',
      durationDays: 30,
      durationLabel: '30 Dias',
      price: 'R$ 649,99',
      originalPrice: 'R$ 899,90',
      isPopular: true,
      features: ['Mais Vendido ⭐', 'Acesso completo 30 dias', 'Suporte VIP direto 24/7', 'Sem limites de uso'],
    },
    {
      id: 'vitalicio',
      name: 'Acesso Vitalício',
      durationDays: 36500,
      durationLabel: 'Vitalício',
      price: 'R$ 1.999,99',
      originalPrice: 'R$ 2.999,90',
      features: ['Melhor Custo-Benefício 🏆', 'Acesso permanente sem mensalidades', 'Todas as atualizações inclusas', 'Canal VIP Exclusivo'],
    },
  ],
};

export const getPricingConfig = (): PricingSettings => {
  try {
    const raw = localStorage.getItem(PRICING_STORAGE_KEY);
    if (!raw) return DEFAULT_PRICING_CONFIG;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PRICING_CONFIG;
  }
};

export const savePricingConfig = (config: PricingSettings): void => {
  try {
    localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(config));
  } catch {}
};
