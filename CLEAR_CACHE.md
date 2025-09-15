# 🧹 Limpar Cache - Supabase

## 🎯 Problema
Sistema ainda conectando ao projeto Supabase antigo (nwpuurgwnnuejqinkvrh) em vez do novo (dlvojolvdsqrfczjjjuw).

## ✅ Correções Aplicadas
1. ✅ Atualizado `.env` com credenciais corretas
2. ✅ Corrigido `src/lib/supabase.ts` para usar variáveis de ambiente
3. ✅ Corrigido `backend/config/supabase.js`

## 🚀 Próximos Passos

### 1. Limpar Cache do Navegador
```
Ctrl + Shift + R (Hard Reload)
ou
F12 → Network → Disable cache
```

### 2. Limpar localStorage
```javascript
// No console do navegador:
localStorage.clear();
sessionStorage.clear();
```

### 3. Reiniciar Sistema
```bash
# Parar tudo (Ctrl+C)
npm run dev:all
```

### 4. Verificar Conexão
- Frontend: http://localhost:8080
- Backend: http://localhost:3000/api/status
- Supabase: https://dlvojolvdsqrfczjjjuw.supabase.co

## 🔍 Verificar se Funcionou
1. Abrir DevTools → Network
2. Fazer login
3. Verificar se requests vão para `dlvojolvdsqrfczjjjuw.supabase.co`
4. Não deve mais aparecer `nwpuurgwnnuejqinkvrh.supabase.co`

## 📋 Credenciais Corretas
```
URL: https://dlvojolvdsqrfczjjjuw.supabase.co
KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdm9qb2x2ZHNxcmZjempqanV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1ODcwNjUsImV4cCI6MjA3MzE2MzA2NX0.J5CE7TrRJj8C0gWjbokSkMSRW1S-q8AwKUV5Z7xuODQ
```