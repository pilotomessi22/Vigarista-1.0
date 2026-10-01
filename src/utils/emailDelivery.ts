// Client-side helper for Resend email operations & history

export interface SendEmailPayload {
  toEmail: string;
  clientName?: string;
  licenseKey: string;
  planName: string;
  daysValid: number;
}

export interface EmailLog {
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

export const sendLicenseByEmail = async (payload: SendEmailPayload): Promise<{ success: boolean; message: string; resendId?: string }> => {
  try {
    const res = await fetch('/api/email/send-license', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        appUrl: window.location.origin + window.location.pathname,
      }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message || 'E-mail enviado com sucesso!', resendId: data.resendId };
    }
    return { success: false, message: data.error || 'Falha ao enviar e-mail.' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Erro ao conectar ao servidor de e-mails.' };
  }
};

export const fetchEmailLogs = async (): Promise<EmailLog[]> => {
  try {
    const res = await fetch('/api/email/logs');
    if (res.ok) {
      const data = await res.json();
      return data.logs || [];
    }
    return [];
  } catch {
    return [];
  }
};

export const fetchEmailConfig = async (): Promise<{ configured: boolean; maskedKey: string; sender: string }> => {
  try {
    const res = await fetch('/api/email/config');
    if (res.ok) {
      return await res.json();
    }
    return { configured: false, maskedKey: 'Erro ao verificar', sender: '' };
  } catch {
    return { configured: false, maskedKey: 'Erro ao verificar', sender: '' };
  }
};

export const saveEmailConfig = async (apiKey: string, sender?: string): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch('/api/email/save-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, sender }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message };
    }
    return { success: false, message: data.error || 'Falha ao salvar configurações.' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Erro de conexão.' };
  }
};
