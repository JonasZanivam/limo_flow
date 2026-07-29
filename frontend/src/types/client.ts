export type ClientReferral = {
  id: string;
  brideName: string;
  groomName: string;
};

export type Client = {
  id: string;
  brideName: string;
  groomName: string;
  phones: string[];
  email: string | null;
  weddingDate: string | null;
  church: string | null;
  venue: string | null;
  notes: string | null;
  referredById: string | null;
  referredBy: ClientReferral | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateClientInput = {
  brideName: string;
  groomName: string;
  phones: string[];
  email?: string;
  weddingDate?: string;
  church?: string;
  venue?: string;
  notes?: string;
  referredById?: string;
};

export type UpdateClientInput = Omit<Partial<CreateClientInput>, 'referredById'> & {
  referredById?: string | null;
};
