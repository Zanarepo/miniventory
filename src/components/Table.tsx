import React from 'react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  width?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
  className?: string;
}

export const Table = <T extends object>({
  data,
  columns,
  emptyMessage = 'No business records recorded yet.',
  className = '',
}: TableProps<T>): React.ReactElement => {
  return (
    <div className={`table-wrapper ${className}`.trim()}>
      <table className="table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} style={{ width: col.width }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  textAlign: 'center',
                  padding: '40px 16px',
                  color: 'var(--text-muted)',
                  fontSize: '0.95rem',
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {columns.map((col, colIdx) => {
                  const content =
                    typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : ((row as Record<string, unknown>)[
                          col.accessor as string
                        ] as React.ReactNode);
                  return <td key={colIdx}>{content}</td>;
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
