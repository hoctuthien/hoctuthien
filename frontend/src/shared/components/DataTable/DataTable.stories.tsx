import React, { useState } from 'react';
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DataTable, TableRow } from "./DataTable";

const meta = {
  title: "Shared/DataTable",
  component: DataTable,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof DataTable>;

const MOCK_ROWS: TableRow[] = [
  { id: '1', name: 'Design Fundamentals 2024', status: 'active', date: 'Oct 24, 2023' },
  { id: '2', name: 'Mentor Feedback Cycle B', status: 'in-progress', date: 'Nov 12, 2023', selected: true },
];

export const Default: Story = {
  render: () => {
    const [rows, setRows] = useState(MOCK_ROWS);
    
    const handleSelect = (id: string) => {
      setRows(rows.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
    };

    return (
      <div className="p-10 bg-white min-h-screen">
        <div className="flex flex-col gap-8 w-full max-w-[1200px]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-1.5 bg-[#3b60c0] rounded-full" />
            <h2 className="text-[28px] font-bold text-[#1e293b] tracking-tight m-0">Data Tables</h2>
          </div>
          <DataTable rows={rows} onSelect={handleSelect} />
        </div>
      </div>
    );
  }
};

