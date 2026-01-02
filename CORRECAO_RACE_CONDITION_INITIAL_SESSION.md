# 🔧 Correção: Race Condition com INITIAL_SESSION

## 🎯 Problema Identificado nos Logs

Analisando os logs do console, identifiquei uma **race condition** causada pelo evento `INITIAL_SESSION`:

```
🔄 Refreshing authentication...
✅ Valid session found for user: [id]
Loading profile for user: [id]
🔄 Auth state change: INITIAL_SESSION [id]  ← PROBLEMA AQUI
✅ Auth state change handler complete, setting loading to false  ← Seta loading=false ANTES do profile carregar
✅ Valid session found for user: [id]  ← refreshAuth continua
Loading profile for user: [id]  ← Carregamento duplicado
Profile loaded successfully  ← Profile carrega DEPOIS
```

### **Causa Raiz**

1. `refreshAuth()` é chamado e começa a carregar o profile
2. `onAuthStateChange` dispara com evento `INITIAL_SESSION` 
3. O handler processa `INITIAL_SESSION` e seta `loading = false` **ANTES** do profile carregar
4. Isso causa processamento duplicado e possíveis race conditions

---

## ✅ Correções Implementadas

### 1. **Estado para Rastrear Carregamento Inicial**

Adicionado `initialLoadComplete` para rastrear quando o carregamento inicial termina:

```typescript
const [initialLoadComplete, setInitialLoadComplete] = useState(false);
```

### 2. **Pular INITIAL_SESSION Durante Carregamento Inicial**

O `handleAuthStateChange` agora ignora `INITIAL_SESSION` durante o carregamento inicial:

```typescript
// Skip INITIAL_SESSION during initial load to prevent race condition with refreshAuth()
if (!initialLoadComplete && event === 'INITIAL_SESSION') {
  console.log('⏭️ Skipping INITIAL_SESSION event (already handled by refreshAuth)');
  return;
}
```

**Razão**: O `refreshAuth()` já processa a sessão inicial, então não precisamos processar `INITIAL_SESSION` novamente.

### 3. **Marcar Carregamento Inicial Como Completo**

O `refreshAuth()` marca `initialLoadComplete = true` quando completa:

```typescript
finally {
  console.log('✅ Refresh auth complete, setting loading to false');
  setInitialLoadComplete(true);  // ← Nova linha
  setLoading(false);
}
```

### 4. **Timeout de Segurança Melhorado**

O timeout de segurança agora:
- Aumentado para 15 segundos (era 10)
- Só é acionado se `loading` ainda estiver `true`
- Usa função de atualização de estado para evitar race conditions

```typescript
const safetyTimeout = setTimeout(() => {
  setLoading(currentLoading => {
    if (currentLoading) {
      console.warn('⚠️ AuthContext: Safety timeout triggered - forcing loading to false (stuck for >15s)');
      return false;
    }
    return currentLoading;
  });
}, 15000);
```

---

## 📊 Comportamento Esperado Após Correção

### **Logs Esperados (Corrigido)**:

```
🔄 Refreshing authentication...
✅ Valid session found for user: [id]
Loading profile for user: [id]
🔄 Auth state change: INITIAL_SESSION [id]
⏭️ Skipping INITIAL_SESSION event (already handled by refreshAuth)  ← NOVO
Profile loaded successfully
✅ Refresh auth complete, setting loading to false
🛡️ ProtectedRoute: Access granted, rendering children
```

**Benefícios**:
- ✅ Sem processamento duplicado
- ✅ Sem race conditions
- ✅ Carregamento mais rápido
- ✅ Logs mais limpos

---

## 🧪 Teste

Após aplicar as correções, verifique:

1. **Console não mostra processamento duplicado**
2. **Timeout de segurança não é acionado** (ou só em casos reais de problema)
3. **Logs mostram "Skipping INITIAL_SESSION"**
4. **Página renderiza normalmente**

---

## 📝 Arquivos Modificados

- ✅ `src/contexts/AuthContext.tsx`
  - Adicionado `initialLoadComplete` state
  - Lógica para pular `INITIAL_SESSION` durante carregamento inicial
  - Timeout de segurança melhorado

---

## 🔍 Referências

Esta correção segue o padrão documentado em:
- `docs/PAGE_REFRESH_FIX.md` - Documentação de race conditions similares
- `docs/PAGE_REFRESH_LOADING_FIX.md` - Documentação de problemas de loading

---

**Status**: ✅ Correção aplicada
**Data**: $(date)

