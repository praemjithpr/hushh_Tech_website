import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Turn {
    role: 'user' | 'agent' | 'system';
    text: string;
    timestamp: Date;
}

interface TranscriptPanelProps {
    isOpen: boolean;
    onClose: () => void;
    turns: Turn[];
}

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({ isOpen, onClose, turns }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 w-full md:w-[400px] h-full bg-slate-900/90 dark:bg-black/90 backdrop-blur-2xl border-l border-slate-700/50 dark:border-white/10 z-[70] flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex-none p-6 border-b border-slate-800/50 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
                                <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                                Session Transcript
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Scrollable Transcript Area */}
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
                            {turns.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full opacity-50 text-slate-400 text-sm">
                                    <svg className="w-8 h-8 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    No conversation history yet.
                                </div>
                            ) : (
                                turns.map((turn, i) => (
                                    <div
                                        key={i}
                                        className={`flex flex-col max-w-[85%] ${turn.role === 'user' ? 'self-end items-end' : 'self-start items-start'
                                            }`}
                                    >
                                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1 ml-1 px-1">
                                            {turn.role.toUpperCase()} • {turn.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <div
                                            className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${turn.role === 'user'
                                                    ? 'bg-blue-600/20 border border-blue-500/30 text-blue-50 rounded-tr-sm'
                                                    : turn.role === 'system'
                                                        ? 'bg-amber-500/10 border border-amber-500/20 text-amber-200/80 rounded-tl-sm italic text-xs'
                                                        : 'bg-slate-800/60 border border-slate-700 text-slate-200 rounded-tl-sm'
                                                }`}
                                        >
                                            {turn.text}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Safe area footer spacer */}
                        <div className="h-6 flex-none" />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default TranscriptPanel;
