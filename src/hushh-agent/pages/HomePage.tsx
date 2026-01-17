/**
 * HomePage - Agent Selection Grid
 * 
 * The main landing page for hushh-agent module.
 * Displays all available agents with category filters.
 * URL: /hushh-agent
 */

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coach } from '../types';
import { COACHES } from '../constants';
import CoachCard from '../components/CoachCard';
import { AGENT_ROUTES } from '../routes';

interface HomePageProps {
  userEmail?: string;
  onSignOut: () => void;
}

type FilterType = 'all' | 'biological' | 'automation' | 'dating' | 'career' | 'chatnode';

const HomePage: React.FC<HomePageProps> = ({
  userEmail,
  onSignOut,
}) => {
  const navigate = useNavigate();

  // Handle filter click - navigate to appropriate route
  const handleFilterClick = (filter: FilterType) => {
    switch (filter) {
      case 'chatnode':
        navigate(AGENT_ROUTES.CHAT);
        break;
      case 'career':
        navigate(AGENT_ROUTES.CAREER);
        break;
      case 'biological':
      case 'automation':
      case 'dating':
        navigate(AGENT_ROUTES.CATEGORY(filter));
        break;
      case 'all':
      default:
        // Stay on home page for 'all'
        break;
    }
  };

  // Handle coach selection - navigate to session
  const handleCoachSelect = (coach: Coach) => {
    navigate(AGENT_ROUTES.SESSION(coach.id));
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-rose-500/30 overflow-x-hidden">
      {/* Immersive Neural Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-purple-900/10 rounded-full blur-[180px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-900/10 rounded-full blur-[180px] animate-pulse"></div>
        <div className="absolute top-[30%] left-[20%] w-[50%] h-[50%] bg-rose-900/10 rounded-full blur-[140px]"></div>
        <div className="absolute inset-0 portal-bg opacity-40"></div>
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-32">
        {/* User Status Bar */}
        <div className="fixed top-4 sm:top-6 right-4 sm:right-6 z-50 flex items-center gap-2 sm:gap-4">
          <div className="glass rounded-full px-3 sm:px-6 py-2 sm:py-3 border border-white/10 flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/50 font-black max-w-[80px] sm:max-w-none truncate">
                {userEmail || 'Connected'}
              </span>
            </div>
            <div className="w-px h-3 sm:h-4 bg-white/10"></div>
            <button
              onClick={onSignOut}
              className="text-[8px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-white/30 hover:text-red-400 transition-colors font-black"
            >
              Disconnect
            </button>
          </div>
        </div>

        {/* Main Header */}
        <header className="mb-12 sm:mb-16 md:mb-32 text-center animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex flex-col items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full glass border border-white/5 shadow-2xl">
              <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
              <span className="text-[8px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.3em] sm:tracking-[0.5em] text-white/50 font-black">
                <span className="hidden sm:inline">hushh Neural Architecture • Sovereign Collective v4.5</span>
                <span className="sm:hidden">hushh Sovereign v4.5</span>
              </span>
            </div>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-[11rem] font-bold mb-6 sm:mb-8 md:mb-10 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/10 leading-none px-2">
            hushh Sovereign
          </h1>

          <p className="max-w-4xl mx-auto text-base sm:text-lg md:text-2xl text-white/30 font-light leading-relaxed px-4 sm:px-6 md:px-0">
            Navigate the hierarchy of performance. Our agents facilitate 
            <span className="text-white/70 font-medium mx-2 italic">absolute resonance</span> 
            through the hushh Uplink. Rebuild your 
            <span className="text-blue-400 font-semibold mx-1">career trajectory</span>, 
            <span className="text-white/60 font-semibold mx-1">biological profile</span>, 
            <span className="text-cyan-400 font-semibold mx-1">automation workflows</span>, or 
            <span className="text-rose-500/80 font-bold mx-1 uppercase tracking-wider">sovereign intimacy</span>.
          </p>
        </header>

        {/* Neural Filter Node */}
        <div className="mb-10 sm:mb-16 md:mb-24 flex justify-center animate-in fade-in zoom-in-95 duration-700 delay-300">
          <div className="w-full max-w-full overflow-x-auto scrollbar-hide">
            <div className="p-1.5 sm:p-2 rounded-[24px] sm:rounded-[32px] glass border border-white/10 flex justify-start sm:justify-center items-center gap-1.5 sm:gap-2 bg-black/40 shadow-3xl min-w-max sm:min-w-0 mx-2 sm:mx-0">
              {[
                { id: 'all', label: 'All Sovereigns', shortLabel: 'All', icon: 'fa-globe' },
                { id: 'chatnode', label: 'Chat Node', shortLabel: 'Chat', icon: 'fa-comments', highlight: true },
                { id: 'career', label: 'Resume Node', shortLabel: 'Resume', icon: 'fa-file-alt' },
                { id: 'biological', label: 'Biological Node', shortLabel: 'Bio', icon: 'fa-dna' },
                { id: 'automation', label: 'Automation Node', shortLabel: 'Auto', icon: 'fa-robot' },
                { id: 'dating', label: 'Intimacy Node', shortLabel: 'Intimacy', icon: 'fa-heart' }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => handleFilterClick(filter.id as FilterType)}
                  className={`
                    px-4 py-2.5 sm:px-6 sm:py-3 md:px-10 md:py-4 rounded-[18px] sm:rounded-[24px] flex items-center gap-2 sm:gap-3 transition-all duration-500 min-h-[44px] whitespace-nowrap
                    ${filter.id === 'all'
                      ? 'bg-white text-black shadow-[0_0_50px_rgba(255,255,255,0.2)] scale-105'
                      : filter.highlight
                        ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 border border-purple-500/30'
                        : 'text-white/30 hover:text-white/60 hover:bg-white/5'
                    }
                  `}
                >
                  <i className={`fas ${filter.icon} text-xs sm:text-xs md:text-sm`}></i>
                  <span className="text-[9px] sm:text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">
                    <span className="hidden sm:inline">{filter.label}</span>
                    <span className="sm:hidden">{filter.shortLabel}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Agent Matrix - Show all coaches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 md:gap-10">
          {COACHES.map((coach, index) => (
            <div 
              key={coach.id} 
              className="card-3d animate-in fade-in slide-in-from-bottom-8 duration-700"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CoachCard 
                coach={coach} 
                onSelect={handleCoachSelect} 
              />
            </div>
          ))}
        </div>

        <footer className="mt-20 sm:mt-32 md:mt-48 pt-12 sm:pt-16 md:pt-20 border-t border-white/5 flex flex-col items-center gap-8 sm:gap-10">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 md:gap-16 text-[9px] sm:text-[10px] md:text-[12px] uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white/20 font-black px-4 sm:px-6 text-center">
            <div className="flex items-center gap-3">
              <div className="w-1 h-1 rounded-full bg-blue-500"></div>
              <span>Career Architect</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1 h-1 rounded-full bg-purple-500"></div>
              <span>Bio-Resonance</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1 h-1 rounded-full bg-cyan-400"></div>
              <span>Automation</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1 h-1 rounded-full bg-rose-500"></div>
              <span>Sovereign Intimacy</span>
            </div>
          </div>
          
          <div className="text-center space-y-4 px-6">
            <p className="text-white/10 text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-medium max-w-lg mx-auto leading-relaxed">
              hushh Sovereign is an agentic neural matrix designed for absolute human optimization.
            </p>
            <p className="text-white/5 text-[8px] md:text-[9px] uppercase tracking-widest">
              &copy; 2025 hushh Architecture • The Narrative Ecosystem • Total sync active
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
