/**
 * 🎭 ComparisonPlayer Component
 * Side-by-Side 영상 비교 플레이어 (기초 구조)
 *
 * "Show, Don't Tell" - 텍스트보다 영상이 우선
 *
 * @author Dealer (The Salesman)
 */
"use client";

import { useState, useRef, useEffect } from "react";
import { ShowcaseItem } from "../queries";

type ComparisonPlayerProps = {
    leftItem: ShowcaseItem;
    rightItem: ShowcaseItem;
    leftLabel?: string;
    rightLabel?: string;
};

export function ComparisonPlayer({
    leftItem,
    rightItem,
    leftLabel = "Basic",
    rightLabel = "Pro",
}: ComparisonPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeAudio, setActiveAudio] = useState<"left" | "right">("right");
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const leftVideoRef = useRef<HTMLVideoElement>(null);
    const rightVideoRef = useRef<HTMLVideoElement>(null);

    // 동시 재생/일시정지 제어
    const togglePlayPause = () => {
        if (leftVideoRef.current && rightVideoRef.current) {
            if (isPlaying) {
                leftVideoRef.current.pause();
                rightVideoRef.current.pause();
            } else {
                leftVideoRef.current.play();
                rightVideoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    // 오디오 크로스페이드
    const toggleAudio = (side: "left" | "right") => {
        if (leftVideoRef.current && rightVideoRef.current) {
            if (side === "left") {
                leftVideoRef.current.muted = false;
                rightVideoRef.current.muted = true;
            } else {
                leftVideoRef.current.muted = true;
                rightVideoRef.current.muted = false;
            }
            setActiveAudio(side);
        }
    };

    // 시간 동기화
    useEffect(() => {
        const leftVideo = leftVideoRef.current;
        const rightVideo = rightVideoRef.current;

        const handleTimeUpdate = () => {
            if (leftVideo) {
                setCurrentTime(leftVideo.currentTime);
            }
        };

        const handleLoadedMetadata = () => {
            if (leftVideo) {
                setDuration(leftVideo.duration);
            }
        };

        const syncVideos = () => {
            if (leftVideo && rightVideo) {
                const timeDiff = Math.abs(leftVideo.currentTime - rightVideo.currentTime);
                if (timeDiff > 0.1) {
                    rightVideo.currentTime = leftVideo.currentTime;
                }
            }
        };

        if (leftVideo) {
            leftVideo.addEventListener("timeupdate", handleTimeUpdate);
            leftVideo.addEventListener("loadedmetadata", handleLoadedMetadata);
            leftVideo.addEventListener("timeupdate", syncVideos);
        }

        return () => {
            if (leftVideo) {
                leftVideo.removeEventListener("timeupdate", handleTimeUpdate);
                leftVideo.removeEventListener("loadedmetadata", handleLoadedMetadata);
                leftVideo.removeEventListener("timeupdate", syncVideos);
            }
        };
    }, []);

    // 시간 포맷팅
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    // 프로그레스 바 클릭 핸들러
    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        const newTime = percentage * duration;

        if (leftVideoRef.current && rightVideoRef.current) {
            leftVideoRef.current.currentTime = newTime;
            rightVideoRef.current.currentTime = newTime;
        }
    };

    return (
        <div className="bg-zinc-950 border border-zinc-800">
            {/* 비디오 영역 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-800">
                {/* 왼쪽 비디오 */}
                <div className="relative bg-black aspect-video">
                    <video
                        ref={leftVideoRef}
                        src={leftItem.media_url}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        poster={leftItem.thumbnail_url || undefined}
                    />
                    {/* 라벨 */}
                    <div
                        className={`absolute top-3 left-3 px-3 py-1 text-xs font-bold uppercase tracking-wider ${activeAudio === "left"
                            ? "bg-red-500 text-white"
                            : "bg-zinc-900/80 text-zinc-400"
                            }`}
                    >
                        {leftLabel}
                    </div>
                    {/* 오디오 토글 */}
                    <button
                        onClick={() => toggleAudio("left")}
                        className={`absolute bottom-3 left-3 w-10 h-10 flex items-center justify-center transition-colors ${activeAudio === "left"
                            ? "bg-red-500 text-white"
                            : "bg-zinc-900/80 text-zinc-500 hover:text-white"
                            }`}
                    >
                        {activeAudio === "left" ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* 오른쪽 비디오 */}
                <div className="relative bg-black aspect-video">
                    <video
                        ref={rightVideoRef}
                        src={rightItem.media_url}
                        className="w-full h-full object-cover"
                        muted={activeAudio !== "right"}
                        playsInline
                        poster={rightItem.thumbnail_url || undefined}
                    />
                    {/* 라벨 */}
                    <div
                        className={`absolute top-3 right-3 px-3 py-1 text-xs font-bold uppercase tracking-wider ${activeAudio === "right"
                            ? "bg-red-500 text-white"
                            : "bg-zinc-900/80 text-zinc-400"
                            }`}
                    >
                        {rightLabel}
                    </div>
                    {/* 오디오 토글 */}
                    <button
                        onClick={() => toggleAudio("right")}
                        className={`absolute bottom-3 right-3 w-10 h-10 flex items-center justify-center transition-colors ${activeAudio === "right"
                            ? "bg-red-500 text-white"
                            : "bg-zinc-900/80 text-zinc-500 hover:text-white"
                            }`}
                    >
                        {activeAudio === "right" ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* 컨트롤 바 */}
            <div className="p-4 border-t border-zinc-800">
                <div className="flex items-center gap-4">
                    {/* 재생/일시정지 버튼 */}
                    <button
                        onClick={togglePlayPause}
                        className="w-12 h-12 flex items-center justify-center bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                        {isPlaying ? (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </button>

                    {/* 시간 표시 */}
                    <span className="text-xs text-zinc-500 font-mono w-24">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>

                    {/* 프로그레스 바 */}
                    <div
                        className="flex-1 h-2 bg-zinc-800 cursor-pointer relative group"
                        onClick={handleProgressClick}
                    >
                        <div
                            className="h-full bg-red-500 transition-all"
                            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                        />
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ left: `calc(${(currentTime / duration) * 100 || 0}% - 8px)` }}
                        />
                    </div>

                    {/* 비교 안내 */}
                    <span className="text-xs text-zinc-600 uppercase tracking-wider hidden md:block">
                        ◀ 클릭하여 음소거 전환 ▶
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ComparisonPlayer;
