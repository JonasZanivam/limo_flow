import { ProposalStatus, ProposalTramiteType } from '@prisma/client';

export const TRAMITE_TYPE_LABELS: Record<ProposalTramiteType, string> = {
  GENERATED: 'Proposta gerada',
  SENT: 'Enviada',
  WAITING: 'Aguardando retorno',
  ACCEPTED: 'Aceita',
  REJECTED: 'Recusada',
  CONTRACT_CREATED: 'Contrato gerado',
  NOTE: 'Anotação',
};

export const TRAMITE_TYPE_TO_STATUS: Partial<
  Record<ProposalTramiteType, ProposalStatus>
> = {
  SENT: 'SENT',
  WAITING: 'WAITING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
};

export const MANUAL_TRAMITE_TYPES: ProposalTramiteType[] = [
  'SENT',
  'WAITING',
  'ACCEPTED',
  'REJECTED',
  'NOTE',
];
