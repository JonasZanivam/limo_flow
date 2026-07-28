import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function DashboardPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {[
        'Casamentos hoje',
        'Propostas aguardando',
        'Pagamentos pendentes',
        'Próximo evento',
        'Receita do mês',
        'Eventos do mês',
      ].map((title) => (
        <Card key={title}>
          <CardHeader>
            <CardTitle className="text-base">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-primary">—</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
