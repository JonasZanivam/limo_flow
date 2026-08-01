export type CompanySettings = {
  id: string;
  legalName: string;
  tradeName: string | null;
  cnpj: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateCompanySettingsInput = {
  legalName: string;
  tradeName?: string;
  cnpj: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
};
