import type { Metadata } from 'next';
import './global.css';
import { Geist } from "next/font/google";
import { cn } from "@/core/utils/cn";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'Học Từ Thiện',
  description: 'Nền tảng giáo dục và từ thiện — Kết nối tri thức, lan toả yêu thương.',
};

import { Providers } from './providers';

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
      <body className={cn(geist.variable, "font-sans antialiased")}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
