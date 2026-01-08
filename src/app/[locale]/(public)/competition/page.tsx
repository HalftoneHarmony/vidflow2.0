import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getActivePackages } from "@/features/products/queries";
import { ShowcaseCard } from "@/features/showcase/components/ShowcaseCard";
import { PackageWithShowcase, getActiveEvents } from "@/features/showcase/queries";
import { EventList } from "@/features/shop/components/EventList";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: "Competition" });
    return {
        title: `${t("hero_title")} | VIDFLOW`,
        description: t("hero_description"),
    };
}

// Helper to cast Product to PackageWithShowcase safely
function toShowcasePackage(product: any): PackageWithShowcase {
    return {
        ...product,
        showcase_items: product.showcase_items || [],
        // Ensure composition is string[]
        composition: Array.isArray(product.composition) ? product.composition : [],
        // Ensure specs is Record<string, string> or null
        specs: product.specs || null
    };
}

import { getTranslations } from "next-intl/server";

export default async function CompetitionPage() {
    const t = await getTranslations("Competition");
    const tCommon = await getTranslations("Navigation");

    // Fetch active packages (Bodybuilding products)
    const rawPackages = await getActivePackages();
    // Fetch active events
    const events = await getActiveEvents();


    // Filter packages that actually have videos to show? 
    // Or show all packages as "Showcase" of what we sell?
    // "Showcase" usually implies visual verification. 
    // Show all, but prioritize ones with video.
    // The ShowcaseCard handles "No Media" gracefully.

    const packages = rawPackages.map(toShowcasePackage);

    // Deduplicate packages by name:
    // We only want to show ONE card per "Package Type" (e.g. "Basic", "Pro", "Premium").
    // Since packages are ordered by ID desc (most recent first), we naturally keep the newest one.
    const uniquePackagesMap = new Map();
    packages.forEach(pkg => {
        if (!uniquePackagesMap.has(pkg.name)) {
            uniquePackagesMap.set(pkg.name, pkg);
        }
    });
    const uniquePackages = Array.from(uniquePackagesMap.values());

    return (
        <main className="min-h-screen bg-black text-white selection:bg-red-900/30">
            {/* Hero Section */}
            <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden border-b border-zinc-900">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(50,10,10,0.4)_0%,rgba(0,0,0,1)_100%)] z-10" />
                {/* Background Image - Bodybuilding context */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=3270&auto=format&fit=crop')] bg-cover bg-center" />

                <div className="relative z-20 text-center px-4 max-w-5xl mx-auto space-y-6">
                    <div className="inline-block px-3 py-1 bg-red-900/20 backdrop-blur-md border border-red-900/30 rounded-full text-xs font-bold tracking-widest text-red-500 mb-4 uppercase">
                        {t('hero_subtitle')}
                    </div>
                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-600 font-[family-name:var(--font-oswald)]">
                        {t('hero_title')}
                    </h1>
                    <p className="text-lg md:text-2xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
                        {t('hero_description')}
                    </p>
                </div>
            </section>

            {/* Packages Section */}
            <section className="container mx-auto px-4 py-24 border-b border-zinc-900">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase font-[family-name:var(--font-oswald)]">
                        {t('packages_title')}
                    </h2>
                    <p className="text-zinc-500 mt-4 max-w-2xl mx-auto">
                        {t('packages_description')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {uniquePackages.map((pkg) => (
                        <ShowcaseCard key={pkg.id} packageData={pkg} />
                    ))}

                    {uniquePackages.length === 0 && (
                        <div className="col-span-full h-64 flex items-center justify-center text-zinc-500 border border-zinc-800 rounded-2xl border-dashed">
                            {t('no_media')}
                        </div>
                    )}
                </div>
            </section>

            {/* Events Section */}
            <section className="container mx-auto px-4 py-24 bg-[#050505]">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase font-[family-name:var(--font-oswald)]">
                        {t('events_title')}
                    </h2>
                    <p className="text-zinc-500 mt-4 max-w-2xl mx-auto">
                        {t('events_description')}
                    </p>
                </div>

                <EventList initialEvents={events} />
            </section>

            {/* Portfolio Teaser Section */}
            <section className="relative py-32 overflow-hidden border-t border-zinc-900">
                {/* Decorative Background Text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none opacity-[0.03]">
                    <span className="text-[15vw] font-black uppercase text-white leading-none whitespace-nowrap font-[family-name:var(--font-oswald)]">
                        {t("teaser_background")}
                    </span>
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-full">
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                        <span className="text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase">
                            {t("teaser_badge")}
                        </span>
                    </div>

                    <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase font-[family-name:var(--font-oswald)]">
                        {t("teaser_title_prefix")} <span className="text-red-600">{t("teaser_title_highlight")}</span>
                    </h2>

                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
                        {t("teaser_description")}
                    </p>

                    <div className="pt-8">
                        <Link href="/">
                            <Button
                                size="xl"
                                className="h-14 px-12 text-lg font-bold tracking-widest uppercase bg-white text-black hover:bg-zinc-200 rounded-full transition-transform hover:scale-105"
                            >
                                {tCommon('portfolio')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
