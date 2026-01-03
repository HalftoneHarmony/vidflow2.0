import { Skeleton } from "@/components/ui/skeleton";

export function KanbanBoardSkeleton() {
    return (
        <div className="flex flex-col h-full gap-4">
            {/* Toolbar Skeleton */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                <Skeleton className="h-9 w-64 bg-zinc-800" />
                <Skeleton className="h-9 w-40 bg-zinc-800" />
            </div>

            {/* Board Columns Skeleton */}
            <div className="flex h-full gap-4 overflow-hidden">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex-1 min-w-[300px] flex flex-col gap-4 bg-zinc-900/50 rounded-lg p-4 border border-zinc-800/50">
                        {/* Column Header */}
                        <div className="flex items-center justify-between mb-4">
                            <Skeleton className="h-6 w-24 bg-zinc-800" />
                            <Skeleton className="h-6 w-8 bg-zinc-800 rounded-full" />
                        </div>

                        {/* Card Skeletons */}
                        <div className="space-y-3">
                            <Skeleton className="h-32 w-full bg-zinc-800" />
                            <Skeleton className="h-32 w-full bg-zinc-800" />
                            <Skeleton className="h-32 w-full bg-zinc-800" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
