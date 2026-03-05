/**
 * Kirkland Agents — Tinder-Style Swipe Experience
 *
 * Saturn editorial design. Framer Motion drag gestures.
 * Paginated feed (50/batch), optimistic writes, 3-card stack.
 * Bottom tab bar: Discover | Selected.
 */

import React, { useState, useCallback, useRef, useImperativeHandle, forwardRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, animate, PanInfo } from 'framer-motion';
import { useAgentSwipe, type SwipeAgent } from '../hooks/useAgentSwipe';
import AgentAvatar from '../components/AgentAvatar';

/* ── Fonts ── */
const serif = { fontFamily: "'Playfair Display', serif" };
const sans = { fontFamily: "'Inter', sans-serif" };

/* ── Colors (Saturn palette) ── */
const C = {
  primary: '#1A1A1B',
  accent: '#1400FF',
  gold: '#C1A050',
  textSub: '#8A8A8A',
  divider: '#E5E5E5',
  bg: '#FFFFFF',
  bgLight: '#F5F5F5',
  selectGreen: '#22C55E',
  rejectRed: '#EF4444',
};

/* ── Swipe physics ── */
const DRAG_THRESHOLD = 120;
const VELOCITY_THRESHOLD = 500;
const FLY_DISTANCE = 800;

/* ── Category-based gradient colors for full-bleed cards ── */
const CATEGORY_GRADIENTS: Record<string, string> = {
  'Insurance': 'linear-gradient(135deg, #1a237e 0%, #283593 40%, #3949ab 100%)',
  'Auto Insurance': 'linear-gradient(135deg, #0d47a1 0%, #1565c0 40%, #1976d2 100%)',
  'Home & Rental Insurance': 'linear-gradient(135deg, #004d40 0%, #00695c 40%, #00897b 100%)',
  'Life Insurance': 'linear-gradient(135deg, #311b92 0%, #4527a0 40%, #5e35b1 100%)',
  'Notaries': 'linear-gradient(135deg, #bf360c 0%, #d84315 40%, #e64a19 100%)',
  'Legal Services': 'linear-gradient(135deg, #4a148c 0%, #6a1b9a 40%, #7b1fa2 100%)',
  'Urgent Care': 'linear-gradient(135deg, #b71c1c 0%, #c62828 40%, #d32f2f 100%)',
  'Walk-in Clinics': 'linear-gradient(135deg, #880e4f 0%, #ad1457 40%, #c2185b 100%)',
  'Fingerprinting': 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 40%, #388e3c 100%)',
  'Health Insurance': 'linear-gradient(135deg, #006064 0%, #00838f 40%, #0097a7 100%)',
};
const DEFAULT_GRADIENT = 'linear-gradient(135deg, #263238 0%, #37474f 40%, #455a64 100%)';

/** Pick gradient from first matching category */
const getGradient = (categories: string[] = []) => {
  for (const cat of categories) {
    if (CATEGORY_GRADIENTS[cat]) return CATEGORY_GRADIENTS[cat];
  }
  return DEFAULT_GRADIENT;
};

/** Get initials from name (max 2 chars) */
const getInitials = (name: string) => {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/** Get a category icon emoji */
const getCategoryIcon = (categories: string[] = []) => {
  const cat = (categories[0] || '').toLowerCase();
  if (cat.includes('insurance')) return '🛡️';
  if (cat.includes('notar')) return '📝';
  if (cat.includes('legal')) return '⚖️';
  if (cat.includes('urgent') || cat.includes('clinic') || cat.includes('health')) return '🏥';
  if (cat.includes('fingerprint')) return '🔍';
  if (cat.includes('real estate')) return '🏠';
  if (cat.includes('tax') || cat.includes('accounting')) return '📊';
  if (cat.includes('financial')) return '💰';
  return '🤖';
};

/* ══════════════════════════════════════════
   Section — clean container (no crop marks)
   ══════════════════════════════════════════ */
const Section = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <section className={`relative ${className}`}>
    {children}
  </section>
);

/* ── Imperative handle for button-triggered swipes ── */
export interface SwipeCardHandle {
  triggerSwipe: (direction: 'left' | 'right') => void;
}

/* ══════════════════════════════════════════
   SwipeCard — Draggable agent card
   ══════════════════════════════════════════ */
interface SwipeCardProps {
  agent: SwipeAgent;
  isTop: boolean;
  stackIndex: number;
  onSwipeRight: (id: string) => void;
  onSwipeLeft: (id: string) => void;
  onTap: (id: string) => void;
}

const SwipeCard = memo(forwardRef<SwipeCardHandle, SwipeCardProps>(function SwipeCard({
  agent,
  isTop,
  stackIndex,
  onSwipeRight,
  onSwipeLeft,
  onTap,
}, ref) {
  const x = useMotionValue(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const allPhotos = (agent.photos && agent.photos.length > 0) ? agent.photos : (agent.photo_url ? [agent.photo_url] : []);
  const hasMultiplePhotos = allPhotos.length > 1;

  /* Derived transforms from drag position */
  const rotate = useTransform(x, [-300, 0, 300], [-12, 0, 12]);
  const selectOpacity = useTransform(x, [0, DRAG_THRESHOLD], [0, 1]);
  const rejectOpacity = useTransform(x, [-DRAG_THRESHOLD, 0], [1, 0]);

  /* Expose triggerSwipe for button clicks */
  useImperativeHandle(ref, () => ({
    triggerSwipe: (direction: 'left' | 'right') => {
      const dir = direction === 'right' ? 1 : -1;
      animate(x, dir * FLY_DISTANCE, {
        duration: 0.35,
        ease: 'easeIn',
        onComplete: () => {
          if (dir > 0) onSwipeRight(agent.id);
          else onSwipeLeft(agent.id);
        },
      });
    },
  }), [x, agent.id, onSwipeRight, onSwipeLeft]);

  /* Stack depth offset — visible stacked edges */
  const scale = 1 - stackIndex * 0.05;
  const yOffset = stackIndex * 12;
  const zIndex = 10 - stackIndex;

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const absX = Math.abs(info.offset.x);
      const absVelocity = Math.abs(info.velocity.x);

      /* Tap detection: minimal drag */
      if (absX < 10) {
        onTap(agent.id);
        return;
      }

      /* Commit swipe if above threshold */
      if (absX >= DRAG_THRESHOLD || absVelocity >= VELOCITY_THRESHOLD) {
        const direction = info.offset.x > 0 ? 1 : -1;
        animate(x, direction * FLY_DISTANCE, {
          duration: 0.3,
          onComplete: () => {
            if (direction > 0) onSwipeRight(agent.id);
            else onSwipeLeft(agent.id);
          },
        });
      } else {
        /* Spring back */
        animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 });
      }
    },
    [agent.id, onSwipeRight, onSwipeLeft, onTap, x]
  );

  /* Photo navigation — tap left/right halves (only when not dragging) */
  const handlePhotoTap = useCallback((e: React.MouseEvent) => {
    if (!isTop || !hasMultiplePhotos) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const tapX = e.clientX - rect.left;
    const isRightHalf = tapX > rect.width / 2;
    
    if (isRightHalf) {
      setPhotoIndex(prev => Math.min(prev + 1, allPhotos.length - 1));
    } else {
      setPhotoIndex(prev => Math.max(prev - 1, 0));
    }
    e.stopPropagation();
  }, [isTop, hasMultiplePhotos, allPhotos.length]);

  /* Star rating display */
  const rating = agent.avg_rating || 0;
  const bioSnippet = agent.bio ? (agent.bio.length > 100 ? agent.bio.slice(0, 100) + '…' : agent.bio) : null;

  return (
    <motion.div
      className="absolute touch-none select-none"
      style={{
        /* Inset back cards so stack edges are visible */
        top: 0,
        left: stackIndex * 6,
        right: stackIndex * 6,
        bottom: 0,
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        scale,
        y: yOffset,
        zIndex,
        opacity: stackIndex > 2 ? 0 : 1 - stackIndex * 0.15,
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={isTop ? handleDragEnd : undefined}
    >
      <div
        className="w-full h-full rounded-2xl overflow-hidden relative"
        style={{
          background: agent.photo_url ? C.bg : getGradient(agent.categories),
          boxShadow: stackIndex === 0
            ? '0 8px 30px rgba(0,0,0,0.15)'
            : `0 ${4 + stackIndex * 3}px ${12 + stackIndex * 6}px rgba(0,0,0,${0.06 + stackIndex * 0.03})`,
        }}
      >
        {/* ── SELECT / PASS overlays ── */}
        {isTop && (
          <>
            <motion.div
              className="absolute top-6 left-6 z-20 px-4 py-2 rounded-lg border-3 font-bold text-xl"
              style={{
                opacity: selectOpacity,
                color: '#22C55E',
                borderColor: '#22C55E',
                borderWidth: '3px',
                background: 'rgba(34,197,94,0.1)',
                ...sans,
                transform: 'rotate(-12deg)',
              }}
            >
              SELECT ✓
            </motion.div>
            <motion.div
              className="absolute top-6 right-6 z-20 px-4 py-2 rounded-lg border-3 font-bold text-xl"
              style={{
                opacity: rejectOpacity,
                color: '#EF4444',
                borderColor: '#EF4444',
                borderWidth: '3px',
                background: 'rgba(239,68,68,0.1)',
                ...sans,
                transform: 'rotate(12deg)',
              }}
            >
              PASS ✕
            </motion.div>
          </>
        )}

        {/* ── WhatsApp-style photo progress bars (top) ── */}
        {hasMultiplePhotos && isTop && (
          <div className="absolute top-2 left-3 right-3 z-20 flex gap-1">
            {allPhotos.map((_, i) => (
              <div
                key={i}
                className="flex-1 h-[3px] rounded-full transition-all duration-200"
                style={{
                  background: i <= photoIndex ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                }}
              />
            ))}
          </div>
        )}

        {/* ── Full-bleed visual area — tap zones for photo nav ── */}
        <div
          className="absolute inset-0"
          onClick={hasMultiplePhotos && isTop ? handlePhotoTap : undefined}
        >
          {allPhotos.length > 0 ? (
            /* Has photos — show current photo full-bleed */
            <img
              src={allPhotos[photoIndex] || allPhotos[0]}
              alt={agent.name}
              className="w-full h-full object-cover"
              loading={isTop ? 'eager' : 'lazy'}
              draggable={false}
            />
          ) : (
            /* No photo — gradient with large icon + initials */
            <div
              className="w-full h-full flex flex-col items-center justify-center"
              style={{ background: getGradient(agent.categories) }}
            >
              <span className="text-6xl mb-3 opacity-30">
                {getCategoryIcon(agent.categories)}
              </span>
              <span
                className="text-7xl sm:text-8xl font-bold tracking-wider opacity-20"
                style={{ color: '#ffffff', ...serif }}
              >
                {getInitials(agent.name)}
              </span>
            </div>
          )}
        </div>

        {/* ── Rating badge top-right ── */}
        {rating > 0 && (
          <div className="absolute top-6 right-3 z-10">
            <span
              className="text-xs px-2.5 py-1 rounded-full font-semibold backdrop-blur-sm flex items-center gap-1"
              style={{ background: 'rgba(0,0,0,0.5)', color: '#FFD700', ...sans }}
            >
              ★ {rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* ── Review count + MCP top-left ── */}
        <div className="absolute top-6 left-3 z-10 flex gap-1.5">
          <span
            className="text-[10px] px-2.5 py-1 rounded-full tracking-wider uppercase font-semibold backdrop-blur-sm"
            style={{ background: 'rgba(0,0,0,0.5)', color: '#ffffff', ...sans }}
          >
            🤖 MCP
          </span>
          {agent.review_count > 0 && (
            <span
              className="text-[10px] px-2.5 py-1 rounded-full tracking-wider uppercase font-semibold backdrop-blur-sm"
              style={{ background: 'rgba(0,0,0,0.5)', color: '#ffffff', ...sans }}
            >
              {agent.review_count} reviews
            </span>
          )}
        </div>

        {/* ── Bottom gradient overlay with info (Tinder-style) ── */}
        <div
          className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-5 pt-20"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
          }}
        >
          {/* Name */}
          <h2
            className="text-2xl sm:text-3xl font-semibold leading-tight text-white mb-1"
            style={serif}
          >
            {agent.name}
          </h2>

          {/* Categories as chips */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {(agent.categories || []).slice(0, 3).map((cat) => (
              <span
                key={cat}
                className="text-[11px] px-2.5 py-0.5 rounded-full"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(4px)',
                  ...sans,
                }}
              >
                {cat}
              </span>
            ))}
          </div>

          {/* Location */}
          {agent.city && (
            <p className="text-sm flex items-center gap-1 text-white/80" style={sans}>
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>
                location_on
              </span>
              {agent.city}{agent.state ? `, ${agent.state}` : ''}
            </p>
          )}

          {/* Bio (if available) */}
          {bioSnippet && (
            <p className="text-sm text-white/70 mt-1.5 line-clamp-2 italic" style={sans}>
              "{bioSnippet}"
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}));

/* ══════════════════════════════════════════
   SelectedAgentCard — Horizontal card
   ══════════════════════════════════════════ */
const SelectedAgentCard = memo(function SelectedAgentCard({
  agent,
  onTap,
  onRemove,
}: {
  agent: SwipeAgent;
  onTap: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const categories = (agent.categories || []).slice(0, 2).join(' · ');

  return (
    <div
      className="flex items-center gap-4 px-4 py-3 cursor-pointer transition-opacity hover:opacity-80"
      style={{ borderBottom: `1px solid ${C.divider}` }}
      onClick={() => onTap(agent.id)}
      role="button"
      tabIndex={0}
      aria-label={`View ${agent.name}`}
    >
      {/* Avatar */}
      <div className="w-14 h-14 flex-shrink-0 rounded-sm overflow-hidden" style={{ background: C.bgLight }}>
        {agent.photo_url ? (
          <img src={agent.photo_url} alt={agent.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <AgentAvatar name={agent.name} size="md" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-normal truncate" style={{ ...serif, color: C.primary }}>
          {agent.name}
        </h3>
        <p className="text-xs truncate" style={{ color: C.textSub, ...sans }}>
          {categories}
          {agent.city ? ` · ${agent.city}` : ''}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-xs" style={{ color: C.gold }}>
            {'★'.repeat(Math.round(agent.avg_rating || 0))}
          </span>
          <span className="text-[10px]" style={{ color: C.textSub }}>
            {(agent.avg_rating || 0).toFixed(1)}
          </span>
        </div>
      </div>

      {/* Remove button */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(agent.id); }}
        className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-red-50"
        aria-label="Remove agent"
      >
        <span className="material-symbols-outlined text-lg" style={{ color: C.rejectRed, fontVariationSettings: "'FILL' 0, 'wght' 300" }}>
          close
        </span>
      </button>
    </div>
  );
});

/* ══════════════════════════════════════════
   Main Page Component
   ══════════════════════════════════════════ */
export default function KirklandAgentsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'discover' | 'selected'>('discover');

  const {
    cards,
    selectedAgents,
    isLoading,
    isEmpty,
    swipeRight,
    swipeLeft,
    removeSelected,
    stats,
  } = useAgentSwipe();

  /* Navigate to agent detail */
  const handleTap = useCallback((id: string) => {
    navigate(`/hushh-agents/kirkland/${id}`);
  }, [navigate]);

  /* Ref to top card for button-triggered fly-away animation */
  const topCardRef = useRef<SwipeCardHandle>(null);

  /* Button-triggered swipes — animate card flying out */
  const handleButtonReject = useCallback(() => {
    if (cards.length > 0 && topCardRef.current) {
      topCardRef.current.triggerSwipe('left');
    }
  }, [cards]);

  const handleButtonSelect = useCallback(() => {
    if (cards.length > 0 && topCardRef.current) {
      topCardRef.current.triggerSwipe('right');
    }
  }, [cards]);

  return (
    <div
      className="min-h-screen flex flex-col selection:bg-blue-100"
      style={{ background: C.bg, color: C.primary, ...sans }}
    >
      {/* ═══ Header ═══ */}
      <Section>
        <header className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/hushh-agents')}
            className="flex items-center gap-2 hover:opacity-60 transition-opacity"
            aria-label="Back to Hushh Agents"
          >
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>
              arrow_back
            </span>
            <span className="text-sm" style={{ color: C.textSub }}>Back</span>
          </button>

          <h1
            className="text-lg sm:text-xl tracking-wider font-normal"
            style={{ ...serif, color: C.primary }}
          >
            {activeTab === 'discover' ? 'DISCOVER' : `SELECTED (${stats.selected})`}
          </h1>

          <div className="w-16" /> {/* Spacer for centering */}
        </header>
      </Section>

      {/* ═══ Content ═══ */}
      <Section className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col items-center px-4 pt-4 pb-24">
          {activeTab === 'discover' ? (
            /* ── Discover View ── */
            <div className="w-full max-w-sm flex-1 flex flex-col items-center">
              {/* Card Stack */}
              <div
                className="relative w-full flex-1 max-h-[520px] min-h-[400px]"
                style={{ perspective: '1000px' }}
              >
                {isLoading ? (
                  /* Loading skeleton */
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-sm mx-auto mb-4 animate-pulse" />
                      <p className="text-sm" style={{ color: C.textSub }}>Loading agents...</p>
                    </div>
                  </div>
                ) : isEmpty && cards.length === 0 ? (
                  /* Empty state */
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-6">
                      <span
                        className="material-symbols-outlined text-5xl mb-4 block"
                        style={{ color: C.divider, fontVariationSettings: "'FILL' 0, 'wght' 200" }}
                      >
                        check_circle
                      </span>
                      <h2 className="text-2xl mb-2" style={serif}>All caught up!</h2>
                      <p className="text-sm mb-6" style={{ color: C.textSub }}>
                        You've discovered all {stats.total} agents.
                        Check your selected list!
                      </p>
                      <button
                        onClick={() => setActiveTab('selected')}
                        className="px-6 py-3 text-sm font-medium text-white"
                        style={{ background: C.accent }}
                      >
                        View Selected ({stats.selected})
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Card stack — only render top 3 */
                  /* Render top 3 cards — reversed so index 0 renders last (on top) */
                  cards.slice(0, 3).map((agent, i) => (
                    <SwipeCard
                      key={agent.id}
                      ref={i === 0 ? topCardRef : undefined}
                      agent={agent}
                      isTop={i === 0}
                      stackIndex={i}
                      onSwipeRight={swipeRight}
                      onSwipeLeft={swipeLeft}
                      onTap={handleTap}
                    />
                  ))
                )}
              </div>

              {/* Action Buttons */}
              {cards.length > 0 && !isLoading && (
                <div className="flex items-center gap-6 py-5">
                  {/* Reject */}
                  <button
                    onClick={handleButtonReject}
                    className="w-16 h-16 rounded-full flex items-center justify-center transition-transform active:scale-90"
                    style={{ border: `2px solid ${C.rejectRed}` }}
                    aria-label="Pass"
                  >
                    <span className="material-symbols-outlined text-3xl" style={{ color: C.rejectRed }}>
                      close
                    </span>
                  </button>

                  {/* Select */}
                  <button
                    onClick={handleButtonSelect}
                    className="w-16 h-16 rounded-full flex items-center justify-center transition-transform active:scale-90"
                    style={{ border: `2px solid ${C.selectGreen}` }}
                    aria-label="Select"
                  >
                    <span className="material-symbols-outlined text-3xl" style={{ color: C.selectGreen }}>
                      favorite
                    </span>
                  </button>
                </div>
              )}

              {/* Progress */}
              {!isLoading && (
                <div className="w-full flex items-center gap-3 pb-2">
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: C.divider }}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        background: C.accent,
                        width: stats.total > 0 ? `${(stats.swiped / stats.total) * 100}%` : '0%',
                      }}
                    />
                  </div>
                  <span className="text-[11px] flex-shrink-0" style={{ color: C.textSub }}>
                    {stats.swiped} / {stats.total}
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* ── Selected View ── */
            <div className="w-full max-w-lg flex-1">
              {selectedAgents.length === 0 ? (
                <div className="flex-1 flex items-center justify-center py-20">
                  <div className="text-center">
                    <span
                      className="material-symbols-outlined text-5xl mb-4 block"
                      style={{ color: C.divider, fontVariationSettings: "'FILL' 0, 'wght' 200" }}
                    >
                      swipe_right
                    </span>
                    <h2 className="text-xl mb-2" style={serif}>No agents selected yet</h2>
                    <p className="text-sm mb-6" style={{ color: C.textSub }}>
                      Swipe right on agents you'd like to work with.
                    </p>
                    <button
                      onClick={() => setActiveTab('discover')}
                      className="px-6 py-3 text-sm font-medium text-white"
                      style={{ background: C.accent }}
                    >
                      Start Discovering
                    </button>
                  </div>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: C.divider }}>
                  <div className="px-4 py-3">
                    <p
                      className="text-[11px] tracking-[0.25em] uppercase font-medium"
                      style={{ color: C.textSub }}
                    >
                      {selectedAgents.length} agent{selectedAgents.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                  {selectedAgents.map((agent) => (
                    <SelectedAgentCard
                      key={agent.id}
                      agent={agent}
                      onTap={handleTap}
                      onRemove={removeSelected}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Section>

      {/* ═══ Bottom Tab Bar — Fixed ═══ */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex"
        style={{
          background: C.bg,
          borderTop: `1px solid ${C.divider}`,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Discover tab */}
        <button
          onClick={() => setActiveTab('discover')}
          className="flex-1 flex flex-col items-center gap-1 py-3 transition-opacity"
          style={{ opacity: activeTab === 'discover' ? 1 : 0.4 }}
          aria-label="Discover agents"
        >
          <span
            className="material-symbols-outlined text-xl"
            style={{
              color: activeTab === 'discover' ? C.accent : C.textSub,
              fontVariationSettings: activeTab === 'discover' ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 300",
            }}
          >
            style
          </span>
          <span
            className="text-[11px] font-medium"
            style={{ color: activeTab === 'discover' ? C.accent : C.textSub }}
          >
            Discover
          </span>
          {activeTab === 'discover' && (
            <div className="absolute top-0 left-1/4 right-3/4 h-0.5" style={{ background: C.accent }} />
          )}
        </button>

        {/* Selected tab */}
        <button
          onClick={() => setActiveTab('selected')}
          className="flex-1 flex flex-col items-center gap-1 py-3 transition-opacity relative"
          style={{ opacity: activeTab === 'selected' ? 1 : 0.4 }}
          aria-label={`Selected agents (${stats.selected})`}
        >
          <span
            className="material-symbols-outlined text-xl"
            style={{
              color: activeTab === 'selected' ? C.accent : C.textSub,
              fontVariationSettings: activeTab === 'selected' ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 300",
            }}
          >
            favorite
          </span>
          <span
            className="text-[11px] font-medium"
            style={{ color: activeTab === 'selected' ? C.accent : C.textSub }}
          >
            Selected
          </span>

          {/* Badge */}
          {stats.selected > 0 && (
            <span
              className="absolute top-2 right-1/4 w-5 h-5 flex items-center justify-center rounded-full text-[9px] font-bold text-white"
              style={{ background: C.selectGreen, transform: 'translate(50%, -25%)' }}
            >
              {stats.selected > 99 ? '99+' : stats.selected}
            </span>
          )}

          {activeTab === 'selected' && (
            <div className="absolute top-0 left-1/4 right-3/4 h-0.5" style={{ background: C.accent }} />
          )}
        </button>
      </div>
    </div>
  );
}
