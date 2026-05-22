import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EmptyState } from "./EmptyState";

const meta = {
  title: "Shared/Components/EmptyState",
  component: EmptyState,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} as Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoSessions: Story = {
  args: {
    title: "Shared/Components/EmptyState",
    description: "You haven't scheduled any mentor exchanges yet. Start your growth journey today.",
    actionText: "EXPLORE MENTORS",
  },
};
