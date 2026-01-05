/**
 * 📦 Products Actions
 * 패키지 관리용 Server Actions (CUD)
 */
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Zod Schema for Validation
const PackageSchema = z.object({
    name: z.string().min(1, "패키지명은 필수입니다."),
    price: z.number().min(0, "가격은 0원 이상이어야 합니다."),
    description: z.string().optional(),
    composition: z.array(z.string()).min(1, "최소 1개의 구성품을 선택해야 합니다."),
    event_ids: z.array(z.number().int()).min(1, "최소 1개의 이벤트를 선택해야 합니다."),
    is_sold_out: z.boolean().default(false),
});

export type CreatePackageInput = z.infer<typeof PackageSchema>;
export type UpdatePackageInput = Partial<CreatePackageInput>;

/**
 * 패키지 생성 (다중 이벤트 연결 지원)
 * - 사용자가 선택한 여러 이벤트에 대해 동일한 패키지를 생성합니다.
 */
export async function createPackage(input: CreatePackageInput) {
    const supabase = await createClient();
    const validation = PackageSchema.safeParse(input);

    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    const { event_ids, ...pkgData } = validation.data;

    try {
        // 선택된 각 이벤트에 대해 패키지 생성
        const entries = event_ids.map((eventId) => ({
            ...pkgData,
            event_id: eventId,
        }));

        const { error } = await supabase.from("packages").insert(entries);

        if (error) throw error;

        revalidatePath("/admin/products");
        return { success: true };
    } catch (error) {
        console.error("[Products] Create Error:", error);
        return { success: false, error: "패키지 생성 실패" };
    }
}

/**
 * 패키지 수정
 */
export async function updatePackage(id: number, input: UpdatePackageInput) {
    const supabase = await createClient();

    // 입력 데이터에서 업데이트 가능한 필드만 추출
    // event_id는 패키지 이동에 해당하므로, 현재 모달에서는 수정을 제한합니다.
    const { name, price, description, composition, is_sold_out } = input as any;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    if (description !== undefined) updateData.description = description;
    if (composition !== undefined) updateData.composition = composition;
    if (is_sold_out !== undefined) updateData.is_sold_out = is_sold_out;

    try {
        const { error } = await supabase
            .from("packages")
            .update(updateData)
            .eq("id", id);

        if (error) throw error;

        revalidatePath("/admin/products");
        return { success: true };
    } catch (error: any) {
        console.error("[Products] Update Error Details:", {
            id,
            error: error?.message || error,
            code: error?.code,
            details: error?.details
        });
        return { success: false, error: error?.message || "패키지 수정 실패" };
    }
}

/**
 * 패키지 삭제
 */
export async function deletePackage(id: number) {
    const supabase = await createClient();

    try {
        // 주문이 있는지 확인
        const { count, error: checkError } = await supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("package_id", id);

        if (checkError) throw checkError;

        if (count && count > 0) {
            return { success: false, error: "주문 내역이 있는 패키지는 삭제할 수 없습니다. 대신 비활성화하세요." };
        }

        const { error } = await supabase
            .from("packages")
            .delete()
            .eq("id", id);

        if (error) throw error;

        revalidatePath("/admin/products");
        return { success: true };
    } catch (error) {
        console.error("[Products] Delete Error:", error);
        return { success: false, error: "패키지 삭제 실패" };
    }
}

/**
 * 판매 상태 토글 (is_sold_out)
 */
export async function togglePackageStatus(id: number) {
    const supabase = await createClient();

    try {
        // 현재 상태 조회
        const { data: pkg, error: fetchError } = await supabase
            .from("packages")
            .select("is_sold_out")
            .eq("id", id)
            .single();

        if (fetchError || !pkg) throw fetchError || new Error("Package not found");

        const { error } = await supabase
            .from("packages")
            .update({ is_sold_out: !pkg.is_sold_out })
            .eq("id", id);

        if (error) throw error;

        revalidatePath("/admin/products");
        return { success: true };
    } catch (error) {
        console.error("[Products] Toggle Error:", error);
        return { success: false, error: "상태 변경 실패" };
    }
}

/**
 * 패키지 복제
 */
export async function duplicatePackage(id: number) {
    const supabase = await createClient();

    try {
        const { data: pkg, error: fetchError } = await supabase
            .from("packages")
            .select("*")
            .eq("id", id)
            .single();

        if (fetchError || !pkg) throw fetchError || new Error("Package not found");

        // 복제 데이터 생성 (id 제외, 이름에 (복사) 추가)
        const { id: _, created_at: __, ...newPkg } = pkg;
        newPkg.name = `${newPkg.name} (복사)`;

        const { error } = await supabase
            .from("packages")
            .insert(newPkg);

        if (error) throw error;

        revalidatePath("/admin/products");
        return { success: true };
    } catch (error) {
        console.error("[Products] Duplicate Error:", error);
        return { success: false, error: "패키지 복제 실패" };
    }
}
