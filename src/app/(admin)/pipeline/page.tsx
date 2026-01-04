/**
 * 🏭 Pipeline Page
 * 5-Stage 칸반 보드 (핵심 공정 관리)
 */

import { createClient } from "@/lib/supabase/server";
import { getAllPipelineCards, getProfiles, getPackages, getEvents } from "@/features/pipeline/queries";
import { KanbanBoard } from "@/features/pipeline/components/KanbanBoard";

export default async function PipelinePage() {
    const supabase = await createClient();

    // 데이터 병렬 로드
    const [initialCards, users, packages, events] = await Promise.all([
        getAllPipelineCards(supabase),
        getProfiles(supabase),
        getPackages(supabase),
        getEvents(supabase)
    ]);

    return (
        <div className="flex flex-col h-[calc(100vh-140px)]">
            <header className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase font-[family-name:var(--font-oswald)]">
                        PIPELINE <span className="text-red-600">ENGINE</span>
                    </h1>
                    <p className="text-zinc-500 text-sm mt-1 uppercase tracking-widest font-mono">
                        Systemic Workflow Control: WAITING → DELIVERED
                    </p>
                </div>
            </header>

            <main className="flex-1 min-h-0">
                <KanbanBoard
                    initialCards={initialCards}
                    users={users}
                    packages={packages}
                    events={events}
                />
            </main>
        </div>
    );
}
