import api from '@/lib/api';
import type {
  Client,
  ClientReferral,
  CreateClientInput,
  UpdateClientInput,
} from '@/types/client';
import type { PaginatedResponse, PaginationParams } from '@/types/pagination';

export async function fetchClients(
  params: PaginationParams,
): Promise<PaginatedResponse<Client>> {
  const { data } = await api.get<PaginatedResponse<Client>>('/clients', {
    params,
  });
  return data;
}

export async function fetchClientOptions(): Promise<ClientReferral[]> {
  const { data } = await api.get<ClientReferral[]>('/clients/options');
  return data;
}

export async function createClient(input: CreateClientInput): Promise<Client> {
  const { data } = await api.post<Client>('/clients', input);
  return data;
}

export async function updateClient(
  id: string,
  input: UpdateClientInput,
): Promise<Client> {
  const { data } = await api.patch<Client>(`/clients/${id}`, input);
  return data;
}

export async function deleteClient(id: string): Promise<Client> {
  const { data } = await api.delete<Client>(`/clients/${id}`);
  return data;
}
