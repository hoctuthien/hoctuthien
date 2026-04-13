import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { Button } from "./Button";

const meta = {
  title: "Shared/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Button component đa năng theo hướng dẫn thiết kế của dự án Học Từ Thiện. Hỗ trợ 5 loại hiển thị, 3 kích cỡ, hỗ trợ icon, trạng thái tải và độ rộng đầy đủ.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "danger", "outline", "text"],
      description: "Kiểu hiển thị của nút",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Kích thước của nút",
    },
    label: {
      control: "text",
      description: "Nội dung hiển thị bên trong nút",
    },
    disabled: {
      control: "boolean",
      description: "Trạng thái vô hiệu hóa",
    },
    loading: {
      control: "boolean",
      description: "Trạng thái đang tải (hiển thị spinner)",
    },
    fullWidth: {
      control: "boolean",
      description: "Chiều rộng đầy đủ 100% container",
    },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "primary",
    label: "Hành động chính",
    size: "md",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    label: "Hành động phụ",
    size: "md",
  },
};

export const Danger: Story = {
  args: {
    variant: "danger",
    label: "Xóa tài khoản",
    size: "md",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    label: "Thêm mục mới",
    size: "md",
  },
};

export const Text: Story = {
  args: {
    variant: "text",
    label: "Tìm hiểu thêm",
    size: "md",
  },
};

export const Disabled: Story = {
  args: {
    variant: "primary",
    label: "Không khả dụng",
    disabled: true,
    size: "md",
  },
};

export const Loading: Story = {
  args: {
    variant: "primary",
    label: "Đang xử lý...",
    loading: true,
    size: "md",
  },
};

export const Small: Story = {
  args: {
    variant: "primary",
    label: "Nút nhỏ",
    size: "sm",
  },
};

export const Medium: Story = {
  args: {
    variant: "primary",
    label: "Nút vừa",
    size: "md",
  },
};

export const Large: Story = {
  args: {
    variant: "primary",
    label: "Nút lớn",
    size: "lg",
  },
};

export const FullWidth: Story = {
  args: {
    variant: "primary",
    label: "Nút rộng toàn màn hình",
    fullWidth: true,
  },
  parameters: {
    layout: "padded",
  },
};