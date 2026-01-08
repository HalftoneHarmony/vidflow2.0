import Link from "next/link";

/**
 * 🔐 Auth Layout
 * 로그인/회원가입 전용 레이아웃
 * Heavy Metal Theme: Split Screen (Visual + Form)
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white flex overflow-hidden">
      {/* ==========================================
          🎨 Left Side: Visual Area (Desktop Only)
          ========================================== */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-[#050505]">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none"></div>
        <div className="absolute top-0 -left-1/4 w-1/2 h-full bg-gradient-to-r from-red-600/10 to-transparent blur-3xl pointer-events-none"></div>

        {/* Brand Top */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <div className="w-10 h-10 bg-red-600 flex items-center justify-center group-hover:bg-red-500 transition-colors shadow-lg shadow-red-900/20">
              <span className="text-white font-bold text-xl font-[family-name:var(--font-oswald)]">V</span>
            </div>
            <span className="text-2xl font-bold text-white font-[family-name:var(--font-oswald)] uppercase tracking-wider">
              VidFlow
            </span>
          </Link>
        </div>

        {/* Hero Message */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-5xl font-bold font-[family-name:var(--font-oswald)] uppercase leading-tight tracking-wide">
            Forged for <br />
            <span className="text-red-600">Performance</span>.
          </h1>
          <p className="text-zinc-400 text-lg max-w-md font-light leading-relaxed">
            보디빌딩 영상 프로덕션의 모든 과정을 엔진처럼 관리하십시오.
            <br />
            Zero-Omission, Maximum Impact.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex gap-6 text-sm text-zinc-600 font-medium">
          <span>© 2026 VidFlow</span>
          <span>Privacy</span>
          <span>Terms</span>
        </div>
      </div>

      {/* ==========================================
          📝 Right Side: Form Area
          ========================================== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-black">
        {/* Mobile Grid Background */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none lg:hidden"></div>

        {/* Mobile Logo (Visible only on mobile) */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm font-[family-name:var(--font-oswald)]">V</span>
            </div>
            <span className="text-xl font-bold font-[family-name:var(--font-oswald)] uppercase tracking-wider">VidFlow</span>
          </Link>
        </div>

        <div className="w-full max-w-md space-y-8 relative z-10 animate-fade-up">
          {children}
        </div>
      </div>
    </div>
  );
}
