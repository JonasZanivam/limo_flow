export type ProposalTramiteType =
  | 'GENERATED'
  | 'SENT'
  | 'WAITING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CONTRACT_CREATED'
  | 'NOTE';

export type ProposalTramite = {
  id: string;
  proposalId: string;
  type: ProposalTramiteType;
  description: string | null;
  userId: string | null;
  user: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
};

export type CreateProposalTramiteInput = {
  type: Exclude<
    ProposalTramiteType,
    'GENERATED' | 'CONTRACT_CREATED'
  >;
  description?: string;
};

export const TRAMITE_TYPE_LABELS: Record<ProposalTramiteType, string> = {
  GENERATED: 'Proposta gerada',
  SENT: 'Enviada',
  WAITING: 'Aguardando retorno',
  ACCEPTED: 'Aceita',
  REJECTED: 'Recusada',
  CONTRACT_CREATED: 'Contrato gerado',
  NOTE: 'Anotação',
};

export const MANUAL_TRAMITE_TYPES: CreateProposalTramiteInput['type'][] = [
  'SENT',
  'WAITING',
  'ACCEPTED',
  'REJECTED',
  'NOTE',
];
