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
import { cn } from '@/lib/utils';
import { ROLE_LABELS } from '@/types/auth';
import type { User } from '@/types/user';
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserForm,
  type UpdateUserForm,
} from './user-schemas';

const selectClassName = cn(
  'h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30',
);

type UserFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  user?: User;
  onSubmit: (values: CreateUserForm | UpdateUserForm) => Promise<void>;
};

export function UserFormDialog({
  open,
  onOpenChange,
  mode,
  user,
  onSubmit,
}: UserFormDialogProps) {
  const isEdit = mode === 'edit';

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserForm | UpdateUserForm>({
    resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'DRIVER',
    },
  });

  useEffect(() => {
    if (!open) return;

    reset(
      isEdit && user
        ? {
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
          }
        : {
            name: '',
            email: '',
            password: '',
            role: 'DRIVER',
          },
    );
  }, [open, isEdit, user, reset]);

  const submit = async (values: CreateUserForm | UpdateUserForm) => {
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar usuário' : 'Novo usuário'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Atualize os dados do usuário. Deixe a senha em branco para mantê-la.'
              : 'Cadastre um administrador ou motorista no sistema.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4 px-6">
          <div className="space-y-2">
            <label htmlFor="user-name" className="text-sm font-medium">
              Nome
            </label>
            <Input
              id="user-name"
              autoComplete="name"
              aria-invalid={!!errors.name}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="user-email" className="text-sm font-medium">
              E-mail
            </label>
            <Input
              id="user-email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="user-password" className="text-sm font-medium">
              Senha{isEdit ? ' (opcional)' : ''}
            </label>
            <Input
              id="user-password"
              type="password"
              autoComplete="new-password"
              placeholder={isEdit ? 'Deixe em branco para manter' : undefined}
              aria-invalid={!!errors.password}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="user-role" className="text-sm font-medium">
              Perfil
            </label>
            <select
              id="user-role"
              className={selectClassName}
              aria-invalid={!!errors.role}
              {...register('role')}
            >
              <option value="ADMIN">{ROLE_LABELS.ADMIN}</option>
              <option value="DRIVER">{ROLE_LABELS.DRIVER}</option>
            </select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>

          {errors.root && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errors.root.message}
            </p>
          )}

          <DialogFooter className="px-0 pb-6">
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
                  : 'Criar usuário'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
