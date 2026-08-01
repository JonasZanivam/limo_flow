import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  FileDown,
  FilePlus,
  MessageCircle,
  Pencil,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createContract } from '@/features/contracts/contracts-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { cn } from '@/lib/utils';
import { PROPOSAL_STATUS_LABELS } from './proposal-schemas';
import { ProposalFormDialog } from './ProposalFormDialog';
import { ProposalTramitePanel } from './ProposalTramitePanel';
import {
  downloadProposalPdf,
  fetchProposal,
  fetchProposalWhatsAppUrl,
  updateProposal,
} from './proposals-api';
import {
  formToUpdateProposalPayload,
  type ProposalFormValues,
} from './proposal-schemas';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
});

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

const infoRowClassName =
  'grid gap-1 border-b px-4 py-3 text-sm last:border-b-0 sm:grid-cols-[180px_1fr]';

function formatCoupleName(client: { brideName: string; groomName: string }) {
  return `${client.brideName} & ${client.groomName}`;
}

export function ProposalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const proposalQueryKey = ['proposal', id] as const;

  const { data: proposal, isLoading, isError } = useQuery({
    queryKey: proposalQueryKey,
    queryFn: () => fetchProposal(id!),
    enabled: Boolean(id),
    retry: 1,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      proposalId,
      data,
    }: {
      proposalId: string;
      data: ReturnType<typeof formToUpdateProposalPayload>;
    }) => updateProposal(proposalId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: proposalQueryKey });
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal-tramites', id] });
      setActionError(null);
    },
  });

  const createContractMutation = useMutation({
    mutationFn: createContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: proposalQueryKey });
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal-tramites', id] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      setActionError(null);
    },
    onError: (error) => {
      setActionError(getApiErrorMessage(error));
    },
  });

  const handleSubmit = async (values: ProposalFormValues) => {
    if (!proposal) return;
    await updateMutation.mutateAsync({
      proposalId: proposal.id,
      data: formToUpdateProposalPayload(values),
    });
  };

  const openWhatsApp = async () => {
    if (!proposal) return;
    try {
      const { url } = await fetchProposalWhatsAppUrl(proposal.id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  const handleDownloadPdf = async () => {
    if (!proposal) return;
    try {
      await downloadProposalPdf(proposal.id);
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  const handleCreateContract = async () => {
    if (!proposal) return;
    await createContractMutation.mutateAsync({ proposalId: proposal.id });
  };

  if (!id) {
    return (
      <p className="text-sm text-destructive">Proposta não encontrada.</p>
    );
  }

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Carregando proposta...</p>
    );
  }

  if (isError || !proposal) {
    return (
      <div className="space-y-4">
        <Link
          to="/propostas"
          className={buttonVariants({ variant: 'outline' })}
        >
          <ArrowLeft />
          Voltar
        </Link>
        <p className="text-sm text-destructive">
          Não foi possível carregar a proposta.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <Link
            to="/propostas"
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            <ArrowLeft />
            Voltar
          </Link>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {formatCoupleName(proposal.client)}
            </h2>
            <p className="text-sm text-muted-foreground">
              Proposta comercial — histórico e trâmites
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
            <FileDown />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!proposal.client.phones[0]}
            onClick={openWhatsApp}
          >
            <MessageCircle />
            WhatsApp
          </Button>
          <Button variant="outline" size="sm" onClick={() => setFormOpen(true)}>
            <Pencil />
            Editar proposta
          </Button>
          {proposal.status === 'ACCEPTED' && !proposal.hasContract && (
            <Button
              size="sm"
              disabled={createContractMutation.isPending}
              onClick={handleCreateContract}
            >
              <FilePlus />
              Gerar contrato
            </Button>
          )}
        </div>
      </div>

      {actionError && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {actionError}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da proposta</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden rounded-b-lg border-t">
            <div className={cn(infoRowClassName, 'bg-muted/20')}>
              <span className="font-medium text-muted-foreground">Casal</span>
              <span>{formatCoupleName(proposal.client)}</span>
            </div>
            <div className={infoRowClassName}>
              <span className="font-medium text-muted-foreground">Valor</span>
              <span className="font-medium">
                {currencyFormatter.format(proposal.value)}
              </span>
            </div>
            <div className={cn(infoRowClassName, 'bg-muted/20')}>
              <span className="font-medium text-muted-foreground">Horas</span>
              <span>{proposal.hours}h</span>
            </div>
            <div className={infoRowClassName}>
              <span className="font-medium text-muted-foreground">
                Quilometragem
              </span>
              <span>
                {proposal.mileage != null
                  ? `${proposal.mileage.toFixed(1)} km`
                  : 'Não informada'}
              </span>
            </div>
            <div className={cn(infoRowClassName, 'bg-muted/20')}>
              <span className="font-medium text-muted-foreground">Veículo</span>
              <span>
                {proposal.vehicle
                  ? `${proposal.vehicle.model} (${proposal.vehicle.plate})`
                  : 'A definir'}
              </span>
            </div>
            <div className={infoRowClassName}>
              <span className="font-medium text-muted-foreground">Status</span>
              <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
                {PROPOSAL_STATUS_LABELS[proposal.status]}
              </span>
            </div>
            <div className={cn(infoRowClassName, 'bg-muted/20')}>
              <span className="font-medium text-muted-foreground">
                Casamento
              </span>
              <span>
                {proposal.client.weddingDate
                  ? dateFormatter.format(new Date(proposal.client.weddingDate))
                  : 'A definir'}
              </span>
            </div>
            <div className={infoRowClassName}>
              <span className="font-medium text-muted-foreground">Igreja</span>
              <span>{proposal.client.church ?? 'A definir'}</span>
            </div>
            <div className={cn(infoRowClassName, 'bg-muted/20')}>
              <span className="font-medium text-muted-foreground">Local</span>
              <span>{proposal.client.venue ?? 'A definir'}</span>
            </div>
            <div className={infoRowClassName}>
              <span className="font-medium text-muted-foreground">Contrato</span>
              <span>{proposal.hasContract ? 'Gerado' : 'Pendente'}</span>
            </div>
            <div className={cn(infoRowClassName, 'bg-muted/20')}>
              <span className="font-medium text-muted-foreground">Criada em</span>
              <span>
                {dateTimeFormatter.format(new Date(proposal.createdAt))}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProposalTramitePanel proposalId={proposal.id} />

      <ProposalFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode="edit"
        proposal={proposal}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
