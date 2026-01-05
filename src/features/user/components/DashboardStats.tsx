"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { ShoppingBag, MessageSquare, Heart } from "lucide-react";

interface StatProps {
    label: string;
    value: number;
    icon: React.ElementType;
}

function Counter({ value }: { value: number }) {
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        damping: 50,
        stiffness: 100,
    });
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        }
    }, [isInView, value, motionValue]);

    useEffect(() => {
        springValue.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = String(Math.round(latest));
            }
        });

        return () => springValue.clearListeners();
    }, [springValue]);

    return <span ref={ref} />;
}

export function DashboardStats({ orderCount = 0, inquiryCount = 0 }) {
    const stats: StatProps[] = [
        { label: "MY ORDERS", value: orderCount, icon: ShoppingBag },
        { label: "WISH LIST", value: 0, icon: Heart }, // Placeholder for wishlist
        { label: "INQUIRIES", value: inquiryCount, icon: MessageSquare },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="group relative bg-zinc-900/30 border border-zinc-800 rounded-lg p-6 overflow-hidden hover:border-zinc-700 transition-colors"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative z-10 flex justify-between items-start mb-4">
                        <span className="text-xs font-bold text-zinc-500 tracking-wider">
                            {stat.label}
                        </span>
                        <stat.icon className="w-4 h-4 text-zinc-600 group-hover:text-red-500 transition-colors" />
                    </div>

                    <div className="relative z-10 text-4xl font-black text-white font-display tracking-tighter">
                        <Counter value={stat.value} />
                    </div>
                </div>
            ))}
        </div>
    );
}
