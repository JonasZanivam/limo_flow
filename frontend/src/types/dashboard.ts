export type DashboardStats = {
  weddingsToday: number;
  proposalsWaiting: number;
  pendingPayments: number;
  monthlyEvents: number;
  monthlyRevenue: number;
  nextEvent: {
    id: string;
    startAt: string;
    endAt: string;
    couple: string;
  } | null;
};
