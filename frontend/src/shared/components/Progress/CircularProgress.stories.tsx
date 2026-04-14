import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CircularProgress } from "./CircularProgress";

const meta = {
  title: "Shared/CircularProgress",
  component: CircularProgress,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CircularProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ProfileScore: Story = {
  args: {
    value: 75,
    label: "PROFILE SCORE",
    color: "var(--color-primary)",
  },
};

export const Curriculum: Story = {
  args: {
    value: 45,
    label: "CURRICULUM",
    color: "var(--color-secondary)",
  },
};
