import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: { findUnique: jest.Mock };
    refreshToken: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      findMany: jest.Mock;
    };
  };
  let jwtService: { signAsync: jest.Mock };
  let configService: { get: jest.Mock };

  const mockUser = {
    id: 'user-1',
    name: 'Admin',
    email: 'admin@limoflow.com',
    password: 'hashed-password',
    role: UserRole.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      user: { findUnique: jest.fn() },
      refreshToken: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    jwtService = { signAsync: jest.fn().mockResolvedValue('access-token') };
    configService = {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          JWT_EXPIRES_IN: '15m',
          JWT_REFRESH_EXPIRES_IN: '7d',
        };
        return values[key];
      }),
    };

    service = new AuthService(
      prisma as unknown as PrismaService,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
    );
  });

  it('deve autenticar com credenciais válidas', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    prisma.refreshToken.create.mockResolvedValue({});

    const result = await service.login('admin@limoflow.com', 'admin123', {
      ipAddress: '127.0.0.1',
    });

    expect(result.accessToken).toBe('access-token');
    expect(result.user.email).toBe('admin@limoflow.com');
    expect(prisma.refreshToken.create).toHaveBeenCalled();
  });

  it('deve rejeitar login com senha inválida', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login('admin@limoflow.com', 'wrong', {}),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('deve rejeitar login com e-mail inexistente', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login('unknown@limoflow.com', 'admin123', {}),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('deve rotacionar refresh token válido', async () => {
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: 'rt-1',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user: mockUser,
    });
    prisma.refreshToken.update.mockResolvedValue({});
    prisma.refreshToken.create.mockResolvedValue({});

    const result = await service.refresh('valid-refresh-token', {});

    expect(result.accessToken).toBe('access-token');
    expect(prisma.refreshToken.update).toHaveBeenCalled();
  });

  it('deve rejeitar refresh token expirado', async () => {
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: 'rt-1',
      revokedAt: null,
      expiresAt: new Date(Date.now() - 60_000),
      user: mockUser,
    });

    await expect(service.refresh('expired-token', {})).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
