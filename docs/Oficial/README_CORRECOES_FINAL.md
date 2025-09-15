# Correções na Planilha de Estudantes

## Problema Identificado

A planilha `estudantes_ficticios_corrigido.xlsx` estava causando erros durante a importação de estudantes, com todas as linhas apresentando os seguintes erros:

1. "Gênero deve ser M ou F"
2. "Família/Agrupamento é obrigatório"
3. "Status deve ser Ativo ou Inativo"

## Causa do Problema

O problema estava relacionado aos cabeçalhos das colunas que não correspondiam exatamente ao que o sistema esperava. A planilha original tinha cabeçalhos como "Gênero", "Status", etc., mas o sistema de validação esperava os cabeçalhos exatos definidos na interface [SpreadsheetRow](file:///C:/Users/webbe/OneDrive/Documents/GitHub/ministry-hub-sync/src/types/spreadsheet.ts#L5-L15):

- "ID Estudante"
- "Nome Completo"
- "Idade"
- "Gênero (M/F)"  ← Importante: precisa incluir "(M/F)"
- "Data de Nascimento"
- "Parente Responsável"
- "Parentesco"
- "Família / Agrupamento"
- "Data de Batismo"
- "Cargo Congregacional"
- "Telefone"
- "E-mail"
- "Observações"
- "Status (Ativo/Inativo)"  ← Importante: precisa incluir "(Ativo/Inativo)"

## Solução Implementada

1. **Correção dos Cabeçalhos**: Os cabeçalhos foram atualizados para corresponder exatamente aos esperados, incluindo os textos entre parênteses que são parte integrante dos nomes das colunas.

2. **Validação dos Dados**: Os dados foram formatados para passar nas validações:
   - Idade como número (não string)
   - Gênero como "M" ou "F"
   - Status como "Ativo" ou "Inativo"
   - Cargo congregacional com valores válidos: "Ancião", "Servo Ministerial", "Pioneiro Regular", "Publicador Batizado", "Publicador Não Batizado", "Estudante Novo"

## Arquivos Gerados

1. `estudantes_ficticios_corrigido_ok.xlsx` - Planilha corrigida com 10 estudantes fictícios que deve importar sem erros

## Como Usar

1. Use `estudantes_ficticios_corrigido_ok.xlsx` para importar estudantes
2. O sistema deve mostrar 10 registros válidos e 0 com erros
3. Clique em "Importar 10 Estudantes" para concluir a importação

## Mapeamentos Válidos

### Gênero
- M → masculino
- F → feminino

### Cargo Congregacional
- Ancião
- Servo Ministerial
- Pioneiro Regular
- Publicador Batizado
- Publicador Não Batizado
- Estudante Novo

### Status
- Ativo
- Inativo