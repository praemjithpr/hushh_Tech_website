import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LandingPageProps {
    onLaunch: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
    return (
        <div className="fixed inset-0 bg-[#0a0a0b] text-white selection:bg-purple-500/30 font-['Inter'] overflow-hidden z-[100]">
            {/* BACKGROUND ELEMENTS */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `radial-gradient(circle, #a78bfa 1px, transparent 1px)`,
                        backgroundSize: '60px 60px'
                    }}
                />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full" />
            </div>

            {/* TOP NAVBAR */}
            <nav className="absolute top-0 left-0 w-full h-24 flex items-center justify-between px-12 z-[110]">
                {/* Space for balance */}
                <div className="hidden md:flex flex-1 items-center gap-8 text-[11px] font-bold tracking-widest uppercase opacity-40">
                    <button className="hover:text-purple-400 hover:opacity-100 transition-all">Intelligence</button>
                    <button className="hover:text-purple-400 hover:opacity-100 transition-all">Network</button>
                </div>

                <div className="flex items-center gap-3 absolute left-1/2 -translate-x-1/2">
                    <div className="w-9 h-9 border-2 border-purple-500 rounded-xl flex items-center justify-center font-bold text-lg">K</div>
                    <span className="font-['Outfit'] font-extrabold text-2xl tracking-tighter">KAI</span>
                </div>

                <div className="flex-1 flex justify-end items-center gap-8">
                    <div className="hidden md:flex items-center gap-8 text-[11px] font-bold tracking-widest uppercase opacity-40">
                        <button className="hover:text-purple-400 hover:opacity-100 transition-all">Security</button>
                        <button className="hover:text-purple-400 hover:opacity-100 transition-all">Docs</button>
                    </div>
                    <button
                        onClick={onLaunch}
                        className="px-7 py-2.5 bg-purple-600/10 hover:bg-purple-600 border border-purple-600/30 hover:border-purple-600 text-white font-bold text-[10px] tracking-widest uppercase rounded-full transition-all shadow-lg"
                    >
                        Launch KAI
                    </button>
                </div>
            </nav>

            {/* HERO SECTION */}
            <main className="relative h-full flex flex-col items-center justify-center px-6 text-center z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl flex flex-col items-center relative z-20"
                >
                    <div className="px-4 py-1 bg-white/5 border border-white/10 rounded-full mb-6">
                        <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-purple-400">Neural Intelligence Layer</span>
                    </div>

                    <h1 className="font-['Outfit'] text-5xl md:text-7xl font-black leading-[1.1] mb-6 tracking-tight">
                        Autonomous Finance <br />
                        <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            That Talks Back.
                        </span>
                    </h1>

                    <p className="max-w-xl text-base text-white/40 font-light leading-relaxed mb-10">
                        Meet KAI. Your neural-driven financial partner that thinks,
                        deliberates, and grows with you. Real-time wealth optimization
                        delivered through professional conversation.
                    </p>

                    {/* CENTRAL ACTION */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-purple-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                        <button
                            onClick={onLaunch}
                            className="relative px-10 py-4 bg-white text-black font-black text-[12px] uppercase tracking-[0.4em] rounded-full hover:bg-purple-50 transition-all active:scale-95"
                        >
                            Start Your Journey
                        </button>
                    </div>
                </motion.div>

                {/* FLOATING FEATURE CARDS - Repositioned to avoid overlap */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">

                    {/* Portfolio Card - Moved further left/top */}
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
                                <span className="text-[8px] opacity-40">ACTIVE · OPTIMIZING</span>
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

                    {/* Risk Card - Moved further left/bottom */}
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

                    {/* Market Intel Card - Moved further right/top */}
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

                    {/* Active Nodes Card - Moved further right/bottom */}
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

            {/* FOOTER */}
            <footer className="absolute bottom-8 left-0 w-full flex items-center justify-between px-12 z-[110] opacity-20 hover:opacity-100 transition-opacity duration-500">
                <div className="text-[9px] font-bold tracking-widest uppercase">
                    © 2026 KAI NEURAL · THE FINANCIAL INTELLIGENCE LAYER
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
