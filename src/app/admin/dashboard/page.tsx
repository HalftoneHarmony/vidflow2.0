/**
 * 🚀 Mission Control (Main Dashboard)
 * 작업 현황 및 오퍼레이션 대시보드
 * Focus: Pipeline, Schedule, Active Projects, Revenue
 */

import { createClient } from "@/lib/supabase/server";
import { getAllPipelineCards } from "@/features/pipeline/queries";
import { getAdminEvents } from "@/features/events/queries";
import { getComprehensiveStats, getWeeklyStats } from "@/features/analytics/actions";
import { getActiveAnnouncements } from "@/features/admin/actions";
import { format } from "date-fns";
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { DashboardAnnouncementBanner } from "./announcement-banner";

export const dynamic = "force-dynamic";

// 💰 Revenue Stat Card
function RevenueStatCard({
    label,
    value,
    subValue,
    trend,
}: {
    label: string;
    value: string | number;
    subValue?: string;
    trend?: "up" | "down" | "none";
}) {
    return (
        <div className="bg-gradient-to-br from-emerald-950/50 to-black border border-emerald-600/30 p-6">
            <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">{label}</span>
                {trend === "up" && <TrendingUp className="w-4 h-4 text-emerald-500" />}
            </div>
            <div>
                <span className="text-3xl font-black text-white tracking-tight">{value}</span>
                {subValue && <p className="text-xs text-zinc-500 mt-1">{subValue}</p>}
            </div>
        </div>
    );
}

// 📊 Stat Card Component
function OperationalStatCard({
    label,
    value,
    subValue,
    icon,
    color = "zinc"
}: {
    label: string;
    value: string | number;
    subValue?: string;
    icon?: React.ReactNode;
    color?: "zinc" | "emerald" | "blue" | "amber" | "rose";
}) {
    const colorStyles = {
        zinc: "border-zinc-800 text-zinc-400",
        emerald: "border-emerald-600/50 text-emerald-500",
        blue: "border-blue-600/50 text-blue-500",
        amber: "border-amber-600/50 text-amber-500",
        rose: "border-rose-600/50 text-rose-500",
    };

    return (
        <div className={`glass-panel p-6 flex flex-col justify-between h-full bg-noise transition-all duration-300 hover:border-zinc-700/50 ${colorStyles[color].split(" ")[0]}`}>
            <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">{label}</span>
                {icon && <span className={colorStyles[color].split(" ")[1]}>{icon}</span>}
            </div>
            <div>
                <span className="text-4xl font-black text-white tracking-tight">{value}</span>
                {subValue && <p className="text-xs text-zinc-500 mt-1 font-mono">{subValue}</p>}
            </div>
        </div>
    );
}

// 📅 Upcoming Event Row Component
function UpcomingEventRow({ event }: { event: any }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(event.event_date);
    eventDate.setHours(0, 0, 0, 0);

    const diffTime = eventDate.getTime() - today.getTime();
    const dDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Check if it's strictly today
    const isToday = dDay === 0;

    return (
        <div className="glass-panel group flex items-center justify-between p-4 bg-zinc-900/20 hover:bg-zinc-900/40 transition-all border-l-4 border-l-transparent hover:border-l-red-600">
            <div className="flex items-center gap-4">
                <div className={`flex flex-col items-center justify-center w-12 h-12 border rounded-lg ${isToday ? "border-red-500 bg-red-500/10 text-red-500" : "border-zinc-700 bg-black/50 text-zinc-400"}`}>
                    <span className="text-[10px] font-bold uppercase">{format(new Date(event.event_date), "MMM")}</span>
                    <span className="text-lg font-black">{format(new Date(event.event_date), "dd")}</span>
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                        {event.title}
                    </h3>
                    <p className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                        <span>📍 {event.location}</span>
                        <span className="text-zinc-700">|</span>
                        <span>📦 {event.package_count} Packages</span>
                    </p>
                </div>
            </div>
            <div className="text-right">
                {isToday ? (
                    <span className="inline-block px-2 py-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider box-shadow-[0_0_10px_red]">
                        D-DAY
                    </span>
                ) : (
                    <span className="text-xs font-mono text-zinc-500">
                        {dDay > 0 ? `D-${dDay}` : "DONE"}
                    </span>
                )}
            </div>
        </div>
    );
}

// 🏗️ Stage Bar Component
function StageProgressBar({ stage, count, total, color }: { stage: string, count: number, total: number, color: string }) {
    const percentage = total > 0 ? (count / total) * 100 : 0;

    return (
        <div className="mb-4 last:mb-0">
            <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-zinc-400 uppercase tracking-wider">{stage}</span>
                <span className="font-mono text-zinc-500">{count} ({Math.round(percentage)}%)</span>
            </div>
            <div className="w-full bg-zinc-800 h-2 overflow-hidden">
                <div
                    className={`h-full ${color}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}



// 금액 포맷팅
function formatCurrency(amount: number): string {
    if (amount >= 100000000) {
        return `₩${(amount / 100000000).toFixed(1)}억`;
    }
    if (amount >= 10000) {
        return `₩${(amount / 10000).toFixed(0)}만`;
    }
    return `₩${amount.toLocaleString()}`;
}

import { DashboardClientWrapper, AnimatedStatCard } from "./dashboard-client";

export default async function DashboardPage() {
    const supabase = await createClient();

    // Data Fetching - 병렬 실행
    const [pipelineCards, allEvents, comprehensiveStats, weeklyStats, announcements] = await Promise.all([
        getAllPipelineCards(supabase),
        getAdminEvents(),
        getComprehensiveStats(),
        getWeeklyStats(),
        getActiveAnnouncements(),
    ]);

    // Pipeline Stats (fallback to local calculation if DB function fails)
    const stats = comprehensiveStats?.pipeline || {
        waiting: pipelineCards.filter(c => String(c.stage) === "WAITING").length,
        shooting: pipelineCards.filter(c => String(c.stage) === "SHOOTING").length,
        editing: pipelineCards.filter(c => String(c.stage) === "EDITING").length,
        ready: pipelineCards.filter(c => String(c.stage) === "READY").length,
        delivered: pipelineCards.filter(c => String(c.stage) === "DELIVERED").length,
        unassigned: pipelineCards.filter(c => (String(c.stage) === "EDITING" || String(c.stage) === "SHOOTING") && !c.assignee_id).length,
    };

    const totalActive = stats.shooting + stats.editing + stats.ready;
    const unassignedCount = stats.unassigned;

    // Upcoming Events
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = allEvents
        .filter(e => {
            const eDate = new Date(e.event_date);
            eDate.setHours(0, 0, 0, 0);
            return eDate >= today;
        })
        .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
        .slice(0, 5);

    return (
        <DashboardClientWrapper
            banner={<DashboardAnnouncementBanner announcements={announcements} />}
            header={
                <div className="flex justify-between items-end border-b border-zinc-800 pb-6">
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
                            Mission Control
                        </h1>
                        <p className="text-zinc-500 font-mono text-sm mt-1">
                            Operational Status & Command Center
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href="/admin/events"
                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center"
                        >
                            + New Event
                        </Link>
                        <Link
                            href="/admin/pipeline"
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center"
                        >
                            View Board
                        </Link>
                    </div>
                </div>
            }
            statsGrid={
                <>
                    <AnimatedStatCard>
                        <OperationalStatCard
                            label="Active Productions"
                            value={totalActive}
                            subValue="In Progress (Shoot/Edit/Review)"
                            color="blue"
                            icon={<div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                        />
                    </AnimatedStatCard>
                    <AnimatedStatCard>
                        <OperationalStatCard
                            label="Upcoming Shoots"
                            value={upcomingEvents.length}
                            subValue="Scheduled Events"
                            color="amber"
                        />
                    </AnimatedStatCard>
                    <AnimatedStatCard>
                        <OperationalStatCard
                            label="In Editing"
                            value={stats.editing}
                            subValue="Post-Production Queue"
                            color="zinc"
                        />
                    </AnimatedStatCard>
                    <AnimatedStatCard>
                        <OperationalStatCard
                            label="Needs Attention"
                            value={unassignedCount}
                            subValue="Unassigned Tasks"
                            color={unassignedCount > 0 ? "rose" : "zinc"}
                        />
                    </AnimatedStatCard>
                </>
            }
            mainContent={
                <>
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                            <span className="w-3 h-3 bg-amber-500"></span>
                            Upcoming Operations
                        </h2>
                        <Link href="/admin/events" className="text-xs text-zinc-500 hover:text-white uppercase font-bold tracking-wider">
                            View All Events →
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {upcomingEvents.length > 0 ? (
                            upcomingEvents.map(event => (
                                <UpcomingEventRow key={event.id} event={event} />
                            ))
                        ) : (
                            <div className="p-8 border border-dashed border-zinc-800 text-center text-zinc-500 bg-zinc-900/20">
                                <p className="mb-2">No upcoming events scheduled.</p>
                                <Link href="/admin/events" className="text-emerald-500 hover:underline text-sm font-bold">
                                    + Schedule an Event
                                </Link>
                            </div>
                        )}
                    </div>
                </>
            }
            sideContent={
                <>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                        <span className="w-3 h-3 bg-blue-500"></span>
                        Pipeline Pulse
                    </h2>

                    <div className="bg-zinc-900/50 border border-zinc-800 p-6">
                        <div className="space-y-6">
                            <StageProgressBar
                                stage="Waiting (Pre-Prod)"
                                count={stats.waiting}
                                total={pipelineCards.length}
                                color="bg-zinc-600"
                            />
                            <StageProgressBar
                                stage="Shooting"
                                count={stats.shooting}
                                total={pipelineCards.length}
                                color="bg-amber-500"
                            />
                            <StageProgressBar
                                stage="Editing"
                                count={stats.editing}
                                total={pipelineCards.length}
                                color="bg-blue-500"
                            />
                            <StageProgressBar
                                stage="Ready (Review)"
                                count={stats.ready}
                                total={pipelineCards.length}
                                color="bg-emerald-500"
                            />
                        </div>

                        <div className="mt-8 pt-6 border-t border-zinc-700/50">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-zinc-500 uppercase">Total Throughput</span>
                                <span className="text-xl font-black text-white font-mono">{stats.delivered}</span>
                            </div>
                            <p className="text-[10px] text-zinc-600 mt-1 uppercase text-right">Projects Delivered</p>
                        </div>
                    </div>
                </>
            }
        />
    );
}

