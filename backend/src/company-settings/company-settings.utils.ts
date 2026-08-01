type CompanyAddressInput = {
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
};

export function formatCompanyAddress(input: CompanyAddressInput): string {
  const line1 = `${input.street}, ${input.number}${
    input.complement ? ` — ${input.complement}` : ''
  }`;
  const line2 = `${input.neighborhood} — ${input.city}/${input.state} — CEP ${input.zipCode}`;

  return `${line1}\n${line2}`;
}

export function formatCnpj(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return cnpj;

  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5',
  );
}
