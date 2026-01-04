/**
 * 🤘 About Page
 * Information about VidFlow and its mission.
 */

import { getSetting } from "@/features/settings/actions";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
    const pageTitle = await getSetting("about_title") || "ABOUT VIDFLOW";
    const pageContent = await getSetting("about_content") || "VidFlow is the premier video production engine.";

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header Section */}
            <section className="relative py-24 overflow-hidden border-b border-zinc-800">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-50" />
                <div className="container relative mx-auto px-6 text-center">
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter uppercase drop-shadow-xl animate-fade-up">
                        {pageTitle}
                    </h1>
                    <div className="w-24 h-1 bg-red-600 mx-auto rounded-full" />
                </div>
            </section>

            {/* Content Section */}
            <section className="container mx-auto px-6 py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-zinc-900/30 border border-zinc-800 p-8 md:p-12 rounded-2xl backdrop-blur-sm shadow-2xl">
                        <article className="prose prose-invert prose-lg max-w-none">
                            <div className="whitespace-pre-wrap font-sans text-zinc-300 leading-relaxed text-lg md:text-xl">
                                {pageContent}
                            </div>
                        </article>
                    </div>

                    {/* Footer decoration */}
                    <div className="mt-16 flex justify-center opacity-50">
                        <div className="flex items-center gap-4 text-zinc-600 font-mono text-sm uppercase tracking-widest">
                            <span>Est. 2026</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-red-900"></span>
                            <span>Engineered by Venom</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
