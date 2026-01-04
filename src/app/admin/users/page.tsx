import { createClient } from "@/lib/supabase/server";
import { UserTable } from "@/features/users/components/UserTable";
import { EmptyState } from "@/components/ui/empty-state";
import { Users } from "lucide-react";

/**
 * 👥 Users Management Page
 * 시스템 사용자 및 권한 관리
 * 
 * @author Vulcan (The Forge Master)
 */

export const dynamic = "force-dynamic";

export default async function UsersPage() {
    const supabase = await createClient();

    const { data: users, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("[Vulcan] Users fetch error:", error.message);
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <header>
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter font-[family-name:var(--font-oswald)]">
                    USER <span className="text-red-600">DIRECTORY</span>
                </h1>
                <p className="text-zinc-500 text-sm mt-1">
                    시스템 사용자 및 권한 관리 • {users?.length || 0}명의 사용자
                </p>
            </header>

            {/* User Table */}
            {users && users.length > 0 ? (
                <UserTable users={users} />
            ) : (
                <EmptyState
                    icon={<Users className="w-8 h-8" />}
                    title="등록된 사용자가 없습니다"
                    description="아직 가입한 사용자가 없습니다. 회원가입 후 이 페이지에서 권한을 관리할 수 있습니다."
                />
            )}
        </div>
    );
}
