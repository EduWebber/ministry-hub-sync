# Formato Atualizado da Planilha de Estudantes

## Problema Identificado

A planilha estava causando erros durante a importação de estudantes, com várias linhas apresentando o seguinte erro:
- "Status deve ser VERDADEIRO ou FALSO"

## Causa do Problema

O sistema foi atualizado e agora utiliza um formato de planilha diferente com:
1. **Nomes de colunas diferentes**: Agora usa "nome", "familia", "idade", "genero", "cargo", "ativo", etc.
2. **Valores de status diferentes**: Agora espera "VERDADEIRO" ou "FALSO" em maiúsculas
3. **Formato de data diferente**: Agora espera datas no formato YYYY-MM-DD
4. **Mais colunas**: Inclui colunas para qualificações S-38-T

## Novo Formato da Planilha

### Colunas Obrigatórias:
- **nome**: Nome completo do estudante
- **familia**: Nome da família ou agrupamento
- **idade**: Idade em anos (número)
- **genero**: "masculino" ou "feminino"
- **cargo**: Valores válidos - "anciao", "servo_ministerial", "pioneiro_regular", "publicador_batizado", "publicador_nao_batizado", "estudante_novo"
- **ativo**: "VERDADEIRO" ou "FALSO" (maiúsculas)

### Colunas Opcionais:
- **email**: Endereço de e-mail
- **telefone**: Número de telefone
- **data_batismo**: Data no formato YYYY-MM-DD
- **observacoes**: Observações adicionais
- **data_nascimento**: Data no formato YYYY-MM-DD
- **chairman**: "VERDADEIRO" ou "FALSO" - Pode presidir reuniões
- **pray**: "VERDADEIRO" ou "FALSO" - Pode orar na reunião
- **tresures**: "VERDADEIRO" ou "FALSO" - Pode fazer a joia da parte 1
- **gems**: "VERDADEIRO" ou "FALSO" - Pode fazer a joia da parte 2
- **reading**: "VERDADEIRO" ou "FALSO" - Pode fazer leitura da parte 3
- **starting**: "VERDADEIRO" ou "FALSO" - Pode fazer conversa inicial
- **following**: "VERDADEIRO" ou "FALSO" - Pode fazer revisita
- **making**: "VERDADEIRO" ou "FALSO" - Pode fazer estudo bíblico
- **explaining**: "VERDADEIRO" ou "FALSO" - Pode explicar
- **talk**: "VERDADEIRO" ou "FALSO" - Pode dar discursos

## Arquivo Corrigido

`estudantes_formato_corrigido.xlsx` - Planilha com o formato atualizado que deve importar sem erros

## Valores Válidos

### Gênero
- masculino
- feminino

### Cargo Congregacional
- ancião
- servo_ministerial
- pioneiro_regular
- publicador_batizado
- publicador_nao_batizado
- estudante_novo

### Status e Qualificações
- VERDADEIRO
- FALSO

## Como Usar

1. Use `estudantes_formato_corrigido.xlsx` como exemplo
2. Preencha os dados seguindo o formato demonstrado
3. Mantenha os nomes das colunas exatamente como estão
4. Use "VERDADEIRO" ou "FALSO" para campos booleanos
5. Use datas no formato YYYY-MM-DD (ex: 2020-06-20)
6. Faça upload através da interface de importação de estudantes

## Resultado Esperado

Ao importar a planilha corrigida, o sistema deve mostrar:
- **10 Válidos** (ou o número correspondente de registros)
- **0 Com Erros**
- **100% Taxa de Sucesso**