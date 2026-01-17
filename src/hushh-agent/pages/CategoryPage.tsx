/**
 * CategoryPage - Category Filter View
 * 
 * Displays agents filtered by category (biological, automation, dating).
 * URL: /hushh-agent/node/:category
 */

import React, { useMemo } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { Coach } from '../types';
import { COACHES } from '../constants';
import CoachCard from '../components/CoachCard';
import { AGENT_ROUTES, VALID_CATEGORIES, isValidCategory } from '../routes';

// Category display info
const CATEGORY_INFO: Record<string, { title: string; icon: string; color: string; description: string }> = {
  biological: {
    title: 'Biological Node',
    icon: 'fa-dna',
    color: 'purple',
    description: 'Bio-resonance agents for physical and mental optimization.',
  },
  automation: {
    title: 'Automation Node',
    icon: 'fa-robot',
    color: 'cyan',
    description: 'Workflow automation and system efficiency agents.',
  },
  dating: {
    title: 'Intimacy Node',
    icon: 'fa-heart',
    color: 'rose',
    description: 'Sovereign intimacy and deep connection agents.',
  },
};

interface CategoryPageProps {
  userEmail?: string;
  onSignOut: () => void;
}

const CategoryPage: React.FC<CategoryPageProps> = ({
  userEmail,
  onSignOut,
}) => {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();

  // Validate category
  if (!category || !VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])) {
    return <Navigate to={AGENT_ROUTES.HOME} replace />;
  }

  const categoryInfo = CATEGORY_INFO[category];

  // Filter coaches by category
  const filteredCoaches = useMemo(() => {
    return COACHES.filter(coach => coach.category === category);
  }, [category]);

  // Handle coach selection - navigate to session
  const handleCoachSelect = (coach: Coach) => {
    navigate(AGENT_ROUTES.SESSION(coach.id));
  };

  // Navigate to home
  const handleHomeClick = () => {
    navigate(AGENT_ROUTES.HOME);
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-rose-500/30 overflow-x-hidden">
      {/* Immersive Neural Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-${categoryInfo.color}-900/10 rounded-full blur-[180px] animate-pulse`}></div>
        <div className={`absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-${categoryInfo.color}-900/10 rounded-full blur-[180px] animate-pulse`}></div>
        <div className="absolute inset-0 portal-bg opacity-40"></div>
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        {/* Header with Home button */}
        <div className="fixed top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-50 flex items-center justify-between">
          {/* Home Button */}
          <button
            onClick={handleHomeClick}
            className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full glass border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all group min-h-[44px]"
          >
            <i className="fas fa-home text-sm sm:text-base text-purple-400 group-hover:text-purple-300"></i>
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-white/50 group-hover:text-white/70 font-bold">
              Home
            </span>
          </button>

          {/* User Status */}
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

        {/* Category Header */}
        <header className="mt-16 sm:mt-20 mb-12 sm:mb-16 text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex flex-col items-center gap-6 mb-8">
            <div className={`w-20 h-20 rounded-full bg-${categoryInfo.color}-500/20 border border-${categoryInfo.color}-500/30 flex items-center justify-center`}>
              <i className={`fas ${categoryInfo.icon} text-3xl text-${categoryInfo.color}-400`}></i>
            </div>
            <div className={`inline-flex items-center gap-3 px-6 py-2 rounded-full glass border border-${categoryInfo.color}-500/30`}>
              <div className={`w-1.5 h-1.5 rounded-full bg-${categoryInfo.color}-500 animate-pulse`}></div>
              <span className="text-[10px] uppercase tracking-[0.4em] text-white/50 font-black">
                hushh Neural Architecture • {categoryInfo.title}
              </span>
            </div>
          </div>

          <h1 className={`font-serif text-4xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-${categoryInfo.color}-400/50`}>
            {categoryInfo.title}
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/40 font-light leading-relaxed">
            {categoryInfo.description}
          </p>
        </header>

        {/* Node Filter Tabs */}
        <div className="mb-12 flex justify-center">
          <div className="p-2 rounded-[32px] glass border border-white/10 flex flex-wrap justify-center items-center gap-2 bg-black/40">
            {[
              { id: 'all', label: 'All', path: AGENT_ROUTES.HOME },
              { id: 'chatnode', label: 'Chat', path: AGENT_ROUTES.CHAT },
              { id: 'career', label: 'Resume', path: AGENT_ROUTES.CAREER },
              { id: 'biological', label: 'Biological', path: AGENT_ROUTES.CATEGORY('biological') },
              { id: 'automation', label: 'Automation', path: AGENT_ROUTES.CATEGORY('automation') },
              { id: 'dating', label: 'Intimacy', path: AGENT_ROUTES.CATEGORY('dating') },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => navigate(filter.path)}
                className={`
                  px-5 py-2 rounded-[20px] flex items-center gap-2 transition-all duration-300
                  ${filter.id === category 
                    ? `bg-${categoryInfo.color}-500/20 text-${categoryInfo.color}-300 border border-${categoryInfo.color}-500/50` 
                    : 'text-white/30 hover:text-white/60 hover:bg-white/5'
                  }
                `}
              >
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{filter.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Coaches Grid */}
        {filteredCoaches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
            {filteredCoaches.map((coach, index) => (
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
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <i className="fas fa-search text-4xl text-white/20"></i>
            </div>
            <h3 className="text-xl font-serif text-white/50 mb-2">No Agents Found</h3>
            <p className="text-white/30 text-sm">
              No agents available in this category yet.
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-24 pt-12 border-t border-white/5 text-center">
          <p className="text-white/10 text-[9px] uppercase tracking-[0.4em]">
            hushh Sovereign • {categoryInfo.title} • Neural Matrix Active
          </p>
        </footer>
      </div>
    </div>
  );
};

export default CategoryPage;
