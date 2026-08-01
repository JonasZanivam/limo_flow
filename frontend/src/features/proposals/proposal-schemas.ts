import { z } from 'zod';

const proposalBaseSchema = z.object({
  value: z.coerce
    .number({ invalid_type_error: 'Valor inválido' })
    .min(0.01, 'Valor deve ser maior que zero'),
  hours: z.coerce
    .number({ invalid_type_error: 'Horas inválidas' })
    .int('Horas deve ser um número inteiro')
    .min(1, 'Mínimo 1 hora')
    .max(24, 'Máximo 24 horas'),
  mileage: z
    .union([
      z.literal(''),
      z.coerce
        .number({ invalid_type_error: 'Quilometragem inválida' })
        .min(0, 'Quilometragem não pode ser negativa'),
    ])
    .optional(),
  status: z.enum(['SENT', 'WAITING', 'ACCEPTED', 'REJECTED']),
  clientId: z.string().uuid('Selecione um cliente'),
  vehicleId: z.string().optional(),
});

export const createProposalSchema = proposalBaseSchema;
export const updateProposalSchema = proposalBaseSchema;

export type ProposalFormValues = z.infer<typeof createProposalSchema>;

export const PROPOSAL_STATUS_LABELS: Record<
  ProposalFormValues['status'],
  string
> = {
  SENT: 'Enviada',
  WAITING: 'Aguardando',
  ACCEPTED: 'Aceita',
  REJECTED: 'Recusada',
};

export function formToCreateProposalPayload(values: ProposalFormValues) {
  return {
    value: values.value,
    hours: values.hours,
    mileage: values.mileage === '' || values.mileage == null ? undefined : values.mileage,
    status: values.status,
    clientId: values.clientId,
    vehicleId: values.vehicleId || undefined,
  };
}

export function formToUpdateProposalPayload(values: ProposalFormValues) {
  return {
    ...formToCreateProposalPayload(values),
    vehicleId: values.vehicleId || null,
    mileage:
      values.mileage === '' || values.mileage == null ? null : values.mileage,
  };
}
