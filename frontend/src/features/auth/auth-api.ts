import api from '@/lib/api';
import type { AuthSessionResponse, AuthUser } from '@/types/auth';

export async function loginRequest(
  email: string,
  password: string,
): Promise<AuthSessionResponse> {
  const { data } = await api.post<AuthSessionResponse>('/auth/login', {
    email,
    password,
  });
  return data;
}

export async function meRequest(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>('/auth/me');
  return data;
}

export async function logoutRequest(): Promise<void> {
  await api.post('/auth/logout');
}
