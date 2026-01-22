
-- =============================================
-- MIGRATION: Add family fields and individual qualification columns
-- =============================================

-- 1. Add family-related columns to estudantes
ALTER TABLE public.estudantes 
ADD COLUMN IF NOT EXISTS familia TEXT,
ADD COLUMN IF NOT EXISTS family_id UUID,
ADD COLUMN IF NOT EXISTS estado_civil TEXT DEFAULT 'solteiro',
ADD COLUMN IF NOT EXISTS papel_familiar TEXT DEFAULT 'filho',
ADD COLUMN IF NOT EXISTS id_pai UUID REFERENCES public.estudantes(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS id_mae UUID REFERENCES public.estudantes(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS id_conjuge UUID REFERENCES public.estudantes(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS coabitacao BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS menor BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS responsavel_primario UUID REFERENCES public.estudantes(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS responsavel_secundario UUID REFERENCES public.estudantes(id) ON DELETE SET NULL;

-- 2. Add individual qualification columns (S-38 rules)
ALTER TABLE public.estudantes
ADD COLUMN IF NOT EXISTS chairman BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pray BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reading BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS initial_call BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS return_visit BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bible_study BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS talk BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS assistant BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS treasures BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS living BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS gems BOOLEAN DEFAULT false;

-- 3. Migrate existing JSONB qualificacoes data to individual columns
UPDATE public.estudantes
SET 
  chairman = COALESCE((qualificacoes->>'chairman')::boolean, (qualificacoes ? 'chairman'), false),
  pray = COALESCE((qualificacoes->>'pray')::boolean, (qualificacoes ? 'pray'), false),
  reading = COALESCE((qualificacoes->>'reading')::boolean, (qualificacoes ? 'reading'), false),
  initial_call = COALESCE((qualificacoes->>'initial_call')::boolean, (qualificacoes ? 'initial_call'), false),
  return_visit = COALESCE((qualificacoes->>'return_visit')::boolean, (qualificacoes ? 'return_visit'), false),
  bible_study = COALESCE((qualificacoes->>'bible_study')::boolean, (qualificacoes ? 'bible_study'), false),
  talk = COALESCE((qualificacoes->>'talk')::boolean, (qualificacoes ? 'talk'), false),
  assistant = COALESCE((qualificacoes->>'assistant')::boolean, (qualificacoes ? 'assistant'), false),
  treasures = COALESCE((qualificacoes->>'treasures')::boolean, (qualificacoes ? 'treasures'), false),
  living = COALESCE((qualificacoes->>'living')::boolean, (qualificacoes ? 'living'), false),
  gems = COALESCE((qualificacoes->>'gems')::boolean, (qualificacoes ? 'gems'), false)
WHERE qualificacoes IS NOT NULL AND qualificacoes != '[]'::jsonb;

-- 4. Create indexes for family lookups
CREATE INDEX IF NOT EXISTS idx_estudantes_family_id ON public.estudantes(family_id);
CREATE INDEX IF NOT EXISTS idx_estudantes_familia ON public.estudantes(familia);
CREATE INDEX IF NOT EXISTS idx_estudantes_id_pai ON public.estudantes(id_pai);
CREATE INDEX IF NOT EXISTS idx_estudantes_id_mae ON public.estudantes(id_mae);
CREATE INDEX IF NOT EXISTS idx_estudantes_id_conjuge ON public.estudantes(id_conjuge);

-- 5. Add comments for documentation
COMMENT ON COLUMN public.estudantes.familia IS 'Nome da família do estudante';
COMMENT ON COLUMN public.estudantes.family_id IS 'UUID compartilhado entre membros da mesma família';
COMMENT ON COLUMN public.estudantes.estado_civil IS 'Estado civil: solteiro, casado, divorciado, viuvo';
COMMENT ON COLUMN public.estudantes.papel_familiar IS 'Papel na família: pai, mae, filho, filha, conjuge';
COMMENT ON COLUMN public.estudantes.id_pai IS 'Referência ao estudante que é o pai';
COMMENT ON COLUMN public.estudantes.id_mae IS 'Referência ao estudante que é a mãe';
COMMENT ON COLUMN public.estudantes.id_conjuge IS 'Referência ao cônjuge';
COMMENT ON COLUMN public.estudantes.coabitacao IS 'Se mora com a família';
COMMENT ON COLUMN public.estudantes.menor IS 'Se é menor de idade';
COMMENT ON COLUMN public.estudantes.responsavel_primario IS 'Responsável primário (para menores)';
COMMENT ON COLUMN public.estudantes.responsavel_secundario IS 'Responsável secundário (para menores)';
COMMENT ON COLUMN public.estudantes.chairman IS 'Qualificado para presidente da reunião';
COMMENT ON COLUMN public.estudantes.pray IS 'Qualificado para oração';
COMMENT ON COLUMN public.estudantes.reading IS 'Qualificado para leitura da Bíblia';
COMMENT ON COLUMN public.estudantes.talk IS 'Qualificado para discurso';
COMMENT ON COLUMN public.estudantes.initial_call IS 'Qualificado para primeira conversa';
COMMENT ON COLUMN public.estudantes.return_visit IS 'Qualificado para revisita';
COMMENT ON COLUMN public.estudantes.bible_study IS 'Qualificado para estudo bíblico';
COMMENT ON COLUMN public.estudantes.assistant IS 'Qualificado para ajudante';
COMMENT ON COLUMN public.estudantes.treasures IS 'Qualificado para tesouros';
COMMENT ON COLUMN public.estudantes.living IS 'Qualificado para nossa vida cristã';
COMMENT ON COLUMN public.estudantes.gems IS 'Qualificado para joias espirituais';
