export const WHATSAPP_TEMPLATES = {
  PROPOSAL:
    'Olá {{noiva}} e {{noivo}}! Segue nossa proposta para o casamento em {{data}}. Valor: R$ {{valor}}.',
  CONTRACT:
    'Olá {{noiva}} e {{noivo}}! Segue o contrato do serviço de limousine para {{data}}.',
} as const;

export type WhatsAppTemplateType = keyof typeof WHATSAPP_TEMPLATES;

export function buildWhatsAppUrl(phone: string, message: string): string {
  const normalized = phone.replace(/\D/g, '');
  const withCountry = normalized.startsWith('55') ? normalized : `55${normalized}`;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
}

export function renderTemplate(
  template: WhatsAppTemplateType,
  vars: Record<string, string>,
): string {
  let message: string = WHATSAPP_TEMPLATES[template];
  for (const [key, value] of Object.entries(vars)) {
    message = message.replaceAll(`{{${key}}}`, value);
  }
  return message;
}
