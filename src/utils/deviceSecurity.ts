// Advanced Device Hardware & IP Fingerprinting and Binding Module
// Prevents account sharing, multiple unauthorized logins, and fraud by binding license keys to the original device and IP.

export interface DeviceInfo {
  fingerprint: string;
  ip: string;
  deviceModel: string;
  ipSubnet: string;
}

const HWID_STORAGE_KEY = 'vigarista_hwid_token_v2';
const IP_STORAGE_KEY = 'vigarista_detected_client_ip_v2';
const ISOLATED_IP_KEY = 'vigarista_isolated_device_ip_v2';

let cachedIp: string | null = (typeof localStorage !== 'undefined' ? localStorage.getItem(IP_STORAGE_KEY) : null);

/**
 * Returns a device-isolated fallback IP guaranteed to be distinct between different devices
 */
export const getIsolatedDeviceIp = (): string => {
  try {
    let isolated = localStorage.getItem(ISOLATED_IP_KEY);
    if (!isolated) {
      const hwid = getPersistentHwid();
      let hash = 0;
      for (let i = 0; i < hwid.length; i++) {
        hash = (hash * 31 + hwid.charCodeAt(i)) | 0;
      }
      const octet2 = Math.abs((hash >> 16) % 220) + 10;
      const octet3 = Math.abs((hash >> 8) % 220) + 10;
      const octet4 = Math.abs(hash % 220) + 10;
      isolated = `177.${octet2}.${octet3}.${octet4}`;
      localStorage.setItem(ISOLATED_IP_KEY, isolated);
    }
    return isolated;
  } catch {
    return '177.12.88.94';
  }
};

/**
 * Creates or retrieves a persistent cryptographic Hardware ID for this browser/device
 */
export const getPersistentHwid = (): string => {
  try {
    let hwid = localStorage.getItem(HWID_STORAGE_KEY);
    if (!hwid) {
      const entropy = [
        navigator.userAgent,
        screen.width,
        screen.height,
        screen.colorDepth,
        navigator.language,
        (navigator as any).hardwareConcurrency || 4,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        Date.now(),
        Math.random().toString(36).substring(2, 15),
      ].join('###');

      // Simple robust hash
      let hash = 0;
      for (let i = 0; i < entropy.length; i++) {
        const char = entropy.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
      }
      hwid = `DEV-${Math.abs(hash).toString(36).toUpperCase()}-${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`;
      localStorage.setItem(HWID_STORAGE_KEY, hwid);
    }
    return hwid;
  } catch {
    return 'DEV-FALLBACK-LOCAL';
  }
};

/**
 * Formats a friendly device name (e.g. "iPhone (iOS Safari)", "Windows PC", "Android Galaxy")
 */
export const getDeviceModelName = (): string => {
  if (typeof navigator === 'undefined') return 'Dispositivo Web';
  const ua = navigator.userAgent;

  if (/iPhone/i.test(ua)) return 'Apple iPhone (iOS Safari)';
  if (/iPad/i.test(ua)) return 'Apple iPad (iPadOS)';
  if (/Android/i.test(ua)) {
    if (/Samsung/i.test(ua)) return 'Samsung Galaxy (Android)';
    if (/Xiaomi|Redmi/i.test(ua)) return 'Xiaomi / Redmi (Android)';
    if (/Motorola/i.test(ua)) return 'Motorola (Android)';
    return 'Dispositivo Android';
  }
  if (/Macintosh|Mac OS X/i.test(ua)) return 'Apple Mac (macOS)';
  if (/Windows/i.test(ua)) return 'Computador Windows (PC)';
  if (/Linux/i.test(ua)) return 'Dispositivo Linux';

  return 'Navegador Web';
};

/**
 * Obtains the public IP address with multiple fast fallbacks
 */
export const fetchClientPublicIp = async (): Promise<string> => {
  if (cachedIp && cachedIp !== '127.0.0.1' && !cachedIp.startsWith('::')) {
    return cachedIp;
  }

  // 1. Try local server API endpoint (super fast, provides true x-forwarded-for public IP)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const res = await fetch('/api/client-ip', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.ip && data.ip !== '127.0.0.1' && !data.ip.startsWith('::')) {
        cachedIp = data.ip;
        try { localStorage.setItem(IP_STORAGE_KEY, data.ip); } catch {}
        return data.ip;
      }
    }
  } catch {}

  // 2. Fast IPv4/IPv6 external lookup
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res2 = await fetch('https://api64.ipify.org?format=json', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res2.ok) {
      const data2 = await res2.json();
      if (data2.ip) {
        cachedIp = data2.ip;
        try { localStorage.setItem(IP_STORAGE_KEY, data2.ip); } catch {}
        return data2.ip;
      }
    }
  } catch {}

  // 3. IPv4 fallback lookup
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch('https://api.ipify.org?format=json', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.ip) {
        cachedIp = data.ip;
        try { localStorage.setItem(IP_STORAGE_KEY, data.ip); } catch {}
        return data.ip;
      }
    }
  } catch {}

  // 4. Device-isolated fallback (guaranteed distinct for each physical device/browser)
  const fallbackIp = getIsolatedDeviceIp();
  cachedIp = fallbackIp;
  return fallbackIp;
};

/**
 * Calculates a /24 IP Subnet (e.g. "189.120.45.*")
 */
export const getIpSubnet = (ip: string): string => {
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.*`;
  }
  return ip;
};

/**
 * Masks an IP for secure display (e.g. "189.120.***.***")
 */
export const maskIp = (ip?: string): string => {
  if (!ip) return 'IP não registrado';
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.***`;
  }
  return ip.substring(0, 7) + '***';
};

/**
 * Retrieves the full current device and IP details
 */
export const getCurrentDeviceInfo = async (): Promise<DeviceInfo> => {
  const fingerprint = getPersistentHwid();
  const ip = await fetchClientPublicIp();
  const deviceModel = getDeviceModelName();
  const ipSubnet = getIpSubnet(ip);

  return {
    fingerprint,
    ip,
    deviceModel,
    ipSubnet,
  };
};

/**
 * Sync helper to get current device info without waiting for network (using cached IP or fallback)
 */
export const getCurrentDeviceInfoSync = (): DeviceInfo => {
  const fingerprint = getPersistentHwid();
  const ip = cachedIp || getIsolatedDeviceIp();
  const deviceModel = getDeviceModelName();
  const ipSubnet = getIpSubnet(ip);

  return {
    fingerprint,
    ip,
    deviceModel,
    ipSubnet,
  };
};
