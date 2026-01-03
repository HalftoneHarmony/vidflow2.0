"use client";

/**
 * 🛡️ DownloadButton Component
 * Agent 6: Sentinel (The Guardian)
 * 고객용 다운로드 버튼
 * - 클릭 시 다운로드 기록 (first_downloaded_at)
 * - 링크 상태에 따른 UI 변화
 */

import { useState, useTransition } from "react";
import { recordDownload } from "../actions";
import type { LinkStatus } from "../actions";

// ===== TYPES =====

type DownloadButtonProps = {
    deliverableId: number;
    deliverableType: string;
    externalLinkUrl: string | null;
    linkStatus: LinkStatus;
    isDownloaded: boolean;
    firstDownloadedAt?: string | null;
    className?: string;
};

// ===== COMPONENT =====

export function DownloadButton({
    deliverableId,
    deliverableType,
    externalLinkUrl,
    linkStatus,
    isDownloaded: initialDownloaded,
    firstDownloadedAt: initialFirstDownloadedAt,
    className = "",
}: DownloadButtonProps) {
    const [isDownloaded, setIsDownloaded] = useState(initialDownloaded);
    const [firstDownloadedAt, setFirstDownloadedAt] = useState(initialFirstDownloadedAt);
    const [isPending, startTransition] = useTransition();
    const [showToast, setShowToast] = useState(false);

    // 링크 유형별 아이콘
    const getTypeIcon = (type: string) => {
        switch (type) {
            case "MAIN_VIDEO":
                return "🎬";
            case "SHORTS":
                return "📱";
            case "PHOTO_ZIP":
                return "📸";
            case "HIGHLIGHT":
                return "⭐";
            case "RAW":
                return "📁";
            default:
                return "📦";
        }
    };

    // 링크 유형별 라벨
    const getTypeLabel = (type: string) => {
        switch (type) {
            case "MAIN_VIDEO":
                return "메인 영상";
            case "SHORTS":
                return "쇼츠";
            case "PHOTO_ZIP":
                return "사진 압축파일";
            case "HIGHLIGHT":
                return "하이라이트";
            case "RAW":
                return "원본 파일";
            default:
                return type;
        }
    };

    // 상태별 스타일
    const getStatusStyle = () => {
        if (!externalLinkUrl) {
            return {
                bg: "bg-zinc-800",
                text: "text-zinc-500",
                border: "border-zinc-700",
                hover: "",
                cursor: "cursor-not-allowed",
            };
        }
        if (linkStatus === "INVALID") {
            return {
                bg: "bg-red-900/30",
                text: "text-red-400",
                border: "border-red-700",
                hover: "",
                cursor: "cursor-not-allowed",
            };
        }
        if (isDownloaded) {
            return {
                bg: "bg-green-900/30",
                text: "text-green-400",
                border: "border-green-700",
                hover: "hover:bg-green-900/50",
                cursor: "cursor-pointer",
            };
        }
        return {
            bg: "bg-red-600",
            text: "text-white",
            border: "border-red-500",
            hover: "hover:bg-red-500",
            cursor: "cursor-pointer",
        };
    };

    const handleDownload = () => {
        // 링크가 없거나 유효하지 않은 경우 클릭 무시
        if (!externalLinkUrl || linkStatus === "INVALID") {
            return;
        }

        startTransition(async () => {
            // 1. 다운로드 기록 Server Action 호출
            const result = await recordDownload(deliverableId);

            if (result.success) {
                // 2. 로컬 상태 업데이트
                setIsDownloaded(true);
                if (result.isFirstDownload && result.firstDownloadedAt) {
                    setFirstDownloadedAt(result.firstDownloadedAt);
                }

                // 3. 토스트 메시지 표시
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);

                // 4. 새 탭에서 링크 열기
                window.open(externalLinkUrl, "_blank", "noopener,noreferrer");
            }
        });
    };

    const style = getStatusStyle();
    const isDisabled = !externalLinkUrl || linkStatus === "INVALID" || isPending;

    return (
        <div className={`relative ${className}`}>
            {/* 메인 다운로드 버튼 */}
            <button
                onClick={handleDownload}
                disabled={isDisabled}
                className={`
                    w-full flex items-center gap-4 p-4
                    ${style.bg} ${style.text} ${style.border} ${style.hover} ${style.cursor}
                    border transition-all duration-200
                    ${isPending ? "opacity-50" : ""}
                `}
            >
                {/* 아이콘 */}
                <span className="text-3xl">{getTypeIcon(deliverableType)}</span>

                {/* 정보 */}
                <div className="flex-1 text-left">
                    <p className="font-bold uppercase tracking-wider">
                        {getTypeLabel(deliverableType)}
                    </p>
                    <p className="text-sm opacity-70">
                        {!externalLinkUrl && "준비 중..."}
                        {externalLinkUrl && linkStatus === "INVALID" && "⚠️ 링크 오류"}
                        {externalLinkUrl && linkStatus !== "INVALID" && isDownloaded && (
                            <>✅ 다운로드됨</>
                        )}
                        {externalLinkUrl && linkStatus !== "INVALID" && !isDownloaded && (
                            <>다운로드 가능</>
                        )}
                    </p>
                </div>

                {/* 다운로드 아이콘 */}
                {externalLinkUrl && linkStatus !== "INVALID" && (
                    <div className="w-10 h-10 flex items-center justify-center">
                        {isPending ? (
                            <svg
                                className="animate-spin h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                            </svg>
                        )}
                    </div>
                )}
            </button>

            {/* 최초 다운로드 정보 */}
            {firstDownloadedAt && (
                <div className="mt-2 text-xs text-zinc-500 text-right">
                    최초 다운로드: {new Date(firstDownloadedAt).toLocaleString("ko-KR")}
                </div>
            )}

            {/* 성공 토스트 */}
            {showToast && (
                <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-green-900/90 border border-green-500 text-green-400 text-sm text-center animate-fade-in">
                    ✅ 다운로드가 기록되었습니다
                </div>
            )}
        </div>
    );
}

export default DownloadButton;
