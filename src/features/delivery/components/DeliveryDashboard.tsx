"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, CheckCircle2, AlertTriangle } from "lucide-react";

interface DeliveryStats {
    total: number;
    pending: number; // 링크 미등록
    valid: number;   // 전송 대기 (링크 등록됨)
    invalid: number; // 오류
    downloaded: number; // 수령 완료
}

export function DeliveryDashboard({ stats }: { stats: DeliveryStats }) {
    return (
        <div className="grid gap-4 md:grid-cols-4 mb-8">
            {/* Total Deliverables */}
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">Total Deliverables</CardTitle>
                    <Package className="h-4 w-4 text-zinc-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">{stats.total}</div>
                    <p className="text-xs text-zinc-500">Tracked items</p>
                </CardContent>
            </Card>

            {/* Pending Links (Require Action) */}
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-amber-500">Links Missing</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">{stats.pending}</div>
                    <p className="text-xs text-zinc-500">Needs attention</p>
                </CardContent>
            </Card>

            {/* Ready for Pickup */}
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-500">Ready for Pickup</CardTitle>
                    <Truck className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">{stats.valid - stats.downloaded}</div>
                    <p className="text-xs text-zinc-500">Sent to customers</p>
                </CardContent>
            </Card>

            {/* Received (Downloaded) */}
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-500">Received</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">{stats.downloaded}</div>
                    <p className="text-xs text-zinc-500">Confirmed downloads</p>
                </CardContent>
            </Card>
        </div>
    );
}
