/**
 * 📊 Profit Chart
 * 매출 vs 순수익 시각화 (Recharts)
 * Agent 7: Gold (The Treasurer)
 */

"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    TooltipProps,
} from "recharts";

type ChartData = {
    name: string;
    revenue: number;
    profit: number;
};

type ProfitChartProps = {
    data: ChartData[];
};

// Custom Tooltip Component for Heavy Metal Theme
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-none shadow-xl">
                <p className="text-zinc-300 font-bold mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
                        <div
                            className="w-3 h-3"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm text-zinc-400 capitalize">
                            {entry.name === "revenue" ? "매출" : "순수익"}:
                        </span>
                        <span className="text-sm font-mono font-bold text-white">
                            {new Intl.NumberFormat("ko-KR", {
                                style: "currency",
                                currency: "KRW",
                                maximumFractionDigits: 0,
                            }).format(entry.value as number)}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export function ProfitChart({ data }: ProfitChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[300px] bg-zinc-900/50 border border-zinc-800 text-zinc-500">
                데이터가 없습니다.
            </div>
        );
    }

    return (
        <div className="w-full bg-zinc-900 border border-zinc-800 p-4">
            <h3 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-wider">
                Revenue vs Net Profit
            </h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke="#71717a"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#71717a"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) =>
                                new Intl.NumberFormat("ko-KR", { notation: "compact" }).format(value)
                            }
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff10' }} />
                        <Legend wrapperStyle={{ paddingTop: "20px" }} />
                        <Bar
                            dataKey="revenue"
                            name="매출 (Revenue)"
                            fill="#10b981" // Emerald-500
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                        />
                        <Bar
                            dataKey="profit"
                            name="순수익 (Net Profit)"
                            fill="#eab308" // Yellow-500
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
