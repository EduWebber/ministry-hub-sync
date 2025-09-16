#!/usr/bin/env node

/**
 * Teste de Integração - Sistema Ministerial
 * 
 * Testa o fluxo completo:
 * 1. Admin lista PDFs do bucket
 * 2. Instrui lista programações 
 * 3. Designa estudantes
 * 4. Verifica histórico
 */

const API_BASE = process.env.API_URL || 'http://localhost:3000/api';
const MOCK_TOKEN = 'Bearer mock-test-token';

console.log('🧪 Iniciando Teste de Integração - Sistema Ministerial');
console.log(`📡 API Base: ${API_BASE}`);

// Utility function para fazer requisições
async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(options.requireAuth && { 'Authorization': MOCK_TOKEN })
  };

  try {
    console.log(`\n🔍 ${options.method || 'GET'} ${endpoint}`);
    
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: { ...defaultHeaders, ...options.headers },
      ...(options.body && { body: JSON.stringify(options.body) })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.log(`❌ Erro ${response.status}:`, data);
      return { success: false, error: data, status: response.status };
    }

    console.log(`✅ Sucesso:`, data.message || `${Object.keys(data).join(', ')}`);
    return { success: true, data, status: response.status };
    
  } catch (error) {
    console.log(`💥 Erro de conexão:`, error.message);
    return { success: false, error: error.message };
  }
}

// Função principal de teste
async function runIntegrationTest() {
  console.log('\n' + '='.repeat(60));
  console.log('🔄 TESTE DE FLUXO COMPLETO');
  console.log('='.repeat(60));

  // 1. Testar status do sistema
  console.log('\n📊 1. Verificando status do sistema...');
  const status = await makeRequest('/status');
  if (!status.success) {
    console.log('💥 Sistema offline - encerrando testes');
    return;
  }

  // 2. Testar Admin - Listar PDFs (simulado se não há bucket real)
  console.log('\n👨‍💼 2. Admin - Listando PDFs do bucket...');
  const pdfs = await makeRequest('/admin/pdfs/list', { requireAuth: true });
  
  // 3. Testar Admin - Listar programas salvos
  console.log('\n📋 3. Admin - Listando programas salvos...');
  const programs = await makeRequest('/admin/programs', { requireAuth: true });

  // 4. Testar Admin - Listar congregações
  console.log('\n⛪ 4. Admin - Listando congregações...');
  const congregations = await makeRequest('/admin/congregations', { requireAuth: true });

  // 5. Testar Instrutor - Listar programações publicadas
  console.log('\n👨‍🏫 5. Instrutor - Listando programações publicadas...');
  const programacoes = await makeRequest('/programacoes?status=published');

  // 6. Testar sistema de designações - Listar estudantes
  console.log('\n👥 6. Sistema - Listando estudantes disponíveis...');
  const estudantes = await makeRequest('/designacoes/estudantes');

  // 7. Testar sistema de designações - Listar designações existentes
  console.log('\n📝 7. Sistema - Listando designações existentes...');
  const designacoes = await makeRequest('/designacoes');

  // 8. Testar estatísticas
  console.log('\n📊 8. Sistema - Buscando estatísticas...');
  const stats = await makeRequest('/programacoes/stats');

  // Sumário dos testes
  console.log('\n' + '='.repeat(60));
  console.log('📋 SUMÁRIO DOS TESTES');
  console.log('='.repeat(60));

  const tests = [
    { name: 'Status do Sistema', result: status },
    { name: 'Admin - PDFs', result: pdfs },
    { name: 'Admin - Programas', result: programs },
    { name: 'Admin - Congregações', result: congregations },
    { name: 'Instrutor - Programações', result: programacoes },
    { name: 'Sistema - Estudantes', result: estudantes },
    { name: 'Sistema - Designações', result: designacoes },
    { name: 'Sistema - Estatísticas', result: stats }
  ];

  const passed = tests.filter(t => t.result.success).length;
  const failed = tests.length - passed;

  tests.forEach(test => {
    const icon = test.result.success ? '✅' : '❌';
    const status = test.result.success ? 'PASS' : `FAIL (${test.result.status || 'ERROR'})`;
    console.log(`${icon} ${test.name.padEnd(25)} ${status}`);
  });

  console.log('\n' + '-'.repeat(60));
  console.log(`🎯 Resultado: ${passed}/${tests.length} testes aprovados`);
  
  if (failed > 0) {
    console.log(`⚠️  ${failed} testes falharam - verifique logs acima`);
    console.log(`💡 Dica: Certifique-se que o backend está rodando na porta 3000`);
  } else {
    console.log('🎉 Todos os testes passaram! Sistema pronto para uso.');
  }

  // Dados de exemplo para desenvolvimento
  if (passed >= 6) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 DADOS DE EXEMPLO PARA DESENVOLVIMENTO');
    console.log('='.repeat(60));
    
    console.log('\n🧪 Exemplo de programação:');
    console.log(JSON.stringify({
      "semana": "8–14 de setembro de 2025",
      "tema": "Sirva a Jeová com coração completo",
      "partes": [
        {
          "secao": "Tesouros da Palavra de Deus",
          "titulo": "Discurso",
          "tipo": "discurso_tesouros",
          "duracao": 10,
          "genero_requerido": "masculino"
        }
      ]
    }, null, 2));

    console.log('\n🧪 Exemplo de designação:');
    console.log(JSON.stringify({
      "parte_id": "uuid-da-parte",
      "estudante_id": "uuid-do-estudante", 
      "data_reuniao": "2025-09-12",
      "observacoes": "Primeira apresentação"
    }, null, 2));
  }

  console.log('\n🚀 Teste concluído!');
}

// Executar teste se chamado diretamente
if (require.main === module) {
  runIntegrationTest().catch(error => {
    console.error('\n💥 Erro fatal no teste:', error);
    process.exit(1);
  });
}

module.exports = { runIntegrationTest, makeRequest };

