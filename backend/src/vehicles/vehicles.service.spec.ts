import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { VehiclesService } from './vehicles.service';

describe('VehiclesService', () => {
  let service: VehiclesService;
  let prisma: {
    vehicle: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
  };

  const mockVehicle = {
    id: 'vehicle-1',
    plate: 'ABC1D23',
    model: 'Mercedes-Benz Sprinter Luxo',
    capacity: 12,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { maintenances: 0, events: 0 },
  };

  beforeEach(() => {
    prisma = {
      vehicle: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };

    service = new VehiclesService(prisma as unknown as PrismaService);
  });

  it('deve listar veículos paginados', async () => {
    prisma.vehicle.findMany.mockResolvedValue([mockVehicle]);
    prisma.vehicle.count.mockResolvedValue(1);

    const result = await service.findAll({ page: 1, limit: 10 });

    expect(result.data).toEqual([mockVehicle]);
    expect(result.meta.total).toBe(1);
  });

  it('deve lançar NotFoundException ao buscar veículo inexistente', async () => {
    prisma.vehicle.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('deve criar veículo com placa normalizada', async () => {
    prisma.vehicle.findUnique.mockResolvedValue(null);
    prisma.vehicle.create.mockResolvedValue(mockVehicle);

    await service.create({
      plate: 'abc-1d23',
      model: 'Sprinter',
      capacity: 12,
    });

    expect(prisma.vehicle.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          plate: 'ABC1D23',
          model: 'Sprinter',
        }),
      }),
    );
  });

  it('deve impedir placa duplicada', async () => {
    prisma.vehicle.findUnique.mockResolvedValue({ id: 'other' });

    await expect(
      service.create({
        plate: 'ABC1D23',
        model: 'Sprinter',
        capacity: 12,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('deve lançar ConflictException ao excluir veículo com vínculos', async () => {
    prisma.vehicle.findUnique.mockResolvedValue(mockVehicle);
    prisma.vehicle.delete.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('FK constraint', {
        code: 'P2003',
        clientVersion: '6.0.0',
      }),
    );

    await expect(service.remove('vehicle-1')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
