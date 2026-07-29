import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { ListSearchInput } from '@/components/ui/list-search-input';
import {
  DEFAULT_PAGE_SIZE,
  PaginatedTableFrame,
  TABLE_ROW_HEIGHT_PX,
} from '@/components/ui/paginated-table-frame';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { getApiErrorMessage } from '@/lib/api-error';
import { buildClientGreeting, buildWhatsAppUrl } from '@/lib/whatsapp';
import type { Client } from '@/types/client';
import { ClientFormDialog } from './ClientFormDialog';
import {
  formToCreatePayload,
  formToUpdatePayload,
  type ClientFormValues,
} from './client-schemas';
import {
  createClient,
  deleteClient,
  fetchClients,
  updateClient,
} from './clients-api';

const CLIENTS_QUERY_KEY = ['clients'] as const;
const TABLE_COLUMNS = 5;

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
});

function formatWeddingDate(value: string | null) {
  if (!value) return '—';
  return dateFormatter.format(new Date(value));
}

function formatCoupleName(client: { brideName: string; groomName: string }) {
  return `${client.brideName} & ${client.groomName}`;
}

export function ClientsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedClient, setSelectedClient] = useState<Client | undefined>();
  const [clientToDelete, setClientToDelete] = useState<Client | undefined>();
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isError } = useQuery({
    queryKey: [...CLIENTS_QUERY_KEY, page, debouncedSearch],
    queryFn: () =>
      fetchClients({
        page,
        limit: DEFAULT_PAGE_SIZE,
        search: debouncedSearch || undefined,
      }),
    retry: 1,
  });

  const clients = data?.data ?? [];
  const meta = data?.meta ?? {
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  };

  const createMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
      setActionError(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data: payload,
    }: {
      id: string;
      data: ReturnType<typeof formToUpdatePayload>;
    }) => updateClient(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
      setActionError(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
      setActionError(null);
    },
    onError: (error) => {
      setActionError(getApiErrorMessage(error));
    },
  });

  const openCreate = () => {
    setFormMode('create');
    setSelectedClient(undefined);
    setFormOpen(true);
  };

  const openEdit = (client: Client) => {
    setFormMode('edit');
    setSelectedClient(client);
    setFormOpen(true);
  };

  const handleSubmit = async (values: ClientFormValues) => {
    if (formMode === 'create') {
      await createMutation.mutateAsync(formToCreatePayload(values));
      return;
    }

    if (!selectedClient) return;
    await updateMutation.mutateAsync({
      id: selectedClient.id,
      data: formToUpdatePayload(values),
    });
  };

  const handleDelete = async () => {
    if (!clientToDelete) return;

    setActionError(null);
    await deleteMutation.mutateAsync(clientToDelete.id);
  };

  const openWhatsApp = (client: Client) => {
    const phone = client.phones[0];
    if (!phone) return;

    const url = buildWhatsAppUrl(
      phone,
      buildClientGreeting(client.brideName, client.groomName),
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const emptyMessage = debouncedSearch
    ? 'Nenhum cliente encontrado para a busca.'
    : 'Nenhum cliente cadastrado.';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Clientes</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie casais, contatos e indicações.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus />
          Novo cliente
        </Button>
      </div>

      {actionError && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {actionError}
        </p>
      )}

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Casais cadastrados</CardTitle>
          <ListSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por nome, e-mail ou telefone..."
          />
        </CardHeader>
        <CardContent className="p-0">
          <PaginatedTableFrame
            colSpan={TABLE_COLUMNS}
            isLoading={isLoading}
            isError={isError}
            errorMessage="Não foi possível carregar os clientes."
            isEmpty={!isLoading && !isError && clients.length === 0}
            emptyMessage={emptyMessage}
            rowCount={clients.length}
            header={
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Casal</th>
                  <th className="px-6 py-3 font-medium">Telefone</th>
                  <th className="hidden px-6 py-3 font-medium md:table-cell">
                    Casamento
                  </th>
                  <th className="hidden px-6 py-3 font-medium lg:table-cell">
                    Indicação
                  </th>
                  <th className="px-6 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
            }
            footer={
              <DataTablePagination
                page={meta.page}
                total={meta.total}
                totalPages={meta.totalPages}
                onPageChange={setPage}
                disabled={isLoading}
              />
            }
          >
            {clients.map((client) => (
              <tr
                key={client.id}
                className="border-b last:border-0"
                style={{ height: TABLE_ROW_HEIGHT_PX }}
              >
                <td className="px-6 py-4">
                  <p className="font-medium">{formatCoupleName(client)}</p>
                  {client.email && (
                    <p className="text-xs text-muted-foreground">{client.email}</p>
                  )}
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {client.phones[0] ?? '—'}
                  {client.phones.length > 1 && (
                    <span className="ml-1 text-xs">+{client.phones.length - 1}</span>
                  )}
                </td>
                <td className="hidden px-6 py-4 text-muted-foreground md:table-cell">
                  {formatWeddingDate(client.weddingDate)}
                </td>
                <td className="hidden px-6 py-4 text-muted-foreground lg:table-cell">
                  {client.referredBy ? formatCoupleName(client.referredBy) : '—'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!client.phones[0]}
                      onClick={() => openWhatsApp(client)}
                    >
                      <MessageCircle />
                      WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(client)}
                    >
                      <Pencil />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deleteMutation.isPending}
                      onClick={() => setClientToDelete(client)}
                    >
                      <Trash2 />
                      Excluir
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </PaginatedTableFrame>
        </CardContent>
      </Card>

      <ClientFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        client={selectedClient}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!clientToDelete}
        onOpenChange={(open) => {
          if (!open) setClientToDelete(undefined);
        }}
        title="Excluir cliente"
        description={
          clientToDelete
            ? `Tem certeza que deseja excluir "${formatCoupleName(clientToDelete)}"? Esta ação não pode ser desfeita.`
            : ''
        }
        confirmLabel="Excluir"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
