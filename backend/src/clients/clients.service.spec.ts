import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ClientsService } from './clients.service';

describe('ClientsService', () => {
  let service: ClientsService;
  let prisma: {
    client: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const mockClient = {
    id: 'client-1',
    brideName: 'Maria',
    groomName: 'João',
    phones: ['11999999999'],
    email: 'maria@email.com',
    weddingDate: new Date('2026-12-01'),
    church: 'Igreja São Paulo',
    venue: 'Salão Crystal',
    notes: null,
    referredById: null,
    referredBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      client: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };

    service = new ClientsService(prisma as unknown as PrismaService);
  });

  it('deve listar clientes paginados', async () => {
    prisma.client.findMany.mockResolvedValue([mockClient]);
    prisma.client.count.mockResolvedValue(1);

    const result = await service.findAll({ page: 1, limit: 10 });

    expect(result.data).toEqual([mockClient]);
    expect(result.meta.total).toBe(1);
  });

  it('deve lançar NotFoundException ao buscar cliente inexistente', async () => {
    prisma.client.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('deve criar cliente', async () => {
    prisma.client.create.mockResolvedValue(mockClient);

    await expect(
      service.create({
        brideName: 'Maria',
        groomName: 'João',
        phones: ['(11) 99999-9999'],
      }),
    ).resolves.toEqual(mockClient);

    expect(prisma.client.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          brideName: 'Maria',
          groomName: 'João',
          phones: ['(11) 99999-9999'],
        }),
      }),
    );
  });

  it('deve impedir autoindicação', async () => {
    prisma.client.findUnique.mockResolvedValue(mockClient);

    await expect(
      service.update('client-1', { referredById: 'client-1' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('deve lançar ConflictException ao excluir cliente com vínculos', async () => {
    prisma.client.findUnique.mockResolvedValue(mockClient);
    prisma.client.delete.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('FK constraint', {
        code: 'P2003',
        clientVersion: '6.0.0',
      }),
    );

    await expect(service.remove('client-1')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
