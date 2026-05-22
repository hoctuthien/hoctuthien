import React, { useState } from 'react';
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DataTable, Column } from "./DataTable";
import { Badge } from '../../../core/ui/Badge/Badge';

interface MockData {
  id: string;
  name: string;
  status: "active" | "in-progress" | "pending";
  date: string;
  selected?: boolean;
}

const meta = {
  title: "Shared/Components/DataTable",
  component: DataTable,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} as Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof DataTable>;

const MOCK_DATA: MockData[] = [
  { id: '1', name: 'Design Fundamentals 2024', status: 'active', date: 'Oct 24, 2023' },
  { id: '2', name: 'Mentor Feedback Cycle B', status: 'in-progress', date: 'Nov 12, 2023', selected: true },
];

export const Default: Story = {
  render: () => {
    const [data, setData] = useState(MOCK_DATA);
    
    const handleSelect = (id: string) => {
      setData(data.map(item => item.id === id ? { ...item, selected: !item.selected } : item));
    };

    const columns: Column<MockData>[] = [
      { key: 'name', header: 'List Name' },
      { 
        key: 'status', 
        header: 'Status',
        render: (item) => (
          <Badge
            variant={item.status === "active" ? "success" : "warning"}
            dot
            className="px-3 py-1"
          >
            {item.status === "active" ? "Active" : "In Progress"}
          </Badge>
        )
      },
      { key: 'date', header: 'Creation Date' },
    ];

    return (
      <div className="p-10 bg-white min-h-screen">
        <div className="flex flex-col gap-8 w-full max-w-[1200px]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-1.5 bg-[#3b60c0] rounded-full" />
            <h2 className="text-[28px] font-bold text-[#1e293b] tracking-tight m-0">Data Tables</h2>
          </div>
          <DataTable data={data} columns={columns} onSelect={handleSelect} />
        </div>
      </div>
    );
  }
};

