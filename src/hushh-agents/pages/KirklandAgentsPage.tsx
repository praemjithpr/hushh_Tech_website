/**
 * Kirkland Agents — Listing Page
 * 
 * Follows KYC onboarding UI patterns: white bg, HushhTechBackHeader,
 * max-w-md centered layout, Playfair headings, consistent card styling.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import HushhTechBackHeader from '../../components/hushh-tech-back-header/HushhTechBackHeader';

const playfair = { fontFamily: "'Playfair Display', serif" };

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://ibsisfnjxeowvdtvgzff.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

/** Agent type */
interface KirklandAgent {
  id: string;
  name: string;
  alias: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  avg_rating: number | null;
  review_count: number;
  categories: string[];
  is_closed: boolean;
  photo_url: string | null;
}

/** Star rating row */
const Stars: React.FC<{ rating: number | null }> = ({ rating }) => {
  if (!rating) return <span className="text-[11px] text-gray-400">No rating</span>;
  const full = Math.floor(rating);
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className={`material-symbols-outlined text-[14px] ${
            i < full ? 'text-amber-400' : 'text-gray-200'
          }`}
          style={{ fontVariationSettings: i < full ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </span>
      ))}
      <span className="text-[11px] text-gray-500 ml-1 font-medium">{rating.toFixed(1)}</span>
    </div>
  );
};

/** Individual agent card — matches KYC card style */
const AgentCard: React.FC<{ agent: KirklandAgent; featured?: boolean }> = ({ agent, featured }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/hushh-agents/kirkland/${agent.id}`)}
      className={`text-left w-full border rounded-2xl p-4 transition-all active:scale-[0.98] ${
        featured
          ? 'border-amber-200 bg-amber-50/40 hover:border-amber-300'
          : 'border-gray-200/60 bg-white hover:border-gray-300'
      }`}
      aria-label={`View ${agent.name}`}
    >
      {/* Top row: avatar + name */}
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0 ${
          featured
            ? 'bg-gradient-to-br from-amber-500 to-orange-500'
            : 'bg-gradient-to-br from-gray-800 to-gray-900'
        }`}>
          {agent.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-gray-900 truncate leading-tight">
            {agent.name}
          </p>
          {agent.city && (
            <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[12px]">location_on</span>
              {agent.city}{agent.state ? `, ${agent.state}` : ''}
            </p>
          )}
        </div>
        {featured && (
          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold rounded-full uppercase tracking-wider">
            Top
          </span>
        )}
        <span className="material-symbols-outlined text-gray-300 text-[18px]">
          chevron_right
        </span>
      </div>

      {/* Rating */}
      <div className="mt-2.5">
        <Stars rating={agent.avg_rating} />
        {agent.review_count > 0 && (
          <span className="text-[10px] text-gray-400 ml-0.5">
            ({agent.review_count})
          </span>
        )}
      </div>

      {/* Categories */}
      {agent.categories?.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {agent.categories.slice(0, 2).map((cat) => (
            <span
              key={cat}
              className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full font-medium"
            >
              {cat}
            </span>
          ))}
          {agent.categories.length > 2 && (
            <span className="text-[10px] text-gray-300 font-medium">
              +{agent.categories.length - 2}
            </span>
          )}
        </div>
      )}
    </button>
  );
};

const KirklandAgentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<KirklandAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch agents
  useEffect(() => {
    const fetchAgents = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('kirkland_agents')
        .select('id, name, alias, phone, city, state, avg_rating, review_count, categories, is_closed, photo_url')
        .eq('is_closed', false)
        .order('avg_rating', { ascending: false, nullsFirst: false });

      if (!error && data) setAgents(data);
      setIsLoading(false);
    };
    fetchAgents();
  }, []);

  // Unique categories
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    agents.forEach(a => a.categories?.forEach(c => cats.add(c)));
    return Array.from(cats).sort();
  }, [agents]);

  // Top 10
  const topAgents = useMemo(() => {
    return agents
      .filter(a => a.avg_rating && a.avg_rating > 0 && a.review_count > 0)
      .slice(0, 10);
  }, [agents]);

  // Filtered
  const filteredAgents = useMemo(() => {
    let result = agents;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.city?.toLowerCase().includes(q) ||
        a.categories?.some(c => c.toLowerCase().includes(q))
      );
    }
    if (selectedCategory) {
      result = result.filter(a => a.categories?.includes(selectedCategory));
    }
    return result;
  }, [agents, searchQuery, selectedCategory]);

  // Loading
  if (isLoading) {
    return (
      <div className="bg-white text-gray-900 min-h-screen antialiased flex flex-col selection:bg-hushh-blue selection:text-white">
        <HushhTechBackHeader onBackClick={() => navigate('/hushh-agents')} rightLabel="FAQs" />
        <main className="px-6 flex-grow max-w-md mx-auto w-full pb-48 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3 animate-pulse">
              <span className="material-symbols-outlined text-gray-400">location_city</span>
            </div>
            <p className="text-[13px] text-gray-400 font-light">Loading agents...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-900 min-h-screen antialiased flex flex-col selection:bg-hushh-blue selection:text-white">
      {/* Header — matches KYC back header */}
      <HushhTechBackHeader onBackClick={() => navigate('/hushh-agents')} rightLabel="FAQs" />

      <main className="px-6 flex-grow max-w-md mx-auto w-full pb-48">

        {/* ── Title Section ── */}
        <section className="pt-8 pb-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2 font-medium">
            Agent Directory
          </p>
          <h1
            className="text-[2rem] leading-[1.1] font-normal text-black tracking-tight font-serif"
            style={playfair}
          >
            Kirkland <br />
            <span className="text-gray-400 italic font-light">Agents</span>
          </h1>
          <p className="text-gray-500 text-[13px] font-light mt-3 leading-relaxed">
            Browse {agents.length} local agents. Search by name, city, or category.
          </p>
        </section>

        {/* ── Search Bar ── */}
        <section className="pb-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">
              search
            </span>
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200/60 rounded-2xl text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-hushh-blue/20 focus:border-hushh-blue/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2"
                aria-label="Clear search"
              >
                <span className="material-symbols-outlined text-[18px] text-gray-400">close</span>
              </button>
            )}
          </div>
        </section>

        {/* ── Category Filter Chips ── */}
        <section className="pb-6">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3.5 py-2 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                !selectedCategory
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {allCategories.slice(0, 15).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={`px-3.5 py-2 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* ── Top Recommended ── */}
        {!searchQuery && !selectedCategory && topAgents.length > 0 && (
          <section className="pb-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3 font-medium flex items-center gap-1.5">
              <span className="material-symbols-outlined text-amber-400 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
              Top Recommended
            </p>
            <div className="space-y-3">
              {topAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} featured />
              ))}
            </div>
          </section>
        )}

        {/* ── All Agents / Search Results ── */}
        <section className="pb-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3 font-medium">
            {searchQuery || selectedCategory
              ? `Results · ${filteredAgents.length}`
              : `All Agents · ${agents.length}`}
          </p>

          {filteredAgents.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-gray-200 text-[40px] mb-3 block">
                search_off
              </span>
              <p className="text-gray-500 text-[13px] font-light">No agents found</p>
              <p className="text-gray-400 text-[11px] font-light mt-1">Try a different search</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default KirklandAgentsPage;
