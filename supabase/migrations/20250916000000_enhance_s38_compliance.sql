-- Migration to enhance S-38 compliance in the database schema

-- Add columns to programacao_itens for better S-38 rule support
ALTER TABLE public.programacao_itens 
ADD COLUMN IF NOT EXISTS regras_s38 JSONB;

-- Add columns to estudantes for comprehensive S-38 qualification tracking
ALTER TABLE public.estudantes 
ADD COLUMN IF NOT EXISTS reading BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS treasures BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS gems BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS talk BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS explaining BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS starting BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS following BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS making BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS congregation_study BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS privileges TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS baptism_date DATE,
ADD COLUMN IF NOT EXISTS publisher BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS pioneer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS full_time BOOLEAN DEFAULT false;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_estudantes_qualifications ON public.estudantes (
  reading, treasures, gems, talk, explaining, 
  starting, following, making, congregation_study
);

CREATE INDEX IF NOT EXISTS idx_estudantes_privileges ON public.estudantes 
USING GIN (privileges);

-- Update existing programacao_itens to include S-38 rules based on tipo
UPDATE public.programacao_itens 
SET regras_s38 = CASE 
  WHEN tipo = 'bible_reading' THEN '{"gender": "masculino", "assistant_required": false}'
  WHEN tipo IN ('starting', 'following', 'making_disciples') THEN '{"gender": "ambos", "assistant_required": true}'
  WHEN tipo = 'talk' THEN '{"gender": "masculino", "assistant_required": false, "qualification_required": true}'
  WHEN tipo = 'spiritual_gems' THEN '{"gender": "masculino", "assistant_required": false, "qualification_required": true}'
  WHEN tipo = 'treasures' THEN '{"gender": "masculino", "assistant_required": false, "qualification_required": true}'
  WHEN tipo = 'congregation_study' THEN '{"gender": "masculino", "assistant_required": false, "qualification_required": "elder"}'
  ELSE '{"gender": "ambos", "assistant_required": false}'
END
WHERE regras_s38 IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.programacao_itens.regras_s38 IS 'Regras S-38 para a parte: {"gender": "masculino/ambos", "assistant_required": true/false, "qualification_required": true/elder}';
COMMENT ON COLUMN public.estudantes.reading IS 'Qualificado para Leitura da Bíblia (apenas homens)';
COMMENT ON COLUMN public.estudantes.treasures IS 'Qualificado para Discursos em Tesouros';
COMMENT ON COLUMN public.estudantes.gems IS 'Qualificado para Joias Espirituais';
COMMENT ON COLUMN public.estudantes.talk IS 'Qualificado para Discursos gerais';
COMMENT ON COLUMN public.estudantes.explaining IS 'Qualificado para Explicando suas Crenças';
COMMENT ON COLUMN public.estudantes.starting IS 'Qualificado para Iniciando Conversas';
COMMENT ON COLUMN public.estudantes.following IS 'Qualificado para Cultivando Interesse';
COMMENT ON COLUMN public.estudantes.making IS 'Qualificado para Fazendo Discípulos';
COMMENT ON COLUMN public.estudantes.congregation_study IS 'Qualificado para Estudo Bíblico de Congregação';
COMMENT ON COLUMN public.estudantes.privileges IS 'Privilégios do estudante: ancião, servo_ministerial, pioneiro, etc.';