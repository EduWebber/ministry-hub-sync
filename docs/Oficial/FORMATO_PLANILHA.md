# 📊 Formato da Planilha de Estudantes

## ✅ Arquivo Corrigido
- **Arquivo:** `estudantes_ficticios_corrigido_status.xlsx`
- **Registros:** 100 estudantes válidos
- **Status:** ✅ Sem erros, apenas avisos menores

## 📋 Colunas Obrigatórias

| Coluna | Tipo | Exemplo | Observações |
|--------|------|---------|-------------|
| `nome` | Texto | "João Silva Santos" | Nome completo (min. 2 caracteres) |
| `familia` | Texto | "Silva" | Sobrenome/Agrupamento familiar |
| `idade` | Número | 25 | Entre 1 e 120 anos |
| `genero` | Texto | "masculino" ou "feminino" | Valores aceitos |
| `cargo` | Texto | "Publicador Batizado" | Ver lista abaixo |
| `ativo` | Texto | "Ativo" ou "Inativo" | Status do estudante |

## 📋 Colunas Opcionais

| Coluna | Tipo | Exemplo | Observações |
|--------|------|---------|-------------|
| `email` | Texto | "joao@email.com" | Formato válido de email |
| `telefone` | Texto | "(11) 99999-9999" | Formato brasileiro |
| `data_batismo` | Texto | "20/06/2020" | Formato DD/MM/AAAA |
| `data_nascimento` | Texto | "15/03/1999" | Formato DD/MM/AAAA |
| `observacoes` | Texto | "Disponível para designações" | Texto livre |

## 🎯 Privilégios de Serviço (VERDADEIRO/FALSO)

| Coluna | Descrição |
|--------|-----------|
| `chairman` | Presidente de reunião |
| `pray` | Oração |
| `tresures` | Tesouros da Palavra |
| `gems` | Joias Espirituais |
| `reading` | Leitura da Bíblia |
| `starting` | Primeira Conversa |
| `following` | Revisita |
| `making` | Estudo Bíblico |
| `explaining` | Explicando as Escrituras |
| `talk` | Discurso (apenas homens) |

## 📝 Valores Aceitos

### Gênero
- `masculino` ou `feminino`
- `M` ou `F` (será convertido)

### Cargo Congregacional
- `Ancião`
- `Servo Ministerial`
- `Pioneiro Regular`
- `Publicador Batizado`
- `Publicador Não Batizado`
- `Estudante Novo`

### Status
- `Ativo` ou `Inativo`
- `VERDADEIRO`/`FALSO` (será convertido)

### Privilégios
- `VERDADEIRO` ou `FALSO`
- `true`/`false` (será convertido)
- `1`/`0` (será convertido)

## ⚠️ Avisos Comuns (Não Impedem Importação)

1. **"Data de batismo inválida - será ignorada"**
   - Formato incorreto da data
   - Campo será deixado vazio

2. **"Menor de idade sem responsável definido"**
   - Estudante com menos de 18 anos
   - Campos `parente_responsavel` e `parentesco` vazios

## ✅ Arquivo Atual - Status

- **100 registros válidos** ✅
- **0 erros** ✅
- **100 avisos** ⚠️ (apenas datas de batismo)
- **Taxa de sucesso:** 100% ✅

## 🔧 Como Usar

1. Use o arquivo `estudantes_ficticios_corrigido_status.xlsx` como modelo
2. Substitua os dados pelos seus estudantes reais
3. Mantenha o formato das colunas
4. Importe no sistema sem erros

## 📊 Exemplo de Registro Válido

```
nome: "João Silva Santos"
familia: "Silva"
idade: 25
genero: "masculino"
email: "joao.silva@email.com"
telefone: "(11) 99999-9999"
data_batismo: "20/06/2020"
cargo: "Publicador Batizado"
ativo: "Ativo"
data_nascimento: "15/03/1999"
chairman: "FALSO"
pray: "VERDADEIRO"
talk: "VERDADEIRO"
```

---

**✨ Sistema pronto para importação sem erros!**