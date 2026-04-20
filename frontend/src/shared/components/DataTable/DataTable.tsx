import React from "react";
import { LuEllipsis } from "react-icons/lu";
import { Badge, Checkbox } from "@ui";
import { cn } from "@/shared/lib/utils";

export interface TableRow {
  id: string;
  name: string;
  status: "active" | "in-progress" | "pending";
  date: string;
  selected?: boolean;
}

interface DataTableProps {
  rows: TableRow[];
  onSelect?: (id: string) => void;
  onSelectAll?: () => void;
  className?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  rows,
  onSelect,
  onSelectAll,
  className,
}) => {
  return (
    <div
      className={cn(
        "w-full bg-[#f1f4f9] p-7 rounded-[16px] border border-white/40 font-sans antialiased shadow-sm",
        className,
      )}
    >
      <table className="w-full border-separate border-spacing-y-2">
        <thead>
          <tr>
            <th className="w-16 p-3 px-6">
              <Checkbox className="-ml-1" onChange={onSelectAll} />
            </th>
            <th className="p-3 px-4 text-[11px] font-black text-[#64748b] uppercase tracking-[0.2em] text-left">
              List Name
            </th>
            <th className="p-3 px-4 text-[11px] font-black text-[#64748b] uppercase tracking-[0.2em] text-left">
              Status
            </th>
            <th className="p-3 px-4 text-[11px] font-black text-[#64748b] uppercase tracking-[0.2em] text-left">
              Creation Date
            </th>
            <th className="w-20 p-3 px-4 text-[11px] font-black text-[#64748b] uppercase tracking-[0.2em] text-right">
              Controls
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={cn(
                "bg-white transition-all duration-300 hover:shadow-md h-[56px]",
                row.selected && "bg-[#f8faff]",
              )}
            >
              <td className="px-6 rounded-l-lg border-y border-l border-white/50">
                <Checkbox
                  className="-ml-1"
                  checked={row.selected}
                  onChange={() => onSelect?.(row.id)}
                />
              </td>
              <td className="px-4 text-[14px] font-bold text-[#1e293b] border-y border-white/50">
                {row.name}
              </td>
              <td className="px-4 border-y border-white/50">
                <Badge
                  variant={row.status === "active" ? "success" : "warning"}
                  dot
                  className="px-3 py-1"
                >
                  {row.status === "active" ? "Active" : "In Progress"}
                </Badge>
              </td>
              <td className="px-4 text-[13px] font-medium text-[#64748b] border-y border-white/50">
                {row.date}
              </td>
              <td className="px-4 rounded-r-lg text-right border-y border-r border-white/50">
                <button className="bg-transparent border-none text-[#64748b] cursor-pointer inline-flex items-center justify-center p-2 rounded-full hover:bg-slate-100 transition-all active:scale-90">
                  <LuEllipsis size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
