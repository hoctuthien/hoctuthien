import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { Switch } from "./Switch";

const meta = {
  title: "Core/UI/Selection/Switch",
  component: Switch,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Component Switch (Toggle) chuẩn dành cho các cài đặt bật/tắt.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
    label: { control: "text" },
  },
  args: { onChange: fn() },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Toggle Switch",
    checked: false,
  },
};

export const Checked: Story = {
  args: {
    label: "Switch is On",
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled Switch",
    disabled: true,
  },
};
