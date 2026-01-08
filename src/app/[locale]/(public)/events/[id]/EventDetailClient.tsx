/**
 * 🛒 EventDetailClient Component
 * 패키지 선택 및 결제 진행을 위한 클라이언트 컴포넌트
 *
 * @author Dealer (The Salesman)
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as PortOne from "@portone/browser-sdk/v2";
import { motion, AnimatePresence, animate } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { PackageWithShowcase } from "@/features/showcase/queries";
import { PackageCard } from "@/features/showcase/components";
import { verifyAndCreateOrder } from "@/features/orders/actions";
import { PORTONE_CONFIG } from "@/lib/portone";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";

type EventDetailClientProps = {
    packages: PackageWithShowcase[];
    eventId: number;
    isActive: boolean;
    disciplines: string[];
};

// 가상의 추가 옵션 (나중에 DB화 가능)
const EXTRA_OPTIONS = [
    { id: "4k_upgrade", price: 30000 },
    { id: "rush_edit", price: 50000 },
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


/**
 * Animated Number Component
 */
function AnimatedPrice({ value }: { value: number }) {
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
        const controls = { value: displayValue };
        const unsubscribe = animate(displayValue, value, {
            duration: 0.5,
            ease: "circOut",
            onUpdate: (latest: number) => {
                setDisplayValue(Math.round(latest));
            }
        });
        return () => unsubscribe.stop();
    }, [value]);

    return (
        <span className="tabular-nums">
            {formatPrice(displayValue)}
        </span>
    );
}

export function EventDetailClient({
    packages,
    eventId,
    isActive,
    disciplines,
}: EventDetailClientProps) {
    const t = useTranslations("EventDetail");
    const router = useRouter();
    const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
    const [selectedDiscipline, setSelectedDiscipline] = useState<string>("");
    const [athleteNumber, setAthleteNumber] = useState<string>("");
    const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
    const [isProcessing, setIsProcessing] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    // 현재 사용자 확인
    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            setUserId(data.user?.id || null);
            setUserEmail(data.user?.email || null);
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
        setSelectedDiscipline(""); // 패키지 변경 시 종목 초기화
        setAthleteNumber(""); // 패키지 변경 시 선수번호 초기화
    };

    const handleProceedToPayment = async () => {
        if (!selectedPackage || !userId) {
            if (!userId) alert(t("alert_login"));
            return;
        }

        if (disciplines.length > 0 && !selectedDiscipline) {
            alert(t("alert_discipline"));
            return;
        }

        if (!PORTONE_CONFIG.STORE_ID || !PORTONE_CONFIG.CHANNEL_KEY) {
            alert(t("alert_config"));
            console.error("Missing PortOne Config");
            return;
        }

        setIsProcessing(true);

        try {
            const totalAmount = calculateTotal();
            const paymentId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

            // 1. PortOne 결제 요청 (Client Side)
            const response = await PortOne.requestPayment({
                storeId: PORTONE_CONFIG.STORE_ID,
                channelKey: PORTONE_CONFIG.CHANNEL_KEY,
                paymentId: paymentId,
                orderName: selectedPackage.name,
                totalAmount: totalAmount,
                currency: "CURRENCY_KRW",
                payMethod: "CARD",
                customer: {
                    fullName: userEmail?.split("@")[0], // 이름 정보가 없으므로 이메일 아이디 사용
                    email: userEmail || undefined,
                    phoneNumber: "010-0000-0000", // 필수일 수 있으므로 더미 데이터 (실제론 사용자 프로필에서 가져와야 함)
                },
                customData: {
                    userId,
                    eventId,
                    packageId: selectedPackage.id,
                    options: Array.from(selectedOptions),
                    discipline: selectedDiscipline,
                    athleteNumber: athleteNumber,
                },
            });

            if (!response) {
                console.error("PortOne payment request returned no response.");
                alert(t("alert_payment_error"));
                setIsProcessing(false);
                return;
            }

            // 2. 결제 에러 처리
            if (response.code != null) {
                // 결제 실패 또는 취소
                console.warn("Payment failed/cancelled:", response);
                alert(`${t("alert_cancel")}\n${response.message}`);
                setIsProcessing(false);
                return;
            }

            // 3. 결제 성공 -> 서버 검증 및 주문 생성
            const result = await verifyAndCreateOrder(
                response.paymentId,
                userId,
                eventId,
                selectedPackage.id,
                totalAmount,
                selectedDiscipline || undefined,
                athleteNumber || undefined
            );

            if (result.success) {
                alert(t("alert_success"));
                router.push("/my-page");
            } else {
                alert(`Error: ${result.message}`);
            }

        } catch (error) {
            console.error("Payment Exception:", error);
            alert(t("alert_payment_error"));
        } finally {
            setIsProcessing(false);
        }
    };

    // Sticky Bar Visibility
    const [showStickyBar, setShowStickyBar] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            if (scrollY > 300) {
                setShowStickyBar(true);
            } else {
                setShowStickyBar(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const getOptionName = (id: string) => {
        if (id === "4k_upgrade") return t("extra_4k");
        if (id === "rush_edit") return t("extra_rush");
        return id;
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
                        <h3 className="text-lg font-bold text-white mb-4">{t("label_options")}</h3>
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
                                        <span className="text-zinc-300 font-medium">{getOptionName(option.id)}</span>
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

                {/* Discipline Selection - 클릭 버튼 형태 */}
                {selectedPackage && disciplines.length > 0 && (
                    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg animate-in fade-in slide-in-from-top-4 mt-6">
                        <h3 className="text-lg font-bold text-white mb-4">{t("label_discipline")}</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {disciplines.map((d) => (
                                <button
                                    key={d}
                                    type="button"
                                    onClick={() => setSelectedDiscipline(selectedDiscipline === d ? "" : d)}
                                    className={`
                                        p-4 border rounded-lg text-center font-medium transition-all
                                        ${selectedDiscipline === d
                                            ? "bg-red-500/20 border-red-500 text-red-400"
                                            : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-900"
                                        }
                                    `}
                                >
                                    <span className="block text-sm">{d}</span>
                                    {selectedDiscipline === d && (
                                        <svg className="w-4 h-4 mx-auto mt-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                        <p className="text-sm text-zinc-500 mt-3">
                            {t("hint_discipline")}
                        </p>
                    </div>
                )}

                {/* Athlete Number Input - 선수 번호 입력 */}
                {selectedPackage && (
                    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg animate-in fade-in slide-in-from-top-4 mt-6">
                        <h3 className="text-lg font-bold text-white mb-4">{t("label_athlete_no")}</h3>
                        <div className="space-y-3">
                            <Input
                                type="text"
                                inputMode="numeric"
                                placeholder={t("placeholder_athlete_no")}
                                value={athleteNumber}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9]/g, "");
                                    setAthleteNumber(value);
                                }}
                                className="w-full bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                            />
                            <p className="text-sm text-zinc-500">
                                {t("hint_athlete_no")}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* 주문 요약 (오른쪽 1/3) */}
            <div className="lg:col-span-1">
                <div className="sticky top-8">
                    <div className="bg-zinc-900 border border-zinc-800 p-6">
                        <h3 className="text-lg font-bold text-white mb-6 pb-4 border-b border-zinc-800">
                            {t("summary_title")}
                        </h3>

                        {selectedPackage ? (
                            <>
                                {/* 선택된 패키지 정보 */}
                                <div className="mb-4">
                                    <div className="text-sm text-zinc-500 mb-1">{t("summary_package")}</div>
                                    <div className="flex justify-between items-baseline">
                                        <div className="text-xl font-bold text-white">{selectedPackage.name}</div>
                                        <div className="text-zinc-400">{formatPrice(selectedPackage.price)}</div>
                                    </div>
                                </div>

                                {/* 선택된 종목 정보 */}
                                {selectedDiscipline && (
                                    <div className="mb-4">
                                        <div className="text-sm text-zinc-500 mb-1">{t("summary_discipline")}</div>
                                        <div className="text-lg font-bold text-white">{selectedDiscipline}</div>
                                    </div>
                                )}

                                {/* 선수 번호 정보 */}
                                {athleteNumber && (
                                    <div className="mb-4">
                                        <div className="text-sm text-zinc-500 mb-1">{t("summary_athlete_no")}</div>
                                        <div className="text-lg font-bold text-red-400">#{athleteNumber}</div>
                                    </div>
                                )}

                                {/* 선택된 옵션 정보 */}
                                {selectedOptions.size > 0 && (
                                    <div className="mb-4 pb-4 border-b border-zinc-800/50">
                                        <div className="text-sm text-zinc-500 mb-2">{t("summary_options")}</div>
                                        <ul className="space-y-2">
                                            {Array.from(selectedOptions).map((optId) => {
                                                const opt = EXTRA_OPTIONS.find(o => o.id === optId);
                                                return opt ? (
                                                    <li key={opt.id} className="flex justify-between text-sm text-zinc-300">
                                                        <span>{getOptionName(opt.id)}</span>
                                                        <span>+{opt.price.toLocaleString()}</span>
                                                    </li>
                                                ) : null;
                                            })}
                                        </ul>
                                    </div>
                                )}

                                {/* 구성 요소 */}
                                <div className="mb-6">
                                    <div className="text-sm text-zinc-500 mb-2">{t("summary_inc")}</div>
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
                                    <span className="text-zinc-400">{t("label_total")}</span>
                                    <span className="text-3xl font-black text-red-500">
                                        {formatPrice(calculateTotal())}
                                    </span>
                                </div>

                                {/* 결제 버튼 */}
                                <button
                                    onClick={handleProceedToPayment}
                                    disabled={!isActive || selectedPackage.is_sold_out || isProcessing || !userId || (disciplines.length > 0 && !selectedDiscipline)}
                                    className={`
                    w-full py-4 font-bold text-lg uppercase tracking-wider transition-all relative
                    ${isActive && !selectedPackage.is_sold_out && !isProcessing && userId && (!disciplines.length || selectedDiscipline)
                                            ? "bg-red-500 text-white hover:bg-red-600 active:scale-[0.98]"
                                            : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                                        }
                  `}
                                >
                                    {isProcessing ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            {t("btn_processing")}
                                        </span>
                                    ) : !isActive ? (
                                        t("status_ended")
                                    ) : selectedPackage.is_sold_out ? (
                                        t("btn_sold_out")
                                    ) : !userId ? (
                                        t("btn_login_req")
                                    ) : (disciplines.length > 0 && !selectedDiscipline) ? (
                                        t("btn_select_discipline")
                                    ) : (
                                        t("btn_pay")
                                    )}
                                </button>

                                {/* 안내 문구 */}
                                <p className="text-xs text-zinc-600 text-center mt-4">
                                    {userId
                                        ? t("hint_pay_success")
                                        : t("hint_login_req")}
                                </p>
                            </>
                        ) : (
                            /* 패키지 미선택 상태 */
                            <div className="text-center py-8">
                                <div className="text-6xl mb-4 opacity-30">👆</div>
                                <p className="text-zinc-500" dangerouslySetInnerHTML={{ __html: t("empty_selection_title") }} />
                            </div>
                        )}
                    </div>

                    {/* 추가 안내 */}
                    <div className="mt-4 p-4 bg-zinc-900/50 border border-zinc-800/50">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-zinc-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xs text-zinc-600">
                                {t("refund_policy")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Action Bar */}
            <AnimatePresence>
                {showStickyBar && selectedPackage && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-md border-t border-zinc-800 p-4 z-50 safe-area-bottom"
                    >
                        <div className="container mx-auto max-w-7xl flex items-center justify-between gap-4">
                            <div className="hidden sm:block">
                                <div className="text-sm text-zinc-400">{t("summary_package")}</div>
                                <div className="font-bold text-white">{selectedPackage.name}</div>
                            </div>

                            <div className="flex items-center gap-6 flex-1 sm:flex-none justify-end">
                                <div className="text-right mr-2">
                                    <div className="text-xs text-zinc-500">{t("label_total")}</div>
                                    <div className="text-xl font-black text-red-500">
                                        <AnimatedPrice value={calculateTotal()} />
                                    </div>
                                </div>
                                <button
                                    onClick={handleProceedToPayment}
                                    disabled={!isActive || selectedPackage.is_sold_out || isProcessing || !userId || (disciplines.length > 0 && !selectedDiscipline)}
                                    className="bg-red-600 text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider hover:bg-red-500 disabled:bg-zinc-700 disabled:cursor-not-allowed transition-colors shadow-lg shadow-red-900/20"
                                >
                                    {isProcessing ? t("btn_processing") : t("btn_pay")}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default EventDetailClient;
