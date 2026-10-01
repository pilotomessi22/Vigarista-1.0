import { Client, GatewayIntentBits, Partials, ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

const BOT_TOKEN = 'MTU0OTIwMTk3ODY0MTQ4NTg2NA.G_qDPV.hilr_BBnd2M3-q-yjcG1JZ69xTbqrGZStymRTc';
const APP_URL = 'https://ais-pre-bq3yo2k7lfdddwipepbewz-462231534956.us-east1.run.app';
const PIX_KEY = 'pix.vigarista7@pagamentos.com.br';
const PIX_RECEIVER = 'VIGARISTA LIDERANÇA 7️⃣';
const PIX_CITY = 'São Paulo - SP';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel, Partials.Message],
});

client.on('ready', async () => {
  console.log(`\n========================================`);
  console.log(`[DIAGNOSE] Conectado como: ${client.user?.tag} (${client.user?.id})`);
  console.log(`========================================`);

  try {
    const fetchedGuilds = await client.guilds.fetch();
    console.log(`[DIAGNOSE] Quantidade de Servidores encontrados: ${fetchedGuilds.size}`);

    for (const [guildId, oauthGuild] of fetchedGuilds) {
      console.log(`\n[SERVIDOR] ID: ${guildId} | Nome: ${oauthGuild.name}`);
      const guild = await oauthGuild.fetch();
      console.log(`[SERVIDOR] Membros no cache: ${guild.memberCount}`);
      
      const botMember = await guild.members.fetchMe();
      console.log(`[BOT PERMISSIONS] Administrador? ${botMember.permissions.has(PermissionFlagsBits.Administrator)}`);
      console.log(`[BOT PERMISSIONS] Gerenciar Canais? ${botMember.permissions.has(PermissionFlagsBits.ManageChannels)}`);
      console.log(`[BOT PERMISSIONS] Gerenciar Cargos? ${botMember.permissions.has(PermissionFlagsBits.ManageRoles)}`);

      // CREATE CHANNELS NOW
      console.log(`\n[EXECUTANDO CRIAÇÃO DE CANAIS NO SERVIDOR ${guild.name}...]`);

      // 1. CARGOS
      const rolesToCreate = [
        { name: '👑 Liderança 7️⃣', color: 0x00e5ff, hoist: true, admin: true },
        { name: '💎 VIP Permanente', color: 0xa855f7, hoist: true, admin: false },
        { name: '⭐ Cliente VIP', color: 0x00e5bb, hoist: true, admin: false },
        { name: '🔑 Licença Ativa', color: 0x3b82f6, hoist: true, admin: false },
        { name: '👥 Membro', color: 0x94a3b8, hoist: false, admin: false },
      ];

      const createdRoles: { [key: string]: any } = {};

      for (const r of rolesToCreate) {
        let existingRole = guild.roles.cache.find((role) => role.name === r.name);
        if (!existingRole) {
          console.log(`Criando cargo: ${r.name}`);
          existingRole = await guild.roles.create({
            name: r.name,
            color: r.color,
            hoist: r.hoist,
            permissions: r.admin ? [PermissionFlagsBits.Administrator] : undefined,
          });
        }
        createdRoles[r.name] = existingRole;
      }

      // 2. CATEGORIAS E CANAIS
      async function findOrCreateCategory(name: string, overwrites?: any[]) {
        let cat = guild.channels.cache.find(
          (c) => c.type === ChannelType.GuildCategory && c.name.toLowerCase() === name.toLowerCase()
        );
        if (!cat) {
          console.log(`Criando Categoria: ${name}`);
          cat = await guild.channels.create({
            name,
            type: ChannelType.GuildCategory,
            permissionOverwrites: overwrites,
          });
        }
        return cat;
      }

      async function findOrCreateText(name: string, parentId: string, topic?: string, overwrites?: any[]) {
        let ch = guild.channels.cache.find(
          (c) => c.type === ChannelType.GuildText && c.name.toLowerCase() === name.toLowerCase()
        );
        if (!ch) {
          console.log(`Criando Canal de Texto: ${name}`);
          ch = await guild.channels.create({
            name,
            type: ChannelType.GuildText,
            parent: parentId,
            topic,
            permissionOverwrites: overwrites,
          });
        }
        return ch as any;
      }

      // CATEGORY 1: INFORMAÇÕES
      const catInfo = await findOrCreateCategory('📌 ── INFORMAÇÕES ──');
      const chRegras = await findOrCreateText('📜・regras', catInfo.id, 'Regras oficiais Vigarista');
      const chAnuncios = await findOrCreateText('📢・anúncios', catInfo.id, 'Anúncios e comunicados');
      const chPlanos = await findOrCreateText('💳・planos-pix', catInfo.id, 'Planos e Tabela PIX');
      const chAcesso = await findOrCreateText('🌐・acesso-painel', catInfo.id, 'Link do aplicativo');

      // CATEGORY 2: LICENCIAMENTO
      const catLic = await findOrCreateCategory('🔑 ── LICENCIAMENTO ──');
      const chResgatar = await findOrCreateText('🔑・resgatar-key', catLic.id, 'Como ativar sua licença');
      const chStatus = await findOrCreateText('⚡・status-sistema', catLic.id, 'Status dos servidores');

      // CATEGORY 3: ATENDIMENTO
      const catSup = await findOrCreateCategory('🎫 ── ATENDIMENTO ──');
      const chTicket = await findOrCreateText('🎫・abrir-ticket', catSup.id, 'Central de Atendimento');

      // CATEGORY 4: VIP
      const catVip = await findOrCreateCategory('👑 ── ÁREA VIP ──', [
        { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: createdRoles['⭐ Cliente VIP']?.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        { id: createdRoles['💎 VIP Permanente']?.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        { id: createdRoles['🔑 Licença Ativa']?.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        { id: createdRoles['👑 Liderança 7️⃣']?.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.Administrator] },
      ]);
      await findOrCreateText('💬・chat-vip', catVip.id, 'Chat exclusivo para clientes VIP');
      await findOrCreateText('🎁・downloads-links', catVip.id, 'Links exclusivos');

      // CATEGORY 5: LOGS ADMIN
      const catLogs = await findOrCreateCategory('🔒 ── LOGS ADMIN ──', [
        { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: createdRoles['👑 Liderança 7️⃣']?.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.Administrator] },
      ]);
      await findOrCreateText('🔒・logs-vendas', catLogs.id, 'Logs de vendas');
      await findOrCreateText('📊・logs-chaves', catLogs.id, 'Logs de chaves');

      // SEND EMBEDS
      console.log('[ENVIANDO EMBEDS E MENSAGENS...]');

      // 1. REGRAS
      const msgsR = await chRegras.messages.fetch({ limit: 5 });
      if (msgsR.size === 0) {
        const eb = new EmbedBuilder()
          .setColor(0x00e5ff)
          .setTitle('📜 REGRAS & TERMOS DE USO • PAINEL VIGARISTA')
          .setDescription(
            `Bem-vindo à comunidade oficial do **Painel Vigarista**!\n\n` +
            `**1. Respeito Mútuo**\nProibido ofensas, desrespeito ou spam nos canais.\n\n` +
            `**2. Licenças Pessoais**\nSua **Key** e conta são de uso exclusivo e intransferível.\n\n` +
            `**3. Pagamentos**\nAceitamos **exclusivamente pagamentos via PIX**. Envie seu comprovante no canal <#${chTicket.id}>.\n\n` +
            `**4. Segurança**\nNossa equipe nunca solicitará sua senha.`
          )
          .setFooter({ text: 'Painel VIGARISTA 2026' });
        await chRegras.send({ embeds: [eb] });
      }

      // 2. ANÚNCIOS
      const msgsA = await chAnuncios.messages.fetch({ limit: 5 });
      if (msgsA.size === 0) {
        const eb = new EmbedBuilder()
          .setColor(0x00e5bb)
          .setTitle('📢 SEJA BEM-VINDO AO PAINEL VIGARISTA')
          .setDescription(
            `🚀 **O Sistema Definitivo de Licenciamento & Automação**\n\n` +
            `🔹 **Passo a Passo para Começar:**\n` +
            `1. Escolha seu plano em <#${chPlanos.id}>\n` +
            `2. Faça o PIX e envie o comprovante em <#${chTicket.id}>\n` +
            `3. Receba sua **Key Exclusiva** e acesse o app em <#${chAcesso.id}>\n\n` +
            `⚡ **Suporte 24 Horas Ativo!**`
          );
        await chAnuncios.send({ embeds: [eb] });
      }

      // 3. PLANOS PIX
      const msgsP = await chPlanos.messages.fetch({ limit: 5 });
      if (msgsP.size === 0) {
        const eb = new EmbedBuilder()
          .setColor(0x00e5ff)
          .setTitle('💳 TABELA OFICIAL DE PLANOS & VALORES • VIGARISTA')
          .setDescription(
            `⚡ **PLANO DIÁRIO (24 Horas):** \`R$ 15,00\`\n` +
            `⚡ **PLANO SEMANAL (7 Dias):** \`R$ 35,00\` ~~(R$ 50,00)~~\n` +
            `⭐ **PLANO MENSAL VIP (30 Dias):** \`R$ 80,00\` ~~(R$ 120,00)~~ *(Mais Vendido)*\n` +
            `⚡ **PLANO TRIMESTRAL (90 Dias):** \`R$ 190,00\` ~~(R$ 240,00)~~\n` +
            `🏆 **PLANO ANUAL / PERMANENTE (365 Dias):** \`R$ 399,00\` ~~(R$ 600,00)~~\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `🔑 **CHAVE PIX OFICIAL:**\n` +
            `• **PIX:** \`${PIX_KEY}\`\n` +
            `• **Nome:** \`${PIX_RECEIVER}\`\n` +
            `• **Cidade:** \`${PIX_CITY}\`\n\n` +
            `📌 *Clique abaixo para copiar o PIX ou abrir seu ticket e receber sua Key!*`
          );

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId('btn_open_ticket').setLabel('🎫 Enviar Comprovante / Comprar').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId('btn_copy_pix').setLabel('📋 Copiar Chave PIX').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setLabel('🌐 Acessar Painel Web').setStyle(ButtonStyle.Link).setURL(APP_URL)
        );
        await chPlanos.send({ embeds: [eb], components: [row] });
      }

      // 4. ACESSO
      const msgsAc = await chAcesso.messages.fetch({ limit: 5 });
      if (msgsAc.size === 0) {
        const eb = new EmbedBuilder()
          .setColor(0x3b82f6)
          .setTitle('🌐 LINK DE ACESSO AO PAINEL VIGARISTA')
          .setDescription(
            `Acesse o aplicativo diretamente pelo seu navegador no celular ou computador:\n\n` +
            `🔗 **Link do App:**\n` +
            `[👉 Clique Aqui para Abrir o Painel Vigarista](${APP_URL})`
          );
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setLabel('🚀 Abrir Painel Vigarista').setStyle(ButtonStyle.Link).setURL(APP_URL)
        );
        await chAcesso.send({ embeds: [eb], components: [row] });
      }

      // 5. RESGATAR KEY
      const msgsRes = await chResgatar.messages.fetch({ limit: 5 });
      if (msgsRes.size === 0) {
        const eb = new EmbedBuilder()
          .setColor(0xa855f7)
          .setTitle('🔑 COMO RESGATAR SUA KEY NO APLICATIVO')
          .setDescription(
            `1️⃣ Abra o aplicativo em <#${chAcesso.id}>\n` +
            `2️⃣ Clique na aba **"Cadastre-se"** (ou "Renovar")\n` +
            `3️⃣ Escolha seu **Usuário** e **Senha**\n` +
            `4️⃣ Cole a sua **Key** (\`TM-XXXX-XXXX-2026\`)\n` +
            `5️⃣ Clique em **"CRIAR CONTA E ACESSAR"**\n\n` +
            `✅ Pronto! Seu acesso estará liberado imediatamente.`
          );
        await chResgatar.send({ embeds: [eb] });
      }

      // 6. ABRIR TICKET
      const msgsTk = await chTicket.messages.fetch({ limit: 5 });
      if (msgsTk.size === 0) {
        const eb = new EmbedBuilder()
          .setColor(0x00e5ff)
          .setTitle('🎫 CENTRAL DE ATENDIMENTO & SUPORTE VIP')
          .setDescription(
            `Precisa de suporte, dúvidas ou deseja enviar seu comprovante PIX?\n\n` +
            `Clique no botão verde abaixo para abrir seu **canal de atendimento privado**!`
          );
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId('btn_open_ticket').setLabel('🎫 Abrir Atendimento / Enviar PIX').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId('btn_copy_pix').setLabel('📋 Copiar Chave PIX').setStyle(ButtonStyle.Secondary)
        );
        await chTicket.send({ embeds: [eb], components: [row] });
      }

      // 7. STATUS
      const msgsSt = await chStatus.messages.fetch({ limit: 5 });
      if (msgsSt.size === 0) {
        const eb = new EmbedBuilder()
          .setColor(0x10b981)
          .setTitle('⚡ STATUS OPERACIONAL DO SISTEMA')
          .setDescription(
            `🟢 **Servidor Central:** \`ONLINE (100%)\`\n` +
            `🟢 **Gerador de Licenças:** \`OPERACIONAL\`\n` +
            `🟢 **Validador de Keys:** \`ATIVO\`\n` +
            `🟢 **Latência Média:** \`12ms\`\n` +
            `🟢 **Versão:** \`Vigarista 7.0 Ultra\``
          );
        await chStatus.send({ embeds: [eb] });
      }

      console.log(`\n✅ [SUCESSO TOTAL] Servidor ${guild.name} foi 100% configurado!`);
    }

    setTimeout(() => {
      console.log('Finalizado.');
      process.exit(0);
    }, 2000);
  } catch (error) {
    console.error('ERRO NO DIAGNOSE:', error);
    process.exit(1);
  }
});

client.login(BOT_TOKEN);
