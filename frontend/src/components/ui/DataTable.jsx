import Spinner from './Spinner';
import EmptyState from './EmptyState';
import Button from './Button';

// Generic table shell: columns = [{ key, header, render?(row), className? }]
export default function DataTable({
  columns,
  data = [],
  loading = false,
  emptyTitle = 'No records found',
  emptyDescription,
  rowKey = 'id',
  onRowClick,
  page = 1,
  pageSize = 20,
  total,
  onPageChange,
}) {
  const totalPages = total != null ? Math.max(1, Math.ceil(total / pageSize)) : null;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-md py-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide whitespace-nowrap ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-xl text-center">
                  <Spinner className="text-primary mx-auto" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState icon="search_off" title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row[rowKey]}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`border-b border-outline-variant last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-surface-container-low' : ''}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-md py-md font-body-sm text-body-sm text-on-surface ${col.className || ''}`}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages && totalPages > 1 && (
        <div className="flex items-center justify-between pt-md">
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-sm">
            <Button
              variant="secondary"
              icon="chevron_left"
              disabled={page <= 1}
              onClick={() => onPageChange?.(page - 1)}
            >
              Prev
            </Button>
            <Button
              variant="secondary"
              disabled={page >= totalPages}
              onClick={() => onPageChange?.(page + 1)}
            >
              Next
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
