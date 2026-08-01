import { z } from 'zod';

const digitsOnly = (value: string) => value.replace(/\D/g, '');

export const companySettingsSchema = z.object({
  legalName: z.string().trim().min(2, 'Informe a razão social'),
  tradeName: z.string().trim().optional(),
  cnpj: z
    .string()
    .trim()
    .transform(digitsOnly)
    .refine((value) => value.length === 14, 'CNPJ deve ter 14 dígitos'),
  street: z.string().trim().min(2, 'Informe o logradouro'),
  number: z.string().trim().min(1, 'Informe o número'),
  complement: z.string().trim().optional(),
  neighborhood: z.string().trim().min(2, 'Informe o bairro'),
  city: z.string().trim().min(2, 'Informe a cidade'),
  state: z
    .string()
    .trim()
    .transform((value) => value.toUpperCase())
    .refine((value) => /^[A-Z]{2}$/.test(value), 'UF deve ter 2 letras'),
  zipCode: z
    .string()
    .trim()
    .transform(digitsOnly)
    .refine((value) => value.length === 8, 'CEP deve ter 8 dígitos'),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^[\d\s()+-]{8,20}$/.test(value),
      'Telefone inválido',
    ),
  email: z
    .string()
    .trim()
    .email('E-mail inválido')
    .optional()
    .or(z.literal('')),
});

export type CompanySettingsFormValues = z.infer<typeof companySettingsSchema>;

export function companySettingsToFormValues(
  settings: {
    legalName: string;
    tradeName: string | null;
    cnpj: string;
    street: string;
    number: string;
    complement: string | null;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string | null;
    email: string | null;
  },
): CompanySettingsFormValues {
  return {
    legalName: settings.legalName,
    tradeName: settings.tradeName ?? '',
    cnpj: settings.cnpj,
    street: settings.street,
    number: settings.number,
    complement: settings.complement ?? '',
    neighborhood: settings.neighborhood,
    city: settings.city,
    state: settings.state,
    zipCode: settings.zipCode,
    phone: settings.phone ?? '',
    email: settings.email ?? '',
  };
}

export function formToUpdateCompanySettingsPayload(
  values: CompanySettingsFormValues,
) {
  return {
    legalName: values.legalName,
    tradeName: values.tradeName || undefined,
    cnpj: values.cnpj,
    street: values.street,
    number: values.number,
    complement: values.complement || undefined,
    neighborhood: values.neighborhood,
    city: values.city,
    state: values.state,
    zipCode: values.zipCode,
    phone: values.phone || undefined,
    email: values.email || undefined,
  };
}
