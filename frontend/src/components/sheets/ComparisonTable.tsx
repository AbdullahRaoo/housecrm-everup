import { useState } from 'react';
import { ComparisonTableColumn, ComparisonTableRow } from '../../types/sheets';

interface ComparisonTableProps {
  title?: string;
  columns: ComparisonTableColumn[];
  rows: ComparisonTableRow[];
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ title, columns, rows }) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (columnId: string) => {
    let direction: 'asc' | 'desc' = 'asc';

    if (sortConfig && sortConfig.key === columnId && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key: columnId, direction });
  };

  const sortedRows = [...rows].sort((a, b) => {
    if (!sortConfig) return 0;

    const key = sortConfig.key;

    if (key === 'name') {
      return sortConfig.direction === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }

    const aValue = a.data[key] || 0;
    const bValue = b.data[key] || 0;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortConfig.direction === 'asc'
      ? Number(aValue) - Number(bValue)
      : Number(bValue) - Number(aValue);
  });

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-700">{title}</h4>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              {columns.map(column => (
                <th
                  key={column.id}
                  onClick={() => handleSort(column.id)}
                  className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left cursor-pointer"
                >
                  <div className="flex items-center">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {column.label}
                    </span>
                    {sortConfig && sortConfig.key === column.id && (
                      <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={sortConfig.direction === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                        />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-5 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              sortedRows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-5 py-5 border-b border-gray-200">
                    <span className="text-gray-900 font-medium">{row.name}</span>
                  </td>
                  {columns.slice(1).map(column => (
                    <td key={column.id} className="px-5 py-5 border-b border-gray-200">
                      <span className="text-gray-900">
                        {column.format
                          ? column.format(row.data[column.id])
                          : row.data[column.id]?.toString() || '—'}
                      </span>
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonTable;
