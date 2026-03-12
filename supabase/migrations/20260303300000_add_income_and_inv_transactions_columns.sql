-- Migration: Add Income + Investment Transactions columns to user_financial_data

-- income_data: Bank income streams from deposit activity
ALTER TABLE public.user_financial_data
  ADD COLUMN IF NOT EXISTS income_data JSONB;

-- investment_transactions: Investment transaction history
ALTER TABLE public.user_financial_data
  ADD COLUMN IF NOT EXISTS investment_transactions JSONB;

COMMENT ON COLUMN public.user_financial_data.income_data IS 'Bank income data from Plaid /credit/bank_income/get';
COMMENT ON COLUMN public.user_financial_data.investment_transactions IS 'Investment transactions from Plaid /investments/transactions/get';
