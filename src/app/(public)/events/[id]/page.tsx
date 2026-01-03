/**
 * 🎪 Event Detail Page
 * 대회 상세 및 주문 페이지
 */
export default async function EventDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">대회 상세 (ID: {id})</h1>
            <p className="text-zinc-400">패키지 선택 및 주문이 여기에서 진행됩니다.</p>
        </div>
    );
}
