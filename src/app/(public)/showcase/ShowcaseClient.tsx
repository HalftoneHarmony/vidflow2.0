/**
 * ✨ Showcase Client Component
 * 비교 플레이어 및 패키지 갤러리 인터랙션
 *
 * @author Dealer (The Salesman)
 */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { PackageWithShowcase, ShowcaseItem } from "@/features/showcase/queries";
import { ComparisonPlayer, PackageCard } from "@/features/showcase/components";

type ShowcaseClientProps = {
    eventName: string;
    packages: PackageWithShowcase[];
};

export function ShowcaseClient({ eventName, packages }: ShowcaseClientProps) {
    const sortedPackages = [...packages].sort((a, b) => a.price - b.price);

    // 비교 상태
    const [leftPackageId, setLeftPackageId] = useState<number>(sortedPackages[0]?.id || 0);
    const [rightPackageId, setRightPackageId] = useState<number>(
        sortedPackages.length > 1 ? sortedPackages[1].id : sortedPackages[0]?.id || 0
    );

    const leftPackage = packages.find((p) => p.id === leftPackageId);
    const rightPackage = packages.find((p) => p.id === rightPackageId);

    // 각 패키지의 대표 영상(Best Cut) 추출
    const getBestVideo = (pkg?: PackageWithShowcase): ShowcaseItem | undefined => {
        return (
            pkg?.showcase_items.find((item) => item.type === "VIDEO" && item.is_best_cut) ||
            pkg?.showcase_items.find((item) => item.type === "VIDEO")
        );
    };

    const leftVideo = getBestVideo(leftPackage);
    const rightVideo = getBestVideo(rightPackage);

    const canCompare = leftVideo && rightVideo && leftPackageId !== rightPackageId;

    return (
        <div className="space-y-16">
            {/* 1. 비교 플레이어 섹션 */}
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-white flex items-center gap-3">
                            <span className="w-2 h-8 bg-red-500 rounded-sm"></span>
                            VISUAL QUALITY
                        </h2>
                        <p className="text-zinc-500 mt-1">
                            {eventName} - 직접 눈으로 확인하고 선택하세요.
                        </p>
                    </div>

                    {/* CTA Button */}
                    <Link
                        href={`/events/${leftPackage?.event_id}`}
                        className="group relative inline-flex items-center justify-center px-8 py-3 font-bold text-white transition-all duration-200 bg-red-600 font-lg hover:bg-red-700"
                    >
                        <span>이 퀄리티로 주문하기</span>
                        <svg className="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        <div className="absolute inset-0 border-2 border-white/20 pointer-events-none group-hover:border-white/40"></div>
                    </Link>
                </div>

                {/* 탭 컨트롤러 (비교 대상 선택) */}
                <div className="bg-zinc-900/80 p-6 border border-zinc-800 backdrop-blur-sm rounded-xl">
                    <div className="flex flex-col md:flex-row gap-8 items-center justify-center">

                        {/* LEFT CONTROL */}
                        <div className="w-full md:w-1/3">
                            <label className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase mb-3 tracking-wider">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                Left Screen (A)
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {sortedPackages.map((pkg) => (
                                    <button
                                        key={`left-${pkg.id}`}
                                        onClick={() => setLeftPackageId(pkg.id)}
                                        className={`
                      relative px-4 py-2 text-sm font-bold border transition-all
                      ${leftPackageId === pkg.id
                                                ? "border-red-500 text-white bg-red-500/10"
                                                : "border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"
                                            }
                      ${pkg.id === rightPackageId ? "opacity-50 cursor-not-allowed hidden" : ""}
                    `}
                                        disabled={pkg.id === rightPackageId}
                                    >
                                        {leftPackageId === pkg.id && (
                                            <motion.div
                                                layoutId="active-tab-left"
                                                className="absolute inset-0 bg-red-500/10 border border-red-500"
                                                transition={{ duration: 0.2 }}
                                            />
                                        )}
                                        <span className="relative z-10">{pkg.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="text-zinc-600 font-black text-2xl">VS</div>

                        {/* RIGHT CONTROL */}
                        <div className="w-full md:w-1/3 text-right">
                            <label className="flex items-center justify-end gap-2 text-xs font-bold text-blue-500 uppercase mb-3 tracking-wider">
                                Right Screen (B)
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            </label>
                            <div className="flex flex-wrap gap-2 justify-end">
                                {sortedPackages.map((pkg) => (
                                    <button
                                        key={`right-${pkg.id}`}
                                        onClick={() => setRightPackageId(pkg.id)}
                                        className={`
                      relative px-4 py-2 text-sm font-bold border transition-all
                      ${rightPackageId === pkg.id
                                                ? "border-blue-500 text-white bg-blue-500/10"
                                                : "border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"
                                            }
                      ${pkg.id === leftPackageId ? "opacity-50 cursor-not-allowed hidden" : ""}
                    `}
                                        disabled={pkg.id === leftPackageId}
                                    >
                                        {rightPackageId === pkg.id && (
                                            <motion.div
                                                layoutId="active-tab-right"
                                                className="absolute inset-0 bg-blue-500/10 border border-blue-500"
                                                transition={{ duration: 0.2 }}
                                            />
                                        )}
                                        <span className="relative z-10">{pkg.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Player Area */}
                <div className="relative">
                    <AnimatePresence mode="wait">
                        {canCompare ? (
                            <motion.div
                                key={`${leftPackageId}-${rightPackageId}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ComparisonPlayer
                                    leftItem={leftVideo}
                                    rightItem={rightVideo}
                                    leftLabel={leftPackage?.name}
                                    rightLabel={rightPackage?.name}
                                />
                            </motion.div>
                        ) : (
                            <div className="aspect-video bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center text-zinc-500">
                                <p>영상을 불러올 수 없습니다.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* 2. 전체 패키지 라인업 */}
            <div className="pt-20 border-t border-zinc-900">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-8">
                    <span className="w-2 h-8 bg-zinc-700 rounded-sm"></span>
                    LINE UP
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedPackages.map((pkg) => (
                        <PackageCard
                            key={pkg.id}
                            package_={pkg}
                            onSelect={() => {
                                // 직접 주문 페이지로 이동하는 로직을 추가할 수도 있음
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
