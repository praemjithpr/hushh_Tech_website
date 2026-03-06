/**
 * Kirkland Agents — Premium Tinder-Style Swipe Experience
 *
 * Professional card design: golden border, split photo/info,
 * floating action button, Material Symbols icons only.
 * Framer Motion drag + multi-photo gallery.
 */

import React, { useState, useCallback, useRef, useImperativeHandle, forwardRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, animate, PanInfo } from 'framer-motion';
import { useAgentSwipe, type SwipeAgent } from '../hooks/useAgentSwipe';

/* ── Fonts ── */
const serif = { fontFamily: "'Playfair Display', serif" };
const sans = { fontFamily: "'Inter', sans-serif" };

/* ── Premium Colors ── */
const C = {
  bg: '#F8F6F2',
  cardBg: '#FFFFFF',
  gold: '#C5A44E',
  goldLight: '#E8D9A8',
  goldBorder: '#D4AF37',
  primary: '#1A1A1B',
  textSub: '#6B6B6B',
  textLight: '#9A9A9A',
  divider: '#ECECEC',
  selectGreen: '#34C759',
  rejectRed: '#FF3B30',
  accent: '#1400FF',
  starGold: '#F5A623',
};

/* ── Swipe physics ── */
const DRAG_THRESHOLD = 120;
const VELOCITY_THRESHOLD = 500;
const FLY_DISTANCE = 800;

/* ── Category gradient for no-photo fallback ── */
const GRADIENTS: Record<string, string> = {
  Insurance: 'linear-gradient(145deg, #1B2A4A 0%, #2C3E6B 50%, #3D5291 100%)',
  Legal: 'linear-gradient(145deg, #2D1B4A 0%, #3E2C6B 50%, #524191 100%)',
  Health: 'linear-gradient(145deg, #1B3A3A 0%, #2C5555 50%, #3D7070 100%)',
  Notary: 'linear-gradient(145deg, #3A2A1B 0%, #55402C 50%, #70553D 100%)',
  Financial: 'linear-gradient(145deg, #1B2D1B 0%, #2C3E2C 50%, #3D523D 100%)',
  default: 'linear-gradient(145deg, #2A2A2E 0%, #3D3D42 50%, #505058 100%)',
};

const getGradient = (cats: string[] = []) => {
  const c = (cats[0] || '').toLowerCase();
  if (c.includes('insurance')) return GRADIENTS.Insurance;
  if (c.includes('legal') || c.includes('law')) return GRADIENTS.Legal;
  if (c.includes('health') || c.includes('clinic') || c.includes('urgent')) return GRADIENTS.Health;
  if (c.includes('notar')) return GRADIENTS.Notary;
  if (c.includes('financ') || c.includes('tax') || c.includes('account')) return GRADIENTS.Financial;
  return GRADIENTS.default;
};

/** Material icon helper — uses Material Symbols Outlined */
const Icon = ({ name, size = 20, color = C.primary, fill = false, weight = 300, className = '' }: {
  name: string; size?: number; color?: string; fill?: boolean; weight?: number; className?: string;
}) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{
      fontSize: size,
      color,
      fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}`,
      lineHeight: 1,
    }}
  >
    {name}
  </span>
);

/** Initials for no-photo fallback */
const getInitials = (name: string) => {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/** Category icon name (Material Symbols) */
const getCategoryIcon = (cats: string[] = []): string => {
  const c = (cats[0] || '').toLowerCase();
  if (c.includes('insurance')) return 'shield';
  if (c.includes('notar')) return 'description';
  if (c.includes('legal') || c.includes('law')) return 'gavel';
  if (c.includes('urgent') || c.includes('clinic') || c.includes('health')) return 'local_hospital';
  if (c.includes('fingerprint')) return 'fingerprint';
  if (c.includes('real estate')) return 'home';
  if (c.includes('tax') || c.includes('account')) return 'account_balance';
  if (c.includes('financ')) return 'payments';
  return 'smart_toy';
};

/* ══════════════════════════════════════════
   SwipeCard Handle
   ══════════════════════════════════════════ */
export interface SwipeCardHandle {
  triggerSwipe: (direction: 'left' | 'right') => void;
}

interface SwipeCardProps {
  agent: SwipeAgent;
  isTop: boolean;
  stackIndex: number;
  onSwipeRight: (id: string) => void;
  onSwipeLeft: (id: string) => void;
  onTap: (id: string) => void;
}

/* ══════════════════════════════════════════
   SwipeCard — Premium split card design
   ══════════════════════════════════════════ */
const SwipeCard = memo(forwardRef<SwipeCardHandle, SwipeCardProps>(function SwipeCard({
  agent, isTop, stackIndex, onSwipeRight, onSwipeLeft, onTap,
}, ref) {
  const x = useMotionValue(0);
  const [photoIdx, setPhotoIdx] = useState(0);

  const allPhotos = (agent.photos?.length > 0) ? agent.photos : (agent.photo_url ? [agent.photo_url] : []);
  const hasPhotos = allPhotos.length > 0;
  const hasMulti = allPhotos.length > 1;

  /* Transforms */
  const rotate = useTransform(x, [-300, 0, 300], [-10, 0, 10]);
  const selectOpacity = useTransform(x, [0, DRAG_THRESHOLD], [0, 1]);
  const rejectOpacity = useTransform(x, [-DRAG_THRESHOLD, 0], [1, 0]);

  /* Imperative swipe for buttons */
  useImperativeHandle(ref, () => ({
    triggerSwipe: (dir: 'left' | 'right') => {
      animate(x, (dir === 'right' ? 1 : -1) * FLY_DISTANCE, {
        duration: 0.35, ease: 'easeIn',
        onComplete: () => dir === 'right' ? onSwipeRight(agent.id) : onSwipeLeft(agent.id),
      });
    },
  }), [x, agent.id, onSwipeRight, onSwipeLeft]);

  /* Stack positioning */
  const scale = 1 - stackIndex * 0.04;
  const yOff = stackIndex * 10;
  const zIdx = 10 - stackIndex;

  /* Drag handler */
  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    const absX = Math.abs(info.offset.x);
    if (absX < 10) { onTap(agent.id); return; }
    if (absX >= DRAG_THRESHOLD || Math.abs(info.velocity.x) >= VELOCITY_THRESHOLD) {
      const dir = info.offset.x > 0 ? 1 : -1;
      animate(x, dir * FLY_DISTANCE, {
        duration: 0.3,
        onComplete: () => dir > 0 ? onSwipeRight(agent.id) : onSwipeLeft(agent.id),
      });
    } else {
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 });
    }
  }, [agent.id, onSwipeRight, onSwipeLeft, onTap, x]);

  /* Photo tap navigation */
  const handlePhotoTap = useCallback((e: React.MouseEvent) => {
    if (!isTop || !hasMulti) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const isRight = (e.clientX - rect.left) > rect.width / 2;
    setPhotoIdx(p => isRight ? Math.min(p + 1, allPhotos.length - 1) : Math.max(p - 1, 0));
    e.stopPropagation();
  }, [isTop, hasMulti, allPhotos.length]);

  const rating = agent.avg_rating || 0;
  const cats = (agent.categories || []).slice(0, 3);
  const services = (agent.services || []).slice(0, 3);

  return (
    <motion.div
      className="absolute touch-none select-none"
      style={{
        top: 0, left: stackIndex * 4, right: stackIndex * 4, bottom: 0,
        x: isTop ? x : 0, rotate: isTop ? rotate : 0,
        scale, y: yOff, zIndex: zIdx,
        opacity: stackIndex > 2 ? 0 : 1 - stackIndex * 0.12,
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={isTop ? handleDragEnd : undefined}
    >
      {/* Card wrapper with golden border */}
      <div
        className="w-full h-full rounded-3xl overflow-hidden relative flex flex-col"
        style={{
          border: `2.5px solid ${C.goldBorder}`,
          background: C.cardBg,
          boxShadow: stackIndex === 0
            ? '0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)'
            : `0 ${6 + stackIndex * 4}px ${16 + stackIndex * 8}px rgba(0,0,0,${0.05 + stackIndex * 0.03})`,
        }}
      >
        {/* ═══ SELECT / PASS overlays ═══ */}
        {isTop && (
          <>
            <motion.div
              className="absolute top-8 left-6 z-30 px-5 py-2 rounded-lg font-bold text-lg tracking-wider"
              style={{
                opacity: selectOpacity, color: C.selectGreen,
                border: `3px solid ${C.selectGreen}`,
                background: 'rgba(52,199,89,0.08)',
                transform: 'rotate(-12deg)', ...sans,
              }}
            >
              SELECT
            </motion.div>
            <motion.div
              className="absolute top-8 right-6 z-30 px-5 py-2 rounded-lg font-bold text-lg tracking-wider"
              style={{
                opacity: rejectOpacity, color: C.rejectRed,
                border: `3px solid ${C.rejectRed}`,
                background: 'rgba(255,59,48,0.08)',
                transform: 'rotate(12deg)', ...sans,
              }}
            >
              PASS
            </motion.div>
          </>
        )}

        {/* ═══ PHOTO SECTION (58%) ═══ */}
        <div
          className="relative w-full overflow-hidden"
          style={{ flex: '0 0 58%' }}
          onClick={hasMulti && isTop ? handlePhotoTap : undefined}
        >
          {/* WhatsApp progress bars */}
          {hasMulti && isTop && (
            <div className="absolute top-3 left-4 right-4 z-20 flex gap-1.5">
              {allPhotos.map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-[3px] rounded-full"
                  style={{
                    background: i === photoIdx
                      ? 'rgba(255,255,255,0.95)'
                      : i < photoIdx
                        ? 'rgba(255,255,255,0.6)'
                        : 'rgba(255,255,255,0.25)',
                    transition: 'background 0.2s',
                  }}
                />
              ))}
            </div>
          )}

          {hasPhotos ? (
            <img
              src={allPhotos[photoIdx] || allPhotos[0]}
              alt={agent.name}
              className="w-full h-full object-cover"
              loading={isTop ? 'eager' : 'lazy'}
              draggable={false}
            />
          ) : (
            /* No-photo fallback: premium gradient with icon */
            <div
              className="w-full h-full flex flex-col items-center justify-center gap-3"
              style={{ background: getGradient(agent.categories) }}
            >
              <Icon name={getCategoryIcon(agent.categories)} size={56} color="rgba(255,255,255,0.2)" weight={200} />
              <span
                className="text-6xl font-semibold tracking-widest"
                style={{ color: 'rgba(255,255,255,0.15)', ...serif }}
              >
                {getInitials(agent.name)}
              </span>
            </div>
          )}

          {/* Verified / MCP badge — top right */}
          <div className="absolute top-4 right-4 z-10">
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}
            >
              <Icon name="verified" size={14} color={C.goldLight} fill weight={400} />
              <span className="text-[10px] font-medium tracking-wider text-white/90" style={sans}>
                VERIFIED
              </span>
            </div>
          </div>

          {/* Photo count — bottom right */}
          {allPhotos.length > 1 && (
            <div className="absolute bottom-3 right-4 z-10">
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
              >
                <Icon name="photo_library" size={12} color="#fff" weight={300} />
                <span className="text-[10px] text-white/90" style={sans}>
                  {photoIdx + 1}/{allPhotos.length}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ═══ FLOATING HEART BUTTON (at boundary) ═══ */}
        <div
          className="absolute z-20 flex items-center justify-center"
          style={{
            top: '56%', right: 20,
            width: 48, height: 48,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldLight} 100%)`,
            boxShadow: '0 4px 14px rgba(197, 164, 78, 0.35)',
            transform: 'translateY(-50%)',
          }}
        >
          <Icon name="favorite" size={24} color="#FFFFFF" fill weight={400} />
        </div>

        {/* ═══ INFO SECTION (42%) ═══ */}
        <div className="flex-1 px-5 pt-4 pb-3 flex flex-col justify-between overflow-hidden">
          {/* Name + rating row */}
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h2
                className="text-xl font-semibold leading-tight truncate"
                style={{ ...serif, color: C.primary, maxWidth: '75%' }}
              >
                {agent.name}
              </h2>
              {rating > 0 && (
                <div className="flex items-center gap-0.5 flex-shrink-0 mt-0.5">
                  <Icon name="star" size={16} color={C.starGold} fill weight={400} />
                  <span className="text-sm font-semibold" style={{ color: C.primary, ...sans }}>
                    {rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Subtitle: category · location · reviews */}
            <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
              {cats[0] && (
                <span className="text-xs" style={{ color: C.textSub, ...sans }}>
                  {cats[0]}
                </span>
              )}
              {agent.city && (
                <>
                  <span className="text-xs" style={{ color: C.divider }}>·</span>
                  <div className="flex items-center gap-0.5">
                    <Icon name="location_on" size={13} color={C.textLight} weight={300} />
                    <span className="text-xs" style={{ color: C.textSub, ...sans }}>
                      {agent.city}{agent.state ? `, ${agent.state}` : ''}
                    </span>
                  </div>
                </>
              )}
              {agent.review_count > 0 && (
                <>
                  <span className="text-xs" style={{ color: C.divider }}>·</span>
                  <span className="text-xs" style={{ color: C.textSub, ...sans }}>
                    {agent.review_count} review{agent.review_count !== 1 ? 's' : ''}
                  </span>
                </>
              )}
            </div>

            {/* Bio if available */}
            {agent.bio && (
              <p
                className="text-xs leading-relaxed mb-2.5 line-clamp-2"
                style={{ color: C.textSub, ...sans }}
              >
                {agent.bio}
              </p>
            )}
          </div>

          {/* Service/Category chips */}
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {(services.length > 0 ? services : cats).slice(0, 3).map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full"
                style={{
                  border: `1px solid ${C.goldLight}`,
                  color: C.gold,
                  background: 'rgba(197, 164, 78, 0.05)',
                  ...sans,
                }}
              >
                <Icon name={getCategoryIcon([item])} size={12} color={C.gold} weight={300} />
                {item.length > 22 ? item.slice(0, 20) + '…' : item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}));

/* ══════════════════════════════════════════
   SelectedAgentCard — Horizontal list card
   ══════════════════════════════════════════ */
const SelectedAgentCard = memo(function SelectedAgentCard({
  agent, onTap, onRemove,
}: {
  agent: SwipeAgent;
  onTap: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const firstPhoto = agent.photos?.[0] || agent.photo_url;
  const rating = agent.avg_rating || 0;

  return (
    <div
      className="flex items-center gap-4 px-4 py-3.5 cursor-pointer transition-all hover:bg-gray-50/50"
      style={{ borderBottom: `1px solid ${C.divider}` }}
      onClick={() => onTap(agent.id)}
      role="button"
      tabIndex={0}
      aria-label={`View ${agent.name}`}
    >
      {/* Thumbnail */}
      <div
        className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden"
        style={{ border: `1.5px solid ${C.goldLight}` }}
      >
        {firstPhoto ? (
          <img src={firstPhoto} alt={agent.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: getGradient(agent.categories) }}
          >
            <span className="text-lg font-semibold" style={{ color: 'rgba(255,255,255,0.5)', ...serif }}>
              {getInitials(agent.name)}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium truncate" style={{ ...sans, color: C.primary }}>
          {agent.name}
        </h3>
        <p className="text-xs truncate mt-0.5" style={{ color: C.textSub, ...sans }}>
          {(agent.categories || []).slice(0, 2).join(' · ')}
          {agent.city ? ` · ${agent.city}` : ''}
        </p>
        {rating > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Icon name="star" size={12} color={C.starGold} fill weight={400} />
            <span className="text-[11px] font-medium" style={{ color: C.textSub, ...sans }}>
              {rating.toFixed(1)}
            </span>
            {agent.review_count > 0 && (
              <span className="text-[11px]" style={{ color: C.textLight }}>
                ({agent.review_count})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Remove */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(agent.id); }}
        className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-red-50"
        aria-label="Remove agent"
      >
        <Icon name="close" size={18} color={C.rejectRed} weight={400} />
      </button>
    </div>
  );
});

/* ══════════════════════════════════════════
   Main Page
   ══════════════════════════════════════════ */
export default function KirklandAgentsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'discover' | 'selected'>('discover');
  const topCardRef = useRef<SwipeCardHandle>(null);

  const {
    cards, selectedAgents, isLoading, isEmpty,
    swipeRight, swipeLeft, removeSelected, stats,
  } = useAgentSwipe();

  const handleTap = useCallback((id: string) => {
    navigate(`/hushh-agents/kirkland/${id}`);
  }, [navigate]);

  const handleReject = useCallback(() => {
    if (cards.length > 0 && topCardRef.current) topCardRef.current.triggerSwipe('left');
  }, [cards]);

  const handleSelect = useCallback(() => {
    if (cards.length > 0 && topCardRef.current) topCardRef.current.triggerSwipe('right');
  }, [cards]);

  return (
    <div
      className="min-h-screen flex flex-col selection:bg-amber-100"
      style={{ background: C.bg, color: C.primary, ...sans }}
    >
      {/* ═══ Header ═══ */}
      <header className="px-4 sm:px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/hushh-agents')}
          className="flex items-center gap-1.5 hover:opacity-60 transition-opacity"
          aria-label="Back"
        >
          <Icon name="arrow_back_ios" size={18} color={C.textSub} weight={300} />
          <span className="text-sm" style={{ color: C.textSub }}>Back</span>
        </button>

        <h1 className="text-base tracking-[0.15em] font-medium uppercase" style={{ ...serif, color: C.primary }}>
          {activeTab === 'discover' ? 'Discover Agents' : `Selected (${stats.selected})`}
        </h1>

        <div className="w-14" />
      </header>

      {/* ═══ Content ═══ */}
      <div className="flex-1 flex flex-col items-center px-4 pt-2 pb-28">
        {activeTab === 'discover' ? (
          <div className="w-full max-w-[380px] flex-1 flex flex-col items-center">
            {/* Card Stack */}
            <div
              className="relative w-full flex-1 max-h-[540px] min-h-[420px]"
              style={{ perspective: '1200px' }}
            >
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div
                      className="w-16 h-16 rounded-2xl mx-auto mb-4 animate-pulse"
                      style={{ border: `2px solid ${C.goldLight}`, background: C.divider }}
                    />
                    <p className="text-sm" style={{ color: C.textSub }}>Loading agents...</p>
                  </div>
                </div>
              ) : isEmpty && cards.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center px-6">
                    <Icon name="check_circle" size={56} color={C.goldLight} weight={200} className="mx-auto mb-4 block" />
                    <h2 className="text-2xl mb-2" style={serif}>All caught up</h2>
                    <p className="text-sm mb-6" style={{ color: C.textSub }}>
                      You've reviewed all {stats.total} agents.
                    </p>
                    <button
                      onClick={() => setActiveTab('selected')}
                      className="px-6 py-3 text-sm font-medium text-white rounded-full"
                      style={{ background: C.gold }}
                    >
                      View Selected ({stats.selected})
                    </button>
                  </div>
                </div>
              ) : (
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
              <div className="flex items-center gap-8 py-5">
                <button
                  onClick={handleReject}
                  className="w-[60px] h-[60px] rounded-full flex items-center justify-center transition-transform active:scale-90"
                  style={{
                    border: `2px solid ${C.rejectRed}`,
                    background: 'rgba(255,59,48,0.04)',
                    boxShadow: '0 4px 12px rgba(255,59,48,0.1)',
                  }}
                  aria-label="Pass"
                >
                  <Icon name="close" size={28} color={C.rejectRed} weight={500} />
                </button>

                <button
                  onClick={handleSelect}
                  className="w-[60px] h-[60px] rounded-full flex items-center justify-center transition-transform active:scale-90"
                  style={{
                    background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldLight} 100%)`,
                    boxShadow: '0 4px 16px rgba(197, 164, 78, 0.3)',
                  }}
                  aria-label="Select"
                >
                  <Icon name="favorite" size={28} color="#FFFFFF" fill weight={400} />
                </button>
              </div>
            )}

            {/* Progress bar */}
            {!isLoading && (
              <div className="w-full flex items-center gap-3 pb-2">
                <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: C.divider }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      background: `linear-gradient(90deg, ${C.gold}, ${C.goldLight})`,
                      width: stats.total > 0 ? `${(stats.swiped / stats.total) * 100}%` : '0%',
                    }}
                  />
                </div>
                <span className="text-[11px] flex-shrink-0" style={{ color: C.textLight }}>
                  {stats.swiped}/{stats.total}
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
                  <Icon name="swipe_right" size={56} color={C.goldLight} weight={200} className="mx-auto mb-4 block" />
                  <h2 className="text-xl mb-2" style={serif}>No agents selected</h2>
                  <p className="text-sm mb-6" style={{ color: C.textSub }}>
                    Swipe right on agents you'd like to work with.
                  </p>
                  <button
                    onClick={() => setActiveTab('discover')}
                    className="px-6 py-3 text-sm font-medium text-white rounded-full"
                    style={{ background: C.gold }}
                  >
                    Start Discovering
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="px-4 py-3">
                  <p className="text-[11px] tracking-[0.2em] uppercase font-medium" style={{ color: C.textLight }}>
                    {selectedAgents.length} agent{selectedAgents.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
                {selectedAgents.map((a) => (
                  <SelectedAgentCard key={a.id} agent={a} onTap={handleTap} onRemove={removeSelected} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══ Bottom Tab Bar ═══ */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex"
        style={{
          background: C.cardBg,
          borderTop: `1px solid ${C.divider}`,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <button
          onClick={() => setActiveTab('discover')}
          className="flex-1 flex flex-col items-center gap-1 py-3 transition-opacity"
          style={{ opacity: activeTab === 'discover' ? 1 : 0.4 }}
          aria-label="Discover"
        >
          <Icon
            name="style"
            size={22}
            color={activeTab === 'discover' ? C.gold : C.textSub}
            fill={activeTab === 'discover'}
            weight={activeTab === 'discover' ? 400 : 300}
          />
          <span className="text-[11px] font-medium" style={{ color: activeTab === 'discover' ? C.gold : C.textSub }}>
            Discover
          </span>
        </button>

        <button
          onClick={() => setActiveTab('selected')}
          className="flex-1 flex flex-col items-center gap-1 py-3 transition-opacity relative"
          style={{ opacity: activeTab === 'selected' ? 1 : 0.4 }}
          aria-label={`Selected (${stats.selected})`}
        >
          <Icon
            name="favorite"
            size={22}
            color={activeTab === 'selected' ? C.gold : C.textSub}
            fill={activeTab === 'selected'}
            weight={activeTab === 'selected' ? 400 : 300}
          />
          <span className="text-[11px] font-medium" style={{ color: activeTab === 'selected' ? C.gold : C.textSub }}>
            Selected
          </span>
          {stats.selected > 0 && (
            <span
              className="absolute top-1.5 right-1/4 w-5 h-5 flex items-center justify-center rounded-full text-[9px] font-bold text-white"
              style={{ background: C.selectGreen, transform: 'translate(50%, -25%)' }}
            >
              {stats.selected > 99 ? '99+' : stats.selected}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
