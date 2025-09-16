-- =====================================================
-- SCHEMA MINISTERIAL - Sistema de Programações JW
-- =====================================================

-- Congregações
CREATE TABLE congregacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cidade TEXT,
  estado TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Programas Ministeriais (cada semana)
CREATE TABLE programas_ministeriais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  periodo TEXT NOT NULL,              -- "Setembro 2025"
  semana TEXT NOT NULL,               -- "8–14 de setembro"
  tema TEXT,                          -- tema principal da semana
  pdf_url TEXT NOT NULL,              -- URL do PDF no Supabase Storage
  pdf_filename TEXT NOT NULL,         -- nome do arquivo original
  publicado BOOLEAN DEFAULT false,    -- se foi publicado para congregações
  congregacao_id UUID REFERENCES congregacoes(id), -- null = disponível para todas
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Índices para busca eficiente
  UNIQUE(semana, congregacao_id)
);

-- Tipos de partes ministeriais (enum-like)
CREATE TYPE tipo_parte AS ENUM (
  'discurso_tesouros',
  'joias_espirituais', 
  'leitura_biblica',
  'apresentacao_inicial',
  'revisita',
  'estudo_biblico',
  'discurso_vida',
  'estudo_congregacao',
  'comentarios_cantarel',
  'oracao_final'
);

-- Seções da reunião
CREATE TYPE secao_reuniao AS ENUM (
  'Tesouros da Palavra de Deus',
  'Ministério',
  'Vida Cristã'
);

-- Gênero requerido
CREATE TYPE genero_requerido AS ENUM (
  'masculino',
  'feminino', 
  'ambos'
);

-- Partes Ministeriais (cada item dentro de uma semana)
CREATE TABLE partes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programa_id UUID REFERENCES programas_ministeriais(id) ON DELETE CASCADE,
  secao secao_reuniao NOT NULL,
  titulo TEXT NOT NULL,               -- "Discurso", "Joias espirituais", etc
  tipo tipo_parte NOT NULL,           -- tipo mapeado conforme enum
  duracao INT NOT NULL,              -- em minutos
  referencias JSONB,                  -- referências bíblicas e materiais
  genero_requerido genero_requerido DEFAULT 'ambos',
  ordem INT NOT NULL,                -- ordem dentro da reunião
  observacoes TEXT,                  -- observações especiais
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Índice para ordenação
  CONSTRAINT ordem_positiva CHECK (ordem > 0)
);

-- Estudantes
CREATE TABLE estudantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  genero TEXT NOT NULL CHECK (genero IN ('masculino', 'feminino')),
  email TEXT,
  telefone TEXT,
  congregacao_id UUID REFERENCES congregacoes(id),
  ativo BOOLEAN DEFAULT true,
  escola_ministerial BOOLEAN DEFAULT true,  -- participa da escola ministerial
  discursante BOOLEAN DEFAULT false,        -- pode dar discursos
  privilegios JSONB DEFAULT '[]',           -- ["ancião", "servo_ministerial", etc]
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Designações (atribuição de estudantes às partes)
CREATE TABLE designacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parte_id UUID REFERENCES partes(id) ON DELETE CASCADE,
  estudante_id UUID REFERENCES estudantes(id) ON DELETE CASCADE,
  data_reuniao DATE NOT NULL,         -- data específica da reunião
  confirmada BOOLEAN DEFAULT false,   -- se o estudante confirmou
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Não permitir designação dupla do mesmo estudante na mesma data
  UNIQUE(estudante_id, data_reuniao)
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Programas por período e publicação
CREATE INDEX idx_programas_periodo ON programas_ministeriais(periodo, publicado);

-- Partes por programa e ordem
CREATE INDEX idx_partes_programa ON partes(programa_id, ordem);

-- Estudantes por congregação e status
CREATE INDEX idx_estudantes_congregacao ON estudantes(congregacao_id, ativo);

-- Designações por data e estudante
CREATE INDEX idx_designacoes_data ON designacoes(data_reuniao);
CREATE INDEX idx_designacoes_estudante ON designacoes(estudante_id);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_congregacoes_updated_at BEFORE UPDATE ON congregacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_programas_updated_at BEFORE UPDATE ON programas_ministeriais FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partes_updated_at BEFORE UPDATE ON partes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_estudantes_updated_at BEFORE UPDATE ON estudantes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_designacoes_updated_at BEFORE UPDATE ON designacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DADOS INICIAIS (SEED)
-- =====================================================

-- Congregação padrão para desenvolvimento
INSERT INTO congregacoes (nome, cidade, estado) VALUES 
  ('Congregação Central', 'São Paulo', 'SP'),
  ('Congregação Norte', 'Rio de Janeiro', 'RJ'),
  ('Congregação Sul', 'Belo Horizonte', 'MG');

-- =====================================================
-- RLS (ROW LEVEL SECURITY) - Para multi-tenancy
-- =====================================================

-- Habilitar RLS nas tabelas principais
ALTER TABLE congregacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE programas_ministeriais ENABLE ROW LEVEL SECURITY;  
ALTER TABLE partes ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE designacoes ENABLE ROW LEVEL SECURITY;

-- Política para admin ver tudo
CREATE POLICY "Admin can view all congregacoes" ON congregacoes FOR SELECT USING (true);
CREATE POLICY "Admin can view all programas" ON programas_ministeriais FOR SELECT USING (true);
CREATE POLICY "Admin can manage all" ON programas_ministeriais FOR ALL USING (true);

-- Política para instrutores (apenas sua congregação)
CREATE POLICY "Instructors can view own congregation programs" ON programas_ministeriais 
  FOR SELECT USING (
    congregacao_id IS NULL OR 
    congregacao_id = (SELECT congregacao_id FROM estudantes WHERE id = auth.uid())
  );

CREATE POLICY "Instructors can view own congregation students" ON estudantes 
  FOR SELECT USING (
    congregacao_id = (SELECT congregacao_id FROM estudantes WHERE id = auth.uid())
  );

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE congregacoes IS 'Congregações participantes do sistema';
COMMENT ON TABLE programas_ministeriais IS 'Programas semanais extraídos dos PDFs oficiais';
COMMENT ON TABLE partes IS 'Partes individuais de cada programa (discursos, apresentações, etc)';
COMMENT ON TABLE estudantes IS 'Estudantes que participam da escola ministerial';
COMMENT ON TABLE designacoes IS 'Atribuições de estudantes às partes dos programas';

COMMENT ON COLUMN programas_ministeriais.pdf_url IS 'URL do PDF original no Supabase Storage bucket portuguesmeet';
COMMENT ON COLUMN partes.referencias IS 'JSON com referências bíblicas e materiais: {"biblical": ["João 3:16"], "wol": ["w23.09-E 15-21"]}';
COMMENT ON COLUMN estudantes.privilegios IS 'Array JSON de privilégios: ["ancião", "servo_ministerial", "pioneiro_regular"]';

