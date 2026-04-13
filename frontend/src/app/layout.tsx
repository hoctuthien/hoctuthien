import type { Metadata } from 'next';
import './global.css';
import { Geist } from "next/font/google";
import { cn } from "@/src/shared/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="vi" className={cn("font-sans", geist.variable)}>
      <body>{children}</body>
    </html>
  );
}
