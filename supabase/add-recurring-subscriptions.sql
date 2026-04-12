-- ============================================================
-- Add recurring subscription support
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Add frequency columns to plans (for MP preapproval)
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS frequency int DEFAULT 1;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS frequency_type text DEFAULT 'months'
  CHECK (frequency_type IN ('days', 'months'));

-- 2. Add MP preapproval tracking to subscriptions
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS mp_preapproval_id text;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS recurring boolean DEFAULT false;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS locale text DEFAULT 'es';

-- 3. Update plans with real frequency values and real prices
-- (ajustar precios cuando terminen las pruebas)
UPDATE public.plans SET frequency = 1, frequency_type = 'months' WHERE id = 'monthly';
UPDATE public.plans SET frequency = 3, frequency_type = 'months' WHERE id = 'quarterly';
UPDATE public.plans SET frequency = 6, frequency_type = 'months' WHERE id = 'semiannual';

-- 4. Add index for MP preapproval lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_mp_preapproval
  ON public.subscriptions(mp_preapproval_id)
  WHERE mp_preapproval_id IS NOT NULL;
