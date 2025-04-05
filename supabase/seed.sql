-- Seed data for testing the deep work timer app
-- This creates test scenarios for frontend integration testing

-- First create auth users (required due to the foreign key constraint)
INSERT INTO auth.users (id, email, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'newuser@example.com', now()),
  ('22222222-2222-2222-2222-222222222222', 'poweruser@example.com', now()),
  ('33333333-3333-3333-3333-333333333333', 'busyuser@example.com', now())
ON CONFLICT (id) DO NOTHING;

-- Test User 1: New user with basic workflow
INSERT INTO public.users (id, email, default_deep_work_minutes, default_deep_rest_minutes, daily_goal_minutes, is_premium)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'newuser@example.com', 30, 5, 120, false);

-- Test User 2: Experienced user with multiple projects
INSERT INTO public.users (id, email, default_deep_work_minutes, default_deep_rest_minutes, daily_goal_minutes, is_premium)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'poweruser@example.com', 45, 10, 240, true);

-- Test User 3: User with interrupted sessions
INSERT INTO public.users (id, email, default_deep_work_minutes, default_deep_rest_minutes, daily_goal_minutes, is_premium)
VALUES 
  ('33333333-3333-3333-3333-333333333333', 'busyuser@example.com', 45, 15, 180, false);

-- Projects for User 1
INSERT INTO public.projects (id, user_id, name, goal, color, created_at)
VALUES
  ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'App Development', 'Launch MVP by end of quarter', '#4287f5', now() - interval '1 day');

-- Projects for User 2
INSERT INTO public.projects (id, user_id, name, goal, color, created_at)
VALUES
  ('a2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Content Creation', 'Publish 3 videos per week', '#f54242', now() - interval '7 days'),
  ('a2222222-2222-2222-2222-333333333333', '22222222-2222-2222-2222-222222222222', 'Learning Spanish', 'Conversational by summer', '#42f56f', now() - interval '5 days'),
  ('a2222222-2222-2222-2222-444444444444', '22222222-2222-2222-2222-222222222222', 'Side Business', 'First paying customer', '#f5d442', now() - interval '3 days');

-- Projects for User 3
INSERT INTO public.projects (id, user_id, name, goal, color, created_at)
VALUES
  ('a3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Thesis Writing', 'Complete draft by month end', '#9142f5', now() - interval '10 days');

-- Sessions and Periods for User 1: Basic workflow
INSERT INTO public.sessions (id, user_id, project_id, task, intention_transcription, created_at, total_deep_work_minutes, total_deep_rest_minutes, status, completed)
VALUES
  ('b1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Create login screen UI', 'I will design and implement the login screen UI with email and social login options', now() - interval '5 hours', 30, 5, 'completed', true);

-- Work period for User 1's session
INSERT INTO public.periods (id, session_id, type, planned_duration_minutes, actual_duration_minutes, started_at, ended_at, quality_rating, distraction_reasons_selected, completed, created_at)
VALUES
  ('c1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'work', 30, 30, now() - interval '6 hours', now() - interval '5.5 hours', 4, NULL, true, now() - interval '6 hours');

-- Rest period for User 1's session
INSERT INTO public.periods (id, session_id, type, planned_duration_minutes, actual_duration_minutes, started_at, ended_at, rest_activities_selected, completed, created_at)
VALUES
  ('c1111111-1111-1111-1111-222222222222', 'b1111111-1111-1111-1111-111111111111', 'rest', 5, 5, now() - interval '5.5 hours', now() - interval '5.4 hours', ARRAY['walking', 'stretching'], true, now() - interval '5.5 hours');

-- Sessions and periods for User 2 over multiple days with different projects
-- Day 1: Content Creation
INSERT INTO public.sessions (id, user_id, project_id, task, intention_transcription, created_at, total_deep_work_minutes, total_deep_rest_minutes, status, completed)
VALUES
  ('b2222222-2222-2222-2222-111111111111', '22222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'Script for video on productivity', 'Write a 10-minute script about deep work techniques', now() - interval '6 days', 90, 20, 'completed', true);

-- Work periods for User 2's Content Creation session
INSERT INTO public.periods (id, session_id, type, planned_duration_minutes, actual_duration_minutes, started_at, ended_at, quality_rating, completed, created_at)
VALUES
  ('c2222222-2222-2222-2222-111111111111', 'b2222222-2222-2222-2222-111111111111', 'work', 45, 50, now() - interval '6 days 4 hours', now() - interval '6 days 3 hours 10 minutes', 5, true, now() - interval '6 days 4 hours'),
  ('c2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-111111111111', 'work', 45, 40, now() - interval '6 days 2 hours 50 minutes', now() - interval '6 days 2 hours 10 minutes', 4, true, now() - interval '6 days 2 hours 50 minutes');

-- Rest periods for User 2's Content Creation session
INSERT INTO public.periods (id, session_id, type, planned_duration_minutes, actual_duration_minutes, started_at, ended_at, rest_activities_selected, completed, created_at)
VALUES
  ('c2222222-2222-2222-2222-333333333333', 'b2222222-2222-2222-2222-111111111111', 'rest', 10, 12, now() - interval '6 days 3 hours 10 minutes', now() - interval '6 days 2 hours 58 minutes', ARRAY['meditation', 'hydration'], true, now() - interval '6 days 3 hours 10 minutes'),
  ('c2222222-2222-2222-2222-444444444444', 'b2222222-2222-2222-2222-111111111111', 'rest', 10, 8, now() - interval '6 days 2 hours 10 minutes', now() - interval '6 days 2 hours 2 minutes', ARRAY['walking', 'snack'], true, now() - interval '6 days 2 hours 10 minutes');

-- Day 3: Learning Spanish
INSERT INTO public.sessions (id, user_id, project_id, task, intention_transcription, created_at, total_deep_work_minutes, total_deep_rest_minutes, status, completed)
VALUES
  ('b2222222-2222-2222-2222-555555555555', '22222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-333333333333', 'Practice verb conjugations', 'Study regular and irregular verb patterns', now() - interval '4 days', 45, 10, 'completed', true);

-- Work period for User 2's Spanish session
INSERT INTO public.periods (id, session_id, type, planned_duration_minutes, actual_duration_minutes, started_at, ended_at, quality_rating, completed, created_at)
VALUES
  ('c2222222-2222-2222-2222-555555555555', 'b2222222-2222-2222-2222-555555555555', 'work', 45, 45, now() - interval '4 days 3 hours', now() - interval '4 days 2 hours 15 minutes', 3, true, now() - interval '4 days 3 hours');

-- Rest period for User 2's Spanish session
INSERT INTO public.periods (id, session_id, type, planned_duration_minutes, actual_duration_minutes, started_at, ended_at, rest_activities_selected, completed, created_at)
VALUES
  ('c2222222-2222-2222-2222-666666666666', 'b2222222-2222-2222-2222-555555555555', 'rest', 10, 10, now() - interval '4 days 2 hours 15 minutes', now() - interval '4 days 2 hours 5 minutes', ARRAY['social media', 'hydration'], true, now() - interval '4 days 2 hours 15 minutes');

-- Day 5: Side Business
INSERT INTO public.sessions (id, user_id, project_id, task, intention_transcription, created_at, total_deep_work_minutes, total_deep_rest_minutes, status, completed)
VALUES
  ('b2222222-2222-2222-2222-777777777777', '22222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-444444444444', 'Customer research', 'Interview 3 potential customers about pain points', now() - interval '2 days', 60, 15, 'completed', true);

-- Work periods for User 2's Business session
INSERT INTO public.periods (id, session_id, type, planned_duration_minutes, actual_duration_minutes, started_at, ended_at, quality_rating, completed, created_at)
VALUES
  ('c2222222-2222-2222-2222-777777777777', 'b2222222-2222-2222-2222-777777777777', 'work', 60, 65, now() - interval '2 days 5 hours', now() - interval '2 days 3 hours 55 minutes', 5, true, now() - interval '2 days 5 hours');

-- Rest period for User 2's Business session
INSERT INTO public.periods (id, session_id, type, planned_duration_minutes, actual_duration_minutes, started_at, ended_at, rest_activities_selected, completed, created_at)
VALUES
  ('c2222222-2222-2222-2222-888888888888', 'b2222222-2222-2222-2222-777777777777', 'rest', 15, 15, now() - interval '2 days 3 hours 55 minutes', now() - interval '2 days 3 hours 40 minutes', ARRAY['walking', 'meditation', 'hydration'], true, now() - interval '2 days 3 hours 55 minutes');

-- Sessions and periods for User 3: Interrupted session
-- First session: interrupted and cancelled
INSERT INTO public.sessions (id, user_id, project_id, task, intention_transcription, created_at, total_deep_work_minutes, total_deep_rest_minutes, status, cancelled_reason)
VALUES
  ('b3333333-3333-3333-3333-111111111111', '33333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'Literature review chapter', 'Complete first draft of literature review', now() - interval '1 day 5 hours', 15, 0, 'cancelled', 'Unexpected meeting came up');

-- Work period for User 3's interrupted session
INSERT INTO public.periods (id, session_id, type, planned_duration_minutes, actual_duration_minutes, started_at, ended_at, quality_rating, distraction_reasons_selected, completed, created_at)
VALUES
  ('c3333333-3333-3333-3333-111111111111', 'b3333333-3333-3333-3333-111111111111', 'work', 45, 15, now() - interval '1 day 5 hours', now() - interval '1 day 4 hours 45 minutes', 2, ARRAY['notifications', 'coworkers', 'urgent task'], false, now() - interval '1 day 5 hours');

-- Second session: successful completion after interruption
INSERT INTO public.sessions (id, user_id, project_id, task, intention_transcription, created_at, total_deep_work_minutes, total_deep_rest_minutes, status, completed)
VALUES
  ('b3333333-3333-3333-3333-222222222222', '33333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'Literature review chapter', 'Restart and complete literature review draft', now() - interval '1 day 1 hour', 60, 15, 'completed', true);

-- Work periods for User 3's second session
INSERT INTO public.periods (id, session_id, type, planned_duration_minutes, actual_duration_minutes, started_at, ended_at, quality_rating, completed, created_at)
VALUES
  ('c3333333-3333-3333-3333-222222222222', 'b3333333-3333-3333-3333-222222222222', 'work', 30, 35, now() - interval '1 day 1 hour', now() - interval '1 day 25 minutes', 4, true, now() - interval '1 day 1 hour'),
  ('c3333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-222222222222', 'work', 30, 25, now() - interval '1 day 10 minutes', now() - interval '23 hours 45 minutes', 4, true, now() - interval '1 day 10 minutes');

-- Rest period for User 3's second session
INSERT INTO public.periods (id, session_id, type, planned_duration_minutes, actual_duration_minutes, started_at, ended_at, rest_activities_selected, completed, created_at)
VALUES
  ('c3333333-3333-3333-3333-444444444444', 'b3333333-3333-3333-3333-222222222222', 'rest', 15, 15, now() - interval '1 day 25 minutes', now() - interval '1 day 10 minutes', ARRAY['walking', 'hydration', 'nature'], true, now() - interval '1 day 25 minutes');
