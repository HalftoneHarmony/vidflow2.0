"use client";

import { useState } from "react";
import { EventDetailAnalysis } from "./EventDetailAnalysis";
import { fetchEventAnalysis } from "../actions";
import { EventDetailedAnalysis as AnalysisType } from "../queries";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
    children: React.ReactNode;
    eventList: { id: number; title: string }[];
}

export function FinanceDashboard({ children, eventList }: Props) {
    const [selectedEventId, setSelectedEventId] = useState<string>("");
    const [detailData, setDetailData] = useState<AnalysisType | null>(null);
    const [loading, setLoading] = useState(false);

    const handleEventSelect = async (id: string) => {
        if (!id) {
            setSelectedEventId("");
            setDetailData(null);
            return;
        }

        setSelectedEventId(id);
        setLoading(true);
        try {
            const data = await fetchEventAnalysis(Number(id));
            setDetailData(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen">
            {/* Top Controls - Floating or Fixed position could be nice, but simple flow is safer */}
            <div className="flex justify-between items-center mb-8 bg-zinc-900/50 p-4 border border-zinc-800 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${selectedEventId ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
                    <span className="text-zinc-400 font-mono text-sm">
                        {selectedEventId ? "DETAILED ANALYSIS MODE" : "OVERVIEW MODE"}
                    </span>
                </div>

                <div className="relative group">
                    <select
                        className="appearance-none bg-black border border-zinc-700 text-white pl-4 pr-10 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer font-mono text-sm min-w-[200px]"
                        value={selectedEventId}
                        onChange={(e) => handleEventSelect(e.target.value)}
                    >
                        <option value="">Dashboard Overview</option>
                        {eventList.map((e) => (
                            <option key={e.id} value={e.id}>
                                {e.title}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col justify-center items-center h-64 gap-4"
                    >
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="text-zinc-500 font-mono text-sm animate-pulse">ANALYZING FINANCIAL DATA...</p>
                    </motion.div>
                ) : selectedEventId && detailData ? (
                    <motion.div
                        key="detail"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <EventDetailAnalysis
                            data={detailData}
                            onBack={() => {
                                setSelectedEventId("");
                                setDetailData(null);
                            }}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
