import React from 'react';
import { LuEllipsis } from 'react-icons/lu';
import { Badge } from '../Badge/Badge';
import { Checkbox } from '../Selection/Checkbox/Checkbox';
import { cn } from '@/shared/lib/utils';

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
  className?: string;
}

export const DataTable: React.FC<DataTableProps> = ({ rows, onSelect, onSelectAll, className }) => {
  return (
    <div className={cn('w-full bg-surface-variant p-6 rounded-2xl border border-border-default/50', className)}>
      <table className="w-full border-separate border-spacing-y-2">
        <thead>
          <tr>
            <th className="w-12 p-3 px-4">
              <Checkbox onChange={onSelectAll} />
            </th>
            <th className="p-3 px-4 text-xs font-bold text-text-muted uppercase tracking-[0.1em] text-left">List Name</th>
            <th className="p-3 px-4 text-xs font-bold text-text-muted uppercase tracking-[0.1em] text-left">Status</th>
            <th className="p-3 px-4 text-xs font-bold text-text-muted uppercase tracking-[0.1em] text-left">Creation Date</th>
            <th className="w-12 p-3 px-4 text-xs font-bold text-text-muted uppercase tracking-[0.1em] text-center">Controls</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr 
              key={row.id} 
              className={cn(
                'bg-surface transition-all duration-350 hover:translate-y-[-2px] hover:shadow-md group h-[72px]',
                row.selected && 'bg-primary-fixed/30 z-10 relative'
              )}
            >
              <td className="px-4 rounded-l-md border-y border-l border-border-default/30 group-hover:border-primary/20">
                <Checkbox checked={row.selected} onChange={() => onSelect?.(row.id)} />
              </td>
              <td className="px-4 text-body font-bold text-text-heading border-y border-border-default/30 group-hover:border-primary/20">{row.name}</td>
              <td className="px-4 border-y border-border-default/30 group-hover:border-primary/20">
                <Badge 
                  variant={row.status === 'active' ? 'success' : 'warning'}
                  className="px-3 py-1"
                >
                  {row.status === 'active' ? 'Active' : 'In Progress'}
                </Badge>
              </td>
              <td className="px-4 text-body-sm text-text-body border-y border-border-default/30 group-hover:border-primary/20">{row.date}</td>
              <td className="px-4 rounded-r-md text-center border-y border-r border-border-default/30 group-hover:border-primary/20">
                <button className="bg-transparent border-none text-text-muted cursor-pointer flex items-center justify-center mx-auto hover:text-primary transition-colors">
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
