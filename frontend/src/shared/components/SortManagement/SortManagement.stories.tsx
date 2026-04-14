import React from 'react';
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { VerticalReorder, HorizontalSort } from "./SortManagement";

const meta = {
  title: "Shared/SortManagement",
  component: VerticalReorder,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof VerticalReorder>;

export default meta;

export const Vertical: StoryObj<typeof VerticalReorder> = {
  args: {
    items: [
      { id: '1', index: '01', label: 'Curriculum Onboarding' },
      { id: '2', index: '02', label: 'Mentor Matching Process (Moving)', isMoving: true },
      { id: '3', index: '03', label: 'Feedback Collection' },
    ],
  },
};

export const Horizontal: StoryObj<typeof HorizontalSort> = {
  render: () => (
    <div style={{ width: '800px' }}>
      <HorizontalSort 
        items={[
          { id: '1', num: '01', label: 'Visual Language' },
          { id: '2', num: '02', label: 'Typography' },
          { id: '3', num: '03', label: 'Grid Systems', isActive: true },
          { id: '4', num: '04', label: 'Color Theory' },
        ]} 
      />
    </div>
  )
};
