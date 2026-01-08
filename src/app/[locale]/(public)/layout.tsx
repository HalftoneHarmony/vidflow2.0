import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/features/settings/actions";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";

/**
 * 🌍 Public Layout (Responsive)
 * 
 * Desktop: Horizontal Nav
 * Mobile: Hamburger Menu (Sheet)
 */

export default async function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch Settings
    const settings = await getSettings([
        "site_name",
        "site_logo_symbol",
        "footer_description",
        "footer_newsletter_title",
        "footer_newsletter_text",
        "social_instagram",
        "social_youtube",
        "social_twitter"
    ]);

    const siteName = settings.site_name || "VidFlow";
    const siteLogo = settings.site_logo_symbol || "V";

    return (
        <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-red-600 selection:text-white">
            <Navbar user={user} siteName={siteName} siteLogo={siteLogo} />

            <main className="flex-1 pt-24 md:pt-28">
                {children}
            </main>

            <Footer
                siteName={siteName}
                siteLogo={siteLogo}
                footerDesc={settings.footer_description}
                newsletterTitle={settings.footer_newsletter_title}
                newsletterText={settings.footer_newsletter_text}
                socials={{
                    instagram: settings.social_instagram,
                    youtube: settings.social_youtube,
                    twitter: settings.social_twitter
                }}
            />
        </div>
    );
}
