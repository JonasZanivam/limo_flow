import type { Response } from 'express';
import type { ConfigService } from '@nestjs/config';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

type AuthCookieTokens = {
  accessToken: string;
  refreshToken: string;
};

function parseDurationMs(duration: string): number {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const value = Number(match[1]);
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * multipliers[match[2]];
}

function cookieBaseOptions() {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
  };
}

function getAuthCookiePaths() {
  const prefix = process.env.COOKIE_PATH_PREFIX ?? '';

  return {
    access: prefix || '/',
    refresh: prefix ? `${prefix}/auth` : '/auth',
  };
}

export function setAuthCookies(
  res: Response,
  tokens: AuthCookieTokens,
  configService: ConfigService,
): void {
  const accessExpiresIn = configService.get<string>('JWT_EXPIRES_IN') ?? '15m';
  const refreshExpiresIn =
    configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';
  const base = cookieBaseOptions();
  const paths = getAuthCookiePaths();

  res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...base,
    maxAge: parseDurationMs(accessExpiresIn),
    path: paths.access,
  });

  res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...base,
    maxAge: parseDurationMs(refreshExpiresIn),
    path: paths.refresh,
  });
}

export function clearAuthCookies(res: Response): void {
  const base = cookieBaseOptions();
  const paths = getAuthCookiePaths();

  res.clearCookie(ACCESS_TOKEN_COOKIE, { ...base, path: paths.access });
  res.clearCookie(REFRESH_TOKEN_COOKIE, { ...base, path: paths.refresh });
}

export function getRefreshTokenFromRequest(
  cookies: Record<string, string> | undefined,
): string | undefined {
  return cookies?.[REFRESH_TOKEN_COOKIE];
}
