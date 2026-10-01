import {
  Client,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ChannelType,
  PermissionsBitField,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  ButtonInteraction,
  StringSelectMenuInteraction,
  Guild,
  TextChannel,
  CategoryChannel,
  GuildMember,
  ActivityType,
} from 'discord.js';

// DISCORD BOT TOKEN
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || '';

// APP URL & INFO
const APP_URL = process.env.APP_URL || 'https://ais-pre-bq3yo2k7lfdddwipepbewz-462231534956.us-east1.run.app';
const PIX_KEY = 'pix.vigarista7@pagamentos.com.br';
const PIX_RECEIVER = 'VIGARISTA LIDERANÇA 7️⃣';
const PIX_CITY = 'São Paulo - SP';
const WHATSAPP_CONTACT = '5511999997777';

// CLIENT INITIALIZATION
export const discordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember],
});

// Shard & Global Error Handlers to prevent unhandled RangeError and crashes
discordClient.on('error', (error) => {
  console.warn('[VIGARISTA BOT] Evento de erro capturado no cliente Discord:', error?.message || error);
});

discordClient.on('shardError', (error, shardId) => {
  console.warn(`[VIGARISTA BOT] Erro no Shard ${shardId}:`, error?.message || error);
});

discordClient.on('shardDisconnect', (event, shardId) => {
  console.warn(`[VIGARISTA BOT] Shard ${shardId} desconectou (código: ${event.code}).`);
});

discordClient.on('shardReconnecting', (shardId) => {
  console.log(`[VIGARISTA BOT] Shard ${shardId} tentando reconectar...`);
});

// Universal key generator matching the app's algorithm
function generateUniversalDiscordKey(days: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randA = '';
  let randB = '';
  for (let i = 0; i < 4; i++) {
    randA += chars.charAt(Math.floor(Math.random() * chars.length));
    randB += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  let prefix = 'VIGARISTA';
  if (days === 1) prefix = 'VIGARISTA-D1';
  else if (days === 7) prefix = 'VIGARISTA-W7';
  else if (days === 30) prefix = 'VIGARISTA-M30';
  else if (days === 90) prefix = 'VIGARISTA-Q90';
  else if (days >= 365) prefix = 'VIGARISTA-Y365';
  else prefix = `VIGARISTA-D${days}`;

  return `${prefix}-${randA}-${randB}-2026`;
}

// Slash Commands definition
const commands = [
  new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Configura e ajusta todos os canais, permissões e cargos do servidor')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder()
    .setName('gerarkey')
    .setDescription('Gera uma chave oficial do Painel Vigarista com duração em dias')
    .addIntegerOption((opt) =>
      opt
        .setName('dias')
        .setDescription('Quantidade de dias de validade (Ex: 1, 7, 30, 90, 365)')
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName('cliente')
        .setDescription('Nome ou menção do cliente (opcional)')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  new SlashCommandBuilder()
    .setName('planos')
    .setDescription('Mostra a tabela completa de planos, preços e chave PIX'),

  new SlashCommandBuilder()
    .setName('painel')
    .setDescription('Envia o link de acesso direto e informações do Painel Vigarista'),

  new SlashCommandBuilder()
    .setName('limpar')
    .setDescription('Limpa mensagens do canal atual')
    .addIntegerOption((opt) =>
      opt
        .setName('quantidade')
        .setDescription('Número de mensagens para apagar (1 a 100)')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
];

// SETUP COMPLETE GUILD FUNCTION
export async function setupEntireGuild(guild: Guild) {
  console.log(`[VIGARISTA BOT] Iniciando configuração avançada de cargos e canais em: ${guild.name} (${guild.id})`);

  // Fetch all roles & channels to cache
  await guild.roles.fetch();
  await guild.channels.fetch();

  // 1. CREATE OR ADJUST ROLES IN EXACT HIERARCHY
  // 1.1 Liderança (Admin)
  let roleAdmin = guild.roles.cache.find((r) => r.name.includes('Liderança'));
  if (!roleAdmin) {
    roleAdmin = await guild.roles.create({
      name: '👑 Liderança 7️⃣',
      color: 0x00e5ff, // Neon Cyan
      hoist: true,
      permissions: [PermissionFlagsBits.Administrator],
    });
  }

  // 1.2 Moderador (Staff com permissão de moderar, apagar mensagens, gerenciar tickets e ver canais internos)
  let roleModerador = guild.roles.cache.find((r) => r.name.includes('Moderador'));
  if (!roleModerador) {
    roleModerador = await guild.roles.create({
      name: '🛡️ Moderador',
      color: 0x8b5cf6, // Royal Violet
      hoist: true,
      permissions: [
        PermissionFlagsBits.ViewAuditLog,
        PermissionFlagsBits.ManageMessages,
        PermissionFlagsBits.KickMembers,
        PermissionFlagsBits.ModerateMembers,
        PermissionFlagsBits.MuteMembers,
        PermissionFlagsBits.DeafenMembers,
        PermissionFlagsBits.MoveMembers,
        PermissionFlagsBits.ManageNicknames,
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageThreads,
      ],
    });
  } else {
    // Update permissions to ensure Moderator has the right powers
    await roleModerador.edit({
      permissions: [
        PermissionFlagsBits.ViewAuditLog,
        PermissionFlagsBits.ManageMessages,
        PermissionFlagsBits.KickMembers,
        PermissionFlagsBits.ModerateMembers,
        PermissionFlagsBits.MuteMembers,
        PermissionFlagsBits.DeafenMembers,
        PermissionFlagsBits.MoveMembers,
        PermissionFlagsBits.ManageNicknames,
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageThreads,
      ],
    });
  }

  // 1.3 VIP Permanente
  let roleVipPerm = guild.roles.cache.find((r) => r.name.includes('VIP Permanente'));
  if (!roleVipPerm) {
    roleVipPerm = await guild.roles.create({
      name: '💎 VIP Permanente',
      color: 0xa855f7,
      hoist: true,
    });
  }

  // 1.4 Cliente VIP (Mensal)
  let roleClienteVip = guild.roles.cache.find((r) => r.name.includes('Cliente VIP'));
  if (!roleClienteVip) {
    roleClienteVip = await guild.roles.create({
      name: '⭐ Cliente VIP',
      color: 0x00e5bb,
      hoist: true,
    });
  }

  // 1.5 Licença Ativa
  let roleLicencaAtiva = guild.roles.cache.find((r) => r.name.includes('Licença Ativa'));
  if (!roleLicencaAtiva) {
    roleLicencaAtiva = await guild.roles.create({
      name: '🔑 Licença Ativa',
      color: 0x3b82f6,
      hoist: true,
    });
  }

  // 1.6 Membro (Cargo comum)
  let roleMembro = guild.roles.cache.find((r) => r.name.includes('Membro'));
  if (!roleMembro) {
    roleMembro = await guild.roles.create({
      name: '👥 Membro',
      color: 0x94a3b8,
      hoist: false,
    });
  }

  const everyoneRole = guild.roles.everyone;

  // Helper to find or create category and update permission overwrites
  async function getOrCreateCategory(name: string, permissionOverwrites: any[]) {
    let existing = guild.channels.cache.find(
      (c) => c.type === ChannelType.GuildCategory && c.name.toLowerCase() === name.toLowerCase()
    ) as CategoryChannel;

    if (!existing) {
      existing = await guild.channels.create({
        name,
        type: ChannelType.GuildCategory,
        permissionOverwrites,
      });
    } else {
      await existing.permissionOverwrites.set(permissionOverwrites);
    }
    return existing;
  }

  // Helper to find or create text channel and update permission overwrites
  async function getOrCreateTextChannel(
    name: string,
    parent: CategoryChannel,
    topic?: string,
    permissionOverwrites?: any[]
  ) {
    let existing = guild.channels.cache.find(
      (c) => c.type === ChannelType.GuildText && c.name.toLowerCase() === name.toLowerCase()
    ) as TextChannel;

    if (!existing) {
      existing = await guild.channels.create({
        name,
        type: ChannelType.GuildText,
        parent: parent.id,
        topic,
        permissionOverwrites,
      });
    } else {
      if (existing.parentId !== parent.id) {
        await existing.setParent(parent.id, { lockPermissions: false });
      }
      if (permissionOverwrites) {
        await existing.permissionOverwrites.set(permissionOverwrites);
      }
    }
    return existing;
  }

  // ==========================================
  // CATEGORY 1: 📌 ── INFORMAÇÕES ── (READ-ONLY FOR MEMBERS)
  // ==========================================
  const infoOverwrites = [
    {
      id: everyoneRole.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
      deny: [
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.SendMessagesInThreads,
        PermissionFlagsBits.CreatePublicThreads,
        PermissionFlagsBits.CreatePrivateThreads,
        PermissionFlagsBits.AddReactions,
      ],
    },
    {
      id: roleMembro.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
      deny: [
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.SendMessagesInThreads,
        PermissionFlagsBits.CreatePublicThreads,
        PermissionFlagsBits.CreatePrivateThreads,
        PermissionFlagsBits.AddReactions,
      ],
    },
    {
      id: roleModerador.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ManageMessages,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    },
    {
      id: roleAdmin.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.Administrator,
      ],
    },
  ];

  const catInfo = await getOrCreateCategory('📌 ── INFORMAÇÕES ──', infoOverwrites);
  const chRegras = await getOrCreateTextChannel('📜・regras', catInfo, 'Regulamento e Termos de Uso do Painel Vigarista', infoOverwrites);
  const chAnuncios = await getOrCreateTextChannel('📢・anúncios', catInfo, 'Atualizações, novidades e comunicados oficiais', infoOverwrites);
  const chPlanos = await getOrCreateTextChannel('💳・planos-pix', catInfo, 'Tabela oficial de preços e pagamento via PIX', infoOverwrites);
  const chAcesso = await getOrCreateTextChannel('🌐・acesso-painel', catInfo, 'Link oficial de acesso ao app', infoOverwrites);

  // ==========================================
  // CATEGORY 2: 🔑 ── LICENCIAMENTO ── (READ-ONLY FOR MEMBERS)
  // ==========================================
  const licOverwrites = [
    {
      id: everyoneRole.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
      deny: [
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.SendMessagesInThreads,
        PermissionFlagsBits.CreatePublicThreads,
        PermissionFlagsBits.CreatePrivateThreads,
        PermissionFlagsBits.AddReactions,
      ],
    },
    {
      id: roleMembro.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
      deny: [
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.SendMessagesInThreads,
        PermissionFlagsBits.CreatePublicThreads,
        PermissionFlagsBits.CreatePrivateThreads,
        PermissionFlagsBits.AddReactions,
      ],
    },
    {
      id: roleModerador.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ManageMessages,
      ],
    },
    {
      id: roleAdmin.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
    },
  ];

  const catLic = await getOrCreateCategory('🔑 ── LICENCIAMENTO ──', licOverwrites);
  const chResgatar = await getOrCreateTextChannel('🔑・resgatar-key', catLic, 'Instruções para resgatar sua key no app', licOverwrites);
  const chStatus = await getOrCreateTextChannel('⚡・status-sistema', catLic, 'Status operacional do sistema', licOverwrites);

  // ==========================================
  // CATEGORY 3: 🎫 ── ATENDIMENTO ── (SELECT MENU ONLY, NO CHAT SPAM)
  // ==========================================
  const atendimentoOverwrites = [
    {
      id: everyoneRole.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
      deny: [
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.SendMessagesInThreads,
        PermissionFlagsBits.CreatePublicThreads,
        PermissionFlagsBits.CreatePrivateThreads,
      ],
    },
    {
      id: roleMembro.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
      deny: [
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.SendMessagesInThreads,
        PermissionFlagsBits.CreatePublicThreads,
        PermissionFlagsBits.CreatePrivateThreads,
      ],
    },
    {
      id: roleModerador.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages],
    },
    {
      id: roleAdmin.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
    },
  ];

  const catSuporte = await getOrCreateCategory('🎫 ── ATENDIMENTO ──', atendimentoOverwrites);
  const chTicket = await getOrCreateTextChannel('🎫・abrir-ticket', catSuporte, 'Abra um ticket privado para envio de comprovante ou suporte', atendimentoOverwrites);

  // ==========================================
  // CATEGORY 4: 💬 ── COMUNIDADE ── (MEMBERS CAN TALK FREELY HERE)
  // ==========================================
  const comunidadeOverwrites = [
    {
      id: everyoneRole.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AddReactions,
      ],
    },
    {
      id: roleMembro.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AddReactions,
      ],
    },
    {
      id: roleModerador.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ManageMessages,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.EmbedLinks,
      ],
    },
    {
      id: roleAdmin.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
    },
  ];

  const catComunidade = await getOrCreateCategory('💬 ── COMUNIDADE ──', comunidadeOverwrites);
  await getOrCreateTextChannel('💬・chat-geral', catComunidade, 'Bate-papo da comunidade Painel Vigarista', comunidadeOverwrites);
  await getOrCreateTextChannel('💡・sugestões', catComunidade, 'Envie suas ideias, feedbacks e sugestões para o painel', comunidadeOverwrites);
  await getOrCreateTextChannel('🤖・comandos-bot', catComunidade, 'Canal para testar comandos do bot (/planos, /painel)', comunidadeOverwrites);

  // ==========================================
  // CATEGORY 5: 👑 ── ÁREA VIP ── (VIPS, MODERATORS & ADMINS ONLY)
  // ==========================================
  const vipOverwrites = [
    {
      id: everyoneRole.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: roleMembro.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: roleClienteVip.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    },
    {
      id: roleVipPerm.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    },
    {
      id: roleLicencaAtiva.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    },
    {
      id: roleModerador.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ManageMessages,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.EmbedLinks,
      ],
    },
    {
      id: roleAdmin.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.Administrator],
    },
  ];

  const catVip = await getOrCreateCategory('👑 ── ÁREA VIP ──', vipOverwrites);
  await getOrCreateTextChannel('💬・chat-vip', catVip, 'Chat exclusivo para clientes com licença ativa', vipOverwrites);
  await getOrCreateTextChannel('🎁・downloads-links', catVip, 'Links e atualizações exclusivas para VIPs', vipOverwrites);

  // ==========================================
  // CATEGORY 6: 🔒 ── STAFF & LOGS ── (MODERATOR & ADMIN ONLY)
  // ==========================================
  const staffOverwrites = [
    {
      id: everyoneRole.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: roleMembro.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: roleClienteVip.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: roleVipPerm.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: roleLicencaAtiva.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: roleModerador.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageMessages,
      ],
    },
    {
      id: roleAdmin.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.Administrator],
    },
  ];

  const catStaff = await getOrCreateCategory('🔒 ── STAFF & LOGS ──', staffOverwrites);
  await getOrCreateTextChannel('🛡️・chat-staff', catStaff, 'Chat exclusivo da equipe de moderação e liderança', staffOverwrites);
  await getOrCreateTextChannel('🔒・logs-vendas', catStaff, 'Registro de vendas e comprovantes', staffOverwrites);
  await getOrCreateTextChannel('📊・logs-chaves', catStaff, 'Registro de chaves geradas e resgatadas', staffOverwrites);
  await getOrCreateTextChannel('🤖・logs-tickets', catStaff, 'Histórico de atendimentos', staffOverwrites);

  // POPULATE CHANNELS WITH HIGH-END EMBEDS & BUTTONS
  console.log(`[VIGARISTA BOT] Enviando embeds e painéis informativos...`);

  // 1. REGRAS
  const msgsRegras = await chRegras.messages.fetch({ limit: 5 });
  if (msgsRegras.size === 0) {
    const embedRegras = new EmbedBuilder()
      .setColor(0x00e5ff)
      .setTitle('📜 REGRAS & TERMOS DE USO • PAINEL VIGARISTA')
      .setDescription(
        `Bem-vindo à comunidade oficial do **Painel Vigarista**! Para mantermos a ordem e segurança de todos os membros, leia atentamente as diretrizes:\n\n` +
          `**1. Respeito Mútuo**\nProibido qualquer tipo de ofensa, desrespeito ou discurso de ódio nos canais.\n\n` +
          `**2. Compartilhamento de Licenças**\nSua **Key** e conta são de uso pessoal e intransferível. O compartilhamento indevido resultará na revogação imediata da licença sem direito a reembolso.\n\n` +
          `**3. Pagamentos e Comprovantes**\nAceitamos **exclusivamente pagamentos via PIX**. Todos os comprovantes devem ser enviados no canal <#${chTicket.id}> para validação e entrega da key.\n\n` +
          `**4. Suporte Oficial**\nNunca envie comprovantes ou mensagens no privado de terceiros. Use somente o canal de tickets oficial ou nossos moderadores verificados com o cargo <@&${roleModerador.id}>.\n\n` +
          `**5. Segurança**\nNossa equipe nunca pedirá a sua senha de acesso.`
      )
      .setFooter({ text: 'Painel VIGARISTA • Sistema de Segurança 2026' })
      .setTimestamp();

    await chRegras.send({ embeds: [embedRegras] });
  }

  // 2. ANÚNCIOS
  const msgsAnuncios = await chAnuncios.messages.fetch({ limit: 5 });
  if (msgsAnuncios.size === 0) {
    const embedAnuncios = new EmbedBuilder()
      .setColor(0x00e5bb)
      .setTitle('📢 SEJA BEM-VINDO AO PAINEL VIGARISTA')
      .setDescription(
        `🚀 **O Sistema Definitivo de Licenciamento & Acesso Rápido**\n\n` +
          `O **Painel Vigarista** oferece a mais alta tecnologia em automação e gerenciamento com segurança de ponta a ponta.\n\n` +
          `🔹 **Como começar?**\n` +
          `1. Confira nossa tabela no canal <#${chPlanos.id}>\n` +
          `2. Realize o PIX e abra um ticket com a categoria correspondente em <#${chTicket.id}>\n` +
          `3. Receba sua **Key Exclusiva** e acesse o aplicativo em <#${chAcesso.id}>\n\n` +
          `⚡ **Suporte 24/7 Ativo** para todos os assinantes!`
      )
      .setImage('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80')
      .setFooter({ text: 'Liderança Vigarista • Versão 7.0' })
      .setTimestamp();

    await chAnuncios.send({ embeds: [embedAnuncios] });
  }

  // 3. PLANOS & PIX
  const msgsPlanos = await chPlanos.messages.fetch({ limit: 5 });
  if (msgsPlanos.size === 0) {
    const embedPlanos = new EmbedBuilder()
      .setColor(0x00e5ff)
      .setTitle('💳 TABELA OFICIAL DE PLANOS & VALORES • VIGARISTA')
      .setDescription(
        `Escolha o plano ideal para você e ative seu acesso agora mesmo com liberação rápida!\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `⚡ **PLANO DIÁRIO (24 Horas)**\n` +
          `💵 **Valor:** \`R$ 15,00\`\n` +
          `✨ *Acesso total 24h • Liberação imediata*\n\n` +
          `⚡ **PLANO SEMANAL (7 Dias)**\n` +
          `💵 **Valor:** \`R$ 35,00\` ~~(R$ 50,00)~~\n` +
          `✨ *Acesso total 7 dias • Atualizações automáticas*\n\n` +
          `⭐ **PLANO MENSAL VIP (30 Dias) - MAIS VENDIDO**\n` +
          `💵 **Valor:** \`R$ 80,00\` ~~(R$ 120,00)~~\n` +
          `✨ *Acesso completo 30 dias • Suporte VIP 24/7 • Cargo VIP no Discord*\n\n` +
          `⚡ **PLANO TRIMESTRAL (90 Dias)**\n` +
          `💵 **Valor:** \`R$ 190,00\` ~~(R$ 240,00)~~\n` +
          `✨ *Economia de 30% • Suporte prioritário*\n\n` +
          `🏆 **PLANO ANUAL / PERMANENTE (365 Dias)**\n` +
          `💵 **Valor:** \`R$ 399,00\` ~~(R$ 600,00)~~\n` +
          `✨ *Melhor Custo-Benefício • Acesso 1 ano • Cargo VIP Permanente*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `🔑 **DADOS PARA PAGAMENTO (APENAS PIX):**\n` +
          `• **Chave PIX:** \`${PIX_KEY}\`\n` +
          `• **Beneficiário:** \`${PIX_RECEIVER}\`\n` +
          `• **Cidade:** \`${PIX_CITY}\`\n\n` +
          `📌 *Após o pagamento, abra um ticket no canal <#${chTicket.id}> para receber sua Key!*`
      )
      .setFooter({ text: 'Pagamento 100% Seguro via PIX • Entrega Imediata' })
      .setTimestamp();

    const rowPlanos = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('btn_copy_pix')
        .setLabel('📋 Copiar Chave PIX')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setLabel('🌐 Acessar Painel Web')
        .setStyle(ButtonStyle.Link)
        .setURL(APP_URL)
    );

    await chPlanos.send({ embeds: [embedPlanos], components: [rowPlanos] });
  }

  // 4. ACESSO PAINEL
  const msgsAcesso = await chAcesso.messages.fetch({ limit: 5 });
  if (msgsAcesso.size === 0) {
    const embedAcesso = new EmbedBuilder()
      .setColor(0x3b82f6)
      .setTitle('🌐 LINK OFICIAL DO PAINEL VIGARISTA')
      .setDescription(
        `Acesse o aplicativo diretamente pelo seu navegador no computador ou celular:\n\n` +
          `🔗 **URL do Aplicativo:**\n` +
          `[👉 Clique Aqui para Abrir o Painel Vigarista](${APP_URL})\n\n` +
          `📱 **Dica para Celular (iOS / Android):**\n` +
          `Abra o link no Safari/Chrome e toque em *"Adicionar à Tela de Início"* para instalar como um aplicativo nativo!`
      )
      .setFooter({ text: 'Compatível com Celular e Computador' });

    const rowAcesso = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel('🚀 Abrir Painel Vigarista')
        .setStyle(ButtonStyle.Link)
        .setURL(APP_URL)
    );

    await chAcesso.send({ embeds: [embedAcesso], components: [rowAcesso] });
  }

  // 5. RESGATAR KEY
  const msgsResgatar = await chResgatar.messages.fetch({ limit: 5 });
  if (msgsResgatar.size === 0) {
    const embedResgatar = new EmbedBuilder()
      .setColor(0xa855f7)
      .setTitle('🔑 COMO RESGATAR SUA KEY NO APLICATIVO')
      .setDescription(
        `Já comprou sua licença e recebeu sua chave no formato \`VIGARISTA-XXXX-XXXX-2026\`? Siga os passos:\n\n` +
          `1️⃣ Abra o aplicativo pelo link no canal <#${chAcesso.id}>\n` +
          `2️⃣ Na tela do **VIGARISTA**, clique na aba **"Cadastre-se"** (ou "Renovar")\n` +
          `3️⃣ Digite o **Usuário** e **Senha** que desejar\n` +
          `4️⃣ Cole a sua **Key** no campo correspondente\n` +
          `5️⃣ Clique em **"CRIAR CONTA E ACESSAR"**\n\n` +
          `✅ Seu acesso será liberado instantaneamente!`
      )
      .setFooter({ text: 'Sistema de Chaves Universais Vigarista' });

    await chResgatar.send({ embeds: [embedResgatar] });
  }

  // 6. ABRIR TICKET (EXACT DESIGN WITH SELECT MENU)
  const msgsTicket = await chTicket.messages.fetch({ limit: 5 });
  if (msgsTicket.size === 0) {
    const embedTicket = new EmbedBuilder()
      .setColor(0x00a8ff)
      .setAuthor({
        name: '🎫 Sistema de atendimento',
      })
      .setDescription(
        `**Escolha uma opção** com base no assunto que você deseja discutir com um membro da equipe através de um ticket:\n\n` +
          `┃ **Observações:**\n` +
          `• Por favor, tenha em mente que cada tipo de ticket é específico para lidar com o assunto selecionado.\n` +
          `• Evite abrir um ticket sem um motivo válido, pois isso pode resultar em punições.\n\n`
      )
      .setImage('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80')
      .setFooter({ text: 'PAINEL VIGARISTA #7.0 © Todos os direitos reservados' });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_ticket_category')
      .setPlaceholder('Selecione uma categoria')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Comprovante PIX & Vendas')
          .setDescription('Envie o comprovante para liberação imediata da sua Key!')
          .setValue('ticket_pix')
          .setEmoji('💳'),

        new StringSelectMenuOptionBuilder()
          .setLabel('Suporte')
          .setDescription('Estamos aqui para resolver problemas e dúvidas!')
          .setValue('ticket_suporte')
          .setEmoji('🛠️'),

        new StringSelectMenuOptionBuilder()
          .setLabel('Resgate ou Renovação')
          .setDescription('Ajuda para ativar ou renovar sua chave no app.')
          .setValue('ticket_key')
          .setEmoji('🔑'),

        new StringSelectMenuOptionBuilder()
          .setLabel('Denúncias')
          .setDescription('Se vir algo errado, denuncie e tomaremos providências.')
          .setValue('ticket_denuncia')
          .setEmoji('🚨'),

        new StringSelectMenuOptionBuilder()
          .setLabel('Parcerias & Revendas')
          .setDescription('Tire dúvidas sobre parcerias e revendas oficiais.')
          .setValue('ticket_parceria')
          .setEmoji('💎')
      );

    const rowSelect = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    await chTicket.send({ embeds: [embedTicket], components: [rowSelect] });
  }

  // 7. STATUS DO SISTEMA
  const msgsStatus = await chStatus.messages.fetch({ limit: 5 });
  if (msgsStatus.size === 0) {
    const embedStatus = new EmbedBuilder()
      .setColor(0x10b981)
      .setTitle('⚡ STATUS OPERACIONAL DO SISTEMA')
      .setDescription(
        `🟢 **Servidor Central:** \`ONLINE (100%)\`\n` +
          `🟢 **Gerador de Licenças:** \`OPERACIONAL\`\n` +
          `🟢 **Validador de Keys:** \`ATIVO\`\n` +
          `🟢 **Latência Média:** \`14ms\`\n` +
          `🟢 **Versão:** \`Vigarista 7.0 Ultra\`\n\n` +
          `*Todos os módulos e robôs estão operando normalmente sem instabilidade.*`
      )
      .setTimestamp();

    await chStatus.send({ embeds: [embedStatus] });
  }

  // AUTO-ASSIGN "Membro" to any members without it
  try {
    const allMembers = await guild.members.fetch();
    for (const [, member] of allMembers) {
      if (!member.user.bot && member.roles.cache.size <= 1) {
        await member.roles.add(roleMembro);
      }
    }
  } catch (err) {
    console.error('Erro ao auto-atribuir cargo de membro:', err);
  }

  console.log(`[VIGARISTA BOT] Configuração avançada de cargos e canais concluída com sucesso!`);
}

// REGISTER SLASH COMMANDS
async function registerSlashCommands(clientId: string, token: string) {
  if (!token || token.length < 20) return;
  try {
    const rest = new REST({ version: '10' }).setToken(token);
    console.log('[VIGARISTA BOT] Registrando comandos Slash globais...');
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log('[VIGARISTA BOT] Comandos Slash registrados com sucesso!');
  } catch (err: any) {
    console.warn('[VIGARISTA BOT] Aviso ao registrar comandos Slash:', err?.message || err);
  }
}

// BOT EVENTS
discordClient.once('ready', async () => {
  console.log(`\n======================================================`);
  console.log(`🤖 BOT VIGARISTA ONLINE: ${discordClient.user?.tag}`);
  console.log(`======================================================\n`);

  if (discordClient.user && BOT_TOKEN) {
    await registerSlashCommands(discordClient.user.id, BOT_TOKEN);
  }

  try {
    discordClient.user?.setPresence({
      activities: [
        {
          name: 'na rlk do messin 💸 🤑 7️⃣',
          type: ActivityType.Custom,
          state: 'na rlk do messin 💸 🤑 💰 7️⃣',
        },
      ],
      status: 'online',
    });
  } catch (err) {
    console.warn('[VIGARISTA BOT] Aviso ao definir presença:', err);
  }

  try {
    // Safely iterate through already cached guilds to prevent unauthenticated REST calls
    const guilds = discordClient.guilds.cache;
    console.log(`[VIGARISTA BOT] Servidores conectados: ${guilds.size}`);
    for (const [, guild] of guilds) {
      try {
        await setupEntireGuild(guild);
      } catch (gErr) {
        console.warn(`[VIGARISTA BOT] Aviso ao configurar servidor ${guild.name}:`, gErr);
      }
    }
  } catch (err) {
    console.warn('[VIGARISTA BOT] Aviso ao carregar servidores na inicialização:', err);
  }
});

// AUTO-SETUP WHEN BOT JOINS A NEW SERVER
discordClient.on('guildCreate', async (guild) => {
  console.log(`[VIGARISTA BOT] O bot acabou de entrar no servidor: ${guild.name}! Iniciando setup automático...`);
  try {
    await setupEntireGuild(guild);
  } catch (err) {
    console.error(`Erro ao auto-configurar novo servidor ${guild.name}:`, err);
  }
});

// AUTO-ROLE ON MEMBER JOIN
discordClient.on('guildMemberAdd', async (member: GuildMember) => {
  try {
    console.log(`[NOVO MEMBRO] ${member.user.tag} entrou no servidor ${member.guild.name}`);
    const roleMembro = member.guild.roles.cache.find((r) => r.name.includes('Membro'));
    if (roleMembro) {
      await member.roles.add(roleMembro);
      console.log(`Cargo Membro atribuído para ${member.user.tag}`);
    }
  } catch (e) {
    console.error('Erro ao atribuir cargo no guildMemberAdd:', e);
  }
});

// TICKET CONFIG DICTIONARY
const TICKET_TYPES: {
  [key: string]: {
    name: string;
    prefix: string;
    title: string;
    color: number;
    description: string;
  };
} = {
  ticket_pix: {
    name: 'Comprovante PIX & Vendas',
    prefix: '💳・pix',
    title: '𝗧𝗜𝗖𝗞𝗘𝗧  𝗗𝗘  𝗖𝗢𝗠𝗣𝗥𝗢𝗩𝗔𝗡𝗧𝗘  𝗣𝗜𝗫 💳',
    color: 0x00e5bb,
    description:
      `Olá, seja bem-vindo ao seu atendimento de compra!\n\n` +
      `📌 **Instruções:**\n` +
      `1. Envie a foto ou PDF do comprovante do PIX neste chat.\n` +
      `2. Informe qual plano você comprou (Diário, Semanal, Mensal VIP, etc.).\n` +
      `3. Um membro da equipe ou moderador irá verificar e enviar sua **Key de Acesso** aqui mesmo.\n\n` +
      `🔑 **Chave PIX Oficial:** \`${PIX_KEY}\` (${PIX_RECEIVER})\n` +
      `📱 **WhatsApp:** \`${WHATSAPP_CONTACT}\``,
  },
  ticket_suporte: {
    name: 'Suporte',
    prefix: '🛠️・suporte',
    title: '𝗧𝗜𝗖𝗞𝗘𝗧  𝗗𝗘  𝗦𝗨𝗣𝗢𝗥𝗧𝗘 🛠️',
    color: 0x00e5ff,
    description:
      `Olá! Seja bem-vindo ao suporte do Painel Vigarista.\n\n` +
      `Por favor, descreva detalhadamente sua dúvida ou problema para que nossa equipe de moderação e suporte possa te auxiliar o mais rápido possível.`,
  },
  ticket_key: {
    name: 'Resgate ou Renovação',
    prefix: '🔑・chave',
    title: '𝗧𝗜𝗖𝗞𝗘𝗧  𝗗𝗘  𝗥𝗘𝗦𝗚𝗔𝗧𝗘  𝗗𝗘  𝗞𝗘𝗬 🔑',
    color: 0xa855f7,
    description:
      `Olá! Precisa de ajuda para ativar ou renovar sua Key?\n\n` +
      `Informe o nome de usuário da sua conta no painel e a sua Chave para que possamos verificar o status no sistema.`,
  },
  ticket_denuncia: {
    name: 'Denúncias',
    prefix: '🚨・denuncia',
    title: '𝗧𝗜𝗖𝗞𝗘𝗧  𝗗𝗘  𝗗𝗘𝗡Ú𝗡𝗖𝗜𝗔 📝',
    color: 0xef4444,
    description:
      `Olá! Espaço reservado para denúncias de abusos, fraudes ou irregularidades.\n\n` +
      `Por favor, envie provas (prints, IDs, links ou vídeos) do ocorrido. O atendimento é sigiloso e exclusivo com a moderação.`,
  },
  ticket_parceria: {
    name: 'Parcerias & Revendas',
    prefix: '💎・parceria',
    title: '𝗧𝗜𝗖𝗞𝗘𝗧  𝗗𝗘  𝗣𝗔𝗥𝗖𝗘𝗥𝗜𝗔𝗦 💎',
    color: 0xec4899,
    description:
      `Olá! Interessado em se tornar um revendedor oficial ou fechar parceria com o Painel Vigarista?\n\n` +
      `Deixe sua proposta ou dúvida sobre pacotes de revenda com desconto para nossa liderança responder.`,
  },
};

// INTERACTION HANDLERS (Slash Commands, Select Menus & Buttons)
discordClient.on('interactionCreate', async (interaction) => {
  try {
    // 1. SELECT MENU INTERACTION (TICKET CATEGORY SELECTION)
    if (interaction.isStringSelectMenu()) {
      const select = interaction as StringSelectMenuInteraction;

      if (select.customId === 'select_ticket_category') {
        const selectedValue = select.values[0];
        const ticketConfig = TICKET_TYPES[selectedValue] || TICKET_TYPES.ticket_suporte;
        const guild = select.guild;

        if (!guild) {
          await select.reply({ content: 'Erro: Servidor não encontrado.', ephemeral: true });
          return;
        }

        const user = select.user;
        const sanitizedUsername = user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15);
        const channelName = `${ticketConfig.prefix}-${sanitizedUsername}`;

        // Check if user already has an active ticket in this category
        const existingTicket = guild.channels.cache.find(
          (c) => c.name.toLowerCase() === channelName.toLowerCase()
        );

        if (existingTicket) {
          await select.reply({
            content: `⚠️ Você já possui um atendimento aberto em <#${existingTicket.id}>!`,
            ephemeral: true,
          });
          return;
        }

        // Fetch Moderador and Admin roles
        const roleMod = guild.roles.cache.find((r) => r.name.includes('Moderador'));
        const roleAdmin = guild.roles.cache.find((r) => r.name.includes('Liderança'));

        // Overwrites for ticket channel: Only the user, Moderador, and Admin can see and talk
        const ticketOverwrites: any[] = [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.AttachFiles,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.EmbedLinks,
            ],
          },
        ];

        if (roleMod) {
          ticketOverwrites.push({
            id: roleMod.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.AttachFiles,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.EmbedLinks,
              PermissionFlagsBits.ManageMessages,
            ],
          });
        }

        if (roleAdmin) {
          ticketOverwrites.push({
            id: roleAdmin.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.AttachFiles,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.EmbedLinks,
              PermissionFlagsBits.Administrator,
            ],
          });
        }

        // Get or create category for Tickets
        let catTickets = guild.channels.cache.find(
          (c) => c.type === ChannelType.GuildCategory && c.name.includes('TICKETS')
        ) as CategoryChannel;

        if (!catTickets) {
          catTickets = await guild.channels.create({
            name: '🎫 ── TICKETS ABERTOS ──',
            type: ChannelType.GuildCategory,
            permissionOverwrites: [
              {
                id: guild.roles.everyone.id,
                deny: [PermissionFlagsBits.ViewChannel],
              },
            ],
          });
        }

        // Create the ticket channel with user and staff permissions
        const ticketChannel = await guild.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          parent: catTickets.id,
          permissionOverwrites: ticketOverwrites,
        });

        // Top stylized banner message
        const embedHeader = new EmbedBuilder()
          .setColor(ticketConfig.color)
          .setTitle(ticketConfig.title)
          .setDescription(ticketConfig.description)
          .setFooter({ text: `Atendimento iniciado para @${user.username} • Vigarista 2026` })
          .setTimestamp();

        const rowButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId('btn_close_ticket')
            .setLabel('🔒 Fechar Atendimento')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('btn_claim_ticket')
            .setLabel('👤 Assumir Atendimento')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('btn_copy_pix')
            .setLabel('📋 Copiar PIX')
            .setStyle(ButtonStyle.Primary)
        );

        await ticketChannel.send({
          content: `<@${user.id}> | Boas-vindas ao seu atendimento! ${roleMod ? `<@&${roleMod.id}>` : ''}`,
          embeds: [embedHeader],
          components: [rowButtons],
        });

        await select.reply({
          content: `✅ Seu ticket de **${ticketConfig.name}** foi criado com sucesso!\n👉 Acesse o canal: <#${ticketChannel.id}>`,
          ephemeral: true,
        });
        return;
      }
    }

    // 2. BUTTON INTERACTIONS
    if (interaction.isButton()) {
      const btn = interaction as ButtonInteraction;

      // Copy PIX button
      if (btn.customId === 'btn_copy_pix') {
        await btn.reply({
          content: `📋 **Chave PIX Oficial:**\n\`${PIX_KEY}\`\n\nBeneficiário: **${PIX_RECEIVER}**\nCidade: **${PIX_CITY}**\n*Copie a chave acima e realize o pagamento no seu aplicativo de banco.*`,
          ephemeral: true,
        });
        return;
      }

      // Claim Ticket button
      if (btn.customId === 'btn_claim_ticket') {
        await btn.reply({
          content: `👑 <@${btn.user.id}> assumiu este atendimento!`,
        });
        return;
      }

      // Close Ticket button
      if (btn.customId === 'btn_close_ticket') {
        const channel = btn.channel;
        if (channel && channel.type === ChannelType.GuildText) {
          await btn.reply({ content: '🔒 **Encerrando e apagando este atendimento em 3 segundos...**' });
          setTimeout(async () => {
            try {
              await channel.delete();
            } catch (e) {}
          }, 3000);
        }
        return;
      }
    }

    // 3. SLASH COMMANDS
    if (interaction.isChatInputCommand()) {
      const cmd = interaction as ChatInputCommandInteraction;

      if (cmd.commandName === 'setup') {
        await cmd.deferReply({ ephemeral: true });
        if (cmd.guild) {
          await setupEntireGuild(cmd.guild);
          await cmd.editReply({
            content: '✅ **Servidor VIGARISTA configurado com sucesso!** Todos os canais, permissões de membros, cargo de Moderador e categorias foram ajustados.',
          });
        } else {
          await cmd.editReply({ content: 'Erro: Comando deve ser executado dentro de um servidor.' });
        }
        return;
      }

      if (cmd.commandName === 'gerarkey') {
        const days = cmd.options.getInteger('dias', true);
        const cliente = cmd.options.getString('cliente') || 'Cliente';
        const key = generateUniversalDiscordKey(days);

        const embed = new EmbedBuilder()
          .setColor(0x00e5bb)
          .setTitle('🔑 NOVA KEY VIGARISTA GERADA')
          .setDescription(
            `Uma nova licença oficial foi gerada com sucesso!\n\n` +
              `👤 **Destinatário:** ${cliente}\n` +
              `⏱️ **Duração:** \`${days} dias\`\n` +
              `🔑 **Chave (Key):** \`${key}\`\n\n` +
              `🌐 **Onde ativar:** [Acessar Painel Vigarista](${APP_URL})\n` +
              `*O cliente pode cadastrar ou renovar no painel com esta key.*`
          )
          .setFooter({ text: 'Gerador Oficial de Chaves • Vigarista' })
          .setTimestamp();

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel('🚀 Abrir Painel')
            .setStyle(ButtonStyle.Link)
            .setURL(APP_URL)
        );

        await cmd.reply({ embeds: [embed], components: [row] });
        return;
      }

      if (cmd.commandName === 'planos') {
        const embedPlanos = new EmbedBuilder()
          .setColor(0x00e5ff)
          .setTitle('💳 PLANOS & PREÇOS • PAINEL VIGARISTA')
          .setDescription(
            `⚡ **Diário (24h):** \`R$ 15,00\`\n` +
              `⚡ **Semanal (7 Dias):** \`R$ 35,00\`\n` +
              `⭐ **Mensal VIP (30 Dias):** \`R$ 80,00\` *(Mais Vendido)*\n` +
              `⚡ **Trimestral (90 Dias):** \`R$ 190,00\`\n` +
              `🏆 **Anual (365 Dias):** \`R$ 399,00\`\n\n` +
              `🔑 **Chave PIX:** \`${PIX_KEY}\`\n` +
              `Beneficiário: **${PIX_RECEIVER}**`
          );

        await cmd.reply({ embeds: [embedPlanos] });
        return;
      }

      if (cmd.commandName === 'painel') {
        await cmd.reply({
          content: `🌐 **Acesse o Painel Vigarista:**\n${APP_URL}`,
        });
        return;
      }

      if (cmd.commandName === 'limpar') {
        const amount = cmd.options.getInteger('quantidade', true);
        if (amount < 1 || amount > 100) {
          await cmd.reply({ content: 'Por favor, selecione uma quantidade entre 1 e 100.', ephemeral: true });
          return;
        }

        const channel = cmd.channel;
        if (channel && channel.type === ChannelType.GuildText) {
          await channel.bulkDelete(amount, true);
          await cmd.reply({ content: `🧹 Foram apagadas ${amount} mensagens.`, ephemeral: true });
        }
        return;
      }
    }
  } catch (err) {
    console.error('[VIGARISTA BOT] Erro na interação:', err);
  }
});

// START BOT
export async function startDiscordBot() {
  const token = process.env.DISCORD_BOT_TOKEN || BOT_TOKEN;
  if (!token || token.trim() === '' || token.includes('MY_DISCORD') || token.length < 20) {
    console.log('[VIGARISTA BOT] Token do Discord não configurado (DISCORD_BOT_TOKEN). O servidor web segue operando normalmente.');
    return;
  }

  try {
    console.log('[VIGARISTA BOT] Conectando ao Discord com token configurado...');
    discordClient.rest.setToken(token);
    await discordClient.login(token);
  } catch (err: any) {
    console.warn('[VIGARISTA BOT] Aviso ao autenticar no Discord (o app web continuará funcionando):', err?.message || err);
  }
}

// Auto-run if started directly
if (process.argv[1]?.includes('bot')) {
  startDiscordBot();
}
