"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { resetPassword, type PasswordActionState } from "../password-actions";
import { Button } from "@/components/ui/button";
import { PremiumInput } from "@/components/ui/premium-input";
import { Lock, Loader2, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";

const initialState: PasswordActionState = {};

export function ResetPasswordForm() {
    const [state, formAction, isPending] = useActionState(resetPassword, initialState);
    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            const timer = setTimeout(() => {
                router.push("/login");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [state.success, router]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md mx-auto"
        >
            <div className="mb-8 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="inline-block p-4 bg-red-500/10 rounded-full border border-red-500/20 mb-4"
                >
                    <Lock className="w-8 h-8 text-red-500" />
                </motion.div>
                <h1 className="text-3xl font-bold text-white mb-2">새 비밀번호 설정</h1>
                <p className="text-zinc-400">
                    안전한 새 비밀번호를 입력해주세요.
                </p>
            </div>

            {state.success ? (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-6 text-center"
                >
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                    <p className="text-emerald-400 font-medium mb-2">{state.message}</p>
                    <p className="text-zinc-400 text-sm">3초 후 로그인 페이지로 이동합니다...</p>
                </motion.div>
            ) : (
                <form action={formAction} className="space-y-6">
                    <PremiumInput
                        name="password"
                        type="password"
                        label="새 비밀번호"
                        icon={Lock}
                        required
                        autoComplete="new-password"
                        placeholder="영문 대소문자, 숫자 포함 8자 이상"
                        disabled={isPending}
                    />

                    <PremiumInput
                        name="passwordConfirm"
                        type="password"
                        label="새 비밀번호 확인"
                        icon={Lock}
                        required
                        autoComplete="new-password"
                        placeholder="비밀번호를 다시 입력하세요"
                        disabled={isPending}
                    />

                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                        <p className="text-xs text-zinc-400 mb-2">비밀번호 요구사항:</p>
                        <ul className="text-xs text-zinc-500 space-y-1">
                            <li>• 최소 8자 이상</li>
                            <li>• 영문 대문자 포함</li>
                            <li>• 영문 소문자 포함</li>
                            <li>• 숫자 포함</li>
                        </ul>
                    </div>

                    {state.error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm"
                        >
                            {state.error}
                        </motion.div>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                비밀번호 재설정 중...
                            </>
                        ) : (
                            <>
                                <Lock className="w-5 h-5 mr-2" />
                                비밀번호 재설정
                            </>
                        )}
                    </Button>
                </form>
            )}
        </motion.div>
    );
}
