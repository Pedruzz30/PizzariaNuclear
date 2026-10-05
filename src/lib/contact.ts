export function brazilianWhatsAppNumber(raw: string | undefined) {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (/^55\d{10,11}$/.test(digits)) return digits;
  if (/^\d{10,11}$/.test(digits)) return `55${digits}`;
  return null;
}
