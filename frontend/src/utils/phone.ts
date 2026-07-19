/** Best-effort normalization of a device-contact phone number to E.164. Assumes India (+91) for bare 10-digit numbers. */
export function toE164(raw: string, defaultCountryCode = '+91'): string | null {
  const cleaned = raw.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    return /^\+[1-9]\d{6,14}$/.test(cleaned) ? cleaned : null;
  }
  const digits = cleaned.replace(/^0+/, '');
  if (digits.length === 10) return `${defaultCountryCode}${digits}`;
  if (digits.length > 10) return `+${digits}`;
  return null;
}
