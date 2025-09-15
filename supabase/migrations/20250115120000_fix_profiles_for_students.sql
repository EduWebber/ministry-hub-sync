-- =====================================================
-- Correção da Estrutura de Profiles para Estudantes
-- =====================================================

-- Problema: Estudantes importados via planilha não precisam de user_id
-- Solução: Permitir profiles sem user_id para estudantes importados

-- 1. Remover a constraint NOT NULL do user_id para permitir estudantes sem conta
ALTER TABLE public.profiles 
ALTER COLUMN user_id DROP NOT NULL;

-- 2. Remover a constraint UNIQUE do user_id temporariamente
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_user_id_key;

-- 3. Adicionar constraint UNIQUE apenas para user_id não nulos
-- Isso permite múltiplos registros com user_id NULL (estudantes importados)
-- mas mantém a unicidade para usuários com conta de autenticação
CREATE UNIQUE INDEX profiles_user_id_unique_idx 
ON public.profiles (user_id) 
WHERE user_id IS NOT NULL;

-- 4. Adicionar campos necessários para estudantes importados
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS telefone TEXT,
ADD COLUMN IF NOT EXISTS data_nascimento DATE,
ADD COLUMN IF NOT EXISTS cargo TEXT;

-- 5. Atualizar a função handle_new_user para lidar com a nova estrutura
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Verificar se já existe um perfil para este user_id
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

-- 6. Atualizar políticas RLS para considerar profiles sem user_id
-- Profiles sem user_id são estudantes importados, visíveis para instrutores e admins

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Criar novas políticas
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (
    auth.uid() = user_id OR -- Usuário pode ver seu próprio perfil
    public.get_user_role(auth.uid()) IN ('admin', 'instrutor') -- Admins e instrutores podem ver todos
  );

CREATE POLICY "Users can update own profile" ON public.profiles  
  FOR UPDATE USING (
    auth.uid() = user_id OR -- Usuário pode editar seu próprio perfil
    public.get_user_role(auth.uid()) IN ('admin', 'instrutor') -- Admins e instrutores podem editar todos
  );

CREATE POLICY "Users can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR -- Usuário pode criar seu próprio perfil
    public.get_user_role(auth.uid()) IN ('admin', 'instrutor') OR -- Admins e instrutores podem criar perfis
    user_id IS NULL -- Permitir criação de perfis sem user_id (estudantes importados)
  );

-- 7. Comentários para documentação
COMMENT ON COLUMN public.profiles.user_id IS 'ID do usuário autenticado. NULL para estudantes importados via planilha que não possuem conta de login.';
COMMENT ON INDEX profiles_user_id_unique_idx IS 'Garante unicidade do user_id apenas para usuários com conta de autenticação.';

-- 8. Verificação da estrutura
DO $$
DECLARE
    constraint_count INTEGER;
BEGIN
    -- Verificar se a constraint única foi aplicada corretamente
    SELECT COUNT(*) INTO constraint_count
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND indexname = 'profiles_user_id_unique_idx';
    
    RAISE NOTICE 'Constraint única aplicada: %', constraint_count > 0;
END $$;