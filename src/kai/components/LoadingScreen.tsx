/**
 * kai - Financial Intelligence Agent
 * LoadingScreen - 3-Second Cinematic Readiness Sequence
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCalibration } from '../types';

interface LoadingScreenProps {
    calibration: UserCalibration;
    onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ calibration, onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [isReadyText, setIsReadyText] = useState(false);

    useEffect(() => {
        const duration = 3000; // Strictly 3 seconds
        const interval = 20;
        const step = (interval / duration) * 100;

        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                return prev + step;
            });
        }, interval);

        // Swap to "Ready" text halfway through
        const readyTimer = setTimeout(() => {
            setIsReadyText(true);
        }, 1800);

        const completeTimer = setTimeout(() => {
            onComplete();
        }, duration + 300); // Small buffer for fadeout

        return () => {
            clearInterval(timer);
            clearTimeout(readyTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden"
        >
            {/* 1. DYNAMIC BACKGROUND AURA */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: isReadyText ? [1, 1.3, 1.2] : [1, 1.1, 1],
                        opacity: isReadyText ? [0.1, 0.3, 0.2] : [0.05, 0.1, 0.05],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-purple-600/20 blur-[200px] rounded-full"
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl" />
            </div>

            {/* 2. CENTRAL KAI PROGRESS */}
            <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="relative w-48 h-48 mb-20 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                            cx="96"
                            cy="96"
                            r="90"
                            stroke="currentColor"
                            strokeWidth="1"
                            fill="transparent"
                            className="text-white/[0.03]"
                        />
                        <motion.circle
                            cx="96"
                            cy="96"
                            r="90"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="transparent"
                            strokeDasharray="565.5"
                            animate={{ strokeDashoffset: 565.5 - (565.5 * progress) / 100 }}
                            transition={{ duration: 0.1 }}
                            className="text-purple-500"
                            strokeLinecap="round"
                        />
                    </svg>

                    <AnimatePresence mode="wait">
                        {!isReadyText ? (
                            <motion.div
                                key="loading-percentage"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="text-white font-mono text-sm tracking-[0.5em] opacity-40"
                            >
                                {Math.round(progress)}%
                            </motion.div>
                        ) : (
                            <motion.div
                                key="ready-check"
                                initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                            >
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 3. SLOGAN SEQUENCE */}
                <div className="h-32 flex flex-col items-center text-center px-12">
                    <AnimatePresence mode="wait">
                        {!isReadyText ? (
                            <motion.div
                                key="slogan1"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col items-center"
                            >
                                <div className="text-[10px] text-white/30 uppercase tracking-[0.6em] font-bold mb-6">Initiating System</div>
                                <h3 className="text-2xl md:text-3xl font-light text-white tracking-[0.2em] leading-tight">
                                    KAI: INTELLIGENCE IN MOTION
                                </h3>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="slogan2"
                                initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                className="flex flex-col items-center"
                            >
                                <div className="text-[10px] text-purple-400 uppercase tracking-[0.8em] font-bold mb-6">Alignment Success</div>
                                <h3 className="text-3xl md:text-5xl font-bold text-white tracking-tighter leading-tight drop-shadow-2xl">
                                    YOUR PERSONALIZED AGENT IS READY
                                </h3>
                                <p className="text-white/40 text-xs mt-8 uppercase tracking-[0.4em]">Resonating Experience for {calibration.userName}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* 4. PREMIUM NOISE OVERLAY */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{
                backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")',
            }} />
        </motion.div>
    );
};

export default LoadingScreen;
