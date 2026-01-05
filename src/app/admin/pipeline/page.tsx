/**
 * 🏭 Pipeline Page
 * 5-Stage 칸반 보드 (핵심 공정 관리)
 */

import { createClient } from "@/lib/supabase/server";
import { getAllPipelineCards, getProfiles, getPackages, getEvents, getEditors } from "@/features/pipeline/queries";
import { getPipelineStages } from "@/features/pipeline/config";
import { KanbanBoard } from "@/features/pipeline/components/KanbanBoard";

import { PipelineHeader } from "./PipelineHeader";

export default async function PipelinePage() {
    const supabase = await createClient();

    // 데이터 병렬 로드 (stages 포함)
    const [initialCards, users, packages, events, editors, stages] = await Promise.all([
        getAllPipelineCards(supabase),
        getProfiles(supabase),
        getPackages(supabase),
        getEvents(supabase),
        getEditors(supabase),
        getPipelineStages(),
    ]);

    return (
        <div className="flex flex-col h-[calc(100vh-140px)]">
            <PipelineHeader
                users={users}
                packages={packages}
                events={events}
            />

            <main className="flex-1 min-h-0">
                <KanbanBoard
                    initialCards={initialCards}
                    users={users}
                    packages={packages}
                    events={events}
                    editors={editors}
                    stages={stages}
                />
            </main>
        </div>
    );
}
