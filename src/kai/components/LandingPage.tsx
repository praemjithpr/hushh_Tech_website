import React from 'react';
import { motion } from 'framer-motion';

interface LandingPageProps {
    onLaunch: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
    return (
        <div className="relative w-full h-screen bg-[#0a0a0b] text-white font-['Outfit'] overflow-hidden selection:bg-purple-500/30">
            {/* AMBIENT BACKGROUND */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay" />
            </div>

            {/* TOP NAVIGATION BAR */}
            <nav className="absolute top-0 left-0 w-full flex items-center justify-between px-12 py-8 z-[110] backdrop-blur-sm bg-black/5">
                <div className="flex items-center gap-3 group cursor-default">
                    <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:rotate-12 transition-transform duration-500">
                        <span className="text-xl font-black tracking-tighter">K</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-black tracking-tighter leading-none">KAI</span>
                        <span className="text-[8px] font-bold tracking-[0.3em] text-purple-400 leading-none mt-1">NEURAL ENGINE</span>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-10">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">System Load</span>
                        <div className="flex gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={`w-3 h-1 rounded-full ${i < 4 ? 'bg-purple-500' : 'bg-white/10'}`} />
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={onLaunch}
                        onKeyDown={(e) => e.key === 'Enter' && onLaunch()}
                        tabIndex={0}
                        aria-label="Launch KAI Neural Intelligence"
                        className="px-7 py-2.5 bg-purple-600/10 hover:bg-purple-600 border border-purple-600/30 hover:border-purple-600 text-white font-bold text-[10px] tracking-widest uppercase rounded-full transition-all shadow-lg focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
                    >
                        Launch KAI
                    </button>
                </div>
            </nav>

            {/* MAIN HERO CONTENT */}
            <main className="relative z-10 h-full flex flex-col items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center max-w-5xl"
                >
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8 backdrop-blur-xl">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
                        </span>
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-60">Version 5.0 LIVE - Multi-Agent Consensus</span>
                    </div>

                    <h1 className="text-6xl md:text-[120px] font-black leading-[0.85] tracking-tighter mb-10 bg-gradient-to-b from-white via-white to-white/20 bg-clip-text text-transparent">
                        FINANCIAL<br />INTELLIGENCE.
                    </h1>

                    <p className="text-sm md:text-lg text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed font-light tracking-wide">
                        Experience the first real-time, multi-agent financial engine. KAI synthesizes market sentiment, technical markers, and fundamental shifts into actionable decisions—at the speed of thought.
                    </p>

                    <div className="relative group inline-block">
                        <div className="absolute -inset-1 bg-purple-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                        <button
                            onClick={onLaunch}
                            onKeyDown={(e) => e.key === 'Enter' && onLaunch()}
                            tabIndex={0}
                            aria-label="Start Your Journey with KAI"
                            className="relative px-10 py-4 bg-white text-black font-black text-[12px] uppercase tracking-[0.4em] rounded-full hover:bg-purple-50 transition-all active:scale-95 focus-visible:ring-4 focus-visible:ring-purple-500 focus-visible:outline-none"
                        >
                            Start Your Journey
                        </button>
                    </div>
                </motion.div>

                {/* FLOATING FEATURE CARDS */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">

                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute top-[20%] left-[5%] w-56 p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl pointer-events-auto group hover:bg-white/10 transition-colors"
                    >
                        <div className="flex gap-3 items-center mb-4">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <div className="w-3 h-3 border-2 border-purple-400 rounded-sm rotate-45" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold font-['Outfit']">Portfolio Agent</span>
                                <span className="text-[8px] opacity-40">ACTIVE – OPTIMIZING</span>
                            </div>
                        </div>
                        <div className="h-10 flex items-center gap-1">
                            {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                                <div key={i} className="flex-1 bg-purple-400/20 rounded-t-sm relative">
                                    <motion.div
                                        initial={{ height: 0 }} animate={{ height: `${h}%` }}
                                        transition={{ delay: 1 + (i * 0.1) }}
                                        className="absolute bottom-0 left-0 w-full bg-purple-400"
                                    />
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute bottom-[15%] left-[8%] w-52 p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl pointer-events-auto group hover:bg-white/10 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Risk Guard</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                        </div>
                        <div className="text-xl font-['Outfit'] font-bold mb-1 tracking-tighter">94.2%</div>
                        <div className="text-[8px] text-green-400 uppercase tracking-widest">Safe Execution Level</div>
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute top-[25%] right-[5%] w-60 p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl pointer-events-auto group hover:bg-white/10 transition-colors"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            <span className="text-[9px] font-bold tracking-widest uppercase opacity-40 text-white">Live Intelligence</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                                <span className="text-[9px] font-medium">AAPL.NAS</span>
                                <span className="text-[9px] font-bold text-green-400 tracking-tighter">↑ 1.25%</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                                <span className="text-[9px] font-medium">BTC.USD</span>
                                <span className="text-[9px] font-bold text-green-400 tracking-tighter">↑ 4.12%</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                                <span className="text-[9px] font-medium">NVDA.NAS</span>
                                <span className="text-[9px] font-bold text-purple-400 tracking-tighter">OPTIMIZING</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, 15, 0] }}
                        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute bottom-[20%] right-[8%] w-56 p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl pointer-events-auto group hover:bg-white/10 transition-colors"
                    >
                        <div className="flex -space-x-2 mb-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`w-7 h-7 rounded-full border-2 border-[#0a0a0b] bg-purple-${400 + i * 100}/30`} />
                            ))}
                            <div className="w-7 h-7 rounded-full border-2 border-[#0a0a0b] bg-white/5 flex items-center justify-center text-[7px] font-bold">+24</div>
                        </div>
                        <p className="text-[9px] font-bold tracking-widest text-white/40 uppercase mb-1">Active Neural Nodes</p>
                        <p className="text-[11px] font-medium">Syncing with global market feed...</p>
                    </motion.div>

                </div>
            </main>

            <footer className="absolute bottom-8 left-0 w-full flex items-center justify-between px-12 z-[110] opacity-20 hover:opacity-100 transition-opacity duration-500">
                <div className="text-[9px] font-bold tracking-widest uppercase">
                    © 2026 KAI NEURAL AI – THE FINANCIAL INTELLIGENCE LAYER
                </div>
                <div className="flex gap-12 text-[9px] font-bold tracking-widest uppercase">
                    <button className="hover:text-purple-400 transition-colors">Privacy</button>
                    <button className="hover:text-purple-400 transition-colors">Terms</button>
                    <button className="hover:text-purple-400 transition-colors">System Status</button>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
