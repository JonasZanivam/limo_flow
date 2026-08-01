import api from '@/lib/api';
import type { CreateContractInput, Contract } from '@/types/contract';
import type { PaginatedResponse, PaginationParams } from '@/types/pagination';

export async function fetchContracts(
  params: PaginationParams,
): Promise<PaginatedResponse<Contract>> {
  const { data } = await api.get<PaginatedResponse<Contract>>('/contracts', {
    params,
  });
  return data;
}

export async function createContract(
  input: CreateContractInput,
): Promise<Contract> {
  const { data } = await api.post<Contract>('/contracts', input);
  return data;
}

export async function deleteContract(id: string): Promise<Contract> {
  const { data } = await api.delete<Contract>(`/contracts/${id}`);
  return data;
}

export async function fetchContractWhatsAppUrl(
  id: string,
): Promise<{ url: string }> {
  const { data } = await api.get<{ url: string }>(
    `/contracts/${id}/whatsapp-url`,
  );
  return data;
}

export async function downloadContractPdf(id: string): Promise<void> {
  const response = await api.get<Blob>(`/contracts/${id}/pdf`, {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = `contrato-${id.slice(0, 8)}.pdf`;
  link.click();
  window.URL.revokeObjectURL(url);
}
