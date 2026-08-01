import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: {
    payment: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
      aggregate: jest.Mock;
    };
    client: { findUnique: jest.Mock };
    event: { findUnique: jest.Mock };
  };

  const mockPayment = {
    id: 'payment-1',
    amount: 1500,
    type: 'DEPOSIT',
    status: 'PENDING',
    method: 'PIX',
    dueDate: new Date('2026-11-01'),
    paidAt: null,
    clientId: 'client-1',
    eventId: null,
    client: {
      id: 'client-1',
      brideName: 'Ana',
      groomName: 'Pedro',
    },
    event: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      payment: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        aggregate: jest.fn(),
      },
      client: { findUnique: jest.fn() },
      event: { findUnique: jest.fn() },
    };

    service = new PaymentsService(prisma as unknown as PrismaService);
  });

  it('deve listar pagamentos paginados', async () => {
    prisma.payment.findMany.mockResolvedValue([mockPayment]);
    prisma.payment.count.mockResolvedValue(1);

    const result = await service.findAll({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].amount).toBe(1500);
  });

  it('deve calcular saldo do cliente', async () => {
    prisma.client.findUnique.mockResolvedValue({ id: 'client-1' });
    prisma.payment.aggregate
      .mockResolvedValueOnce({ _sum: { amount: 1500 } })
      .mockResolvedValueOnce({ _sum: { amount: 3500 } });

    const result = await service.getClientBalance('client-1');

    expect(result.paidTotal).toBe(1500);
    expect(result.pendingTotal).toBe(3500);
  });

  it('deve lançar erro quando pagamento não existe', async () => {
    prisma.payment.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
