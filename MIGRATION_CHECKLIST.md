# 🚀 Migration Checklist - Ministry Hub Sync

## 📋 Passo-a-Passo para Aplicar Migração

### 1. **Aplicar Migração no Supabase**
```bash
# Opção 1: Via SQL Editor do Supabase
# - Abra: https://supabase.com/dashboard/project/[seu-projeto]/sql
# - Cole o conteúdo de: supabase/migrations/20250115_init_complete.sql
# - Execute

# Opção 2: Via CLI (se configurado)
supabase db push
```

### 2. **Verificar Migração**
```bash
# Execute as queries em: supabase/verification_queries.sql
# Uma por vez no SQL Editor do Supabase
```

### 3. **Checklist de Verificação**
- [ ] ✅ Enums criados (`app_role`, `tipo_designacao`, `genero_requerido`)
- [ ] ✅ Tabelas criadas (7 tabelas principais)
- [ ] ✅ RLS habilitado em todas as tabelas
- [ ] ✅ Policies aplicadas (admin, instrutor, estudante)
- [ ] ✅ Triggers funcionando (`updated_at`, `handle_new_user`)
- [ ] ✅ Função `get_user_role` criada

### 4. **Resolver Erros de Build Local**

#### Backend
```bash
# Terminal 1
npm run dev:backend-only
# Verificar: http://localhost:3000/api/status
```

#### Frontend  
```bash
# Terminal 2
npm run dev:frontend-only
# Verificar: http://localhost:8080
```

#### Correções Comuns
```bash
# Lint e verificação
npm run lint
npm run typecheck

# Se houver erros de imports dinâmicos
# Editar vite.config.ts e adicionar:
# build: { chunkSizeWarningLimit: 1000 }
```

### 5. **Testar Funcionalidades**
- [ ] ✅ Login admin: `amazonwebber007@gmail.com / admin123`
- [ ] ✅ Acesso ao Admin Dashboard: `/admin`
- [ ] ✅ Upload de PDF funciona
- [ ] ✅ Geração de programas funciona
- [ ] ✅ Designações podem ser criadas

### 6. **Dados de Teste (Opcional)**
```sql
-- Inserir congregação teste
INSERT INTO public.congregacoes (nome, cidade) 
VALUES ('Congregação Central', 'São Paulo');

-- Inserir programa teste
INSERT INTO public.programas_ministeriais (arquivo_nome, arquivo_url, mes_ano, status)
VALUES ('mwb_202509_T.pdf', '/storage/programas/test.pdf', '202509', 'processado');
```

## 🚨 Troubleshooting

### Erro: "relation does not exist"
- Verificar se migração foi aplicada completamente
- Executar queries de verificação

### Erro: "permission denied for table"
- Verificar RLS policies
- Confirmar role do usuário no profiles

### Erro: "type does not exist"  
- Verificar se enums foram criados
- Re-executar parte dos enums da migração

### Erros de Build/Vite
```bash
# Limpar cache
rm -rf node_modules/.vite
npm run dev:frontend-only
```

## 📞 Próximos Passos

Após migração bem-sucedida:
1. Testar fluxo completo admin → instrutor → estudante
2. Validar upload e processamento de PDFs
3. Confirmar geração de designações
4. Deploy para produção

## 🎯 Comandos Rápidos

```bash
# Iniciar tudo
npm run dev:all

# Verificar backend
curl http://localhost:3000/api/status

# Verificar frontend  
curl http://localhost:8080

# Logs do sistema
npm run logs
```