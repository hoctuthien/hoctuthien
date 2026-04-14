import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { Checkbox } from "./Checkbox";

const meta = {
  title: "Shared/Selection/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Component Checkbox chuẩn, hỗ trợ trạng thái checked, disabled và indeterminate.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    checked: { 
      control: "boolean",
      description: "Trạng thái đã chọn",
    },
    indeterminate: { 
      control: "boolean",
      description: "Trạng thái lấp lửng (không chọn hoàn toàn)",
    },
    disabled: { 
      control: "boolean",
      description: "Vô hiệu hóa",
    },
    label: { 
      control: "text",
      description: "Nhãn văn bản",
    },
  },
  args: { onChange: fn() },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Checkbox Label",
    checked: false,
  },
};

export const Checked: Story = {
  args: {
    label: "Checked State",
    checked: true,
  },
};

export const Indeterminate: Story = {
  args: {
    label: "Indeterminate State",
    indeterminate: true,
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled Checkbox",
    disabled: true,
    checked: true,
  },
};
