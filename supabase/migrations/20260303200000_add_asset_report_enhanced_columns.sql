-- Migration: Add enhanced Assets columns to user_financial_data
-- These support: PDF reports, Fast Assets, Refresh, Audit Copy features

-- asset_report_id: Plaid's unique ID for the asset report
ALTER TABLE public.user_financial_data
  ADD COLUMN IF NOT EXISTS asset_report_id TEXT;

-- asset_report_status: Track report lifecycle (pending | complete | failed | refreshing)
ALTER TABLE public.user_financial_data
  ADD COLUMN IF NOT EXISTS asset_report_status TEXT DEFAULT 'pending';

-- asset_report_days_requested: How many days of history were requested
ALTER TABLE public.user_financial_data
  ADD COLUMN IF NOT EXISTS asset_report_days_requested INTEGER DEFAULT 60;

-- asset_report_fast_token: Separate token for Fast Assets (quick balance + identity)
ALTER TABLE public.user_financial_data
  ADD COLUMN IF NOT EXISTS asset_report_fast_token TEXT;

-- audit_copy_token: Token for Fannie Mae / Freddie Mac / Ocrolus audit copies
ALTER TABLE public.user_financial_data
  ADD COLUMN IF NOT EXISTS audit_copy_token TEXT;

-- asset_report_refreshed_at: When the report was last refreshed
ALTER TABLE public.user_financial_data
  ADD COLUMN IF NOT EXISTS asset_report_refreshed_at TIMESTAMPTZ;

-- asset_report_insights: Categorized transactions + merchant data (include_insights=true)
ALTER TABLE public.user_financial_data
  ADD COLUMN IF NOT EXISTS asset_report_insights JSONB;

-- Add comment for documentation
COMMENT ON COLUMN public.user_financial_data.asset_report_id IS 'Plaid asset_report_id from /asset_report/create';
COMMENT ON COLUMN public.user_financial_data.asset_report_status IS 'pending | complete | failed | refreshing';
COMMENT ON COLUMN public.user_financial_data.asset_report_days_requested IS 'Number of days of transaction history requested';
COMMENT ON COLUMN public.user_financial_data.asset_report_fast_token IS 'Token for Fast Assets version (balance + identity only)';
COMMENT ON COLUMN public.user_financial_data.audit_copy_token IS 'Token for audit copy shared with Fannie Mae/Freddie Mac/Ocrolus';
COMMENT ON COLUMN public.user_financial_data.asset_report_refreshed_at IS 'Timestamp of last asset report refresh';
COMMENT ON COLUMN public.user_financial_data.asset_report_insights IS 'Asset report with categorized transactions and merchant info';
