import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { cn } from "@/core/utils/cn";
import { Providers } from "./providers";
import { DeviceInitializer } from "@/shared/components/DeviceInitializer";
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

/**
 * Root Layout — async vì cần await locale & messages từ server.
 *
 * Flow:
 *   1. getLocale()   → đọc locale từ i18n/request.ts (hiện tại: 'vi')
 *   2. getMessages() → load messages/vi.json
 *   3. NextIntlClientProvider → truyền messages xuống Client Components
 *   4. Providers → QueryClientProvider (React Query)
 */
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={cn(montserrat.variable, "font-sans antialiased")}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
