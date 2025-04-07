-- SQL: DELETE user by EMAIL from auth.users
-- To use, change the email below.
BEGIN;

-- Find the user ID and use it directly in subsequent queries
DO $$ 
DECLARE
  target_user_id uuid; -- Changed variable name to avoid ambiguity
BEGIN
  -- Get the user ID
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'shawnesquivel24@gmail.com';

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email shawnesquivel24@gmail.com not found';
  END IF;

  -- Display the user ID (for confirmation)
  RAISE NOTICE 'Deleting user with ID: %', target_user_id;

  -- Step 1: Delete periods related to user's sessions
  DELETE FROM public.periods
  WHERE session_id IN (
    SELECT id FROM public.sessions 
    WHERE user_id = target_user_id -- Use renamed variable
  );

  -- Step 2: Delete app_errors related to user's sessions
  DELETE FROM public.app_errors
  WHERE session_id IN (
    SELECT id FROM public.sessions 
    WHERE user_id = target_user_id -- Use renamed variable
  );

  -- Step 3: Delete app_errors directly related to the user
  DELETE FROM public.app_errors
  WHERE user_id = target_user_id; -- Use renamed variable

  -- Step 4: Delete revenuecat_errors related to user
  DELETE FROM public.revenuecat_errors
  WHERE user_id = target_user_id; -- Use renamed variable

  -- Step 5: Delete sessions for user
  DELETE FROM public.sessions
  WHERE user_id = target_user_id; -- Use renamed variable

  -- Step 6: Delete projects created by user
  DELETE FROM public.projects
  WHERE user_id = target_user_id; -- Use renamed variable

  -- Step 7: Delete the user record from public.users
  DELETE FROM public.users
  WHERE id = target_user_id; -- Use renamed variable

  -- Step 8: Delete from auth.users
  DELETE FROM auth.users
  WHERE id = target_user_id; -- Use renamed variable

END $$;

-- If everything went well, commit the transaction
COMMIT;