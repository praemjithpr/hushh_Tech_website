/**
 * useAgentSwipe — Core hook for Tinder-style agent swiping
 *
 * Paginated feed (50/batch), optimistic writes, batch queue,
 * offline resilience via localStorage fallback.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from './useAuth';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://ibsisfnjxeowvdtvgzff.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

const BATCH_SIZE = 50;
const PREFETCH_THRESHOLD = 10;
const FLUSH_INTERVAL = 2000; // flush batch every 2s

export interface SwipeAgent {
  id: string;
  name: string;
  alias: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  avg_rating: number | null;
  review_count: number;
  categories: string[];
  photo_url: string | null;
  photos: string[];
  bio: string | null;
  services: string[];
  years_in_business: number | null;
  email: string | null;
  website: string | null;
}

interface SwipeQueueItem {
  agent_id: string;
  status: 'selected' | 'rejected';
}

export interface UseAgentSwipeReturn {
  /** Current card stack (top card = index 0) */
  cards: SwipeAgent[];
  /** Right-swiped agents */
  selectedAgents: SwipeAgent[];
  /** Loading states */
  isLoading: boolean;
  isFetchingMore: boolean;
  /** No more agents to show */
  isEmpty: boolean;
  /** Swipe right (select) */
  swipeRight: (agentId: string) => void;
  /** Swipe left (reject) */
  swipeLeft: (agentId: string) => void;
  /** Remove from selected list */
  removeSelected: (agentId: string) => void;
  /** Stats */
  stats: { selected: number; swiped: number; total: number };
}

export function useAgentSwipe(): UseAgentSwipeReturn {
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id;

  const [cards, setCards] = useState<SwipeAgent[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<SwipeAgent[]>([]);
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [totalAgents, setTotalAgents] = useState(0);

  /* Batch queue for writes */
  const queueRef = useRef<SwipeQueueItem[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Track if we've already fetched initial data */
  const initializedRef = useRef(false);

  /* ── Flush batch queue to Supabase ── */
  const flushQueue = useCallback(async () => {
    if (!userId || queueRef.current.length === 0) return;

    const batch = [...queueRef.current];
    queueRef.current = [];

    try {
      // Try batch RPC first
      const { error: rpcError } = await supabase.rpc('batch_agent_selections', {
        p_user_id: userId,
        p_selections: batch,
      });

      if (rpcError) {
        // Fallback: individual inserts
        for (const item of batch) {
          await supabase
            .from('user_agent_selections')
            .upsert(
              { user_id: userId, agent_id: item.agent_id, status: item.status },
              { onConflict: 'user_id,agent_id' }
            );
        }
      }
    } catch (err) {
      console.error('[SwipeQueue] Flush failed, caching locally:', err);
      // Cache in localStorage for later
      const cached = JSON.parse(localStorage.getItem('swipe_queue') || '[]');
      localStorage.setItem('swipe_queue', JSON.stringify([...cached, ...batch]));
    }
  }, [userId]);

  /* Schedule flush */
  const scheduleFlush = useCallback(() => {
    if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(flushQueue, FLUSH_INTERVAL);
  }, [flushQueue]);

  /* ── Fetch agent count ── */
  useEffect(() => {
    const fetchCount = async () => {
      const { count } = await supabase
        .from('kirkland_agents')
        .select('*', { count: 'exact', head: true })
        .eq('is_closed', false);
      setTotalAgents(count || 0);
    };
    fetchCount();
  }, []);

  /* ── Load existing selections on mount ── */
  useEffect(() => {
    if (!userId || !isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const loadExisting = async () => {
      try {
        // Load already-swiped IDs
        const { data: selections } = await supabase
          .from('user_agent_selections')
          .select('agent_id, status')
          .eq('user_id', userId);

        const existingIds = new Set<string>();
        const selectedIds: string[] = [];

        if (selections) {
          for (const s of selections) {
            existingIds.add(s.agent_id);
            if (s.status === 'selected') selectedIds.push(s.agent_id);
          }
        }
        setSwipedIds(existingIds);

        // Load selected agent details
        if (selectedIds.length > 0) {
          const { data: agents } = await supabase
            .from('kirkland_agents')
            .select('id,name,alias,phone,city,state,zip,avg_rating,review_count,categories,photo_url,photos,bio,services,years_in_business,email,website')
            .in('id', selectedIds);
          setSelectedAgents(agents || []);
        }
      } catch (err) {
        console.error('[SwipeInit] Error loading existing:', err);
      }
    };

    loadExisting();
  }, [userId, isAuthenticated]);

  /* ── Fetch next batch of agents ── */
  const fetchNextBatch = useCallback(async (existingSwipedIds?: Set<string>) => {
    const idsToExclude = existingSwipedIds || swipedIds;

    setIsFetchingMore(true);
    try {
      let query = supabase
        .from('kirkland_agents')
        .select('id,name,alias,phone,city,state,zip,avg_rating,review_count,categories,photo_url,photos,bio,services,years_in_business,email,website')
        .eq('is_closed', false)
        .order('avg_rating', { ascending: false, nullsFirst: false })
        .limit(BATCH_SIZE);

      // Exclude already-swiped
      if (idsToExclude.size > 0) {
        const excludeArray = Array.from(idsToExclude);
        // Supabase .not('id', 'in', ...) — max ~100 items per filter
        // For larger sets, we fetch more and filter client-side
        if (excludeArray.length <= 100) {
          query = query.not('id', 'in', `(${excludeArray.join(',')})`);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('[SwipeFetch] Error:', error);
        return;
      }

      let agents = data || [];

      // Client-side filter if too many excluded IDs for Supabase filter
      if (idsToExclude.size > 100) {
        agents = agents.filter((a) => !idsToExclude.has(a.id));
      }

      if (agents.length === 0) {
        setIsEmpty(true);
      } else {
        setCards((prev) => [...prev, ...agents]);
      }
    } catch (err) {
      console.error('[SwipeFetch] Error:', err);
    } finally {
      setIsFetchingMore(false);
      setIsLoading(false);
      initializedRef.current = true;
    }
  }, [swipedIds]);

  /* ── Initial fetch after selections loaded ── */
  useEffect(() => {
    if (initializedRef.current) return;
    // Wait until swipedIds is populated (or user is not authenticated)
    if (!isAuthenticated) {
      fetchNextBatch(new Set());
      return;
    }
    if (swipedIds.size > 0 || !isLoading) {
      fetchNextBatch(swipedIds);
    }
  }, [swipedIds, isAuthenticated, isLoading, fetchNextBatch]);

  /* ── Auto-prefetch when stack runs low ── */
  useEffect(() => {
    if (cards.length < PREFETCH_THRESHOLD && !isFetchingMore && !isEmpty && initializedRef.current) {
      fetchNextBatch();
    }
  }, [cards.length, isFetchingMore, isEmpty, fetchNextBatch]);

  /* ── Swipe right (select) ── */
  const swipeRight = useCallback((agentId: string) => {
    // Optimistic: remove from cards, add to selected
    setCards((prev) => {
      const agent = prev.find((a) => a.id === agentId);
      if (agent) {
        setSelectedAgents((sel) => [agent, ...sel]);
      }
      return prev.filter((a) => a.id !== agentId);
    });

    setSwipedIds((prev) => new Set(prev).add(agentId));

    // Queue for batch write
    queueRef.current.push({ agent_id: agentId, status: 'selected' });
    scheduleFlush();
  }, [scheduleFlush]);

  /* ── Swipe left (reject) ── */
  const swipeLeft = useCallback((agentId: string) => {
    setCards((prev) => prev.filter((a) => a.id !== agentId));
    setSwipedIds((prev) => new Set(prev).add(agentId));

    queueRef.current.push({ agent_id: agentId, status: 'rejected' });
    scheduleFlush();
  }, [scheduleFlush]);

  /* ── Remove from selected ── */
  const removeSelected = useCallback(async (agentId: string) => {
    setSelectedAgents((prev) => prev.filter((a) => a.id !== agentId));

    // Remove from DB so agent reappears in feed
    if (userId) {
      await supabase
        .from('user_agent_selections')
        .delete()
        .eq('user_id', userId)
        .eq('agent_id', agentId);
    }

    setSwipedIds((prev) => {
      const next = new Set(prev);
      next.delete(agentId);
      return next;
    });
  }, [userId]);

  /* ── Flush on unmount ── */
  useEffect(() => {
    return () => {
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
      // Sync flush on unmount
      if (queueRef.current.length > 0) {
        flushQueue();
      }
    };
  }, [flushQueue]);

  /* ── Stats ── */
  const stats = useMemo(() => ({
    selected: selectedAgents.length,
    swiped: swipedIds.size,
    total: totalAgents,
  }), [selectedAgents.length, swipedIds.size, totalAgents]);

  return {
    cards,
    selectedAgents,
    isLoading,
    isFetchingMore,
    isEmpty,
    swipeRight,
    swipeLeft,
    removeSelected,
    stats,
  };
}
