/**
 * ℹ️ Admin About Page
 * Manage the content of the About page.
 */

import { AboutAdminBoard } from "@/features/about/components/AboutAdminBoard";

export default function AdminAboutPage() {
    return (
        <div className="p-8 min-h-screen bg-black text-white">
            <AboutAdminBoard />
        </div>
    );
}
