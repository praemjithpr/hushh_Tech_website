/**
 * kai - Financial Intelligence Agent
 * ConnectionIndicator - Signal strength bars + latency pill with quality label
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConnectionIndicatorProps {
    latencyMs: number;
}

const getQuality = (latencyMs: number) => {
    if (latencyMs <= 300) return { label: 'Excellent', bars: 3, color: '#22c55e', textClass: 'text-green-400', bgClass: 'bg-green-500', shadowClass: 'shadow-green-500/50' };
    if (latencyMs <= 800) return { label: 'Good', bars: 2, color: '#eab308', textClass: 'text-yellow-400', bgClass: 'bg-yellow-500', shadowClass: 'shadow-yellow-500/50' };
    return { label: 'Poor', bars: 1, color: '#ef4444', textClass: 'text-red-400', bgClass: 'bg-red-500', shadowClass: 'shadow-red-500/50' };
};

const SignalBars: React.FC<{ bars: number; color: string }> = ({ bars, color }) => (
    <div className="flex items-end gap-[2px] h-3">
        {[1, 2, 3].map(i => (
            <motion.div
                key={i}
                className="rounded-[1px]"
                style={{
                    width: 3,
                    height: i === 1 ? 5 : i === 2 ? 8 : 12,
                    backgroundColor: i <= bars ? color : 'rgba(255,255,255,0.1)',
                }}
                animate={i <= bars ? {
                    opacity: [0.7, 1, 0.7],
                } : {}}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
            />
        ))}
    </div>
);

export const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({ latencyMs }) => {
    if (latencyMs === 0) return null;

    const quality = getQuality(latencyMs);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="flex items-center gap-2 group cursor-default"
            >
                {/* Glassmorphic pill */}
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full
                    bg-black/40 dark:bg-black/40 border border-white/10 dark:border-white/10
                    backdrop-blur-xl shadow-lg"
                >
                    {/* Signal bars */}
                    <SignalBars bars={quality.bars} color={quality.color} />

                    {/* Divider */}
                    <div className="h-3 w-[1px] bg-white/10" />

                    {/* Latency value */}
                    <span className={`text-[10px] font-mono font-bold ${quality.textClass} tabular-nums`}>
                        {latencyMs}ms
                    </span>

                    {/* Quality label (visible on hover) */}
                    <div className="overflow-hidden w-0 group-hover:w-auto transition-all duration-300 ease-in-out">
                        <span className={`text-[8px] font-bold tracking-[0.2em] uppercase ${quality.textClass} whitespace-nowrap pl-1`}>
                            {quality.label}
                        </span>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ConnectionIndicator;
