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
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,900;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
