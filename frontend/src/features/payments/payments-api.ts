import api from '@/lib/api';
import type {
  CreatePaymentInput,
  Payment,
  PaymentsQueryParams,
  UpdatePaymentInput,
} from '@/types/payment';
import type { PaginatedResponse } from '@/types/pagination';

export async function fetchPayments(
  params: PaymentsQueryParams,
): Promise<PaginatedResponse<Payment>> {
  const { data } = await api.get<PaginatedResponse<Payment>>('/payments', {
    params,
  });
  return data;
}

export async function createPayment(
  input: CreatePaymentInput,
): Promise<Payment> {
  const { data } = await api.post<Payment>('/payments', input);
  return data;
}

export async function updatePayment(
  id: string,
  input: UpdatePaymentInput,
): Promise<Payment> {
  const { data } = await api.patch<Payment>(`/payments/${id}`, input);
  return data;
}

export async function deletePayment(id: string): Promise<Payment> {
  const { data } = await api.delete<Payment>(`/payments/${id}`);
  return data;
}

export async function markPaymentAsPaid(id: string): Promise<Payment> {
  return updatePayment(id, {
    status: 'PAID',
    paidAt: new Date().toISOString(),
  });
}
