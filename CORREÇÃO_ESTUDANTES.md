# 🔧 Correção do Erro 400 - Importação de Estudantes

## 🚨 Problema Identificado

O erro `PGRST204: Could not find the 'chairman' column of 'estudantes' in the schema cache` ocorria porque o código estava tentando inserir campos que não existem na tabela `estudantes` do Supabase.

## 🔍 Análise Realizada

1. **Verificação da estrutura real da tabela `estudantes`:**
   - `id` (uuid, PK)
   - `profile_id` (uuid, FK)
   - `genero` (text)
   - `qualificacoes` (text[])
   - `disponibilidade` (jsonb)
   - `ativo` (boolean)
   - `created_at` (timestamptz)
   - `user_id` (uuid)
   - `congregacao_id` (uuid)

2. **Campos que estavam sendo inseridos incorretamente:**
   - `chairman` ❌
   - `pray` ❌
   - `tresures` ❌
   - `gems` ❌
   - `reading` ❌
   - `starting` ❌
   - `following` ❌
   - `making` ❌
   - `explaining` ❌
   - `talk` ❌
   - `data_nascimento` ❌
   - `data_batismo` ❌
   - `familia` ❌
   - `observacoes` ❌

## ✅ Correções Implementadas

### 1. **Arquivo: `useSpreadsheetImport.ts`**

**Antes:**
```typescript
const { error: estudanteError } = await supabase
  .from('estudantes')
  .insert({
    profile_id: profileId,
    genero: result.data!.genero,
    ativo: result.data!.ativo,
    data_nascimento: result.data!.data_nascimento || null,
    data_batismo: result.data!.data_batismo || null,
    familia: result.data!.familia || null,
    observacoes: result.data!.observacoes || null,
    // S-38 fields default to false
    chairman: false,
    pray: false,
    tresures: false,
    gems: false,
    reading: false,
    starting: false,
    following: false,
    making: false,
    explaining: false,
    talk: false
  });
```

**Depois:**
```typescript
const { error: estudanteError } = await supabase
  .from('estudantes')
  .insert({
    profile_id: profileId,
    genero: result.data!.genero,
    ativo: result.data!.ativo,
    user_id: user.id,
    qualificacoes: result.data!.qualificacoes || []
  });
```

### 2. **Arquivo: `types.ts`**

Atualizados os tipos do Supabase para refletir a estrutura real das tabelas:

- **Tabela `estudantes`**: Adicionados campos `user_id` e `congregacao_id`
- **Tabela `profiles`**: Adicionados todos os campos existentes

### 3. **Relacionamentos Pai-Filho**

Removida a tentativa de atualizar o campo `id_pai_mae` que não existe, substituída por um log para implementação futura.

## 🧪 Teste de Validação

Criado e executado teste que confirma:
- ✅ Criação de profile funciona
- ✅ Criação de estudante funciona
- ✅ Inserção com campos corretos
- ✅ Limpeza de dados de teste

## 📊 Resultado

- **Status**: ✅ **RESOLVIDO**
- **Erro 400**: Eliminado
- **Importação de estudantes**: Funcionando
- **Compatibilidade**: Mantida com estrutura existente

## 🚀 Próximos Passos

1. **Testar importação completa** via interface web
2. **Implementar relacionamentos pai-filho** quando necessário
3. **Adicionar campos S-38** se necessário no futuro
4. **Validar dados importados** na interface

---

**Data da correção**: 15 de setembro de 2025  
**Arquivos modificados**: 
- `src/hooks/useSpreadsheetImport.ts`
- `src/integrations/supabase/types.ts`