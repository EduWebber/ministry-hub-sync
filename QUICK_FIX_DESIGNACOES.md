# 🚀 Quick Fix - Designações "Tudo Falso"

## 🎯 Problema Identificado
- Header: "Semana: —" (sem semana carregada)
- Campo "Congregação (UUID)" vazio
- Geração não funciona

## ✅ Solução Imediata (SEM CÓDIGO)

### 1. **Carregar Semana**
```
/designacoes → Botão "Carregar Semana Atual (mock)"
OU
Aba "Importar" → Upload PDF
```

### 2. **Preencher Congregação**
```
1. Ir em /estudantes
2. Copiar qualquer congregacao_id de um estudante
3. Voltar /designacoes
4. Colar no campo "Congregação (UUID)"
```

### 3. **Verificar Estudantes S-38**
```
/estudantes → Verificar se há estudantes com:
- ativo: true
- cargo: anciao/servo/publicador
- flags S-38 preenchidas
- congregacao_id igual ao usado
```

### 4. **Gerar Designações**
```
/designacoes → "Gerar Designações Automáticas"
Network → POST /api/designacoes/generate deve retornar 200
```

## 🔧 Comandos de Verificação

```bash
# Backend online?
curl http://localhost:3000/api/status

# Semana mock disponível?
curl "http://localhost:3000/api/programacoes/mock?semana=2025-01-13"

# Estudantes existem?
# (verificar no Supabase ou via /estudantes)
```

## 🚨 Se Ainda Não Funcionar

### Erro: "Nenhum elegível..."
- Ajustar flags S-38 dos estudantes
- Verificar congregacao_id consistente
- Adicionar mais estudantes com cargos variados

### Erro: Network 500
- Verificar logs do backend
- Confirmar tabelas no Supabase
- Aplicar migração se necessário

### Erro: Semana não carrega
- Verificar endpoint /api/programacoes/mock
- Importar PDF manualmente
- Usar dados mockados do docs/Oficial

## 📋 Checklist Rápido

- [ ] Backend rodando (porta 3000)
- [ ] Semana carregada (header mostra datas)
- [ ] Campo congregação preenchido
- [ ] Estudantes ativos existem
- [ ] Flags S-38 configuradas
- [ ] Botão "Gerar" clicado
- [ ] Network 200 OK
- [ ] Tabela preenchida