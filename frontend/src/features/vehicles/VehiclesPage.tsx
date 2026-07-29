import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { ListSearchInput } from '@/components/ui/list-search-input';
import {
  DEFAULT_PAGE_SIZE,
  PaginatedTableFrame,
  TABLE_ROW_HEIGHT_PX,
} from '@/components/ui/paginated-table-frame';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { getApiErrorMessage } from '@/lib/api-error';
import type { Vehicle } from '@/types/vehicle';
import { VehicleFormDialog } from './VehicleFormDialog';
import {
  formToVehiclePayload,
  type VehicleFormValues,
} from './vehicle-schemas';
import {
  createVehicle,
  deleteVehicle,
  fetchVehicles,
  updateVehicle,
} from './vehicles-api';

const VEHICLES_QUERY_KEY = ['vehicles'] as const;
const TABLE_COLUMNS = 5;

function formatPlate(plate: string) {
  if (plate.length === 7 && /^[A-Z]{3}\d[A-Z]\d{2}$/.test(plate)) {
    return `${plate.slice(0, 3)}-${plate.slice(3)}`;
  }

  if (plate.length === 7 && /^[A-Z]{3}\d{4}$/.test(plate)) {
    return `${plate.slice(0, 3)}-${plate.slice(3)}`;
  }

  return plate;
}

export function VehiclesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | undefined>();
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | undefined>();
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isError } = useQuery({
    queryKey: [...VEHICLES_QUERY_KEY, page, debouncedSearch],
    queryFn: () =>
      fetchVehicles({
        page,
        limit: DEFAULT_PAGE_SIZE,
        search: debouncedSearch || undefined,
      }),
    retry: 1,
  });

  const vehicles = data?.data ?? [];
  const meta = data?.meta ?? {
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  };

  const createMutation = useMutation({
    mutationFn: createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_QUERY_KEY });
      setActionError(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data: payload }: { id: string; data: VehicleFormValues }) =>
      updateVehicle(id, formToVehiclePayload(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_QUERY_KEY });
      setActionError(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_QUERY_KEY });
      setActionError(null);
    },
    onError: (error) => {
      setActionError(getApiErrorMessage(error));
    },
  });

  const openCreate = () => {
    setFormMode('create');
    setSelectedVehicle(undefined);
    setFormOpen(true);
  };

  const openEdit = (vehicle: Vehicle) => {
    setFormMode('edit');
    setSelectedVehicle(vehicle);
    setFormOpen(true);
  };

  const handleSubmit = async (values: VehicleFormValues) => {
    if (formMode === 'create') {
      await createMutation.mutateAsync(formToVehiclePayload(values));
      return;
    }

    if (!selectedVehicle) return;
    await updateMutation.mutateAsync({
      id: selectedVehicle.id,
      data: values,
    });
  };

  const handleDelete = async () => {
    if (!vehicleToDelete) return;

    setActionError(null);
    await deleteMutation.mutateAsync(vehicleToDelete.id);
  };

  const emptyMessage = debouncedSearch
    ? 'Nenhum veículo encontrado para a busca.'
    : 'Nenhum veículo cadastrado.';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Veículos</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie a frota de limousines e vans.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus />
          Novo veículo
        </Button>
      </div>

      {actionError && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {actionError}
        </p>
      )}

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Frota cadastrada</CardTitle>
          <ListSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por placa ou modelo..."
          />
        </CardHeader>
        <CardContent className="p-0">
          <PaginatedTableFrame
            colSpan={TABLE_COLUMNS}
            isLoading={isLoading}
            isError={isError}
            errorMessage="Não foi possível carregar os veículos."
            isEmpty={!isLoading && !isError && vehicles.length === 0}
            emptyMessage={emptyMessage}
            rowCount={vehicles.length}
            header={
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Placa</th>
                  <th className="px-6 py-3 font-medium">Modelo</th>
                  <th className="px-6 py-3 font-medium">Capacidade</th>
                  <th className="hidden px-6 py-3 font-medium md:table-cell">
                    Eventos
                  </th>
                  <th className="px-6 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
            }
            footer={
              <DataTablePagination
                page={meta.page}
                total={meta.total}
                totalPages={meta.totalPages}
                onPageChange={setPage}
                disabled={isLoading}
              />
            }
          >
            {vehicles.map((vehicle) => (
              <tr
                key={vehicle.id}
                className="border-b last:border-0"
                style={{ height: TABLE_ROW_HEIGHT_PX }}
              >
                <td className="px-6 py-4 font-medium">
                  {formatPlate(vehicle.plate)}
                </td>
                <td className="px-6 py-4">{vehicle.model}</td>
                <td className="px-6 py-4 text-muted-foreground">
                  {vehicle.capacity} passageiros
                </td>
                <td className="hidden px-6 py-4 text-muted-foreground md:table-cell">
                  {vehicle._count.events}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(vehicle)}
                    >
                      <Pencil />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deleteMutation.isPending}
                      onClick={() => setVehicleToDelete(vehicle)}
                    >
                      <Trash2 />
                      Excluir
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </PaginatedTableFrame>
        </CardContent>
      </Card>

      <VehicleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        vehicle={selectedVehicle}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!vehicleToDelete}
        onOpenChange={(open) => {
          if (!open) setVehicleToDelete(undefined);
        }}
        title="Excluir veículo"
        description={
          vehicleToDelete
            ? `Tem certeza que deseja excluir "${formatPlate(vehicleToDelete.plate)} - ${vehicleToDelete.model}"? Esta ação não pode ser desfeita.`
            : ''
        }
        confirmLabel="Excluir"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
