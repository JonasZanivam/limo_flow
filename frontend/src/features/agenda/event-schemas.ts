import { z } from 'zod';
import type { CreateEventInput, EventStatus } from '@/types/event';

const eventBaseSchema = z.object({
  startAt: z.string().min(1, 'Informe o início'),
  endAt: z.string().min(1, 'Informe o término'),
  status: z.enum(['CONFIRMED', 'QUOTE', 'CANCELLED']),
  church: z.string().trim().max(255).optional(),
  venue: z.string().trim().max(255).optional(),
  clientId: z.string().uuid('Selecione um cliente'),
  vehicleId: z.string().optional(),
  driverId: z.string().optional(),
});

export const createEventSchema = eventBaseSchema.refine(
  (values) => new Date(values.endAt) > new Date(values.startAt),
  {
    message: 'O término deve ser posterior ao início',
    path: ['endAt'],
  },
);

export const updateEventSchema = eventBaseSchema.refine(
  (values) => new Date(values.endAt) > new Date(values.startAt),
  {
    message: 'O término deve ser posterior ao início',
    path: ['endAt'],
  },
);

export type EventFormValues = z.infer<typeof createEventSchema>;

export function toDateTimeLocalValue(iso: string) {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function fromDateTimeLocalValue(value: string) {
  return new Date(value).toISOString();
}

export function formToEventPayload(values: EventFormValues): CreateEventInput {
  return {
    startAt: fromDateTimeLocalValue(values.startAt),
    endAt: fromDateTimeLocalValue(values.endAt),
    status: values.status as EventStatus,
    church: values.church || undefined,
    venue: values.venue || undefined,
    clientId: values.clientId,
    vehicleId: values.vehicleId || undefined,
    driverId: values.driverId || undefined,
  };
}

export function formatPlate(plate: string) {
  if (plate.length === 7 && /^[A-Z]{3}\d[A-Z]\d{2}$/.test(plate)) {
    return `${plate.slice(0, 3)}-${plate.slice(3)}`;
  }

  if (plate.length === 7 && /^[A-Z]{3}\d{4}$/.test(plate)) {
    return `${plate.slice(0, 3)}-${plate.slice(3)}`;
  }

  return plate;
}
