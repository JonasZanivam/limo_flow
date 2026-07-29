import api from '@/lib/api';
import type { PaginatedResponse, PaginationParams } from '@/types/pagination';
import type {
  CreateVehicleInput,
  UpdateVehicleInput,
  Vehicle,
} from '@/types/vehicle';

export async function fetchVehicles(
  params: PaginationParams,
): Promise<PaginatedResponse<Vehicle>> {
  const { data } = await api.get<PaginatedResponse<Vehicle>>('/vehicles', {
    params,
  });
  return data;
}

export async function createVehicle(
  input: CreateVehicleInput,
): Promise<Vehicle> {
  const { data } = await api.post<Vehicle>('/vehicles', input);
  return data;
}

export async function updateVehicle(
  id: string,
  input: UpdateVehicleInput,
): Promise<Vehicle> {
  const { data } = await api.patch<Vehicle>(`/vehicles/${id}`, input);
  return data;
}

export async function deleteVehicle(id: string): Promise<Vehicle> {
  const { data } = await api.delete<Vehicle>(`/vehicles/${id}`);
  return data;
}
