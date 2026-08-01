import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileDown, FilePlus, MessageCircle, Trash2 } from 'lucide-react';
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
import { fetchProposals } from '@/features/proposals/proposals-api';
import type { Contract } from '@/types/contract';
import {
  createContract,
  deleteContract,
  downloadContractPdf,
  fetchContractWhatsAppUrl,
  fetchContracts,
} from './contracts-api';

const CONTRACTS_QUERY_KEY = ['contracts'] as const;
const TABLE_COLUMNS = 5;

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

export function ContractsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [contractToDelete, setContractToDelete] = useState<Contract | undefined>();
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isError } = useQuery({
    queryKey: [...CONTRACTS_QUERY_KEY, page, debouncedSearch],
    queryFn: () =>
      fetchContracts({
        page,
        limit: DEFAULT_PAGE_SIZE,
        search: debouncedSearch || undefined,
      }),
    retry: 1,
  });

  const { data: proposalsData } = useQuery({
    queryKey: ['proposals', 'accepted-without-contract'],
    queryFn: () =>
      fetchProposals({ page: 1, limit: 100 }).then((response) =>
        response.data.filter(
          (proposal) => proposal.status === 'ACCEPTED' && !proposal.hasContract,
        ),
      ),
  });

  const contracts = data?.data ?? [];
  const meta = data?.meta ?? {
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  };

  const createMutation = useMutation({
    mutationFn: createContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRACTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      setActionError(null);
    },
    onError: (error) => {
      setActionError(getApiErrorMessage(error));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRACTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      setActionError(null);
    },
    onError: (error) => {
      setActionError(getApiErrorMessage(error));
    },
  });

  const handleGenerate = async (proposalId: string) => {
    setActionError(null);
    await createMutation.mutateAsync({ proposalId });
  };

  const handleDelete = async () => {
    if (!contractToDelete) return;
    setActionError(null);
    await deleteMutation.mutateAsync(contractToDelete.id);
  };

  const openWhatsApp = async (contract: Contract) => {
    try {
      const { url } = await fetchContractWhatsAppUrl(contract.id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  const handleDownloadPdf = async (contract: Contract) => {
    try {
      await downloadContractPdf(contract.id);
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  const emptyMessage = debouncedSearch
    ? 'Nenhum contrato encontrado para a busca.'
    : 'Nenhum contrato gerado.';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Contratos</h2>
        <p className="text-sm text-muted-foreground">
          Geração de contratos a partir de propostas aceitas.
        </p>
      </div>

      {actionError && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {actionError}
        </p>
      )}

      {(proposalsData?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Propostas prontas para contrato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {proposalsData?.map((proposal) => (
              <div
                key={proposal.id}
                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{formatCoupleName(proposal.client)}</p>
                  <p className="text-sm text-muted-foreground">
                    {currencyFormatter.format(proposal.value)} · {proposal.hours}h
                  </p>
                </div>
                <Button
                  onClick={() => handleGenerate(proposal.id)}
                  disabled={createMutation.isPending}
                >
                  <FilePlus />
                  Gerar contrato
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Contratos emitidos</CardTitle>
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
            errorMessage="Não foi possível carregar os contratos."
            isEmpty={!isLoading && !isError && contracts.length === 0}
            emptyMessage={emptyMessage}
            rowCount={contracts.length}
            header={
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Casal</th>
                  <th className="px-6 py-3 font-medium">Valor</th>
                  <th className="hidden px-6 py-3 font-medium md:table-cell">
                    Casamento
                  </th>
                  <th className="hidden px-6 py-3 font-medium lg:table-cell">
                    Criado em
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
            {contracts.map((contract) => (
              <tr
                key={contract.id}
                className="border-b last:border-0"
                style={{ height: TABLE_ROW_HEIGHT_PX }}
              >
                <td className="px-6 py-4 font-medium">
                  {formatCoupleName(contract.client)}
                </td>
                <td className="px-6 py-4">
                  {currencyFormatter.format(contract.proposal.value)}
                </td>
                <td className="hidden px-6 py-4 text-muted-foreground md:table-cell">
                  {contract.client.weddingDate
                    ? dateFormatter.format(new Date(contract.client.weddingDate))
                    : '—'}
                </td>
                <td className="hidden px-6 py-4 text-muted-foreground lg:table-cell">
                  {dateFormatter.format(new Date(contract.createdAt))}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPdf(contract)}
                    >
                      <FileDown />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!contract.client.phones[0]}
                      onClick={() => openWhatsApp(contract)}
                    >
                      <MessageCircle />
                      WhatsApp
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deleteMutation.isPending}
                      onClick={() => setContractToDelete(contract)}
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

      <ConfirmDialog
        open={!!contractToDelete}
        onOpenChange={(open) => {
          if (!open) setContractToDelete(undefined);
        }}
        title="Excluir contrato"
        description={
          contractToDelete
            ? `Tem certeza que deseja excluir o contrato de "${formatCoupleName(contractToDelete.client)}"?`
            : ''
        }
        confirmLabel="Excluir"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
