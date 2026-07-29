export type UserRole = 'ADMIN' | 'DRIVER';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type AuthTokensResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: AuthUser;
};

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  DRIVER: 'Motorista',
};
