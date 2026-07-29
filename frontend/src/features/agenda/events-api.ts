import api from '@/lib/api';
import type {
  CreateEventInput,
  DriverOption,
  Event,
  UpdateEventInput,
  VehicleOption,
} from '@/types/event';

export type EventsRangeParams = {
  start: string;
  end: string;
};

export async function fetchEvents(params: EventsRangeParams): Promise<Event[]> {
  const { data } = await api.get<Event[]>('/events', { params });
  return data;
}

export async function fetchEvent(id: string): Promise<Event> {
  const { data } = await api.get<Event>(`/events/${id}`);
  return data;
}

export async function createEvent(input: CreateEventInput): Promise<Event> {
  const { data } = await api.post<Event>('/events', input);
  return data;
}

export async function updateEvent(
  id: string,
  input: UpdateEventInput,
): Promise<Event> {
  const { data } = await api.patch<Event>(`/events/${id}`, input);
  return data;
}

export async function deleteEvent(id: string): Promise<Event> {
  const { data } = await api.delete<Event>(`/events/${id}`);
  return data;
}

export async function fetchVehicleOptions(): Promise<VehicleOption[]> {
  const { data } = await api.get<VehicleOption[]>('/vehicles/options');
  return data;
}

export async function fetchDriverOptions(): Promise<DriverOption[]> {
  const { data } = await api.get<DriverOption[]>('/users/drivers');
  return data;
}
