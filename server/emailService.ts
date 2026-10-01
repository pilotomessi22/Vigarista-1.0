import { Resend } from 'resend';

// Default Resend API Key provided by user (can also be overridden via env or runtime admin config)
let currentResendApiKey = process.env.RESEND_API_KEY || 're_HrJYdqgR_BL9Lbj3iccXzurzqhvwntY9G';
let currentSenderEmail = process.env.RESEND_FROM_EMAIL || 'VIGARISTA VIP <onboarding@resend.dev>';

export interface SendLicenseEmailParams {
  toEmail: string;
  clientName?: string;
  licenseKey: string;
  planName: string;
  daysValid: number;
  appUrl?: string;
}

export interface EmailLogEntry {
  id: string;
  toEmail: string;
  clientName?: string;
  licenseKey: string;
  planName: string;
  daysValid: number;
  sentAt: string;
  status: 'delivered' | 'failed';
  resendId?: string;
  errorMessage?: string;
}

const emailLogs: EmailLogEntry[] = [];

export function getResendApiKey(): string {
  return currentResendApiKey;
}

export function setResendApiKey(key: string, sender?: string): void {
  if (key && key.trim()) {
    currentResendApiKey = key.trim();
  }
  if (sender && sender.trim()) {
    currentSenderEmail = sender.trim();
  }
}

export function getEmailLogs(): EmailLogEntry[] {
  return [...emailLogs].slice(-50).reverse();
}

/**
 * Builds a modern VIP Dark & Gold themed HTML email for the customer
 */
function buildLicenseEmailHtml(params: SendLicenseEmailParams): string {
  const { clientName, licenseKey, planName, daysValid, appUrl } = params;
  const greeting = clientName && clientName.trim() ? `Olá, <strong>${clientName.trim()}</strong>!` : 'Olá!';
  const targetUrl = appUrl ? `${appUrl.replace(/\/$/, '')}#activate?key=${encodeURIComponent(licenseKey)}` : 'https://vigarista.app';
  const validityText = daysValid >= 3650 ? 'Vitalício (Acesso Permanente)' : `${daysValid} Dias`;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sua Chave VIP VIGARISTA</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #090d14;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
    }
    .wrapper {
      width: 100%;
      background-color: #090d14;
      padding: 30px 15px;
      box-sizing: border-box;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #111927;
      border: 1px solid rgba(0, 229, 187, 0.25);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
    }
    .header {
      background: linear-gradient(135deg, #0e1520 0%, #152233 100%);
      padding: 35px 25px 25px 25px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .badge {
      display: inline-block;
      padding: 5px 14px;
      background: rgba(0, 229, 187, 0.12);
      border: 1px solid rgba(0, 229, 187, 0.4);
      border-radius: 30px;
      color: #00e5bb;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    .title {
      margin: 0;
      color: #ffffff;
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 0.5px;
    }
    .content {
      padding: 35px 30px;
    }
    .greeting {
      font-size: 16px;
      color: #cbd5e1;
      margin-bottom: 20px;
      line-height: 1.6;
    }
    .key-box {
      background: #090e17;
      border: 2px dashed #00e5bb;
      border-radius: 14px;
      padding: 22px 15px;
      text-align: center;
      margin: 25px 0;
    }
    .key-label {
      font-size: 11px;
      text-transform: uppercase;
      color: #94a3b8;
      letter-spacing: 1px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .key-value {
      font-family: 'Courier New', Courier, monospace;
      font-size: 22px;
      font-weight: 900;
      color: #00e5bb;
      letter-spacing: 2px;
      user-select: all;
      word-break: break-all;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin: 25px 0;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 10px;
      overflow: hidden;
    }
    .details-table td {
      padding: 12px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 13px;
    }
    .details-table tr:last-child td {
      border-bottom: none;
    }
    .details-label {
      color: #94a3b8;
      width: 40%;
    }
    .details-value {
      color: #ffffff;
      font-weight: 700;
      text-align: right;
    }
    .btn-container {
      text-align: center;
      margin: 30px 0 20px 0;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #00e5bb 0%, #00b392 100%);
      color: #090d14 !important;
      text-decoration: none;
      padding: 15px 32px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 900;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      box-shadow: 0 8px 20px rgba(0, 229, 187, 0.3);
    }
    .steps {
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 20px;
      margin-top: 25px;
    }
    .steps-title {
      font-size: 13px;
      font-weight: 800;
      color: #38bdf8;
      margin-top: 0;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .steps ol {
      margin: 0;
      padding-left: 20px;
      color: #94a3b8;
      font-size: 13px;
      line-height: 1.7;
    }
    .footer {
      padding: 22px;
      text-align: center;
      background-color: #0c121c;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="badge">👑 Acesso VIP Liberado</div>
        <h1 class="title">Sua Chave de Acesso Chegou!</h1>
      </div>
      
      <div class="content">
        <div class="greeting">
          ${greeting}<br>
          Seu acesso VIP ao <strong>Painel VIGARISTA</strong> foi gerado com sucesso. Guarde sua chave de ativação com segurança.
        </div>

        <div class="key-box">
          <div class="key-label">Sua Chave de Licença VIP</div>
          <div class="key-value">${licenseKey}</div>
        </div>

        <table class="details-table">
          <tr>
            <td class="details-label">📦 Plano:</td>
            <td class="details-value">${planName}</td>
          </tr>
          <tr>
            <td class="details-label">⏳ Validade:</td>
            <td class="details-value">${validityText}</td>
          </tr>
          <tr>
            <td class="details-label">🛡️ Status:</td>
            <td class="details-value" style="color: #00e5bb;">✅ Ativo & Pronto para Uso</td>
          </tr>
        </table>

        <div class="btn-container">
          <a href="${targetUrl}" class="btn" target="_blank">⚡ Ativar Minha Conta Agora</a>
        </div>

        <div class="steps">
          <div class="steps-title">📖 Como Ativar sua Conta:</div>
          <ol>
            <li>Acesse o aplicativo através do botão acima ou pelo link oficial.</li>
            <li>Na tela de entrada, clique em <strong>"Cadastre-se / Ativar Chave"</strong>.</li>
            <li>Cole a sua chave <code>${licenseKey}</code> e escolha seu usuário e senha.</li>
            <li>Pronto! Você já terá acesso total a todos os recursos VIP.</li>
          </ol>
        </div>
      </div>

      <div class="footer">
        Este é um e-mail transacional automático. Se tiver qualquer dúvida, entre em contato com o suporte.<br>
        &copy; ${new Date().getFullYear()} VIGARISTA VIP - Todos os direitos reservados.
      </div>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Sends a license email via Resend API
 */
export async function sendLicenseEmail(params: SendLicenseEmailParams): Promise<{ success: boolean; resendId?: string; error?: string }> {
  const { toEmail, licenseKey, planName, daysValid, clientName } = params;

  if (!toEmail || !toEmail.includes('@')) {
    const errorMsg = 'E-mail inválido fornecido.';
    logEmailAttempt({
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      toEmail,
      clientName,
      licenseKey,
      planName,
      daysValid,
      sentAt: new Date().toISOString(),
      status: 'failed',
      errorMessage: errorMsg,
    });
    return { success: false, error: errorMsg };
  }

  try {
    const resend = new Resend(currentResendApiKey);
    const htmlContent = buildLicenseEmailHtml(params);

    const data = await resend.emails.send({
      from: currentSenderEmail,
      to: [toEmail.trim()],
      subject: `👑 Sua Chave VIP VIGARISTA: ${licenseKey} (${planName})`,
      html: htmlContent,
    });

    if (data.error) {
      console.error('[Resend Error]', data.error);
      const errorMsg = data.error.message || 'Falha ao enviar e-mail via Resend.';
      logEmailAttempt({
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        toEmail,
        clientName,
        licenseKey,
        planName,
        daysValid,
        sentAt: new Date().toISOString(),
        status: 'failed',
        errorMessage: errorMsg,
      });
      return { success: false, error: errorMsg };
    }

    const resendId = data.data?.id || 'resend_' + Date.now();
    logEmailAttempt({
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      toEmail,
      clientName,
      licenseKey,
      planName,
      daysValid,
      sentAt: new Date().toISOString(),
      status: 'delivered',
      resendId,
    });

    return { success: true, resendId };
  } catch (err: any) {
    console.error('[Resend Exception]', err);
    const errorMsg = err?.message || 'Erro inesperado ao conectar com a API do Resend.';
    logEmailAttempt({
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      toEmail,
      clientName,
      licenseKey,
      planName,
      daysValid,
      sentAt: new Date().toISOString(),
      status: 'failed',
      errorMessage: errorMsg,
    });
    return { success: false, error: errorMsg };
  }
}

function logEmailAttempt(entry: EmailLogEntry) {
  emailLogs.push(entry);
  if (emailLogs.length > 100) {
    emailLogs.shift();
  }
}
