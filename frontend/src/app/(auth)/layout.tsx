import Link from "next/link";
import { Icon } from "@/core/ui/Icon";
import { UI_LABELS } from "@/shared/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden font-[Montserrat]">
      {/* Branding Panel */}
      <aside className="hidden lg:flex lg:w-1/2 relative flex-col justify-between overflow-hidden bg-[#0A1628]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: "url('/images/auth-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0A1628]/90 via-[#0A1628]/40 to-[#0A1628]/10" />

        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">
              Hoc Tu Thien
            </span>
          </div>

          <div className="max-w-md">
            <h1 className="text-white text-5xl font-bold leading-[1.1] mb-6 tracking-tight">
              Explore the frontiers of academic excellence.
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              Our sanctuary provides the instruments and clarity needed to
              navigate complex intellectual landscapes.
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

        {/* Home Button */}
        <Link
          href="/"
          className="absolute top-10 right-10 z-20 text-white/60 hover:text-white flex items-center gap-1.5 text-sm font-semibold transition-all hover:-translate-x-1 group"
        >
          <Icon name="ChevronLeft" className="w-4 h-4 transition-transform group-hover:scale-110" />
          {UI_LABELS.AUTH.BACK_TO_HOME}
        </Link>
      </aside>

      <main className="flex w-full lg:w-1/2 items-center justify-center overflow-y-auto bg-background p-8">
        {children}
      </main>
    </div>
  );
}
