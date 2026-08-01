export type ProposalStatus = 'SENT' | 'WAITING' | 'ACCEPTED' | 'REJECTED';

export type ProposalClient = {
  id: string;
  brideName: string;
  groomName: string;
  phones: string[];
  weddingDate: string | null;
  church: string | null;
  venue: string | null;
};

export type ProposalVehicle = {
  id: string;
  plate: string;
  model: string;
};

export type Proposal = {
  id: string;
  value: number;
  hours: number;
  mileage: number | null;
  status: ProposalStatus;
  clientId: string;
  vehicleId: string | null;
  client: ProposalClient;
  vehicle: ProposalVehicle | null;
  hasContract: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateProposalInput = {
  value: number;
  hours: number;
  mileage?: number;
  status?: ProposalStatus;
  clientId: string;
  vehicleId?: string;
};

export type UpdateProposalInput = Partial<Omit<CreateProposalInput, 'mileage' | 'vehicleId'>> & {
  vehicleId?: string | null;
  mileage?: number | null;
};
