import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { EventStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from './events.service';

describe('EventsService', () => {
  let service: EventsService;
  let prisma: {
    event: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    client: { findUnique: jest.Mock };
    vehicle: { findUnique: jest.Mock };
    user: { findFirst: jest.Mock };
  };

  const adminUser = {
    id: 'admin-1',
    email: 'admin@limoflow.com',
    role: UserRole.ADMIN,
  };

  const mockEvent = {
    id: 'event-1',
    startAt: new Date('2026-12-01T14:00:00.000Z'),
    endAt: new Date('2026-12-01T18:00:00.000Z'),
    status: EventStatus.QUOTE,
    church: 'Igreja',
    venue: 'Salão',
    clientId: 'client-1',
    vehicleId: 'vehicle-1',
    driverId: 'driver-1',
    client: { id: 'client-1', brideName: 'Maria', groomName: 'João' },
    vehicle: { id: 'vehicle-1', plate: 'ABC1D23', model: 'Sprinter' },
    driver: { id: 'driver-1', name: 'Motorista' },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      event: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      client: { findUnique: jest.fn() },
      vehicle: { findUnique: jest.fn() },
      user: { findFirst: jest.fn() },
    };

    service = new EventsService(prisma as unknown as PrismaService);
  });

  it('deve listar eventos no intervalo para admin', async () => {
    prisma.event.findMany.mockResolvedValue([mockEvent]);

    const result = await service.findInRange(
      {
        start: '2026-12-01T00:00:00.000Z',
        end: '2026-12-31T23:59:59.999Z',
      },
      adminUser,
    );

    expect(result).toEqual([mockEvent]);
  });

  it('deve filtrar eventos do motorista logado', async () => {
    prisma.event.findMany.mockResolvedValue([mockEvent]);

    await service.findInRange(
      {
        start: '2026-12-01T00:00:00.000Z',
        end: '2026-12-31T23:59:59.999Z',
      },
      { id: 'driver-1', email: 'driver@test.com', role: UserRole.DRIVER },
    );

    expect(prisma.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ driverId: 'driver-1' }),
      }),
    );
  });

  it('deve impedir conflito de veículo', async () => {
    prisma.client.findUnique.mockResolvedValue({ id: 'client-1' });
    prisma.vehicle.findUnique.mockResolvedValue({ id: 'vehicle-1' });
    prisma.event.findFirst.mockResolvedValue({ id: 'other-event' });

    await expect(
      service.create({
        startAt: '2026-12-01T14:00:00.000Z',
        endAt: '2026-12-01T18:00:00.000Z',
        clientId: 'client-1',
        vehicleId: 'vehicle-1',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('deve impedir término antes do início', async () => {
    prisma.client.findUnique.mockResolvedValue({ id: 'client-1' });

    await expect(
      service.create({
        startAt: '2026-12-01T18:00:00.000Z',
        endAt: '2026-12-01T14:00:00.000Z',
        clientId: 'client-1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('deve lançar NotFoundException para evento inexistente', async () => {
    prisma.event.findUnique.mockResolvedValue(null);

    await expect(
      service.findOne('missing', adminUser),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
