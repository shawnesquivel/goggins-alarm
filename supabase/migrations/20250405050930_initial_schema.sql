-- Create users table that extends Supabase auth.users
-- Ref: User_Workflow.md 1.4 - Default timer settings
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  default_deep_work_minutes INTEGER DEFAULT 30, -- Ref: 1.4.1
  default_deep_rest_minutes INTEGER DEFAULT 5, -- Ref: 1.4.1
  daily_goal_minutes INTEGER DEFAULT 60, -- Ref: 1.6.4.1 - Daily goal across all projects
  is_premium BOOLEAN DEFAULT false
);

-- Projects table
-- Ref: User_Workflow.md 1.2 - Project setup during onboarding
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- Ref: 1.2.1 Company Name / YouTube / Startup
  goal TEXT, -- Ref: 1.2.2 "Hit $10K MRR by December 31, 2025"
  color TEXT, -- Ref: 1.2.4 project_color
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Sessions table
-- Ref: User_Workflow.md 1.5 & 1.6 - Setup and tracking of work sessions
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  task TEXT NOT NULL, -- Ref: 1.5.4.2.1 - Extracted task from voice
  intention_transcription TEXT, -- Ref: 1.5.4.1 - Full transcription
  transcription_error TEXT, -- Ref: 1.5.6.4 - Error information if transcription failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  total_deep_work_minutes INTEGER DEFAULT 0, -- Aggregated from periods
  total_deep_rest_minutes INTEGER DEFAULT 0, -- Aggregated from periods
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'cancelled')) DEFAULT 'not_started',
  cancelled_reason TEXT, -- Only if cancelled
  completed BOOLEAN DEFAULT false, -- Ref: 1.6.7.3 - Track completion status
  user_notes TEXT -- Ref: 1.6.8.2 - Optional notes for the entire session
);

-- Unified periods table for both work and rest
-- Ref: User_Workflow.md 1.6.1 (DeepWorkScreen) and 1.6.2 (DeepRestScreen)
CREATE TABLE IF NOT EXISTS public.periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('work', 'rest')),
  planned_duration_minutes INTEGER NOT NULL, -- Ref: 1.5.4.2.3 - Time from intention
  actual_duration_minutes INTEGER, -- Ref: 1.6.1.2 - Actual time spent including overtime
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  quality_rating INTEGER CHECK (quality_rating IS NULL OR (quality_rating BETWEEN 1 AND 5)), -- Ref: 1.6.1.3.2.1
  distraction_reasons_selected TEXT[], -- Ref: 1.6.1.3.1.2 - Reasons for ending early
  rest_activities_selected TEXT[], -- Ref: 1.6.3.2 - Activities during rest
  user_notes TEXT, -- Ref: 1.6.3.4 - Notes about distractions or rest activities
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- App errors table for client-side error tracking
CREATE TABLE IF NOT EXISTS public.app_errors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id),
  error_type TEXT NOT NULL,
  error_message TEXT,
  component TEXT, -- Where in the app the error occurred
  session_id UUID REFERENCES public.sessions(id), -- Optional reference to session if applicable
  device_info JSONB, -- Basic device info like platform and version
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RevenueCat error logging table (focused only on critical issues)
CREATE TABLE IF NOT EXISTS public.revenuecat_errors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id),
  event_type TEXT NOT NULL,
  error_message TEXT,
  payload JSONB, -- Store minimal payload data related to the error
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);



-- Create function to handle RevenueCat webhook data
CREATE OR REPLACE FUNCTION public.handle_revenuecat_webhook(webhook_data JSONB)
RETURNS void AS $$
DECLARE
  user_uuid UUID;
  event_type TEXT;
BEGIN
  -- Extract values for easier reference
  user_uuid := (webhook_data->'event'->>'app_user_id')::UUID;
  event_type := webhook_data->'event'->>'type';
  
  -- Check if the user exists
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = user_uuid) THEN
    -- Log the error if user doesn't exist but we got a webhook for them
    INSERT INTO public.revenuecat_errors (
      user_id, 
      event_type, 
      error_message, 
      payload
    )
    VALUES (
      user_uuid, 
      event_type, 
      'User not found in database', 
      jsonb_build_object('event_type', event_type, 'user_id', user_uuid)
    );
    RETURN;
  END IF;

  -- Update user premium status based on webhook payload
  BEGIN
    UPDATE public.users
    SET 
      is_premium = (event_type IN ('INITIAL_PURCHASE', 'RENEWAL') 
                    AND (webhook_data->'event'->>'expiration_at_ms')::bigint > (EXTRACT(EPOCH FROM NOW()) * 1000)::bigint),
      updated_at = NOW()
    WHERE id = user_uuid;
  EXCEPTION WHEN OTHERS THEN
    -- Log any errors during the update process
    INSERT INTO public.revenuecat_errors (
      user_id, 
      event_type, 
      error_message, 
      payload
    )
    VALUES (
      user_uuid, 
      event_type, 
      'Error updating user subscription: ' || SQLERRM, 
      jsonb_build_object('event_type', event_type, 'user_id', user_uuid)
    );
  END;
END;
$$ LANGUAGE plpgsql;

-- Add Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenuecat_errors ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own data" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

-- Projects table policies
CREATE POLICY "Users can view their own projects" 
  ON public.projects FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" 
  ON public.projects FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
  ON public.projects FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
  ON public.projects FOR DELETE 
  USING (auth.uid() = user_id);

-- Sessions table policies
CREATE POLICY "Users can view their own sessions" 
  ON public.sessions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" 
  ON public.sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" 
  ON public.sessions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" 
  ON public.sessions FOR DELETE 
  USING (auth.uid() = user_id);

-- Periods table policies
CREATE POLICY "Users can view their own periods" 
  ON public.periods FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.sessions 
    WHERE public.sessions.id = public.periods.session_id 
    AND public.sessions.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own periods" 
  ON public.periods FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.sessions 
    WHERE public.sessions.id = public.periods.session_id 
    AND public.sessions.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own periods" 
  ON public.periods FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.sessions 
    WHERE public.sessions.id = public.periods.session_id 
    AND public.sessions.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own periods" 
  ON public.periods FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.sessions 
    WHERE public.sessions.id = public.periods.session_id 
    AND public.sessions.user_id = auth.uid()
  ));

-- App errors policies (allow service role to view all, users to insert their own)
CREATE POLICY "Service role can view all app errors" 
  ON public.app_errors FOR SELECT 
  USING (auth.role() = 'service_role');

CREATE POLICY "Users can insert their own error reports" 
  ON public.app_errors FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RevenueCat errors policies (only service role can access)
CREATE POLICY "Only service role can access RevenueCat errors" 
  ON public.revenuecat_errors
  USING (auth.role() = 'service_role');

-- Create indexes for performance
CREATE INDEX idx_periods_session_id ON public.periods(session_id);
CREATE INDEX idx_periods_started_at ON public.periods(started_at);
CREATE INDEX idx_periods_type ON public.periods(type);
CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_sessions_project_id ON public.sessions(project_id);
CREATE INDEX idx_sessions_status ON public.sessions(status);
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
