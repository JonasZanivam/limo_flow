import api from '@/lib/api';
import type { AuthTokensResponse } from '@/types/auth';

export async function loginRequest(
  email: string,
  password: string,
): Promise<AuthTokensResponse> {
  const { data } = await api.post<AuthTokensResponse>('/auth/login', {
    email,
    password,
  });
  return data;
}

export async function refreshRequest(
  refreshToken: string,
): Promise<AuthTokensResponse> {
  const { data } = await api.post<AuthTokensResponse>('/auth/refresh', {
    refreshToken,
  });
  return data;
}

export async function logoutRequest(refreshToken: string): Promise<void> {
  await api.post('/auth/logout', { refreshToken });
}
