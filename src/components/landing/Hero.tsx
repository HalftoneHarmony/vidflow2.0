"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MouseEvent } from "react";

export function Hero() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div
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

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10 pointer-events-none"></div>

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto space-y-8 text-center px-4">

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
                    className="text-6xl md:text-8xl font-black font-[family-name:var(--font-oswald)] uppercase tracking-tight leading-none"
                >
                    <span className="block text-white drop-shadow-2xl">Capture The</span>
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

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
                >
                    <Link href="/showcase">
                        <Button size="xl" className="w-full sm:w-auto text-lg font-bold tracking-widest bg-red-600 hover:bg-red-500 border-none shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_50px_rgba(220,38,38,0.6)] transition-all transform hover:-translate-y-1">
                            ENTER SHOWCASE
                        </Button>
                    </Link>
                    <Link href="/login">
                        <Button size="xl" variant="outline" className="w-full sm:w-auto text-lg font-bold tracking-widest border-zinc-700 hover:bg-zinc-800 hover:text-white hover:border-zinc-500 transition-all transform hover:-translate-y-1">
                            ADMIN ACCESS
                        </Button>
                    </Link>
                </motion.div>
            </div>

            {/* Bottom Gradient Fade */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
        </div>
    );
}
