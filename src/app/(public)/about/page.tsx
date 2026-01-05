import { getSettings } from "@/features/settings/actions";
import { AboutClient, StatItem, ManifestoItem } from "./about-client";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
    const keys = [
        "about_title",
        "about_content",
        "about_hero_subtitle",
        "about_narrative_title",
        "about_narrative_subtext",
        "about_stats",
        "about_manifesto_title",
        "about_manifesto_items",
        "about_cta_title",
        "about_cta_desc"
    ];

    const settings = await getSettings(keys);

    const title = settings.about_title || "ABOUT VIDFLOW";
    const content = settings.about_content || "VidFlow is the premier video production engine dedicated to capturing the visceral energy of high-performance athletes and the stories that define their legacy.";

    // Parse JSON settings safely
    let stats: StatItem[] | undefined;
    try {
        if (settings.about_stats) stats = JSON.parse(settings.about_stats);
    } catch (e) { console.error("Error parsing about_stats:", e); }

    let manifestoItems: ManifestoItem[] | undefined;
    try {
        if (settings.about_manifesto_items) manifestoItems = JSON.parse(settings.about_manifesto_items);
    } catch (e) { console.error("Error parsing about_manifesto_items:", e); }

    return (
        <AboutClient
            title={title}
            content={content}
            heroSubtitle={settings.about_hero_subtitle}
            narrativeTitle={settings.about_narrative_title}
            narrativeSubtext={settings.about_narrative_subtext}
            stats={stats}
            manifestoTitle={settings.about_manifesto_title}
            manifestoItems={manifestoItems}
            ctaTitle={settings.about_cta_title}
            ctaDesc={settings.about_cta_desc}
        />
    );
}
