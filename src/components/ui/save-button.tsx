
"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SaveButtonProps extends React.ComponentProps<typeof Button> {
    onSave: () => Promise<void>;
    label?: string;
    successDuration?: number;
}

export function SaveButton({ onSave, className, label = "Save Changes", successDuration = 2000, ...props }: SaveButtonProps) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        if (status === 'loading') return;
        if (props.onClick) props.onClick(e);

        setStatus('loading');
        try {
            await onSave();
            setStatus('success');
            setTimeout(() => setStatus('idle'), successDuration);
        } catch (error) {
            console.error(error);
            setStatus('error');
            setTimeout(() => setStatus('idle'), successDuration);
        }
    };

    return (
        <Button
            onClick={handleClick}
            disabled={status === 'loading'}
            className={cn(
                "relative overflow-hidden transition-all duration-300 min-w-[140px]",
                status === 'success' ? "bg-emerald-600 hover:bg-emerald-700 border-emerald-500" :
                    status === 'error' ? "bg-red-600 hover:bg-red-700 border-red-500 animate-shake" :
                        "",
                className
            )}
            {...props}
        >
            <AnimatePresence mode="wait">
                {status === 'loading' ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2"
                    >
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                    </motion.div>
                ) : status === 'success' ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="flex items-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        <span>Saved!</span>
                    </motion.div>
                ) : status === 'error' ? (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                    >
                        <span>Error</span>
                    </motion.div>
                ) : (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        <span>{label}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </Button>
    );
}
