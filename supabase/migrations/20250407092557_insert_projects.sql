-- Add explicit policy for authenticated users to insert projects
CREATE POLICY "Authenticated users can insert projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own accounts
CREATE POLICY "Users can delete their own accounts"
ON public.users
FOR DELETE
USING (auth.uid() = id);

-- Service role policies for admin access
CREATE POLICY "Service role can access all user data"
ON public.users
FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all projects"
ON public.projects
FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all sessions"
ON public.sessions
FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all periods"
ON public.periods
FOR ALL
USING (auth.role() = 'service_role');
