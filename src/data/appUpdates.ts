export interface AppUpdateItem {
  id: string;
  version: string;
  date: string;
  title: string;
  badge?: string;
  description: string;
  details: string[];
}

export const APP_UPDATES: AppUpdateItem[] = [
  {
    id: 'update-v1.5.0',
    version: 'v1.5.0',
    date: '14 de Setembro',
    title: 'Diagnóstico do Site & Notificações de Novidades',
    badge: 'NOVO',
    description: 'Sistema completo de diagnóstico e análise do site via comando "analise" e notificações em tempo real.',
    details: [
      '🔍 Menu de Análise e Diagnóstico: escaneamento de funções, cache e reparo automático via comando "analise".',
      '🔔 Notificação de novidades na tela inicial com duração mínima garantida e link para ver detalhes.',
      '⚡ Botão de acesso rápido e teste da notificação disponível nos menus e atalhos.',
      '🎟️ Otimização no carregamento de pôsteres, ingressos e dados persistidos.',
    ],
  },
  {
    id: 'update-v1.4.0',
    version: 'v1.4.0',
    date: '14 de Setembro',
    title: 'Modo Preguiça & Automações no App',
    badge: 'DESTAQUE',
    description: 'Adicionada a automação de preenchimento rápido em lote e avisos automáticos no app.',
    details: [
      '⚡ Modo Preguiça: replique Nome e CPF para todos os pôsteres ou selecione individualmente com 1 clique.',
      '🔔 Notificação na tela inicial de novas atualizações com duração mínima garantida e link para ver detalhes.',
      '🎟️ Edição individual de múltiplos ingressos por pôster (ex: Pôster 3 com 2 ingressos independentes).',
      '🔒 Confirmação manual por botão "Confirmar e Entrar" na tela de PIN.',
      '🏷️ Identidade atualizada oficialmente para "PainelV1 by messin".',
    ],
  },
  {
    id: 'update-v1.3.0',
    version: 'v1.3.0',
    date: '13 de Setembro',
    title: 'Edição Avançada & Modo Rápido',
    badge: 'ESTABILIDADE',
    description: 'Separada a edição básica com botão "mostrar mais opções" para simplificar o preenchimento.',
    details: [
      'Visualização simplificada padrão com Nome, CPF e Setor.',
      'Botão "Mostrar mais opções de edição" para acessar campos completos do pedido.',
      'Persistência individual e independente entre os 4 pôsteres.',
    ],
  },
];

export const LATEST_UPDATE_ID = APP_UPDATES[0].id;
