-- ==========================================
-- PostgREST Schema Cache Fix Script
-- ==========================================
-- This script addresses PostgREST schema cache issues and relationship resolution

-- 1. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- 2. Verify and recreate profiles table if needed
DO $$
BEGIN
    -- Check if profiles table exists
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
    ) THEN
        -- Create profiles table
        CREATE TABLE public.profiles (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
            email text,
            full_name text,
            role text DEFAULT 'estudante'::text,
            congregacao_id uuid,
            ativo boolean DEFAULT true,
            onboarding_completed boolean DEFAULT false,
            preferences jsonb DEFAULT '{}'::jsonb,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );
        
        -- Enable RLS
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policies
        CREATE POLICY "Users can view own profile" ON public.profiles
            FOR SELECT USING (auth.uid() = user_id);
            
        CREATE POLICY "Users can update own profile" ON public.profiles
            FOR UPDATE USING (auth.uid() = user_id);
            
        CREATE POLICY "Users can insert own profile" ON public.profiles
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- 3. Verify and recreate estudantes table relationships
DO $$
BEGIN
    -- Check if estudantes table has proper structure
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'estudantes'
    ) THEN
        -- Add missing columns if they don't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'estudantes' 
            AND column_name = 'congregacao_id'
        ) THEN
            ALTER TABLE public.estudantes ADD COLUMN congregacao_id uuid;
        END IF;
        
        -- Ensure proper qualifications structure
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'estudantes' 
            AND column_name = 'reading'
        ) THEN
            -- Add S-38 qualification columns
            ALTER TABLE public.estudantes 
            ADD COLUMN reading boolean DEFAULT false,
            ADD COLUMN starting boolean DEFAULT false,
            ADD COLUMN following boolean DEFAULT false,
            ADD COLUMN making boolean DEFAULT false,
            ADD COLUMN explaining boolean DEFAULT false,
            ADD COLUMN talk boolean DEFAULT false,
            ADD COLUMN treasures boolean DEFAULT false,
            ADD COLUMN gems boolean DEFAULT false,
            ADD COLUMN chairman boolean DEFAULT false,
            ADD COLUMN pray boolean DEFAULT false;
        END IF;
    END IF;
END
$$;

-- 4. Create or update designacoes tables structure
DO $$
BEGIN
    -- Create designacoes table if not exists
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'designacoes'
    ) THEN
        CREATE TABLE public.designacoes (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            programacao_id text NOT NULL,
            congregacao_id uuid NOT NULL,
            semana text,
            data_inicio date,
            status text DEFAULT 'rascunho',
            observacoes text,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );
    END IF;
    
    -- Create designacao_itens table if not exists
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'designacao_itens'
    ) THEN
        CREATE TABLE public.designacao_itens (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            designacao_id uuid REFERENCES public.designacoes(id) ON DELETE CASCADE,
            programacao_item_id text NOT NULL,
            principal_estudante_id uuid REFERENCES public.estudantes(id),
            assistente_estudante_id uuid REFERENCES public.estudantes(id),
            status text DEFAULT 'pendente',
            observacoes text,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );
    END IF;
END
$$;

-- 5. Create programacoes tables structure
DO $$
BEGIN
    -- Create programacoes table if not exists
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'programacoes'
    ) THEN
        CREATE TABLE public.programacoes (
            id text PRIMARY KEY,
            titulo text NOT NULL,
            tema text,
            data text,
            semana_inicio date,
            semana_fim date,
            metadata jsonb DEFAULT '{}'::jsonb,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );
    END IF;
    
    -- Create programacao_itens table if not exists
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'programacao_itens'
    ) THEN
        CREATE TABLE public.programacao_itens (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            programacao_id text REFERENCES public.programacoes(id) ON DELETE CASCADE,
            titulo text NOT NULL,
            tipo text NOT NULL,
            tempo integer DEFAULT 0,
            ordem integer DEFAULT 0,
            secao text,
            regras_papel jsonb DEFAULT '{}'::jsonb,
            metadata jsonb DEFAULT '{}'::jsonb,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );
    END IF;
END
$$;

-- 6. Refresh all foreign key constraints
DO $$
DECLARE
    rec RECORD;
BEGIN
    -- Re-validate all foreign key constraints
    FOR rec IN 
        SELECT conname, conrelid::regclass as table_name
        FROM pg_constraint 
        WHERE contype = 'f' 
        AND connamespace = 'public'::regnamespace
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE %s VALIDATE CONSTRAINT %I', rec.table_name, rec.conname);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not validate constraint % on table %: %', rec.conname, rec.table_name, SQLERRM;
        END;
    END LOOP;
END
$$;

-- 7. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- 8. Final schema cache refresh
NOTIFY pgrst, 'reload schema';

-- 9. Verification queries
SELECT 'Schema fix completed' as status;
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'estudantes', 'designacoes', 'designacao_itens', 'programacoes', 'programacao_itens')
ORDER BY table_name, ordinal_position;