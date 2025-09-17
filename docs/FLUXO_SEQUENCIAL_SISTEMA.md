# Fluxo Sequencial do Sistema Ministerial

Este documento descreve como utilizar o sistema em sequência, da primeira configuração até a emissão de relatórios, navegando pelas seguintes páginas:

- http://localhost:8080/bem-vindo
- http://localhost:8080/dashboard
- http://localhost:8080/estudantes
- http://localhost:8080/programas
- http://localhost:8080/designacoes
- http://localhost:8080/relatorios

A proposta é garantir um fluxo contínuo: onboarding → organização de dados → geração → acompanhamento.

---

## 1) Pré‑requisitos e Ambiente

- Frontend (Vite) em http://localhost:8080
- Backend (Express) em http://localhost:3001
- Variáveis de ambiente (raiz/.env):
  - `VITE_API_BASE_URL=http://localhost:3001`
  - `VITE_MOCK_MODE=true` (modo de desenvolvimento: autenticação e dados simulados)
- Backend/.env:
  - `PORT=3001`
  - `CORS_ORIGIN=http://localhost:8080`
- Arquivos de programas JSON para testes (sem PDF):
  - `docs/Oficial/programacoes-json/AAAA-MM.json` (por ex.: `2026-01.json` com semanas de janeiro/2026)

Observações:
- Com `VITE_MOCK_MODE=true`, a navegação fica acessível ao “instrutor demo” e algumas operações usam dados simulados (mock) para evitar dependência do banco.
- O backend fornece endpoints REST em `/api/...` que a UI utiliza; se indisponíveis, a UI tenta usar mocks onde habilitado.

---

## 2) Bem‑vindo (Onboarding) — /bem-vindo

Objetivo: Introduzir o sistema, validar ambiente e conduzir o usuário ao setup inicial.

- Checagens comuns:
  - Exibição de status do ambiente (ex.: modo mock, variáveis carregadas, idioma, etc.).
  - Link para documentação e próximos passos.
- Ações esperadas:
  - Prosseguir para o Dashboard (
    http://localhost:8080/dashboard).
  - Em ambientes reais, poderia haver passos de configuração inicial (perfil de instrutor, congregação), mas no mock já vem pronto.

Resultado esperado:
- Usuário compreende o fluxo e segue ao painel principal.

---

## 3) Dashboard (Painel) — /dashboard

Objetivo: Visão geral e navegação rápida para os módulos principais.

- Conteúdo típico:
  - Status do sistema (online, mock/ou real).
  - Atalhos para Estudantes, Programas, Designações e Relatórios.
  - Indicadores básicos (ex.: quantidade de estudantes ativos, últimos programas carregados) — dependem do backend.
- Ações esperadas:
  - Ir para Estudantes para preparar a base de dados.

Resultado esperado:
- Decisão informada sobre o próximo passo: cadastrar/importar estudantes.

---

## 4) Estudantes — /estudantes

Objetivo: Montar e manter o cadastro de estudantes e qualificações (base para geração de designações).

- Funcionalidades principais:
  - Importação por planilha (quando habilitado) ou inserção manual.
  - Edição inline no grid.
  - Marcação de qualificações (ex.: leitura bíblica, iniciando conversas, etc.).
  - Associação de congregação (congregacao_id) — necessária para geração de designações.
  - Vínculos familiares (quando habilitado) e dados de contato (para notificações).
- Dicas:
  - Para designações corretas, mantenha gênero, qualificações e congregação definidos.
  - Em mode mock, a lista é simulada e já contém exemplos com diferentes qualificações.
- Ações esperadas:
  - Garantir que há estudantes ativos e qualificados com `congregacao_id` válido.
  - Navegar para Programas.

Resultado esperado:
- Base de estudantes consistente para alimentar a geração de designações.

---

## 5) Programas — /programas

Objetivo: Carregar/selecionar o programa semanal (partes da reunião) a ser utilizado na geração.

- Formas de obtenção:
  - Importação de PDF (quando habilitado) com parser.
  - Carregamento de JSON local via backend em `/api/programacoes/json-files`.
  - Fallback mock em modo desenvolvimento.
- Fluxo sugerido:
  1. Clique em "Carregar Programas" (ou equivalente) para listar semanas disponíveis.
  2. Selecione a semana desejada (ex.: 5–11 de janeiro de 2026).
  3. O sistema converterá a estrutura para o modelo interno e guardará a seleção (ex.: `localStorage` → `selectedProgram`).
- Ações esperadas:
  - Após selecionar a semana, optar por avançar a Designações.

Resultado esperado:
- Programa semanal selecionado e pronto para a etapa de designações.

---

## 6) Designações — /designacoes

Objetivo: Gerar, revisar, salvar e notificar designações da reunião (S-38).

- Carregamento inicial:
  - A página tenta carregar o programa selecionado previamente (por exemplo, através do `localStorage: selectedProgram`).
  - Se não houver programa, use "Carregar Programa" ou volte a `/programas`.
- Configuração:
  - Selecione/valide a `congregacao_id` a ser usada.
  - Confira a quantidade de estudantes ativos (mock ou reais).
- Geração:
  - Botão “Gerar Designações Automáticas” dispara `POST /api/designacoes/generate`.
  - Em ambiente sem o banco pronto, a API aplica fallback mock para estudantes e retorna designações sem persistir.
- Revisão e Salvar:
  - A UI lista as partes e os estudantes atribuídos.
  - "Salvar Designações" envia `POST /api/designacoes` (requer esquema de banco pronto).
- Notificações (quando habilitadas):
  - Envio simulado de e-mail/WhatsApp por serviço de notificação mock.
- Exportações:
  - Planejadas (ex.: S-89 PDF).

Resultado esperado:
- Designações geradas e revisadas. Em mock, a UI funciona de ponta a ponta sem dependência do banco. Em produção, as designações são persistidas e notificações são realizadas conforme configuração.

---

## 7) Relatórios — /relatorios

Objetivo: Acompanhar métricas, progresso e exportar dados.

- Conteúdo típico:
  - KPIs sobre geração automática, visualizações, tempo, doações, etc.
  - Exportação de PDF/Planilha (quando habilitado).
- Dependências:
  - Para números reais, requer dados persistidos no backend. Em mock, exibe métricas demonstrativas.

Resultado esperado:
- Visão consolidada da operação: geração, participação e eficiência.

---

## Resumo do Fluxo

1. **/bem-vindo** → introdução e validações rápidas do ambiente.
2. **/dashboard** → visão geral e atalhos.
3. **/estudantes** → cadastrar/importar estudantes e qualificações; garantir congregação.
4. **/programas** → importar PDF ou carregar JSON; selecionar semana e manter seleção.
5. **/designacoes** → gerar atribuições automaticamente; revisar; salvar; notificar; exportar.
6. **/relatorios** → métricas e exportações.

A UI inclui uma navegação orientada (botões de “continuar” nas principais telas) para seguir essa ordem com fluidez.

---

## Resolução de Problemas (FAQ rápido)

- "Geração retorna sucesso com 0 designações":
  - Verifique se há estudantes com `congregacao_id` válido e qualificações compatíveis.
  - Em mock, o backend já usa fallback se a consulta falhar ou se a lista vier vazia.
- "Erro 500 ao gerar":
  - Em desenvolvimento recente, a rota trata falhas de esquema/RLS e usa fallback mock. Reinicie o backend e tente novamente.
- "Programa não aparece":
  - Cheque `docs/Oficial/programacoes-json/` e se há arquivos `AAAA-MM.json` (ex.: `2026-01.json`).
- "Autenticação/Permissões":
  - Em `VITE_MOCK_MODE=true`, a aplicação simula um usuário instrutor e libera o fluxo sem login real.

---

## Endpoints Relevantes (Backend)

- Programas
  - `GET /api/programacoes/json-files` → lista de programas JSON disponíveis (docs/Oficial/programacoes-json)
  - `GET /api/programacoes/mock?semana=YYYY-MM-DD` → semana específica a partir do JSON mensal
- Designações
  - `POST /api/designacoes/generate` → geração automática (fallback mock quando necessário)
  - `GET /api/designacoes?programacao_id=...&congregacao_id=...` → listar designações salvas
  - `POST /api/designacoes` → salvar/atualizar designações
- Saúde
  - `GET /api/status` → status do backend

---

## Boas Práticas

- Mantenha as qualificações dos estudantes atualizadas; isso impacta diretamente a qualidade das atribuições.
- Utilize a funcionalidade de importar programas por PDF/JSON para evitar divergências de estrutura.
- Em produção, verifique as RLS/políticas do Supabase e o esquema das tabelas (programacoes, programacao_itens, estudantes, designacoes, designacao_itens).
- Registre decisões importantes (congregação utilizada, datas) para reprodutibilidade e auditoria.

---

## Conclusão

Seguindo o fluxo proposto, o sistema oferece uma experiência guiada e coerente: preparação de dados → seleção do programa → geração de designações → acompanhamento por relatórios. Em desenvolvimento (mock), todo o ciclo pode ser validado sem dependências externas; em produção, o backend persiste dados e realiza integrações adicionais conforme configurado.
