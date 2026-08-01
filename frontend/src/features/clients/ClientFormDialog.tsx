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
import type { Client } from '@/types/client';
import {
  createClientSchema,
  phonesToInput,
  updateClientSchema,
  type ClientFormValues,
} from './client-schemas';

const selectClassName = cn(
  'h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30',
);

const textareaClassName = cn(
  'min-h-24 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30',
);

type ClientFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  client?: Client;
  onSubmit: (values: ClientFormValues) => Promise<void>;
};

export function ClientFormDialog({
  open,
  onOpenChange,
  mode,
  client,
  onSubmit,
}: ClientFormDialogProps) {
  const isEdit = mode === 'edit';

  const { data: referralOptions = [] } = useQuery({
    queryKey: ['clients', 'options'],
    queryFn: fetchClientOptions,
    enabled: open,
  });

  const filteredReferralOptions = referralOptions.filter(
    (item) => item.id !== client?.id,
  );

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(isEdit ? updateClientSchema : createClientSchema),
    defaultValues: {
      brideName: '',
      groomName: '',
      phones: '',
      email: '',
      weddingDate: '',
      church: '',
      venue: '',
      notes: '',
      referredById: '',
    },
  });

  useEffect(() => {
    if (!open) return;

    reset(
      isEdit && client
        ? {
            brideName: client.brideName,
            groomName: client.groomName,
            phones: phonesToInput(client.phones),
            email: client.email ?? '',
            weddingDate: client.weddingDate?.slice(0, 10) ?? '',
            church: client.church ?? '',
            venue: client.venue ?? '',
            notes: client.notes ?? '',
            referredById: client.referredById ?? '',
          }
        : {
            brideName: '',
            groomName: '',
            phones: '',
            email: '',
            weddingDate: '',
            church: '',
            venue: '',
            notes: '',
            referredById: '',
          },
    );
  }, [open, isEdit, client, reset]);

  const submit = async (values: ClientFormValues) => {
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
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar cliente' : 'Novo cliente'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Atualize os dados do casal.'
              : 'Cadastre um novo casal no CRM.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-5 px-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="client-bride" className="text-sm font-medium">
                Noiva
              </label>
              <Input
                id="client-bride"
                aria-invalid={!!errors.brideName}
                {...register('brideName')}
              />
              {errors.brideName && (
                <p className="text-sm text-destructive">
                  {errors.brideName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="client-groom" className="text-sm font-medium">
                Noivo
              </label>
              <Input
                id="client-groom"
                aria-invalid={!!errors.groomName}
                {...register('groomName')}
              />
              {errors.groomName && (
                <p className="text-sm text-destructive">
                  {errors.groomName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="client-phones" className="text-sm font-medium">
              Telefones
            </label>
            <Input
              id="client-phones"
              placeholder="(11) 99999-9999, (11) 98888-8888"
              aria-invalid={!!errors.phones}
              {...register('phones')}
            />
            <p className="text-xs text-muted-foreground">
              Separe múltiplos telefones por vírgula.
            </p>
            {errors.phones && (
              <p className="text-sm text-destructive">{errors.phones.message}</p>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="client-email" className="text-sm font-medium">
                E-mail
              </label>
              <Input
                id="client-email"
                type="email"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="client-wedding-date" className="text-sm font-medium">
                Data do casamento
              </label>
              <Input
                id="client-wedding-date"
                type="date"
                aria-invalid={!!errors.weddingDate}
                {...register('weddingDate')}
              />
              {errors.weddingDate && (
                <p className="text-sm text-destructive">
                  {errors.weddingDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="client-church" className="text-sm font-medium">
                Igreja
              </label>
              <Input id="client-church" {...register('church')} />
            </div>

            <div className="space-y-2">
              <label htmlFor="client-venue" className="text-sm font-medium">
                Salão
              </label>
              <Input id="client-venue" {...register('venue')} />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="client-referral" className="text-sm font-medium">
              Indicação
            </label>
            <select
              id="client-referral"
              className={selectClassName}
              {...register('referredById')}
            >
              <option value="">Nenhuma</option>
              {filteredReferralOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.brideName} & {item.groomName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="client-notes" className="text-sm font-medium">
              Observações
            </label>
            <textarea
              id="client-notes"
              className={textareaClassName}
              {...register('notes')}
            />
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
                  : 'Criar cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
