import { z } from 'zod';

const paymentBaseSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: 'Valor inválido' })
    .min(0.01, 'Valor deve ser maior que zero'),
  type: z.enum(['DEPOSIT', 'BALANCE']),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE']),
  method: z.enum(['PIX', 'CASH', 'CARD', '']).optional(),
  dueDate: z.string().optional(),
  paidAt: z.string().optional(),
  clientId: z.string().uuid('Selecione um cliente'),
  eventId: z.string().optional(),
});

export const createPaymentSchema = paymentBaseSchema;
export const updatePaymentSchema = paymentBaseSchema;

export type PaymentFormValues = z.infer<typeof createPaymentSchema>;

export const PAYMENT_TYPE_LABELS: Record<PaymentFormValues['type'], string> = {
  DEPOSIT: 'Sinal',
  BALANCE: 'Saldo',
};

export const PAYMENT_STATUS_LABELS: Record<
  PaymentFormValues['status'],
  string
> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  OVERDUE: 'Atrasado',
};

export const PAYMENT_METHOD_LABELS: Record<
  Exclude<PaymentFormValues['method'], '' | undefined>,
  string
> = {
  PIX: 'PIX',
  CASH: 'Dinheiro',
  CARD: 'Cartão',
};

export function formToCreatePaymentPayload(values: PaymentFormValues) {
  return {
    amount: values.amount,
    type: values.type,
    status: values.status,
    method: values.method || undefined,
    dueDate: values.dueDate || undefined,
    paidAt: values.status === 'PAID' ? values.paidAt || new Date().toISOString() : undefined,
    clientId: values.clientId,
    eventId: values.eventId || undefined,
  };
}

export function formToUpdatePaymentPayload(values: PaymentFormValues) {
  return {
    ...formToCreatePaymentPayload(values),
    method: values.method || null,
    dueDate: values.dueDate || null,
    paidAt:
      values.status === 'PAID'
        ? values.paidAt || new Date().toISOString()
        : null,
    eventId: values.eventId || null,
  };
}
