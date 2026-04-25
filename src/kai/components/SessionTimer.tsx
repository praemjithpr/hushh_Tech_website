/**
 * kai - Financial Intelligence Agent
 * SessionTimer - Premium elapsed-time HUD element
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface SessionTimerProps {
    isActive: boolean;
}

const formatTime = (totalSeconds: number): string => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hrs > 0) return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    return `${pad(mins)}:${pad(secs)}`;
};

const SessionTimer: React.FC<SessionTimerProps> = ({ isActive }) => {
    const [elapsed, setElapsed] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isActive) {
            setElapsed(0);
            intervalRef.current = setInterval(() => {
                setElapsed(prev => prev + 1);
            }, 1000);
        } else {
            setElapsed(0);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isActive]);

    if (!isActive) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="flex items-center gap-2 px-4 py-2 rounded-full
        bg-black/40 dark:bg-black/40 border border-white/10 dark:border-white/10
        backdrop-blur-xl shadow-lg"
        >
            {/* Live pulse dot */}
            <div className="relative flex items-center justify-center w-2.5 h-2.5">
                <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-emerald-500/50"
                />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
            </div>

            {/* Timer text */}
            <span className="text-[11px] font-mono font-bold tracking-[0.15em] text-white/60 dark:text-white/60 tabular-nums">
                {formatTime(elapsed)}
            </span>

            {/* Label */}
            <span className="text-[8px] font-bold tracking-[0.3em] uppercase text-white/25 dark:text-white/25 hidden sm:inline">
                SESSION
            </span>
        </motion.div>
    );
};

export default SessionTimer;
