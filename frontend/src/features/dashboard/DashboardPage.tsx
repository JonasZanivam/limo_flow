import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchDashboardStats } from './dashboard-api';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

export function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
    retry: 1,
  });

  const cards = [
    {
      title: 'Casamentos hoje',
      value: data?.weddingsToday ?? 0,
      format: 'number' as const,
    },
    {
      title: 'Propostas aguardando',
      value: data?.proposalsWaiting ?? 0,
      format: 'number' as const,
      href: '/propostas',
    },
    {
      title: 'Pagamentos pendentes',
      value: data?.pendingPayments ?? 0,
      format: 'number' as const,
      href: '/financeiro',
    },
    {
      title: 'Próximo evento',
      value: data?.nextEvent
        ? `${data.nextEvent.couple} · ${dateTimeFormatter.format(new Date(data.nextEvent.startAt))}`
        : 'Nenhum evento confirmado',
      format: 'text' as const,
      href: '/agenda',
    },
    {
      title: 'Receita do mês',
      value: data?.monthlyRevenue ?? 0,
      format: 'currency' as const,
      href: '/financeiro',
    },
    {
      title: 'Eventos do mês',
      value: data?.monthlyEvents ?? 0,
      format: 'number' as const,
      href: '/agenda',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Visão geral da operação e do comercial.
        </p>
      </div>

      {isError && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Não foi possível carregar os indicadores do dashboard.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const content = (
            <Card key={card.title} className={card.href ? 'transition-colors hover:bg-muted/30' : undefined}>
              <CardHeader>
                <CardTitle className="text-base">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-9 w-24" />
                ) : (
                  <p
                    className={
                      card.format === 'text'
                        ? 'text-base font-medium text-primary'
                        : 'text-3xl font-semibold text-primary'
                    }
                  >
                    {card.format === 'currency'
                      ? currencyFormatter.format(card.value as number)
                      : card.format === 'number'
                        ? String(card.value)
                        : card.value}
                  </p>
                )}
              </CardContent>
            </Card>
          );

          return card.href ? (
            <Link key={card.title} to={card.href}>
              {content}
            </Link>
          ) : (
            content
          );
        })}
      </div>
    </div>
  );
}
