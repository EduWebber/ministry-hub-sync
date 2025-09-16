-- ======= MINISTRY HUB SYNC - COMPLETE MIGRATION =======
-- Execute this in Supabase SQL Editor or via CLI
-- Date: 2025-01-15

-- ======= ENSURE ENUMS EXIST =======
CREATE TYPE IF NOT EXISTS public.app_role AS ENUM ('admin', 'instrutor', 'estudante');

CREATE TYPE IF NOT EXISTS public.tipo_designacao AS ENUM (
  'discurso_tesouros', 'joias_espirituais', 'leitura_biblica',
  'iniciando_conversas', 'cultivando_interesse', 'fazendo_discipulos',
  'explicando_crencas', 'discurso_ministerio', 'estudo_biblico_congregacao',
  'abertura', 'conclusao', 'video_consideracao'
);

CREATE TYPE IF NOT EXISTS public.genero_requerido AS ENUM ('masculino', 'feminino', 'ambos');

-- ======= PROFILES TABLE =======
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE,
  nome TEXT,
  email TEXT,
  role public.app_role DEFAULT 'estudante',
  congregacao_id UUID,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ======= CONGREGACOES =======
CREATE TABLE IF NOT EXISTS public.congregacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cidade TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ======= PROGRAMAS MINISTERIAIS =======
CREATE TABLE IF NOT EXISTS public.programas_ministeriais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  arquivo_nome TEXT NOT NULL,
  arquivo_url TEXT NOT NULL,
  mes_ano TEXT NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'processado', 'publicado')),
  conteudo JSONB,
  congregacao_id UUID REFERENCES public.congregacoes(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ======= SEMANAS DO PROGRAMA =======
CREATE TABLE IF NOT EXISTS public.semanas_programa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programa_id UUID REFERENCES public.programas_ministeriais(id) ON DELETE CASCADE NOT NULL,
  semana_numero INTEGER NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  tema_semana TEXT NOT NULL,
  leitura_biblica TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ======= PARTES =======
CREATE TABLE IF NOT EXISTS public.partes_programa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  semana_id UUID REFERENCES public.semanas_programa(id) ON DELETE CASCADE NOT NULL,
  tipo_designacao public.tipo_designacao NOT NULL,
  titulo TEXT NOT NULL,
  duracao_minutos INTEGER NOT NULL,
  genero_requerido public.genero_requerido DEFAULT 'ambos',
  ordem INTEGER NOT NULL,
  instrucoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ======= ESTUDANTES =======
CREATE TABLE IF NOT EXISTS public.estudantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  genero TEXT NOT NULL CHECK (genero IN ('masculino', 'feminino')),
  qualificacoes TEXT[],
  disponibilidade JSONB,
  ativo BOOLEAN DEFAULT true,
  congregacao_id UUID REFERENCES public.congregacoes(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ======= DESIGNACOES =======
CREATE TABLE IF NOT EXISTS public.designacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parte_id UUID REFERENCES public.partes_programa(id) ON DELETE CASCADE NOT NULL,
  estudante_id UUID REFERENCES public.estudantes(id) ON DELETE CASCADE NOT NULL,
  ajudante_id UUID REFERENCES public.estudantes(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'designado' CHECK (status IN ('designado', 'realizado', 'cancelado')),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ======= TRIGGERS =======
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_programas_updated_at') THEN
    CREATE TRIGGER update_programas_updated_at
      BEFORE UPDATE ON public.programas_ministeriais
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_designacoes_updated_at') THEN
    CREATE TRIGGER update_designacoes_updated_at
      BEFORE UPDATE ON public.designacoes
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ======= RLS ENABLE =======
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.congregacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.programas_ministeriais ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.semanas_programa ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.partes_programa ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.estudantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.designacoes ENABLE ROW LEVEL SECURITY;

-- ======= HELPER FUNCTION =======
CREATE OR REPLACE FUNCTION public.get_user_role(uid UUID)
RETURNS public.app_role
LANGUAGE sql
STABLE
AS $$
  SELECT role FROM public.profiles WHERE user_id = uid LIMIT 1;
$$;

-- ======= POLICIES =======
CREATE POLICY IF NOT EXISTS profiles_select_own ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS profiles_update_own ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS profiles_insert_own ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS congregacoes_admin_all ON public.congregacoes
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY IF NOT EXISTS programas_admin_all ON public.programas_ministeriais
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY IF NOT EXISTS programas_instrutor_select ON public.programas_ministeriais
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin','instrutor'));

CREATE POLICY IF NOT EXISTS semanas_admin_instrutor_select ON public.semanas_programa
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin','instrutor'));

CREATE POLICY IF NOT EXISTS semanas_admin_manage ON public.semanas_programa
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY IF NOT EXISTS partes_admin_instrutor_select ON public.partes_programa
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin','instrutor'));

CREATE POLICY IF NOT EXISTS partes_admin_manage ON public.partes_programa
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY IF NOT EXISTS estudantes_admin_instrutor_select ON public.estudantes
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin','instrutor'));

CREATE POLICY IF NOT EXISTS estudantes_admin_instrutor_manage ON public.estudantes
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin','instrutor'));

CREATE POLICY IF NOT EXISTS designacoes_admin_instrutor_select ON public.designacoes
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin','instrutor'));

CREATE POLICY IF NOT EXISTS designacoes_instrutor_manage ON public.designacoes
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin','instrutor'));

-- ======= AUTO PROFILE CREATION =======
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = NEW.id) THEN
    INSERT INTO public.profiles (user_id, nome, email, role, created_at)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
      NEW.email,
      'estudante',
      now()
    );
  END IF;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END;
$$ LANGUAGE plpgsql;