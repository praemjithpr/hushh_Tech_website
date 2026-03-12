-- =====================================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- Adds enhanced Assets columns to user_financial_data
-- =====================================================

-- 7 NEW COLUMNS being added:
-- 1. asset_report_id         TEXT    — Plaid's unique ID for the asset report
-- 2. asset_report_status     TEXT    — pending | complete | failed | refreshing
-- 3. asset_report_days_requested INTEGER — How many days of history (default 60)
-- 4. asset_report_fast_token TEXT    — Token for Fast Assets (quick balance + identity)
-- 5. audit_copy_token        TEXT    — Token for Fannie Mae/Freddie Mac/Ocrolus
-- 6. asset_report_refreshed_at TIMESTAMPTZ — Last refresh timestamp
-- 7. asset_report_insights   JSONB   — Categorized transactions + merchant data

ALTER TABLE public.user_financial_data
  ADD COLUMN IF NOT EXISTS asset_report_id TEXT;

ALTER TABLE public.user_financial_data
  ADD COLUMN IF NOT EXISTS asset_report_status TEXT DEFAULT 'pending';

ALTER TABLE public.user_financial_data
  ADD COLUMN IF NOT EXISTS asset_report_days_requested INTEGER DEFAULT 60;

ALTER TABLE public.user_financial_data
  ADD COLUMN IF NOT EXISTS asset_report_fast_token TEXT;

ALTER TABLE public.user_financial_data
  ADD COLUMN IF NOT EXISTS audit_copy_token TEXT;

ALTER TABLE public.user_financial_data
  ADD COLUMN IF NOT EXISTS asset_report_refreshed_at TIMESTAMPTZ;

ALTER TABLE public.user_financial_data
  ADD COLUMN IF NOT EXISTS asset_report_insights JSONB;

COMMENT ON COLUMN public.user_financial_data.asset_report_id IS 'Plaid asset_report_id from /asset_report/create';
COMMENT ON COLUMN public.user_financial_data.asset_report_status IS 'pending | complete | failed | refreshing';
COMMENT ON COLUMN public.user_financial_data.asset_report_days_requested IS 'Number of days of transaction history requested';
COMMENT ON COLUMN public.user_financial_data.asset_report_fast_token IS 'Token for Fast Assets version (balance + identity only)';
COMMENT ON COLUMN public.user_financial_data.audit_copy_token IS 'Token for audit copy shared with Fannie Mae/Freddie Mac/Ocrolus';
COMMENT ON COLUMN public.user_financial_data.asset_report_refreshed_at IS 'Timestamp of last asset report refresh';
COMMENT ON COLUMN public.user_financial_data.asset_report_insights IS 'Asset report with categorized transactions and merchant info';
