import { z } from 'zod';

const PLATE_REGEX = /^([A-Za-z]{3}-?\d{4}|[A-Za-z]{3}\d[A-Za-z]\d{2})$/;

const vehicleBaseSchema = z.object({
  plate: z
    .string()
    .trim()
    .min(7, 'Placa inválida')
    .max(8, 'Placa inválida')
    .regex(PLATE_REGEX, 'Use o formato ABC1234 ou ABC1D23'),
  model: z
    .string()
    .trim()
    .min(2, 'Modelo deve ter no mínimo 2 caracteres'),
  capacity: z.coerce
    .number({ invalid_type_error: 'Capacidade deve ser um número' })
    .int('Capacidade deve ser um número inteiro')
    .min(1, 'Capacidade mínima é 1')
    .max(60, 'Capacidade máxima é 60'),
});

export const createVehicleSchema = vehicleBaseSchema;
export const updateVehicleSchema = vehicleBaseSchema;

export type VehicleFormValues = z.infer<typeof createVehicleSchema>;

export function normalizePlate(plate: string) {
  return plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

export function formToVehiclePayload(values: VehicleFormValues) {
  return {
    plate: normalizePlate(values.plate),
    model: values.model,
    capacity: values.capacity,
  };
}
