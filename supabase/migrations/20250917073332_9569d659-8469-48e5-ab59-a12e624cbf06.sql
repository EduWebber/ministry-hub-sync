-- Inserir congregação de exemplo
INSERT INTO public.congregacoes (id, nome, cidade) VALUES
  ('congregation-central', 'Congregação Central', 'São Paulo') 
ON CONFLICT (id) DO NOTHING;

-- Inserir perfis de estudantes mock
INSERT INTO public.profiles (id, user_id, nome, email, role, cargo, congregacao_id) VALUES 
  ('profile-joao', '550e8400-e29b-41d4-a716-446655440000', 'João Silva', 'joao@exemplo.com', 'estudante', 'pioneiro_regular', 'congregation-central'),
  ('profile-maria', '550e8400-e29b-41d4-a716-446655440000', 'Maria Santos', 'maria@exemplo.com', 'estudante', 'publicador', 'congregation-central'),
  ('profile-pedro', '550e8400-e29b-41d4-a716-446655440000', 'Pedro Costa', 'pedro@exemplo.com', 'estudante', 'servo_ministerial', 'congregation-central'),
  ('profile-ana', '550e8400-e29b-41d4-a716-446655440000', 'Ana Oliveira', 'ana@exemplo.com', 'estudante', 'pioneiro_auxiliar', 'congregation-central')
ON CONFLICT (id) DO NOTHING;

-- Inserir estudantes mock com qualificações S-38
INSERT INTO public.estudantes (id, profile_id, genero, qualificacoes, ativo, user_id, congregacao_id) VALUES 
  ('student-joao', 'profile-joao', 'masculino', ARRAY['reading', 'starting', 'following', 'making', 'explaining', 'talk'], true, '550e8400-e29b-41d4-a716-446655440000', 'congregation-central'),
  ('student-maria', 'profile-maria', 'feminino', ARRAY['starting', 'following', 'making', 'explaining'], true, '550e8400-e29b-41d4-a716-446655440000', 'congregation-central'),
  ('student-pedro', 'profile-pedro', 'masculino', ARRAY['chairman', 'pray', 'treasures', 'gems', 'reading', 'starting', 'following', 'making', 'explaining', 'talk'], true, '550e8400-e29b-41d4-a716-446655440000', 'congregation-central'),
  ('student-ana', 'profile-ana', 'feminino', ARRAY['starting', 'following', 'making', 'explaining'], true, '550e8400-e29b-41d4-a716-446655440000', 'congregation-central')
ON CONFLICT (id) DO NOTHING;

-- Inserir programa ministerial de exemplo
INSERT INTO public.programas_ministeriais (id, mes_ano, arquivo_nome, arquivo_url, status, conteudo) VALUES 
  ('programa-jul-2025', 'Julho 2025', 'programa-jul-2025.pdf', '/materials/programa-jul-2025.pdf', 'processado', 
   '{"semanas": [{"id": "2025-07-07", "tema": "Semana 7-13 Julho 2025", "leitura": "Gênesis 1-3"}]}')
ON CONFLICT (id) DO NOTHING;