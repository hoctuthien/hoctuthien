import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { Radio } from "./Radio";

const meta = {
  title: "Core/UI/Selection/Radio",
  component: Radio,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Component Radio button chuẩn dành cho việc chọn một trong nhiều lựa chọn.",
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
} as Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Radio Option",
    checked: false,
  },
};

export const Checked: Story = {
  args: {
    label: "Selected Option",
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled Option",
    disabled: true,
  },
};
