/**
 * kai - Financial Intelligence Agent
 * AudioWaveform - Live mic/speaking visualizer bars
 * 
 * Shows animated waveform bars that react to the user's microphone input volume,
 * giving clear visual feedback that audio is being captured.
 */

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AudioWaveformProps {
    /** Ref to current volume level (0-1), updated at 60fps */
    volumeRef: React.MutableRefObject<number>;
    /** Whether the session is active */
    active: boolean;
    /** Number of bars to display */
    barCount?: number;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({
    volumeRef,
    active,
    barCount = 5,
}) => {
    const barsRef = useRef<(HTMLDivElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // High-performance animation loop — direct DOM, no React re-renders
    useEffect(() => {
        if (!active) return;
        let animFrame: number;
        let time = 0;

        const animate = () => {
            time += 0.016;
            const vol = volumeRef.current;

            barsRef.current.forEach((bar, i) => {
                if (!bar) return;
                const offset = i / barCount;
                // Each bar gets a slightly different phase for organic wave effect
                const wave = Math.sin(time * 6 + offset * Math.PI * 2) * 0.3 + 0.7;
                const baseHeight = 0.15; // minimum height when silent
                const height = baseHeight + vol * wave * 0.85;
                const clampedHeight = Math.max(baseHeight, Math.min(1, height));

                bar.style.transform = `scaleY(${clampedHeight})`;

                // Color shifts with volume: subtle purple at rest → bright cyan/white when speaking
                const intensity = Math.min(1, vol * 1.5);
                if (intensity > 0.3) {
                    bar.style.backgroundColor = `rgba(168, 85, 247, ${0.5 + intensity * 0.5})`;
                    bar.style.boxShadow = `0 0 ${4 + intensity * 8}px rgba(168, 85, 247, ${intensity * 0.6})`;
                } else {
                    bar.style.backgroundColor = `rgba(148, 163, 184, 0.3)`;
                    bar.style.boxShadow = 'none';
                }
            });

            animFrame = requestAnimationFrame(animate);
        };

        animFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animFrame);
    }, [active, barCount]);

    if (!active) return null;

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="flex items-center gap-3"
        >
            {/* Mic icon */}
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md">
                <svg
                    className="w-3.5 h-3.5 text-purple-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
            </div>

            {/* Waveform bars */}
            <div className="flex items-center gap-[3px] h-8 px-3 py-1.5 rounded-full bg-black/30 border border-white/[0.06] backdrop-blur-xl">
                {Array.from({ length: barCount }).map((_, i) => (
                    <div
                        key={i}
                        ref={el => { barsRef.current[i] = el; }}
                        className="w-[3px] rounded-full origin-center transition-none"
                        style={{
                            height: 20,
                            backgroundColor: 'rgba(148, 163, 184, 0.3)',
                            transform: 'scaleY(0.15)',
                        }}
                    />
                ))}
            </div>

            {/* "LIVE" label */}
            <div className="flex items-center gap-1.5">
                <motion.div
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]"
                />
                <span className="text-[8px] font-bold tracking-[0.3em] uppercase text-white/30">
                    LIVE
                </span>
            </div>
        </motion.div>
    );
};

export default AudioWaveform;
