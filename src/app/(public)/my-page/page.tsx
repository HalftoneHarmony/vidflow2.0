/**
 * 👤 My Page
 * 마이페이지 (주문내역, 다운로드)
 * 
 * @author Dealer (The Salesman)
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserOrders } from "@/features/orders/actions";
import { OrderHistoryList } from "./OrderHistoryList";

export const dynamic = "force-dynamic";

export default async function MyPage() {
    const supabase = await createClient();

    // 1. 사용자 인증 확인
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?next=/my-page");
    }

    // 2. 주문 내역 조회
    const orders = await getUserOrders(user.id);

    return (
        <div className="min-h-screen bg-black">
            <div className="container mx-auto px-4 py-16">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2">MY PAGE</h1>
                        <p className="text-zinc-500">
                            환영합니다, <span className="text-white font-bold">{user.email?.split("@")[0]}</span>님.
                        </p>
                    </div>

                    <div className="text-right hidden md:block">
                        <div className="text-sm text-zinc-500">TOTAL ORDERS</div>
                        <div className="text-3xl font-black text-red-500">{orders.length}</div>
                    </div>
                </div>

                {/* 주문 내역 리스트 */}
                <section>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-red-500 rounded-sm"></span>
                        주문 내역
                    </h2>

                    <OrderHistoryList orders={orders} />
                </section>
            </div>
        </div>
    );
}
