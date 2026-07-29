export type EventStatus = 'CONFIRMED' | 'QUOTE' | 'CANCELLED';

export type EventClient = {
  id: string;
  brideName: string;
  groomName: string;
};

export type EventVehicle = {
  id: string;
  plate: string;
  model: string;
};

export type EventDriver = {
  id: string;
  name: string;
};

export type Event = {
  id: string;
  startAt: string;
  endAt: string;
  status: EventStatus;
  church: string | null;
  venue: string | null;
  clientId: string;
  vehicleId: string | null;
  driverId: string | null;
  client: EventClient;
  vehicle: EventVehicle | null;
  driver: EventDriver | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateEventInput = {
  startAt: string;
  endAt: string;
  status?: EventStatus;
  church?: string;
  venue?: string;
  clientId: string;
  vehicleId?: string;
  driverId?: string;
};

export type UpdateEventInput = Partial<CreateEventInput> & {
  vehicleId?: string | null;
  driverId?: string | null;
};

export type VehicleOption = {
  id: string;
  plate: string;
  model: string;
  capacity: number;
};

export type DriverOption = {
  id: string;
  name: string;
  email: string;
};

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  CONFIRMED: 'Confirmado',
  QUOTE: 'Orçamento',
  CANCELLED: 'Cancelado',
};

export const EVENT_STATUS_COLORS: Record<EventStatus, string> = {
  CONFIRMED: '#16a34a',
  QUOTE: '#d97706',
  CANCELLED: '#6b7280',
};
