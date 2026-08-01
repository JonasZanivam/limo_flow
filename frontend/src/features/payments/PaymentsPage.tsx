import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Pencil, Plus, Trash2 } from 'lucide-react';
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
import type { Payment, PaymentStatus } from '@/types/payment';
import { PaymentFormDialog } from './PaymentFormDialog';
import {
  formToCreatePaymentPayload,
  formToUpdatePaymentPayload,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  type PaymentFormValues,
} from './payment-schemas';
import {
  createPayment,
  deletePayment,
  fetchPayments,
  markPaymentAsPaid,
  updatePayment,
} from './payments-api';

const PAYMENTS_QUERY_KEY = ['payments'] as const;
const TABLE_COLUMNS = 6;

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
});

const STATUS_FILTERS: Array<{ label: string; value?: PaymentStatus }> = [
  { label: 'Todos', value: undefined },
  { label: 'Pendentes', value: 'PENDING' },
  { label: 'Pagos', value: 'PAID' },
  { label: 'Atrasados', value: 'OVERDUE' },
];

function formatCoupleName(client: { brideName: string; groomName: string }) {
  return `${client.brideName} & ${client.groomName}`;
}

export function PaymentsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | undefined>();
  const debouncedSearch = useDebouncedValue(search);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedPayment, setSelectedPayment] = useState<Payment | undefined>();
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | undefined>();
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const { data, isLoading, isError } = useQuery({
    queryKey: [...PAYMENTS_QUERY_KEY, page, debouncedSearch, statusFilter],
    queryFn: () =>
      fetchPayments({
        page,
        limit: DEFAULT_PAGE_SIZE,
        search: debouncedSearch || undefined,
        status: statusFilter,
      }),
    retry: 1,
  });

  const payments = data?.data ?? [];
  const meta = data?.meta ?? {
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  };

  const pendingTotal = payments
    .filter((payment) => payment.status !== 'PAID')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const createMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setActionError(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data: payload,
    }: {
      id: string;
      data: ReturnType<typeof formToUpdatePaymentPayload>;
    }) => updatePayment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setActionError(null);
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: markPaymentAsPaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setActionError(null);
    },
    onError: (error) => {
      setActionError(getApiErrorMessage(error));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setActionError(null);
    },
    onError: (error) => {
      setActionError(getApiErrorMessage(error));
    },
  });

  const openCreate = () => {
    setFormMode('create');
    setSelectedPayment(undefined);
    setFormOpen(true);
  };

  const openEdit = (payment: Payment) => {
    setFormMode('edit');
    setSelectedPayment(payment);
    setFormOpen(true);
  };

  const handleSubmit = async (values: PaymentFormValues) => {
    if (formMode === 'create') {
      await createMutation.mutateAsync(formToCreatePaymentPayload(values));
      return;
    }

    if (!selectedPayment) return;
    await updateMutation.mutateAsync({
      id: selectedPayment.id,
      data: formToUpdatePaymentPayload(values),
    });
  };

  const handleDelete = async () => {
    if (!paymentToDelete) return;
    setActionError(null);
    await deleteMutation.mutateAsync(paymentToDelete.id);
  };

  const emptyMessage = debouncedSearch
    ? 'Nenhum pagamento encontrado para a busca.'
    : 'Nenhum pagamento cadastrado.';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Financeiro</h2>
          <p className="text-sm text-muted-foreground">
            Pagamentos, saldo restante e status de cobrança.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus />
          Novo pagamento
        </Button>
      </div>

      {actionError && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {actionError}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Saldo em aberto (página)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-primary">
              {currencyFormatter.format(pendingTotal)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pagamentos pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-primary">{meta.total}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Cobranças</CardTitle>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((filter) => (
                <Button
                  key={filter.label}
                  size="sm"
                  variant={statusFilter === filter.value ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
            <ListSearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar por casal..."
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <PaginatedTableFrame
            colSpan={TABLE_COLUMNS}
            isLoading={isLoading}
            isError={isError}
            errorMessage="Não foi possível carregar os pagamentos."
            isEmpty={!isLoading && !isError && payments.length === 0}
            emptyMessage={emptyMessage}
            rowCount={payments.length}
            header={
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Casal</th>
                  <th className="px-6 py-3 font-medium">Valor</th>
                  <th className="hidden px-6 py-3 font-medium md:table-cell">
                    Tipo
                  </th>
                  <th className="hidden px-6 py-3 font-medium lg:table-cell">
                    Status
                  </th>
                  <th className="hidden px-6 py-3 font-medium xl:table-cell">
                    Vencimento
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
            {payments.map((payment) => (
              <tr
                key={payment.id}
                className="border-b last:border-0"
                style={{ height: TABLE_ROW_HEIGHT_PX }}
              >
                <td className="px-6 py-4 font-medium">
                  {formatCoupleName(payment.client)}
                </td>
                <td className="px-6 py-4">
                  {currencyFormatter.format(payment.amount)}
                </td>
                <td className="hidden px-6 py-4 text-muted-foreground md:table-cell">
                  {PAYMENT_TYPE_LABELS[payment.type]}
                </td>
                <td className="hidden px-6 py-4 lg:table-cell">
                  <span className="rounded-full bg-muted px-2 py-1 text-xs">
                    {PAYMENT_STATUS_LABELS[payment.status]}
                  </span>
                </td>
                <td className="hidden px-6 py-4 text-muted-foreground xl:table-cell">
                  {payment.dueDate
                    ? dateFormatter.format(new Date(payment.dueDate))
                    : '—'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    {payment.status !== 'PAID' && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={markPaidMutation.isPending}
                        onClick={() => markPaidMutation.mutate(payment.id)}
                      >
                        <CheckCircle2 />
                        Marcar pago
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(payment)}
                    >
                      <Pencil />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deleteMutation.isPending}
                      onClick={() => setPaymentToDelete(payment)}
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

      <PaymentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        payment={selectedPayment}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!paymentToDelete}
        onOpenChange={(open) => {
          if (!open) setPaymentToDelete(undefined);
        }}
        title="Excluir pagamento"
        description={
          paymentToDelete
            ? `Tem certeza que deseja excluir o pagamento de "${formatCoupleName(paymentToDelete.client)}"?`
            : ''
        }
        confirmLabel="Excluir"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
