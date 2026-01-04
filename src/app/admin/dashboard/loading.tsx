import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-48 bg-zinc-800" />
                <Skeleton className="h-10 w-32 bg-zinc-800" />
            </div>

            {/* Stat Cards Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32 bg-zinc-900 border border-zinc-800" />
                ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Skeleton className="col-span-4 h-[400px] bg-zinc-900 border border-zinc-800" />
                <Skeleton className="col-span-3 h-[400px] bg-zinc-900 border border-zinc-800" />
            </div>
        </div>
    );
}
