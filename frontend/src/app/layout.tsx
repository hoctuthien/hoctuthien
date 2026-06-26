import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { cn } from "@/core/utils/cn";
import { Providers } from "./providers";
import { AuthProvider } from "./auth-provider";
import { DeviceInitializer } from "@/shared/components/DeviceInitializer";
import { FloatingSupport } from "@/shared/components/FloatingSupport";
import "./global.css";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hoctuthien.com"),
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
    url: "https://hoctuthien.com",
    siteName: "Học Từ Thiện",
    images: [
      {
        url: "https://hoctuthien.com/images/avatar_main.png",
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
    images: ["https://hoctuthien.com/images/avatar_main.png"],
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
import { auth } from "@/auth";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const session = await auth();

  return (
    <html lang={locale} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={cn(montserrat.variable, "font-sans antialiased")}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <AuthProvider session={session}>
              <DeviceInitializer />
              {children}
              <FloatingSupport />
            </AuthProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
