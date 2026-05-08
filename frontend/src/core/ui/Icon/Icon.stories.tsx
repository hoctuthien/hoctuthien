import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Icon } from "./index";

const meta = {
  title: "Core/UI/Icon",
  component: Icon,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    name: {
      control: "text",
      description: "Tên icon từ thư viện Lucide",
    },
    size: {
      control: "number",
      description: "Kích thước của icon",
    },
    className: {
      control: "text",
      description: "CSS classes bổ sung",
    },
  },
} as Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "User",
    size: 24,
  },
};

export const Large: Story = {
  args: {
    name: "Heart",
    size: 48,
    className: "text-primary",
  },
};

export const CustomColor: Story = {
  args: {
    name: "Search",
    size: 24,
    className: "text-secondary",
  },
};
