-- Rename the completed column to task_completed to clarify its purpose
ALTER TABLE public.sessions RENAME COLUMN completed TO task_completed;

-- Add a comment to explain the field's purpose
COMMENT ON COLUMN public.sessions.task_completed IS 'Whether the user successfully completed the intended task (true) or ended it early/cancelled (false)';
