import axios from 'axios';

const API_BASE = 'http://localhost:3001';

async function testEndpoint(url, description) {
  try {
    const response = await axios.get(`${API_BASE}${url}`);
    console.log(`✅ ${description}: SUCCESS`);
    return response.data;
  } catch (error) {
    console.log(`❌ ${description}: FAILED - ${error.response?.data?.error || error.message}`);
    return null;
  }
}

async function testPostEndpoint(url, data, description) {
  try {
    const response = await axios.post(`${API_BASE}${url}`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(`✅ ${description}: SUCCESS`);
    return response.data;
  } catch (error) {
    console.log(`❌ ${description}: FAILED - ${error.response?.data?.error || error.message}`);
    return null;
  }
}

async function main() {
  console.log('🚀 Running comprehensive system test...\n');
  
  // Test basic endpoints
  await testEndpoint('/api/status', 'API Status');
  await testEndpoint('/api/congregacoes', 'Congregations List');
  
  // Get a congregation ID for further testing
  const congregacoesData = await testEndpoint('/api/congregacoes', 'Get Congregations for testing');
  const congregacaoId = congregacoesData?.success && congregacoesData.congregacoes.length > 0 
    ? congregacoesData.congregacoes[0].id 
    : null;
  
  if (congregacaoId) {
    console.log(`\n🔧 Using congregation ID: ${congregacaoId}\n`);
    
    // Test student endpoints
    await testEndpoint(`/api/estudantes?congregacao_id=${congregacaoId}`, 'Students List');
    
    // Test programacoes endpoints
    await testEndpoint('/api/programacoes/json-files', 'Programacoes JSON Files');
    
    // Test designacoes endpoint (this is expected to fail due to schema cache issue)
    await testPostEndpoint('/api/designacoes/generate', {
      programacao_id: '2025-09-08',
      congregacao_id: congregacaoId
    }, 'Designacoes Generation (may fail due to schema cache)');
  } else {
    console.log('❌ No congregations found for testing');
  }
  
  // Test auth endpoints
  await testPostEndpoint('/auth/login', {
    email: 'test@example.com',
    password: 'password'
  }, 'Auth Login (expected to fail with invalid credentials)');
  
  console.log('\n🏁 Comprehensive test completed');
}

main();