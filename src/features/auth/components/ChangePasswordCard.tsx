"use client";

import { useActionState } from "react";
import { changePassword, type PasswordActionState } from "../password-actions";
import { Button } from "@/components/ui/button";
import { PremiumInput } from "@/components/ui/premium-input";
import { Lock, Loader2, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const initialState: PasswordActionState = {};

export function ChangePasswordCard() {
    const [state, formAction, isPending] = useActionState(changePassword, initialState);

    return (
        <Card className="bg-zinc-900/30 border-zinc-800 backdrop-blur-sm overflow-hidden group hover:border-zinc-700 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-orange-500/10 rounded-lg border border-orange-500/20">
                        <Shield className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                        <CardTitle className="text-lg text-white normal-case tracking-normal">비밀번호 변경</CardTitle>
                        <CardDescription>계정 보안을 위해 정기적으로 비밀번호를 변경하세요</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="relative">
                <form action={formAction} className="space-y-5">
                    <PremiumInput
                        name="currentPassword"
                        type="password"
                        label="현재 비밀번호"
                        icon={Lock}
                        required
                        autoComplete="current-password"
                        placeholder="현재 사용 중인 비밀번호"
                        disabled={isPending}
                    />

                    <div className="h-px bg-zinc-800 my-6" />

                    <PremiumInput
                        name="newPassword"
                        type="password"
                        label="새 비밀번호"
                        icon={Lock}
                        required
                        autoComplete="new-password"
                        placeholder="영문 대소문자, 숫자 포함 8자 이상"
                        disabled={isPending}
                    />

                    <PremiumInput
                        name="newPasswordConfirm"
                        type="password"
                        label="새 비밀번호 확인"
                        icon={Lock}
                        required
                        autoComplete="new-password"
                        placeholder="새 비밀번호를 다시 입력하세요"
                        disabled={isPending}
                    />

                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                        <p className="text-xs text-zinc-400 mb-2">비밀번호 요구사항:</p>
                        <ul className="text-xs text-zinc-500 space-y-1">
                            <li>• 최소 8자 이상</li>
                            <li>• 영문 대문자 포함</li>
                            <li>• 영문 소문자 포함</li>
                            <li>• 숫자 포함</li>
                            <li>• 현재 비밀번호와 다른 비밀번호</li>
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

                    {state.success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-emerald-400 text-sm"
                        >
                            {state.message}
                        </motion.div>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        disabled={isPending}
                        variant={state.success ? "outline" : "default"}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                비밀번호 변경 중...
                            </>
                        ) : (
                            <>
                                <Lock className="w-5 h-5 mr-2" />
                                비밀번호 변경
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
