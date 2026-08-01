import api from '@/lib/api';
import type {
  CreateProposalTramiteInput,
  ProposalTramite,
} from '@/types/proposal-tramite';

export async function fetchProposalTramites(
  proposalId: string,
): Promise<ProposalTramite[]> {
  const { data } = await api.get<ProposalTramite[]>(
    `/proposals/${proposalId}/tramites`,
  );
  return data;
}

export async function createProposalTramite(
  proposalId: string,
  input: CreateProposalTramiteInput,
): Promise<ProposalTramite> {
  const { data } = await api.post<ProposalTramite>(
    `/proposals/${proposalId}/tramites`,
    input,
  );
  return data;
}
