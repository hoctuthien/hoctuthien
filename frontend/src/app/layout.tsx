import type { Metadata } from 'next';
import './global.css';

export const metadata: Metadata = {
  title: 'Học Từ Thiện',
  description: 'Nền tảng giáo dục và từ thiện — Kết nối tri thức, lan toả yêu thương.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
