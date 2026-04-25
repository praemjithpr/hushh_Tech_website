/**
 * kai - Financial Intelligence Agent
 * ThemeToggle - Premium animated Sun/Moon toggle with glassmorphic pill
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeContext';

const ThemeToggle: React.FC = () => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <motion.button
            onClick={toggleTheme}
            className="relative flex items-center justify-center w-10 h-10 rounded-full
        bg-white/[0.06] dark:bg-white/[0.06] border border-white/10 dark:border-white/10
        light:bg-black/[0.06] light:border-black/10
        backdrop-blur-xl shadow-lg
        hover:scale-105 active:scale-95 transition-transform duration-200"
            whileHover={{ boxShadow: isDark ? '0 0 20px rgba(168,85,247,0.3)' : '0 0 20px rgba(255,200,50,0.3)' }}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {/* Sun icon */}
            <motion.svg
                className="absolute w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isDark ? 'rgba(255,255,255,0.3)' : '#f59e0b'}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={false}
                animate={{
                    scale: isDark ? 0 : 1,
                    rotate: isDark ? -90 : 0,
                    opacity: isDark ? 0 : 1,
                }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </motion.svg>

            {/* Moon icon */}
            <motion.svg
                className="absolute w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isDark ? '#a78bfa' : 'rgba(0,0,0,0.2)'}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={false}
                animate={{
                    scale: isDark ? 1 : 0,
                    rotate: isDark ? 0 : 90,
                    opacity: isDark ? 1 : 0,
                }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </motion.svg>
        </motion.button>
    );
};

export default ThemeToggle;
