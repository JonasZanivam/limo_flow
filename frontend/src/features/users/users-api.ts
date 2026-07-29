import api from '@/lib/api';
import type { PaginatedResponse, PaginationParams } from '@/types/pagination';
import type { CreateUserInput, UpdateUserInput, User } from '@/types/user';

export async function fetchUsers(
  params: PaginationParams,
): Promise<PaginatedResponse<User>> {
  const { data } = await api.get<PaginatedResponse<User>>('/users', { params });
  return data;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const { data } = await api.post<User>('/users', input);
  return data;
}

export async function updateUser(
  id: string,
  input: UpdateUserInput,
): Promise<User> {
  const { data } = await api.patch<User>(`/users/${id}`, input);
  return data;
}

export async function deleteUser(id: string): Promise<User> {
  const { data } = await api.delete<User>(`/users/${id}`);
  return data;
}
