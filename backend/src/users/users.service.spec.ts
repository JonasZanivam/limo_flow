import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

jest.mock('../auth/auth.service', () => ({
  AuthService: {
    hashPassword: jest.fn().mockResolvedValue('hashed-password'),
  },
}));

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
  };
  let authService: { logoutAll: jest.Mock };

  const mockUser = {
    id: 'user-1',
    name: 'Admin',
    email: 'admin@limoflow.com',
    role: UserRole.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };
    authService = { logoutAll: jest.fn() };

    service = new UsersService(
      prisma as unknown as PrismaService,
      authService as unknown as AuthService,
    );
  });

  it('deve listar usuários sem senha', async () => {
    prisma.user.findMany.mockResolvedValue([mockUser]);

    const users = await service.findAll();

    expect(users).toEqual([mockUser]);
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.not.objectContaining({ password: true }),
      }),
    );
  });

  it('deve lançar NotFoundException quando usuário não existe', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('deve impedir e-mail duplicado na criação', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    await expect(
      service.create({
        name: 'Novo',
        email: 'admin@limoflow.com',
        password: 'Senha@123',
        role: UserRole.DRIVER,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('deve impedir auto-remoção', async () => {
    await expect(service.remove('user-1', 'user-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('deve remover usuário e revogar sessões', async () => {
    prisma.user.findUnique.mockResolvedValue({
      ...mockUser,
      role: UserRole.DRIVER,
    });
    prisma.user.delete.mockResolvedValue(mockUser);

    await service.remove('user-2', 'user-1');

    expect(authService.logoutAll).toHaveBeenCalledWith('user-2');
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: 'user-2' },
      select: expect.any(Object),
    });
  });
});
