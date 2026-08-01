import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/auth.decorators';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: { getAllAndOverride: jest.Mock };

  const createContext = (user?: { role: UserRole }) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    }) as ExecutionContext;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('deve permitir quando rota não exige role', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('deve permitir ADMIN em rota ADMIN', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    expect(
      guard.canActivate(
        createContext({
          role: UserRole.ADMIN,
          id: '1',
          email: 'a@b.com',
        } as never),
      ),
    ).toBe(true);
  });

  it('deve negar DRIVER em rota ADMIN', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    expect(() =>
      guard.canActivate(
        createContext({
          role: UserRole.DRIVER,
          id: '1',
          email: 'a@b.com',
        } as never),
      ),
    ).toThrow(ForbiddenException);
  });

  it('deve consultar metadata ROLES_KEY', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = createContext();

    guard.canActivate(context);

    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  });
});
