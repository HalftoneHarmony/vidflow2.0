import { getSettings } from "@/features/settings/actions";
import GeneralSettingsClient from "./GeneralSettingsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "General Settings | VidFlow Admin",
    description: "Manage global settings for the VidFlow platform."
};

export default async function GeneralSettingsPage() {
    // Keys to fetch
    const keys = [
        "site_name",
        "site_logo_symbol",
        "support_email",
        "seo_title",
        "seo_description",
        "maintenance_mode"
    ];

    const initialSettings = await getSettings(keys);

    return <GeneralSettingsClient initialSettings={initialSettings} />;
}
