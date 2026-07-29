import {
  BadRequestException,
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
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

const clientSelect = {
  id: true,
  brideName: true,
  groomName: true,
  phones: true,
  email: true,
  weddingDate: true,
  church: true,
  venue: true,
  notes: true,
  referredById: true,
  referredBy: {
    select: {
      id: true,
      brideName: true,
      groomName: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ClientSelect;

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: PaginationQueryDto) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);
    const where = this.buildSearchWhere(query.search);

    return Promise.all([
      this.prisma.client.findMany({
        where,
        select: clientSelect,
        orderBy: [
          { weddingDate: { sort: 'asc', nulls: 'last' } },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      this.prisma.client.count({ where }),
    ]).then(([data, total]) => buildPaginatedResponse(data, total, page, limit));
  }

  findReferralOptions() {
    return this.prisma.client.findMany({
      select: {
        id: true,
        brideName: true,
        groomName: true,
      },
      orderBy: [{ brideName: 'asc' }, { groomName: 'asc' }],
      take: 200,
    });
  }

  private buildSearchWhere(search?: string): Prisma.ClientWhereInput {
    const term = search?.trim();
    if (!term) return {};

    return {
      OR: [
        { brideName: { contains: term, mode: 'insensitive' } },
        { groomName: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { phones: { has: term } },
      ],
    };
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      select: clientSelect,
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return client;
  }

  async create(dto: CreateClientDto) {
    await this.validateReferral(dto.referredById);

    return this.prisma.client.create({
      data: {
        brideName: dto.brideName.trim(),
        groomName: dto.groomName.trim(),
        phones: this.normalizePhones(dto.phones),
        email: dto.email?.trim().toLowerCase() || null,
        weddingDate: dto.weddingDate ? new Date(dto.weddingDate) : null,
        church: dto.church?.trim() || null,
        venue: dto.venue?.trim() || null,
        notes: dto.notes?.trim() || null,
        referredById: dto.referredById || null,
      },
      select: clientSelect,
    });
  }

  async update(id: string, dto: UpdateClientDto) {
    await this.findOne(id);

    if (dto.referredById === id) {
      throw new BadRequestException('Cliente não pode se indicar');
    }

    if (dto.referredById !== undefined && dto.referredById !== null) {
      await this.validateReferral(dto.referredById);
    }

    const data: Prisma.ClientUpdateInput = {};

    if (dto.brideName !== undefined) data.brideName = dto.brideName.trim();
    if (dto.groomName !== undefined) data.groomName = dto.groomName.trim();
    if (dto.phones !== undefined) data.phones = this.normalizePhones(dto.phones);
    if (dto.email !== undefined) {
      data.email = dto.email.trim().toLowerCase() || null;
    }
    if (dto.weddingDate !== undefined) {
      data.weddingDate = dto.weddingDate ? new Date(dto.weddingDate) : null;
    }
    if (dto.church !== undefined) data.church = dto.church.trim() || null;
    if (dto.venue !== undefined) data.venue = dto.venue.trim() || null;
    if (dto.notes !== undefined) data.notes = dto.notes.trim() || null;
    if (dto.referredById !== undefined) {
      data.referredBy = dto.referredById
        ? { connect: { id: dto.referredById } }
        : { disconnect: true };
    }

    return this.prisma.client.update({
      where: { id },
      data,
      select: clientSelect,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    try {
      return await this.prisma.client.delete({
        where: { id },
        select: clientSelect,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'Cliente possui registros vinculados e não pode ser excluído',
        );
      }

      throw error;
    }
  }

  private normalizePhones(phones: string[]): string[] {
    return phones.map((phone) => phone.trim()).filter(Boolean);
  }

  private async validateReferral(referredById?: string | null) {
    if (!referredById) return;

    const referrer = await this.prisma.client.findUnique({
      where: { id: referredById },
      select: { id: true },
    });

    if (!referrer) {
      throw new NotFoundException('Cliente indicador não encontrado');
    }
  }
}
