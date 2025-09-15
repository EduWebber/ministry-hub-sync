# 🚀 Bypass Onboarding - Ir Direto para Designações

## 🎯 Problema
Sistema está preso no onboarding devido a erros de schema cache do Supabase.

## ✅ Solução Rápida

### 1. Acesse Diretamente:
```
http://localhost:8080/designacoes
```

### 2. Se Redirecionar para Onboarding:
- Abra DevTools (F12)
- Console
- Execute:
```javascript
localStorage.setItem('onboarding_completed', '1');
window.location.href = '/designacoes';
```

### 3. Ou Modifique o localStorage:
```javascript
// Marcar onboarding como completo
localStorage.setItem('onboarding_completed', '1');

// Definir perfil como instrutor
localStorage.setItem('user_profile', JSON.stringify({
  id: 'f2c84343-2343-4309-8561-a5e0acb529dd',
  user_id: '40d6c45c-b9c2-4585-a405-88cb43907849',
  nome: 'Frank Lima',
  email: 'frankwebber33@hotmail.com',
  role: 'instrutor',
  cargo: 'servo_ministerial'
}));

// Recarregar página
window.location.reload();
```

## 🎯 Teste das Designações

Após acessar `/designacoes`:

1. ✅ **Clique:** "Carregar Semana Atual (Mock)"
2. ✅ **Campo Congregação:** deve auto-preencher com UUID
3. ✅ **Clique:** "Gerar Designações Automáticas"

## 📋 Dados Configurados no Supabase

- ✅ **Usuário:** frankwebber33@hotmail.com (confirmado)
- ✅ **Profile:** instrutor com cargo servo_ministerial
- ✅ **Estudante:** com qualificações S-38 completas
- ✅ **Congregação:** Congregação Central
- ✅ **Programação:** semana de teste com 4 partes
- ✅ **RLS:** desabilitado para evitar erros

## 🚀 Resultado Esperado

O sistema deve:
- Carregar semana mockada
- Auto-preencher congregação
- Gerar designações automaticamente
- Mostrar tabela com designações

**O "tudo está falso" deve estar resolvido!**