export type PaymentType = 'DEPOSIT' | 'BALANCE';
export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE';
export type PaymentMethod = 'PIX' | 'CASH' | 'CARD';

export type Payment = {
  id: string;
  amount: number;
  type: PaymentType;
  status: PaymentStatus;
  method: PaymentMethod | null;
  dueDate: string | null;
  paidAt: string | null;
  clientId: string;
  eventId: string | null;
  client: {
    id: string;
    brideName: string;
    groomName: string;
  };
  event: {
    id: string;
    startAt: string;
    status: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type CreatePaymentInput = {
  amount: number;
  type: PaymentType;
  status?: PaymentStatus;
  method?: PaymentMethod;
  dueDate?: string;
  paidAt?: string;
  clientId: string;
  eventId?: string;
};

export type UpdatePaymentInput = Partial<Omit<CreatePaymentInput, 'method' | 'dueDate' | 'paidAt' | 'eventId'>> & {
  method?: PaymentMethod | null;
  dueDate?: string | null;
  paidAt?: string | null;
  eventId?: string | null;
};

export type PaymentsQueryParams = {
  page: number;
  limit: number;
  search?: string;
  status?: PaymentStatus;
};
