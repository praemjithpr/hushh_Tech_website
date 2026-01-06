# Hushh AI Cache Deployment Guide

## Summary
Redis/Upstash has been replaced with Supabase tables for rate limiting, caching, and analytics.

## Files Changed (Already Committed - commit 30c01cb)
1. **Created**: `supabase/migrations/20260107100000_create_hushh_ai_cache_tables.sql`
2. **Created**: `supabase/functions/hushh-ai-chat/supabase.ts` (replaces redis.ts)
3. **Updated**: `supabase/functions/hushh-ai-chat/index.ts` (import change)
4. **Deleted**: `supabase/functions/hushh-ai-chat/redis.ts`

---

## Manual Deployment Steps

### Step 1: Run Migration in Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/ibsisfnjxeowvdtvgzff/sql/new
2. Copy and paste the SQL below, then click "Run"

```sql
-- Migration: Create Hushh AI Cache Tables
-- Replaces Redis/Upstash with Supabase tables

-- 1. Rate Limiting Table
CREATE TABLE IF NOT EXISTS hushh_ai_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    window_seconds INTEGER DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_user_window 
ON hushh_ai_rate_limits(user_id, window_start);

CREATE INDEX IF NOT EXISTS idx_rate_limits_cleanup 
ON hushh_ai_rate_limits(window_start);

-- 2. Media Upload Limits Table
CREATE TABLE IF NOT EXISTS hushh_ai_media_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    upload_date DATE DEFAULT CURRENT_DATE,
    upload_count INTEGER DEFAULT 1,
    max_uploads INTEGER DEFAULT 20,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, upload_date)
);

CREATE INDEX IF NOT EXISTS idx_media_limits_user_date 
ON hushh_ai_media_limits(user_id, upload_date);

-- 3. Response Cache Table
CREATE TABLE IF NOT EXISTS hushh_ai_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key TEXT NOT NULL UNIQUE,
    cache_type TEXT NOT NULL,
    cache_value JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cache_key ON hushh_ai_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_cache_expiry ON hushh_ai_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_cache_type ON hushh_ai_cache(cache_type);

-- 4. Analytics Table
CREATE TABLE IF NOT EXISTS hushh_ai_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    metric_date DATE DEFAULT CURRENT_DATE,
    metric_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(metric_name, metric_date)
);

CREATE INDEX IF NOT EXISTS idx_analytics_metric_date 
ON hushh_ai_analytics(metric_name, metric_date);

-- 5. Enable RLS
ALTER TABLE hushh_ai_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE hushh_ai_media_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE hushh_ai_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE hushh_ai_analytics ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
CREATE POLICY "Service role can manage rate limits" ON hushh_ai_rate_limits
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage media limits" ON hushh_ai_media_limits
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage cache" ON hushh_ai_cache
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage analytics" ON hushh_ai_analytics
    FOR ALL USING (true) WITH CHECK (true);

-- 7. Cleanup function
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM hushh_ai_cache WHERE expires_at < NOW();
    DELETE FROM hushh_ai_rate_limits WHERE window_start < NOW() - INTERVAL '1 hour';
    DELETE FROM hushh_ai_media_limits WHERE upload_date < CURRENT_DATE - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Step 2: Deploy Edge Function

1. Go to: https://supabase.com/dashboard/project/ibsisfnjxeowvdtvgzff/functions
2. Find `hushh-ai-chat` function
3. Click "Edit" or redeploy from GitHub

OR use CLI (requires proper login):
```bash
supabase login
supabase functions deploy hushh-ai-chat --project-ref ibsisfnjxeowvdtvgzff
```

---

## What Changed

| Before (Redis) | After (Supabase) |
|----------------|------------------|
| `redis.ts` with Upstash | `supabase.ts` with PostgreSQL |
| Redis key-value store | Supabase tables with JSONB |
| External dependency | Native Supabase integration |
| Upstash REST API | Supabase client library |

## Tables Created

1. **hushh_ai_rate_limits** - Rate limiting (100 req/min per user)
2. **hushh_ai_media_limits** - Media upload limits (20/day per user)
3. **hushh_ai_cache** - Response and context caching
4. **hushh_ai_analytics** - Usage tracking

## Benefits
- No external Redis dependency
- No additional costs for Upstash
- Uses existing Supabase infrastructure
- Better observability through Supabase Dashboard
