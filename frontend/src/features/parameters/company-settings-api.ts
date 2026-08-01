import api from '@/lib/api';
import type {
  CompanySettings,
  UpdateCompanySettingsInput,
} from '@/types/company-settings';

export async function fetchCompanySettings(): Promise<CompanySettings> {
  const { data } = await api.get<CompanySettings>('/company-settings');
  return data;
}

export async function updateCompanySettings(
  input: UpdateCompanySettingsInput,
): Promise<CompanySettings> {
  const { data } = await api.patch<CompanySettings>('/company-settings', input);
  return data;
}
