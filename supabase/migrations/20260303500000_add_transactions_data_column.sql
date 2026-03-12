-- Add transactions_data column to user_financial_data
-- Stores bank transaction history from Plaid /transactions/sync

ALTER TABLE public.user_financial_data
  ADD COLUMN IF NOT EXISTS transactions_data jsonb DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.user_financial_data.transactions_data IS 'Bank transaction history from Plaid transactions/sync (added/modified/removed transactions)';
