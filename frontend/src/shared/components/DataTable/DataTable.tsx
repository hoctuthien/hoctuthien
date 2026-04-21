import React from "react";
import { LuEllipsis } from "react-icons/lu";
import { Checkbox } from "@ui";
import { cn } from "@/core/utils/cn";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data?: T[];
  columns?: Column<T>[];
  // Backward compatibility
  rows?: T[];
  onSelect?: (id: string) => void;
  onSelectAll?: () => void;
  className?: string;
}

export function DataTable<T extends { id: string; selected?: boolean }>({
  data,
  columns,
  rows,
  onSelect,
  onSelectAll,
  className,
}: DataTableProps<T>) {
  const tableData = data || rows || [];

  // Default columns for backward compatibility if columns not provided
  const tableColumns: Column<T>[] = columns || [
    { key: "name", header: "List Name" },
    { key: "status", header: "Status" },
    { key: "date", header: "Creation Date" },
  ] as Column<T>[];

  return (
    <div
      className={cn(
        "w-full bg-[#f1f4f9] p-7 rounded-[16px] border border-white/40 font-sans antialiased shadow-sm overflow-x-auto",
        className,
      )}
    >
      <table className="w-full border-separate border-spacing-y-2 min-w-[600px]">
        <thead>
          <tr>
            <th className="w-16 p-3 px-6">
              <Checkbox className="-ml-1" onChange={onSelectAll} />
            </th>
            {tableColumns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "p-3 px-4 text-[11px] font-black text-[#64748b] uppercase tracking-[0.2em] text-left",
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
            <th className="w-20 p-3 px-4 text-[11px] font-black text-[#64748b] uppercase tracking-[0.2em] text-right">
              Controls
            </th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((item) => (
            <tr
              key={item.id}
              className={cn(
                "bg-white transition-all duration-300 hover:shadow-md h-[56px]",
                item.selected && "bg-[#f8faff]",
              )}
            >
              <td className="px-6 rounded-l-lg border-y border-l border-white/50">
                <Checkbox
                  className="-ml-1"
                  checked={item.selected}
                  onChange={() => onSelect?.(item.id)}
                />
              </td>
              {tableColumns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "px-4 text-[14px] font-medium text-[#1e293b] border-y border-white/50",
                    col.className,
                  )}
                >
                  {col.render ? (
                    col.render(item)
                  ) : (
                    <span className={cn(col.key === "name" && "font-bold")}>
                      {(item as any)[col.key] || "-"}
                    </span>
                  )}
                </td>
              ))}
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
}
