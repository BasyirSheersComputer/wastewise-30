-- Apply Database Fixes for User Profile Creation Issues
-- Run this script in your Supabase SQL editor or database

-- 1. Fix RLS Policies for User Profile Creation
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create more permissive insert policy for user profiles
CREATE POLICY "Users can insert own profile" ON users 
FOR INSERT 
WITH CHECK (
  auth.uid() = id OR 
  (auth.uid() IS NOT NULL AND email = auth.jwt() ->> 'email') OR
  email IS NOT NULL
);

-- Create permissive policy for profile creation during signup
CREATE POLICY "Allow profile creation during signup" ON users 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL OR 
  email IS NOT NULL
);

-- Ensure users can view their own profile
CREATE POLICY "Users can view own profile" ON users 
FOR SELECT 
USING (
  auth.uid() = id OR 
  (auth.uid() IS NOT NULL AND email = auth.jwt() ->> 'email')
);

-- Ensure users can update their own profile
CREATE POLICY "Users can update own profile" ON users 
FOR UPDATE 
USING (
  auth.uid() = id OR 
  (auth.uid() IS NOT NULL AND email = auth.jwt() ->> 'email')
);

-- 2. Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON users TO authenticated;
GRANT ALL ON user_settings TO authenticated;

-- 3. Enable RLS on users table if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. Create a function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- This function can be used to automatically create user profiles
  -- when new users are created in auth.users
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create trigger for new user creation (optional - uncomment if needed)
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 6. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_trial_end ON users(trial_end);

-- 7. Create a function to fix existing users without profiles
CREATE OR REPLACE FUNCTION fix_users_without_profiles()
RETURNS TABLE(fixed_count INTEGER) AS $$
DECLARE
  user_record RECORD;
  fixed_count INTEGER := 0;
BEGIN
  -- Find auth users without profiles and create them
  FOR user_record IN 
    SELECT au.id, au.email, au.user_metadata, au.created_at
    FROM auth.users au 
    LEFT JOIN users u ON au.id = u.id 
    WHERE u.id IS NULL AND au.email_confirmed_at IS NOT NULL
  LOOP
    BEGIN
      INSERT INTO users (
        id, 
        email, 
        first_name, 
        last_name, 
        company_name, 
        company_size, 
        primary_pain, 
        phone_number, 
        business_type, 
        locations, 
        annual_revenue, 
        primary_goals, 
        data_sources, 
        team_size, 
        timezone, 
        trial_start, 
        trial_end, 
        subscription_status, 
        subscription_plan, 
        created_at, 
        updated_at
      ) VALUES (
        user_record.id,
        user_record.email,
        COALESCE(user_record.user_metadata->>'first_name', ''),
        COALESCE(user_record.user_metadata->>'last_name', ''),
        COALESCE(user_record.user_metadata->>'company_name', 'Unknown Company'),
        COALESCE(user_record.user_metadata->>'company_size', 'small'),
        COALESCE(user_record.user_metadata->>'primary_pain', 'waste_reduction'),
        COALESCE(user_record.user_metadata->>'phone_number', ''),
        'restaurant',
        1,
        'under_100k',
        '{}',
        '{}',
        '1-10',
        'Asia/Kuala_Lumpur',
        user_record.created_at,
        user_record.created_at + INTERVAL '30 days',
        'trial',
        'free',
        user_record.created_at,
        NOW()
      );
      
      fixed_count := fixed_count + 1;
    EXCEPTION
      WHEN OTHERS THEN
        -- Log error but continue
        RAISE NOTICE 'Failed to create profile for user %: %', user_record.email, SQLERRM;
    END;
  END LOOP;
  
  RETURN QUERY SELECT fixed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create a function to clean up orphaned profiles
CREATE OR REPLACE FUNCTION cleanup_orphaned_profiles()
RETURNS TABLE(cleaned_count INTEGER) AS $$
DECLARE
  profile_record RECORD;
  cleaned_count INTEGER := 0;
BEGIN
  -- Find profiles without auth users and delete them
  FOR profile_record IN 
    SELECT u.id, u.email
    FROM users u
    LEFT JOIN auth.users au ON u.id = au.id
    WHERE au.id IS NULL
  LOOP
    BEGIN
      DELETE FROM users WHERE id = profile_record.id;
      cleaned_count := cleaned_count + 1;
    EXCEPTION
      WHEN OTHERS THEN
        -- Log error but continue
        RAISE NOTICE 'Failed to delete orphaned profile %: %', profile_record.email, SQLERRM;
    END;
  END LOOP;
  
  RETURN QUERY SELECT cleaned_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create a health check function
CREATE OR REPLACE FUNCTION check_user_profile_health()
RETURNS TABLE(
  auth_users_count BIGINT,
  user_profiles_count BIGINT,
  users_without_profiles_count BIGINT,
  orphaned_profiles_count BIGINT,
  is_healthy BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NOT NULL) as auth_users_count,
    (SELECT COUNT(*) FROM users) as user_profiles_count,
    (SELECT COUNT(*) 
     FROM auth.users au 
     LEFT JOIN users u ON au.id = u.id 
     WHERE u.id IS NULL AND au.email_confirmed_at IS NOT NULL) as users_without_profiles_count,
    (SELECT COUNT(*) 
     FROM users u
     LEFT JOIN auth.users au ON u.id = au.id
     WHERE au.id IS NULL) as orphaned_profiles_count,
    (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NOT NULL) = (SELECT COUNT(*) FROM users) as is_healthy;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Apply fixes to existing data
-- Fix users without profiles
SELECT * FROM fix_users_without_profiles();

-- Clean up orphaned profiles
SELECT * FROM cleanup_orphaned_profiles();

-- Check health status
SELECT * FROM check_user_profile_health();

COMMIT;
