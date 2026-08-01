import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { getApiErrorMessage } from '@/lib/api-error';
import type { Vehicle } from '@/types/vehicle';
import {
  createVehicleSchema,
  updateVehicleSchema,
  type VehicleFormValues,
} from './vehicle-schemas';

type VehicleFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  vehicle?: Vehicle;
  onSubmit: (values: VehicleFormValues) => Promise<void>;
};

export function VehicleFormDialog({
  open,
  onOpenChange,
  mode,
  vehicle,
  onSubmit,
}: VehicleFormDialogProps) {
  const isEdit = mode === 'edit';

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(isEdit ? updateVehicleSchema : createVehicleSchema),
    defaultValues: {
      plate: '',
      model: '',
      capacity: 8,
    },
  });

  useEffect(() => {
    if (!open) return;

    reset(
      isEdit && vehicle
        ? {
            plate: vehicle.plate,
            model: vehicle.model,
            capacity: vehicle.capacity,
          }
        : {
            plate: '',
            model: '',
            capacity: 8,
          },
    );
  }, [open, isEdit, vehicle, reset]);

  const submit = async (values: VehicleFormValues) => {
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (error) {
      setError('root', {
        message: getApiErrorMessage(error),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar veículo' : 'Novo veículo'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Atualize os dados da frota.'
              : 'Cadastre um veículo da frota.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-5 px-6">
          <div className="space-y-2">
            <label htmlFor="vehicle-plate" className="text-sm font-medium">
              Placa
            </label>
            <Input
              id="vehicle-plate"
              placeholder="ABC1D23"
              aria-invalid={!!errors.plate}
              {...register('plate')}
            />
            {errors.plate && (
              <p className="text-sm text-destructive">{errors.plate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="vehicle-model" className="text-sm font-medium">
              Modelo
            </label>
            <Input
              id="vehicle-model"
              placeholder="Mercedes-Benz Sprinter Luxo"
              aria-invalid={!!errors.model}
              {...register('model')}
            />
            {errors.model && (
              <p className="text-sm text-destructive">{errors.model.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="vehicle-capacity" className="text-sm font-medium">
              Capacidade (passageiros)
            </label>
            <Input
              id="vehicle-capacity"
              type="number"
              min={1}
              max={60}
              aria-invalid={!!errors.capacity}
              {...register('capacity')}
            />
            {errors.capacity && (
              <p className="text-sm text-destructive">
                {errors.capacity.message}
              </p>
            )}
          </div>

          {errors.root && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errors.root.message}
            </p>
          )}

          <DialogFooter className="px-0 pb-6 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Salvando...'
                : isEdit
                  ? 'Salvar alterações'
                  : 'Criar veículo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
