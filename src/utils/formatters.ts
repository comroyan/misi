/**
 * Formatting utilities for Indonesian currency, phone numbers, and dates
 */

export function formatRupiah(amount: number): string {
  if (isNaN(amount)) return 'Rp0';
  return 'Rp' + amount.toLocaleString('id-ID');
}

/**
 * Normalizes an Indonesian phone number to international format without plus
 * e.g., '081234567890' -> '6281234567890'
 * '+62 812-3456-7890' -> '6281234567890'
 */
export function normalizeIndonesianPhone(raw: string): string {
  if (!raw) return '';
  // Strip non-digits
  let clean = raw.replace(/\D/g, '');

  if (clean.startsWith('08')) {
    clean = '62' + clean.slice(1);
  } else if (clean.startsWith('8')) {
    clean = '628' + clean.slice(1);
  } else if (clean.startsWith('6208')) {
    clean = '628' + clean.slice(4);
  }

  return clean;
}

/**
 * Validates whether the number is a plausible Indonesian mobile number
 * Typically 10 to 14 digits starting with 628
 */
export function isValidIndonesianPhone(raw: string): boolean {
  const norm = normalizeIndonesianPhone(raw);
  return /^628[1-9][0-9]{7,11}$/.test(norm);
}

/**
 * Masks phone number for privacy display:
 * 6281234567890 or 081234567890 -> '0812••••7890'
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone) return '-';
  const clean = phone.replace(/\D/g, '');
  let local = clean;
  if (clean.startsWith('62')) {
    local = '0' + clean.slice(2);
  }
  if (local.length < 8) return local;
  const prefix = local.slice(0, 4);
  const suffix = local.slice(-4);
  return `${prefix}••••${suffix}`;
}

export function formatDateIndonesian(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function formatTimeAgo(dateStr?: string | null): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} mnt lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}
