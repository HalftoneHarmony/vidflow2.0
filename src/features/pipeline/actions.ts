"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type PipelineStage = "WAITING" | "EDITING" | "READY" | "DELIVERED";

/**
 * 카드의 스테이지를 변경합니다.
 * @param cardId 파이프라인 카드 ID
 * @param newStage 변경할 스테이지
 */
export async function updateCardStage(cardId: number, newStage: PipelineStage) {
    const supabase = await createClient();

    // 🔐 권한 체크: 로그인한 사용자만 변경 가능
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Unauthorized: 로그인 후 이용해주세요.");
    }

    // 🛡️ Sentinel's Stage Gate: DELIVERED 전환 전 링크 검증
    if (newStage === "DELIVERED") {
        const { validateDeliveryReady } = await import("@/features/delivery/actions");
        const validation = await validateDeliveryReady(cardId);

        if (!validation.isReady) {
            const missingCount = validation.missingLinks.length;
            const invalidCount = validation.invalidLinks.length;

            let message = "배송을 시작할 수 없습니다: ";
            if (missingCount > 0) message += `링크 누락 ${missingCount}건 `;
            if (invalidCount > 0) message += `유효하지 않은 링크 ${invalidCount}건`;

            throw new Error(message);
        }
    }

    // 🔄 상태 업데이트 및 stage_entered_at 갱신
    const { error } = await supabase
        .from("pipeline_cards")
        .update({
            stage: newStage,
            stage_entered_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq("id", cardId);

    if (error) {
        throw new Error(`Failed to update card stage: ${error.message}`);
    }

    console.log(`[Pipeline] Card ${cardId} moved to ${newStage}`);

    // 💰 Gold's Dynamic Costing: DELIVERED 시 인건비 자동 등록
    if (newStage === "DELIVERED") {
        try {
            const { createLaborExpense } = await import("@/features/finance/actions");
            const laborResult = await createLaborExpense(cardId);
            if (!laborResult.success) {
                console.error("[Finance] 자동 인건비 등록 실패:", laborResult.error);
            } else if (laborResult.amount && laborResult.amount > 0) {
                console.log(`[Finance] 인건비 ₩${laborResult.amount.toLocaleString()} 자동 등록 완료`);
            }
        } catch (e) {
            console.error("[Finance] 인건비 등록 중 서버 에러:", e);
        }
    }

    revalidatePath("/admin/pipeline");
    revalidatePath("/admin/finance");
    revalidatePath("/admin/dashboard");
}

/**
 * 작업자를 할당합니다.
 */
export async function assignWorker(cardId: number, workerId: string | null) {
    const supabase = await createClient();

    // 🔐 권한 체크
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Unauthorized");
    }

    // 🔄 상태 업데이트
    const { error } = await supabase
        .from("pipeline_cards")
        .update({
            assignee_id: workerId,
            updated_at: new Date().toISOString(),
        })
        .eq("id", cardId);

    if (error) {
        throw new Error(`Failed to assign worker: ${error.message}`);
    }

    console.log(`[Pipeline] Card ${cardId} assigned to ${workerId}`);
    revalidatePath("/admin/pipeline");
}

/**
 * 👻 Ghost Card (현장 등록): 결제 전 선수의 작업을 먼저 시작
 * - 임시 주문(PENDING)을 생성하고 즉시 파이프라인에 투입
 */
export async function createGhostCard(data: {
    eventId: number;
    packageId: number;
    userId: string;
}) {
    const supabase = await createClient();

    // 1. 임시 주문 생성 (Ghost Order)
    const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
            event_id: data.eventId,
            package_id: data.packageId,
            user_id: data.userId,
            amount: 0, // 현장 등록 시엔 우선 0원 또는 정가 기록 (추후 정산)
            status: "PENDING",
            payment_id: `GHOST_${Date.now()}`,
        })
        .select()
        .single();

    if (orderError) {
        throw new Error(`Ghost Order 생성 실패: ${orderError.message}`);
    }

    // 2. 파이프라인 카드 생성
    const { data: card, error: cardError } = await supabase
        .from("pipeline_cards")
        .insert({
            order_id: order.id,
            stage: "WAITING", // 현장 등록은 대기 단계로 진입 (SHOOTING 삭제됨)
            stage_entered_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (cardError) {
        throw new Error(`Ghost Card 생성 실패: ${cardError.message}`);
    }

    // 3.Deliverables 생성 (Package Composition 기반)
    const { data: pkg } = await supabase
        .from("packages")
        .select("composition")
        .eq("id", data.packageId)
        .single();

    if (pkg?.composition) {
        const deliverables = (pkg.composition as string[]).map((type) => ({
            card_id: card.id,
            type,
        }));

        await supabase.from("deliverables").insert(deliverables);
    }

    revalidatePath("/admin/pipeline");
    return { success: true, cardId: card.id };
}

/**
 * 🆕 Ghost Card + New User Registration
 * 신규 유저를 생성하고 즉시 Ghost Card를 발급합니다.
 */
export async function createGhostCardWithNewUser(data: {
    eventId: number;
    packageId: number;
    user: {
        name: string;
        email: string;
        phone: string;
    };
}) {
    // 1. Service Role로 Admin Client 생성 (유저 생성을 위해 필수)
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const adminSupabase = createAdminClient();

    // 2. Auth User 생성
    const tempPassword = `Vidflow${Math.random().toString(36).slice(-6)}!`;
    const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
        email: data.user.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: data.user.name },
    });

    if (authError) {
        throw new Error(`유저 생성 실패: ${authError.message}`);
    }

    if (!authUser.user) {
        throw new Error("유저 생성 후 ID를 가져올 수 없습니다.");
    }

    // 3. Profile 생성 (Trigger가 없을 경우를 대비하여 명시적 Insert/Update)
    // adminSupabase를 사용하여 RLS 우회
    const { error: profileError } = await adminSupabase
        .from("profiles")
        .upsert({
            id: authUser.user.id,
            email: data.user.email,
            name: data.user.name,
            phone: data.user.phone,
            role: "USER",
        }); // on conflict update

    if (profileError) {
        // 롤백? Auth 유저 삭제? (복잡하므로 일단 에러 던짐)
        console.error("프로필 생성 실패:", profileError);
        throw new Error(`프로필 생성 실패: ${profileError.message}`);
    }

    // 4. Ghost Card 생성 (기존 로직 재사용)
    try {
        console.log("Creating Ghost Card for user:", authUser.user.id);
        const result = await createGhostCard({
            eventId: data.eventId,
            packageId: data.packageId,
            userId: authUser.user.id,
        });
        console.log("Ghost Card Creation Result:", result);
        return result;
    } catch (e) {
        console.error("Ghost Card Creation Step Failed:", e);
        throw e;
    }
}
