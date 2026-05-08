import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Header } from "./Header";
import { NextIntlClientProvider } from "next-intl";

const messages = {
  Common: {
    home: "Trang chủ",
    courses: "Khóa học",
    mentorship: "Cố vấn",
    aboutUs: "Về chúng tôi",
    getStarted: "Bắt đầu ngay",
  },
};

const meta = {
  title: "Shared/Layout/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="vi" messages={messages}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
