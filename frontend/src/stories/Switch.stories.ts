import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from 'storybook/test';
import { Switch } from "./Switch";

const meta = {
  title: "Components/Switch",
  component: Switch,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    onChange: { action: "changed" },
  },
  args: { onChange: fn() },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {
  args: {
    label: "Tắt",
    checked: false,
  },
};

export const On: Story = {
  args: {
    label: "Bật",
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    label: "Bị vô hiệu hóa",
    disabled: true,
    checked: true,
  },
};
