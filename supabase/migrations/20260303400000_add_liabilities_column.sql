-- Add liabilities_data column to user_financial_data
ALTER TABLE public.user_financial_data
  ADD COLUMN IF NOT EXISTS liabilities_data jsonb DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN public.user_financial_data.liabilities_data IS 'Plaid Liabilities data: credit cards, student loans, mortgages';
