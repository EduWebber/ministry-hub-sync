# 🚀 Setup Supabase - Projeto dlvojolvdsqrfczjjjuw

## 1. Aplicar Migração

1. **Abra:** https://supabase.com/dashboard/project/dlvojolvdsqrfczjjjuw/sql
2. **Cole e execute:** `supabase/migrations/20250115_init_complete.sql`

## 2. Criar Usuário de Teste

### Via SQL Editor:
```sql
-- Inserir usuário na tabela auth.users (se necessário)
-- Ou usar o método abaixo via Authentication

-- Criar profile para o usuário
INSERT INTO public.profiles (user_id, nome, email, role, created_at)
VALUES (
  'user-uuid-aqui', -- Será preenchido após criar usuário
  'Frank Lima',
  'frankwebber33@hotmail.com',
  'instrutor',
  now()
);
```

### Via Dashboard (RECOMENDADO):
1. **Vá em:** https://supabase.com/dashboard/project/dlvojolvdsqrfczjjjuw/auth/users
2. **Clique:** "Add user"
3. **Preencha:**
   - Email: `frankwebber33@hotmail.com`
   - Password: `senha123`
   - Email Confirm: ✅ (marcar)
4. **Clique:** "Create user"

## 3. Testar Login

1. **Acesse:** http://localhost:8080/auth
2. **Login:**
   - Email: `frankwebber33@hotmail.com`
   - Senha: `senha123`

## 4. Se der erro de profile:

Execute no SQL Editor:
```sql
-- Buscar o user_id criado
SELECT id, email FROM auth.users WHERE email = 'frankwebber33@hotmail.com';

-- Inserir profile (substitua USER_ID_AQUI pelo ID retornado acima)
INSERT INTO public.profiles (user_id, nome, email, role, created_at)
VALUES (
  'USER_ID_AQUI',
  'Frank Lima', 
  'frankwebber33@hotmail.com',
  'instrutor',
  now()
);
```

## 5. Verificar se funcionou:
- Login deve funcionar
- Deve redirecionar para dashboard
- Não deve mais aparecer erro de credenciais