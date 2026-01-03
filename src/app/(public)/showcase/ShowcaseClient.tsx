/**
 * ✨ Showcase Client Component
 * 비교 플레이어 및 패키지 갤러리 인터랙션
 *
 * @author Dealer (The Salesman)
 */
"use client";

import { useState } from "react";
import { PackageWithShowcase, ShowcaseItem } from "@/features/showcase/queries";
import { ComparisonPlayer, PackageCard } from "@/features/showcase/components";

type ShowcaseClientProps = {
    eventName: string;
    packages: PackageWithShowcase[];
};

export function ShowcaseClient({ eventName, packages }: ShowcaseClientProps) {
    // 비교할 두 개의 패키지 선택 상태 (기본값: 첫 번째와 두 번째 패키지)
    // 패키지가 하나뿐이면 비교 불가 처리
    const sortedPackages = [...packages].sort((a, b) => a.price - b.price);

    const [leftPackageId, setLeftPackageId] = useState<number>(sortedPackages[0]?.id || 0);
    const [rightPackageId, setRightPackageId] = useState<number>(
        sortedPackages.length > 1 ? sortedPackages[1].id : sortedPackages[0]?.id || 0
    );

    const leftPackage = packages.find(p => p.id === leftPackageId);
    const rightPackage = packages.find(p => p.id === rightPackageId);

    // 각 패키지의 대표 영상(Best Cut) 추출
    const getBestVideo = (pkg?: PackageWithShowcase): ShowcaseItem | undefined => {
        return pkg?.showcase_items.find(item => item.type === "VIDEO" && item.is_best_cut)
            || pkg?.showcase_items.find(item => item.type === "VIDEO");
    };

    const leftVideo = getBestVideo(leftPackage);
    const rightVideo = getBestVideo(rightPackage);

    const canCompare = leftVideo && rightVideo && leftPackageId !== rightPackageId;

    return (
        <div className="space-y-16">
            {/* 1. 비교 플레이어 섹션 */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="w-2 h-8 bg-red-500 rounded-sm"></span>
                        Quality Comparison
                    </h2>
                    <div className="text-sm text-zinc-500">
                        {eventName}
                    </div>
                </div>

                {canCompare ? (
                    <ComparisonPlayer
                        leftItem={leftVideo}
                        rightItem={rightVideo}
                        leftLabel={leftPackage?.name}
                        rightLabel={rightPackage?.name}
                    />
                ) : (
                    <div className="aspect-video bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center text-zinc-500">
                        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <p className="text-lg font-medium">비교할 영상이 충분하지 않습니다</p>
                        <p className="text-sm">서로 다른 두 패키지의 영상 데이터가 필요합니다.</p>
                    </div>
                )}

                {/* 비교 패키지 선택 컨트롤러 */}
                <div className="grid grid-cols-2 gap-8 p-6 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                    {/* 왼쪽 선택 */}
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Left Screen</label>
                        <select
                            value={leftPackageId}
                            onChange={(e) => setLeftPackageId(Number(e.target.value))}
                            className="w-full bg-zinc-950 border border-zinc-700 text-white p-3 rounded focus:border-red-500 focus:outline-none"
                        >
                            {sortedPackages.map(pkg => (
                                <option key={pkg.id} value={pkg.id} disabled={pkg.id === rightPackageId}>
                                    {pkg.name} - {pkg.price.toLocaleString()}원
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 오른쪽 선택 */}
                    <div className="text-right">
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Right Screen</label>
                        <select
                            value={rightPackageId}
                            onChange={(e) => setRightPackageId(Number(e.target.value))}
                            className="w-full bg-zinc-950 border border-zinc-700 text-white p-3 rounded focus:border-red-500 focus:outline-none text-right"
                            dir="rtl"
                        >
                            {sortedPackages.map(pkg => (
                                <option key={pkg.id} value={pkg.id} disabled={pkg.id === leftPackageId}>
                                    {pkg.name} - {pkg.price.toLocaleString()}원
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* 2. 전체 패키지 라인업 */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="w-2 h-8 bg-zinc-700 rounded-sm"></span>
                    All Packages
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedPackages.map(pkg => (
                        <PackageCard
                            key={pkg.id}
                            package_={pkg}
                            onSelect={() => {/* 쇼케이스에서는 선택 시 상세 페이지로 이동하도록 할 수도 있음 */ }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
