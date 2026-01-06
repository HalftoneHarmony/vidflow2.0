"use client";

/**
 * 📊 Event Comparison Chart (Enhanced)
 * 직관적인 이벤트별 성과 비교 (신청자수, 매출, 순수익)
 * - 3D Bar Effect
 * - Enhanced Tooltips
 * - Smooth Animations
 * @author Agent 3 (Analytics Master)
 */

import { useState, useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    LabelList
} from "recharts";
import { Users, DollarSign, TrendingUp, Percent, Filter, Check, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ==========================================
// Types
// ==========================================

export type EventAnalyticsData = {
    event_id: number;
    event_title: string;
    event_date: string;
    total_orders: number;
    gross_revenue: number;
    total_expenses: number;
    net_profit: number;
    profit_margin?: number;
    package_counts?: Record<string, number>;
    discipline_counts?: Record<string, number>; // New
    discipline_revenue?: Record<string, number>; // New
};

type Props = {
    data: EventAnalyticsData[];
    onEventClick?: (event: EventAnalyticsData) => void;
};

type MetricType = "orders" | "revenue" | "profit" | "margin";

// ==========================================
// Utils
// ==========================================

const currencyFormatter = (value: number) =>
    new Intl.NumberFormat("ko-KR", {
        style: "currency",
        currency: "KRW",
        maximumFractionDigits: 0,
    }).format(value);

const numberFormatter = (value: number) =>
    new Intl.NumberFormat("ko-KR").format(value);

const CustomTooltip = ({ active, payload, label, mode }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                className="bg-zinc-950/90 border border-zinc-800 p-4 rounded-xl shadow-2xl backdrop-blur-xl ring-1 ring-white/10 z-50 min-w-[200px]"
            >
                <p className="font-bold text-white mb-3 border-b border-white/10 pb-2 text-sm">
                    {data.event_title}
                </p>
                <div className="space-y-2 font-mono text-xs">
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-zinc-400">Revenue</span>
                        </div>
                        <span className="text-white font-bold">{currencyFormatter(data.gross_revenue)}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            <span className="text-zinc-400">Net Profit</span>
                        </div>
                        <span className="text-emerald-400 font-bold">{currencyFormatter(data.net_profit)}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span className="text-zinc-400">Applicants</span>
                        </div>
                        <span className="text-blue-400 font-bold">{data.total_orders}명</span>
                    </div>
                    <div className="flex justify-between items-center gap-4 pt-2 border-t border-white/5 mt-2">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span className="text-zinc-400">Margin</span>
                        </div>
                        <span className="text-amber-400 font-bold">{data.profit_margin}%</span>
                    </div>
                </div>
            </motion.div>
        );
    }
    return null;
};

// ==========================================
// Main Component
// ==========================================

export function EventComparisonChart({ data, onEventClick }: Props) {
    const [metric, setMetric] = useState<MetricType>("profit");
    const [selectedEventIds, setSelectedEventIds] = useState<Set<number>>(new Set());
    const [showEventSelector, setShowEventSelector] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // 1. Prepare Data with profit margin calculation
    const chartData = useMemo(() => data.map(e => ({
        ...e,
        profit_margin: e.gross_revenue > 0 ? Math.round((e.net_profit / e.gross_revenue) * 100) : 0
    })), [data]);

    // 2. Sort Data by Selected Metric
    const sortedData = useMemo(() => {
        let filtered = [...chartData];

        // If specific events are selected, filter by them
        if (selectedEventIds.size > 0) {
            filtered = filtered.filter(e => selectedEventIds.has(e.event_id));
        }

        return filtered.sort((a, b) => {
            if (metric === "revenue") return b.gross_revenue - a.gross_revenue;
            if (metric === "profit") return b.net_profit - a.net_profit;
            if (metric === "orders") return b.total_orders - a.total_orders;
            if (metric === "margin") return b.profit_margin! - a.profit_margin!;
            return 0;
        });
    }, [chartData, selectedEventIds, metric]);

    // Determine display data - if not expanded, show max 8 events for compact view
    const displayData = useMemo(() => {
        const raw = isExpanded ? sortedData : sortedData.slice(0, 8);
        return raw.map((item, index) => ({
            ...item,
            rank: index + 1
        }));
    }, [isExpanded, sortedData]);

    const hasMoreEvents = sortedData.length > 8;

    // Calculate Summary
    const totalValue = useMemo(() => {
        if (metric === "margin") {
            // Average for margin
            return displayData.length > 0
                ? Math.round(displayData.reduce((acc, curr) => acc + (curr.profit_margin || 0), 0) / displayData.length)
                : 0;
        }
        return displayData.reduce((acc, curr) => {
            const val = metric === "orders" ? curr.total_orders :
                metric === "revenue" ? curr.gross_revenue :
                    metric === "profit" ? curr.net_profit : 0;
            return acc + (val || 0);
        }, 0);
    }, [displayData, metric]);

    // Dynamic height based on number of events displayed
    const chartHeight = Math.max(300, displayData.length * 48 + 50);

    // 3. Config based on Metric
    const config = {
        orders: {
            label: "Applicants",
            color: "#3b82f6",
            gradientId: "ordersGradient",
            icon: Users,
            formatter: (v: number) => `${numberFormatter(v)}명`,
            unit: "명"
        },
        revenue: {
            label: "Gross Revenue",
            color: "#10b981",
            gradientId: "revenueGradient",
            icon: DollarSign,
            formatter: currencyFormatter,
            unit: "원"
        },
        profit: {
            label: "Net Profit",
            color: "#059669",
            gradientId: "profitGradient",
            icon: TrendingUp,
            formatter: currencyFormatter,
            unit: "원"
        },
        margin: {
            label: "Profit Margin",
            color: "#f59e0b",
            gradientId: "marginGradient",
            icon: Percent,
            formatter: (v: number) => `${v}%`,
            unit: "%"
        },
    };

    const currentConfig = config[metric];
    const Icon = currentConfig.icon;

    // Event selection handlers
    const toggleEventSelection = (eventId: number) => {
        setSelectedEventIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(eventId)) {
                newSet.delete(eventId);
            } else {
                newSet.add(eventId);
            }
            return newSet;
        });
    };

    const selectAllEvents = () => {
        setSelectedEventIds(new Set(chartData.map(e => e.event_id)));
    };

    const clearSelection = () => {
        setSelectedEventIds(new Set());
    };

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl flex flex-col relative group">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-transparent pointer-events-none group-hover:from-emerald-600/10 transition-colors duration-500" />

            {/* Header & Controls */}
            <div className="flex flex-col gap-6 mb-4 relative z-10">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 shadow-lg shadow-black/20 ring-1 ring-white/10`}>
                            <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white font-[family-name:var(--font-oswald)] uppercase tracking-wide">
                                Event Comparison
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-xs text-zinc-400 font-medium whitespace-nowrap">
                                    {selectedEventIds.size > 0
                                        ? `${selectedEventIds.size} Events Selected`
                                        : `Comparing Top ${Math.min(displayData.length, 8)} Events`
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Summary Card Inline */}
                    <div className="flex items-center gap-4 px-4 py-3 bg-zinc-950/40 rounded-xl border border-white/5 backdrop-blur-md">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-tighter">Total {currentConfig.label}</span>
                            <span className="text-lg font-mono font-bold text-emerald-400">
                                {metric === "margin" ? `AVG ${totalValue}%` : currentConfig.formatter(totalValue)}
                            </span>
                        </div>
                        <div className="h-8 w-px bg-zinc-800" />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-tighter">Event Count</span>
                            <span className="text-lg font-mono font-bold text-white">
                                {displayData.length}
                            </span>
                        </div>
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Event Filter Button */}
                        <button
                            onClick={() => setShowEventSelector(!showEventSelector)}
                            className={`
                                flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase rounded-lg transition-all border
                                ${showEventSelector || selectedEventIds.size > 0
                                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                    : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-300"
                                }
                            `}
                        >
                            <Filter className="w-3.5 h-3.5" />
                            Filter
                            {selectedEventIds.size > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 bg-emerald-500/30 rounded text-[10px]">
                                    {selectedEventIds.size}
                                </span>
                            )}
                        </button>

                        {/* Segmented Control */}
                        <div className="flex p-1 bg-zinc-950/50 rounded-lg border border-zinc-800 backdrop-blur-sm">
                            {(Object.keys(config) as MetricType[]).map((key) => (
                                <button
                                    key={key}
                                    onClick={() => setMetric(key)}
                                    className={`
                                        px-3 py-1.5 text-xs font-bold uppercase rounded-md transition-all
                                        ${metric === key
                                            ? "bg-zinc-800 text-white shadow-sm ring-1 ring-white/10"
                                            : "text-zinc-500 hover:text-zinc-300"}
                                    `}
                                >
                                    {config[key].label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Event Selector Panel */}
                <AnimatePresence>
                    {showEventSelector && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-800 backdrop-blur-sm">
                                {/* Quick Actions */}
                                <div className="flex items-center justify-between mb-3 pb-3 border-b border-zinc-800">
                                    <span className="text-xs text-zinc-500 uppercase font-bold">비교할 대회 선택</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={selectAllEvents}
                                            className="text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-zinc-800"
                                        >
                                            전체 선택
                                        </button>
                                        <button
                                            onClick={clearSelection}
                                            className="text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-zinc-800"
                                        >
                                            선택 해제
                                        </button>
                                    </div>
                                </div>

                                {/* Event Checkboxes Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                                    {chartData.map((event) => (
                                        <button
                                            key={event.event_id}
                                            onClick={() => toggleEventSelection(event.event_id)}
                                            className={`
                                                flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all text-xs
                                                ${selectedEventIds.has(event.event_id)
                                                    ? "bg-emerald-500/20 border border-emerald-500/30 text-white"
                                                    : "bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
                                                }
                                            `}
                                        >
                                            <div className={`
                                                w-4 h-4 rounded border flex items-center justify-center flex-shrink-0
                                                ${selectedEventIds.has(event.event_id)
                                                    ? "bg-emerald-500 border-emerald-500"
                                                    : "border-zinc-600"
                                                }
                                            `}>
                                                {selectedEventIds.has(event.event_id) && (
                                                    <Check className="w-3 h-3 text-white" />
                                                )}
                                            </div>
                                            <span className="truncate flex-1">{event.event_title}</span>
                                        </button>
                                    ))}
                                </div>

                                {selectedEventIds.size > 0 && (
                                    <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between">
                                        <span className="text-xs text-zinc-500">
                                            {selectedEventIds.size}개 대회가 선택되었습니다
                                        </span>
                                        <button
                                            onClick={() => setShowEventSelector(false)}
                                            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold uppercase px-3 py-1 rounded hover:bg-emerald-500/10 transition-colors"
                                        >
                                            적용하기
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Chart Area with dynamic height */}
            <div className="w-full relative z-0" style={{ height: chartHeight }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={displayData}
                        layout="vertical"
                        margin={{ top: 5, right: 120, left: 10, bottom: 5 }}
                        barSize={24}
                        onClick={(data: any) => {
                            if (data && data.activePayload && data.activePayload.length > 0) {
                                onEventClick?.(data.activePayload[0].payload as EventAnalyticsData);
                            }
                        }}
                        className="cursor-pointer"
                    >
                        <defs>
                            <linearGradient id="ordersGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
                                <stop offset="100%" stopColor="#10b981" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="profitGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#059669" stopOpacity={0.6} />
                                <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="marginGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.6} />
                                <stop offset="100%" stopColor="#f59e0b" stopOpacity={1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#ffffff05" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="event_title"
                            type="category"
                            width={180}
                            tick={(props: any) => {
                                const { x, y, payload } = props;
                                const index = displayData.findIndex(d => d.event_title === payload.value);
                                const rank = index + 1;
                                const isTop3 = rank <= 3;

                                return (
                                    <g transform={`translate(${x},${y})`}>
                                        <text
                                            x={-10}
                                            y={0}
                                            dy={4}
                                            fill={isTop3 ? "#fbbf24" : "#52525b"}
                                            fontSize={10}
                                            fontWeight="bold"
                                            textAnchor="end"
                                        >
                                            {rank}
                                        </text>
                                        <text
                                            x={-20}
                                            y={0}
                                            dy={4}
                                            fill={isTop3 ? "#ffffff" : "#a1a1aa"}
                                            fontSize={11}
                                            fontWeight={isTop3 ? "700" : "500"}
                                            textAnchor="end"
                                        >
                                            {payload.value.length > 20 ? `${payload.value.substring(0, 20)}...` : payload.value}
                                        </text>
                                    </g>
                                );
                            }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            content={<CustomTooltip mode={metric} />}
                            cursor={{ fill: "#ffffff05" }}
                        />
                        <Bar
                            dataKey={
                                metric === "orders" ? "total_orders" :
                                    metric === "revenue" ? "gross_revenue" :
                                        metric === "profit" ? "net_profit" : "profit_margin"
                            }
                            radius={[0, 4, 4, 0]}
                            animationDuration={1500}
                            animationEasing="ease-out"
                        >
                            {displayData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={`url(#${currentConfig.gradientId})`}
                                    opacity={1}
                                />
                            ))}
                            <LabelList
                                dataKey={
                                    metric === "orders" ? "total_orders" :
                                        metric === "revenue" ? "gross_revenue" :
                                            metric === "profit" ? "net_profit" : "profit_margin"
                                }
                                position="right"
                                content={(props: any) => {
                                    const { x, y, width, height, value, index } = props;
                                    const isTop3 = index < 3;
                                    return (
                                        <g>
                                            <text
                                                x={x + width + 10}
                                                y={y + height / 2.5}
                                                fill={isTop3 ? "#ffffff" : "#a1a1aa"}
                                                fontSize={12}
                                                fontWeight={isTop3 ? "800" : "600"}
                                                fontFamily="monospace"
                                                textAnchor="start"
                                            >
                                                {currentConfig.formatter(value)}
                                            </text>
                                            {isTop3 && (
                                                <text
                                                    x={x + width + 10}
                                                    y={y + height / 1.2}
                                                    fill="#fbbf24"
                                                    fontSize={8}
                                                    fontWeight="bold"
                                                    textAnchor="start"
                                                    style={{ textTransform: 'uppercase' }}
                                                >
                                                    Top Performer
                                                </text>
                                            )}
                                        </g>
                                    );
                                }}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Expand/Collapse Button */}
            {hasMoreEvents && selectedEventIds.size === 0 && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-4 flex items-center justify-center gap-2 py-2 px-4 mx-auto text-xs font-bold text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 rounded-lg transition-all relative z-10"
                >
                    {isExpanded ? (
                        <>
                            <ChevronUp className="w-4 h-4" />
                            접기 (상위 8개만 보기)
                        </>
                    ) : (
                        <>
                            <ChevronDown className="w-4 h-4" />
                            전체 {sortedData.length}개 대회 보기
                        </>
                    )}
                </button>
            )}
        </div>
    );
}

// ==========================================
// Sub-components
// ==========================================

