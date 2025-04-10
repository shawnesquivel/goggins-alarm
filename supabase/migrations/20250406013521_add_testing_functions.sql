-- Add diagnostic functions for the database tester

-- Function to get connection and configuration info
CREATE OR REPLACE FUNCTION public.get_config_info()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT jsonb_build_object(
    'current_database', current_database(),
    'current_user', current_user,
    'current_timestamp', now(),
    'current_schemas', current_schemas(false),
    'version', version(),
    'search_path', current_setting('search_path')
  );
$$;

-- Function to get RLS policies info
CREATE OR REPLACE FUNCTION public.get_rls_policies()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT jsonb_agg(
    jsonb_build_object(
      'table', p.tablename,
      'policyname', p.policyname,
      'cmd', p.cmd,
      'roles', p.roles,
      'qual', p.qual,
      'with_check', p.with_check
    )
  )
  FROM pg_policies p
  WHERE p.schemaname = 'public';
$$;

-- Grant access to these functions
GRANT EXECUTE ON FUNCTION public.get_config_info() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_rls_policies() TO anon, authenticated, service_role;

-- Create function to check if schema views and tables match expectations
CREATE OR REPLACE FUNCTION public.check_schema_completeness()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'tables', (
      SELECT array_agg(tablename)
      FROM pg_tables
      WHERE schemaname = 'public'
    ),
    'views', (
      SELECT array_agg(viewname)
      FROM pg_views
      WHERE schemaname = 'public'
    ),
    'expected_tables', ARRAY[
      'users',
      'projects',
      'sessions',
      'periods'
    ],
    'missing_tables', (
      SELECT array_agg(t)
      FROM unnest(ARRAY[
        'users',
        'projects',
        'sessions',
        'periods'
      ]) AS t
      WHERE t NOT IN (
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
      )
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_schema_completeness() TO anon, authenticated, service_role;
