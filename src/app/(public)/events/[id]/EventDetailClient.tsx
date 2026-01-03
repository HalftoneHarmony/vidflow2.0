/**
 * 🛒 EventDetailClient Component
 * 패키지 선택 및 결제 진행을 위한 클라이언트 컴포넌트
 *
 * @author Dealer (The Salesman)
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PackageWithShowcase } from "@/features/showcase/queries";
import { PackageCard } from "@/features/showcase/components";
import { createOrder } from "@/features/orders/actions";

type EventDetailClientProps = {
    packages: PackageWithShowcase[];
    eventId: number;
    isActive: boolean;
};

// 가상의 추가 옵션 (나중에 DB화 가능)
const EXTRA_OPTIONS = [
    { id: "4k_upgrade", name: "4K 화질 업그레이드", price: 30000 },
    { id: "rush_edit", name: "24시간 내 긴급 편집", price: 50000 },
];

/**
 * 가격 포맷터
 */
function formatPrice(price: number): string {
    return new Intl.NumberFormat("ko-KR", {
        style: "currency",
        currency: "KRW",
        maximumFractionDigits: 0,
    }).format(price);
}

export function EventDetailClient({
    packages,
    eventId,
    isActive,
}: EventDetailClientProps) {
    const router = useRouter();
    const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
    const [isProcessing, setIsProcessing] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // 현재 사용자 확인
    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            setUserId(data.user?.id || null);
        });
    }, []);

    const selectedPackage = packages.find((pkg) => pkg.id === selectedPackageId);

    // 옵션 선택 토글
    const toggleOption = (optionId: string) => {
        const newSet = new Set(selectedOptions);
        if (newSet.has(optionId)) {
            newSet.delete(optionId);
        } else {
            newSet.add(optionId);
        }
        setSelectedOptions(newSet);
    };

    // 총 결제 금액 계산
    const calculateTotal = () => {
        if (!selectedPackage) return 0;
        let total = selectedPackage.price;
        selectedOptions.forEach((optId) => {
            const option = EXTRA_OPTIONS.find((o) => o.id === optId);
            if (option) total += option.price;
        });
        return total;
    };

    const handlePackageSelect = (packageId: number) => {
        setSelectedPackageId((prev) => (prev === packageId ? null : packageId));
        setSelectedOptions(new Set()); // 패키지 변경 시 옵션 초기화
    };

    const handleProceedToPayment = async () => {
        if (!selectedPackage || !userId) {
            if (!userId) alert("로그인이 필요합니다.");
            return;
        }

        setIsProcessing(true);

        try {
            const amount = calculateTotal();

            // 1. PortOne 결제 요청 (Client Side)
            // IMPLEMENTATION NOTREADY: PortOne SDK Integration
            // const paymentResponse = await PortOne.requestPayment({ ... });

            // MOCK: 결제 성공 시뮬레이션
            const mockPaymentId = `imp_${Date.now()}`;
            console.log("[Dealer] MOCK Payment Success:", mockPaymentId);

            // 2. 주문 생성 (Server Action)
            const result = await createOrder({
                userId,
                eventId,
                packageId: selectedPackage.id,
                paymentId: mockPaymentId,
                amount,
            });

            if (result.success) {
                alert("주문이 성공적으로 완료되었습니다! 마이페이지로 이동합니다.");
                router.push("/my-page");
            } else {
                alert(`주문 생성 실패: ${result.error}`);
            }

        } catch (error) {
            console.error("Payment failed", error);
            alert("결제 처리 중 오류가 발생했습니다.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            {/* 패키지 목록 (왼쪽 2/3) */}
            <div className="lg:col-span-2 space-y-8">
                <div className="grid sm:grid-cols-2 gap-6">
                    {packages.map((pkg) => (
                        <PackageCard
                            key={pkg.id}
                            package_={pkg}
                            isSelected={selectedPackageId === pkg.id}
                            onSelect={handlePackageSelect}
                        />
                    ))}
                </div>

                {/* 추가 옵션 선택 (패키지 선택 시에만 표시) */}
                {selectedPackage && (
                    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg animate-in fade-in slide-in-from-top-4">
                        <h3 className="text-lg font-bold text-white mb-4">추가 옵션</h3>
                        <div className="space-y-3">
                            {EXTRA_OPTIONS.map((option) => (
                                <label
                                    key={option.id}
                                    className={`
                    flex items-center justify-between p-4 border rounded cursor-pointer transition-all
                    ${selectedOptions.has(option.id)
                                            ? "bg-zinc-800 border-red-500/50"
                                            : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"}
                  `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`
                       w-5 h-5 rounded border flex items-center justify-center
                       ${selectedOptions.has(option.id) ? "bg-red-500 border-red-500" : "border-zinc-600"}
                     `}>
                                            {selectedOptions.has(option.id) && (
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                            )}
                                        </div>
                                        <span className="text-zinc-300 font-medium">{option.name}</span>
                                    </div>
                                    <span className="text-zinc-400">+{option.price.toLocaleString()}원</span>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedOptions.has(option.id)}
                                        onChange={() => toggleOption(option.id)}
                                    />
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 주문 요약 (오른쪽 1/3) */}
            <div className="lg:col-span-1">
                <div className="sticky top-8">
                    <div className="bg-zinc-900 border border-zinc-800 p-6">
                        <h3 className="text-lg font-bold text-white mb-6 pb-4 border-b border-zinc-800">
                            주문 요약
                        </h3>

                        {selectedPackage ? (
                            <>
                                {/* 선택된 패키지 정보 */}
                                <div className="mb-4">
                                    <div className="text-sm text-zinc-500 mb-1">선택한 패키지</div>
                                    <div className="flex justify-between items-baseline">
                                        <div className="text-xl font-bold text-white">{selectedPackage.name}</div>
                                        <div className="text-zinc-400">{formatPrice(selectedPackage.price)}</div>
                                    </div>
                                </div>

                                {/* 선택된 옵션 정보 */}
                                {selectedOptions.size > 0 && (
                                    <div className="mb-4 pb-4 border-b border-zinc-800/50">
                                        <div className="text-sm text-zinc-500 mb-2">추가 옵션</div>
                                        <ul className="space-y-2">
                                            {Array.from(selectedOptions).map((optId) => {
                                                const opt = EXTRA_OPTIONS.find(o => o.id === optId);
                                                return opt ? (
                                                    <li key={opt.id} className="flex justify-between text-sm text-zinc-300">
                                                        <span>{opt.name}</span>
                                                        <span>+{opt.price.toLocaleString()}</span>
                                                    </li>
                                                ) : null;
                                            })}
                                        </ul>
                                    </div>
                                )}

                                {/* 구성 요소 */}
                                <div className="mb-6">
                                    <div className="text-sm text-zinc-500 mb-2">기본 포함 항목</div>
                                    <ul className="space-y-2">
                                        {selectedPackage.composition.map((item) => (
                                            <li
                                                key={item}
                                                className="flex items-center gap-2 text-sm text-zinc-300"
                                            >
                                                <svg
                                                    className="w-4 h-4 text-red-500 flex-shrink-0"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                <span>{item.replace(/_/g, " ")}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* 가격 */}
                                <div className="flex items-center justify-between py-4 border-t border-zinc-800 mb-6">
                                    <span className="text-zinc-400">최종 결제 금액</span>
                                    <span className="text-3xl font-black text-red-500">
                                        {formatPrice(calculateTotal())}
                                    </span>
                                </div>

                                {/* 결제 버튼 */}
                                <button
                                    onClick={handleProceedToPayment}
                                    disabled={!isActive || selectedPackage.is_sold_out || isProcessing || !userId}
                                    className={`
                    w-full py-4 font-bold text-lg uppercase tracking-wider transition-all relative
                    ${isActive && !selectedPackage.is_sold_out && !isProcessing && userId
                                            ? "bg-red-500 text-white hover:bg-red-600 active:scale-[0.98]"
                                            : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                                        }
                  `}
                                >
                                    {isProcessing ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            처리중...
                                        </span>
                                    ) : !isActive ? (
                                        "판매 종료"
                                    ) : selectedPackage.is_sold_out ? (
                                        "품절"
                                    ) : !userId ? (
                                        "로그인 필요"
                                    ) : (
                                        "결제하기"
                                    )}
                                </button>

                                {/* 안내 문구 */}
                                <p className="text-xs text-zinc-600 text-center mt-4">
                                    {userId
                                        ? "결제 완료 후 마이페이지에서 진행 상황을 확인하세요"
                                        : "주문하려면 먼저 로그인이 필요합니다"}
                                </p>
                            </>
                        ) : (
                            /* 패키지 미선택 상태 */
                            <div className="text-center py-8">
                                <div className="text-6xl mb-4 opacity-30">👆</div>
                                <p className="text-zinc-500">
                                    구매할 패키지를
                                    <br />
                                    선택해 주세요
                                </p>
                            </div>
                        )}
                    </div>

                    {/* 추가 안내 */}
                    <div className="mt-4 p-4 bg-zinc-900/50 border border-zinc-800/50">
                        <div className="flex items-start gap-3">
                            <svg
                                className="w-5 h-5 text-zinc-600 flex-shrink-0 mt-0.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <p className="text-xs text-zinc-600">
                                결제 후 7일 이내 미착수 시 전액 환불 가능합니다.
                                작업 시작 후에는 환불이 불가합니다.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EventDetailClient;
