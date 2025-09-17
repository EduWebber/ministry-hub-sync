-- Primeiro, limpar dados mock existentes para recriá-los corretamente
DELETE FROM public.estudantes WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';
DELETE FROM public.profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

-- Inserir congregação de exemplo com UUID válido
INSERT INTO public.congregacoes (id, nome, cidade) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Congregação Central', 'São Paulo') 
ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome, cidade = EXCLUDED.cidade;

-- Inserir perfis de estudantes mock com UUIDs válidos
INSERT INTO public.profiles (id, user_id, nome, email, role, cargo, congregacao_id) VALUES 
  ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'João Silva', 'joao@exemplo.com', 'estudante', 'pioneiro_regular', '550e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'Maria Santos', 'maria@exemplo.com', 'estudante', 'publicador', '550e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'Pedro Costa', 'pedro@exemplo.com', 'estudante', 'servo_ministerial', '550e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 'Ana Oliveira', 'ana@exemplo.com', 'estudante', 'pioneiro_auxiliar', '550e8400-e29b-41d4-a716-446655440001');

-- Inserir estudantes mock com qualificações S-38
INSERT INTO public.estudantes (id, profile_id, genero, qualificacoes, ativo, user_id, congregacao_id) VALUES 
  ('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440010', 'masculino', ARRAY['reading', 'starting', 'following', 'making', 'explaining', 'talk'], true, '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440011', 'feminino', ARRAY['starting', 'following', 'making', 'explaining'], true, '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440012', 'masculino', ARRAY['chairman', 'pray', 'treasures', 'gems', 'reading', 'starting', 'following', 'making', 'explaining', 'talk'], true, '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440013', 'feminino', ARRAY['starting', 'following', 'making', 'explaining'], true, '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001');