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

    // ... (아이콘/라벨 함수는 동일하므로 생략하거나 유지)
    // 실제 구현 시에는 위쪽 함수들(getTypeIcon, getTypeLabel)이 필요하므로 전체를 교체하는 것이 안전함.
    // 여기서는 전체 교체를 위해 replace_file_content 대신 write_to_file을 고려했으나, 
    // 기존 파일의 helper function들을 유지하고 컴포넌트 내부 로직만 바꾸는 것이 효율적임.
    // 하지만 replace 범위가 크므로 전체 코드를 다시 작성하여 write_to_file 하는 것이 깔끔할 수 있음.
    // 사용자가 replace를 선호하므로 replace로 진행하되, 전체 함수 내용을 교체.

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "MAIN_VIDEO": return "🎬";
            case "SHORTS": return "📱";
            case "PHOTO_ZIP": return "📸";
            case "HIGHLIGHT": return "⭐";
            case "RAW": return "📁";
            default: return "📦";
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "MAIN_VIDEO": return "메인 영상";
            case "SHORTS": return "쇼츠";
            case "PHOTO_ZIP": return "사진 압축파일";
            case "HIGHLIGHT": return "하이라이트";
            case "RAW": return "원본 파일";
            default: return type;
        }
    };

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

    const handleDownloadClick = () => {
        if (!externalLinkUrl || linkStatus === "INVALID") return;

        startTransition(async () => {
            // Fire-and-forget: 다운로드 기록 (await 하지 않아도 됨, 하지만 상태 업데이트를 위해 기다림)
            // 여기서 await를 해도 a 태그의 기본 동작(이동)은 이미 발생했으므로 팝업 차단 안 됨?
            // -> a 태그의 onClick에서 비동기 작업을 수행해도 return false나 e.preventDefault()를 안 하면 이동함.
            // -> 하지만 React의 onClick은 비동기와 상관없이 이벤트 핸들러 종료 후 이동.
            // -> 따라서 기록은 백그라운드로 돌리고 UI만 나중에 업데이트.

            const result = await recordDownload(deliverableId);

            if (result.success) {
                setIsDownloaded(true);
                if (result.isFirstDownload && result.firstDownloadedAt) {
                    setFirstDownloadedAt(result.firstDownloadedAt);
                }
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            }
        });
    };

    const style = getStatusStyle();
    const isDisabled = !externalLinkUrl || linkStatus === "INVALID";
    const href = !isDisabled && externalLinkUrl ? externalLinkUrl : undefined;

    // 공통 내부 콘텐츠
    const innerContent = (
        <>
            <span className="text-3xl">{getTypeIcon(deliverableType)}</span>
            <div className="flex-1 text-left">
                <p className="font-bold uppercase tracking-wider">
                    {getTypeLabel(deliverableType)}
                </p>
                <p className="text-sm opacity-70">
                    {!externalLinkUrl && "준비 중..."}
                    {externalLinkUrl && linkStatus === "INVALID" && "⚠️ 링크 오류"}
                    {externalLinkUrl && linkStatus !== "INVALID" && isDownloaded && "✅ 다운로드됨"}
                    {externalLinkUrl && linkStatus !== "INVALID" && !isDownloaded && "다운로드 가능"}
                </p>
            </div>
            {externalLinkUrl && linkStatus !== "INVALID" && (
                <div className="w-10 h-10 flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                </div>
            )}
        </>
    );

    // Div or Anchor 결정
    if (isDisabled || !href) {
        return (
            <div className={`relative ${className}`}>
                <button
                    disabled
                    className={`
                        w-full flex items-center gap-4 p-4
                        ${style.bg} ${style.text} ${style.border} ${style.hover} ${style.cursor}
                        border transition-all duration-200 opacity-50
                    `}
                >
                    {innerContent}
                </button>
            </div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleDownloadClick}
                className={`
                    w-full flex items-center gap-4 p-4
                    ${style.bg} ${style.text} ${style.border} ${style.hover} ${style.cursor}
                    border transition-all duration-200 block decoration-0
                `}
            >
                {innerContent}
            </a>

            {firstDownloadedAt && (
                <div className="mt-2 text-xs text-zinc-500 text-right">
                    최초 다운로드: {new Date(firstDownloadedAt).toLocaleString("ko-KR")}
                </div>
            )}

            {showToast && (
                <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-green-900/90 border border-green-500 text-green-400 text-sm text-center animate-fade-in z-10">
                    ✅ 다운로드가 기록되었습니다
                </div>
            )}
        </div>
    );
}

export default DownloadButton;
