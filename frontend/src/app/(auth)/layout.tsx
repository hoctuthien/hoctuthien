import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Icon } from "@/core/ui/Icon";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("Auth");
  const tCommon = useTranslations("Common");

  return (
    <div className="flex h-screen overflow-hidden font-[Montserrat]">
      <aside className="hidden lg:flex lg:w-1/2 relative flex-col justify-between overflow-hidden bg-[#0A1628]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: "url('/images/login-background.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0A1628]/90 via-[#0A1628]/40 to-[#0A1628]/10" />

        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          {/* Header */}
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center group transition-all active:scale-95 no-underline"
            >
              <Image
                src="/images/logo.png"
                alt="Học Từ Thiện"
                width={160}
                height={80}
                className="h-10 w-auto object-contain transition-all"
              />
            </Link>

            {/* Home Button (Desktop - Internal) */}
            <Link
              href="/"
              className="text-white/60 hover:text-white flex items-center gap-1.5 text-sm font-semibold transition-all hover:-translate-x-1 group"
            >
              <Icon
                name="ChevronLeft"
                className="w-4 h-4 transition-transform group-hover:scale-110"
              />
              {t("backToHome")}
            </Link>
          </div>

          <div className="max-w-md">
            <h1 className="text-white text-5xl font-bold leading-[1.1] mb-6 tracking-tight">
              {t("heroTitle")}
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              {t("heroSubtitle")}
            </p>
          </div>

          <div className="flex gap-10 text-white/40 text-sm font-medium">
            <span className="hover:text-white transition-colors cursor-pointer">
              {t("policy")}
            </span>
            <span className="hover:text-white transition-colors cursor-pointer">
              {t("aboutUs")}
            </span>
            <span className="hover:text-white transition-colors cursor-pointer">
              {t("reportIssue")}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center bg-[#F8FAFC] relative overflow-hidden">
        {/* Decorative background for mobile/tablet */}
        <div className="absolute inset-0 pointer-events-none lg:hidden overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        </div>

        {/* Mobile Header (Hidden on Desktop) */}
        <div className="lg:hidden w-full p-4 flex items-center justify-between bg-[#F8FAFC]/80 backdrop-blur-md z-30 border-b border-slate-100/50">
          <Link
            href="/"
            className="flex items-center group active:scale-95 transition-all no-underline"
          >
            <Image
              src="/images/logo.png"
              alt="Học Từ Thiện"
              width={140}
              height={40}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <Link
            href="/"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 text-slate-500 hover:text-primary transition-all active:scale-95"
          >
            <Icon name="Home" size={16} />
          </Link>
        </div>

        <div className="w-full flex-1 flex items-center justify-center p-4 md:p-8 z-10 overflow-y-auto lg:overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
