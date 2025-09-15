// Quick test script for backend endpoints
// Run: node backend/test-endpoints.js

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testEndpoints() {
  console.log('🧪 Testing Backend Endpoints...\n');

  // 1. Status
  try {
    const response = await fetch(`${BASE_URL}/api/status`);
    const data = await response.text();
    console.log('✅ /api/status:', data);
  } catch (error) {
    console.log('❌ /api/status:', error.message);
  }

  // 2. Mock programacao
  try {
    const response = await fetch(`${BASE_URL}/api/programacoes/mock?semana=2025-01-13`);
    const data = await response.json();
    console.log('✅ /api/programacoes/mock:', data.week_start, '-', data.week_end);
    console.log('   Items:', data.items?.length || 0);
  } catch (error) {
    console.log('❌ /api/programacoes/mock:', error.message);
  }

  // 3. Test generate (will fail without data, but shows if endpoint exists)
  try {
    const response = await fetch(`${BASE_URL}/api/designacoes/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        programacao_id: 'test-id',
        congregacao_id: 'test-congregacao'
      })
    });
    const data = await response.json();
    console.log('✅ /api/designacoes/generate endpoint exists');
    console.log('   Response:', response.status, data.message || data.error);
  } catch (error) {
    console.log('❌ /api/designacoes/generate:', error.message);
  }

  console.log('\n🎯 Next Steps:');
  console.log('1. Ensure backend is running: npm run dev:backend-only');
  console.log('2. Check Supabase connection');
  console.log('3. Apply migration if needed');
}

testEndpoints();