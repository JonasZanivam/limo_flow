import type {
  DateSelectArg,
  DatesSetArg,
  EventClickArg,
  EventInput,
} from '@fullcalendar/core';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useAuth } from '@/features/auth/use-auth';
import { getApiErrorMessage } from '@/lib/api-error';
import {
  EVENT_STATUS_COLORS,
  EVENT_STATUS_LABELS,
  type Event,
} from '@/types/event';
import { EventFormDialog } from './EventFormDialog';
import { formToEventPayload, type EventFormValues } from './event-schemas';
import {
  createEvent,
  deleteEvent,
  fetchEvents,
  updateEvent,
} from './events-api';

const EVENTS_QUERY_KEY = ['events'] as const;

function toCalendarEvent(event: Event): EventInput {
  return {
    id: event.id,
    title: `${event.client.brideName} & ${event.client.groomName}`,
    start: event.startAt,
    end: event.endAt,
    backgroundColor: EVENT_STATUS_COLORS[event.status],
    borderColor: EVENT_STATUS_COLORS[event.status],
    extendedProps: { event },
  };
}

export function AgendaPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const queryClient = useQueryClient();
  const calendarRef = useRef<FullCalendar>(null);

  const [range, setRange] = useState<{ start: string; end: string } | null>(
    null,
  );
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>();
  const [initialRange, setInitialRange] = useState<
    { start: Date; end: Date } | undefined
  >();
  const [eventToDelete, setEventToDelete] = useState<Event | undefined>();
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: events = [], isLoading, isError } = useQuery({
    queryKey: [...EVENTS_QUERY_KEY, range?.start, range?.end],
    queryFn: () =>
      fetchEvents({
        start: range!.start,
        end: range!.end,
      }),
    enabled: Boolean(range),
    retry: 1,
  });

  const calendarEvents = useMemo(
    () => events.map(toCalendarEvent),
    [events],
  );

  const invalidateEvents = () => {
    queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY });
  };

  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      setActionError(null);
      invalidateEvents();
    },
    onError: (error) => {
      setActionError(
        getApiErrorMessage(error, 'Não foi possível criar o evento'),
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: EventFormValues }) =>
      updateEvent(id, formToEventPayload(values)),
    onSuccess: () => {
      setActionError(null);
      invalidateEvents();
    },
    onError: (error) => {
      setActionError(
        getApiErrorMessage(error, 'Não foi possível atualizar o evento'),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      setActionError(null);
      setEventToDelete(undefined);
      invalidateEvents();
    },
    onError: (error) => {
      setActionError(
        getApiErrorMessage(error, 'Não foi possível excluir o evento'),
      );
    },
  });

  const openCreate = (start?: Date, end?: Date) => {
    setFormMode('create');
    setSelectedEvent(undefined);
    setInitialRange(
      start && end
        ? { start, end }
        : undefined,
    );
    setFormOpen(true);
  };

  const openEdit = (event: Event) => {
    setFormMode('edit');
    setSelectedEvent(event);
    setInitialRange(undefined);
    setFormOpen(true);
  };

  const handleDatesSet = (arg: DatesSetArg) => {
    setRange({
      start: arg.start.toISOString(),
      end: arg.end.toISOString(),
    });
  };

  const handleDateSelect = (arg: DateSelectArg) => {
    if (!isAdmin) return;
    openCreate(arg.start, arg.end);
    calendarRef.current?.getApi().unselect();
  };

  const handleEventClick = (arg: EventClickArg) => {
    const event = arg.event.extendedProps.event as Event | undefined;
    if (!event) return;

    if (isAdmin) {
      openEdit(event);
    }
  };

  const handleFormSubmit = async (values: EventFormValues) => {
    if (formMode === 'create') {
      await createMutation.mutateAsync(formToEventPayload(values));
      return;
    }

    if (!selectedEvent) return;

    await updateMutation.mutateAsync({ id: selectedEvent.id, values });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Agenda</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {isAdmin
                ? 'Gerencie eventos, veículos e motoristas no calendário.'
                : 'Visualize seus eventos agendados.'}
            </p>
          </div>

          {isAdmin && (
            <Button onClick={() => openCreate()}>
              <Plus className="size-4" />
              Novo evento
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3 text-sm">
            {(Object.keys(EVENT_STATUS_LABELS) as Array<keyof typeof EVENT_STATUS_LABELS>).map(
              (status) => (
                <div key={status} className="flex items-center gap-2">
                  <span
                    className="size-3 rounded-full"
                    style={{ backgroundColor: EVENT_STATUS_COLORS[status] }}
                  />
                  <span>{EVENT_STATUS_LABELS[status]}</span>
                </div>
              ),
            )}
          </div>

          {actionError && (
            <p className="text-sm text-destructive">{actionError}</p>
          )}

          {isError && (
            <p className="text-sm text-destructive">
              Não foi possível carregar os eventos.
            </p>
          )}

          {isLoading && (
            <p className="text-sm text-muted-foreground">Carregando eventos...</p>
          )}

          <div className="agenda-calendar rounded-xl border border-border p-2">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              locale={ptBrLocale}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              height="auto"
              selectable={isAdmin}
              selectMirror={isAdmin}
              editable={false}
              events={calendarEvents}
              datesSet={handleDatesSet}
              select={handleDateSelect}
              eventClick={handleEventClick}
              buttonText={{
                today: 'Hoje',
                month: 'Mês',
                week: 'Semana',
                day: 'Dia',
              }}
            />
          </div>
        </CardContent>
      </Card>

      {isAdmin && (
        <>
          <EventFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            mode={formMode}
            event={selectedEvent}
            initialRange={initialRange}
            onSubmit={handleFormSubmit}
            onDelete={
              formMode === 'edit' && selectedEvent
                ? () => setEventToDelete(selectedEvent)
                : undefined
            }
            isDeleting={deleteMutation.isPending}
          />

          <ConfirmDialog
            open={Boolean(eventToDelete)}
            onOpenChange={(open) => {
              if (!open) setEventToDelete(undefined);
            }}
            title="Excluir evento"
            description="Esta ação não pode ser desfeita."
            confirmLabel="Excluir"
            onConfirm={async () => {
              if (!eventToDelete) return;
              await deleteMutation.mutateAsync(eventToDelete.id);
              setFormOpen(false);
            }}
            isLoading={deleteMutation.isPending}
          />
        </>
      )}
    </div>
  );
}
