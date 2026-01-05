"use client";

import { motion, useMotionTemplate, useMotionValue, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MouseEvent, useRef } from "react";
import Magnetic from "@/components/animations/Magnetic";

export function Hero() {
    const ref = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]); // Parallax for text
    const y2 = useTransform(scrollY, [0, 500], [0, -100]); // Parallax for background
    const opacity = useTransform(scrollY, [0, 300], [1, 0]); // Fade out

    function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div
            ref={ref}
            className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black group"
            onMouseMove={handleMouseMove}
        >
            {/* Dynamic Spotlight Background */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(220, 38, 38, 0.15),
              transparent 80%
            )
          `,
                }}
            />

            {/* Grid Pattern with Parallax */}
            <motion.div
                style={{ y: y2 }}
                className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10 pointer-events-none"
            />

            {/* Content */}
            <motion.div
                style={{ y: y1, opacity }}
                className="relative z-10 max-w-4xl mx-auto space-y-8 text-center px-4"
            >

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 backdrop-blur-md mb-4"
                >
                    <span className="w-2 h-2 bg-red-600 animate-pulse box-shadow-[0_0_10px_red]"></span>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                        System Online
                    </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "backOut" }}
                    className="text-6xl md:text-9xl font-black font-[family-name:var(--font-oswald)] uppercase tracking-tighter leading-none"
                >
                    <span className="block text-white drop-shadow-2xl mix-blend-difference">Capture The</span>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800 glow-red">
                        Ultimate
                    </span>
                </motion.h1>

                {/* Slogan */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-400 leading-relaxed font-light"
                >
                    보디빌딩 대회 영상 프로덕션의 모든 과정을 자동화하는
                    <strong className="text-white ml-2">통합 비즈니스 엔진</strong>.
                </motion.p>

                {/* CTA Buttons with Magnetic Effect */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12"
                >
                    <Magnetic>
                        <Link href="/showcase">
                            <Button size="xl" className="w-full sm:w-auto h-16 px-10 text-lg font-black tracking-widest bg-red-600 hover:bg-red-500 border-none shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_50px_rgba(220,38,38,0.6)] rounded-none skew-x-[-10deg] hover:skew-x-0 transition-all">
                                <span className="skew-x-[10deg] group-hover:skew-x-0 inline-block">ENTER SHOWCASE</span>
                            </Button>
                        </Link>
                    </Magnetic>

                    <Magnetic>
                        <Link href="/login">
                            <Button size="xl" variant="outline" className="w-full sm:w-auto h-16 px-10 text-lg font-black tracking-widest border-zinc-700 bg-transparent hover:bg-white hover:text-black hover:border-white rounded-none skew-x-[-10deg] hover:skew-x-0 transition-all">
                                <span className="skew-x-[10deg] group-hover:skew-x-0 inline-block">ADMIN ACCESS</span>
                            </Button>
                        </Link>
                    </Magnetic>
                </motion.div>
            </motion.div>

            {/* Bottom Gradient Fade */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />

            {/* Scroll Indicator */}
            <motion.div
                style={{ opacity }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <div className="w-[1px] h-20 bg-gradient-to-b from-red-600 to-transparent animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-bold">Scroll</span>
            </motion.div>
        </div>
    );
}
