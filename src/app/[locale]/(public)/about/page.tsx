import { getSettings } from "@/features/settings/actions";
import { AboutClient, StatItem, ManifestoItem } from "./about-client";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: "About" });
    return {
        title: t("meta_title"),
        description: t("meta_description"),
    };
}

export default async function AboutPage() {
    const t = await getTranslations("About");

    // Default Stats from Translations
    const defaultStats: StatItem[] = [
        { label: t("stat_elite"), value: "500+" },
        { label: t("stat_reach"), value: "24" },
        { label: t("stat_awards"), value: "12" },
        { label: t("stat_visionaries"), value: "150+" },
    ];

    // Default Manifesto from Translations
    const defaultManifesto: ManifestoItem[] = [
        {
            title: t("manifesto_1_title"),
            desc: t("manifesto_1_desc")
        },
        {
            title: t("manifesto_2_title"),
            desc: t("manifesto_2_desc")
        },
        {
            title: t("manifesto_3_title"),
            desc: t("manifesto_3_desc")
        },
    ];

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

    const title = settings.about_title || t("title");
    const content = settings.about_content || t("content");

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
            heroSubtitle={settings.about_hero_subtitle || t("hero_subtitle")}
            estDate={settings.about_est_date}
            heroBtnPrimary={settings.about_hero_btn_primary || t("hero_btn_primary")}
            heroBtnSecondary={settings.about_hero_btn_secondary || t("hero_btn_secondary")}
            heroImage={settings.about_hero_image}
            narrativeTitle={settings.about_narrative_title || t("narrative_title")}
            narrativeSubtext={settings.about_narrative_subtext || t("narrative_subtext")}
            bgText={settings.about_bg_text || t("bg_text")}
            stats={stats || defaultStats}
            gridImage={settings.about_grid_image}
            manifestoTitle={settings.about_manifesto_title || t("manifesto_title")}
            manifestoLabel={settings.about_manifesto_label || t("manifesto_label")}
            manifestoItems={manifestoItems || defaultManifesto}
            manifestoQuote={settings.about_manifesto_quote || t("manifesto_quote")}
            manifestoBadge={settings.about_manifesto_badge || t("manifesto_badge")}
            manifestoImage={settings.about_manifesto_image}
            ctaTitle={settings.about_cta_title || t("cta_title")}
            ctaDesc={settings.about_cta_desc || t("cta_desc")}
            ctaBtn={settings.about_cta_btn || t("cta_btn")}
            footerBrand={settings.about_footer_brand || t("footer_brand")}
            scrollLabel={t("scroll")}
        />
    );
}
