export interface Ticket {
  id: string;
  eventId: string;
  category: string; // 'Inteira' | 'Meia'
  sector: string; // 'Cadeira Superior'
  section: string; // 'CADEIRA SUPERIOR'
  row: string; // 'Não numerado' | string
  seat: string; // '-' | string
  gate: string; // 'Portão 1'
  titularName: string; // 'Fernanda Lucena'
  titularCpf?: string; // '662.266.173-14'
  taxaText?: string; // 'ESTUDA: Meia-Entrada - R$ 490'
  categoryBanner?: string; // 'MEIA-ENTRADA'
  hashtagText?: string; // '#OAoVivoÉAgora'
  qrData: string;
  dateText?: string; // 'Quarta-feira 28/10/2026'
  openingTime?: string; // '16:00'
  startTime?: string; // '20:00'
  bannerType?: 'ticketmaster' | 'custom';
  bannerImage?: string;
  transferredTo?: string;
  transferredAt?: string;
}

export interface ConcertEvent {
  id: string;
  title: string; // 'BTS WORLD TOUR ARIRANG'
  venue: string; // 'MorumBis'
  city: string; // 'São Paulo, SP'
  dateFormatted: string; // 'Quarta-feira 28 20:00hs'
  shortDate: string; // '28/10/2026'
  headerSubtitle?: string; // '28/10/2026 - MorumBis'
  dayOfWeek: string; // 'Quarta-feira'
  dayNumber: string; // '28'
  monthYear: string; // 'Outubro 2026'
  fullDate: string; // 'Quarta-feira, 28/10/2026 · 20:00hs'
  coverImage?: string;
  tickets: Ticket[];
  status: 'upcoming' | 'past';
}

export interface UserProfile {
  name: string;
  email: string;
  country?: string;
  birthDate?: string;
  quentroId: string;
  pinEnabled: boolean;
  pinCode: string;
}

export type ActiveScreen =
  | 'home'
  | 'ticket_detail'
  | 'select_transfer'
  | 'transfer_form'
  | 'ingressos_list'
  | 'account';
