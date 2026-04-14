import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Status } from "./Status";

const meta = {
  title: "Shared/Status",
  component: Status,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Status>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Online: Story = {
  args: {
    type: "online",
  },
};

export const Offline: Story = {
  args: {
    type: "offline",
  },
};

export const Busy: Story = {
  args: {
    type: "busy",
  },
};

export const Sabbatical: Story = {
  args: {
    type: "sabbatical",
  },
};
