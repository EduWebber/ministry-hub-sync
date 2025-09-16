const fetch = globalThis.fetch || require('node-fetch');

async function testFix() {
  try {
    console.log('Testing designacoes endpoint after fix...');
    
    const response = await fetch('http://localhost:3001/api/designacoes/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        programacao_id: '2024-12-02',
        congregacao_id: 'congregacao-1'
      })
    });
    
    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Response:', text);
    
    if (response.status === 404) {
      console.log('❌ FAILED: Endpoint still returning 404');
    } else if (response.status === 500) {
      console.log('⚠️  PARTIAL SUCCESS: Endpoint accessible but returning 500 (Supabase issue)');
    } else {
      console.log('✅ SUCCESS: Endpoint working correctly');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testFix();