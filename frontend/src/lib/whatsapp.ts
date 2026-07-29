export function buildWhatsAppUrl(phone: string, message: string): string {
  const normalized = phone.replace(/\D/g, '');
  const withCountry = normalized.startsWith('55')
    ? normalized
    : `55${normalized}`;

  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
}

export function buildClientGreeting(brideName: string, groomName: string) {
  return `Olá ${brideName} e ${groomName}! Aqui é da LimoFlow.`;
}
