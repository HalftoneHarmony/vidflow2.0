/**
 * 📦 Products Page (Admin)
 * 패키지 관리 페이지 Main Entry
 */
import { getAllPackages, getAllEvents } from "@/features/products/queries";
import { ProductArsenal } from "@/features/products/components/ProductArsenal";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
    // 병렬로 데이터 조회
    const [packages, events] = await Promise.all([
        getAllPackages(),
        getAllEvents(),
    ]);

    return (
        <div className="p-8 min-h-screen bg-black text-white">
            <ProductArsenal packages={packages} events={events as any} />
            {/* events 타입 호환성: queries의 반환값과 ProductArsenal의 props 타입이 약간 다를 수 있음 */}
            {/* queries의 getAllEvents는 {id, title, event_date} 반환 */}
        </div>
    );
}
