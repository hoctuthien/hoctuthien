import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SkillBar } from "./SkillBar";
import { LuSettings, LuMessageSquare, LuTowerControl } from "react-icons/lu";

const meta = {
  title: "Core/UI/Progress/SkillBar",
  component: SkillBar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} as Meta<typeof SkillBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Leadership: Story = {
  args: {
    label: "LEADERSHIP",
    level: "EXPERT",
    color: "var(--color-primary)",
    icon: <LuSettings size={20} />,
  },
};

export const Communication: Story = {
  args: {
    label: "COMMUNICATION",
    level: "ADVANCED",
    color: "var(--color-secondary)",
    icon: <LuMessageSquare size={20} />,
  },
};

export const Architecture: Story = {
  args: {
    label: "UI/UX ARCHITECTURE",
    level: "INTERMEDIATE",
    color: "#D0DDFE",
    icon: <LuTowerControl size={20} />,
  },
};
