import { createClient } from "@/lib/supabase/server";
import { getActivePackages } from "@/features/products/queries";
import { ShowcaseCard } from "@/features/showcase/components/ShowcaseCard";
import { PackageWithShowcase } from "@/features/showcase/queries";
import { getPortfolioItems } from "@/features/portfolio/queries";
import { PortfolioCard } from "@/features/portfolio/components/PortfolioCard";

export const metadata = {
    title: "Showcase | VIDFLOW",
    description: "Explore our bodybuilding competition packages and stage performance highlights.",
};

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

export default async function ShowcasePage() {
    // Fetch active packages (Bodybuilding products)
    const rawPackages = await getActivePackages();
    // Fetch portfolio items (Creative works)
    const portfolioItems = await getPortfolioItems();

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
            <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden border-b border-zinc-900">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(50,10,10,0.4)_0%,rgba(0,0,0,1)_100%)] z-10" />
                {/* Background Image - Bodybuilding context */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=3270&auto=format&fit=crop')] bg-cover bg-center" />

                <div className="relative z-20 text-center px-4 max-w-5xl mx-auto space-y-6">
                    <div className="inline-block px-3 py-1 bg-red-900/20 backdrop-blur-md border border-red-900/30 rounded-full text-xs font-bold tracking-widest text-red-500 mb-4 uppercase">
                        Stage Precision
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-600 font-[family-name:var(--font-oswald)]">
                        COMPETITION
                    </h1>
                    <p className="text-lg md:text-2xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
                        Discover our premium competition packages. Every muscle, every pose, captured in 4K glory.
                    </p>
                </div>
            </section>

            {/* Gallery Section */}
            <section className="container mx-auto px-4 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {uniquePackages.map((pkg) => (
                        <ShowcaseCard key={pkg.id} packageData={pkg} />
                    ))}

                    {uniquePackages.length === 0 && (
                        <div className="col-span-full h-64 flex items-center justify-center text-zinc-500 border border-zinc-800 rounded-2xl border-dashed">
                            No packages currently on display.
                        </div>
                    )}
                </div>
            </section>

            {/* Portfolio / Creative Works Section */}
            {portfolioItems.length > 0 && (
                <section className="container mx-auto px-4 py-20 border-t border-zinc-900">
                    <div className="mb-12 text-center space-y-4">
                        <div className="inline-block px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-bold tracking-widest text-zinc-500 uppercase">
                            Creative Works
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">
                            BEYOND THE STAGE
                        </h2>
                        <p className="text-zinc-500 max-w-2xl mx-auto">
                            Explore our commercial, documentary, and creative portfolio managed directly from the dashboard.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {portfolioItems.map((item) => (
                            <PortfolioCard key={item.id} item={item} />
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}
