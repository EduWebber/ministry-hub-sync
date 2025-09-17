# Índice do Desenvolvedor — Sistema Ministerial

Este índice centraliza os principais guias e instruções para colocar o sistema em funcionamento de ponta a ponta, desde o setup de ambiente até a geração de designações e relatórios.

Documentação online: https://github.com/EduWebber/ministry-hub-sync/tree/main/docs

---

## 1) Fluxo Sequencial Recomendado

- Fluxo completo do sistema (passo a passo entre as páginas)
  - ./FLUXO_SEQUENCIAL_SISTEMA.md
- Fluxo e diagrama do sistema
  - ./SYSTEM_FLOW.md
  - ./SYSTEM_FLOW_DIAGRAM.md

---

## 2) Setup do Ambiente e Configuração

- Guia de setup do ambiente
  - ./ENVIRONMENT_SETUP_GUIDE.md
  - ./ENVIRONMENT_CONFIGURATION_COMPLETE.md
- Configuração do Supabase (projeto, chaves, URL)
  - ../SETUP_SUPABASE.md
  - ./SUPABASE_URL_CONFIGURATION.md
  - ./SUPABASE_CLIENT_TIMEOUT_FIX.md (timeouts do cliente)
  - ./SUPABASE_AUTHENTICATION_FIXES_SUMMARY.md (ajustes de auth)
- URLs e ambiente de produção
  - ./PRODUCTION_URL_UPDATE.md
- Portas e cache (Windows)
  - ../SOLUCAO_RAPIDA_PORTAS.md
  - ./PORTAS_CORRIGIDAS.md
  - ../CLEAR_CACHE.md

Checklist mínimo (dev rápido)
- Backend em http://localhost:3001
  - ../backend/.env com `PORT=3001` e `CORS_ORIGIN=http://localhost:8080`
  - Comando: `cd backend && npm install && npm run dev`
- Frontend em http://localhost:8080
  - .env com `VITE_API_BASE_URL=http://localhost:3001` e `VITE_MOCK_MODE=true`
  - Comando: `npm install && npm run dev:frontend`
- Programas JSON locais
  - `docs/Oficial/programacoes-json/AAAA-MM.json` (ex.: `2026-01.json`)

---

## 3) Backend e API

- Visão geral e endpoints
  - ../backend/README.md
  - ../backend/API_MINISTERIAL.md
  - ./PROGRAMACOES_API.md
- Programações (serviços e rotas)
  - ../backend/README_PROGRAMACOES.md
  - ../backend/routes/programacoes.js
  - ../backend/services/pdfParser.js (parser de PDF)
- Designações (serviços e rotas)
  - ../backend/routes/designacoes.js
  - ../backend/services/assignmentEngine.js
  - ../backend/services/notificationService.js
- Esquema (SQL)
  - ../backend/sql/programacoes_schema.sql

---

## 4) Frontend (React/Vite)

- Leituras recomendadas do projeto
  - ../README.md
  - ../README_REFORMULADO.md
  - ../README_EXTENDIDO.md
- Páginas principais do fluxo
  - src/pages/BemVindo.tsx → /bem-vindo
  - src/pages/Dashboard.tsx → /dashboard
  - src/pages/EstudantesPage.tsx → /estudantes
  - src/pages/ProgramasPage.tsx → /programas
  - src/pages/DesignacoesPage.tsx → /designacoes
  - src/pages/RelatoriosPage.tsx → /relatorios

---

## 5) Estudantes e Importação

- Guia de estudantes
  - ./README_ESTUDANTES.md
- Importação por planilha (CSV/XLSX)
  - ../STUDENT_IMPORT_README.md
  - ./EXCEL_IMPORT_GUIDE.md
  - ./Oficial/FORMATO_PLANILHA.md
- Hooks e componentes úteis
  - src/hooks/useEstudantes.ts
  - src/components/students/StudentsGridAG.tsx
  - src/components/SpreadsheetUpload.tsx

---

## 6) Programas (PDF/JSON)

- Setup e documentação
  - ./PROGRAMAS_SETUP.md
  - ./PROGRAMDISPLAY_DOCUMENTACAO.md
  - ./ENHANCED_PDF_PARSING.md
- Dados oficiais/locais
  - ./Oficial/programacoes-json/ (JSONs por mês)
  - ./Oficial/programs/ (conteúdo de referência)
- UI relacionada
  - src/components/ProgramasReais.tsx
  - src/pages/ProgramasPage.tsx

---

## 7) Designações (S-38 — Geração, Fluxo e Regras)

- Documentos de referência
  - ./SISTEMA_DESIGNACOES_MINISTERIAIS.md
  - ./SISTEMA_DESIGNACOES_S38T.md
  - ./ASSIGNMENT_GENERATION_SYSTEM.md
  - ./ASSIGNMENT_WORKFLOW_GUIDE.md
  - ./IMPLEMENTACAO_REGRA_S38_OFICIAL.md
  - ./CRITICAL_ASSIGNMENT_FIXES_SUMMARY.md
- Back-end
  - ../backend/routes/designacoes.js (geração/listagem/persistência)
  - ../backend/services/assignmentEngine.js
- Front-end
  - src/pages/DesignacoesPage.tsx (fluxo sequencial de geração/salvar)
  - src/hooks/useDesignacoes.ts
  - src/components/DesignacoesReais.tsx

---

## 8) Relatórios

- Página de relatórios
  - src/pages/RelatoriosPage.tsx
- Rotas de relatório no backend
  - ../backend/routes/reports.js

---

## 9) Autenticação e Supabase

- Troubleshooting e correções
  - ./AUTH_TROUBLESHOOTING.md
  - ./AUTH_TIMEOUT_FIXES_COMPREHENSIVE.md
  - ./PROFILE_FETCH_FIX.md
  - ./HEADER_AUTHENTICATION_FIX.md
  - ./STUDENT_LOGIN_DEBUG_GUIDE.md
  - ./STUDENT_LOGOUT_IMPLEMENTATION.md
- Integração Supabase (frontend)
  - src/integrations/supabase/client.ts
  - src/lib/supabase.ts / src/lib/supabaseAdmin.ts

---

## 10) Banco de Dados e Migrações

- Aplicação e guia de migrações
  - ./SCHEMA_FIX_APPLICATION_GUIDE.md
  - ./APPLY_DATABASE_MIGRATION_NOW.md
- Scripts e fixes
  - ../fix-database-schema.sql
  - ../fix-database-schema-comprehensive.sql
  - ../fix-database-schema-complete.sql
  - ../URGENT_RLS_FIX.sql
  - ../FIX_RLS_POLICIES.sql
- Diagnósticos auxiliares
  - ../diagnose-database-schema.sql
  - ../diagnose-profiles-schema.sql

---

## 11) Testes e Qualidade

- Cypress
  - ./GUIA_TESTES_CYPRESS.md
  - ./CYPRESS_TESTING_SETUP.md
  - cypress.config.mjs / cypress/
- Verificação do sistema
  - ./VERIFICATION_SYSTEM_GUIDE.md
  - ./VERIFICATION_SYSTEM_IMPLEMENTATION_COMPLETE.md

---

## 12) CI/CD e Deploy

- CI/CD com Cypress
  - ./CYPRESS_CICD_IMPLEMENTATION_SUMMARY.md
  - ./CYPRESS_CLOUD_CICD_SETUP.md
  - ./CYPRESS_CLOUD_SETUP.md
- Integração e repositório
  - ./CI_CD_COMPLETION_GUIDE.md
  - ./GITHUB_ACTIONS_SETUP.md
  - ./GITHUB_REPOSITORY_SETUP.md

---

## 13) Performance, Responsividade e Offline

- Performance e responsividade
  - ./PERFORMANCE_OPTIMIZATIONS_IMPLEMENTED.md
  - ./TABLET_RESPONSIVENESS_FIXES.md
  - ./ZOOM_RESPONSIVENESS_TESTING_GUIDE.md
  - ./ZOOM_RESPONSIVENESS_TESTING_IMPLEMENTATION_SUMMARY.md
- Offline/PWA
  - ../OFFLINE_FUNCTIONALITY.md
  - ../OFFLINE_IMPLEMENTATION_SUMMARY.md

---

## 14) Depuração e Troubleshooting

- Problemas comuns e correções
  - ./NODEMON_TROUBLESHOOTING.md
  - ./PAGE_REFRESH_FIX.md
  - ./PAGE_REFRESH_LOADING_FIX.md
  - ./SOLUCAO_WEBSOCKET.md
  - ./PRODUCTION_DEPLOYMENT_FIX.md
  - ./QUICK_DEPLOYMENT_FIX.md
- Auditoria de rotas e UX
  - ./ROUTE_AUDIT_AND_UX_REVISION.md
  - ./ROUTE_AUDIT_IMPLEMENTATION_COMPLETE.md
- Diversos
  - ./CONSOLE_LOG_FIXES.md
  - ./SECURITY_FIX_REPORT.md

---

## 15) Referências Rápidas

- Portas padrão (dev)
  - Frontend: 8080
  - Backend: 3001
- Variáveis de ambiente principais (frontend)
  - `VITE_API_BASE_URL=http://localhost:3001`
  - `VITE_MOCK_MODE=true` (modo desenvolvimento/offline)
- Scripts úteis
  - `npm run dev:backend` / `npm run dev:frontend`
  - `npm run dev:all` (se disponível) / `start-system.bat` (varia por ambiente)
  - `scripts/kill-ports.bat` e variações para liberar portas

---

## 16) Dicas de Uso

- Siga o fluxo sequencial do sistema: Estudantes → Programas → Designações → Relatórios.
- Em desenvolvimento, ative `VITE_MOCK_MODE=true` para evitar dependências do banco e validar a UI/fluxo.
- Garanta dados de programas na pasta `docs/Oficial/programacoes-json/` para testes do backend de Programações.
- Ao migrar para produção, aplique as migrações SQL, revise RLS e desative o modo mock.

---

Caso alguma referência do índice não exista no seu branch local, consulte a versão online da pasta docs do repositório principal:
- https://github.com/EduWebber/ministry-hub-sync/tree/main/docs
