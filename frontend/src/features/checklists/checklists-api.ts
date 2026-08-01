import api from '@/lib/api';
import type {
  EventChecklist,
  UpdateEventChecklistInput,
} from '@/types/checklist';

export async function fetchEventChecklist(
  eventId: string,
): Promise<EventChecklist> {
  const { data } = await api.get<EventChecklist>(`/events/${eventId}/checklist`);
  return data;
}

export async function updateEventChecklist(
  eventId: string,
  input: UpdateEventChecklistInput,
): Promise<EventChecklist> {
  const { data } = await api.patch<EventChecklist>(
    `/events/${eventId}/checklist`,
    input,
  );
  return data;
}
