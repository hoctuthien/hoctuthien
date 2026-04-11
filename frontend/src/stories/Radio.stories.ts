import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Radio } from "./Radio";

const meta = {
  title: "Components/Radio",
  component: Radio,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    onChange: { action: "changed" },
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Lựa chọn mặc định",
    checked: false,
  },
};

export const Selected: Story = {
  args: {
    label: "Đã chọn",
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    label: "Bị vô hiệu hóa",
    disabled: true,
    checked: false,
  },
};
