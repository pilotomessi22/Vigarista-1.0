export type EventCategory = 'experiencias' | 'esportes' | 'casas' | 'shows' | 'festivais';

export interface EventItem {
  id: string;
  title: string;
  category: EventCategory;
  categoryLabel?: string;
  subtitle?: string;
  location: string;
  city: string;
  date: string;
  priceStart: number;
  imageUrl: string;
  badge?: string;
  topBadge?: string;
  isSoldOut?: boolean;
}

export interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  dateInfo?: string;
  tourName?: string;
  buttonText: string;
  imageUrl: string;
  gradient: string;
  eventId?: string;
}

export interface OrderTicketItem {
  sector: string;
  ticketPrice: number;
  attendeeName: string;
  attendeeCategory: string;
  attendeeCpf: string;
}

export interface OrderItem {
  orderNumber: string;
  paymentNumber: string;
  eventName: string;
  location: string;
  sector: string;
  ticketPrice: number;
  serviceFee: number;
  insuranceFee?: number;
  totalPrice: number;
  attendeeName: string;
  attendeeCategory: string;
  attendeeCpf: string;
  paymentMethod: 'pix' | 'credit_card' | string;
  status: 'Aprovado' | 'Pendente' | 'Cancelado' | string;
  orderDate: string;
  quentroEmail?: string;
  items?: OrderTicketItem[];
}

export type ActiveView = 'safari-home' | 'home' | 'order-details' | 'checkout-loja' | 'vendas' | 'quentro-ticket' | 'quentro-email' | 'quentrov2';
