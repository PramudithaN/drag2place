'use client';

import React from 'react';
import { TableCardData, TableRow } from '@/types/board';
import { Plus, Trash2 } from 'lucide-react';

interface TableCardProps {
  cardId: string;
  data: TableCardData;
  onChange: (data: Partial<TableCardData>) => void;
}

export const TableCard: React.FC<TableCardProps> = ({ data, onChange }) => {
  const columns = data.columns || ['Item', 'Status', 'Cost'];
  const rows = data.rows || [
    { id: 'r1', cells: ['Design Specs', 'Completed', '$1,200'] },
    { id: 'r2', cells: ['Print Proofing', 'In Review', '$450'] },
  ];

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const nextRows = rows.map((r, rIdx) => {
      if (rIdx === rowIndex) {
        const nextCells = [...r.cells];
        nextCells[colIndex] = value;
        return { ...r, cells: nextCells };
      }
      return r;
    });
    onChange({ rows: nextRows });
  };

  const handleColumnHeaderChange = (colIndex: number, value: string) => {
    const nextCols = [...columns];
    nextCols[colIndex] = value;
    onChange({ columns: nextCols });
  };

  const addRow = () => {
    const newRow: TableRow = {
      id: `row-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      cells: new Array(columns.length).fill(''),
    };
    onChange({ rows: [...rows, newRow] });
  };

  const deleteRow = (rowId: string) => {
    if (rows.length <= 1) return;
    onChange({ rows: rows.filter((r) => r.id !== rowId) });
  };

  const addColumn = () => {
    const nextCols = [...columns, `Col ${columns.length + 1}`];
    const nextRows = rows.map((r) => ({
      ...r,
      cells: [...r.cells, ''],
    }));
    onChange({ columns: nextCols, rows: nextRows });
  };

  return (
    <div className="flex flex-col h-full space-y-2 overflow-x-auto scrollbar-thin">
      <div className="flex-1 overflow-y-auto max-h-[300px] scrollbar-thin">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-stone-300 dark:border-stone-700">
              {columns.map((col, idx) => (
                <th key={idx} className="pb-1.5 px-2 font-mono font-semibold text-stone-600 dark:text-stone-300">
                  <input
                    type="text"
                    value={col}
                    onChange={(e) => handleColumnHeaderChange(idx, e.target.value)}
                    className="w-full bg-transparent border-none outline-none font-semibold text-stone-700 dark:text-stone-200"
                  />
                </th>
              ))}
              <th className="w-6 pb-1.5 px-1">
                <button
                  type="button"
                  onClick={addColumn}
                  className="p-0.5 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                  title="Add column"
                >
                  <Plus size={12} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200/50 dark:divide-stone-800/50">
            {rows.map((row, rIdx) => (
              <tr key={row.id} className="group hover:bg-stone-500/5 transition-colors">
                {row.cells.map((cell, cIdx) => (
                  <td key={cIdx} className="py-1 px-2">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                      placeholder="—"
                      className="w-full bg-transparent border-none outline-none text-stone-800 dark:text-stone-100 font-sans text-xs"
                    />
                  </td>
                ))}
                <td className="w-6 py-1 px-1">
                  <button
                    type="button"
                    onClick={() => deleteRow(row.id)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-stone-400 hover:text-rose-500 transition-opacity"
                    title="Delete row"
                  >
                    <Trash2 size={11} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-stone-200/50 dark:border-stone-700/50 text-[11px]">
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 font-medium transition-colors"
        >
          <Plus size={12} />
          <span>Add Row</span>
        </button>
        <span className="text-stone-400 font-mono text-[10px]">{rows.length} rows</span>
      </div>
    </div>
  );
};
