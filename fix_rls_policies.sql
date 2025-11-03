-- Clean up duplicate RLS policies
-- Run this in Supabase SQL Editor

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users and service role" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_public" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

-- Create clean policies
-- Allow anyone to read profiles
CREATE POLICY "profiles_select_all"
ON profiles FOR SELECT
TO public
USING (true);

-- Allow authenticated users to insert their own profile
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
TO public
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
TO public
USING (auth.uid() = user_id);

-- Verify RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Test the policy
SELECT user_id, full_name, email, role FROM profiles LIMIT 5;
