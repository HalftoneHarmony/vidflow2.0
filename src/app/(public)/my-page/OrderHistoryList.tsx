/**
 * 🧾 Order History List Component
 * 사용자의 주문 내역 및 현재 파이프라인 진행 상태 표시
 * 
 * @author Dealer (The Salesman)
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

// getUserOrders의 반환 타입 추론
// 실제로는 shared type을 쓰는 게 좋지만 여기서는 간단히 정의
type Order = {
    id: number;
    created_at: string;
    amount: number;
    status: "PENDING" | "PAID" | "REFUNDED";
    events: { title: string; event_date: string } | null;
    packages: { name: string } | null;
    pipeline_cards: { stage: string } | { stage: string }[] | null;
};

type OrderHistoryListProps = {
    orders: any[]; // 타입 호환성을 위해 any 사용 (실제로는 위 타입)
};

const STAGE_MAP: Record<string, { label: string; color: string; width: string }> = {
    WAITING: { label: "대기중", color: "bg-zinc-500", width: "10%" },
    SHOOTING: { label: "촬영중", color: "bg-blue-500", width: "30%" },
    EDITING: { label: "편집중", color: "bg-purple-500", width: "60%" },
    READY: { label: "출고대기", color: "bg-yellow-500", width: "80%" },
    DELIVERED: { label: "전송완료", color: "bg-green-500", width: "100%" },
};

export function OrderHistoryList({ orders }: OrderHistoryListProps) {
    if (!orders || orders.length === 0) {
        return (
            <div className="text-center py-20 border border-dashed border-zinc-800 rounded-lg">
                <p className="text-zinc-500 mb-4">주문 내역이 없습니다.</p>
                <Link
                    href="/events"
                    className="inline-flex px-6 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition"
                >
                    대회 목록 보러가기
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {orders.map((order) => {
                // pipeline_cards가 배열인지 단일 객체인지 체크
                const card = Array.isArray(order.pipeline_cards)
                    ? order.pipeline_cards[0]
                    : order.pipeline_cards;

                const stage = card?.stage || "WAITING";
                const stageInfo = STAGE_MAP[stage] || STAGE_MAP["WAITING"];
                const orderDate = new Date(order.created_at);

                return (
                    <div
                        key={order.id}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-all"
                    >
                        {/* 헤더: 주문번호 & 날짜 */}
                        <div className="flex flex-wrap justify-between items-center mb-4 pb-4 border-b border-zinc-800">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-mono text-zinc-500">#{order.id.toString().padStart(6, '0')}</span>
                                <span className="text-sm text-zinc-400">
                                    {format(orderDate, "PPP p", { locale: ko })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 text-xs font-bold rounded ${order.status === "PAID" ? "bg-green-500/10 text-green-500" : "bg-zinc-800 text-zinc-500"
                                    }`}>
                                    {order.status === "PAID" ? "결제완료" : order.status}
                                </span>
                            </div>
                        </div>

                        {/* 본문: 상품 정보 & 진행 상태 */}
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* 상품 정보 */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">
                                    {order.events?.title || "알 수 없는 이벤트"}
                                </h3>
                                <p className="text-red-400 font-medium mb-2">
                                    {order.packages?.name || "패키지 정보 없음"}
                                </p>
                                <p className="text-zinc-500 text-sm">
                                    결제금액: {order.amount.toLocaleString()}원
                                </p>
                            </div>

                            {/* 진행 상태 (Progress Bar) */}
                            <div className="flex flex-col justify-center">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-bold text-white">진행 상황</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${stageInfo.color.replace("bg-", "text-")} bg-white/5`}>
                                        {stageInfo.label}
                                    </span>
                                </div>

                                <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden relative">
                                    <div
                                        className={`h-full ${stageInfo.color} transition-all duration-1000 ease-out relative`}
                                        style={{ width: stageInfo.width }}
                                    >
                                        {/* Shimmer Effect */}
                                        {stage !== "DELIVERED" && (
                                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"
                                                style={{ backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)' }}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between mt-2 text-[10px] text-zinc-600 font-medium uppercase tracking-wider">
                                    <span>Waiting</span>
                                    <span>Shooting</span>
                                    <span>Editing</span>
                                    <span>Ready</span>
                                    <span>Delivered</span>
                                </div>

                                {/* 다운로드 버튼 (DELIVERED 상태일 때만) */}
                                {stage === "DELIVERED" && (
                                    <div className="mt-4 text-right">
                                        <button
                                            onClick={() => alert("다운로드 기능은 준비 중입니다.")}
                                            className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded flex items-center gap-2 ml-auto transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                            결과물 다운로드
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
