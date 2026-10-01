import { Client, GatewayIntentBits, ActivityType } from 'discord.js';

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || 'MTU0OTIwMTk3ODY0MTQ4NTg2NA.G_qDPV.hilr_BBnd2M3-q-yjcG1JZ69xTbqrGZStymRTc';

async function updateBotDescription() {
  const bioText = 'na rlk do messin 💸 🤑 💰 7️⃣ 👑';
  console.log(`🚀 [DISCORD] Atualizando descrição do bot para: "${bioText}"...`);

  // 1. Update Application Description via Discord REST API v10
  try {
    const res = await fetch('https://discord.com/api/v10/applications/@me', {
      method: 'PATCH',
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: bioText,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`✅ [SUCESSO API] Descrição da Aplicação / Bot atualizada para: "${data.description}"`);
    } else {
      const err = await res.text();
      console.log(`ℹ️ [RESPOSTA API (${res.status})]: ${err}`);
    }
  } catch (error) {
    console.error('Erro na chamada REST:', error);
  }

  // 2. Set client live presence & custom status
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences],
  });

  client.once('ready', async () => {
    console.log(`🤖 Bot conectado como: ${client.user?.tag}`);

    client.user?.setPresence({
      activities: [
        {
          name: 'na rlk do messin 💸 🤑 7️⃣',
          type: ActivityType.Custom,
          state: 'na rlk do messin 💸 🤑 💰 7️⃣',
        },
      ],
      status: 'online',
    });

    console.log('✅ [PRESENCE] Atividade e status ao vivo configurados com sucesso!');
    setTimeout(() => {
      client.destroy();
      process.exit(0);
    }, 2000);
  });

  await client.login(BOT_TOKEN);
}

updateBotDescription();
