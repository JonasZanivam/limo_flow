import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  buildPaginatedResponse,
  getPaginationParams,
} from '../common/utils/pagination';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

const vehicleSelect = {
  id: true,
  plate: true,
  model: true,
  capacity: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      maintenances: true,
      events: true,
    },
  },
} satisfies Prisma.VehicleSelect;

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: PaginationQueryDto) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);
    const where = this.buildSearchWhere(query.search);

    return Promise.all([
      this.prisma.vehicle.findMany({
        where,
        select: vehicleSelect,
        orderBy: { model: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.vehicle.count({ where }),
    ]).then(([data, total]) => buildPaginatedResponse(data, total, page, limit));
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      select: vehicleSelect,
    });

    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado');
    }

    return vehicle;
  }

  async create(dto: CreateVehicleDto) {
    const plate = this.normalizePlate(dto.plate);

    await this.ensurePlateAvailable(plate);

    return this.prisma.vehicle.create({
      data: {
        plate,
        model: dto.model.trim(),
        capacity: dto.capacity,
      },
      select: vehicleSelect,
    });
  }

  async update(id: string, dto: UpdateVehicleDto) {
    await this.findOne(id);

    const data: Prisma.VehicleUpdateInput = {};

    if (dto.plate !== undefined) {
      const plate = this.normalizePlate(dto.plate);
      await this.ensurePlateAvailable(plate, id);
      data.plate = plate;
    }

    if (dto.model !== undefined) data.model = dto.model.trim();
    if (dto.capacity !== undefined) data.capacity = dto.capacity;

    return this.prisma.vehicle.update({
      where: { id },
      data,
      select: vehicleSelect,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    try {
      return await this.prisma.vehicle.delete({
        where: { id },
        select: vehicleSelect,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'Veículo possui registros vinculados e não pode ser excluído',
        );
      }

      throw error;
    }
  }

  private buildSearchWhere(search?: string): Prisma.VehicleWhereInput {
    const term = search?.trim();
    if (!term) return {};

    const plate = this.normalizePlate(term);

    return {
      OR: [
        { plate: { contains: plate, mode: 'insensitive' } },
        { model: { contains: term, mode: 'insensitive' } },
      ],
    };
  }

  private normalizePlate(plate: string) {
    return plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  }

  private async ensurePlateAvailable(plate: string, excludeId?: string) {
    const existing = await this.prisma.vehicle.findUnique({
      where: { plate },
      select: { id: true },
    });

    if (existing && existing.id !== excludeId) {
      throw new ConflictException('Placa já cadastrada');
    }
  }
}
