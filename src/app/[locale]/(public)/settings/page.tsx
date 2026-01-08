import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserPreferences } from "@/features/admin/actions";
import { SettingsPageClient } from "./SettingsPageClient";

export const metadata = {
    title: "Settings | VidFlow",
    description: "Manage your VidFlow account settings and preferences",
};

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Redirect to login if not authenticated
    if (!user) {
        redirect("/login");
    }

    // Fetch user preferences
    const preferences = await getUserPreferences();

    return <SettingsPageClient initialPreferences={preferences} userEmail={user.email || ""} />;
}
