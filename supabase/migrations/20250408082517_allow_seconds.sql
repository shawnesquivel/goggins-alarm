-- Migration: 20250408082517_allow_seconds.sql

-- Drop dependent views first
DROP VIEW IF EXISTS public.daily_analytics;
DROP VIEW IF EXISTS public.weekly_analytics;
DROP VIEW IF EXISTS public.monthly_analytics;

-- Modify periods table to use DECIMAL instead of INTEGER for duration
ALTER TABLE public.periods 
  ALTER COLUMN planned_duration_minutes TYPE DECIMAL(10, 4),
  ALTER COLUMN actual_duration_minutes TYPE DECIMAL(10, 4);

-- Modify sessions table to use DECIMAL instead of INTEGER for totals
ALTER TABLE public.sessions
  ALTER COLUMN total_deep_work_minutes TYPE DECIMAL(10, 4),
  ALTER COLUMN total_deep_rest_minutes TYPE DECIMAL(10, 4);

-- Recreate the views
CREATE OR REPLACE VIEW public.daily_analytics AS
SELECT 
  user_id,
  DATE(p.started_at) as day,
  SUM(CASE WHEN p.type = 'work' THEN p.actual_duration_minutes ELSE 0 END) as total_work_minutes,
  SUM(CASE WHEN p.type = 'rest' THEN p.actual_duration_minutes ELSE 0 END) as total_rest_minutes,
  COUNT(CASE WHEN p.type = 'work' THEN 1 END) as work_periods_count,
  AVG(CASE WHEN p.type = 'work' THEN p.quality_rating END) as avg_quality_rating,
  array_agg(DISTINCT p.distraction_reasons_selected) FILTER (WHERE p.distraction_reasons_selected IS NOT NULL) as all_distraction_reasons
FROM public.periods p
JOIN public.sessions s ON p.session_id = s.id
WHERE p.completed = true
GROUP BY user_id, DATE(p.started_at);

CREATE OR REPLACE VIEW public.weekly_analytics AS
SELECT 
  user_id,
  DATE_TRUNC('week', p.started_at) as week_start,
  SUM(CASE WHEN p.type = 'work' THEN p.actual_duration_minutes ELSE 0 END) as total_work_minutes,
  SUM(CASE WHEN p.type = 'rest' THEN p.actual_duration_minutes ELSE 0 END) as total_rest_minutes,
  COUNT(CASE WHEN p.type = 'work' THEN 1 END) as work_periods_count,
  AVG(CASE WHEN p.type = 'work' THEN p.quality_rating END) as avg_quality_rating,
  array_agg(DISTINCT p.distraction_reasons_selected) FILTER (WHERE p.distraction_reasons_selected IS NOT NULL) as all_distraction_reasons
FROM public.periods p
JOIN public.sessions s ON p.session_id = s.id
WHERE p.completed = true
GROUP BY user_id, DATE_TRUNC('week', p.started_at);

CREATE OR REPLACE VIEW public.monthly_analytics AS
SELECT 
  user_id,
  DATE_TRUNC('month', p.started_at) as month_start,
  SUM(CASE WHEN p.type = 'work' THEN p.actual_duration_minutes ELSE 0 END) as total_work_minutes,
  SUM(CASE WHEN p.type = 'rest' THEN p.actual_duration_minutes ELSE 0 END) as total_rest_minutes,
  COUNT(CASE WHEN p.type = 'work' THEN 1 END) as work_periods_count,
  AVG(CASE WHEN p.type = 'work' THEN p.quality_rating END) as avg_quality_rating,
  array_agg(DISTINCT p.distraction_reasons_selected) FILTER (WHERE p.distraction_reasons_selected IS NOT NULL) as all_distraction_reasons
FROM public.periods p
JOIN public.sessions s ON p.session_id = s.id
WHERE p.completed = true
GROUP BY user_id, DATE_TRUNC('month', p.started_at);

-- Add comments to document changes
COMMENT ON TABLE public.periods IS 'Durations are stored as decimal minutes with precision to support seconds';
COMMENT ON TABLE public.sessions IS 'Total durations are stored as decimal minutes with precision to support seconds';