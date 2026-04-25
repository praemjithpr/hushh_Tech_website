import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ResponseMode = 'AUDIO' | 'TEXT';

interface VoiceSelectorModalProps {
    isOpen: boolean;
    currentMode: ResponseMode;
    currentVoice: string;
    currentLanguage?: string;
    onClose: () => void;
    onModeSelect: (mode: ResponseMode) => void;
    onVoiceSelect: (voice: string) => void;
    onLanguageSelect: (lang: string) => void;
}

export const getAvatarUrl = (name: string) => {
    const seedMap: Record<string, string> = {
        'Puck': 'Oliver',
        'Charon': 'Jack',
        'Fenrir': 'Leo',
        'Kore': 'Sarah',
        'Aoede': 'Avery'
    };
    const seed = seedMap[name] || name;
    // Force pleasant features: default eyes, smiling mouth, no weird accessories
    return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&eyes=default&mouth=smile&backgroundColor=transparent`;
};


const voices = [
    { name: 'Puck', gender: 'MALE', role: 'Analytical Agent', desc: 'Direct, clear, objective logic.' },
    { name: 'Charon', gender: 'MALE', role: 'Executive Partner', desc: 'Deep, serious, institutional tone.' },
    { name: 'Fenrir', gender: 'MALE', role: 'Tactical Analyst', desc: 'Energetic, sharp, momentum-driven.' },
    { name: 'Kore', gender: 'FEMALE', role: 'Strategic Empath', desc: 'Warm, intuitive, balanced growth.' },
    { name: 'Aoede', gender: 'FEMALE', role: 'Growth Architect', desc: 'Professional, bright, future-focused.' }
];

const VoiceSelectorModal: React.FC<VoiceSelectorModalProps> = ({
    isOpen, currentMode, currentVoice, currentLanguage, onClose, onModeSelect, onVoiceSelect, onLanguageSelect
}) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-['Inter']"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="relative bg-[#0d0d0f] border border-white/10 p-8 md:p-10 rounded-[2.5rem] w-full max-w-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-8 right-8 p-3 rounded-full hover:bg-white/5 text-gray-500 hover:text-white transition-all active:scale-90"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div className="text-center mb-12">
                        <div className="text-[10px] font-bold tracking-[0.4em] uppercase text-purple-400 mb-3">System Identity Configuration</div>
                        <h2 className="font-['Outfit'] text-3xl font-black text-white tracking-tight">Communication Interface</h2>
                    </div>

                    {/* Mode Toggle */}
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-5 px-1">
                            <h3 className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">Neural Modality</h3>
                            <div className="h-[1px] flex-1 mx-6 bg-white/5" />
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => onModeSelect('AUDIO')}
                                className={`flex-1 py-5 px-6 rounded-2xl border transition-all duration-300 group ${currentMode === 'AUDIO'
                                    ? 'bg-purple-600/10 border-purple-500 shadow-[0_20px_40px_-12px_rgba(168,85,247,0.25)]'
                                    : 'bg-white/5 border-white/10 hover:border-white/20 text-gray-400'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-3 mb-1">
                                    <div className={`w-1.5 h-1.5 rounded-full ${currentMode === 'AUDIO' ? 'bg-purple-400' : 'bg-gray-600'}`} />
                                    <div className="font-['Outfit'] font-extrabold text-white tracking-widest text-xs uppercase">Audio Stream</div>
                                </div>
                                <div className="text-[9px] uppercase tracking-wider text-white/30 font-medium text-center">Bi-directional Voice</div>
                            </button>

                            <button
                                onClick={() => onModeSelect('TEXT')}
                                className={`flex-1 py-5 px-6 rounded-2xl border transition-all duration-300 group ${currentMode === 'TEXT'
                                    ? 'bg-emerald-600/10 border-emerald-500 shadow-[0_20px_40px_-12px_rgba(16,185,129,0.25)]'
                                    : 'bg-white/5 border-white/10 hover:border-white/20 text-gray-400'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-3 mb-1">
                                    <div className={`w-1.5 h-1.5 rounded-full ${currentMode === 'TEXT' ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                                    <div className="font-['Outfit'] font-extrabold text-white tracking-widest text-xs uppercase">Tactical Text</div>
                                </div>
                                <div className="text-[9px] uppercase tracking-wider text-white/30 font-medium text-center">Silent Intelligence</div>
                            </button>
                        </div>
                    </div>

                    <motion.div
                        animate={{ opacity: currentMode === 'TEXT' ? 0.3 : 1, y: currentMode === 'TEXT' ? 5 : 0 }}
                        className={`transition-all ${currentMode === 'TEXT' && 'pointer-events-none'}`}
                    >
                        <div className="flex items-center justify-between mb-5 px-1 mt-10">
                            <h3 className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">Operational Language</h3>
                            <div className="h-[1px] flex-1 mx-6 bg-white/5" />
                        </div>

                        <div className="flex flex-wrap gap-2 mb-10">
                            {['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi'].map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => onLanguageSelect(lang)}
                                    className={`px-4 py-2 rounded-full text-[10px] font-bold tracking-wider uppercase border transition-all ${(currentLanguage === lang) || (lang === 'English' && !currentLanguage)
                                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                        : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'
                                        }`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center justify-between mb-5 px-1">
                            <h3 className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">Agent Personas</h3>
                            <div className="h-[1px] flex-1 mx-6 bg-white/5" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                            {voices.map(v => (
                                <button
                                    key={v.name}
                                    onClick={() => onVoiceSelect(v.name)}
                                    className={`relative flex flex-col items-center p-5 rounded-2xl border transition-all duration-500 hover:-translate-y-1 ${currentVoice === v.name
                                        ? 'bg-purple-500/10 border-purple-500 shadow-[0_20px_40px_-12px_rgba(168,85,247,0.2)]'
                                        : 'bg-white/5 border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <div className={`absolute top-3 right-3 w-1.5 h-1.5 rounded-full ${currentVoice === v.name ? 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]' : 'bg-transparent'}`} />

                                    <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-800/80 flex items-center justify-center shadow-inner mb-4 ring-2 ring-white/5 group-hover:ring-white/10 transition-all">
                                        <img
                                            src={getAvatarUrl(v.name)}
                                            alt={v.name}
                                            className="w-full h-full object-cover scale-110"
                                        />
                                    </div>

                                    <div className="flex flex-col items-center gap-1.5 mb-3">
                                        <div className={`font-['Outfit'] font-black tracking-tighter text-sm ${currentVoice === v.name ? 'text-white' : 'text-white/80'}`}>
                                            {v.name}
                                        </div>
                                        <div className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                                            <span className="text-[7px] font-bold tracking-[0.15em] uppercase text-white/40">{v.gender}</span>
                                        </div>
                                    </div>

                                    <div className="text-[8px] font-bold text-purple-400 uppercase tracking-widest mb-2 leading-none">
                                        {v.role}
                                    </div>

                                    <div className="text-[8px] text-white/30 font-light leading-tight text-center">
                                        {v.desc}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default VoiceSelectorModal;
