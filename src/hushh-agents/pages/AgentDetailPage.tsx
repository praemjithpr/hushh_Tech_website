/**
 * Agent Detail Page
 * 
 * Follows KYC onboarding UI patterns: white bg, HushhTechBackHeader,
 * max-w-md centered layout, Playfair headings, info rows, CTA buttons.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import HushhTechBackHeader from '../../components/hushh-tech-back-header/HushhTechBackHeader';
import HushhTechCta, { HushhTechCtaVariant } from '../../components/hushh-tech-cta/HushhTechCta';

const playfair = { fontFamily: "'Playfair Display', serif" };

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://ibsisfnjxeowvdtvgzff.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface AgentFull {
  id: string;
  name: string;
  alias: string | null;
  phone: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  avg_rating: number | null;
  review_count: number;
  categories: string[];
  is_closed: boolean;
  photo_url: string | null;
}

/** Format full address */
const formatAddress = (a: AgentFull): string => {
  const parts = [a.address1, a.address2, a.city, a.state, a.zip].filter(Boolean);
  return parts.join(', ') || 'Address not available';
};

/** Star rating display */
const Stars: React.FC<{ rating: number | null }> = ({ rating }) => {
  if (!rating) return <span className="text-[11px] text-gray-400">No rating yet</span>;
  const full = Math.floor(rating);
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className={`material-symbols-outlined text-[18px] ${
            i < full ? 'text-amber-400' : 'text-gray-200'
          }`}
          style={{ fontVariationSettings: i < full ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </span>
      ))}
      <span className="text-[14px] text-gray-900 ml-1.5 font-semibold">{rating.toFixed(1)}</span>
    </div>
  );
};

/** Info row — matches KYC info card styling */
const InfoRow: React.FC<{
  icon: string;
  label: string;
  value: string;
  onClick?: () => void;
}> = ({ icon, label, value, onClick }) => (
  <button
    onClick={onClick}
    disabled={!onClick}
    className={`flex items-start gap-3.5 p-4 rounded-2xl border border-gray-200/60 bg-white w-full text-left transition-all ${
      onClick ? 'hover:border-gray-300 active:scale-[0.99] cursor-pointer' : ''
    }`}
  >
    <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
      <span className="material-symbols-outlined text-[18px] text-gray-500">{icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-gray-400 uppercase tracking-[0.15em] font-medium">{label}</p>
      <p className="text-[13px] text-gray-900 mt-0.5 break-words font-light leading-relaxed">{value}</p>
    </div>
    {onClick && (
      <span className="material-symbols-outlined text-gray-300 text-[16px] shrink-0 mt-1">
        open_in_new
      </span>
    )}
  </button>
);

const AgentDetailPage: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<AgentFull | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAgent = async () => {
      if (!agentId) return;
      setIsLoading(true);
      const { data, error } = await supabase
        .from('kirkland_agents')
        .select('*')
        .eq('id', agentId)
        .single();

      if (!error && data) setAgent(data);
      setIsLoading(false);
    };
    fetchAgent();
  }, [agentId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white text-gray-900 min-h-screen antialiased flex flex-col selection:bg-hushh-blue selection:text-white">
        <HushhTechBackHeader onBackClick={() => navigate('/hushh-agents/kirkland')} rightLabel="FAQs" />
        <main className="px-6 flex-grow max-w-md mx-auto w-full pb-48 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 animate-pulse mx-auto mb-3" />
            <p className="text-[13px] text-gray-400 font-light">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  // Not found state
  if (!agent) {
    return (
      <div className="bg-white text-gray-900 min-h-screen antialiased flex flex-col selection:bg-hushh-blue selection:text-white">
        <HushhTechBackHeader onBackClick={() => navigate('/hushh-agents/kirkland')} rightLabel="FAQs" />
        <main className="px-6 flex-grow max-w-md mx-auto w-full pb-48 flex flex-col items-center justify-center">
          <span className="material-symbols-outlined text-gray-200 text-[48px] mb-4">person_off</span>
          <p className="text-gray-500 text-[15px] font-light">Agent not found</p>
          <button
            onClick={() => navigate('/hushh-agents/kirkland')}
            className="mt-4 text-hushh-blue text-[13px] font-medium underline underline-offset-2"
          >
            Back to Directory
          </button>
        </main>
      </div>
    );
  }

  const googleMapsUrl = agent.latitude && agent.longitude
    ? `https://www.google.com/maps?q=${agent.latitude},${agent.longitude}`
    : `https://www.google.com/maps/search/${encodeURIComponent(formatAddress(agent))}`;

  return (
    <div className="bg-white text-gray-900 min-h-screen antialiased flex flex-col selection:bg-hushh-blue selection:text-white">
      {/* Header — matches KYC */}
      <HushhTechBackHeader onBackClick={() => navigate('/hushh-agents/kirkland')} rightLabel="FAQs" />

      <main className="px-6 flex-grow max-w-md mx-auto w-full pb-48">

        {/* ── Profile Hero ── */}
        <section className="pt-8 pb-6 text-center">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
            {agent.name.charAt(0)}
          </div>

          {/* Name */}
          <h1
            className="text-[1.75rem] leading-[1.1] font-normal text-black tracking-tight font-serif"
            style={playfair}
          >
            {agent.name}
          </h1>

          {agent.alias && (
            <p className="text-[11px] text-gray-400 mt-1.5 font-light">@{agent.alias}</p>
          )}

          {/* Status badge */}
          <div className="flex items-center justify-center mt-3">
            {agent.is_closed ? (
              <span className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-500 rounded-full text-[10px] font-medium uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                Closed
              </span>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-medium uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Open
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex flex-col items-center mt-4">
            <Stars rating={agent.avg_rating} />
            {agent.review_count > 0 && (
              <p className="text-[11px] text-gray-400 mt-1 font-light">
                {agent.review_count} review{agent.review_count !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </section>

        {/* ── Categories ── */}
        {agent.categories?.length > 0 && (
          <section className="pb-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2.5 font-medium">
              Categories
            </p>
            <div className="flex flex-wrap gap-2">
              {agent.categories.map((cat) => (
                <span
                  key={cat}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200/60 text-gray-600 text-[11px] rounded-full font-medium"
                >
                  {cat}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ── Contact Information ── */}
        <section className="pb-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3 font-medium">
            Contact Information
          </p>
          <div className="space-y-3">
            {agent.phone && (
              <InfoRow
                icon="call"
                label="Phone"
                value={agent.phone}
                onClick={() => window.open(`tel:${agent.phone}`, '_self')}
              />
            )}

            <InfoRow
              icon="location_on"
              label="Address"
              value={formatAddress(agent)}
              onClick={() => window.open(googleMapsUrl, '_blank')}
            />

            {agent.latitude && agent.longitude && (
              <InfoRow
                icon="directions"
                label="Get Directions"
                value={`${agent.latitude.toFixed(4)}, ${agent.longitude.toFixed(4)}`}
                onClick={() => window.open(googleMapsUrl, '_blank')}
              />
            )}
          </div>
        </section>

        {/* ── Map Preview ── */}
        {agent.latitude && agent.longitude && (
          <section className="pb-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3 font-medium">
              Location
            </p>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl overflow-hidden border border-gray-200/60 hover:border-gray-300 transition-colors"
            >
              <img
                src={`https://maps.googleapis.com/maps/api/staticmap?center=${agent.latitude},${agent.longitude}&zoom=14&size=600x200&markers=color:red%7C${agent.latitude},${agent.longitude}&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8`}
                alt={`Map of ${agent.name}`}
                className="w-full h-[140px] object-cover bg-gray-50"
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="p-3 flex items-center justify-between">
                <span className="text-[11px] text-gray-400 font-light">View on Google Maps</span>
                <span className="material-symbols-outlined text-gray-300 text-[14px]">open_in_new</span>
              </div>
            </a>
          </section>
        )}

        {/* ── Action CTAs ── */}
        <section className="space-y-3 pb-8">
          {agent.phone && (
            <HushhTechCta
              variant={HushhTechCtaVariant.BLACK}
              onClick={() => window.open(`tel:${agent.phone}`, '_self')}
            >
              <span className="material-symbols-outlined text-[18px]">call</span>
              Call Now
            </HushhTechCta>
          )}
          <HushhTechCta
            variant={HushhTechCtaVariant.WHITE}
            onClick={() => window.open(googleMapsUrl, '_blank')}
          >
            <span className="material-symbols-outlined text-[18px]">directions</span>
            Get Directions
          </HushhTechCta>
        </section>
      </main>
    </div>
  );
};

export default AgentDetailPage;
