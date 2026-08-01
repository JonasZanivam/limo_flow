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
import { fetchVehicleOptions } from '@/features/agenda/events-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { cn } from '@/lib/utils';
import type { Proposal } from '@/types/proposal';
import {
  createProposalSchema,
  PROPOSAL_STATUS_LABELS,
  updateProposalSchema,
  type ProposalFormValues,
} from './proposal-schemas';

const selectClassName = cn(
  'h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30',
);

type ProposalFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  proposal?: Proposal;
  onSubmit: (values: ProposalFormValues) => Promise<void>;
};

export function ProposalFormDialog({
  open,
  onOpenChange,
  mode,
  proposal,
  onSubmit,
}: ProposalFormDialogProps) {
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

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProposalFormValues>({
    resolver: zodResolver(isEdit ? updateProposalSchema : createProposalSchema),
    defaultValues: {
      value: 0,
      hours: 4,
      mileage: '',
      status: 'SENT',
      clientId: '',
      vehicleId: '',
    },
  });

  useEffect(() => {
    if (!open) return;

    reset(
      proposal
        ? {
            value: proposal.value,
            hours: proposal.hours,
            mileage: proposal.mileage ?? '',
            status: proposal.status,
            clientId: proposal.clientId,
            vehicleId: proposal.vehicleId ?? '',
          }
        : {
            value: 0,
            hours: 4,
            mileage: '',
            status: 'SENT',
            clientId: '',
            vehicleId: '',
          },
    );
  }, [open, proposal, reset]);

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (error) {
      setError('root', { message: getApiErrorMessage(error) });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar proposta' : 'Nova proposta'}
          </DialogTitle>
          <DialogDescription>
            Informe valor, horas e vínculos com cliente e veículo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="flex flex-col gap-5 px-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente</label>
              <select
                {...register('clientId')}
                className={selectClassName}
                disabled={isSubmitting}
              >
                <option value="">Selecione...</option>
                {clientOptions.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.brideName} & {client.groomName}
                  </option>
                ))}
              </select>
              {errors.clientId && (
                <p className="text-xs text-destructive">{errors.clientId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Veículo</label>
              <select
                {...register('vehicleId')}
                className={selectClassName}
                disabled={isSubmitting}
              >
                <option value="">Opcional</option>
                {vehicleOptions.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.model} ({vehicle.plate})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor (R$)</label>
              <Input type="number" step="0.01" {...register('value')} />
              {errors.value && (
                <p className="text-sm text-destructive">{errors.value.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Horas</label>
              <Input type="number" {...register('hours')} />
              {errors.hours && (
                <p className="text-sm text-destructive">{errors.hours.message}</p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <label className="text-sm font-medium">Km</label>
              <Input type="number" step="0.1" placeholder="Opcional" {...register('mileage')} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select
              {...register('status')}
              className={selectClassName}
              disabled={isSubmitting}
            >
              {Object.entries(PROPOSAL_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
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
              {isSubmitting ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
