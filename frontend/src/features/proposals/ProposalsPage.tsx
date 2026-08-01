import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileDown, MessageCircle, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, buttonVariants } from '@/components/ui/button';
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
import type { Proposal } from '@/types/proposal';
import { ProposalFormDialog } from './ProposalFormDialog';
import {
  formToCreateProposalPayload,
  formToUpdateProposalPayload,
  PROPOSAL_STATUS_LABELS,
  type ProposalFormValues,
} from './proposal-schemas';
import {
  createProposal,
  deleteProposal,
  downloadProposalPdf,
  fetchProposalWhatsAppUrl,
  fetchProposals,
  updateProposal,
} from './proposals-api';

const PROPOSALS_QUERY_KEY = ['proposals'] as const;
const TABLE_COLUMNS = 6;

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
});

function formatCoupleName(client: { brideName: string; groomName: string }) {
  return `${client.brideName} & ${client.groomName}`;
}

export function ProposalsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | undefined>();
  const [proposalToDelete, setProposalToDelete] = useState<Proposal | undefined>();
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isError } = useQuery({
    queryKey: [...PROPOSALS_QUERY_KEY, page, debouncedSearch],
    queryFn: () =>
      fetchProposals({
        page,
        limit: DEFAULT_PAGE_SIZE,
        search: debouncedSearch || undefined,
      }),
    retry: 1,
  });

  const proposals = data?.data ?? [];
  const meta = data?.meta ?? {
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  };

  const createMutation = useMutation({
    mutationFn: createProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPOSALS_QUERY_KEY });
      setActionError(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data: payload,
    }: {
      id: string;
      data: ReturnType<typeof formToUpdateProposalPayload>;
    }) => updateProposal(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPOSALS_QUERY_KEY });
      setActionError(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPOSALS_QUERY_KEY });
      setActionError(null);
    },
    onError: (error) => {
      setActionError(getApiErrorMessage(error));
    },
  });

  const openCreate = () => {
    setFormMode('create');
    setSelectedProposal(undefined);
    setFormOpen(true);
  };

  const openEdit = (proposal: Proposal) => {
    setFormMode('edit');
    setSelectedProposal(proposal);
    setFormOpen(true);
  };

  const handleSubmit = async (values: ProposalFormValues) => {
    if (formMode === 'create') {
      await createMutation.mutateAsync(formToCreateProposalPayload(values));
      return;
    }

    if (!selectedProposal) return;
    await updateMutation.mutateAsync({
      id: selectedProposal.id,
      data: formToUpdateProposalPayload(values),
    });
  };

  const handleDelete = async () => {
    if (!proposalToDelete) return;
    setActionError(null);
    await deleteMutation.mutateAsync(proposalToDelete.id);
  };

  const openWhatsApp = async (proposal: Proposal) => {
    try {
      const { url } = await fetchProposalWhatsAppUrl(proposal.id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  const handleDownloadPdf = async (proposal: Proposal) => {
    try {
      await downloadProposalPdf(proposal.id);
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  const emptyMessage = debouncedSearch
    ? 'Nenhuma proposta encontrada para a busca.'
    : 'Nenhuma proposta cadastrada.';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Propostas</h2>
          <p className="text-sm text-muted-foreground">
            Orçamentos com PDF e envio via WhatsApp.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus />
          Nova proposta
        </Button>
      </div>

      {actionError && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {actionError}
        </p>
      )}

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Propostas comerciais</CardTitle>
          <ListSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por casal..."
          />
        </CardHeader>
        <CardContent className="p-0">
          <PaginatedTableFrame
            colSpan={TABLE_COLUMNS}
            isLoading={isLoading}
            isError={isError}
            errorMessage="Não foi possível carregar as propostas."
            isEmpty={!isLoading && !isError && proposals.length === 0}
            emptyMessage={emptyMessage}
            rowCount={proposals.length}
            header={
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Casal</th>
                  <th className="px-6 py-3 font-medium">Valor</th>
                  <th className="hidden px-6 py-3 font-medium md:table-cell">
                    Horas
                  </th>
                  <th className="hidden px-6 py-3 font-medium lg:table-cell">
                    Status
                  </th>
                  <th className="hidden px-6 py-3 font-medium xl:table-cell">
                    Casamento
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
            {proposals.map((proposal) => (
              <tr
                key={proposal.id}
                className="border-b last:border-0"
                style={{ height: TABLE_ROW_HEIGHT_PX }}
              >
                <td className="px-6 py-4">
                  <Link
                    to={`/propostas/${proposal.id}`}
                    className="font-medium hover:underline"
                  >
                    {formatCoupleName(proposal.client)}
                  </Link>
                  {proposal.vehicle && (
                    <p className="text-xs text-muted-foreground">
                      {proposal.vehicle.model}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4 font-medium">
                  {currencyFormatter.format(proposal.value)}
                </td>
                <td className="hidden px-6 py-4 text-muted-foreground md:table-cell">
                  {proposal.hours}h
                </td>
                <td className="hidden px-6 py-4 lg:table-cell">
                  <span className="rounded-full bg-muted px-2 py-1 text-xs">
                    {PROPOSAL_STATUS_LABELS[proposal.status]}
                  </span>
                </td>
                <td className="hidden px-6 py-4 text-muted-foreground xl:table-cell">
                  {proposal.client.weddingDate
                    ? dateFormatter.format(new Date(proposal.client.weddingDate))
                    : '—'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <Link
                      to={`/propostas/${proposal.id}`}
                      className={buttonVariants({ variant: 'outline', size: 'sm' })}
                    >
                      Abrir
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPdf(proposal)}
                    >
                      <FileDown />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!proposal.client.phones[0]}
                      onClick={() => openWhatsApp(proposal)}
                    >
                      <MessageCircle />
                      WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(proposal)}
                    >
                      <Pencil />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deleteMutation.isPending}
                      onClick={() => setProposalToDelete(proposal)}
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

      <ProposalFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        proposal={selectedProposal}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!proposalToDelete}
        onOpenChange={(open) => {
          if (!open) setProposalToDelete(undefined);
        }}
        title="Excluir proposta"
        description={
          proposalToDelete
            ? `Tem certeza que deseja excluir a proposta de "${formatCoupleName(proposalToDelete.client)}"?`
            : ''
        }
        confirmLabel="Excluir"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
