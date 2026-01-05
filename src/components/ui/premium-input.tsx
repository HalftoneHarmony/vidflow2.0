
import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface PremiumInputProps extends React.ComponentProps<"input"> {
    label?: string;
    description?: string;
    error?: string;
    success?: boolean;
    icon?: React.ComponentType<{ className?: string }>;
}

export const PremiumInput = React.forwardRef<HTMLInputElement, PremiumInputProps>(
    ({ className, label, description, error, success, icon: Icon, ...props }, ref) => {
        const [isFocused, setIsFocused] = React.useState(false);

        return (
            <div className="space-y-1.5 w-full">
                {label && (
                    <motion.label
                        initial={false}
                        animate={{
                            color: error ? "var(--color-destructive)" : isFocused ? "var(--color-primary)" : "var(--color-muted-foreground)",
                        }}
                        className="text-xs font-medium uppercase tracking-wider block"
                    >
                        {label}
                    </motion.label>
                )}
                <div className="relative">
                    <motion.div
                        className={cn(
                            "absolute inset-0 rounded-md pointer-events-none",
                            "border border-transparent"
                        )}
                        initial={false}
                        animate={{
                            boxShadow: isFocused
                                ? error
                                    ? "0 0 0 1px var(--color-destructive), 0 0 10px rgba(239, 68, 68, 0.2)"
                                    : "0 0 0 1px var(--color-primary), 0 0 20px rgba(255, 0, 0, 0.1)"
                                : "none",
                        }}
                        transition={{ duration: 0.2 }}
                    />
                    {Icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                            <Icon className="w-4 h-4" />
                        </div>
                    )}
                    <Input
                        ref={ref}
                        {...props}
                        className={cn(
                            "bg-zinc-900/50 border-zinc-800 transition-all duration-200",
                            "focus:border-transparent focus:ring-0", // Handled by motion div
                            error && "border-red-500 text-red-500",
                            success && "border-emerald-500 text-emerald-500",
                            Icon && "pl-10",
                            className
                        )}
                        onFocus={(e) => {
                            setIsFocused(true);
                            props.onFocus?.(e);
                        }}
                        onBlur={(e) => {
                            setIsFocused(false);
                            props.onBlur?.(e);
                        }}
                    />
                    <AnimatePresence>
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12" /></svg>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <AnimatePresence>
                    {(error || description) && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-[10px]"
                        >
                            {error ? (
                                <span className="text-red-500 font-medium">{error}</span>
                            ) : (
                                <span className="text-zinc-500">{description}</span>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        )
    }
)
PremiumInput.displayName = "PremiumInput"
