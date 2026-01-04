"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, Link as LinkIcon, ExternalLink, CheckCircle } from "lucide-react";
import { DeliverableWithDetails } from "../queries";
import { verifyLink } from "../actions";
import { LinkInputModal } from "./LinkInputModal";
import { toast } from "sonner";

interface DeliveryTableProps {
    data: DeliverableWithDetails[];
}

export function DeliveryTable({ data }: DeliveryTableProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [isVerifyingAll, setIsVerifyingAll] = useState(false);
    const [verificationProgress, setVerificationProgress] = useState(0); // 0-100

    // 링크 수정 모달 상태
    const [editingDeliverable, setEditingDeliverable] = useState<{
        id: number;
        type: string;
        link: string | null;
    } | null>(null);

    // 검색 필터링
    const filteredData = data.filter((item) => {
        const orderId = item.card?.order?.id?.toString() || "";
        const customerName = item.card?.order?.user?.name?.toLowerCase() || ""; // queries.ts에서 user:profiles join됨
        const packageName = item.card?.order?.package?.name?.toLowerCase() || "";
        const query = searchQuery.toLowerCase();

        return (
            orderId.includes(query) ||
            customerName.includes(query) ||
            packageName.includes(query)
        );
    });

    // 일괄 검증 로직
    const handleVerifyAll = async () => {
        const itemsToCheck = data.filter(d => d.external_link_url); // 링크가 있는 것만
        if (itemsToCheck.length === 0) {
            toast.info("검증할 링크가 없습니다.");
            return;
        }

        setIsVerifyingAll(true);
        setVerificationProgress(0);
        let completed = 0;

        // 병렬 처리 제한 (한 번에 5개씩)
        const batchSize = 5;
        for (let i = 0; i < itemsToCheck.length; i += batchSize) {
            const batch = itemsToCheck.slice(i, i + batchSize);
            await Promise.all(
                batch.map(async (item) => {
                    try {
                        await verifyLink(item.id);
                    } catch (e) {
                        console.error(`Verify failed for ${item.id}`, e);
                    } finally {
                        completed++;
                        setVerificationProgress(Math.round((completed / itemsToCheck.length) * 100));
                    }
                })
            );
        }

        setIsVerifyingAll(false);
        toast.success(`검증 완료: ${completed}개 링크 확인됨`);
        router.refresh();
    };

    const handleVerifySingle = async (id: number) => {
        toast.loading("링크 검증 중...");
        const result = await verifyLink(id);
        toast.dismiss();

        if (result.isValid) {
            toast.success("유효한 링크입니다.");
        } else {
            toast.error(result.errorMessage || "유효하지 않은 링크입니다.");
        }
        router.refresh();
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-900/50 p-4 border border-zinc-800 rounded-lg">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Search order, customer, or package..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-zinc-950 border-zinc-700 text-zinc-100"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    {isVerifyingAll ? (
                        <div className="flex items-center gap-2 min-w-[200px] border border-zinc-700 rounded px-3 py-2 bg-zinc-800">
                            <span className="text-xs text-zinc-400">Verifying...</span>
                            <div className="h-2 flex-1 bg-zinc-700 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${verificationProgress}%` }} />
                            </div>
                            <span className="text-xs font-mono text-zinc-300">{verificationProgress}%</span>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={handleVerifyAll}
                            className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-zinc-300 gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Verify All Links
                        </Button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="border border-zinc-800 rounded-md overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-900/80">
                        <TableRow className="border-zinc-800 hover:bg-zinc-900/80">
                            <TableHead className="text-zinc-400 font-medium">Order ID</TableHead>
                            <TableHead className="text-zinc-400 font-medium">Customer</TableHead>
                            <TableHead className="text-zinc-400 font-medium">Deliverable</TableHead>
                            <TableHead className="text-zinc-400 font-medium">Link Status</TableHead>
                            <TableHead className="text-zinc-400 font-medium text-center">Received</TableHead>
                            <TableHead className="text-zinc-400 font-medium text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                                    No deliverables found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((item) => (
                                <TableRow key={item.id} className="border-zinc-800 hover:bg-zinc-900/30">
                                    <TableCell className="font-mono text-zinc-300">
                                        #{item.card?.order?.id}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-zinc-200">
                                                {/* user 객체가 조인되지 않았을 경우 대비 */}
                                                {(item.card?.order as any)?.user?.name || "Unknown"}
                                            </span>
                                            <span className="text-xs text-zinc-500">
                                                {(item.card?.order as any)?.user?.email || ""}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="border-zinc-700 bg-zinc-800 text-zinc-300 font-mono">
                                                {item.type}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {item.external_link_url ? (
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="secondary"
                                                    className={`
                                                        ${item.link_status === 'VALID' ? 'bg-green-900/20 text-green-400 border-green-900/50' :
                                                            item.link_status === 'INVALID' ? 'bg-red-900/20 text-red-400 border-red-900/50' :
                                                                'bg-amber-900/20 text-amber-400 border-amber-900/50'
                                                        } border
                                                    `}
                                                >
                                                    {item.link_status || "UNCHECKED"}
                                                </Badge>
                                                <span className="text-[10px] text-zinc-600">
                                                    last checked: {item.link_last_checked_at ? new Date(item.link_last_checked_at).toLocaleDateString() : 'Never'}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-zinc-500 italic">No Link</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {item.is_downloaded ? (
                                            <div className="flex flex-col items-center">
                                                <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20 gap-1">
                                                    <CheckCircle className="w-3 h-3" /> Received
                                                </Badge>
                                                {item.first_downloaded_at && (
                                                    <span className="text-[10px] text-zinc-500 mt-1">
                                                        {new Date(item.first_downloaded_at).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-zinc-600">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {item.external_link_url && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleVerifySingle(item.id)}
                                                    title="Re-verify Link"
                                                    className="h-8 w-8 text-zinc-400 hover:text-white"
                                                >
                                                    <RefreshCw className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setEditingDeliverable({
                                                    id: item.id,
                                                    type: item.type,
                                                    link: item.external_link_url
                                                })}
                                                title="Edit Link"
                                                className="h-8 w-8 text-zinc-400 hover:text-white"
                                            >
                                                {item.external_link_url ? <ExternalLink className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Link Input Modal */}
            {editingDeliverable && (
                <LinkInputModal
                    isOpen={!!editingDeliverable}
                    onClose={() => setEditingDeliverable(null)}
                    deliverableId={editingDeliverable.id}
                    deliverableType={editingDeliverable.type}
                    currentLink={editingDeliverable.link}
                    onSuccess={(status) => {
                        toast.success(`Link saved: ${status}`);
                        router.refresh();
                    }}
                />
            )}
        </div>
    );
}
