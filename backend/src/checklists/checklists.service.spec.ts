import { NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ChecklistsService } from './checklists.service';

describe('ChecklistsService', () => {
  let service: ChecklistsService;
  let prisma: {
    event: { findUnique: jest.Mock };
    eventChecklist: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  const adminUser = { id: 'admin-1', role: UserRole.ADMIN };
  const driverUser = { id: 'driver-1', role: UserRole.DRIVER };

  const mockChecklist = {
    id: 'checklist-1',
    eventId: 'event-1',
    carWashed: false,
    decorated: false,
    driverConfirmed: true,
    fuel: false,
    documentation: false,
  };

  beforeEach(() => {
    prisma = {
      event: { findUnique: jest.fn() },
      eventChecklist: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    service = new ChecklistsService(prisma as unknown as PrismaService);
  });

  it('deve retornar checklist existente para admin', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 'event-1',
      driverId: 'driver-1',
    });
    prisma.eventChecklist.findUnique.mockResolvedValue(mockChecklist);

    const result = await service.getForEvent('event-1', adminUser);

    expect(result).toEqual(mockChecklist);
  });

  it('deve criar checklist quando não existir', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 'event-1',
      driverId: 'driver-1',
    });
    prisma.eventChecklist.findUnique.mockResolvedValue(null);
    prisma.eventChecklist.create.mockResolvedValue(mockChecklist);

    const result = await service.getForEvent('event-1', adminUser);

    expect(prisma.eventChecklist.create).toHaveBeenCalledWith({
      data: { eventId: 'event-1' },
      select: expect.any(Object),
    });
    expect(result).toEqual(mockChecklist);
  });

  it('deve negar acesso de motorista a evento de outro', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 'event-1',
      driverId: 'other-driver',
    });

    await expect(
      service.getForEvent('event-1', driverUser),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deve atualizar item da checklist', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 'event-1',
      driverId: 'driver-1',
    });
    prisma.eventChecklist.findUnique.mockResolvedValue(mockChecklist);
    prisma.eventChecklist.update.mockResolvedValue({
      ...mockChecklist,
      carWashed: true,
    });

    const result = await service.updateForEvent(
      'event-1',
      { carWashed: true },
      driverUser,
    );

    expect(result.carWashed).toBe(true);
  });
});
