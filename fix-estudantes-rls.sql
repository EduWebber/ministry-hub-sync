-- Fix estudantes table RLS policies to resolve 400 Bad Request errors
-- This addresses the issue where frontend is trying to update with compound filters

-- First, let's check if we need to add user_id column back for compatibility
DO $$
BEGIN
  -- Check if user_id column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'estudantes' 
    AND column_name = 'user_id'
    AND table_schema = 'public'
  ) THEN
    -- Add user_id column for backward compatibility
    ALTER TABLE public.estudantes 
    ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    
    -- Update existing records to populate user_id from profiles
    UPDATE public.estudantes e
    SET user_id = p.user_id
    FROM public.profiles p
    WHERE e.profile_id = p.id;
    
    -- Create index for performance
    CREATE INDEX IF NOT EXISTS idx_estudantes_user_id ON public.estudantes(user_id);
  END IF;
END$$;

-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Admins and instrutores can view estudantes" ON public.estudantes;
DROP POLICY IF EXISTS "Admins and instrutores can manage estudantes" ON public.estudantes;
DROP POLICY IF EXISTS "Users can view their own students" ON public.estudantes;
DROP POLICY IF EXISTS "Users can create their own students" ON public.estudantes;
DROP POLICY IF EXISTS "Users can update their own students" ON public.estudantes;
DROP POLICY IF EXISTS "Users can delete their own students" ON public.estudantes;

-- Create comprehensive RLS policies for estudantes table
-- Policy 1: Allow users to view their own student records
CREATE POLICY "estudantes_select_own" ON public.estudantes
  FOR SELECT 
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    public.get_user_role(auth.uid()) IN ('admin', 'instrutor')
  );

-- Policy 2: Allow users to insert their own student records
CREATE POLICY "estudantes_insert_own" ON public.estudantes
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR 
    public.get_user_role(auth.uid()) IN ('admin', 'instrutor')
  );

-- Policy 3: Allow users to update their own student records
CREATE POLICY "estudantes_update_own" ON public.estudantes
  FOR UPDATE 
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    public.get_user_role(auth.uid()) IN ('admin', 'instrutor')
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    public.get_user_role(auth.uid()) IN ('admin', 'instrutor')
  );

-- Policy 4: Allow users to delete their own student records
CREATE POLICY "estudantes_delete_own" ON public.estudantes
  FOR DELETE 
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    public.get_user_role(auth.uid()) IN ('admin', 'instrutor')
  );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estudantes TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE public.estudantes ENABLE ROW LEVEL SECURITY;

-- Create or update the get_user_role function to handle missing profiles
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE user_id = user_uuid),
    'estudante'::app_role
  );
$$;

-- Verify the fix by checking policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'estudantes' 
ORDER BY policyname;