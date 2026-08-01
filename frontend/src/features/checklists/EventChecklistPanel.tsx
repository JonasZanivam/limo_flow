import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/lib/api-error';
import { cn } from '@/lib/utils';
import {
  CHECKLIST_ITEM_LABELS,
  type EventChecklist,
} from '@/types/checklist';
import {
  fetchEventChecklist,
  updateEventChecklist,
} from './checklists-api';

type EventChecklistPanelProps = {
  eventId: string;
  compact?: boolean;
};

const CHECKLIST_KEYS = [
  'carWashed',
  'decorated',
  'driverConfirmed',
  'fuel',
  'documentation',
] as const;

function getCompletedCount(checklist: EventChecklist) {
  return CHECKLIST_KEYS.filter((key) => checklist[key]).length;
}

export function EventChecklistPanel({
  eventId,
  compact = false,
}: EventChecklistPanelProps) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['checklists', eventId],
    queryFn: () => fetchEventChecklist(eventId),
    enabled: Boolean(eventId),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      key,
      value,
    }: {
      key: (typeof CHECKLIST_KEYS)[number];
      value: boolean;
    }) => updateEventChecklist(eventId, { [key]: value }),
    onSuccess: (checklist) => {
      queryClient.setQueryData(['checklists', eventId], checklist);
    },
  });

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Carregando checklist...</p>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar a checklist.
      </p>
    );
  }

  const completed = getCompletedCount(data);

  return (
    <div className={cn('space-y-3', compact ? '' : 'rounded-lg border p-4')}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Checklist pré-evento</p>
          <p className="text-xs text-muted-foreground">
            {completed}/{CHECKLIST_KEYS.length} concluídos
          </p>
        </div>
        <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{
              width: `${(completed / CHECKLIST_KEYS.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {CHECKLIST_KEYS.map((key) => {
          const checked = data[key];
          const isPending = updateMutation.isPending;

          return (
            <Button
              key={key}
              type="button"
              variant="ghost"
              className={cn(
                'h-auto w-full justify-start gap-3 px-2 py-2',
                checked && 'bg-primary/5',
              )}
              disabled={isPending}
              onClick={() =>
                updateMutation.mutate({ key, value: !checked })
              }
            >
              {checked ? (
                <CheckCircle2 className="size-4 text-primary" />
              ) : (
                <Circle className="size-4 text-muted-foreground" />
              )}
              <span className={cn(checked && 'text-foreground')}>
                {CHECKLIST_ITEM_LABELS[key]}
              </span>
            </Button>
          );
        })}
      </div>

      {updateMutation.isError && (
        <p className="text-xs text-destructive">
          {getApiErrorMessage(updateMutation.error)}
        </p>
      )}
    </div>
  );
}
