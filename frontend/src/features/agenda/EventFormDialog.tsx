import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
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
import { fetchClientOptions } from '@/features/clients/clients-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { cn } from '@/lib/utils';
import {
  EVENT_STATUS_LABELS,
  type Event,
  type EventStatus,
} from '@/types/event';
import {
  createEventSchema,
  formatPlate,
  toDateTimeLocalValue,
  updateEventSchema,
  type EventFormValues,
} from './event-schemas';
import { fetchDriverOptions, fetchVehicleOptions } from './events-api';
import { EventChecklistPanel } from '@/features/checklists/EventChecklistPanel';

const selectClassName = cn(
  'h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30',
);

type EventFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  event?: Event;
  initialRange?: { start: Date; end: Date };
  onSubmit: (values: EventFormValues) => Promise<void>;
  onDelete?: () => void;
  isDeleting?: boolean;
};

function getDefaultRange(initialRange?: { start: Date; end: Date }) {
  if (initialRange) {
    return {
      startAt: toDateTimeLocalValue(initialRange.start.toISOString()),
      endAt: toDateTimeLocalValue(initialRange.end.toISOString()),
    };
  }

  const start = new Date();
  start.setMinutes(0, 0, 0);
  const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);

  return {
    startAt: toDateTimeLocalValue(start.toISOString()),
    endAt: toDateTimeLocalValue(end.toISOString()),
  };
}

export function EventFormDialog({
  open,
  onOpenChange,
  mode,
  event,
  initialRange,
  onSubmit,
  onDelete,
  isDeleting = false,
}: EventFormDialogProps) {
  const isEdit = mode === 'edit';

  const { data: clientOptions = [] } = useQuery({
    queryKey: ['clients', 'options'],
    queryFn: fetchClientOptions,
    enabled: open,
  });

  const { data: vehicleOptions = [] } = useQuery({
    queryKey: ['vehicles', 'options'],
    queryFn: fetchVehicleOptions,
    enabled: open,
  });

  const { data: driverOptions = [] } = useQuery({
    queryKey: ['users', 'drivers'],
    queryFn: fetchDriverOptions,
    enabled: open,
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(isEdit ? updateEventSchema : createEventSchema),
    defaultValues: {
      startAt: '',
      endAt: '',
      status: 'QUOTE',
      church: '',
      venue: '',
      clientId: '',
      vehicleId: '',
      driverId: '',
    },
  });

  useEffect(() => {
    if (!open) return;

    const defaults = getDefaultRange(initialRange);

    reset(
      isEdit && event
        ? {
            startAt: toDateTimeLocalValue(event.startAt),
            endAt: toDateTimeLocalValue(event.endAt),
            status: event.status,
            church: event.church ?? '',
            venue: event.venue ?? '',
            clientId: event.clientId,
            vehicleId: event.vehicleId ?? '',
            driverId: event.driverId ?? '',
          }
        : {
            ...defaults,
            status: 'QUOTE',
            church: '',
            venue: '',
            clientId: '',
            vehicleId: '',
            driverId: '',
          },
    );
  }, [open, isEdit, event, initialRange, reset]);

  const submitHandler = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (error) {
      setError('root', {
        message: getApiErrorMessage(error, 'Não foi possível salvar o evento'),
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar evento' : 'Novo evento'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Atualize os dados do evento na agenda.'
              : 'Cadastre um novo evento na agenda.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submitHandler} className="flex flex-col gap-5 px-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="startAt" className="text-sm font-medium">
                Início
              </label>
              <Input id="startAt" type="datetime-local" {...register('startAt')} />
              {errors.startAt && (
                <p className="text-sm text-destructive">{errors.startAt.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="endAt" className="text-sm font-medium">
                Término
              </label>
              <Input id="endAt" type="datetime-local" {...register('endAt')} />
              {errors.endAt && (
                <p className="text-sm text-destructive">{errors.endAt.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">
              Status
            </label>
            <select id="status" className={selectClassName} {...register('status')}>
              {(Object.keys(EVENT_STATUS_LABELS) as EventStatus[]).map((status) => (
                <option key={status} value={status}>
                  {EVENT_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="clientId" className="text-sm font-medium">
              Cliente
            </label>
            <select id="clientId" className={selectClassName} {...register('clientId')}>
              <option value="">Selecione...</option>
              {clientOptions.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.brideName} & {client.groomName}
                </option>
              ))}
            </select>
            {errors.clientId && (
              <p className="text-sm text-destructive">{errors.clientId.message}</p>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="vehicleId" className="text-sm font-medium">
                Veículo
              </label>
              <select
                id="vehicleId"
                className={selectClassName}
                {...register('vehicleId')}
              >
                <option value="">Sem veículo</option>
                {vehicleOptions.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {formatPlate(vehicle.plate)} — {vehicle.model}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="driverId" className="text-sm font-medium">
                Motorista
              </label>
              <select
                id="driverId"
                className={selectClassName}
                {...register('driverId')}
              >
                <option value="">Sem motorista</option>
                {driverOptions.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="church" className="text-sm font-medium">
                Igreja
              </label>
              <Input id="church" {...register('church')} />
            </div>

            <div className="space-y-2">
              <label htmlFor="venue" className="text-sm font-medium">
                Recepção
              </label>
              <Input id="venue" {...register('venue')} />
            </div>
          </div>

          {isEdit && event && (
            <EventChecklistPanel eventId={event.id} compact />
          )}

          {errors.root && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errors.root.message}
            </p>
          )}

          <DialogFooter className="gap-2 px-0 pb-6 sm:flex-row sm:justify-between">
            {isEdit && onDelete ? (
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
                disabled={isSubmitting || isDeleting}
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </Button>
            ) : (
              <span />
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || isDeleting}>
                {isSubmitting ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
