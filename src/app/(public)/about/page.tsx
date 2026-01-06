import { getSettings } from "@/features/settings/actions";
import { AboutClient, StatItem, ManifestoItem } from "./about-client";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
    const keys = [
        "about_title",
        "about_content",
        "about_hero_subtitle",
        "about_est_date",
        "about_hero_btn_primary",
        "about_hero_btn_secondary",
        "about_hero_image",
        "about_narrative_title",
        "about_narrative_subtext",
        "about_bg_text",
        "about_stats",
        "about_grid_image",
        "about_manifesto_title",
        "about_manifesto_items",
        "about_manifesto_quote",
        "about_manifesto_badge",
        "about_manifesto_image",
        "about_manifesto_label",
        "about_cta_title",
        "about_cta_desc",
        "about_cta_btn",
        "about_footer_brand"
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
            estDate={settings.about_est_date}
            heroBtnPrimary={settings.about_hero_btn_primary}
            heroBtnSecondary={settings.about_hero_btn_secondary}
            heroImage={settings.about_hero_image}
            narrativeTitle={settings.about_narrative_title}
            narrativeSubtext={settings.about_narrative_subtext}
            bgText={settings.about_bg_text}
            stats={stats}
            gridImage={settings.about_grid_image}
            manifestoTitle={settings.about_manifesto_title}
            manifestoLabel={settings.about_manifesto_label}
            manifestoItems={manifestoItems}
            manifestoQuote={settings.about_manifesto_quote}
            manifestoBadge={settings.about_manifesto_badge}
            manifestoImage={settings.about_manifesto_image}
            ctaTitle={settings.about_cta_title}
            ctaDesc={settings.about_cta_desc}
            ctaBtn={settings.about_cta_btn}
            footerBrand={settings.about_footer_brand}
        />
    );
}
