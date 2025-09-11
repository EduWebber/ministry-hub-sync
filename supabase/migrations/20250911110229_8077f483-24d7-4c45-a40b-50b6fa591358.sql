-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'instrutor', 'estudante');

-- Create enum for assignment types 
CREATE TYPE public.tipo_designacao AS ENUM (
  'discurso_tesouros', 'joias_espirituais', 'leitura_biblica',
  'iniciando_conversas', 'cultivando_interesse', 'fazendo_discipulos', 
  'explicando_crencas', 'discurso_ministerio', 'estudo_biblico_congregacao'
);

-- Create enum for gender requirements
CREATE TYPE public.genero_requerido AS ENUM ('masculino', 'feminino', 'ambos');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'estudante',
  congregacao_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create congregacoes table
CREATE TABLE public.congregacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cidade TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create programas_ministeriais table
CREATE TABLE public.programas_ministeriais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  arquivo_nome TEXT NOT NULL,
  arquivo_url TEXT NOT NULL,
  mes_ano TEXT NOT NULL, -- formato: "202507"
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'processado', 'publicado')),
  conteudo JSONB, -- parsed content from PDF
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create semanas_programa table
CREATE TABLE public.semanas_programa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
  programa_id UUID REFERENCES public.programas_ministeriais(id) ON DELETE CASCADE NOT NULL,
  semana_numero INTEGER NOT NULL,
  data_inicio DATE NOT NULL,
  tema_semana TEXT NOT NULL,
  leitura_biblica TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create partes_programa table  
CREATE TABLE public.partes_programa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  semana_id UUID REFERENCES public.semanas_programa(id) ON DELETE CASCADE NOT NULL,
  tipo_designacao tipo_designacao NOT NULL,
  titulo TEXT NOT NULL,
  duracao_minutos INTEGER NOT NULL,
  genero_requerido genero_requerido DEFAULT 'ambos',
  ordem INTEGER NOT NULL,
  instrucoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create estudantes table
CREATE TABLE public.estudantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  genero TEXT NOT NULL CHECK (genero IN ('masculino', 'feminino')),
  qualificacoes TEXT[], -- array of qualifications
  disponibilidade JSONB, -- availability schedule
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create designacoes table
CREATE TABLE public.designacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parte_id UUID REFERENCES public.partes_programa(id) ON DELETE CASCADE NOT NULL,
  estudante_id UUID REFERENCES public.estudantes(id) ON DELETE CASCADE NOT NULL,
  ajudante_id UUID REFERENCES public.estudantes(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'designado' CHECK (status IN ('designado', 'realizado', 'cancelado')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.congregacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programas_ministeriais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semanas_programa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partes_programa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estudantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designacoes ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles  
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies for all tables
CREATE POLICY "Admins have full access to congregacoes" ON public.congregacoes
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins have full access to programas" ON public.programas_ministeriais
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Instrutores can view programas" ON public.programas_ministeriais
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'instrutor'));

-- Create policies for semanas_programa
CREATE POLICY "Admins and instrutores can view semanas" ON public.semanas_programa
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'instrutor'));

CREATE POLICY "Admins can manage semanas" ON public.semanas_programa
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Create policies for partes_programa  
CREATE POLICY "Admins and instrutores can view partes" ON public.partes_programa
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'instrutor'));

CREATE POLICY "Admins can manage partes" ON public.partes_programa
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Create policies for estudantes
CREATE POLICY "Admins and instrutores can view estudantes" ON public.estudantes
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'instrutor'));

CREATE POLICY "Admins and instrutores can manage estudantes" ON public.estudantes
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'instrutor'));

-- Create policies for designacoes
CREATE POLICY "Admins and instrutores can view designacoes" ON public.designacoes
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'instrutor'));

CREATE POLICY "Instrutores can manage designacoes" ON public.designacoes
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'instrutor'));

-- Create trigger function to update updated_at
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

CREATE TRIGGER update_programas_updated_at
  BEFORE UPDATE ON public.programas_ministeriais
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_designacoes_updated_at
  BEFORE UPDATE ON public.designacoes  
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, email, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email), 
    NEW.email,
    'estudante'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();