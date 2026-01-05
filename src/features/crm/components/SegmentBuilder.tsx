"use client";

import { useState, useEffect, useTransition } from "react";
import { motion } from "framer-motion";
import {
    Filter,
    Users,
    DollarSign,
    ShoppingCart,
    Calendar,
    CheckCircle2,
    X,
    RotateCcw,
    Eye,
    Mail,
    Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { countCustomerSegment, getCustomerSegment, type SegmentCriteria, type SegmentCustomer, type SegmentCount } from "../actions";

interface SegmentBuilderProps {
    onSegmentChange?: (customers: SegmentCustomer[]) => void;
}

export function SegmentBuilder({ onSegmentChange }: SegmentBuilderProps) {
    const [isPending, startTransition] = useTransition();
    const [criteria, setCriteria] = useState<SegmentCriteria>({});
    const [preview, setPreview] = useState<SegmentCount | null>(null);
    const [customers, setCustomers] = useState<SegmentCustomer[]>([]);
    const [showResults, setShowResults] = useState(false);

    // Debounced preview update
    useEffect(() => {
        const timer = setTimeout(() => {
            updatePreview();
        }, 500);
        return () => clearTimeout(timer);
    }, [criteria]);

    const updatePreview = () => {
        startTransition(async () => {
            const result = await countCustomerSegment(criteria);
            setPreview(result);
        });
    };

    const loadSegment = async () => {
        startTransition(async () => {
            const result = await getCustomerSegment(criteria);
            setCustomers(result);
            setShowResults(true);
            onSegmentChange?.(result);
        });
    };

    const resetCriteria = () => {
        setCriteria({});
        setShowResults(false);
        setCustomers([]);
    };

    const updateCriteria = (key: keyof SegmentCriteria, value: any) => {
        setCriteria((prev) => ({
            ...prev,
            [key]: value === "" ? undefined : value,
        }));
    };

    const formatPrice = (price: number) => {
        return `₩${price.toLocaleString()}`;
    };

    const presetSegments = [
        {
            label: "VIP 고객",
            description: "500만원 이상 구매",
            criteria: { minSpent: 5000000 },
            color: "amber",
        },
        {
            label: "단골 고객",
            description: "3회 이상 구매",
            criteria: { minOrders: 3 },
            color: "violet",
        },
        {
            label: "휴면 고객",
            description: "90일 이상 미구매",
            criteria: { minDaysSinceOrder: 90 },
            color: "red",
        },
        {
            label: "신규 고객",
            description: "30일 내 첫 구매",
            criteria: { maxDaysSinceOrder: 30, maxOrders: 1 },
            color: "emerald",
        },
        {
            label: "납품 완료",
            description: "영상 수령 완료",
            criteria: { hasDelivered: true },
            color: "blue",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Preset Segments */}
            <div className="border border-zinc-800 bg-zinc-900/30 p-4">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Quick Segments
                </h3>
                <div className="flex flex-wrap gap-2">
                    {presetSegments.map((preset) => (
                        <button
                            key={preset.label}
                            onClick={() => setCriteria(preset.criteria)}
                            className={`
                                px-3 py-2 text-sm border transition-all
                                ${preset.color === "amber" ? "border-amber-500/30 text-amber-400 hover:bg-amber-500/10" : ""}
                                ${preset.color === "violet" ? "border-violet-500/30 text-violet-400 hover:bg-violet-500/10" : ""}
                                ${preset.color === "red" ? "border-red-500/30 text-red-400 hover:bg-red-500/10" : ""}
                                ${preset.color === "emerald" ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10" : ""}
                                ${preset.color === "blue" ? "border-blue-500/30 text-blue-400 hover:bg-blue-500/10" : ""}
                            `}
                        >
                            <span className="font-bold">{preset.label}</span>
                            <span className="text-xs text-zinc-500 ml-2">
                                {preset.description}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom Criteria Builder */}
            <div className="border border-zinc-800 bg-zinc-900/30 p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Custom Segment Builder
                    </h3>
                    <button
                        onClick={resetCriteria}
                        className="text-xs text-zinc-500 hover:text-white flex items-center gap-1 transition-colors"
                    >
                        <RotateCcw className="w-3 h-3" />
                        Reset
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Spending Range */}
                    <div className="space-y-2">
                        <label className="text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            Total Spent (원)
                        </label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                placeholder="Min"
                                value={criteria.minSpent || ""}
                                onChange={(e) => updateCriteria("minSpent", e.target.value ? parseInt(e.target.value) : undefined)}
                                className="bg-zinc-800 border-zinc-700 text-white text-sm"
                            />
                            <span className="text-zinc-600">~</span>
                            <Input
                                type="number"
                                placeholder="Max"
                                value={criteria.maxSpent || ""}
                                onChange={(e) => updateCriteria("maxSpent", e.target.value ? parseInt(e.target.value) : undefined)}
                                className="bg-zinc-800 border-zinc-700 text-white text-sm"
                            />
                        </div>
                    </div>

                    {/* Order Count Range */}
                    <div className="space-y-2">
                        <label className="text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                            <ShoppingCart className="w-3 h-3" />
                            Order Count
                        </label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                placeholder="Min"
                                value={criteria.minOrders || ""}
                                onChange={(e) => updateCriteria("minOrders", e.target.value ? parseInt(e.target.value) : undefined)}
                                className="bg-zinc-800 border-zinc-700 text-white text-sm"
                            />
                            <span className="text-zinc-600">~</span>
                            <Input
                                type="number"
                                placeholder="Max"
                                value={criteria.maxOrders || ""}
                                onChange={(e) => updateCriteria("maxOrders", e.target.value ? parseInt(e.target.value) : undefined)}
                                className="bg-zinc-800 border-zinc-700 text-white text-sm"
                            />
                        </div>
                    </div>

                    {/* Days Since Last Order */}
                    <div className="space-y-2">
                        <label className="text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Days Since Order
                        </label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                placeholder="Min"
                                value={criteria.minDaysSinceOrder || ""}
                                onChange={(e) => updateCriteria("minDaysSinceOrder", e.target.value ? parseInt(e.target.value) : undefined)}
                                className="bg-zinc-800 border-zinc-700 text-white text-sm"
                            />
                            <span className="text-zinc-600">~</span>
                            <Input
                                type="number"
                                placeholder="Max"
                                value={criteria.maxDaysSinceOrder || ""}
                                onChange={(e) => updateCriteria("maxDaysSinceOrder", e.target.value ? parseInt(e.target.value) : undefined)}
                                className="bg-zinc-800 border-zinc-700 text-white text-sm"
                            />
                        </div>
                    </div>

                    {/* Has Delivered */}
                    <div className="space-y-2">
                        <label className="text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Delivery Status
                        </label>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => updateCriteria("hasDelivered", criteria.hasDelivered === true ? undefined : true)}
                                className={`
                                    px-3 py-2 text-sm border transition-all flex-1
                                    ${criteria.hasDelivered === true
                                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                                        : "border-zinc-700 text-zinc-500 hover:border-zinc-600"
                                    }
                                `}
                            >
                                납품 완료
                            </button>
                            <button
                                onClick={() => updateCriteria("hasDelivered", criteria.hasDelivered === false ? undefined : false)}
                                className={`
                                    px-3 py-2 text-sm border transition-all flex-1
                                    ${criteria.hasDelivered === false
                                        ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                                        : "border-zinc-700 text-zinc-500 hover:border-zinc-600"
                                    }
                                `}
                            >
                                미납품
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview & Actions */}
            <div className="flex items-center justify-between p-4 border border-violet-500/20 bg-violet-500/5">
                <div className="flex items-center gap-6">
                    <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">
                            Estimated Reach
                        </p>
                        <p className="text-2xl font-bold text-violet-400 font-[family-name:var(--font-oswald)]">
                            {isPending ? "..." : preview?.count ?? 0}
                            <span className="text-sm text-zinc-500 font-normal ml-1">명</span>
                        </p>
                    </div>
                    <div className="h-10 w-px bg-zinc-700" />
                    <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">
                            Total Value
                        </p>
                        <p className="text-2xl font-bold text-emerald-400 font-[family-name:var(--font-oswald)]">
                            {isPending ? "..." : formatPrice(preview?.total_value ?? 0)}
                        </p>
                    </div>
                    <div className="h-10 w-px bg-zinc-700" />
                    <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">
                            Avg Value
                        </p>
                        <p className="text-2xl font-bold text-amber-400 font-[family-name:var(--font-oswald)]">
                            {isPending ? "..." : formatPrice(preview?.avg_value ?? 0)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={loadSegment}
                        disabled={isPending || (preview?.count ?? 0) === 0}
                        className="bg-violet-600 hover:bg-violet-500 text-white"
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        View Segment
                    </Button>
                </div>
            </div>

            {/* Results Table */}
            {showResults && customers.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-zinc-800 bg-zinc-900/30"
                >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <Users className="w-4 h-4 text-violet-400" />
                            Segment Results ({customers.length})
                        </h3>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-400">
                                <Download className="w-4 h-4 mr-2" />
                                Export CSV
                            </Button>
                            <Button size="sm" className="bg-violet-600 hover:bg-violet-500">
                                <Mail className="w-4 h-4 mr-2" />
                                Send Email
                            </Button>
                        </div>
                    </div>
                    <div className="overflow-x-auto max-h-96">
                        <table className="w-full">
                            <thead className="sticky top-0 bg-zinc-900">
                                <tr className="border-b border-zinc-800">
                                    <th className="px-4 py-2 text-left text-xs text-zinc-500 uppercase">Name</th>
                                    <th className="px-4 py-2 text-left text-xs text-zinc-500 uppercase">Email</th>
                                    <th className="px-4 py-2 text-left text-xs text-zinc-500 uppercase">Orders</th>
                                    <th className="px-4 py-2 text-left text-xs text-zinc-500 uppercase">Total Spent</th>
                                    <th className="px-4 py-2 text-left text-xs text-zinc-500 uppercase">Last Order</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr
                                        key={customer.user_id}
                                        className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                                    >
                                        <td className="px-4 py-3 text-white font-medium">
                                            {customer.customer_name}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-400 text-sm">
                                            {customer.customer_email}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-300">
                                            {customer.total_orders}
                                        </td>
                                        <td className="px-4 py-3 text-emerald-400 font-bold">
                                            {formatPrice(customer.total_spent)}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-500 text-sm">
                                            {customer.days_since_last_order}일 전
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
