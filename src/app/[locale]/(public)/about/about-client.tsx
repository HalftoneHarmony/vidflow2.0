"use client";

import { motion } from "framer-motion";
import { Camera, Globe, Trophy, Users, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export interface StatItem {
    label: string;
    value: string;
}

export interface ManifestoItem {
    title: string;
    desc: string;
}

interface AboutClientProps {
    title: string;
    content: string;
    heroSubtitle?: string;
    narrativeTitle?: string;
    narrativeSubtext?: string;
    bgText?: string;
    stats?: StatItem[];
    manifestoTitle?: string;
    manifestoItems?: ManifestoItem[];
    manifestoQuote?: string;
    manifestoBadge?: string;
    ctaTitle?: string;
    ctaDesc?: string;
    ctaBtn?: string;
    footerBrand?: string;
    estDate?: string;
    heroBtnPrimary?: string;
    heroBtnSecondary?: string;
    heroImage?: string;
    gridImage?: string;
    manifestoImage?: string;
    manifestoLabel?: string;
    scrollLabel?: string;
}

const defaultStats: StatItem[] = [
    { label: "Elite Productions", value: "500+" },
    { label: "Global Reach", value: "24" },
    { label: "Design Awards", value: "12" },
    { label: "Visionaries", value: "150+" },
];

const statIcons = [Camera, Globe, Trophy, Users];

const defaultManifesto: ManifestoItem[] = [
    {
        title: "Industrial Precision",
        desc: "Every frame is a calculation of emotional and technical mass. We don't miss."
    },
    {
        title: "Extreme Aesthetic",
        desc: "If it's not beautiful, it's garbage. We pursue the absolute peak of visual hierarchy."
    },
    {
        title: "Radical Sovereignty",
        desc: "We own our process, our vision, and our impact. We lead from the front."
    },
];

export function AboutClient({
    title,
    content,
    heroSubtitle = "The premier engine for high-performance visual storytelling and elite production management.",
    narrativeTitle = "Built for Impact.",
    narrativeSubtext = "WE DON'T DO \"STORYTELLING\". WE DO VISUAL ARCHITECTURE.",
    bgText = "ALPHA",
    stats = defaultStats,
    manifestoTitle = "The Code of Excellence",
    manifestoItems = defaultManifesto,
    manifestoQuote = "PERFECTION ISN'T THE GOAL. <br /> DOMINANCE IS.",
    manifestoBadge = "ULTRA PREMIUM <br /> QUALITY ENGINE",
    ctaTitle = "Ready to Flow?",
    ctaDesc = "Join the ranks of high-performance athletes and directors who trust VidFlow for their most critical productions.",
    ctaBtn = "Get Started",
    footerBrand = "VIDFLOW",
    estDate = "Est. 2026",
    heroBtnPrimary = "Explore Our Work",
    heroBtnSecondary = "The Mission",
    heroImage = "/images/about/hero.png",
    gridImage = "/grid.svg",
    manifestoImage = "/images/about/hero.png",
    manifestoLabel = "Manifesto",
    scrollLabel = "Scroll",
}: AboutClientProps) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    const scrollToManifesto = () => {
        const element = document.getElementById('manifesto');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white overflow-hidden">
            {/* Hero Section */}
            <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src={heroImage}
                        alt="Cinematic Hero"
                        fill
                        className="object-cover opacity-50"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black z-10" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-black/20 to-black/80 z-20" />
                </div>

                {/* Content */}
                <div className="container relative z-30 px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <span className="inline-block px-4 py-1.5 mb-8 text-[10px] font-black tracking-[0.5em] text-red-600 uppercase border border-red-600/30 bg-red-600/10 rounded-sm">
                            {estDate}
                        </span>
                        <h1 className="text-6xl md:text-[10rem] font-black mb-8 tracking-tighter uppercase leading-[0.8] drop-shadow-[0_0_30px_rgba(255,0,0,0.2)]">
                            {title}
                        </h1>
                        <p className="max-w-xl mx-auto text-zinc-500 font-medium tracking-widest uppercase text-xs md:text-sm mb-12">
                            {heroSubtitle}
                        </p>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                            <Link href="/portfolio">
                                <button className="group relative px-12 py-5 overflow-hidden bg-red-600 text-white font-black uppercase tracking-widest transition-all">
                                    <span className="relative z-10">{heroBtnPrimary}</span>
                                    <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 mix-blend-difference" />
                                </button>
                            </Link>
                            <button
                                onClick={scrollToManifesto}
                                className="px-12 py-5 border border-zinc-800 bg-zinc-950/50 backdrop-blur-md text-white font-black uppercase tracking-widest hover:bg-zinc-900 transition-all border-l-4 border-l-red-600"
                            >
                                {heroBtnSecondary}
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30"
                >
                    <div className="flex flex-col items-center gap-4">
                        <span className="text-[9px] uppercase tracking-[0.5em] text-zinc-600 font-black">{scrollLabel}</span>
                        <div className="w-[1px] h-16 bg-gradient-to-b from-red-600 via-red-600/50 to-transparent" />
                    </div>
                </motion.div>
            </section>

            {/* Narrative Section */}
            <section className="py-40 bg-zinc-950 relative">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black to-transparent z-10" />

                {/* Animated Background Text */}
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none opacity-[0.02]">
                    <span className="text-[40vw] font-black select-none tracking-tighter leading-none">{bgText}</span>
                </div>

                <div className="container mx-auto px-6 relative z-20">
                    <div className="max-w-5xl mx-auto">
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            className="grid grid-cols-1 md:grid-cols-12 gap-12"
                        >
                            <div className="md:col-span-4">
                                <motion.div variants={itemVariants} className="sticky top-32">
                                    <div className="w-12 h-1 bg-red-600 mb-8" />
                                    <h2 className="text-4xl md:text-5xl font-black mb-6 italic tracking-tighter leading-tight uppercase">
                                        {narrativeTitle.split(' ').map((word, i) => (
                                            <span key={i} className={i === narrativeTitle.split(' ').length - 1 ? "text-red-600" : ""}>
                                                {word}{' '}
                                                {i === 1 && <br />}
                                            </span>
                                        ))}
                                    </h2>
                                    <p className="text-zinc-500 font-mono text-sm leading-relaxed uppercase">
                                        {narrativeSubtext}
                                    </p>
                                </motion.div>
                            </div>

                            <div className="md:col-span-8">
                                <motion.div
                                    variants={itemVariants}
                                    className="relative"
                                >
                                    <div className="absolute -left-8 top-0 text-7xl font-black text-red-600 opacity-20 select-none">"</div>
                                    <div className="prose prose-invert prose-2xl max-w-none">
                                        <div className="whitespace-pre-wrap font-sans text-zinc-300 leading-relaxed text-2xl md:text-4xl font-light tracking-tight">
                                            {content}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section with Grid Background */}
            <section className="py-32 border-y border-zinc-900 bg-black relative">
                <div
                    className="absolute inset-0 opacity-5"
                    style={{ backgroundImage: `url('${gridImage}')` }}
                />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-24">
                        {stats.map((stat, i) => {
                            const Icon = statIcons[i % statIcons.length];
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1, duration: 0.6 }}
                                    viewport={{ once: true }}
                                    className="group border-l border-zinc-900 pl-8 hover:border-red-600 transition-colors"
                                >
                                    <div className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tighter group-hover:text-red-600 transition-colors">{stat.value}</div>
                                    <div className="text-[10px] uppercase tracking-[0.4em] text-zinc-600 font-black">{stat.label}</div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Manifesto Section */}
            <section id="manifesto" className="py-40">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row gap-24 items-start">
                        <div className="w-full md:w-1/2">
                            <span className="text-red-600 font-black tracking-[0.4em] uppercase text-xs mb-4 block">{manifestoLabel}</span>
                            <h2 className="text-6xl md:text-8xl font-black mb-16 tracking-tighter uppercase leading-[0.9]">
                                {manifestoTitle.split(' ').map((word, i) => (
                                    <span key={i}>
                                        {i === 3 ? <span className="text-zinc-500">{word}</span> : word}{' '}
                                        {i === 2 && <br />}
                                    </span>
                                ))}
                            </h2>

                            <div className="space-y-16">
                                {manifestoItems.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -30 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.2 }}
                                        viewport={{ once: true }}
                                        className="relative pl-12 border-l border-zinc-900 group"
                                    >
                                        <div className="absolute left-0 top-0 w-[2px] h-0 group-hover:h-full bg-red-600 transition-all duration-500" />
                                        <span className="absolute -left-4 top-0 text-zinc-800 font-black text-4xl leading-none">{i + 1}</span>
                                        <h3 className="text-2xl font-black mb-4 group-hover:text-white transition-colors uppercase tracking-tighter">
                                            {item.title}
                                        </h3>
                                        <p className="text-zinc-500 text-lg leading-relaxed max-w-sm font-medium">
                                            {item.desc}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="w-full md:w-1/2 relative group">
                            <div className="aspect-[3/4] bg-zinc-900 relative overflow-hidden">
                                <Image
                                    src={manifestoImage}
                                    alt="Manifesto Visualization"
                                    fill
                                    className="object-cover grayscale brightness-50 group-hover:scale-105 group-hover:brightness-75 transition-all duration-1000"
                                />

                                {/* Decorative Elements */}
                                <div className="absolute inset-0 border-[20px] border-black/80" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-red-600/30 w-[80%] h-[80%] pointer-events-none" />

                                <div className="absolute bottom-12 left-12 right-12">
                                    <div className="p-8 bg-black/80 backdrop-blur-xl border border-zinc-800 border-l-4 border-l-red-600">
                                        <p className="text-white font-black uppercase tracking-widest text-lg leading-tight">
                                            <span dangerouslySetInnerHTML={{ __html: manifestoQuote }} />
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Badge */}
                            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-red-600 flex items-center justify-center p-4 text-center transform -rotate-12 shadow-2xl">
                                <span className="text-[10px] font-black uppercase tracking-tighter leading-none text-white" dangerouslySetInnerHTML={{ __html: manifestoBadge }} />

                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-40 bg-zinc-950 relative overflow-hidden">
                <div className="absolute inset-0 bg-red-600 mix-blend-overlay opacity-5" />
                <div className="container mx-auto px-6 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-5xl md:text-8xl font-black mb-12 tracking-tighter uppercase leading-[0.8]">
                            {/* Just render the title. If users want color, they can use HTML in the future or we add a separate color field later.
                                 For now, removing the broken split behavior. */}
                            {ctaTitle}
                        </h2>
                        <p className="text-zinc-400 max-w-2xl mx-auto text-xl mb-16 font-light">
                            {ctaDesc}
                        </p>
                        <div className="flex flex-wrap justify-center gap-6">
                            <button className="px-16 py-6 bg-white text-black font-black uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-4">
                                {ctaBtn} <Play className="w-4 h-4 fill-black" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Big Brand Section */}
            <section className="py-20 bg-black border-t border-zinc-900">
                <div className="container mx-auto px-6">
                    <div className="opacity-10 hover:opacity-100 transition-opacity text-center overflow-hidden">
                        <h2 className="text-[15vw] font-black tracking-tighter text-zinc-800 leading-none select-none translate-y-8">
                            {footerBrand}
                        </h2>
                    </div>
                </div>
            </section>
        </div>
    );
}
