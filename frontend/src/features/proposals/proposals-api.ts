import api from '@/lib/api';
import type { PaginatedResponse, PaginationParams } from '@/types/pagination';
import type {
  CreateProposalInput,
  Proposal,
  UpdateProposalInput,
} from '@/types/proposal';

export async function fetchProposals(
  params: PaginationParams,
): Promise<PaginatedResponse<Proposal>> {
  const { data } = await api.get<PaginatedResponse<Proposal>>('/proposals', {
    params,
  });
  return data;
}

export async function createProposal(
  input: CreateProposalInput,
): Promise<Proposal> {
  const { data } = await api.post<Proposal>('/proposals', input);
  return data;
}

export async function updateProposal(
  id: string,
  input: UpdateProposalInput,
): Promise<Proposal> {
  const { data } = await api.patch<Proposal>(`/proposals/${id}`, input);
  return data;
}

export async function deleteProposal(id: string): Promise<Proposal> {
  const { data } = await api.delete<Proposal>(`/proposals/${id}`);
  return data;
}

export async function fetchProposalWhatsAppUrl(
  id: string,
): Promise<{ url: string }> {
  const { data } = await api.get<{ url: string }>(
    `/proposals/${id}/whatsapp-url`,
  );
  return data;
}

export async function downloadProposalPdf(id: string): Promise<void> {
  const response = await api.get<Blob>(`/proposals/${id}/pdf`, {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = `proposta-${id.slice(0, 8)}.pdf`;
  link.click();
  window.URL.revokeObjectURL(url);
}
