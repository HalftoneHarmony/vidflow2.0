"use client";

/**
 * 🎯 Customer Segment Chart
 * VIP/단골/신규/휴면 고객 세그먼트 시각화
 * @author Agent 3 (Analytics Master)
 */

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import { Users, Crown, UserCheck, UserPlus, UserX } from "lucide-react";
import { motion } from "framer-motion";

// ==========================================
// Types
// ==========================================

type CustomerSegments = {
    vip: { count: number; total_revenue: number };
    repeat: { count: number };
    new: { count: number };
};

type Props = {
    data: CustomerSegments | null;
};

// ==========================================
// Config
// ==========================================

const SEGMENT_CONFIG = [
    { key: "vip", label: "VIP", color: "#eab308", icon: Crown, description: "100만원 이상 구매" },
    { key: "repeat", label: "단골", color: "#22c55e", icon: UserCheck, description: "2회 이상 구매" },
    { key: "new", label: "신규", color: "#3b82f6", icon: UserPlus, description: "최근 30일 가입" },
];

const currencyFormatter = (value: number) =>
    new Intl.NumberFormat("ko-KR", {
        style: "currency",
        currency: "KRW",
        maximumFractionDigits: 0,
    }).format(value);

const compactFormatter = (value: number) =>
    new Intl.NumberFormat("ko-KR", { notation: "compact" }).format(value);

// ==========================================
// Active Shape
// ==========================================

const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;

    return (
        <g>
            <text x={cx} y={cy - 8} textAnchor="middle" fill="#fff" className="text-xl font-bold font-mono">
                {payload.count}
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" fill="#71717a" className="text-xs">
                {payload.name}
            </text>
            <text x={cx} y={cy + 28} textAnchor="middle" fill="#52525b" className="text-[10px]">
                {(percent * 100).toFixed(1)}%
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 6}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                stroke="rgba(0,0,0,0.3)"
                strokeWidth={2}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={innerRadius - 4}
                outerRadius={innerRadius - 1}
                fill={fill}
                fillOpacity={0.3}
            />
        </g>
    );
};

// ==========================================
// Main Component
// ==========================================

export function CustomerSegmentChart({ data }: Props) {
    const [activeIndex, setActiveIndex] = useState(0);

    if (!data) {
        return (
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 h-full flex items-center justify-center">
                <div className="text-center text-zinc-500">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm uppercase tracking-wider">세그먼트 데이터 없음</p>
                </div>
            </div>
        );
    }

    // Transform data for chart
    const chartData = SEGMENT_CONFIG.map(seg => ({
        name: seg.label,
        count: data[seg.key as keyof CustomerSegments]
            ? typeof data[seg.key as keyof CustomerSegments] === "object"
                ? (data[seg.key as keyof CustomerSegments] as any).count || 0
                : 0
            : 0,
        color: seg.color,
        icon: seg.icon,
        description: seg.description,
        revenue: seg.key === "vip" && data.vip ? data.vip.total_revenue : null,
    }));

    const totalCustomers = chartData.reduce((sum, d) => sum + d.count, 0);
    const vipRevenue = data.vip?.total_revenue || 0;

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 h-full relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/5 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white font-[family-name:var(--font-oswald)] uppercase">
                        Customer Segments
                    </h3>
                    <p className="text-xs text-zinc-500">고객 세그먼트 분포</p>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-zinc-800/30 border border-zinc-700/50 p-3">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">총 고객</p>
                    <p className="text-xl font-bold text-white font-mono">{totalCustomers}</p>
                </div>
                <div className="bg-zinc-800/30 border border-zinc-700/50 p-3">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">VIP 매출</p>
                    <p className="text-xl font-bold text-yellow-500 font-mono">{compactFormatter(vipRevenue)}</p>
                </div>
            </div>

            {/* Chart */}
            <div className="h-[200px] relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            activeIndex={activeIndex}
                            activeShape={renderActiveShape}
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={4}
                            dataKey="count"
                            onMouseEnter={onPieEnter}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    stroke="rgba(0,0,0,0.2)"
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="space-y-2 mt-4">
                {chartData.map((seg, index) => {
                    const Icon = seg.icon;
                    const isActive = index === activeIndex;
                    return (
                        <motion.div
                            key={seg.name}
                            className={`flex items-center justify-between p-2 border transition-all cursor-pointer ${isActive
                                    ? "bg-zinc-800/50 border-zinc-600"
                                    : "border-transparent hover:border-zinc-700"
                                }`}
                            onMouseEnter={() => setActiveIndex(index)}
                            whileHover={{ x: 4 }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 flex items-center justify-center"
                                    style={{ backgroundColor: `${seg.color}20` }}
                                >
                                    <Icon className="w-4 h-4" style={{ color: seg.color }} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{seg.name}</p>
                                    <p className="text-[10px] text-zinc-500">{seg.description}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-mono font-bold text-white">{seg.count}</p>
                                {totalCustomers > 0 && (
                                    <p className="text-[10px] text-zinc-500">
                                        {((seg.count / totalCustomers) * 100).toFixed(1)}%
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
