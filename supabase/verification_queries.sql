-- ======= VERIFICATION QUERIES =======
-- Execute these in Supabase SQL Editor after migration
-- Copy/paste each block individually to verify setup

-- ======= 1. CHECK ENUMS =======
SELECT oid, typname FROM pg_type 
WHERE typname IN ('app_role', 'tipo_designacao', 'genero_requerido');

-- ======= 2. CHECK TABLES EXIST =======
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'profiles', 'congregacoes', 'programas_ministeriais', 
  'semanas_programa', 'partes_programa', 'estudantes', 'designacoes'
);

-- ======= 3. CHECK TABLE STRUCTURES =======
-- Profiles
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public';

-- Programas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'programas_ministeriais' AND table_schema = 'public';

-- ======= 4. CHECK RLS STATUS =======
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'programas_ministeriais', 'designacoes');

-- ======= 5. CHECK POLICIES =======
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public';

-- ======= 6. CHECK FUNCTIONS =======
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_user_role', 'handle_new_user', 'update_updated_at_column');

-- ======= 7. CHECK TRIGGERS =======
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- ======= 8. TEST BASIC INSERTS (OPTIONAL) =======
-- Insert test congregacao
INSERT INTO public.congregacoes (nome, cidade) 
VALUES ('Congregação Teste', 'São Paulo') 
RETURNING id, nome;

-- Check if insert worked
SELECT * FROM public.congregacoes LIMIT 1;

-- ======= 9. TEST ENUM VALUES =======
-- Test tipo_designacao enum
SELECT unnest(enum_range(NULL::public.tipo_designacao)) as tipos_disponiveis;

-- Test app_role enum  
SELECT unnest(enum_range(NULL::public.app_role)) as roles_disponiveis;

-- ======= 10. CLEANUP TEST DATA =======
-- Remove test data if needed
-- DELETE FROM public.congregacoes WHERE nome = 'Congregação Teste';