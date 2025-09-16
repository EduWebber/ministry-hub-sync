-- URGENT: Fix infinite recursion in profiles table
-- Copy and paste this into Supabase SQL Editor

-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create simple policies without recursion
CREATE POLICY "allow_all_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "allow_all_insert" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_update" ON profiles FOR UPDATE USING (true);
CREATE POLICY "allow_all_delete" ON profiles FOR DELETE USING (true);