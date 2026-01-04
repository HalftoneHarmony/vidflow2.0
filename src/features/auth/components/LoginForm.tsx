"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { login } from "../actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

/**
 * 🔐 Login Form
 * Heavy Metal Style Input & Action
 */

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            className="w-full h-12 text-lg font-bold uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white rounded-none transition-all duration-200 shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={pending}
            aria-busy={pending}
        >
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Accessing...
                </>
            ) : (
                "Access System"
            )}
        </Button>
    );
}

export function LoginForm() {
    const [state, formAction] = useActionState(login, { error: "" });
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center lg:text-left">
                <h2 className="text-3xl font-bold font-[family-name:var(--font-oswald)] uppercase tracking-wide text-white">
                    System Login
                </h2>
                <p className="text-zinc-500 font-light">
                    Enter your credentials to access the engine.
                </p>
            </div>

            <form action={formAction} className="space-y-4">
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
                        className={`h-12 bg-zinc-900/50 border-zinc-800 focus:border-red-500 text-white placeholder:text-zinc-600 rounded-none transition-colors ${state?.error ? "border-red-500 animate-shake" : ""}`}
                        aria-invalid={!!state?.error}
                        aria-describedby={state?.error ? "login-error" : undefined}
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest" htmlFor="password">
                            Password
                        </label>
                        <Link
                            href="/forgot-password"
                            className="text-xs text-red-500 hover:text-red-400 transition-colors uppercase tracking-wider"
                        >
                            Forgot Password?
                        </Link>
                    </div>
                    <div className="relative">
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            required
                            className={`h-12 bg-zinc-900/50 border-zinc-800 focus:border-red-500 text-white placeholder:text-zinc-600 rounded-none transition-colors pr-10 ${state?.error ? "border-red-500 animate-shake" : ""}`}
                            aria-invalid={!!state?.error}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {state?.error && (
                    <div
                        id="login-error"
                        role="alert"
                        className="p-3 bg-red-950/30 border border-red-900/50 flex items-center gap-3 animate-fade-up"
                    >
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <span className="text-sm text-red-400 font-medium">
                            {state.error}
                        </span>
                    </div>
                )}

                <div className="pt-4">
                    <SubmitButton />
                </div>
            </form>

            <div className="text-center">
                <p className="text-zinc-500 text-sm">
                    Don't have an account?{" "}
                    <Link href="/join" className="text-white hover:text-red-500 font-bold transition-colors uppercase tracking-wider">
                        Create Account
                    </Link>
                </p>
            </div>
        </div>
    );
}
