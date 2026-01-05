"use client";

import { useActionState } from "react";
import { requestPasswordReset, type PasswordActionState } from "../password-actions";
import { Button } from "@/components/ui/button";
import { PremiumInput } from "@/components/ui/premium-input";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const initialState: PasswordActionState = {};

export function ForgotPasswordForm() {
    const [state, formAction, isPending] = useActionState(requestPasswordReset, initialState);

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
                    <Mail className="w-8 h-8 text-red-500" />
                </motion.div>
                <h1 className="text-3xl font-bold text-white mb-2">비밀번호 찾기</h1>
                <p className="text-zinc-400">
                    가입하신 이메일 주소를 입력하시면<br />
                    비밀번호 재설정 링크를 보내드립니다.
                </p>
            </div>

            {state.success ? (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-6 text-center"
                >
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                    <p className="text-emerald-400 font-medium mb-4">{state.message}</p>
                    <Link href="/login">
                        <Button variant="outline" className="w-full">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            로그인으로 돌아가기
                        </Button>
                    </Link>
                </motion.div>
            ) : (
                <form action={formAction} className="space-y-6">
                    <PremiumInput
                        name="email"
                        type="email"
                        label="이메일"
                        icon={Mail}
                        required
                        autoComplete="email"
                        placeholder="example@vidflow.com"
                        disabled={isPending}
                    />

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
                                전송 중...
                            </>
                        ) : (
                            <>
                                <Mail className="w-5 h-5 mr-2" />
                                재설정 링크 전송
                            </>
                        )}
                    </Button>

                    <div className="text-center">
                        <Link
                            href="/login"
                            className="text-sm text-zinc-400 hover:text-white transition-colors inline-flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            로그인으로 돌아가기
                        </Link>
                    </div>
                </form>
            )}
        </motion.div>
    );
}
