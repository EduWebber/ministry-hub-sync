-- Migration to create batch student import function for processing spreadsheet data

-- Create the process_estudantes_batch function
CREATE OR REPLACE FUNCTION public.process_estudantes_batch(estudantes_data JSONB)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    processed_count INTEGER,
    error_details JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    estudante_record JSONB;
    profile_id UUID;
    processed INTEGER := 0;
    errors JSONB := '[]'::JSONB;
    current_error JSONB;
    qualificacoes_array TEXT[];
BEGIN
    -- Validate input
    IF estudantes_data IS NULL OR jsonb_typeof(estudantes_data) != 'array' THEN
        RETURN QUERY SELECT 
            FALSE as success, 
            'Invalid input: expected JSON array' as message,
            0 as processed_count,
            '{"error": "Invalid input format"}'::JSONB as error_details;
        RETURN;
    END IF;

    -- Process each student record
    FOR estudante_record IN SELECT jsonb_array_elements(estudantes_data)
    LOOP
        BEGIN
            -- Create or update profile first
            INSERT INTO public.profiles (
                id,
                nome,
                email,
                telefone,
                data_nascimento,
                cargo,
                role
            ) VALUES (
                COALESCE((estudante_record->>'id')::UUID, gen_random_uuid()),
                estudante_record->>'nome',
                estudante_record->>'email',
                estudante_record->>'telefone',
                (estudante_record->>'data_nascimento')::DATE,
                estudante_record->>'cargo',
                'estudante'
            )
            ON CONFLICT (id) DO UPDATE SET
                nome = EXCLUDED.nome,
                email = EXCLUDED.email,
                telefone = EXCLUDED.telefone,
                data_nascimento = EXCLUDED.data_nascimento,
                cargo = EXCLUDED.cargo,
                updated_at = NOW()
            RETURNING id INTO profile_id;

            -- Build qualificacoes array from boolean fields
            qualificacoes_array := ARRAY[]::TEXT[];
            
            IF COALESCE((estudante_record->>'chairman')::BOOLEAN, FALSE) THEN
                qualificacoes_array := array_append(qualificacoes_array, 'chairman');
            END IF;
            
            IF COALESCE((estudante_record->>'pray')::BOOLEAN, FALSE) THEN
                qualificacoes_array := array_append(qualificacoes_array, 'pray');
            END IF;
            
            IF COALESCE((estudante_record->>'tresures')::BOOLEAN, FALSE) THEN
                qualificacoes_array := array_append(qualificacoes_array, 'treasures');
            END IF;
            
            IF COALESCE((estudante_record->>'gems')::BOOLEAN, FALSE) THEN
                qualificacoes_array := array_append(qualificacoes_array, 'gems');
            END IF;
            
            IF COALESCE((estudante_record->>'reading')::BOOLEAN, FALSE) THEN
                qualificacoes_array := array_append(qualificacoes_array, 'reading');
            END IF;
            
            IF COALESCE((estudante_record->>'starting')::BOOLEAN, FALSE) THEN
                qualificacoes_array := array_append(qualificacoes_array, 'starting');
            END IF;
            
            IF COALESCE((estudante_record->>'following')::BOOLEAN, FALSE) THEN
                qualificacoes_array := array_append(qualificacoes_array, 'following');
            END IF;
            
            IF COALESCE((estudante_record->>'making')::BOOLEAN, FALSE) THEN
                qualificacoes_array := array_append(qualificacoes_array, 'making');
            END IF;
            
            IF COALESCE((estudante_record->>'explaining')::BOOLEAN, FALSE) THEN
                qualificacoes_array := array_append(qualificacoes_array, 'explaining');
            END IF;
            
            IF COALESCE((estudante_record->>'talk')::BOOLEAN, FALSE) THEN
                qualificacoes_array := array_append(qualificacoes_array, 'talk');
            END IF;

            -- Create or update estudante record
            INSERT INTO public.estudantes (
                id,
                profile_id,
                genero,
                qualificacoes,
                ativo,
                user_id
            ) VALUES (
                COALESCE((estudante_record->>'id')::UUID, gen_random_uuid()),
                profile_id,
                estudante_record->>'genero',
                qualificacoes_array,
                COALESCE((estudante_record->>'ativo')::BOOLEAN, TRUE),
                (estudante_record->>'id')::UUID
            )
            ON CONFLICT (id) DO UPDATE SET
                profile_id = EXCLUDED.profile_id,
                genero = EXCLUDED.genero,
                qualificacoes = EXCLUDED.qualificacoes,
                ativo = EXCLUDED.ativo,
                user_id = EXCLUDED.user_id,
                updated_at = NOW();

            processed := processed + 1;
            
        EXCEPTION WHEN OTHERS THEN
            current_error := jsonb_build_object(
                'student_name', estudante_record->>'nome',
                'error', SQLERRM,
                'error_code', SQLSTATE
            );
            errors := errors || current_error;
        END;
    END LOOP;

    -- Return results
    RETURN QUERY SELECT 
        (jsonb_array_length(errors) = 0) as success,
        CASE 
            WHEN jsonb_array_length(errors) = 0 THEN 'Successfully processed ' || processed || ' students'
            ELSE 'Processed ' || processed || ' students with ' || jsonb_array_length(errors) || ' errors'
        END as message,
        processed as processed_count,
        errors as error_details;
        
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION public.process_estudantes_batch(JSONB) IS 'Batch import function for processing student data from spreadsheets. Accepts JSON array of student records and creates/updates profiles and student records accordingly.';