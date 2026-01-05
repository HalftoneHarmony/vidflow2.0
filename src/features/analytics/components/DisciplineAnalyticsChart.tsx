"use client";

/**
 * 🏅 Discipline Analytics Chart
 * 종목별/패키지별 통합 신청 현황 분석
 * @author Agent 3 (Analytics Master)
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Medal,
    Package,
    ChevronDown,
    ChevronRight,
    TrendingUp,
    BarChart3,
    Users,
    DollarSign
} from "lucide-react";
import {
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Cell,
    PieChart as RechartsPieChart,
    Pie,
} from "recharts";

// ==========================================
// Types
// ==========================================

export type DisciplineStats = {
    discipline: string;
    total_orders: number;
    total_revenue: number;
    package_breakdown: Record<string, number>;
    event_breakdown: Record<string, number>;
};

export type PackageStats = {
    package_name: string;
    total_orders: number;
    total_revenue: number;
    discipline_breakdown: Record<string, number>;
};

type Props = {
    disciplineData: DisciplineStats[];
    packageData: PackageStats[];
};

// ==========================================
// Config
// ==========================================

const COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#84cc16'
];

const formatCurrency = (val: number) => {
    const safeVal = Number.isFinite(val) ? val : 0;
    return new Intl.NumberFormat("ko-KR", { notation: "compact" }).format(safeVal);
};

// ==========================================
// Helper Components
// ==========================================

function StatCard({ label, value, icon: Icon, color }: {
    label: string;
    value: string | number;
    icon: any;
    color: string;
}) {
    return (
        <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
                <Icon className="w-3.5 h-3.5" style={{ color }} />
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-lg font-bold text-white font-mono">{value}</p>
        </div>
    );
}

function ExpandableRow({
    title,
    mainValue,
    subValue,
    breakdown,
    color,
    isExpanded,
    onToggle,
    maxValue
}: {
    title: string;
    mainValue: number;
    subValue: number;
    breakdown: Record<string, number>;
    color: string;
    isExpanded: boolean;
    onToggle: () => void;
    maxValue: number;
}) {
    const percentage = (mainValue / maxValue) * 100;
    const breakdownEntries = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);

    return (
        <div className="border-b border-zinc-800 last:border-b-0">
            <button
                onClick={onToggle}
                className="w-full px-4 py-3 flex items-center gap-4 hover:bg-zinc-800/30 transition-colors group"
            >
                {/* Chevron */}
                <div className="w-5 h-5 flex items-center justify-center text-zinc-500 group-hover:text-white transition-colors">
                    {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                    ) : (
                        <ChevronRight className="w-4 h-4" />
                    )}
                </div>

                {/* Color indicator */}
                <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                />

                {/* Title */}
                <span className="text-sm font-medium text-white flex-1 text-left truncate">
                    {title}
                </span>

                {/* Stats */}
                <div className="flex items-center gap-6 text-right">
                    <div className="w-24">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">신청</p>
                        <p className="text-sm font-bold text-white font-mono">{mainValue}건</p>
                    </div>
                    <div className="w-24">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">매출</p>
                        <p className="text-sm font-bold text-emerald-400 font-mono">₩{formatCurrency(subValue)}</p>
                    </div>
                    <div className="w-32 hidden md:block">
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>
                </div>
            </button>

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && breakdownEntries.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-zinc-900/50"
                    >
                        <div className="px-4 py-3 pl-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {breakdownEntries.map(([name, count], idx) => (
                                <div
                                    key={name}
                                    className="flex items-center gap-2 text-xs bg-zinc-800/50 rounded-lg px-3 py-2"
                                >
                                    <div
                                        className="w-2 h-2 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                    />
                                    <span className="text-zinc-400 truncate flex-1">{name}</span>
                                    <span className="text-white font-mono font-bold">{count}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ==========================================
// Main Component
// ==========================================

export function DisciplineAnalyticsChart({ disciplineData, packageData }: Props) {
    const [activeTab, setActiveTab] = useState<"discipline" | "package">("discipline");
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [chartType, setChartType] = useState<"bar" | "pie">("bar");

    const currentData = activeTab === "discipline" ? disciplineData : packageData;
    const totalOrders = currentData.reduce((sum, d) => sum + d.total_orders, 0);
    const totalRevenue = currentData.reduce((sum, d) => sum + d.total_revenue, 0);
    const maxOrders = Math.max(...currentData.map(d => d.total_orders), 1);

    // Chart data
    const chartData = currentData.slice(0, 8).map((item, idx) => ({
        name: activeTab === "discipline"
            ? (item as DisciplineStats).discipline
            : (item as PackageStats).package_name,
        value: item.total_orders,
        revenue: item.total_revenue,
        fill: COLORS[idx % COLORS.length]
    }));

    if ((!disciplineData || disciplineData.length === 0) && (!packageData || packageData.length === 0)) {
        return (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 h-full flex items-center justify-center">
                <div className="text-center text-zinc-500">
                    <Medal className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm uppercase tracking-wider">신청 데이터 없음</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950/50">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl">
                        <Medal className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white font-[family-name:var(--font-oswald)] uppercase tracking-wide">
                            Application Analytics
                        </h3>
                        <p className="text-xs text-zinc-500">종목별 / 패키지별 신청 현황</p>
                    </div>
                </div>

                {/* Tab Toggle */}
                <div className="flex bg-zinc-800/50 rounded-xl p-1 border border-zinc-700">
                    <button
                        onClick={() => setActiveTab("discipline")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === "discipline"
                            ? "bg-blue-600 text-white shadow-lg"
                            : "text-zinc-500 hover:text-zinc-300"
                            }`}
                    >
                        <Medal className="w-3.5 h-3.5" />
                        종목별
                    </button>
                    <button
                        onClick={() => setActiveTab("package")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === "package"
                            ? "bg-blue-600 text-white shadow-lg"
                            : "text-zinc-500 hover:text-zinc-300"
                            }`}
                    >
                        <Package className="w-3.5 h-3.5" />
                        패키지별
                    </button>
                </div>
            </div>

            <div className="p-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <StatCard
                        label={activeTab === "discipline" ? "총 종목" : "총 패키지"}
                        value={currentData.length}
                        icon={activeTab === "discipline" ? Medal : Package}
                        color="#3b82f6"
                    />
                    <StatCard
                        label="총 신청"
                        value={`${totalOrders}건`}
                        icon={Users}
                        color="#10b981"
                    />
                    <StatCard
                        label="총 매출"
                        value={`₩${formatCurrency(totalRevenue)}`}
                        icon={DollarSign}
                        color="#f59e0b"
                    />
                    <StatCard
                        label="평균 신청"
                        value={`${currentData.length > 0 ? Math.round(totalOrders / currentData.length) : 0}건`}
                        icon={TrendingUp}
                        color="#8b5cf6"
                    />
                </div>

                {/* Chart Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Chart */}
                    <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">분포 차트</h4>
                            <div className="flex bg-zinc-800/50 rounded-lg p-0.5 border border-zinc-700">
                                <button
                                    onClick={() => setChartType("bar")}
                                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${chartType === "bar" ? "bg-zinc-600 text-white shadow" : "text-zinc-500 hover:text-zinc-300"
                                        }`}
                                >
                                    Bar
                                </button>
                                <button
                                    onClick={() => setChartType("pie")}
                                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${chartType === "pie" ? "bg-zinc-600 text-white shadow" : "text-zinc-500 hover:text-zinc-300"
                                        }`}
                                >
                                    Pie
                                </button>
                            </div>
                        </div>

                        <div className="h-[250px]">
                            {chartType === "bar" ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsBarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            width={80}
                                            tick={{ fill: '#a1a1aa', fontSize: 10 }}
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(value) => value.length > 10 ? value.slice(0, 10) + '...' : value}
                                        />
                                        <RechartsTooltip
                                            cursor={{ fill: '#ffffff08' }}
                                            contentStyle={{
                                                backgroundColor: '#18181b',
                                                border: '1px solid #27272a',
                                                borderRadius: '8px'
                                            }}
                                            itemStyle={{ color: '#e4e4e7', fontSize: '12px' }}
                                            formatter={(value, name) => {
                                                const numValue = Number(value) || 0;
                                                return [
                                                    name === 'value' ? `${numValue}건` : `₩${formatCurrency(numValue)}`,
                                                    name === 'value' ? '신청 수' : '매출'
                                                ];
                                            }}
                                        />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </RechartsBarChart>
                                </ResponsiveContainer>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} stroke="rgba(0,0,0,0)" />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            contentStyle={{
                                                backgroundColor: '#18181b',
                                                border: '1px solid #27272a',
                                                borderRadius: '8px'
                                            }}
                                            itemStyle={{ color: '#e4e4e7', fontSize: '12px' }}
                                        />
                                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                                            <tspan x="50%" dy="-0.5em" fontSize="10" fill="#71717a">TOTAL</tspan>
                                            <tspan x="50%" dy="1.5em" fontSize="18" fontWeight="bold" fill="#fff">
                                                {totalOrders}
                                            </tspan>
                                        </text>
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Top Rankings */}
                    <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <BarChart3 className="w-3.5 h-3.5" />
                            TOP {Math.min(5, currentData.length)} 순위
                        </h4>
                        <div className="space-y-3">
                            {currentData.slice(0, 5).map((item, idx) => {
                                const name = activeTab === "discipline"
                                    ? (item as DisciplineStats).discipline
                                    : (item as PackageStats).package_name;
                                const percentage = (item.total_orders / totalOrders) * 100;

                                return (
                                    <div key={name} className="flex items-center gap-3">
                                        <div
                                            className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
                                            style={{
                                                backgroundColor: `${COLORS[idx]}20`,
                                                color: COLORS[idx]
                                            }}
                                        >
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-white truncate">{name}</span>
                                                <span className="text-xs text-zinc-400 font-mono">
                                                    {item.total_orders}건 ({percentage.toFixed(1)}%)
                                                </span>
                                            </div>
                                            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full rounded-full"
                                                    style={{ backgroundColor: COLORS[idx] }}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percentage}%` }}
                                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Detailed List */}
                <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-zinc-700/50 bg-zinc-800/20">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                            상세 목록 (클릭하여 세부 정보 보기)
                        </h4>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                        {currentData.map((item, idx) => {
                            const name = activeTab === "discipline"
                                ? (item as DisciplineStats).discipline
                                : (item as PackageStats).package_name;
                            const breakdown = activeTab === "discipline"
                                ? (item as DisciplineStats).package_breakdown
                                : (item as PackageStats).discipline_breakdown;

                            return (
                                <ExpandableRow
                                    key={name}
                                    title={name}
                                    mainValue={item.total_orders}
                                    subValue={item.total_revenue}
                                    breakdown={breakdown}
                                    color={COLORS[idx % COLORS.length]}
                                    isExpanded={expandedRow === name}
                                    onToggle={() => setExpandedRow(expandedRow === name ? null : name)}
                                    maxValue={maxOrders}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
