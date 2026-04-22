import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/core/ui/Icon";
import { UI_LABELS } from "@/shared/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden font-[Montserrat]">
      <aside className="hidden lg:flex lg:w-1/2 relative flex-col justify-between overflow-hidden bg-[#0A1628]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: "url('/images/login-background.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0A1628]/90 via-[#0A1628]/40 to-[#0A1628]/10" />

        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 w-fit group transition-all active:scale-95 no-underline"
          >
            <Image
              src="/images/avatar_link.png"
              alt="Hoc Tu Thien"
              width={56}
              height={56}
              className="object-contain rounded-full shadow-lg border border-white/10 transition-all"
            />
            <span className="text-white font-bold text-2xl tracking-tight group-hover:text-primary transition-colors no-underline">
              Hoc Tu Thien
            </span>
          </Link>

          <div className="max-w-md">
            <h1 className="text-white text-5xl font-bold leading-[1.1] mb-6 tracking-tight">
              Khám phá những ranh giới mới của học thuật xuất sắc.
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              Không gian của chúng tôi cung cấp các công cụ và sự rõ ràng cần
              thiết để định hướng trong các bối cảnh trí tuệ phức tạp.
            </p>
          </div>

          <div className="flex gap-10 text-white/40 text-sm font-medium">
            <span className="hover:text-white transition-colors cursor-pointer">
              {UI_LABELS.AUTH.POLICY}
            </span>
            <span className="hover:text-white transition-colors cursor-pointer">
              {UI_LABELS.AUTH.ABOUT_US}
            </span>
            <span className="hover:text-white transition-colors cursor-pointer">
              {UI_LABELS.AUTH.REPORT_ISSUE}
            </span>
          </div>
        </div>

        {/* Home Button (Desktop) */}
        <Link
          href="/"
          className="absolute top-10 right-10 z-20 text-white/60 hover:text-white flex items-center gap-1.5 text-sm font-semibold transition-all hover:-translate-x-1 group"
        >
          <Icon
            name="ChevronLeft"
            className="w-4 h-4 transition-transform group-hover:scale-110"
          />
          {UI_LABELS.AUTH.BACK_TO_HOME}
        </Link>
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
            className="flex items-center gap-2 group active:scale-95 transition-all no-underline"
          >
            <Image
              src="/images/avatar_browser.png"
              alt="Hoc Tu Thien"
              width={32}
              height={32}
              className="object-contain rounded-full shadow-sm"
            />
            <span className="text-slate-900 font-bold text-lg tracking-tight group-hover:text-primary transition-colors">
              Hoc Tu Thien
            </span>
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
