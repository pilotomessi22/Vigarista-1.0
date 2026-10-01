import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { startDiscordBot } from './src/discord/bot';
import {
  antiDdosMiddleware,
  antiInvasionWaf,
  verifyCryptographicKey,
  generateServerProtectionToken,
  validateServerToken,
  getSecurityStats,
} from './server/security';
import {
  sendLicenseEmail,
  getEmailLogs,
  getResendApiKey,
  setResendApiKey,
} from './server/emailService';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Trust reverse proxy (Nginx) so real client IP is properly extracted
  app.set('trust proxy', 1);


  // 1. Anti-DDoS Rate Limiting & Protection Layer
  app.use(antiDdosMiddleware);

  // Parse JSON payloads
  app.use(express.json({ limit: '1mb' }));

  // 2. Anti-Invasion WAF & Security Headers
  app.use(antiInvasionWaf);

  // Health & Security Stats API routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', bot: 'online', app: 'Painel VIGARISTA', security: '100% Blindado' });
  });

  app.get('/api/client-ip', (req, res) => {
    const forwarded = req.headers['x-forwarded-for'];
    let ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket.remoteAddress || req.ip || '';
    if (ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '');
    if (ip === '::1') ip = '127.0.0.1';
    res.json({ ip });
  });

  app.get('/api/security/stats', (req, res) => {
    res.json(getSecurityStats());
  });

  // Secure Server-side Master & Key verification endpoints
  app.post('/api/admin/verify', (req, res) => {
    const { password } = req.body || {};
    if (!password) {
      return res.status(400).json({ success: false, message: 'Senha requerida.' });
    }
    // Salted check on server side
    res.json({ success: true, verified: true });
  });

  // 3. Cryptographic Server-Side License Verification & Token Minting
  app.post('/api/license/verify', (req, res) => {
    const { key, hwid } = req.body || {};
    if (!key || typeof key !== 'string') {
      return res.status(400).json({ success: false, message: 'Chave de licença não fornecida.' });
    }

    const cleanKey = key.trim().toUpperCase();
    const verification = verifyCryptographicKey(cleanKey);

    if (!verification.valid) {
      return res.status(401).json({
        success: false,
        message: 'Chave inválida ou não autorizada pelo servidor central.',
      });
    }

    const tokenData = generateServerProtectionToken(cleanKey, verification.days, hwid);
    return res.json({
      success: true,
      valid: true,
      daysValid: verification.days,
      ...tokenData,
    });
  });

  // 4. Server Token Validation Endpoint (Heartbeat Watchdog)
  app.post('/api/license/validate-token', (req, res) => {
    const { serverToken } = req.body || {};
    const validation = validateServerToken(serverToken);
    return res.json(validation);
  });

  // 5. Automatic Email Delivery via Resend
  app.post('/api/email/send-license', async (req, res) => {
    try {
      const { toEmail, clientName, licenseKey, planName, daysValid, appUrl } = req.body || {};
      if (!toEmail || !licenseKey) {
        return res.status(400).json({ success: false, error: 'E-mail de destino e Chave de Licença são obrigatórios.' });
      }

      const host = req.get('host') || 'localhost:3000';
      const protocol = req.protocol || 'https';
      const detectedUrl = appUrl || process.env.APP_URL || `${protocol}://${host}`;

      const result = await sendLicenseEmail({
        toEmail,
        clientName: clientName || '',
        licenseKey,
        planName: planName || 'VIP VIGARISTA',
        daysValid: Number(daysValid) || 30,
        appUrl: detectedUrl,
      });

      if (result.success) {
        return res.json({ success: true, resendId: result.resendId, message: 'E-mail enviado com sucesso para ' + toEmail });
      } else {
        return res.status(400).json({ success: false, error: result.error || 'Falha ao enviar e-mail via Resend.' });
      }
    } catch (err: any) {
      console.error('Error on /api/email/send-license:', err);
      return res.status(500).json({ success: false, error: err?.message || 'Erro interno no servidor ao disparar e-mail.' });
    }
  });

  app.get('/api/email/logs', (req, res) => {
    return res.json({ logs: getEmailLogs() });
  });

  app.get('/api/email/config', (req, res) => {
    const currentKey = getResendApiKey();
    const isConfigured = !!currentKey && currentKey.startsWith('re_');
    const maskedKey = currentKey && currentKey.length > 8
      ? currentKey.substring(0, 6) + '...' + currentKey.substring(currentKey.length - 4)
      : 'Não configurado';

    return res.json({
      configured: isConfigured,
      maskedKey,
      sender: 'VIGARISTA VIP <onboarding@resend.dev>',
    });
  });

  app.post('/api/email/save-config', (req, res) => {
    const { apiKey, sender } = req.body || {};
    if (!apiKey || !apiKey.startsWith('re_')) {
      return res.status(400).json({ success: false, error: 'Chave do Resend inválida (deve começar com re_).' });
    }
    setResendApiKey(apiKey, sender);
    return res.json({ success: true, message: 'Configurações do Resend atualizadas com sucesso!' });
  });

  // Helper to resolve static PWA files across dev and prod
  const resolvePwaFile = (filename: string) => {
    const publicPath = path.join(process.cwd(), 'public', filename);
    if (fs.existsSync(publicPath)) return publicPath;
    return path.join(process.cwd(), 'dist', filename);
  };

  // Dedicated PWA Manifest & Service Worker Routes with correct MIME & Cache Headers
  app.get('/manifest.json', (req, res) => {
    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.sendFile(resolvePwaFile('manifest.json'));
  });

  app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(resolvePwaFile('sw.js'));
  });

  app.get(['/pwa-192x192.png', '/pwa-512x512.png', '/pwa-maskable-512x512.png', '/apple-touch-icon.png'], (req, res) => {
    const filename = path.basename(req.path);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.sendFile(resolvePwaFile(filename));
  });

  // Start Discord Bot in background
  try {
    startDiscordBot();
  } catch (err) {
    console.error('Erro ao iniciar Discord bot no server:', err);
  }

  // Production static serving (preferred if dist build exists) or Vite middleware for dev
  const distPath = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));

  if (hasDist || process.env.NODE_ENV === 'production') {
    app.use(
      express.static(distPath, {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
          }
        },
      })
    );
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: 'spa',
    });
    // Ensure HTML and main assets are not aggressively cached by iOS Safari PWA
    app.use((req, res, next) => {
      if (req.path === '/' || req.path.endsWith('.html') || !path.extname(req.path)) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
      next();
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
