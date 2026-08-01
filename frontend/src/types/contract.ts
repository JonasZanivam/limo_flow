export type Contract = {
  id: string;
  content: string;
  clientId: string;
  proposalId: string;
  client: {
    id: string;
    brideName: string;
    groomName: string;
    phones: string[];
    weddingDate: string | null;
    church: string | null;
    venue: string | null;
  };
  proposal: {
    id: string;
    value: number;
    hours: number;
    status: string;
    vehicle: {
      id: string;
      plate: string;
      model: string;
    } | null;
  };
  createdAt: string;
  updatedAt: string;
};

export type CreateContractInput = {
  proposalId: string;
};
