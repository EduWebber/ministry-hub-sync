-- =====================================================
-- Correção da Coluna user_id na Tabela Profiles
-- =====================================================

-- Verificar se a coluna user_id existe na tabela profiles
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    -- Verificar se a coluna user_id existe
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'user_id'
    ) INTO column_exists;
    
    -- Se a coluna não existir, criar ela
    IF NOT column_exists THEN
        RAISE NOTICE 'Coluna user_id não existe, criando...';
        ALTER TABLE public.profiles ADD COLUMN user_id UUID REFERENCES auth.users(id);
        
        -- Criar índice único para user_id não nulos
        CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_unique_idx 
        ON public.profiles (user_id) 
        WHERE user_id IS NOT NULL;
        
        RAISE NOTICE 'Coluna user_id criada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna user_id já existe';
        
        -- Verificar se o índice único existe
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND tablename = 'profiles' 
            AND indexname = 'profiles_user_id_unique_idx'
        ) THEN
            RAISE NOTICE 'Criando índice único para user_id...';
            CREATE UNIQUE INDEX profiles_user_id_unique_idx 
            ON public.profiles (user_id) 
            WHERE user_id IS NOT NULL;
        END IF;
    END IF;
END $$;

-- Garantir que a coluna user_id permite NULL (para estudantes importados)
ALTER TABLE public.profiles ALTER COLUMN user_id DROP NOT NULL;

-- Atualizar comentários
COMMENT ON COLUMN public.profiles.user_id IS 'ID do usuário autenticado. NULL para estudantes importados via planilha que não possuem conta de login.';

-- Verificar estrutura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;