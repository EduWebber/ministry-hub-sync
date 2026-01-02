-- ============================================
-- HARMONIZATION: Complete Database Schema
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE (User management)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nome TEXT NOT NULL DEFAULT '',
  email TEXT,
  role TEXT NOT NULL DEFAULT 'estudante' CHECK (role IN ('admin', 'instrutor', 'estudante')),
  congregacao_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 2. ESTUDANTES TABLE (Students)
-- ============================================
CREATE TABLE IF NOT EXISTS public.estudantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  genero TEXT DEFAULT 'masculino' CHECK (genero IN ('masculino', 'feminino')),
  cargo TEXT DEFAULT 'publicador_batizado',
  idade INTEGER,
  telefone TEXT,
  email TEXT,
  ativo BOOLEAN DEFAULT true,
  data_batismo DATE,
  data_nascimento DATE,
  observacoes TEXT,
  parent_id UUID REFERENCES public.estudantes(id) ON DELETE SET NULL,
  congregacao_id TEXT,
  instrutor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  qualificacoes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.estudantes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view students" ON public.estudantes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Instructors can create students" ON public.estudantes
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Instructors can update students" ON public.estudantes
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Instructors can delete students" ON public.estudantes
  FOR DELETE TO authenticated USING (true);

-- ============================================
-- 3. PROGRAMAS_MINISTERIAIS TABLE (Ministerial Programs)
-- ============================================
CREATE TABLE IF NOT EXISTS public.programas_ministeriais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  mes_ano TEXT NOT NULL,
  data_inicio DATE,
  data_fim DATE,
  arquivo_nome TEXT,
  arquivo_url TEXT,
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'publicado', 'arquivado')),
  congregacao_id TEXT,
  criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.programas_ministeriais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view programs" ON public.programas_ministeriais
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Instructors can create programs" ON public.programas_ministeriais
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Instructors can update programs" ON public.programas_ministeriais
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Instructors can delete programs" ON public.programas_ministeriais
  FOR DELETE TO authenticated USING (true);

-- ============================================
-- 4. PROGRAMAS TABLE (Simplified Programs - compatibility)
-- ============================================
CREATE TABLE IF NOT EXISTS public.programas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  mes_ano TEXT,
  status TEXT DEFAULT 'rascunho',
  congregacao_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.programas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view programas" ON public.programas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Instructors can manage programas" ON public.programas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- 5. DESIGNACOES TABLE (Assignments)
-- ============================================
CREATE TABLE IF NOT EXISTS public.designacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programa_id UUID REFERENCES public.programas_ministeriais(id) ON DELETE CASCADE,
  estudante_id UUID REFERENCES public.estudantes(id) ON DELETE SET NULL,
  ajudante_id UUID REFERENCES public.estudantes(id) ON DELETE SET NULL,
  titulo_parte TEXT NOT NULL,
  tipo_parte TEXT,
  tempo_minutos INTEGER DEFAULT 5,
  cena TEXT,
  data_designacao DATE,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmada', 'realizada', 'cancelada')),
  observacoes TEXT,
  assignment_status TEXT DEFAULT 'pending',
  congregacao_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.designacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view assignments" ON public.designacoes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Instructors can create assignments" ON public.designacoes
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Instructors can update assignments" ON public.designacoes
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Instructors can delete assignments" ON public.designacoes
  FOR DELETE TO authenticated USING (true);

-- ============================================
-- 6. FAMILY_MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.estudantes(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  parentesco TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  is_primary_contact BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view family members" ON public.family_members
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage family members" ON public.family_members
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- 7. INVITATIONS_LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.invitations_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.estudantes(id) ON DELETE CASCADE,
  family_member_id UUID REFERENCES public.family_members(id) ON DELETE SET NULL,
  invitation_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'sent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.invitations_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view invitations" ON public.invitations_log
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create invitations" ON public.invitations_log
  FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================
-- 8. HELPER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_estudantes_updated_at
  BEFORE UPDATE ON public.estudantes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_programas_ministeriais_updated_at
  BEFORE UPDATE ON public.programas_ministeriais
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_programas_updated_at
  BEFORE UPDATE ON public.programas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_designacoes_updated_at
  BEFORE UPDATE ON public.designacoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_family_members_updated_at
  BEFORE UPDATE ON public.family_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 9. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_estudantes_ativo ON public.estudantes(ativo);
CREATE INDEX IF NOT EXISTS idx_estudantes_congregacao ON public.estudantes(congregacao_id);
CREATE INDEX IF NOT EXISTS idx_designacoes_programa ON public.designacoes(programa_id);
CREATE INDEX IF NOT EXISTS idx_designacoes_estudante ON public.designacoes(estudante_id);
CREATE INDEX IF NOT EXISTS idx_programas_ministeriais_mes ON public.programas_ministeriais(mes_ano);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);