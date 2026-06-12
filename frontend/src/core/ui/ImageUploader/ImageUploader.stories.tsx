import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ImageUploader } from "./ImageUploader";

const meta = {
  title: "Core/UI/ImageUploader",
  component: ImageUploader,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    onChange: { action: "changed" },
  },
  args: {
    onUpload: async (file: File) => {
      // Mô phỏng độ trễ mạng khi tải ảnh lên cloud
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=600";
    },
  },
} as Meta<typeof ImageUploader>;

export default meta;
type Story = StoryObj<typeof meta>;

// 1. Default Uploader (Empty State / Drag and Drop Box)
export const Default: Story = {
  args: {
    label: "Ảnh chụp chứng chỉ xác thực",
    placeholder: "Kéo thả hình ảnh vào đây",
    subPlaceholder: "hoặc click để chọn tệp từ máy tính",
    value: "",
  },
};

// 2. With Preloaded Image (Uploaded/Preview State)
export const WithImage: Story = {
  args: {
    label: "Bằng Đại học Công nghệ Thông tin",
    value: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=600",
    viewOriginalLabel: "Xem bằng gốc",
    deleteLabel: "Gỡ bằng cấp",
  },
};

// 3. Error Validation State (Red border outline and warning text)
export const WithError: Story = {
  args: {
    label: "Chứng chỉ AWS Solutions Architect",
    placeholder: "Kéo thả hình ảnh vào đây",
    subPlaceholder: "hoặc click để chọn tệp từ máy tính",
    error: "Ảnh chụp chứng chỉ xác thực là bắt buộc đối với cố vấn",
    value: "",
  },
};

// 4. Multiple Images Uploader (Empty State)
export const MultipleEmpty: Story = {
  args: {
    multiple: true,
    label: "Ảnh chụp bằng cấp & chứng chỉ liên quan (Nhiều ảnh)",
    placeholder: "Kéo thả nhiều hình ảnh vào đây",
    subPlaceholder: "hoặc click để chọn các tệp từ máy tính",
    value: [],
  },
};

// 5. Multiple Images Uploader (Preloaded State with Grid View)
export const MultipleWithImages: Story = {
  args: {
    multiple: true,
    label: "Ảnh chụp bằng cấp & chứng chỉ liên quan (Nhiều ảnh)",
    value: [
      "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600",
    ],
    viewOriginalLabel: "Xem ảnh gốc",
    deleteLabel: "Xóa",
  },
};

