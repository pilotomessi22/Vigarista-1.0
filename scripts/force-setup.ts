import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { setupEntireGuild } from '../src/discord/bot';

const BOT_TOKEN = 'MTU0OTIwMTk3ODY0MTQ4NTg2NA.G_qDPV.hilr_BBnd2M3-q-yjcG1JZ69xTbqrGZStymRTc';

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
  console.log(`\n[CHECK] Bot conectado: ${client.user?.tag}`);
  try {
    const fetched = await client.guilds.fetch();
    console.log(`[CHECK] Servidores encontrados: ${fetched.size}`);
    if (fetched.size === 0) {
      console.log(`[ALERTA] O bot ainda NÃO foi adicionado a nenhum servidor pelo link de convite!`);
    } else {
      for (const [id, oauthGuild] of fetched) {
        console.log(`\n>>> Servidor encontrado: ${oauthGuild.name} (${id})`);
        const guild = await oauthGuild.fetch();
        
        // Clear existing ticket message in #abrir-ticket if any, so new dropdown is sent
        const chTicket = guild.channels.cache.find(c => c.name.includes('abrir-ticket') || c.name.includes('ticket'));
        if (chTicket && chTicket.isTextBased()) {
          console.log(`Limpando mensagens antigas do canal ${chTicket.name}...`);
          try {
            const msgs = await chTicket.messages.fetch({ limit: 20 });
            for (const [, m] of msgs) {
              await m.delete();
            }
          } catch (e) {
            console.log('Não foi possível apagar mensagens antigas:', e);
          }
        }

        console.log(`Executando setup completo no servidor ${guild.name}...`);
        await setupEntireGuild(guild);
        console.log(`Configuração no servidor ${guild.name} concluída com sucesso!`);
      }
    }
  } catch (err) {
    console.error('Erro:', err);
  }
  setTimeout(() => process.exit(0), 3000);
});

client.login(BOT_TOKEN);
