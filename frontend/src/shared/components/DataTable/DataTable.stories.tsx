import React, { useState } from 'react';
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DataTable, TableRow } from "./DataTable";

const meta = {
  title: "Components/Data Display/DataTable",
  component: DataTable,
  parameters: {
    layout: "centered",
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

    return <DataTable rows={rows} onSelect={handleSelect} />;
  }
};
