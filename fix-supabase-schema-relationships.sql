-- Fix Supabase Schema Relationship Issues
-- Run this in your Supabase SQL Editor to resolve the 400 errors

-- 1. First, let's check and fix the foreign key relationship
DO $$
BEGIN
    -- Check if the foreign key constraint exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_schema = 'public' 
        AND tc.table_name = 'estudantes' 
        AND tc.constraint_type = 'FOREIGN KEY'
        AND ccu.column_name = 'profile_id'
    ) THEN
        -- Add the foreign key constraint
        ALTER TABLE public.estudantes 
        ADD CONSTRAINT estudantes_profile_id_fkey 
        FOREIGN KEY (profile_id) REFERENCES public.profiles(id);
        RAISE NOTICE 'Added foreign key constraint estudantes.profile_id -> profiles.id';
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists';
    END IF;
END $$;

-- 2. Refresh the PostgREST schema cache
-- This is crucial for PostgREST to recognize relationship changes
NOTIFY pgrst, 'reload schema';

-- 3. Verify the relationship is working
-- Test query to ensure the relationship works
SELECT 
    e.id as estudante_id,
    e.genero,
    e.ativo,
    p.nome as profile_nome,
    p.email as profile_email
FROM estudantes e
JOIN profiles p ON e.profile_id = p.id
WHERE e.ativo = true
LIMIT 5;

-- 4. Check for any estudantes without corresponding profiles
SELECT 
    e.id,
    e.profile_id,
    CASE 
        WHEN p.id IS NULL THEN 'MISSING PROFILE'
        ELSE 'OK'
    END as status
FROM estudantes e
LEFT JOIN profiles p ON e.profile_id = p.id
WHERE e.ativo = true
AND p.id IS NULL;

-- 5. If there are orphaned estudantes, you might need to create profiles for them
-- (Uncomment the following section if needed)
/*
INSERT INTO profiles (id, nome, email, role, created_at)
SELECT 
    e.profile_id,
    'Estudante Importado',
    CONCAT('estudante_', e.id, '@exemplo.com'),
    'estudante',
    NOW()
FROM estudantes e
LEFT JOIN profiles p ON e.profile_id = p.id
WHERE e.ativo = true
AND p.id IS NULL
ON CONFLICT (id) DO NOTHING;
*/

-- 6. Update RLS policies to be more permissive for debugging
-- Temporarily allow broader access to troubleshoot
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.profiles;
CREATE POLICY "Allow read access for authenticated users" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.estudantes;
CREATE POLICY "Allow read access for authenticated users" ON public.estudantes
  FOR SELECT TO authenticated  
  USING (true);

-- 7. Grant necessary permissions
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.estudantes TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 8. Final verification queries
SELECT 'Profiles count' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'Estudantes count' as table_name, COUNT(*) as count FROM estudantes
UNION ALL
SELECT 'Active estudantes count' as table_name, COUNT(*) as count FROM estudantes WHERE ativo = true;

-- 9. Test the exact query that was failing
SELECT 
    e.*,
    p.*
FROM estudantes e
INNER JOIN profiles p ON e.profile_id = p.id
WHERE e.ativo = true
ORDER BY e.created_at DESC
LIMIT 3;