"use client";

import { useActionState, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { signup } from "../actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Check, X } from "lucide-react";

function SubmitButton({ disabled }: { disabled: boolean }) {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            className="w-full h-12 text-lg font-bold uppercase tracking-wider bg-zinc-100 hover:bg-white text-black rounded-none transition-all duration-200"
            disabled={pending || disabled}
        >
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating...
                </>
            ) : (
                "Create Account"
            )}
        </Button>
    );
}

export function SignUpForm() {
    const [state, formAction] = useActionState(signup, { error: "", message: "" });
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [agreed, setAgreed] = useState(false);

    // Password Validation
    const isMatch = password && confirm && password === confirm;
    const isLength = password.length >= 8;
    const isSecure = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);
    const isValid = isMatch && isLength && isSecure && agreed;

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center lg:text-left">
                <h2 className="text-3xl font-bold font-[family-name:var(--font-oswald)] uppercase tracking-wide text-white">
                    Join the Corps
                </h2>
                <p className="text-zinc-500 font-light">
                    Start your journey with VidFlow.
                </p>
            </div>

            {state?.message ? (
                <div className="p-6 bg-green-950/30 border border-green-900/50 flex flex-col items-center gap-4 animate-fade-up text-center">
                    <div className="w-12 h-12 bg-green-900/50 rounded-full flex items-center justify-center text-green-500">
                        <Check className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-green-500 uppercase tracking-wide">Account Created</h3>
                        <p className="text-green-400/80 text-sm">{state.message}</p>
                    </div>
                    <Link href="/login">
                        <Button variant="outline" className="mt-2 border-green-800 text-green-500 hover:text-green-400 hover:bg-green-950/50">
                            Go to Login
                        </Button>
                    </Link>
                </div>
            ) : (
                <form action={formAction} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest" htmlFor="name">
                            Full Name
                        </label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Jang Starr"
                            required
                            className="h-12 bg-zinc-900/50 border-zinc-800 focus:border-white text-white rounded-none transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest" htmlFor="email">
                            Email Address
                        </label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="agent@vidflow.com"
                            required
                            className="h-12 bg-zinc-900/50 border-zinc-800 focus:border-white text-white rounded-none transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest" htmlFor="password">
                                Password
                            </label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Min 8 chars, Aa1"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`h-12 bg-zinc-900/50 border-zinc-800 text-white rounded-none transition-colors ${password && (!isLength || !isSecure) ? "border-amber-500 focus:border-amber-500" : "focus:border-white"}`}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest" htmlFor="passwordConfirm">
                                Confirm
                            </label>
                            <Input
                                id="passwordConfirm"
                                name="passwordConfirm"
                                type="password"
                                placeholder="Repeat password"
                                required
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                className={`h-12 bg-zinc-900/50 border-zinc-800 text-white rounded-none transition-colors ${confirm && !isMatch ? "border-red-500 focus:border-red-500" : "focus:border-white"}`}
                            />
                        </div>
                    </div>

                    {/* Password Feedback */}
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                        <span className={`flex items-center gap-1 transition-colors ${isLength ? "text-green-500" : "text-zinc-600"}`}>
                            {isLength ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-zinc-600"></div>}
                            8+ Chars
                        </span>
                        <span className={`flex items-center gap-1 transition-colors ${isSecure ? "text-green-500" : "text-zinc-600"}`}>
                            {isSecure ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-zinc-600"></div>}
                            Mix (Aa1)
                        </span>
                        <span className={`flex items-center gap-1 transition-colors ${isMatch && confirm ? "text-green-500" : "text-zinc-600"}`}>
                            {isMatch && confirm ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-zinc-600"></div>}
                            Match
                        </span>
                    </div>

                    {/* Terms Checkbox */}
                    <div className="pt-2 flex items-start gap-3">
                        <div className="flex items-center h-5">
                            <input
                                id="terms"
                                name="terms"
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="w-4 h-4 rounded-none border-zinc-700 bg-zinc-900 text-red-600 focus:ring-red-500 focus:ring-offset-black"
                            />
                        </div>
                        <label htmlFor="terms" className="text-sm text-zinc-400 select-none cursor-pointer">
                            I agree to the <span className="text-white hover:underline">Terms of Service</span> and <span className="text-white hover:underline">Privacy Policy</span>.
                        </label>
                    </div>

                    {state?.error && (
                        <div className="p-3 bg-red-950/30 border border-red-900/50 flex items-center gap-3 animate-fade-up">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <span className="text-sm text-red-400 font-medium">
                                {state.error}
                            </span>
                        </div>
                    )}

                    <div className="pt-4">
                        <SubmitButton disabled={!isValid} />
                    </div>
                </form>
            )}

            <div className="text-center">
                <p className="text-zinc-500 text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="text-white hover:text-red-500 font-bold transition-colors uppercase tracking-wider">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
