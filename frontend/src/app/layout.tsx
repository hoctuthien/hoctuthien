import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { cn } from "@/core/utils/cn";
import { Providers } from "./providers";
import "./global.css";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Học Từ Thiện",
  description:
    "Nền tảng giáo dục và từ thiện — Kết nối tri thức, lan toả yêu thương.",
  icons: {
    icon: "/images/avatar_browser.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body
        className={cn(montserrat.variable, "font-sans antialiased")}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
