/**
 * 📦 PackageCard Component
 * 패키지 카드 UI - "Heavy Metal" 디자인 적용
 *
 * @author Dealer (The Salesman)
 */
"use client";

import { PackageWithShowcase } from "../queries";

type PackageCardProps = {
    package_: PackageWithShowcase;
    isSelected?: boolean;
    onSelect?: (packageId: number) => void;
};

/**
 * 가격 포맷터 (한국 원화)
 */
function formatPrice(price: number): string {
    return new Intl.NumberFormat("ko-KR", {
        style: "currency",
        currency: "KRW",
        maximumFractionDigits: 0,
    }).format(price);
}

/**
 * 패키지 구성 요소 아이콘 매핑
 */
const COMPOSITION_ICONS: Record<string, string> = {
    MAIN_VIDEO: "🎬",
    SHORTS: "📱",
    PHOTO_ZIP: "📸",
    HIGHLIGHT: "✨",
    RAW_FOOTAGE: "🎥",
};

export function PackageCard({ package_, isSelected, onSelect }: PackageCardProps) {
    const bestCutMedia = package_.showcase_items.find((item) => item.is_best_cut);

    return (
        <div
            onClick={() => !package_.is_sold_out && onSelect?.(package_.id)}
            className={`
        relative group cursor-pointer 
        bg-zinc-900 border-2 transition-all duration-300
        ${isSelected
                    ? "border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.3)]"
                    : "border-zinc-800 hover:border-zinc-600"
                }
        ${package_.is_sold_out ? "opacity-50 cursor-not-allowed" : ""}
      `}
        >
            {/* 썸네일 / 미디어 영역 */}
            <div className="relative aspect-video bg-zinc-950 overflow-hidden">
                {bestCutMedia?.thumbnail_url ? (
                    <img
                        src={bestCutMedia.thumbnail_url}
                        alt={package_.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700">
                        <span className="text-6xl">🎬</span>
                    </div>
                )}

                {/* 재생 오버레이 */}
                {bestCutMedia?.type === "VIDEO" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 rounded-full bg-red-500/90 flex items-center justify-center">
                            <svg
                                className="w-8 h-8 text-white ml-1"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>
                )}

                {/* SOLD OUT 배지 */}
                {package_.is_sold_out && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <span className="text-3xl font-black text-red-500 tracking-wider rotate-[-12deg]">
                            SOLD OUT
                        </span>
                    </div>
                )}

                {/* 선택됨 표시 */}
                {isSelected && (
                    <div className="absolute top-3 right-3">
                        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>

            {/* 정보 영역 */}
            <div className="p-4">
                {/* 패키지명 + 가격 */}
                <div className="flex items-baseline justify-between mb-3">
                    <h3 className="text-xl font-bold text-white tracking-tight">
                        {package_.name}
                    </h3>
                    <span className="text-2xl font-black text-red-500">
                        {formatPrice(package_.price)}
                    </span>
                </div>

                {/* 설명 */}
                {package_.description && (
                    <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                        {package_.description}
                    </p>
                )}

                {/* 구성 요소 태그 */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {package_.composition.map((item) => (
                        <span
                            key={item}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700"
                        >
                            <span>{COMPOSITION_ICONS[item] || "📦"}</span>
                            <span>{item.replace(/_/g, " ")}</span>
                        </span>
                    ))}
                </div>

                {/* 스펙 정보 */}
                {package_.specs && Object.keys(package_.specs).length > 0 && (
                    <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500 border-t border-zinc-800 pt-3">
                        {Object.entries(package_.specs).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                                <span className="uppercase">{key}</span>
                                <span className="text-zinc-300 font-medium">{value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 선택 버튼 (하단) */}
            <div className="p-4 pt-0">
                <button
                    disabled={package_.is_sold_out}
                    className={`
            w-full py-3 font-bold text-sm uppercase tracking-wider transition-all
            ${isSelected
                            ? "bg-red-500 text-white"
                            : "bg-zinc-800 text-zinc-300 hover:bg-red-500 hover:text-white"
                        }
            ${package_.is_sold_out ? "!bg-zinc-800 !text-zinc-600 cursor-not-allowed" : ""}
          `}
                >
                    {package_.is_sold_out ? "품절" : isSelected ? "선택됨 ✓" : "선택하기"}
                </button>
            </div>
        </div>
    );
}

export default PackageCard;
