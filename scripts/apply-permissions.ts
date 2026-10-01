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
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember],
});

client.on('ready', async () => {
  console.log(`\n[APLICANDO ATUALIZAÇÃO DE CARGOS E PERMISSÕES]`);
  try {
    const fetched = await client.guilds.fetch();
    for (const [, oauthGuild] of fetched) {
      const guild = await oauthGuild.fetch();
      console.log(`Aplicando no servidor: ${guild.name}`);
      await setupEntireGuild(guild);
      console.log(`✅ Servidor ${guild.name} atualizado com sucesso!`);
    }
  } catch (err) {
    console.error('Erro ao atualizar:', err);
  }
  setTimeout(() => process.exit(0), 3000);
});

client.login(BOT_TOKEN);
