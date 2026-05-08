import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { List } from "./List";
import {
  LuGraduationCap,
  LuBookOpen,
  LuPencil,
  LuTrash2,
} from "react-icons/lu";

const meta = {
  title: "Shared/Components/List",
  component: List,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof List>;

export default meta;
type Story = StoryObj<typeof List>;

const ActionButtons = () => (
  <div className="flex gap-2">
    <button className="w-9 h-9 rounded-full bg-[#E0ECFC] text-[#3b60c0] flex items-center justify-center border-none cursor-pointer transition-all hover:bg-[#cbdcf7] active:scale-90">
      <LuPencil size={18} />
    </button>
    <button className="w-9 h-9 rounded-full bg-[#FEE2E2] text-[#B91C1C] flex items-center justify-center border-none cursor-pointer transition-all hover:bg-[#FCA5A5] active:scale-90">
      <LuTrash2 size={18} />
    </button>
  </div>
);

export const Basic: Story = {
  render: () => (
    <div className="p-10 bg-white min-h-[400px] flex items-start justify-center">
      <List
        title="BASIC LIST"
        items={[
          {
            id: "1",
            title: "Shared/Components/List",
            subtitle: "Shared/Components/List",
            icon: <LuGraduationCap size={22} />,
          },
          {
            id: "2",
            title: "Shared/Components/List",
            subtitle: "Shared/Components/List",
            icon: <LuBookOpen size={22} />,
          },
        ]}
      />
    </div>
  ),
};

export const WithActions: Story = {
  render: () => (
    <div className="p-10 bg-white min-h-[400px] flex items-start justify-center">
      <List
        title="LIST WITH ACTIONS"
        items={[
          {
            id: "3",
            title: "Shared/Components/List",
            subtitle: "Shared/Components/List",
            avatar: "https://xsgames.co/randomusers/assets/avatars/male/40.jpg",
            actions: <ActionButtons />,
          },
          {
            id: "4",
            title: "Shared/Components/List",
            subtitle: "Shared/Components/List",
            avatar:
              "https://xsgames.co/randomusers/assets/avatars/female/24.jpg",
            actions: <ActionButtons />,
          },
        ]}
      />
    </div>
  ),
};
