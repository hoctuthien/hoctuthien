import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { Pagination } from "./Pagination";

const meta = {
  title: "Shared/Navigation/Pagination",
  component: Pagination,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Pagination component hỗ trợ điều hướng qua các trang dữ liệu lớn. Gồm 3 loại: Standard (kèm bộ chọn số lượng entries), Multi-page (nút tới/lui lớn), và Simple (dạng số trang rút gọn).",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["standard", "multi-page", "simple"],
      description: "Kiểu hiển thị của pagination",
    },
    currentPage: {
      control: { type: "number", min: 1 },
      description: "Trang hiện tại",
    },
    totalPages: {
      control: { type: "number", min: 1 },
      description: "Tổng số trang",
    },
    entriesPerPage: {
      control: "number",
      description: "Số lượng bản ghi trên mỗi trang",
    },
  },
  args: { 
    onPageChange: fn(),
    onEntriesChange: fn(),
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  args: {
    type: "standard",
    currentPage: 1,
    totalPages: 12,
    entriesPerPage: 10,
  },
};

export const MultiPage: Story = {
  args: {
    type: "multi-page",
    currentPage: 3,
    totalPages: 5,
  },
};

export const Simple: Story = {
  args: {
    type: "simple",
    currentPage: 1,
    totalPages: 10,
  },
};
