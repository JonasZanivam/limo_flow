import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { AuthService } from '../auth/auth.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  buildPaginatedResponse,
  getPaginationParams,
} from '../common/utils/pagination';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  findDrivers() {
    return this.prisma.user.findMany({
      where: { role: UserRole.DRIVER },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  findAll(query: PaginationQueryDto) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);
    const where = this.buildSearchWhere(query.search);

    return Promise.all([
      this.prisma.user.findMany({
        where,
        select: userSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]).then(([data, total]) => buildPaginatedResponse(data, total, page, limit));
  }

  private buildSearchWhere(search?: string): Prisma.UserWhereInput {
    const term = search?.trim();
    if (!term) return {};

    return {
      OR: [
        { name: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
      ],
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async create(dto: CreateUserDto) {
    const email = dto.email.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const password = await AuthService.hashPassword(dto.password);

    return this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email,
        password,
        role: dto.role,
      },
      select: userSelect,
    });
  }

  async update(id: string, dto: UpdateUserDto, currentUserId: string) {
    await this.findOne(id);

    if (dto.email) {
      const email = dto.email.trim().toLowerCase();
      const existing = await this.prisma.user.findFirst({
        where: { email, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('E-mail já cadastrado');
      }
    }

    const data: Prisma.UserUpdateInput = {};

    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.email !== undefined) data.email = dto.email.trim().toLowerCase();
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.password !== undefined) {
      data.password = await AuthService.hashPassword(dto.password);
      if (id === currentUserId) {
        await this.authService.logoutAll(id);
      }
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });
  }

  async remove(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new ForbiddenException('Não é possível remover o próprio usuário');
    }

    await this.findOne(id);
    await this.authService.logoutAll(id);

    return this.prisma.user.delete({
      where: { id },
      select: userSelect,
    });
  }

  async countAdmins(): Promise<number> {
    return this.prisma.user.count({ where: { role: UserRole.ADMIN } });
  }
}
