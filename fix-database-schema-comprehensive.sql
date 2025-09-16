-- Comprehensive fix for database schema issues
-- Run this SQL in your Supabase dashboard SQL Editor

-- 1. Check current state of profiles table
DO $$
BEGIN
    -- Check if user_id column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'user_id'
    ) THEN
        -- Add user_id column if it doesn't exist
        ALTER TABLE public.profiles ADD COLUMN user_id UUID REFERENCES auth.users(id);
        RAISE NOTICE 'Added user_id column to profiles table';
    ELSE
        RAISE NOTICE 'user_id column already exists in profiles table';
    END IF;
    
    -- Ensure user_id column allows NULL values
    ALTER TABLE public.profiles ALTER COLUMN user_id DROP NOT NULL;
    
    -- Create unique index for non-null user_id values
    CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_unique_idx 
    ON public.profiles (user_id) 
    WHERE user_id IS NOT NULL;
    
    -- Check if the foreign key constraint exists on estudantes.profile_id
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_schema = 'public' 
        AND tc.table_name = 'estudantes' 
        AND tc.constraint_type = 'FOREIGN KEY'
        AND ccu.column_name = 'profile_id'
    ) THEN
        -- Add foreign key constraint if it doesn't exist
        ALTER TABLE public.estudantes 
        ADD CONSTRAINT estudantes_profile_id_fkey 
        FOREIGN KEY (profile_id) REFERENCES public.profiles(id);
        RAISE NOTICE 'Added foreign key constraint to estudantes.profile_id';
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists on estudantes.profile_id';
    END IF;
END $$;

-- 2. Update handle_new_user function
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

-- 3. Update RLS policies for profiles
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

-- 4. Add comment to document the column purpose
COMMENT ON COLUMN public.profiles.user_id IS 'ID of authenticated user. NULL for students imported via spreadsheet who do not have a login account.';

-- 5. Verification queries
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
AND column_name IN ('id', 'user_id');

SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
AND table_name = 'estudantes'
AND constraint_type = 'FOREIGN KEY';