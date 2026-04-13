import React from 'react';
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { List } from "./List";
import { LuGraduationCap, LuLayoutDashboard, LuPencil, LuTrash2 } from 'react-icons/lu';

const meta = {
  title: "Components/Data Display/List",
  component: List,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof List>;

export default meta;
type Story = StoryObj<typeof List>;

export const BasicList: Story = {
  args: {
    variant: 'basic',
    items: [
      {
        id: '1',
        title: 'Advanced Pedagogy 101',
        subtitle: '42 Students Enrolled',
        icon: <LuGraduationCap size={20} />,
      },
      {
        id: '2',
        title: 'Curriculum Development',
        subtitle: '12 Modules Completed',
        icon: <LuLayoutDashboard size={20} />,
      },
    ],
  },
};

export const ListWithActions: Story = {
  args: {
    variant: 'action',
    items: [
      {
        id: '3',
        title: 'Marcus Sterling',
        subtitle: 'Senior Design Mentor',
        avatar: 'https://i.pravatar.cc/150?u=a',
        actions: (
          <>
            <button className="htt-list-action-btn"><LuPencil size={14} /></button>
            <button className="htt-list-action-btn htt-list-action-btn--delete"><LuTrash2 size={14} /></button>
          </>
        ),
      },
      {
        id: '4',
        title: 'Elena Rodriguez',
        subtitle: 'Product Strategy Lead',
        avatar: 'https://i.pravatar.cc/150?u=b',
        actions: (
          <>
            <button className="htt-list-action-btn"><LuPencil size={14} /></button>
            <button className="htt-list-action-btn htt-list-action-btn--delete"><LuTrash2 size={14} /></button>
          </>
        ),
      },
    ],
  },
};
