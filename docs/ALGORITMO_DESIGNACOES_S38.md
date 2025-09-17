# Algoritmo de Designações (S-38) — Página /designacoes

Este documento descreve o algoritmo que deve ser aplicado na página http://localhost:8080/designacoes para gerar designações em conformidade com o documento S-38 (Vida e Ministério Cristão). O foco é transformar as diretrizes em regras operacionais para seleção de estudantes (principal e assistente), garantindo justiça (fairness), rotação e aderência às restrições.

Índice
- Objetivo e Escopo
- Entradas de Dados e Pré-requisitos
- Mapeamento de Partes → Tipos Internos
- Regras por Tipo de Parte (S-38)
- Seleção do Estudante Principal (Pipeline)
- Seleção do Assistente (quando aplicável)
- Rotação, Fairness e Empates
- Fallbacks e Degradação Controlada
- Saída/Contrato da API
- Integração com a UI (/designacoes)
- Extensões Futuras (produção)

---

## 1) Objetivo e Escopo

- Atribuir automaticamente estudantes a cada item do programa semanal (programação) respeitando:
  - Regras de gênero e papel (anciãos, servos ministeriais, estudantes).
  - Qualificações específicas por tipo de parte.
  - Necessidade e restrições de assistente (mesmo gênero ou familiar).
  - Justiça (evitar repetição excessiva, distribuir oportunidades).
- O algoritmo deve funcionar em ambiente real (banco) e em desenvolvimento (mock), mantendo a mesma lógica de filtro e escolha.

---

## 2) Entradas de Dados e Pré‑requisitos

- Programação semanal (itens/partes):
  - Campos mínimos por item: `id`, `section`, `type`, `minutes`, `lang.title`, `rules` (opcional, ver seção 9).
- Estudantes ativos da congregação:
  - Campos mínimos: `id`, `nome`, `genero` ("masculino" | "feminino"), `ativo` (boolean), `congregacao_id`.
  - Qualificações (booleans): `reading`, `starting`, `following`, `making` (disciples), `explaining`, `talk`, `treasures`, `gems` (quando aplicável) — ver mapeamento abaixo.
  - Privilégios: `privileges: string[]` (ex.: `['elder']`, `['ministerial_servant']`).
  - (Opcional para fairness) Histórico: `last_assigned_at`, contadores por categoria.

Observação: No modo mock, parte desses dados é inferido/gerado com valores padrão.

---

## 3) Mapeamento de Partes → Tipos Internos

Para uniformizar a lógica, convertemos as partes do programa (PDF/JSON) em tipos internos. Exemplos:

- Tesouros da Palavra de Deus (TREASURES)
  - Discurso: `type = 'talk'`
  - Joias espirituais: `type = 'spiritual_gems'` (ou `treasures/gems`)
  - Leitura da Bíblia: `type = 'bible_reading'`

- Ministério de Campo (APPLY)
  - Iniciando conversas: `type = 'starting'`
  - Cultivando o interesse: `type = 'following'`
  - Fazendo discípulos: `type = 'making_disciples'`
  - Explicando suas crenças: `type = 'explaining'` (pode ser `talk` ou `demonstration`)
  - Discurso (quando aplicável): `type = 'talk'`

- Vivendo como Cristãos (LIVING)
  - Discurso/Aplicação: `type = 'talk'`
  - Estudo bíblico de congregação: `type = 'congregation_study'`

Se a fonte vier com `titulo` e `tipo` em português, normalizamos para os tipos internos acima.

---

## 4) Regras por Tipo de Parte (S-38)

Resumo operacional (fundamentado no S-38):

- 3. Discurso (Tesouros — 10 min) → `type: 'talk'`
  - Requer: Ancião (elder) ou Servo Ministerial qualificado.
  - Gênero: masculino (natural ao cargo).

- 4. Joias Espirituais (10 min) → `type: 'spiritual_gems'`
  - Condução: Ancião ou Servo Ministerial qualificado.
  - Gênero: masculino.

- 5. Leitura da Bíblia (4 min) → `type: 'bible_reading'`
  - Estudante: masculino.
  - Qualificação: `reading = true` (e habilidade condizente com a duração/trecho).

- 7. Iniciando Conversas → `type: 'starting'` (demonstração)
  - Principal: masculino ou feminino.
  - Assistente: obrigatório. Mesmo gênero OU familiar.

- 8. Cultivando o Interesse → `type: 'following'` (demonstração)
  - Principal: masculino ou feminino.
  - Assistente: obrigatório. Mesmo gênero.

- 9. Fazendo Discípulos → `type: 'making_disciples'` (demonstração)
  - Principal: masculino ou feminino.
  - Assistente: obrigatório. Mesmo gênero.

- 10. Explicando Suas Crenças → `type: 'explaining'`
  - Se “talk”: principal masculino.
  - Se “demonstration”: principal masculino ou feminino.
  - Assistente: mesmo gênero OU familiar (quando demonstração exigir assistente).

- 11. Discurso (estudante) → `type: 'talk'`
  - Estudante: masculino (discurso à congregação).

- Estudo bíblico de congregação → `type: 'congregation_study'`
  - Condução: ancião (preferencial) ou servo ministerial qualificado.
  - Gênero: masculino.

Observações do S-38 (parágrafos 12–14):
- Conteúdo e ambiente (casa em casa, informal, público) são guias pedagógicos. Não alteram a seleção de pessoas, mas podem orientar o rótulo/nota da parte.
- Vídeos/literatura: podem ser citados/apresentados; não impactam o algoritmo de escolha.

---

## 5) Seleção do Estudante Principal (Pipeline)

Para cada `programacao_item`:

1) Conjunto base:
   - Estudantes `ativo = true` e `congregacao_id =` da seleção.

2) Filtro por gênero e papel:
   - `bible_reading`, `talk` (estudante, item 11): masculino.
   - `talk` (Tesouros/Estudo cong.): ancião/servo ministerial (masculino) — verificar `privileges`.
   - Demais tipos: conforme regras acima.

3) Filtro por qualificações:
   - `bible_reading` → `reading = true`.
   - `starting` → `starting = true` (ou aptidão geral de ministério quando faltarem flags específicas).
   - `following` → `following = true`.
   - `making_disciples` → `making = true`.
   - `explaining` → `explaining = true` (ou `talk = true` se for talk, ver item 10).
   - `spiritual_gems`/`treasures` → `gems = true`/`treasures = true` (ou `talk = true` quando modelado assim).
   - `talk` (Tesouros/Vivendo) → `talk = true` e privilégios quando aplicável.

4) Ranking (fairness):
   - Menor número de designações na categoria nos últimos N dias/semanas.
   - Maior intervalo desde a última designação na mesma categoria (cooldown).
   - Menor carga total no período.
   - Desempate: random/round‑robin estável.

5) Selecionar o primeiro do ranking como `principal_estudante`.

---

## 6) Seleção do Assistente (quando aplicável)

Aplica-se a `starting`, `following`, `making_disciples` e `explaining` (quando demonstração):

1) Filtrar candidatos a assistente a partir do conjunto base, excluindo o principal.

2) Restrições:
   - Mesmo gênero do principal (regra padrão).
   - Ou familiar (quando a regra permitir: `starting` e `explaining`), independente do gênero.

3) Ranking (fairness):
   - Menos assistências recentes do mesmo tipo.
   - Maior intervalo desde última assistência.
   - Desempate: random/round‑robin.

4) Se não houver candidato, aplicar fallback (ver seção 8) — podendo retornar sem assistente, conforme política local.

---

## 7) Rotação, Fairness e Empates

- Cooldown por categoria (valores sugeridos):
  - `bible_reading`: 4 semanas
  - `starting`/`following`/`making_disciples`/`explaining`: 2–4 semanas
  - `talk` (estudante): 6 semanas
  - `spiritual_gems`/`treasures`: 6 semanas
  - `congregation_study`/`talk` (Tesouros): rotação entre anciãos/servos

- Balanceamento geral:
  - Distribuir oportunidades entre os aptos de cada categoria.
  - Evitar par fixo de principal+assistente repetindo em semanas consecutivas.

- Desempate:
  - Ordenação determinística pelo “score de fairness” + `id` para estabilidade, com ruído/seed opcional.

---

## 8) Fallbacks e Degradação Controlada

Quando nenhuma pessoa passa pelos filtros estritos:

1) Relaxar cooldowns (permitir quem designou mais recentemente).
2) Considerar aptidão genérica de ministério (quando faltar flag específica mas o estudante é ativo e possui histórico).
3) Para assistente, se não houver mesmo gênero, considerar familiar (quando a regra permitir).
4) Último recurso: permitir designação “pendente” (status `PENDING`), marcando necessidade de ajuste manual.

Todos os relaxamentos devem ser registrados no `observacoes` do item.

---

## 9) Saída/Contrato da API

Cada designação gerada retorna ao frontend um objeto mínimo:

```json
{
  "programacao_item_id": "...",
  "principal_estudante_id": "... | null",
  "assistente_estudante_id": "... | null",
  "status": "OK | PENDING",
  "observacoes": "(opcional: motivo do fallback ou regra aplicada)"
}
```

Notas:
- A UI enriquece com título e tempo buscando `programacao_itens`.
- No modo desenvolvimento (mock), a API pode retornar sem persistir, apenas para visualização.

---

## 10) Integração com a UI (/designacoes)

- Ao clicar “Gerar Designações Automáticas”, o frontend envia `POST /api/designacoes/generate` com `{ programacao_id, congregacao_id }`.
- O backend aplica o algoritmo acima e retorna a lista gerada.
- A UI exibe a tabela, permitindo revisar e, em ambiente real, salvar (`POST /api/designacoes`).

Campos esperados no estudante (frontend/backend):
- `genero`: "masculino" | "feminino"
- `privileges`: `['elder']`, `['ministerial_servant']`, etc.
- `qualificacoes`: `{ reading, starting, following, making, explaining, talk, treasures, gems }`
- flags auxiliares (opcional): disponibilidade, histórico, vínculos familiares.

---

## 11) Extensões Futuras (produção)

- Persistir histórico por categoria para fairness preciso (ex.: tabela `designacoes_historico`).
- Restrições configuráveis por congregação (ex.: cooldowns, preferências locais, obrigatoriedade de assistente).
- Agenda de notificações (email/WhatsApp) condicionadas a `status` e prazos.
- Parser automático de PDFs MWB → `programacao_itens` com `rules` explícitas por item:
  ```json
  {
    "gender": "male | female | any",
    "role_required": "elder | ministerial_servant | none",
    "assistant_required": true,
    "assistant_same_gender": true,
    "assistant_family_ok": true,
    "category": "bible_reading | starting | following | making_disciples | explaining | talk | spiritual_gems | congregation_study"
  }
  ```

---

## Observação sobre o material de referência

- O conteúdo detalhado fornecido (S-38, orientações de conteúdo/ambiente e PDFs oficiais) guia o tipo de parte e a condução pedagógica.
- O algoritmo implementa as restrições de elegibilidade (gênero, papel, qualificação) e de composição (assistente) — a parte pedagógica (conteúdo, uso de vídeos) é transmitida como metadados/notas, não afeta a seleção de pessoas.

---

Com isso, a página /designacoes consegue gerar atribuições consistentes com o S-38, equilibrando obediência às regras e distribuição justa entre os estudantes aptos, tanto em ambiente real quanto em desenvolvimento (mock).