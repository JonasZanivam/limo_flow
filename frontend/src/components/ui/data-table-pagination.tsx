import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DataTablePaginationProps = {
  page: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  disabled?: boolean;
};

export function DataTablePagination({
  page,
  total,
  totalPages,
  onPageChange,
  className,
  disabled = false,
}: DataTablePaginationProps) {
  const limit = 10;
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">
        {total === 0
          ? 'Nenhum registro encontrado'
          : `Mostrando ${start}–${end} de ${total}`}
      </p>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </Button>
        <span className="min-w-24 text-center text-sm text-muted-foreground">
          Página {page} de {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
