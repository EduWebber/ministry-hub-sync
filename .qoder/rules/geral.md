---
trigger: always_on
alwaysApply: true
---
# 🛠️ Rules and User Guidelines - Sistema Ministerial

## Rules

As seguintes regras devem ser aplicadas globalmente para todo o desenvolvimento do **Sistema Ministerial**:

1. **Organização do Código**

   * Mantenha uma arquitetura limpa seguindo a estrutura de pastas definida no repositório.
   * Separe frontend, backend, automações e documentação claramente.
2. **Boas Práticas de Programação**

   * Evite duplicação de código e telas; utilize componentes reutilizáveis.
   * Siga os princípios SOLID e DRY.
   * Evite funções muito longas; priorize legibilidade e manutenção.
3. **UI/UX Consistente**

   * Utilize componentes de interface padronizados para todas as páginas e formulários.
   * Evite criar múltiplas telas para a mesma funcionalidade.
   * Mantenha o layout responsivo e testado em dispositivos móveis e desktop.
4. **Segurança e Privacidade**

   * Não exponha informações sensíveis no frontend.
   * Utilize variáveis de ambiente para chaves e URLs privadas.
   * Aplique políticas de Row Level Security (RLS) no Supabase.
5. **Fluxo de Trabalho com Git**

   * Crie branches para cada funcionalidade.
   * Faça commits claros e objetivos.
   * Sempre revise o código antes do merge.

## User Guidelines

As diretrizes abaixo definem como o time de desenvolvimento e o Augment devem operar:

1. **Não repetir funcionalidades**: Antes de criar uma nova feature, verifique se já existe no sistema.
2. **Documentar sempre**: Toda função, endpoint ou módulo precisa de comentários claros e documentação em `README` ou no arquivo correspondente.
3. **Reutilizar Componentes**: Utilize componentes React reutilizáveis para formulários, botões, tabelas e modais.
4. **Tratamento de Erros**: Todas as chamadas de API devem ter tratamento de erro e feedback amigável ao usuário.
5. **Padronização Visual**: Use TailwindCSS e mantenha cores, botões e fontes consistentes.
6. **Performance e Otimização**: Evite loops desnecessários e carregamento de dados redundantes.
7. **Testes Locais Antes do Deploy**: Verifique que tudo funciona localmente antes de subir para produção.

---

Essas regras e diretrizes garantem que o sistema seja **manutenível, seguro e consistente**, com uma **experiência de usuário fluida** e código limpo para futuras atualizações.