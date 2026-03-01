-- ============================================================
-- HUSHH AGENTS - COMPREHENSIVE USER TRACKING
-- ============================================================
-- Go to: https://supabase.com/dashboard/project/ibsisfnjxeowvdtvgzff/sql
-- Paste this entire file and click "Run"
-- ============================================================

-- ═══════════════════════════════════════════════════════════
-- TABLE 1: Hushh Agents Users - Main User Tracking Table
-- Tracks when each user first accessed Hushh Agents
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS hushh_agents_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  -- Timestamps
  first_access_at TIMESTAMPTZ DEFAULT now(),    -- When they first opened /hushh-agents
  last_access_at TIMESTAMPTZ DEFAULT now(),     -- Most recent access
  -- Usage Stats
  total_sessions INTEGER DEFAULT 1,             -- How many times they've accessed
  total_messages_sent INTEGER DEFAULT 0,        -- Total messages they've sent
  total_tokens_used INTEGER DEFAULT 0,          -- Total AI tokens consumed
  -- Preferences
  preferred_language TEXT DEFAULT 'en-US',
  subscription_tier TEXT DEFAULT 'limited' CHECK (tier IN ('limited', 'pro')),
  -- Metadata
  device_info JSONB DEFAULT '{}',               -- Browser, OS, etc.
  referral_source TEXT,                         -- Where they came from
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Fix constraint name for tier
ALTER TABLE hushh_agents_users DROP CONSTRAINT IF EXISTS hushh_agents_users_tier_check;
ALTER TABLE hushh_agents_users ADD CONSTRAINT hushh_agents_users_subscription_tier_check 
  CHECK (subscription_tier IN ('limited', 'pro'));

-- ═══════════════════════════════════════════════════════════
-- TABLE 2: Sessions - Track Each Visit
-- Logs every time a user opens Hushh Agents
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS hushh_agents_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  -- Session Details
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  -- Activity
  messages_sent INTEGER DEFAULT 0,
  messages_received INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  -- Context
  agent_id TEXT DEFAULT 'hushh',
  language_code TEXT DEFAULT 'en-US',
  -- Device Info
  user_agent TEXT,
  ip_address TEXT,
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- ═══════════════════════════════════════════════════════════
-- TABLE 3: Chat Logs - Every Single Message
-- Detailed log of all messages for analytics
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS hushh_agents_chat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES hushh_agents_sessions(id) ON DELETE SET NULL,
  -- Message Details
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  content_length INTEGER,
  -- AI Details
  agent_id TEXT DEFAULT 'hushh',
  model_used TEXT,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  response_time_ms INTEGER,                     -- How long AI took to respond
  -- Language
  language_code TEXT,
  detected_language TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- TABLE 4: Daily Usage Summary - Aggregated Stats
-- Pre-computed daily stats for fast dashboard queries
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS hushh_agents_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  -- User Counts
  new_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  returning_users INTEGER DEFAULT 0,
  -- Message Counts
  total_messages INTEGER DEFAULT 0,
  user_messages INTEGER DEFAULT 0,
  assistant_messages INTEGER DEFAULT 0,
  -- Token Usage
  total_tokens INTEGER DEFAULT 0,
  -- Session Stats
  total_sessions INTEGER DEFAULT 0,
  avg_session_duration_seconds INTEGER DEFAULT 0,
  -- Language Breakdown
  english_messages INTEGER DEFAULT 0,
  hindi_messages INTEGER DEFAULT 0,
  tamil_messages INTEGER DEFAULT 0,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- INDEXES for Fast Queries
-- ═══════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_hushh_agents_users_user_id ON hushh_agents_users(user_id);
CREATE INDEX IF NOT EXISTS idx_hushh_agents_users_first_access ON hushh_agents_users(first_access_at);
CREATE INDEX IF NOT EXISTS idx_hushh_agents_users_last_access ON hushh_agents_users(last_access_at);

CREATE INDEX IF NOT EXISTS idx_hushh_agents_sessions_user_id ON hushh_agents_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_hushh_agents_sessions_started_at ON hushh_agents_sessions(started_at);

CREATE INDEX IF NOT EXISTS idx_hushh_agents_chat_logs_user_id ON hushh_agents_chat_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_hushh_agents_chat_logs_created_at ON hushh_agents_chat_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_hushh_agents_chat_logs_session_id ON hushh_agents_chat_logs(session_id);

CREATE INDEX IF NOT EXISTS idx_hushh_agents_daily_stats_date ON hushh_agents_daily_stats(date);

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════
ALTER TABLE hushh_agents_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hushh_agents_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hushh_agents_chat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hushh_agents_daily_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only see their own data
DO $$ 
BEGIN
  -- hushh_agents_users
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own agent profile' AND tablename = 'hushh_agents_users') THEN
    CREATE POLICY "Users can view own agent profile" ON hushh_agents_users FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own agent profile' AND tablename = 'hushh_agents_users') THEN
    CREATE POLICY "Users can insert own agent profile" ON hushh_agents_users FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own agent profile' AND tablename = 'hushh_agents_users') THEN
    CREATE POLICY "Users can update own agent profile" ON hushh_agents_users FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  -- hushh_agents_sessions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own sessions' AND tablename = 'hushh_agents_sessions') THEN
    CREATE POLICY "Users can view own sessions" ON hushh_agents_sessions FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own sessions' AND tablename = 'hushh_agents_sessions') THEN
    CREATE POLICY "Users can insert own sessions" ON hushh_agents_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own sessions' AND tablename = 'hushh_agents_sessions') THEN
    CREATE POLICY "Users can update own sessions" ON hushh_agents_sessions FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  -- hushh_agents_chat_logs
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own chat logs' AND tablename = 'hushh_agents_chat_logs') THEN
    CREATE POLICY "Users can view own chat logs" ON hushh_agents_chat_logs FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own chat logs' AND tablename = 'hushh_agents_chat_logs') THEN
    CREATE POLICY "Users can insert own chat logs" ON hushh_agents_chat_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  -- hushh_agents_daily_stats - Allow service role to read/write, no user access
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role can manage daily stats' AND tablename = 'hushh_agents_daily_stats') THEN
    CREATE POLICY "Service role can manage daily stats" ON hushh_agents_daily_stats FOR ALL USING (true);
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════
-- ANALYTICS VIEWS - Pre-built Queries for Dashboard
-- ═══════════════════════════════════════════════════════════

-- View: User Activity Summary
CREATE OR REPLACE VIEW hushh_agents_user_activity AS
SELECT 
  u.user_id,
  u.email,
  u.name,
  u.first_access_at,
  u.last_access_at,
  u.total_sessions,
  u.total_messages_sent,
  u.total_tokens_used,
  u.preferred_language,
  u.subscription_tier,
  -- Time since last access
  EXTRACT(EPOCH FROM (now() - u.last_access_at)) / 3600 AS hours_since_last_access,
  -- Days since signup
  EXTRACT(EPOCH FROM (now() - u.first_access_at)) / 86400 AS days_since_signup
FROM hushh_agents_users u
ORDER BY u.last_access_at DESC;

-- View: Top Users by Usage
CREATE OR REPLACE VIEW hushh_agents_top_users AS
SELECT 
  u.user_id,
  u.email,
  u.name,
  u.total_messages_sent,
  u.total_tokens_used,
  u.total_sessions,
  ROUND(u.total_messages_sent::numeric / GREATEST(u.total_sessions, 1), 2) AS avg_messages_per_session
FROM hushh_agents_users u
ORDER BY u.total_messages_sent DESC
LIMIT 50;

-- View: Recent Activity (Last 7 Days)
CREATE OR REPLACE VIEW hushh_agents_recent_activity AS
SELECT 
  DATE(s.started_at) AS activity_date,
  COUNT(DISTINCT s.user_id) AS unique_users,
  COUNT(s.id) AS total_sessions,
  SUM(s.messages_sent) AS total_messages,
  SUM(s.tokens_used) AS total_tokens,
  AVG(s.duration_seconds)::INTEGER AS avg_session_duration
FROM hushh_agents_sessions s
WHERE s.started_at >= now() - INTERVAL '7 days'
GROUP BY DATE(s.started_at)
ORDER BY DATE(s.started_at) DESC;

-- View: Language Usage
CREATE OR REPLACE VIEW hushh_agents_language_usage AS
SELECT 
  language_code,
  COUNT(*) AS message_count,
  COUNT(DISTINCT user_id) AS unique_users,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS percentage
FROM hushh_agents_chat_logs
WHERE created_at >= now() - INTERVAL '30 days'
GROUP BY language_code
ORDER BY message_count DESC;

-- ═══════════════════════════════════════════════════════════
-- FUNCTIONS - Helper Functions for Tracking
-- ═══════════════════════════════════════════════════════════

-- Function: Track User Access (call when user opens /hushh-agents)
CREATE OR REPLACE FUNCTION track_hushh_agents_access(
  p_user_id UUID,
  p_email TEXT DEFAULT NULL,
  p_name TEXT DEFAULT NULL,
  p_device_info JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_user_record_id UUID;
BEGIN
  -- Upsert user record
  INSERT INTO hushh_agents_users (user_id, email, name, device_info)
  VALUES (p_user_id, p_email, p_name, p_device_info)
  ON CONFLICT (user_id) DO UPDATE SET
    last_access_at = now(),
    total_sessions = hushh_agents_users.total_sessions + 1,
    email = COALESCE(EXCLUDED.email, hushh_agents_users.email),
    name = COALESCE(EXCLUDED.name, hushh_agents_users.name),
    device_info = COALESCE(EXCLUDED.device_info, hushh_agents_users.device_info),
    updated_at = now()
  RETURNING id INTO v_user_record_id;
  
  RETURN v_user_record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Log Chat Message (call after each message)
CREATE OR REPLACE FUNCTION log_hushh_agents_message(
  p_user_id UUID,
  p_role TEXT,
  p_content TEXT,
  p_agent_id TEXT DEFAULT 'hushh',
  p_language_code TEXT DEFAULT 'en-US',
  p_input_tokens INTEGER DEFAULT 0,
  p_output_tokens INTEGER DEFAULT 0,
  p_response_time_ms INTEGER DEFAULT 0,
  p_session_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  -- Insert chat log
  INSERT INTO hushh_agents_chat_logs (
    user_id, session_id, role, content, content_length, 
    agent_id, language_code, input_tokens, output_tokens, response_time_ms
  )
  VALUES (
    p_user_id, p_session_id, p_role, p_content, LENGTH(p_content),
    p_agent_id, p_language_code, p_input_tokens, p_output_tokens, p_response_time_ms
  )
  RETURNING id INTO v_log_id;

  -- Update user's total stats (only for user messages)
  IF p_role = 'user' THEN
    UPDATE hushh_agents_users 
    SET 
      total_messages_sent = total_messages_sent + 1,
      total_tokens_used = total_tokens_used + p_input_tokens + p_output_tokens,
      updated_at = now()
    WHERE user_id = p_user_id;
  END IF;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════
-- Done!
-- ═══════════════════════════════════════════════════════════
SELECT 'Hushh Agents Tracking Tables & Views Created!' as status;

-- Quick summary of what was created:
SELECT 
  'Tables: hushh_agents_users, hushh_agents_sessions, hushh_agents_chat_logs, hushh_agents_daily_stats' as tables,
  'Views: hushh_agents_user_activity, hushh_agents_top_users, hushh_agents_recent_activity, hushh_agents_language_usage' as views,
  'Functions: track_hushh_agents_access(), log_hushh_agents_message()' as functions;
