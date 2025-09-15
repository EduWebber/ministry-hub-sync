-- Quick fix for estudantes table RLS policies
-- Apply this in Supabase Dashboard > SQL Editor

-- Step 1: Drop all existing policies on estudantes table
DROP POLICY IF EXISTS "Admins and instrutores can view estudantes" ON public.estudantes;
DROP POLICY IF EXISTS "Admins and instrutores can manage estudantes" ON public.estudantes;
DROP POLICY IF EXISTS "Users can view their own students" ON public.estudantes;
DROP POLICY IF EXISTS "Users can create their own students" ON public.estudantes;
DROP POLICY IF EXISTS "Users can update their own students" ON public.estudantes;
DROP POLICY IF EXISTS "Users can delete their own students" ON public.estudantes;

-- Step 2: Create permissive policies for authenticated users
CREATE POLICY "estudantes_select_authenticated" ON public.estudantes
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "estudantes_insert_authenticated" ON public.estudantes
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "estudantes_update_authenticated" ON public.estudantes
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "estudantes_delete_authenticated" ON public.estudantes
  FOR DELETE TO authenticated
  USING (true);

-- Step 3: Grant permissions
GRANT ALL ON public.estudantes TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 4: Ensure RLS is enabled
ALTER TABLE public.estudantes ENABLE ROW LEVEL SECURITY;