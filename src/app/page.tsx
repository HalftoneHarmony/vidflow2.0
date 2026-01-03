import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * 🎸 VidFlow Landing Page (Heavy Metal Edition)
 * 
 * The first impression. Bold, dark, and uncompromising.
 * Showcases the "Muscle" of the system.
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      {/* Background Gradient & Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-80 z-0"></div>
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-red-900/20 to-transparent z-0"></div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10 z-0 pointer-events-none"></div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-none mb-4">
            <span className="w-2 h-2 bg-red-600 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
              System Online
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-8xl font-bold font-[family-name:var(--font-oswald)] uppercase tracking-tight leading-none">
            <span className="block text-white">Capture The</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800 glow-red">
              Ultimate Form
            </span>
          </h1>

          {/* Slogan */}
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-400 leading-relaxed font-light">
            보디빌딩 대회 영상 프로덕션의 모든 과정을 자동화하는
            <strong className="text-white ml-2">통합 비즈니스 엔진</strong>.
            <br className="hidden md:block" />
            촬영부터 정산까지, 오직 <span className="text-red-500 font-bold">VidFlow</span> 하나로 압도하십시오.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link href="/showcase">
              <Button size="xl" className="w-full sm:w-auto text-lg font-bold tracking-widest bg-red-600 hover:bg-red-500 border-none shadow-[0_0_30px_rgba(220,38,38,0.4)]">
                ENTER SHOWCASE
              </Button>
            </Link>
            <Link href="/login">
              <Button size="xl" variant="outline" className="w-full sm:w-auto text-lg font-bold tracking-widest border-zinc-700 hover:bg-zinc-800 hover:text-white hover:border-zinc-500">
                ADMIN ACCESS
              </Button>
            </Link>
          </div>
        </div>

      </main>

      {/* Footer / Status Bar */}
      <footer className="relative z-10 w-full border-t border-zinc-900 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-600 uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <span>© 2026 VIDFLOW</span>
            <span className="hidden md:inline text-zinc-800">|</span>
            <span>HEAVY METAL DESIGN SYSTEM</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            <span>ALL SYSTEMS OPERATIONAL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
