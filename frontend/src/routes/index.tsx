import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { GuestRoute } from '@/components/auth/GuestRoute';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RoleRoute } from '@/components/auth/RoleRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { ClientsPage } from '@/features/clients/ClientsPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { PlaceholderPage } from '@/features/PlaceholderPage';
import { UsersPage } from '@/features/users/UsersPage';
import { VehiclesPage } from '@/features/vehicles/VehiclesPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
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

            <Route element={<RoleRoute roles={['ADMIN']} />}>
              <Route path="clientes" element={<ClientsPage />} />
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
              <Route path="veiculos" element={<VehiclesPage />} />
              <Route path="usuarios" element={<UsersPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
