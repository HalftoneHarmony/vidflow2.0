import { Suspense } from "react";
import { getDeliveryStats, getAllDeliverables } from "@/features/delivery/queries";
import { DeliveryDashboard } from "@/features/delivery/components/DeliveryDashboard";
import { DeliveryTable } from "@/features/delivery/components/DeliveryTable";

export const dynamic = "force-dynamic"; // 항상 최신 데이터 Fetch

export default async function DeliveryPage() {
    // Parallel Data Fetching
    const [stats, deliverables] = await Promise.all([
        getDeliveryStats(),
        getAllDeliverables(),
    ]);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6 bg-[#0A0A0A] min-h-screen text-zinc-100 font-[family-name:var(--font-sans)]">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-[family-name:var(--font-oswald)] uppercase">
                        Delivery Control
                    </h2>
                    <p className="text-zinc-400">
                        Manage deliverables, verify links, and track customer receipts.
                    </p>
                </div>
            </div>

            <Suspense fallback={<div className="text-zinc-500">Loading stats...</div>}>
                <DeliveryDashboard stats={stats} />
            </Suspense>

            <Suspense fallback={<div className="text-zinc-500">Loading table...</div>}>
                <DeliveryTable data={deliverables} />
            </Suspense>
        </div>
    );
}
