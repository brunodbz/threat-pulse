-- Disable email confirmation requirement
-- This will be configured in the Supabase dashboard, but we can ensure our database is ready

-- Add a comment to indicate that email confirmation should be disabled
COMMENT ON TABLE auth.users IS 'Email confirmation should be disabled in Supabase Auth settings to prevent duplicate signups';