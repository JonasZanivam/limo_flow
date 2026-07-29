import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/use-auth';
import { getApiErrorMessage } from '@/lib/api-error';
import { ROLE_LABELS } from '@/types/auth';
import type { User } from '@/types/user';
import { UserFormDialog } from './UserFormDialog';
import type { CreateUserForm, UpdateUserForm } from './user-schemas';
import {
  createUser,
  deleteUser,
  fetchUsers,
  updateUser,
} from './users-api';

const USERS_QUERY_KEY = ['users'] as const;

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [userToDelete, setUserToDelete] = useState<User | undefined>();
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: fetchUsers,
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      setActionError(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserForm }) => {
      const payload = { ...data };
      if (!payload.password) delete payload.password;
      return updateUser(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      setActionError(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      setActionError(null);
    },
    onError: (error) => {
      setActionError(getApiErrorMessage(error));
    },
  });

  const openCreate = () => {
    setFormMode('create');
    setSelectedUser(undefined);
    setFormOpen(true);
  };

  const openEdit = (user: User) => {
    setFormMode('edit');
    setSelectedUser(user);
    setFormOpen(true);
  };

  const handleSubmit = async (values: CreateUserForm | UpdateUserForm) => {
    if (formMode === 'create') {
      await createMutation.mutateAsync(values as CreateUserForm);
      return;
    }

    if (!selectedUser) return;
    await updateMutation.mutateAsync({
      id: selectedUser.id,
      data: values as UpdateUserForm,
    });
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    setActionError(null);
    await deleteMutation.mutateAsync(userToDelete.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Usuários</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie administradores e motoristas do sistema.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus />
          Novo usuário
        </Button>
      </div>

      {actionError && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {actionError}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Equipe cadastrada</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : isError ? (
            <p className="p-6 text-sm text-destructive">
              Não foi possível carregar os usuários.
            </p>
          ) : users.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              Nenhum usuário cadastrado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Nome</th>
                    <th className="px-6 py-3 font-medium">E-mail</th>
                    <th className="px-6 py-3 font-medium">Perfil</th>
                    <th className="hidden px-6 py-3 font-medium md:table-cell">
                      Cadastro
                    </th>
                    <th className="px-6 py-3 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const isSelf = user.id === currentUser?.id;

                    return (
                      <tr key={user.id} className="border-b last:border-0">
                        <td className="px-6 py-4 font-medium">
                          {user.name}
                          {isSelf && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              (você)
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {user.email}
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
                            {ROLE_LABELS[user.role]}
                          </span>
                        </td>
                        <td className="hidden px-6 py-4 text-muted-foreground md:table-cell">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEdit(user)}
                            >
                              <Pencil />
                              Editar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={isSelf || deleteMutation.isPending}
                              onClick={() => setUserToDelete(user)}
                            >
                              <Trash2 />
                              Excluir
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        user={selectedUser}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!userToDelete}
        onOpenChange={(open) => {
          if (!open) setUserToDelete(undefined);
        }}
        title="Excluir usuário"
        description={
          userToDelete
            ? `Tem certeza que deseja excluir "${userToDelete.name}"? Esta ação não pode ser desfeita.`
            : ''
        }
        confirmLabel="Excluir"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
