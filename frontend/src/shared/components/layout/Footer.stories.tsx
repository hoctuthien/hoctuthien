import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Footer } from "./Footer";
import { NextIntlClientProvider } from "next-intl";

const messages = {
  Common: {
    company: "Công ty",
    aboutUs: "Về chúng tôi",
    courses: "Khóa học",
    mentorship: "Cố vấn",
    support: "Hỗ trợ",
    helpCenter: "Trung tâm trợ giúp",
    faq: "Câu hỏi thường gặp",
    contactUs: "Liên hệ",
    legal: "Pháp lý",
    privacyPolicy: "Chính sách bảo mật",
    termsOfService: "Điều khoản dịch vụ",
    cookies: "Cookies",
    copyright: "© 2026 Học Từ Thiện. Bảo lưu mọi quyền.",
  },
  Homepage: {
    brandDescription: "Nền tảng giáo dục và từ thiện — Kết nối tri thức, lan toả yêu thương.",
  },
};

const meta = {
  title: "Shared/Layout/Footer",
  component: Footer,
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
} as Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
