# Funcionalidade Offline

## Visão Geral

O sistema de designações inclui uma funcionalidade offline completa que permite aos usuários acessar e visualizar dados mesmo quando não há conexão com a internet. Esta funcionalidade é baseada em Service Workers e IndexedDB para armazenamento local.

## Componentes Principais

### 1. Service Worker (sw.js)
- Gerencia o cache de recursos estáticos e dados da API
- Implementa estratégias de cache para diferentes tipos de requisições
- Fornece fallback offline para navegação e recursos

### 2. IndexedDB (offlineLocalDB.ts)
- Armazena dados estruturados localmente para acesso offline
- Estruturas armazenadas:
  - Estudantes
  - Programas
  - Designações
  - Outbox (para sincronização futura)
  - Cursores (para sincronização incremental)

### 3. Hooks Personalizados
- `useOffline()`: Gerencia o estado offline e funcionalidades de sincronização
- `useOfflineData()`: Carrega dados com fallback para modo offline

### 4. Componentes
- `OfflineDesignacoes`: Interface para visualizar designações no modo offline

## Como Funciona

### Download de Dados Offline
1. O usuário clica em "Baixar Dados para Offline"
2. Os dados são buscados do servidor Supabase
3. Os dados são armazenados no IndexedDB local
4. Um timestamp de última sincronização é registrado

### Acesso Offline
1. Quando o usuário está offline, o Service Worker intercepta as requisições
2. Os dados são servidos a partir do cache IndexedDB
3. O usuário pode visualizar estudantes, programas e designações normalmente

### Sincronização
1. Quando o usuário reconecta à internet, os dados são sincronizados automaticamente
2. Alterações pendentes são enviadas ao servidor
3. Dados atualizados são baixados e o cache é atualizado

## Estratégias de Cache

### Recursos Estáticos
- Estratégia: Cache First
- Duração: Longa (até nova versão do app)

### Dados da API
- Estratégia: Cache Aside (Lazy Loading)
- Duração: Curta (5-15 minutos dependendo do tipo de dado)
- Atualização: Automática quando online

### Navegação
- Estratégia: Network First com fallback para cache
- Página offline personalizada quando necessário

## Testando a Funcionalidade Offline

### Modo de Desenvolvimento
1. Acesse `http://localhost:8080/offline-test` (apenas em desenvolvimento)
2. Clique em "Baixar Dados para Offline"
3. Desative o Wi-Fi ou use as ferramentas de desenvolvedor do navegador para simular offline
4. Navegue pelas designações e verifique que os dados ainda estão disponíveis

### Modo de Produção
1. A funcionalidade offline está automaticamente disponível em produção
2. O Service Worker é registrado automaticamente
3. Os dados são baixados conforme necessário

## Limitações Conhecidas

1. A funcionalidade offline é somente para leitura
2. Alterações feitas offline precisam ser sincronizadas quando online
3. O tamanho do cache é limitado pelo espaço disponível no dispositivo

## Melhorias Futuras

1. Implementação completa de sincronização bidirecional
2. Suporte para edição offline com fila de sincronização
3. Notificações push para atualizações importantes
4. Expansão do cache para incluir mais tipos de dados