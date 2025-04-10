-- remove cancelled_reasons in favor of distraction_reasons_selected
ALTER TABLE public.sessions DROP COLUMN IF EXISTS cancelled_reasons;