-- Migration: 20250408082517_allow_seconds.sql
-- Modify periods table to use DECIMAL instead of INTEGER for duration
ALTER TABLE public.periods 
  ALTER COLUMN planned_duration_minutes TYPE DECIMAL(10, 4),
  ALTER COLUMN actual_duration_minutes TYPE DECIMAL(10, 4);

-- Modify sessions table to use DECIMAL instead of INTEGER for totals
ALTER TABLE public.sessions
  ALTER COLUMN total_deep_work_minutes TYPE DECIMAL(10, 4),
  ALTER COLUMN total_deep_rest_minutes TYPE DECIMAL(10, 4);

-- Add comments to document changes
COMMENT ON TABLE public.periods IS 'Durations are stored as decimal minutes with precision to support seconds';
COMMENT ON TABLE public.sessions IS 'Total durations are stored as decimal minutes with precision to support seconds';