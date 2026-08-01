import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/lib/api-error';
import { cn } from '@/lib/utils';
import {
  MANUAL_TRAMITE_TYPES,
  TRAMITE_TYPE_LABELS,
  type CreateProposalTramiteInput,
} from '@/types/proposal-tramite';
import {
  createProposalTramite,
  fetchProposalTramites,
} from './proposal-tramites-api';

const selectClassName = cn(
  'h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30',
);

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

type ProposalTramitePanelProps = {
  proposalId: string;
};

export function ProposalTramitePanel({ proposalId }: ProposalTramitePanelProps) {
  const queryClient = useQueryClient();
  const [type, setType] = useState<CreateProposalTramiteInput['type']>('NOTE');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const tramitesQueryKey = ['proposal-tramites', proposalId] as const;
  const proposalQueryKey = ['proposal', proposalId] as const;

  const { data: tramites = [], isLoading, isError } = useQuery({
    queryKey: tramitesQueryKey,
    queryFn: () => fetchProposalTramites(proposalId),
    enabled: Boolean(proposalId),
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateProposalTramiteInput) =>
      createProposalTramite(proposalId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tramitesQueryKey });
      queryClient.invalidateQueries({ queryKey: proposalQueryKey });
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      setDescription('');
      setFormError(null);
    },
    onError: (error) => {
      setFormError(getApiErrorMessage(error));
    },
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    await createMutation.mutateAsync({
      type,
      description: description.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border">
        <div className="border-b bg-muted/60 px-4 py-2">
          <h3 className="text-sm font-semibold tracking-wide uppercase">
            Trâmites
          </h3>
        </div>

        {isLoading ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">
            Carregando histórico...
          </p>
        ) : isError ? (
          <p className="px-4 py-6 text-sm text-destructive">
            Não foi possível carregar os trâmites.
          </p>
        ) : tramites.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">
            Nenhum trâmite registrado ainda.
          </p>
        ) : (
          <div className="divide-y">
            {tramites.map((tramite, index) => (
              <div
                key={tramite.id}
                className="grid gap-3 px-4 py-4 md:grid-cols-[auto_1fr] md:gap-6"
              >
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Número:</span>{' '}
                    <span className="font-medium">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Usuário:</span>{' '}
                    {tramite.user?.name ?? 'Sistema'}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Data:</span>{' '}
                    {dateTimeFormatter.format(new Date(tramite.createdAt))}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Situação:</span>{' '}
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                      {TRAMITE_TYPE_LABELS[tramite.type]}
                    </span>
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Descrição</p>
                  <div className="min-h-20 rounded-lg border bg-muted/20 px-3 py-2 text-sm whitespace-pre-wrap">
                    {tramite.description || '—'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-lg border">
        <div className="border-b bg-muted/60 px-4 py-2">
          <h3 className="text-sm font-semibold tracking-wide uppercase">
            Gerar trâmite
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="tramite-type" className="text-sm font-medium">
                Situação
              </label>
              <select
                id="tramite-type"
                className={selectClassName}
                value={type}
                onChange={(event) =>
                  setType(event.target.value as CreateProposalTramiteInput['type'])
                }
              >
                {MANUAL_TRAMITE_TYPES.map((tramiteType) => (
                  <option key={tramiteType} value={tramiteType}>
                    {TRAMITE_TYPE_LABELS[tramiteType]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="tramite-description" className="text-sm font-medium">
              Descrição
            </label>
            <textarea
              id="tramite-description"
              className={cn(
                selectClassName,
                'min-h-28 resize-y py-2',
              )}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Descreva o que aconteceu neste trâmite..."
            />
          </div>

          {formError && (
            <p className="text-sm text-destructive">{formError}</p>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Salvando...' : 'Gravar trâmite'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
