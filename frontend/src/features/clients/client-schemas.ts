import { z } from 'zod';
import type { CreateClientInput, UpdateClientInput } from '@/types/client';

const PHONE_REGEX = /^[\d\s()+-]{8,20}$/;

function parsePhones(value: string) {
  return value
    .split(',')
    .map((phone) => phone.trim())
    .filter(Boolean);
}

const phonesField = z
  .string()
  .trim()
  .min(1, 'Informe ao menos um telefone')
  .refine(
    (value) => parsePhones(value).every((phone) => PHONE_REGEX.test(phone)),
    'Um ou mais telefones são inválidos',
  );

const optionalEmail = z
  .string()
  .trim()
  .email('E-mail inválido')
  .optional()
  .or(z.literal(''));

const optionalDate = z.string().optional().or(z.literal(''));

const optionalText = z.string().trim().optional().or(z.literal(''));

const referredByField = z.string().uuid().optional().or(z.literal(''));

const clientBaseSchema = z.object({
  brideName: z
    .string()
    .trim()
    .min(2, 'Nome da noiva deve ter no mínimo 2 caracteres'),
  groomName: z
    .string()
    .trim()
    .min(2, 'Nome do noivo deve ter no mínimo 2 caracteres'),
  phones: phonesField,
  email: optionalEmail,
  weddingDate: optionalDate,
  church: optionalText,
  venue: optionalText,
  notes: optionalText,
  referredById: referredByField,
});

export const createClientSchema = clientBaseSchema;
export const updateClientSchema = clientBaseSchema;

export type ClientFormValues = z.infer<typeof createClientSchema>;

export function phonesToInput(phones: string[]) {
  return phones.join(', ');
}

export function inputToPhones(value: string) {
  return parsePhones(value);
}

export function formToCreatePayload(values: ClientFormValues): CreateClientInput {
  return {
    brideName: values.brideName,
    groomName: values.groomName,
    phones: inputToPhones(values.phones),
    email: values.email || undefined,
    weddingDate: values.weddingDate || undefined,
    church: values.church || undefined,
    venue: values.venue || undefined,
    notes: values.notes || undefined,
    referredById: values.referredById || undefined,
  };
}

export function formToUpdatePayload(values: ClientFormValues): UpdateClientInput {
  return {
    ...formToCreatePayload(values),
    referredById: values.referredById || null,
  };
}
