/**
 * 🎬 Showcase Admin Page
 * Server Component to load data and render the board
 */

import { getActivePackages } from "@/features/products/queries";
import { ShowcaseAdminBoard } from "@/features/showcase/components";

export const dynamic = "force-dynamic";

export default async function ShowcaseAdminPage() {
    // 활성화된 이벤트의 패키지만 가져옴 (비활성화된 이벤트의 패키지는 표시하지 않음)
    const packages = await getActivePackages();

    return (
        <div className="p-8 min-h-screen bg-black text-white">
            <ShowcaseAdminBoard packages={packages} />
        </div>
    );
}
