import api from '@/lib/api';
import type { DashboardStats } from '@/types/dashboard';

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>('/dashboard/stats');
  return data;
}
