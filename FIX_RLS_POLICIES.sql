-- =====================================================
-- CORREÇÃO CRÍTICA: RLS POLICIES PARA ESTUDANTES
-- =====================================================
-- Execute este SQL no Supabase SQL Editor IMEDIATAMENTE

-- 1. Remover políticas existentes que estão causando 403
DROP POLICY IF EXISTS "estudantes_admin_instrutor_select" ON public.estudantes;
DROP POLICY IF EXISTS "estudantes_admin_instrutor_manage" ON public.estudantes;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

-- 2. Criar função helper atualizada
CREATE OR REPLACE FUNCTION public.get_user_role(uid UUID)
RETURNS public.app_role
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(role, 'estudante'::public.app_role) 
  FROM public.profiles 
  WHERE user_id = uid OR id = uid 
  LIMIT 1;
$$;

-- 3. Políticas para PROFILES (permissivas)
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = user_id OR 
      auth.uid() = id OR
      public.get_user_role(auth.uid()) IN ('admin', 'instrutor')
    )
  );

CREATE POLICY "profiles_insert_all" ON public.profiles
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND (
      auth.uid() = user_id OR 
      auth.uid() = id OR
      public.get_user_role(auth.uid()) IN ('admin', 'instrutor')
    )
  );

CREATE POLICY "profiles_update_all" ON public.profiles
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = user_id OR 
      auth.uid() = id OR
      public.get_user_role(auth.uid()) IN ('admin', 'instrutor')
    )
  );

-- 4. Políticas para ESTUDANTES (permissivas)
CREATE POLICY "estudantes_select_all" ON public.estudantes
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    public.get_user_role(auth.uid()) IN ('admin', 'instrutor', 'estudante')
  );

CREATE POLICY "estudantes_insert_all" ON public.estudantes
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    public.get_user_role(auth.uid()) IN ('admin', 'instrutor')
  );

CREATE POLICY "estudantes_update_all" ON public.estudantes
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    public.get_user_role(auth.uid()) IN ('admin', 'instrutor')
  );

CREATE POLICY "estudantes_delete_all" ON public.estudantes
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND
    public.get_user_role(auth.uid()) IN ('admin', 'instrutor')
  );

-- 5. Garantir que RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estudantes ENABLE ROW LEVEL SECURITY;

-- 6. Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('profiles', 'estudantes')
ORDER BY tablename, policyname;