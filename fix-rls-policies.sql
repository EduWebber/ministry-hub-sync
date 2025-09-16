-- Fix infinite recursion in profiles RLS policies
-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;

-- Create simple, non-recursive policies
CREATE POLICY "profiles_select_policy" ON profiles
FOR SELECT USING (true);

CREATE POLICY "profiles_insert_policy" ON profiles
FOR INSERT WITH CHECK (true);

CREATE POLICY "profiles_update_policy" ON profiles
FOR UPDATE USING (true);

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;