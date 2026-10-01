import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || 'MTU0OTIwMTk3ODY0MTQ4NTg2NA.G_qDPV.hilr_BBnd2M3-q-yjcG1JZ69xTbqrGZStymRTc';

async function generateAndApplyAvatar() {
  console.log('🎨 [AVATAR UPDATE] Gerando arte completa com Anonymous e tipografia vermelha...');

  // 1. High quality SVG Vector
  const svgContent = `
  <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#040508" />
        <stop offset="50%" stop-color="#120608" />
        <stop offset="100%" stop-color="#040508" />
      </linearGradient>

      <linearGradient id="maskFaceGrad" x1="100" y1="20" x2="100" y2="185" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#f8fafc" />
        <stop offset="60%" stop-color="#e2e8f0" />
        <stop offset="100%" stop-color="#94a3b8" />
      </linearGradient>

      <linearGradient id="hoodGrad" x1="100" y1="10" x2="100" y2="190" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#1e0b0e" />
        <stop offset="100%" stop-color="#090405" />
      </linearGradient>

      <filter id="redNeonGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="12" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter id="eyeGlow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <!-- Background -->
    <rect width="1024" height="1024" fill="url(#bgGrad)" />

    <!-- Matrix Code Stream in Red -->
    <g opacity="0.25" font-family="monospace" font-size="20" fill="#ef4444">
      <text x="60" y="90">0 1 0 1 1 0 1</text>
      <text x="60" y="160">1 0 1 0 0 1 0</text>
      <text x="60" y="230">0 0 1 1 0 1 1</text>
      <text x="60" y="300">1 1 0 1 0 0 1</text>
      <text x="60" y="850">0 1 1 0 1 0 1</text>
      <text x="60" y="920">1 0 0 1 1 1 0</text>
      
      <text x="860" y="110">1 1 0 1 0</text>
      <text x="860" y="180">0 1 1 0 1</text>
      <text x="860" y="250">1 0 0 1 1</text>
      <text x="860" y="320">0 1 0 1 0</text>
      <text x="860" y="870">1 1 0 0 1</text>
      <text x="860" y="940">0 0 1 1 0</text>
    </g>

    <!-- Outer Glowing Red Cyber Ring -->
    <circle cx="512" cy="380" r="320" fill="none" stroke="#ef4444" stroke-width="2" opacity="0.25" stroke-dasharray="8,8" />
    <circle cx="512" cy="380" r="280" fill="#070a10" stroke="#ef4444" stroke-width="6" filter="url(#redNeonGlow)" />

    <!-- The Authentic Anonymous Guy Fawkes Mask from Login Screen (Centered inside Ring) -->
    <g transform="translate(302, 170) scale(2.1)">
      <!-- Hacker Hood / Silhouette in background -->
      <path
        d="M100 15 C45 15 25 55 20 120 C18 145 28 175 45 190 C60 198 140 198 155 190 C172 175 182 145 180 120 C175 55 155 15 100 15 Z"
        fill="url(#hoodGrad)"
        stroke="#ef4444"
        stroke-width="2"
        stroke-opacity="0.9"
      />

      <!-- Mask Head Base Shape -->
      <path
        d="M100 35 C65 35 48 55 48 95 C48 135 70 170 100 182 C130 170 152 135 152 95 C152 55 135 35 100 35 Z"
        fill="url(#maskFaceGrad)"
        stroke="#0f172a"
        stroke-width="2.5"
      />

      <!-- Hair & Temple Contours -->
      <path
        d="M48 95 C46 65 60 40 100 38 C140 40 154 65 152 95 C146 72 132 50 100 48 C68 50 54 72 48 95 Z"
        fill="#0f172a"
      />

      <!-- Rosy Cheeks -->
      <ellipse cx="64" cy="118" rx="8" ry="5" fill="#ef4444" opacity="0.4" />
      <ellipse cx="136" cy="118" rx="8" ry="5" fill="#ef4444" opacity="0.4" />

      <!-- High Arched Eyebrows -->
      <path d="M58 80 C68 68 84 72 90 82" stroke="#0f172a" stroke-width="4" stroke-linecap="round" />
      <path d="M142 80 C132 68 116 72 110 82" stroke="#0f172a" stroke-width="4" stroke-linecap="round" />

      <!-- Eyes with Glowing Red Pupils -->
      <path d="M62 90 C70 85 82 86 86 92 C80 94 68 94 62 90 Z" fill="#050505" />
      <circle cx="74" cy="89" r="3.2" fill="#ff2b43" filter="url(#eyeGlow)" />

      <path d="M138 90 C130 85 118 86 114 92 C120 94 132 94 138 90 Z" fill="#050505" />
      <circle cx="126" cy="89" r="3.2" fill="#ff2b43" filter="url(#eyeGlow)" />

      <!-- Aquiline Nose -->
      <path d="M100 78 L98 116 L104 116" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" />

      <!-- Mustache -->
      <path
        d="M56 120 C72 128 88 126 100 131 C112 126 128 128 144 120 C134 135 114 135 100 133 C86 135 66 135 56 120 Z"
        fill="#0f172a"
      />
      <path d="M56 120 C52 115 52 108 58 107" stroke="#0f172a" stroke-width="3" stroke-linecap="round" />
      <path d="M144 120 C148 115 148 108 142 107" stroke="#0f172a" stroke-width="3" stroke-linecap="round" />

      <!-- Lips -->
      <path d="M74 142 C86 149 114 149 126 142" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" />

      <!-- Pointed Goatee -->
      <path d="M96 150 L104 150 L100 172 Z" fill="#0f172a" />

      <!-- Cyber Accents -->
      <path d="M32 90 L42 90 L48 100" stroke="#ef4444" stroke-width="1.8" stroke-opacity="0.8" stroke-dasharray="2 3" />
      <circle cx="32" cy="90" r="2.2" fill="#ef4444" />
      <path d="M168 90 L158 90 L152 100" stroke="#ef4444" stroke-width="1.8" stroke-opacity="0.8" stroke-dasharray="2 3" />
      <circle cx="168" cy="90" r="2.2" fill="#ef4444" />
    </g>

    <!-- VIGARISTA Typography in EXACT Login Monospace Extra Bold Font -->
    <text
      x="512"
      y="790"
      text-anchor="middle"
      font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
      font-weight="900"
      font-size="88"
      letter-spacing="10"
      fill="#ff2b43"
      filter="url(#redNeonGlow)"
    >
      VIGARISTA
    </text>

    <!-- Subtitle Badge -->
    <rect x="272" y="835" width="480" height="52" rx="26" fill="#ef4444" opacity="0.15" stroke="#ef4444" stroke-width="2.5" />
    <text
      x="512"
      y="870"
      text-anchor="middle"
      font-family="ui-monospace, monospace"
      font-weight="bold"
      font-size="22"
      letter-spacing="6"
      fill="#fca5a5"
    >
      ACESSO RESTRITO • 7.0
    </text>
  </svg>
  `;

  // 2. Render to PNG Buffer with sharp
  const pngBuffer = await sharp(Buffer.from(svgContent))
    .png({ quality: 100 })
    .toBuffer();

  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const outPath = path.join(publicDir, 'vigarista-avatar-final.png');
  fs.writeFileSync(outPath, pngBuffer);
  console.log(`✅ [AVATAR] Imagem salva localmente em: ${outPath}`);

  // 3. Update Bot Profile Picture via Discord API
  try {
    console.log('🔄 [DISCORD API] Enviando avatar para o Bot do Discord...');
    const base64Image = `data:image/png;base64,${pngBuffer.toString('base64')}`;

    const res = await fetch('https://discord.com/api/v10/users/@me', {
      method: 'PATCH',
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        avatar: base64Image,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`🎉 [DISCORD API SUCESSO] Avatar do bot atualizado! Bot: ${data.username}#${data.discriminator} | Avatar hash: ${data.avatar}`);
    } else {
      const errText = await res.text();
      console.error(`⚠️ [DISCORD API AVISO] Resposta do Discord (${res.status}):`, errText);
    }
  } catch (error) {
    console.error('❌ [DISCORD API ERRO] Falha ao enviar requisição para o Discord:', error);
  }
}

generateAndApplyAvatar();
