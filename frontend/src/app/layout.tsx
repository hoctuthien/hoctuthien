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
  metadataBase: new URL("https://app.hoctuthien.com"),
  title: "Học Từ Thiện",
  description:
    "Nền tảng giáo dục và từ thiện — Kết nối tri thức, lan toả yêu thương.",
  icons: {
    icon: "/images/avatar_browser.png",
  },
  openGraph: {
    title: "Học Từ Thiện",
    description:
      "Nền tảng giáo dục và từ thiện — Kết nối tri thức, lan toả yêu thương.",
    url: "https://app.hoctuthien.com",
    siteName: "Học Từ Thiện",
    images: [
      {
        url: "https://app.hoctuthien.com/images/avatar_main.png",
        width: 1200,
        height: 630,
        alt: "Học Từ Thiện - Kết nối tri thức",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Học Từ Thiện",
    description:
      "Nền tảng giáo dục và từ thiện — Kết nối tri thức, lan toả yêu thương.",
    images: ["https://app.hoctuthien.com/images/avatar_main.png"],
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
