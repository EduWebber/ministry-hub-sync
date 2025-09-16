-- Make user_id nullable in profiles table for imported students
-- This allows creating profiles without requiring auth.users entries

ALTER TABLE public.profiles 
ALTER COLUMN user_id DROP NOT NULL;

-- Update the unique constraint to allow multiple NULL values
DROP INDEX IF EXISTS profiles_user_id_key;
CREATE UNIQUE INDEX profiles_user_id_unique 
ON public.profiles (user_id) 
WHERE user_id IS NOT NULL;

-- Update RLS policies to handle NULL user_id
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;

-- New policies that handle both authenticated users and imported students
CREATE POLICY profiles_select_policy ON public.profiles
  FOR SELECT USING (
    auth.uid() = user_id OR 
    public.get_user_role(auth.uid()) IN ('admin', 'instrutor')
  );

CREATE POLICY profiles_update_policy ON public.profiles
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    public.get_user_role(auth.uid()) IN ('admin', 'instrutor')
  );

CREATE POLICY profiles_insert_policy ON public.profiles
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    public.get_user_role(auth.uid()) IN ('admin', 'instrutor') OR
    user_id IS NULL
  );

CREATE POLICY profiles_delete_policy ON public.profiles
  FOR DELETE USING (
    public.get_user_role(auth.uid()) IN ('admin', 'instrutor')
  );