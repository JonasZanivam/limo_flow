import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventStatus, Prisma, UserRole } from '@prisma/client';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { EventsQueryDto } from './dto/events-query.dto';
import { UpdateEventDto } from './dto/update-event.dto';

const eventSelect = {
  id: true,
  startAt: true,
  endAt: true,
  status: true,
  church: true,
  venue: true,
  clientId: true,
  vehicleId: true,
  driverId: true,
  client: {
    select: {
      id: true,
      brideName: true,
      groomName: true,
    },
  },
  vehicle: {
    select: {
      id: true,
      plate: true,
      model: true,
    },
  },
  driver: {
    select: {
      id: true,
      name: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.EventSelect;

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  findInRange(query: EventsQueryDto, user: AuthenticatedUser) {
    const start = new Date(query.start);
    const end = new Date(query.end);

    const where: Prisma.EventWhereInput = {
      startAt: { lt: end },
      endAt: { gt: start },
    };

    if (user.role === UserRole.DRIVER) {
      where.driverId = user.id;
    }

    return this.prisma.event.findMany({
      where,
      select: eventSelect,
      orderBy: { startAt: 'asc' },
    });
  }

  async findOne(id: string, user: AuthenticatedUser) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: eventSelect,
    });

    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }

    if (user.role === UserRole.DRIVER && event.driverId !== user.id) {
      throw new NotFoundException('Evento não encontrado');
    }

    return event;
  }

  async create(dto: CreateEventDto) {
    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);

    await this.validateReferences(dto.clientId, dto.vehicleId, dto.driverId);
    await this.assertNoConflict({
      startAt,
      endAt,
      vehicleId: dto.vehicleId,
      driverId: dto.driverId,
    });

    return this.prisma.event.create({
      data: {
        startAt,
        endAt,
        status: dto.status ?? EventStatus.QUOTE,
        church: dto.church?.trim() || null,
        venue: dto.venue?.trim() || null,
        clientId: dto.clientId,
        vehicleId: dto.vehicleId || null,
        driverId: dto.driverId || null,
      },
      select: eventSelect,
    });
  }

  async update(id: string, dto: UpdateEventDto) {
    const current = await this.findOneForMutation(id);

    const startAt = dto.startAt ? new Date(dto.startAt) : current.startAt;
    const endAt = dto.endAt ? new Date(dto.endAt) : current.endAt;
    const vehicleId =
      dto.vehicleId !== undefined ? dto.vehicleId : current.vehicleId;
    const driverId =
      dto.driverId !== undefined ? dto.driverId : current.driverId;

    if (dto.clientId) {
      await this.validateClient(dto.clientId);
    }

    if (dto.vehicleId) {
      await this.validateVehicle(dto.vehicleId);
    }

    if (dto.driverId) {
      await this.validateDriver(dto.driverId);
    }

    await this.assertNoConflict({
      startAt,
      endAt,
      vehicleId,
      driverId,
      excludeEventId: id,
    });

    const data: Prisma.EventUpdateInput = {};

    if (dto.startAt !== undefined) data.startAt = startAt;
    if (dto.endAt !== undefined) data.endAt = endAt;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.church !== undefined) data.church = dto.church.trim() || null;
    if (dto.venue !== undefined) data.venue = dto.venue.trim() || null;
    if (dto.clientId !== undefined) data.client = { connect: { id: dto.clientId } };
    if (dto.vehicleId !== undefined) {
      data.vehicle = dto.vehicleId
        ? { connect: { id: dto.vehicleId } }
        : { disconnect: true };
    }
    if (dto.driverId !== undefined) {
      data.driver = dto.driverId
        ? { connect: { id: dto.driverId } }
        : { disconnect: true };
    }

    return this.prisma.event.update({
      where: { id },
      data,
      select: eventSelect,
    });
  }

  async remove(id: string) {
    await this.findOneForMutation(id);

    return this.prisma.event.delete({
      where: { id },
      select: eventSelect,
    });
  }

  private async findOneForMutation(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });

    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }

    return event;
  }

  private async validateReferences(
    clientId: string,
    vehicleId?: string,
    driverId?: string,
  ) {
    await this.validateClient(clientId);

    if (vehicleId) {
      await this.validateVehicle(vehicleId);
    }

    if (driverId) {
      await this.validateDriver(driverId);
    }
  }

  private async validateClient(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }
  }

  private async validateVehicle(vehicleId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true },
    });

    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado');
    }
  }

  private async validateDriver(driverId: string) {
    const driver = await this.prisma.user.findFirst({
      where: { id: driverId, role: UserRole.DRIVER },
      select: { id: true },
    });

    if (!driver) {
      throw new NotFoundException('Motorista não encontrado');
    }
  }

  private async assertNoConflict(params: {
    startAt: Date;
    endAt: Date;
    vehicleId?: string | null;
    driverId?: string | null;
    excludeEventId?: string;
  }) {
    if (params.endAt <= params.startAt) {
      throw new BadRequestException(
        'A data de término deve ser posterior à data de início',
      );
    }

    const overlapBase: Prisma.EventWhereInput = {
      status: { not: EventStatus.CANCELLED },
      startAt: { lt: params.endAt },
      endAt: { gt: params.startAt },
      ...(params.excludeEventId ? { id: { not: params.excludeEventId } } : {}),
    };

    if (params.vehicleId) {
      const vehicleConflict = await this.prisma.event.findFirst({
        where: { ...overlapBase, vehicleId: params.vehicleId },
        select: { id: true },
      });

      if (vehicleConflict) {
        throw new ConflictException('Veículo indisponível neste horário');
      }
    }

    if (params.driverId) {
      const driverConflict = await this.prisma.event.findFirst({
        where: { ...overlapBase, driverId: params.driverId },
        select: { id: true },
      });

      if (driverConflict) {
        throw new ConflictException('Motorista indisponível neste horário');
      }
    }
  }
}
