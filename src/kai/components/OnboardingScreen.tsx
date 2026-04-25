/**
 * kai - Financial Intelligence Agent
 * OnboardingScreen - Hyper-Performance Refinement (Zero-Blur Lag)
 */

import React, { useState, memo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPersona, UserCalibration, RiskTolerance, InvestmentHorizon, InvestmentGoal } from '../types';

interface OnboardingScreenProps {
  onSelect: (calibration: UserCalibration) => void;
}

// Sub-component for Name Input - UNCONTROLLED + STATIC BG
const NameInput = memo(({ onComplete, theme }: { onComplete: (name: string) => void, theme: 'dark' | 'light' }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasValue, setHasValue] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center text-center max-w-2xl mx-auto w-full"
    >
      <h2 className={`${theme === 'dark' ? 'text-purple-400' : 'text-indigo-600'} text-[9px] font-bold tracking-[0.6em] uppercase mb-6`}>Access Protocol: Identity Mapping</h2>
      <h1 className={`font-['Outfit'] text-3xl md:text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'} mb-8 tracking-tight`}>Identify Yourself</h1>

      <p className={`text-[12px] mb-12 font-light max-w-sm mx-auto leading-relaxed ${theme === 'dark' ? 'text-gray-500' : 'text-slate-500'}`}>Please provide your identification for the agency records.</p>

      <div className="w-full relative px-10">
        <input
          id="userName"
          name="userName"
          autoComplete="name"
          autoFocus
          ref={inputRef}
          type="text"
          placeholder="ENTER NAME / ALIAS"
          className={`w-full bg-transparent border-b py-4 text-center text-2xl md:text-4xl outline-none transition-all placeholder:opacity-5 font-light ${theme === 'dark' ? 'border-white/20 text-white focus:border-purple-500' : 'border-slate-300 text-slate-900 focus:border-indigo-600'
            }`}
          onChange={(e) => setHasValue(e.target.value.length > 1)}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current && inputRef.current.value.length > 1 && onComplete(inputRef.current.value)}
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={!hasValue}
        onClick={() => inputRef.current && onComplete(inputRef.current.value)}
        className={`mt-16 px-12 py-4 rounded-full font-bold text-[10px] tracking-[0.5em] uppercase transition-all shadow-2xl ${theme === 'dark'
          ? 'bg-white text-black'
          : 'bg-slate-900 text-white'
          } ${!hasValue ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}
      >
        PROCEED
      </motion.button>
    </motion.div>
  );
});

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onSelect }) => {
  const [step, setStep] = useState(1);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [exiting, setExiting] = useState(false);

  const [calibration, setCalibration] = useState<Partial<UserCalibration>>({
    userName: '',
    persona: undefined,
    risk: 'Moderate',
    horizon: 'Medium-term',
    goal: 'Growth',
    preferredLanguage: 'English'
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => Math.max(0, s - 1));

  const handleNameComplete = (name: string) => {
    setCalibration(prev => ({ ...prev, userName: name }));
    nextStep();
  };

  const handleFinalize = (finalPersona: UserPersona) => {
    const finalData: UserCalibration = {
      ...calibration,
      persona: finalPersona,
    } as UserCalibration;

    setExiting(true);
    setTimeout(() => onSelect(finalData), 800);
  };

  const updateCalib = (updates: Partial<UserCalibration>) => {
    setCalibration(prev => ({ ...prev, ...updates }));
    nextStep();
  };

  // Performance Optimized Glass: Low blur, no group-hover effects on large elements
  const glassCardClass = `
    relative rounded-[2rem] 
    p-8 text-left transition-all duration-300 
    flex flex-col h-full active:scale-[0.98] border
    ${theme === 'dark'
      ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white shadow-xl'
      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-900 shadow-sm hover:shadow-md'
    }
  `;

  return (
    <div className={`
      absolute inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden
      transition-all duration-1000 ease-in-out font-['Inter']
      ${theme === 'dark' ? 'bg-black text-white' : 'bg-[#f8f9fa] text-slate-900'}
      ${exiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'}
    `}>

      {/* 0. THEME TOGGLE */}
      <div className="absolute top-10 right-10 z-[80]">
        <button
          onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
          className={`p-4 rounded-full border transition-all hover:scale-110 active:scale-95 ${theme === 'dark' ? 'bg-white/5 border-white/10 text-yellow-400' : 'bg-slate-200 border-slate-300 text-slate-900'
            }`}
        >
          {theme === 'dark' ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
          )}
        </button>
      </div>

      {/* 1. ATMOSPHERIC BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-1/3 -right-1/4 w-[800px] h-[800px] blur-[120px] rounded-full transition-colors duration-1000 ${theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-200/50'
          }`} />
        <div className={`absolute -bottom-1/4 -left-1/4 w-[700px] h-[700px] blur-[120px] rounded-full transition-colors duration-1000 ${theme === 'dark' ? 'bg-indigo-900/20' : 'bg-indigo-200/50'
          }`} />
      </div>

      {/* 2. NAVIGATION OVERLAY */}
      {step > 0 && (step !== 1) && (
        <div className="absolute top-12 left-12 z-[70]">
          <button
            onClick={prevStep}
            className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-[10px] font-bold tracking-widest uppercase">Back</span>
          </button>
        </div>
      )}

      {/* 3. STEP CONTENT */}
      <div className="relative z-10 w-full max-w-6xl px-12">
        <AnimatePresence mode="wait">

          {/* STEP 0: WELCOME PAGE */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center text-center space-y-10"
            >
              <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Orbital Rings */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className={`absolute inset-0 border rounded-full opacity-20 ${theme === 'dark' ? 'border-white' : 'border-slate-400'}`}
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                  className={`absolute inset-4 border rounded-full opacity-10 ${theme === 'dark' ? 'border-purple-400' : 'border-purple-600'}`}
                />

                <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl relative z-10 ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white border border-slate-200'
                  }`}>
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className={`w-8 h-8 rounded-full blur-[1px] ${theme === 'dark' ? 'bg-white/90' : 'bg-indigo-600'}`}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                  className={`text-[9px] font-bold tracking-[0.6em] uppercase ${theme === 'dark' ? 'text-purple-400' : 'text-indigo-600'}`}
                >
                  Intelligent Finance Interface
                </motion.div>
                <h1 className={`text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b ${theme === 'dark' ? 'from-white to-white/30' : 'from-slate-950 to-slate-500'
                  }`}>
                  KAI
                </h1>
                <div className={`space-y-1 max-w-xl mx-auto text-sm font-light leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
                  <p>Your AI-powered financial companion.</p>
                  <p className="opacity-60 text-[11px] tracking-wider font-medium">Smarter insights. Better decisions. Real growth.</p>
                </div>
              </div>

              <button
                onClick={nextStep}
                className={`px-12 py-4 font-black rounded-full transition-all active:scale-95 text-[10px] tracking-[0.5em] uppercase shadow-2xl ${theme === 'dark'
                  ? 'bg-white text-black hover:bg-gray-100 shadow-white/5'
                  : 'bg-slate-950 text-white hover:bg-slate-800 shadow-slate-900/10'
                  }`}
              >
                ENTER KAI
              </button>
            </motion.div>
          )}

          {/* STEP 1: IDENTIFICATION PROTOCOL (Isolated Ref for Zero Lag) */}
          {step === 1 && (
            <NameInput
              key="step1"
              theme={theme}
              onComplete={handleNameComplete}
            />
          )}

          {/* STEP 2: RISK */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}
              className="flex flex-col items-center text-center w-full"
            >
              <h1 className={`font-['Outfit'] text-3xl md:text-4xl font-bold mb-12 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Risk Appetite</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-5xl">
                {(['Conservative', 'Moderate', 'Aggressive'] as RiskTolerance[]).map(r => (
                  <button key={r} onClick={() => updateCalib({ risk: r })} className={glassCardClass}>
                    <div className="text-purple-400 mb-4 text-[9px] font-bold tracking-[0.4em] uppercase">{r}</div>
                    <div className="text-white text-lg font-bold mb-3">
                      {r === 'Conservative' ? 'Preserve Capital' : r === 'Moderate' ? 'Balanced Growth' : 'Maximum Alpha'}
                    </div>
                    <p className="text-gray-400 text-[12px] font-light leading-relaxed opacity-60">Strategic profile calibration for specific volatility tolerance.</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3: HORIZON */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}
              className="flex flex-col items-center text-center w-full"
            >
              <h1 className={`font-['Outfit'] text-3xl md:text-4xl font-bold mb-12 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Investment Horizon</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-5xl">
                {(['Short-term', 'Medium-term', 'Long-term'] as InvestmentHorizon[]).map(h => (
                  <button key={h} onClick={() => updateCalib({ horizon: h })} className={glassCardClass}>
                    <div className="text-blue-400 mb-4 text-[9px] font-bold tracking-[0.4em] uppercase">{h}</div>
                    <div className="text-white text-lg font-bold mb-3">
                      {h === 'Short-term' ? 'Tactical Swing' : h === 'Medium-term' ? 'Strategic Cycle' : 'Generational Wealth'}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 4: MISSION */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}
              className="flex flex-col items-center text-center w-full"
            >
              <h1 className={`font-['Outfit'] text-3xl md:text-4xl font-bold mb-12 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Primary Mission</h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5 w-full max-w-5xl">
                {(['Growth', 'Income', 'Stability', 'Speculation'] as InvestmentGoal[]).map(g => (
                  <button key={g} onClick={() => updateCalib({ goal: g })} className={glassCardClass + ' items-center text-center'}>
                    <div className="text-pink-400 mb-3 text-[9px] font-bold tracking-[0.3em] uppercase">{g}</div>
                    <div className="text-white text-base font-bold">{g}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 5: VOICE */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}
              className="flex flex-col items-center text-center w-full"
            >
              <h1 className={`font-['Outfit'] text-3xl md:text-4xl font-bold mb-12 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Vocal Identity</h1>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full max-w-5xl">
                {(['Puck', 'Charon', 'Kore', 'Fenrir', 'Aoede']).map(v => (
                  <button key={v} onClick={() => updateCalib({ agentVoice: v })} className={glassCardClass + ' items-center justify-center p-5'}>
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-white/10 flex items-center justify-center shadow-inner mb-3">
                      <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${v === 'Puck' ? 'Oliver' : v === 'Charon' ? 'Jack' : v === 'Kore' ? 'Sarah' : v === 'Fenrir' ? 'Leo' : 'Avery'}&eyes=default&mouth=smile&backgroundColor=transparent`} className="w-full h-full object-cover scale-110" alt={v} />
                    </div>
                    <div className="text-yellow-400 font-bold tracking-[0.3em] uppercase text-[10px]">{v}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 6: LANGUAGE */}
          {step === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}
              className="flex flex-col items-center text-center w-full"
            >
              <h1 className={`font-['Outfit'] text-3xl md:text-4xl font-bold mb-12 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Native Language</h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-5xl">
                {([
                  'English', 'Hindi', 'Tamil', 'Telugu',
                  'Malayalam', 'Kannada', 'Bengali', 'Marathi',
                  'Gujarati', 'Punjabi'
                ]).map(lang => (
                  <button
                    key={lang}
                    onClick={() => {
                      updateCalib({ preferredLanguage: lang });
                    }}
                    className={glassCardClass + ' items-center justify-center py-6'}
                  >
                    <div className="text-emerald-400 mb-2 text-[9px] font-bold tracking-[0.3em] uppercase">{lang === 'English' ? 'Global' : 'Native'}</div>
                    <div className="text-white text-base font-bold">{lang}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 7: PERSONA */}
          {step === 7 && (
            <motion.div
              key="step7"
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}
              className="flex flex-col items-center text-center w-full"
            >
              <h1 className={`font-['Outfit'] text-3xl md:text-4xl font-bold mb-12 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Neural Configuration</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-5xl">
                <button onClick={() => handleFinalize('Everyday Investor')} className={glassCardClass}>
                  <h3 className="font-['Outfit'] text-xl font-bold text-white mb-2">Everyday Investor</h3>
                  <p className="text-[12px] text-gray-500 font-light">Intuitive guidance. Simplified data.</p>
                </button>
                <button onClick={() => handleFinalize('Active Trader')} className={glassCardClass}>
                  <h3 className="font-['Outfit'] text-xl font-bold text-white mb-2">Active Trader</h3>
                  <p className="text-[12px] text-gray-500 font-light">Momentum signals. Technical catalysts.</p>
                </button>
                <button onClick={() => handleFinalize('Professional Advisor')} className={glassCardClass}>
                  <h3 className="font-['Outfit'] text-xl font-bold text-white mb-2">Professional Advisor</h3>
                  <p className="text-[12px] text-gray-500 font-light">Deep valuation models. Institutional compliance.</p>
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingScreen;
