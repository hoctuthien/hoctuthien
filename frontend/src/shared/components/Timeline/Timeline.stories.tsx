import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Timeline } from "./Timeline";
import { LuCheck, LuCalendar, LuAward } from "react-icons/lu";
import { LucideFileEdit } from "lucide-react";

const meta = {
  title: "Shared/Timeline",
  component: Timeline,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConnectionLifecycle: Story = {
  args: {
    items: [
      {
        id: "1",
        title: "APPLICATION",
        description: "Mentor review in progress (24h)",
        status: "active",
        icon: <LucideFileEdit size={24} />,
      },
      {
        id: "2",
        title: "MATCHING",
        description: "Confirmed by Senior Architect",
        status: "completed",
        icon: <LuCheck size={24} />,
      },
      {
        id: "3",
        title: "SESSION 1",
        description: "Next: Oct 24, 2023 at 10:00 AM",
        status: "upcoming",
        icon: <LuCalendar size={24} />,
      },
      {
        id: "4",
        title: "COMPLETION",
        description: "Final outcome and certification",
        status: "future",
        icon: <LuAward size={24} />,
      },
    ],
  },
};
