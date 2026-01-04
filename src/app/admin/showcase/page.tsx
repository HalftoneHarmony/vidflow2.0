/**
 * 🎬 Showcase Admin Page
 * Server Component to load data and render the board
 */

import { getAllPackages } from "@/features/products/queries";
import { ShowcaseAdminBoard } from "@/features/showcase/components";

export const dynamic = "force-dynamic";

export default async function ShowcaseAdminPage() {
    const packages = await getAllPackages();

    return (
        <div className="p-8 min-h-screen bg-black text-white">
            <ShowcaseAdminBoard packages={packages} />
        </div>
    );
}
