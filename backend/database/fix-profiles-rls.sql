-- Fix profiles table RLS policies
-- This script addresses the infinite recursion issue with the profiles table

-- First, drop any existing RLS policies on profiles table
DROP POLICY IF EXISTS "Users can view own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profiles" ON profiles;

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create new RLS policies that work with the existing profiles table structure
-- These policies use auth.uid() to match the id column in profiles
CREATE POLICY "Users can view own profiles" ON profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profiles" ON profiles 
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profiles" ON profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profiles" ON profiles 
FOR DELETE USING (auth.uid() = id);

-- Add user_id column if it doesn't exist (for future compatibility)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing records to set user_id = id where user_id is null
UPDATE profiles SET user_id = id WHERE user_id IS NULL;

-- Create additional policies that work with both id and user_id
CREATE POLICY "Users can view own profiles by user_id" ON profiles 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profiles by user_id" ON profiles 
FOR UPDATE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO anon; 