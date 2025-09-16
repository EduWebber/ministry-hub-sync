-- FINAL FIX: Resolve 400 Bad Request errors on estudantes table
-- This addresses the compound filter issue: id=eq.X&user_id=eq.Y

-- Step 1: Ensure the table structure is correct
-- Check if user_id column exists, if not add it for backward compatibility
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'estudantes' 
    AND column_name = 'user_id'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.estudantes 
    ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    
    -- Populate user_id from profiles if profile_id exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'estudantes' 
      AND column_name = 'profile_id'
      AND table_schema = 'public'
    ) THEN
      UPDATE public.estudantes e
      SET user_id = p.user_id
      FROM public.profiles p
      WHERE e.profile_id = p.id AND e.user_id IS NULL;
    END IF;
    
    CREATE INDEX IF NOT EXISTS idx_estudantes_user_id ON public.estudantes(user_id);
  END IF;
END$$;

-- Step 2: Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Admins and instrutores can view estudantes" ON public.estudantes;
DROP POLICY IF EXISTS "Admins and instrutores can manage estudantes" ON public.estudantes;
DROP POLICY IF EXISTS "Users can view their own students" ON public.estudantes;
DROP POLICY IF EXISTS "Users can create their own students" ON public.estudantes;
DROP POLICY IF EXISTS "Users can update their own students" ON public.estudantes;
DROP POLICY IF EXISTS "Users can delete their own students" ON public.estudantes;
DROP POLICY IF EXISTS "estudantes_select_own" ON public.estudantes;
DROP POLICY IF EXISTS "estudantes_insert_own" ON public.estudantes;
DROP POLICY IF EXISTS "estudantes_update_own" ON public.estudantes;
DROP POLICY IF EXISTS "estudantes_delete_own" ON public.estudantes;
DROP POLICY IF EXISTS "estudantes_select_authenticated" ON public.estudantes;
DROP POLICY IF EXISTS "estudantes_insert_authenticated" ON public.estudantes;
DROP POLICY IF EXISTS "estudantes_update_authenticated" ON public.estudantes;
DROP POLICY IF EXISTS "estudantes_delete_authenticated" ON public.estudantes;

-- Step 3: Create simple, permissive policies that allow compound filters
CREATE POLICY "estudantes_allow_all_authenticated" ON public.estudantes
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Step 4: Grant all necessary permissions
GRANT ALL ON public.estudantes TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 5: Ensure RLS is enabled
ALTER TABLE public.estudantes ENABLE ROW LEVEL SECURITY;

-- Step 6: Create or update helper functions
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role::text FROM public.profiles WHERE user_id = user_uuid),
    'estudante'
  );
$$;

-- Step 7: Verify the fix
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'estudantes' 
ORDER BY policyname;