"use client";

/**
 * 🛡️ LinkInputModal Component
 * Agent 6: Sentinel (The Guardian)
 * 관리자용 외부 링크 입력 모달
 * - 링크 입력 및 유효성 검증
 * - 403/404 링크 저장 거부
 */

import { useState, useTransition } from "react";
import { submitExternalLink, type LinkStatus } from "../actions";

// ===== TYPES =====

type LinkInputModalProps = {
    deliverableId: number;
    deliverableType: string;
    currentLink?: string | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (linkStatus: LinkStatus) => void;
};

// ===== COMPONENT =====

export function LinkInputModal({
    deliverableId,
    deliverableType,
    currentLink,
    isOpen,
    onClose,
    onSuccess,
}: LinkInputModalProps) {
    const [linkUrl, setLinkUrl] = useState(currentLink || "");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

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

    const handleSubmit = () => {
        setError(null);

        // 기본 URL 형식 검증
        try {
            new URL(linkUrl);
        } catch {
            setError("올바른 URL 형식이 아닙니다.");
            return;
        }

        startTransition(async () => {
            const result = await submitExternalLink(deliverableId, linkUrl);

            if (!result.success) {
                setError(result.message);
                return;
            }

            // 성공시 콜백 및 모달 닫기
            if (onSuccess && result.linkStatus) {
                onSuccess(result.linkStatus);
            }
            onClose();
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !isPending) {
            handleSubmit();
        }
        if (e.key === "Escape") {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg bg-zinc-900 border border-zinc-700"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-700 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{getTypeIcon(deliverableType)}</span>
                        <div>
                            <h2 className="font-bold text-white uppercase tracking-wider">
                                외부 링크 등록
                            </h2>
                            <p className="text-sm text-zinc-400">
                                {getTypeLabel(deliverableType)}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white transition-colors"
                    >
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
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-6 space-y-4">
                    {/* 안내 메시지 */}
                    <div className="p-4 bg-zinc-800 border-l-4 border-amber-500">
                        <p className="text-sm text-zinc-300">
                            <strong className="text-amber-400">🛡️ Sentinel 검증</strong><br />
                            등록된 링크는 실시간으로 유효성이 검증됩니다.<br />
                            권한 없음(403) 또는 파일 없음(404) 상태의 링크는 저장이 거부됩니다.
                        </p>
                    </div>

                    {/* 링크 입력 */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2 uppercase tracking-wider">
                            외부 링크 URL
                        </label>
                        <input
                            type="url"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="https://drive.google.com/..."
                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
                            disabled={isPending}
                        />
                    </div>

                    {/* 에러 메시지 */}
                    {error && (
                        <div className="p-4 bg-red-900/30 border border-red-500 text-red-400">
                            <div className="flex items-start gap-2">
                                <span className="text-red-500">❌</span>
                                <span>{error}</span>
                            </div>
                        </div>
                    )}

                    {/* 지원 서비스 안내 */}
                    <div className="text-xs text-zinc-500">
                        <p className="mb-1">지원되는 클라우드 서비스:</p>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-zinc-800 rounded">Google Drive</span>
                            <span className="px-2 py-1 bg-zinc-800 rounded">Dropbox</span>
                            <span className="px-2 py-1 bg-zinc-800 rounded">OneDrive</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-zinc-700 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors uppercase tracking-wider text-sm font-bold"
                        disabled={isPending}
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isPending || !linkUrl.trim()}
                        className="px-6 py-2 bg-red-600 text-white hover:bg-red-500 disabled:bg-zinc-700 disabled:text-zinc-500 transition-colors uppercase tracking-wider text-sm font-bold flex items-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <svg
                                    className="animate-spin h-4 w-4"
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
                                검증 중...
                            </>
                        ) : (
                            <>🔗 링크 저장</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LinkInputModal;
