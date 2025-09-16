-- Fix for missing user_id column in profiles table
-- Run this SQL in your Supabase dashboard SQL Editor

-- 1. Add user_id column to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN user_id UUID REFERENCES auth.users(id);
        RAISE NOTICE 'Added user_id column to profiles table';
    ELSE
        RAISE NOTICE 'user_id column already exists in profiles table';
    END IF;
END $$;

-- 2. Ensure user_id column allows NULL values (for imported students)
ALTER TABLE public.profiles ALTER COLUMN user_id DROP NOT NULL;

-- 3. Create unique index for non-null user_id values
CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_unique_idx 
ON public.profiles (user_id) 
WHERE user_id IS NOT NULL;

-- 4. Update handle_new_user function to properly handle the user_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Check if a profile already exists for this user_id
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = NEW.id) THEN
    INSERT INTO public.profiles (user_id, nome, email, role)
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email), 
      NEW.email,
      'estudante'
    );
  END IF;
  RETURN NEW;
END;
$$;

-- 5. Update RLS policies to account for the user_id column
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (
    auth.uid() = user_id OR -- User can view their own profile
    public.get_user_role(auth.uid()) IN ('admin', 'instrutor') -- Admins and instructors can view all
  );

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles  
  FOR UPDATE USING (
    auth.uid() = user_id OR -- User can update their own profile
    public.get_user_role(auth.uid()) IN ('admin', 'instrutor') -- Admins and instructors can update all
  );

DROP POLICY IF EXISTS "Users can insert profiles" ON public.profiles;
CREATE POLICY "Users can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR -- User can create their own profile
    public.get_user_role(auth.uid()) IN ('admin', 'instrutor') OR -- Admins and instructors can create profiles
    user_id IS NULL -- Allow creating profiles without user_id (imported students)
  );

-- 6. Add comment to document the column purpose
COMMENT ON COLUMN public.profiles.user_id IS 'ID of authenticated user. NULL for students imported via spreadsheet who do not have a login account.';

-- 7. Verification query
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
AND column_name = 'user_id';