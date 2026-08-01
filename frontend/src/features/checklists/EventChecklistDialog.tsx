import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Event } from '@/types/event';
import { EventChecklistPanel } from './EventChecklistPanel';

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

type EventChecklistDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Event;
};

export function EventChecklistDialog({
  open,
  onOpenChange,
  event,
}: EventChecklistDialogProps) {
  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Checklist do evento</DialogTitle>
          <DialogDescription>
            {event.client.brideName} & {event.client.groomName} ·{' '}
            {dateTimeFormatter.format(new Date(event.startAt))}
          </DialogDescription>
        </DialogHeader>

        <EventChecklistPanel eventId={event.id} />
      </DialogContent>
    </Dialog>
  );
}
