import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { GuestRoute } from '@/components/auth/GuestRoute';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RoleRoute } from '@/components/auth/RoleRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { AgendaPage } from '@/features/agenda/AgendaPage';
import { ClientsPage } from '@/features/clients/ClientsPage';
import { ContractsPage } from '@/features/contracts/ContractsPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { PaymentsPage } from '@/features/payments/PaymentsPage';
import { ParametersPage } from '@/features/parameters/ParametersPage';
import { ProposalsPage } from '@/features/proposals/ProposalsPage';
import { ProposalDetailPage } from '@/features/proposals/ProposalDetailPage';
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
            <Route path="agenda" element={<AgendaPage />} />

            <Route element={<RoleRoute roles={['ADMIN']} />}>
              <Route path="clientes" element={<ClientsPage />} />
              <Route path="propostas" element={<ProposalsPage />} />
              <Route path="propostas/:id" element={<ProposalDetailPage />} />
              <Route path="contratos" element={<ContractsPage />} />
              <Route path="financeiro" element={<PaymentsPage />} />
              <Route path="veiculos" element={<VehiclesPage />} />
              <Route path="usuarios" element={<UsersPage />} />
              <Route path="parametros" element={<ParametersPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
