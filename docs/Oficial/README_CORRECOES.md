# Correções na Planilha de Estudantes

## Problema Identificado

A planilha `estudantes_ficticios_corrigido.xlsx` estava causando erros durante a importação de estudantes, com todas as linhas apresentando os seguintes erros:

1. "Nome completo é obrigatório e deve ter pelo menos 2 caracteres"
2. "Idade deve ser um número entre 1 e 120"
3. "Gênero deve ser M ou F"
4. "Família/Agrupamento é obrigatório"
5. "Cargo congregacional inválido: undefined"
6. "Status deve ser Ativo ou Inativo"

## Causa do Problema

O problema estava relacionado aos cabeçalhos das colunas que não correspondiam exatamente ao que o sistema esperava. A planilha original não tinha os cabeçalhos corretos conforme definido na interface [SpreadsheetRow](file:///C:/Users/webbe/OneDrive/Documents/GitHub/ministry-hub-sync/src/types/spreadsheet.ts#L5-L15).

## Solução Implementada

1. **Correção dos Cabeçalhos**: Os cabeçalhos foram atualizados para corresponder exatamente aos esperados:
   - "ID Estudante"
   - "Nome Completo"
   - "Idade"
   - "Gênero (M/F)"
   - "Data de Nascimento"
   - "Parente Responsável"
   - "Parentesco"
   - "Família / Agrupamento"
   - "Data de Batismo"
   - "Cargo Congregacional"
   - "Telefone"
   - "E-mail"
   - "Observações"
   - "Status (Ativo/Inativo)"

2. **Validação dos Dados**: Os dados foram formatados para passar nas validações:
   - Idade como número (não string)
   - Gênero como "M" ou "F"
   - Status como "Ativo" ou "Inativo"
   - Cargo congregacional com valores válidos: "Ancião", "Servo Ministerial", "Pioneiro Regular", "Publicador Batizado", "Publicador Não Batizado", "Estudante Novo"

## Arquivos Gerados

1. `template_correto.xlsx` - Template com cabeçalhos corretos e exemplos
2. `estudantes_ficticios_corrigido.xlsx` - Planilha corrigida com 10 estudantes fictícios

## Como Usar

1. Use `template_correto.xlsx` como base para criar novas planilhas
2. Preencha os dados seguindo o formato demonstrado
3. Faça upload através da interface de importação de estudantes

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