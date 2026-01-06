"use client";

import { motion } from "framer-motion";

type ShowcaseHeaderProps = {
    title: string;
    description?: string | null;
};

export function ShowcaseHeader({ title, description }: ShowcaseHeaderProps) {
    return (
        <section className="relative py-32 overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center opacity-20 blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/50 to-black" />

            <div className="container relative mx-auto px-4 text-center z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter uppercase drop-shadow-2xl">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-2xl text-zinc-300 max-w-3xl mx-auto whitespace-pre-wrap font-light leading-relaxed">
                            {description}
                        </p>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
