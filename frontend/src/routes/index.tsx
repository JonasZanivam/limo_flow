import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { PlaceholderPage } from '@/features/PlaceholderPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route
            path="agenda"
            element={
              <PlaceholderPage
                title="Agenda"
                description="Calendário FullCalendar será implementado na próxima etapa."
              />
            }
          />
          <Route
            path="clientes"
            element={
              <PlaceholderPage
                title="Clientes"
                description="CRUD de clientes com indicação e ações WhatsApp."
              />
            }
          />
          <Route
            path="propostas"
            element={
              <PlaceholderPage
                title="Propostas"
                description="Orçamentos com PDF e envio via wa.me."
              />
            }
          />
          <Route
            path="contratos"
            element={
              <PlaceholderPage
                title="Contratos"
                description="Geração de contratos com template e PDF."
              />
            }
          />
          <Route
            path="financeiro"
            element={
              <PlaceholderPage
                title="Financeiro"
                description="Pagamentos, saldo restante e status de cobrança."
              />
            }
          />
          <Route
            path="veiculos"
            element={
              <PlaceholderPage
                title="Veículos"
                description="Frota, fotos e manutenções."
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
