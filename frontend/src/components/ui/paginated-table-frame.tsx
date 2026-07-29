import type { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const DEFAULT_PAGE_SIZE = 10;
export const TABLE_ROW_HEIGHT_PX = 56;

type PaginatedTableFrameProps = {
  colSpan: number;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  isEmpty: boolean;
  emptyMessage: string;
  rowCount: number;
  header: ReactNode;
  children: ReactNode;
  footer: ReactNode;
};

export function PaginatedTableFrame({
  colSpan,
  isLoading,
  isError,
  errorMessage = 'Não foi possível carregar os dados.',
  isEmpty,
  emptyMessage,
  rowCount,
  header,
  children,
  footer,
}: PaginatedTableFrameProps) {
  const bodyHeight = DEFAULT_PAGE_SIZE * TABLE_ROW_HEIGHT_PX;
  const placeholderCount = Math.max(0, DEFAULT_PAGE_SIZE - rowCount);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {header}
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={colSpan} className="p-0">
                  <div style={{ minHeight: bodyHeight }}>
                    {Array.from({ length: DEFAULT_PAGE_SIZE }).map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center border-b px-6"
                        style={{ height: TABLE_ROW_HEIGHT_PX }}
                      >
                        <Skeleton className="h-4 w-full max-w-md" />
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td
                  colSpan={colSpan}
                  className="px-6 text-center text-sm text-destructive"
                  style={{ height: bodyHeight }}
                >
                  <div className="flex h-full items-center justify-center">
                    {errorMessage}
                  </div>
                </td>
              </tr>
            ) : isEmpty ? (
              <tr>
                <td
                  colSpan={colSpan}
                  className="px-6 text-center text-sm text-muted-foreground"
                  style={{ height: bodyHeight }}
                >
                  <div className="flex h-full items-center justify-center">
                    {emptyMessage}
                  </div>
                </td>
              </tr>
            ) : (
              <>
                {children}
                {Array.from({ length: placeholderCount }).map((_, index) => (
                  <tr key={`placeholder-${index}`} className="border-b last:border-0">
                    <td
                      colSpan={colSpan}
                      style={{ height: TABLE_ROW_HEIGHT_PX }}
                    />
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {footer}
    </>
  );
}
