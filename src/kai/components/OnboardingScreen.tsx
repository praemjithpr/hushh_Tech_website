import React from 'react';
import { UserPersona } from '../types';

interface OnboardingScreenProps {
  onSelect: (persona: UserPersona) => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onSelect }) => {
  const handleSelect = (persona: UserPersona) => {
    onSelect(persona);
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center p-6 md:p-10 bg-black/40 backdrop-blur-sm">
      
      <div className="w-full max-w-4xl flex flex-col items-center animate-in fade-in zoom-in duration-1000">
        <div className="mb-10 md:mb-16 text-center">
          <div className="inline-block px-3 py-1 rounded-full border border-gray-800 bg-gray-950/50 text-gray-500 text-[10px] uppercase tracking-[0.3em] font-mono mb-4">
            System Initialization
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4 uppercase">
            Select Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400">Tactical Profile</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed">
            Kai adapts its intelligence core based on your operational needs. Choose a profile to calibrate the real-time link.
          </p>
        </div>

        {/* Cards Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 w-full max-w-5xl" role="radiogroup" aria-label="Select User Persona">
          
          {/* Option 1: Everyday Investor */}
          <button 
            onClick={() => handleSelect('Everyday Investor')}
            aria-label="Everyday Investor: Focus on long-term growth and stability"
            className="group relative bg-gray-900/40 border border-blue-900/30 hover:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-2xl p-6 md:p-8 text-left transition-all duration-500 hover:bg-gray-900/80 hover:-translate-y-2 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-900/20 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-500">
               <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-blue-100 mb-2 group-hover:text-blue-400 transition-colors">Everyday Investor</h3>
            <p className="text-[10px] md:text-xs text-gray-500 mb-3 md:mb-4 uppercase tracking-widest font-bold">Focus: The "Why"</p>
            <p className="text-xs md:text-sm text-gray-400 leading-relaxed group-hover:text-gray-300">
              Balanced insights focusing on long-term growth and stability. Plain English explanations with zero jargon.
            </p>
          </button>

          {/* Option 2: Active Trader */}
          <button 
            onClick={() => handleSelect('Active Trader')}
            aria-label="Active Trader: Focus on signals and volatility"
            className="group relative bg-gray-900/40 border border-orange-900/30 hover:border-orange-500/60 focus:outline-none focus:ring-2 focus:ring-orange-500/50 rounded-2xl p-6 md:p-8 text-left transition-all duration-500 hover:bg-gray-900/80 hover:-translate-y-2 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-orange-500/0 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
             <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-orange-900/20 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-500">
               <svg className="w-5 h-5 md:w-6 md:h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
               </svg>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-orange-100 mb-2 group-hover:text-orange-400 transition-colors">Active Trader</h3>
            <p className="text-[10px] md:text-xs text-gray-500 mb-3 md:mb-4 uppercase tracking-widest font-bold">Focus: Signals</p>
            <p className="text-xs md:text-sm text-gray-400 leading-relaxed group-hover:text-gray-300">
              High-frequency updates, volatility metrics, and catalyst tracking. Prioritizes price action and sentiment shifts.
            </p>
          </button>

          {/* Option 3: Professional Advisor */}
          <button 
            onClick={() => handleSelect('Professional Advisor')}
            aria-label="Professional Advisor: Focus on risk and data modeling"
            className="group relative bg-gray-900/40 border border-purple-900/30 hover:border-purple-500/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50 rounded-2xl p-6 md:p-8 text-left transition-all duration-500 hover:bg-gray-900/80 hover:-translate-y-2 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
             <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-900/20 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-500">
               <svg className="w-5 h-5 md:w-6 md:h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-purple-100 mb-2 group-hover:text-purple-400 transition-colors">Professional Advisor</h3>
            <p className="text-[10px] md:text-xs text-gray-500 mb-3 md:mb-4 uppercase tracking-widest font-bold">Focus: Risk & Data</p>
            <p className="text-xs md:text-sm text-gray-400 leading-relaxed group-hover:text-gray-300">
              Deep research, compliance-friendly artifacts, and comprehensive risk modeling. Data-heavy and precise.
            </p>
          </button>
        </div>

        <div className="mt-12 text-gray-600 text-[10px] uppercase tracking-widest font-mono animate-pulse">
          Awaiting Secure Calibration...
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;
