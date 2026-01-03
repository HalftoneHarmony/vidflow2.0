"use server";

/**
 * 💰 Finance Server Actions
 * 정산 자동화 및 비용 관리
 * Agent 7: Gold (The Treasurer)
 */

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ============================================
// Types
// ============================================

export type ExpenseInput = {
    eventId: number;
    category: "LABOR" | "FOOD" | "TRAVEL" | "EQUIPMENT" | "ETC";
    description: string;
    amount: number;
};

export type LaborCostResult = {
    success: boolean;
    expenseId?: number;
    amount?: number;
    error?: string;
};

// ============================================
// 정산 자동화
// ============================================

/**
 * 인건비 자동 등록
 * DELIVERED 상태 전환 시 호출되어 작업자의 commission_rate 기반으로 인건비 등록
 *
 * @param cardId - 파이프라인 카드 ID
 * @returns 생성된 비용 정보 또는 에러
 */
export async function autoGenerateLaborCost(cardId: number): Promise<LaborCostResult> {
    const supabase = await createClient();

    try {
        // 1. 파이프라인 카드 정보 조회 (assignee_id와 관련 order 정보)
        const { data: card, error: cardError } = await supabase
            .from("pipeline_cards")
            .select(`
                id,
                assignee_id,
                orders (
                    id,
                    event_id,
                    packages (
                        name
                    )
                )
            `)
            .eq("id", cardId)
            .single();

        if (cardError || !card) {
            console.error("카드 조회 실패:", cardError);
            return { success: false, error: "카드 정보를 찾을 수 없습니다." };
        }

        // 담당자가 없으면 인건비 생성하지 않음
        if (!card.assignee_id) {
            console.log(`Card ${cardId}: 담당자 없음 - 인건비 생성 스킵`);
            return { success: true, amount: 0 };
        }

        // 2. 작업자의 commission_rate 조회
        const { data: worker, error: workerError } = await supabase
            .from("profiles")
            .select("id, name, commission_rate")
            .eq("id", card.assignee_id)
            .single();

        if (workerError || !worker) {
            console.error("작업자 조회 실패:", workerError);
            return { success: false, error: "작업자 정보를 찾을 수 없습니다." };
        }

        // commission_rate가 0이면 인건비 생성하지 않음
        if (!worker.commission_rate || worker.commission_rate <= 0) {
            console.log(`Worker ${worker.name}: commission_rate = 0 - 인건비 생성 스킵`);
            return { success: true, amount: 0 };
        }

        // 3. 이벤트 ID 추출
        const order = Array.isArray(card.orders) ? card.orders[0] : card.orders;
        if (!order?.event_id) {
            console.error("이벤트 ID 없음");
            return { success: false, error: "주문의 이벤트 정보를 찾을 수 없습니다." };
        }

        // 패키지 이름 추출
        const pkg = Array.isArray(order.packages) ? order.packages[0] : order.packages;
        const packageName = pkg?.name || "알 수 없음";

        // 4. expenses 테이블에 LABOR 비용 Insert
        const description = `${worker.name} 작업비 (${packageName})`;

        const { data: expense, error: expenseError } = await supabase
            .from("expenses")
            .insert({
                event_id: order.event_id,
                category: "LABOR",
                description,
                amount: worker.commission_rate,
                is_auto_generated: true,
                related_worker_id: worker.id,
            })
            .select("id, amount")
            .single();

        if (expenseError) {
            console.error("인건비 등록 실패:", expenseError);
            return { success: false, error: "인건비 등록에 실패했습니다." };
        }

        console.log(`✅ 인건비 자동 등록: ${description} - ${expense.amount}원`);

        // 캐시 무효화
        revalidatePath("/dashboard/finance");

        return {
            success: true,
            expenseId: expense.id,
            amount: expense.amount,
        };
    } catch (error) {
        console.error("인건비 자동 등록 중 오류:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
        };
    }
}

// ============================================
// 수동 비용 관리
// ============================================

/**
 * 수동 비용 등록 (식대, 이동비 등)
 */
export async function addManualExpense(input: ExpenseInput): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("expenses")
        .insert({
            event_id: input.eventId,
            category: input.category,
            description: input.description,
            amount: input.amount,
            is_auto_generated: false, // 수동 입력임을 표시
        })
        .select("id")
        .single();

    if (error) {
        console.error("비용 등록 실패:", error);
        return { success: false, error: "비용 등록에 실패했습니다." };
    }

    console.log(`📝 수동 비용 등록: ${input.description} - ${input.amount}원 (ID: ${data.id})`);

    revalidatePath("/dashboard/finance");

    return { success: true };
}

/**
 * 비용 삭제
 * 자동 생성된 인건비는 삭제 불가
 */
export async function deleteExpense(expenseId: number): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    // 1. 자동 생성 여부 확인
    const { data: expense, error: fetchError } = await supabase
        .from("expenses")
        .select("is_auto_generated")
        .eq("id", expenseId)
        .single();

    if (fetchError) {
        return { success: false, error: "비용 정보를 찾을 수 없습니다." };
    }

    if (expense.is_auto_generated) {
        return { success: false, error: "자동 생성된 인건비는 삭제할 수 없습니다." };
    }

    // 2. 삭제 실행
    const { error: deleteError } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseId);

    if (deleteError) {
        console.error("비용 삭제 실패:", deleteError);
        return { success: false, error: "비용 삭제에 실패했습니다." };
    }

    revalidatePath("/dashboard/finance");

    return { success: true };
}

/**
 * 비용 수정
 * 자동 생성된 인건비는 수정 불가
 */
export async function updateExpense(
    expenseId: number,
    updates: Partial<Omit<ExpenseInput, "eventId">>
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    // 1. 자동 생성 여부 확인
    const { data: expense, error: fetchError } = await supabase
        .from("expenses")
        .select("is_auto_generated")
        .eq("id", expenseId)
        .single();

    if (fetchError) {
        return { success: false, error: "비용 정보를 찾을 수 없습니다." };
    }

    if (expense.is_auto_generated) {
        return { success: false, error: "자동 생성된 인건비는 수정할 수 없습니다." };
    }

    // 2. 업데이트 실행
    const { error: updateError } = await supabase
        .from("expenses")
        .update(updates)
        .eq("id", expenseId);

    if (updateError) {
        console.error("비용 수정 실패:", updateError);
        return { success: false, error: "비용 수정에 실패했습니다." };
    }

    revalidatePath("/dashboard/finance");

    return { success: true };
}
