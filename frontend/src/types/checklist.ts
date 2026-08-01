export type EventChecklist = {
  id: string;
  eventId: string;
  carWashed: boolean;
  decorated: boolean;
  driverConfirmed: boolean;
  fuel: boolean;
  documentation: boolean;
};

export type UpdateEventChecklistInput = Partial<
  Pick<
    EventChecklist,
    | 'carWashed'
    | 'decorated'
    | 'driverConfirmed'
    | 'fuel'
    | 'documentation'
  >
>;

export const CHECKLIST_ITEM_LABELS: Record<
  keyof Omit<EventChecklist, 'id' | 'eventId'>,
  string
> = {
  carWashed: 'Carro lavado',
  decorated: 'Decorado',
  driverConfirmed: 'Motorista confirmado',
  fuel: 'Combustível',
  documentation: 'Documentação',
};
