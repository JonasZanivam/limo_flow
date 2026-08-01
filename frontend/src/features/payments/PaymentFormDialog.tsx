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
import type { Payment } from '@/types/payment';
import {
  createPaymentSchema,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  updatePaymentSchema,
  type PaymentFormValues,
} from './payment-schemas';

const selectClassName = cn(
  'h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30',
);

type PaymentFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  payment?: Payment;
  onSubmit: (values: PaymentFormValues) => Promise<void>;
};

export function PaymentFormDialog({
  open,
  onOpenChange,
  mode,
  payment,
  onSubmit,
}: PaymentFormDialogProps) {
  const isEdit = mode === 'edit';

  const { data: clientOptions = [] } = useQuery({
    queryKey: ['clients', 'options'],
    queryFn: fetchClientOptions,
    enabled: open,
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(isEdit ? updatePaymentSchema : createPaymentSchema),
    defaultValues: {
      amount: 0,
      type: 'DEPOSIT',
      status: 'PENDING',
      method: '',
      dueDate: '',
      paidAt: '',
      clientId: '',
      eventId: '',
    },
  });

  const status = watch('status');

  useEffect(() => {
    if (!open) return;

    reset(
      payment
        ? {
            amount: payment.amount,
            type: payment.type,
            status: payment.status,
            method: payment.method ?? '',
            dueDate: payment.dueDate?.slice(0, 10) ?? '',
            paidAt: payment.paidAt?.slice(0, 10) ?? '',
            clientId: payment.clientId,
            eventId: payment.eventId ?? '',
          }
        : {
            amount: 0,
            type: 'DEPOSIT',
            status: 'PENDING',
            method: '',
            dueDate: '',
            paidAt: '',
            clientId: '',
            eventId: '',
          },
    );
  }, [open, payment, reset]);

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
            {isEdit ? 'Editar pagamento' : 'Novo pagamento'}
          </DialogTitle>
          <DialogDescription>
            Registre sinal, saldo e status de cobrança.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="flex flex-col gap-5 px-6">
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
              <p className="text-sm text-destructive">{errors.clientId.message}</p>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor (R$)</label>
              <Input type="number" step="0.01" {...register('amount')} />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <select {...register('type')} className={selectClassName}>
                {Object.entries(PAYMENT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select {...register('status')} className={selectClassName}>
                {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Forma</label>
              <select {...register('method')} className={selectClassName}>
                <option value="">Não informada</option>
                {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Vencimento</label>
              <Input type="date" {...register('dueDate')} />
            </div>

            {status === 'PAID' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Pago em</label>
                <Input type="date" {...register('paidAt')} />
              </div>
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
              {isSubmitting ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
