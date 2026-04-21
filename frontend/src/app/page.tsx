import Link from "next/link";
import Image from "next/image";
import { Button } from "@/core/ui/Button";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F1F4FA] font-[Montserrat] p-6 text-center">
      <div className="max-w-2xl w-full flex flex-col items-center">
        {/* Logo or Brading */}
        <Image
          src="/images/avatar_logo.png"
          alt="Hoc Tu Thien"
          width={96}
          height={96}
          className="object-contain rounded-full shadow-xl mb-8 animate-bounce"
        />

        <h1 className="text-5xl md:text-6xl font-bold text-[#0A1628] mb-6 tracking-tight">
          Học Từ Thiện
        </h1>

        <p className="text-lg text-text-muted mb-12 max-w-md">
          Khám phá những ranh giới mới của học thuật xuất sắc và định hướng
          trong các bối cảnh trí tuệ phức tạp.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link href="/login" className="w-full sm:w-auto">
            <Button
              label="Đăng nhập tài khoản"
              variant="primary"
              size="lg"
              className="w-full sm:w-48 h-14 rounded-full text-lg shadow-lg hover:shadow-primary/20 transition-all"
            />
          </Link>

          <Link href="/register" className="w-full sm:w-auto">
            <Button
              label="Tạo tài khoản mới"
              variant="outline"
              size="lg"
              className="w-full sm:w-48 h-14 rounded-full text-lg border-2 hover:bg-white transition-all"
            />
          </Link>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-200 w-full text-sm text-text-muted/60">
          <p>© 2026 Hoc Tu Thien. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
