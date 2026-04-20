export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden lg:flex lg:w-1/2 relative flex-col justify-between overflow-hidden bg-[#0A1628]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/auth-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1628]/50 via-[#0A1628]/40 to-[#0A1628]/85" />

        <div className="relative z-10 flex flex-col justify-between h-full p-10">
          <span className="text-white font-bold text-lg tracking-tight">
            Hoc Tu Thien
          </span>

          <div className="max-w-md">
            <h1 className="text-white text-4xl font-bold leading-tight mb-4">
              Explore the frontiers of academic excellence.
            </h1>
            <p className="text-white/65 text-base leading-relaxed">
              Our sanctuary provides the instruments and clarity needed to
              navigate complex intellectual landscapes.
            </p>
          </div>

          <div className="flex gap-8 text-white/40 text-xs">
            <span>Policy</span>
            <span>About Us</span>
            <span>...</span>
          </div>
        </div>
      </aside>

      <main className="flex w-full lg:w-1/2 items-center justify-center overflow-y-auto bg-background p-8">
        {children}
      </main>
    </div>
  );
}
