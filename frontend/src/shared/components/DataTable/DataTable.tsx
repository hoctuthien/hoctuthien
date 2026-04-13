import React from 'react';
import { LuEllipsis } from 'react-icons/lu';
import { Badge } from '../Badge/Badge';
import { Checkbox } from '../Selection/Checkbox/Checkbox';
import './data-table.css';

export interface TableRow {
  id: string;
  name: string;
  status: 'active' | 'in-progress' | 'pending';
  date: string;
  selected?: boolean;
}

interface DataTableProps {
  rows: TableRow[];
  onSelect?: (id: string) => void;
  onSelectAll?: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({ rows, onSelect, onSelectAll }) => {
  return (
    <div className="htt-table-wrapper">
      <table className="htt-table">
        <thead>
          <tr>
            <th style={{ width: 48 }}>
              <Checkbox onChange={onSelectAll} />
            </th>
            <th align="left">LIST NAME</th>
            <th align="left">STATUS</th>
            <th align="left">CREATION DATE</th>
            <th style={{ width: 48 }}>CONTROLS</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={row.selected ? 'htt-table-row--selected' : ''}>
              <td>
                <Checkbox checked={row.selected} onChange={() => onSelect?.(row.id)} />
              </td>
              <td className="htt-table-cell-name">{row.name}</td>
              <td>
                <Badge variant={row.status === 'active' ? 'success' : 'warning'}>
                  {row.status === 'active' ? 'ACTIVE' : 'IN PROGRESS'}
                </Badge>
              </td>
              <td className="htt-table-cell-date">{row.date}</td>
              <td align="center">
                <button className="htt-table-more-btn">
                  <LuEllipsis size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
