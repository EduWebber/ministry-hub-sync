-- =====================================================
-- CORREÇÃO DA ESTRUTURA DO BANCO DE DADOS
-- =====================================================

-- 1. Verificar se a tabela profiles existe e tem a estrutura correta
DO $$
BEGIN
    -- Se a tabela profiles não existe, criar
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        CREATE TABLE public.profiles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
            nome TEXT NOT NULL,
            email TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'instrutor',
            congregacao_id UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Habilitar RLS
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        -- Criar políticas RLS
        CREATE POLICY "Users can view own profile" ON public.profiles
            FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can update own profile" ON public.profiles  
            FOR UPDATE USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert own profile" ON public.profiles
            FOR INSERT WITH CHECK (auth.uid() = user_id);
            
        RAISE NOTICE 'Tabela profiles criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela profiles já existe';
    END IF;
END
$$;

-- 2. Verificar se a tabela estudantes existe e tem a estrutura correta
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'estudantes') THEN
        CREATE TABLE public.estudantes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
            genero TEXT NOT NULL CHECK (genero IN ('masculino', 'feminino')),
            qualificacoes TEXT[],
            disponibilidade JSONB,
            ativo BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Habilitar RLS
        ALTER TABLE public.estudantes ENABLE ROW LEVEL SECURITY;
        
        -- Criar políticas RLS
        CREATE POLICY "Users can view own estudantes" ON public.estudantes
            FOR SELECT USING (
                profile_id IN (
                    SELECT id FROM public.profiles WHERE user_id = auth.uid()
                )
            );
        
        CREATE POLICY "Users can manage own estudantes" ON public.estudantes
            FOR ALL USING (
                profile_id IN (
                    SELECT id FROM public.profiles WHERE user_id = auth.uid()
                )
            );
            
        RAISE NOTICE 'Tabela estudantes criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela estudantes já existe';
    END IF;
END
$$;

-- 3. Criar função para lidar com novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, nome, email, role)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data ->> 'nome_completo', NEW.email), 
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'role', 'instrutor')
    );
    RETURN NEW;
END;
$$;

-- 4. Criar trigger para novos usuários (se não existir)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Inserir dados de teste se não existirem
DO $$
BEGIN
    -- Verificar se há usuários de teste
    IF NOT EXISTS (SELECT FROM auth.users WHERE email = 'amazonwebber007@gmail.com') THEN
        RAISE NOTICE 'Usuário de teste não encontrado. Será necessário criar via interface.';
    ELSE
        -- Verificar se o perfil existe para o usuário de teste
        IF NOT EXISTS (
            SELECT FROM public.profiles p 
            JOIN auth.users u ON p.user_id = u.id 
            WHERE u.email = 'amazonwebber007@gmail.com'
        ) THEN
            -- Criar perfil para o usuário de teste
            INSERT INTO public.profiles (user_id, nome, email, role)
            SELECT 
                u.id,
                'Roberto Araujo',
                u.email,
                'instrutor'
            FROM auth.users u 
            WHERE u.email = 'amazonwebber007@gmail.com';
            
            RAISE NOTICE 'Perfil criado para usuário de teste';
        END IF;
    END IF;
END
$$;

-- 6. Verificar integridade dos dados
DO $$
DECLARE
    profile_count INTEGER;
    estudante_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM public.profiles;
    SELECT COUNT(*) INTO estudante_count FROM public.estudantes;
    
    RAISE NOTICE 'Profiles encontrados: %', profile_count;
    RAISE NOTICE 'Estudantes encontrados: %', estudante_count;
END
$$;

RAISE NOTICE 'Correção da estrutura do banco concluída!';